package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	rdb "github.com/locde0/sportudei-ukma/backend/db"
	"github.com/locde0/sportudei-ukma/backend/internal/auth"
	"github.com/locde0/sportudei-ukma/backend/internal/config"
	idb "github.com/locde0/sportudei-ukma/backend/internal/db"
	"github.com/locde0/sportudei-ukma/backend/internal/email"
	"github.com/locde0/sportudei-ukma/backend/internal/handler"
	"github.com/locde0/sportudei-ukma/backend/internal/middleware"
	"github.com/locde0/sportudei-ukma/backend/internal/repository/postgres"
	"github.com/locde0/sportudei-ukma/backend/internal/router"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type App struct {
	server *http.Server
	pool   *pgxpool.Pool
	tx     *postgres.TxManager
	log    *slog.Logger
}

func New(ctx context.Context, cfg *config.Config) (*App, error) {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	pool, err := idb.NewPool(ctx, cfg.DbURL)
	if err != nil {
		return nil, fmt.Errorf("database: %w", err)
	}

	if cfg.RunMigrations {
		if err := idb.RunMigrations(cfg.DbURL, logger, rdb.MigrationsFS); err != nil {
			pool.Close()
			return nil, fmt.Errorf("migrations: %w", err)
		}
	}

	if err := os.MkdirAll(cfg.UploadDir, 0755); err != nil {
		pool.Close()
		return nil, fmt.Errorf("create upload dir: %w", err)
	}

	txManager := postgres.NewTxManager(pool)

	tokenProvider := auth.NewJWTProvider(cfg.JWTSecret, cfg.JWTAccessExpDays, cfg.JWTRefreshExpDays)
	passwordHasher := auth.NewBcryptHasher()

	mailer, err := email.NewSMTPSender(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUser, cfg.SMTPPass, cfg.SMTPFrom)
	if err != nil {
		pool.Close()
		return nil, fmt.Errorf("mailer: %w", err)
	}

	userRepo := postgres.NewUserRepo(txManager)

	authService := service.NewAuthService(userRepo, tokenProvider, passwordHasher, mailer)

	authHandler := handler.NewAuthHandler(authService, cfg.JWTRefreshExpDays, cfg.IsProd())

	authMw := middleware.Auth(tokenProvider)

	mux := router.New(
		cfg.CORSOrigins,
		cfg.UploadDir,
		authMw,
		authHandler,
	)

	var httpHandler http.Handler = mux
	httpHandler = middleware.Logging(logger)(httpHandler)
	httpHandler = middleware.Recovery(logger)(httpHandler)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      httpHandler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	return &App{
		server: srv,
		pool:   pool,
		tx:     txManager,
		log:    logger,
	}, nil
}

func (a *App) Run(ctx context.Context) error {
	serverErr := make(chan error, 1)
	go func() {
		a.log.Info("starting server", slog.String("addr", a.server.Addr))
		serverErr <- a.server.ListenAndServe()
	}()

	select {
	case err := <-serverErr:
		return fmt.Errorf("server error: %w", err)

	case <-ctx.Done():
		a.log.Info("shutting down server", slog.String("addr", a.server.Addr))
		sdCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := a.server.Shutdown(sdCtx); err != nil {
			return fmt.Errorf("shutdown server: %w", err)
		}
		a.log.Info("server stopped gracefully")
		return nil
	}
}

func (a *App) Close() {
	a.pool.Close()
	a.log.Info("resources released")
}
