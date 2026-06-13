package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	rootdb "github.com/locde0/sportudei-ukma/backend/db"
	"github.com/locde0/sportudei-ukma/backend/internal/config"
	internaldb "github.com/locde0/sportudei-ukma/backend/internal/db"
	"github.com/locde0/sportudei-ukma/backend/internal/email"
	"github.com/locde0/sportudei-ukma/backend/internal/handler"
	"github.com/locde0/sportudei-ukma/backend/internal/middleware"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type App struct {
	server *http.Server
	pool   *pgxpool.Pool
	log    *slog.Logger
	store  *internaldb.Store
}

func New(cfg *config.Config) (*App, error) {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	pool, err := internaldb.NewPool(context.Background(), cfg.DbURL)
	if err != nil {
		return nil, fmt.Errorf("db initialization failed: %w", err)
	}

	if cfg.RunMigrations {
		err := internaldb.RunMigrations(cfg.DbURL, logger, rootdb.MigrationsFS)
		if err != nil {
			return nil, fmt.Errorf("migration failed: %w", err)
		}
	}

	if err := os.MkdirAll("uploads", 0755); err != nil {
		return nil, fmt.Errorf("failed to create uploads directory: %w", err)
	}

	store := internaldb.NewStore(pool)
	router := handler.NewRouter(cfg.JWTSecret)

	mailer, err := email.NewSMTPMailer(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUsername, cfg.SMTPPassword)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize mailer: %w", err)
	}

	authMiddleware := middleware.Auth(cfg.JWTSecret)

	authService := service.NewAuthService(store, mailer, cfg.JWTSecret, cfg.JWTAccessExpDays, cfg.JWTRefreshExpDays)
	eventService := service.NewEventService(store)
	settingsService := service.NewSettingsService(store)
	contactService := service.NewContactService(store)
	partnerService := service.NewPartnerService(store)
	galleryService := service.NewGalleryService(store)
	gameService := service.NewGameService(store)

	authHandler := handler.NewAuthHandler(authService, cfg.JWTRefreshExpDays)
	eventHandler := handler.NewEventHandler(eventService)
	settingsHandler := handler.NewSettingsHandler(settingsService)
	contactHandler := handler.NewContactHandler(contactService)
	partnerHandler := handler.NewPartnerHandler(partnerService)
	galleryHandler := handler.NewGalleryHandler(galleryService)
	gameHandler := handler.NewGameHandler(gameService)

	authHandler.RegisterRoutes(router)
	eventHandler.RegisterRoutes(router, authMiddleware)
	settingsHandler.RegisterRoutes(router, authMiddleware)
	contactHandler.RegisterRoutes(router, authMiddleware)
	partnerHandler.RegisterRoutes(router, authMiddleware)
	galleryHandler.RegisterRoutes(router, authMiddleware)
	gameHandler.RegisterRoutes(router, authMiddleware)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	return &App{
		server: srv,
		pool:   pool,
		log:    logger,
		store:  store,
	}, nil
}

func (a *App) Run() error {
	serverErrors := make(chan error, 1)

	workerCtx, workerCancel := context.WithCancel(context.Background())
	defer workerCancel()

	go a.runBackgroundWorkers(workerCtx)

	go func() {
		a.log.Info("starting server", slog.String("addr", a.server.Addr))
		serverErrors <- a.server.ListenAndServe()
	}()

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		return fmt.Errorf("server error: %w", err)

	case sig := <-shutdown:
		a.log.Info("graceful shutdown started", slog.String("signal", sig.String()))

		workerCancel()

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		err := a.server.Shutdown(ctx)
		if err != nil {
			a.server.Close()
			return fmt.Errorf("could not stop server gracefully: %w", err)
		}

		a.pool.Close()
		a.log.Info("server stopped")
	}

	return nil
}

func (a *App) runBackgroundWorkers(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	err := a.store.AutoUpdateEventStatuses(ctx)
	if err != nil {
		a.log.Error("failed to initial auto-update event statuses", slog.String("error", err.Error()))
	}

	for {
		select {
		case <-ctx.Done():
			a.log.Info("stopping background workers")
			return
		case <-ticker.C:
			err := a.store.AutoUpdateEventStatuses(ctx)
			if err != nil {
				a.log.Error("failed to auto-update event statuses", slog.String("error", err.Error()))
			}
		}
	}
}
