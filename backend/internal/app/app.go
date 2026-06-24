package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	rdb "github.com/locde0/sportudei-ukma/backend/db"
	"github.com/locde0/sportudei-ukma/backend/internal/auth"
	"github.com/locde0/sportudei-ukma/backend/internal/config"
	idb "github.com/locde0/sportudei-ukma/backend/internal/db"
	"github.com/locde0/sportudei-ukma/backend/internal/email"
	"github.com/locde0/sportudei-ukma/backend/internal/handler"
	"github.com/locde0/sportudei-ukma/backend/internal/middleware"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/fileutil"
	"github.com/locde0/sportudei-ukma/backend/internal/repository/postgres"
	"github.com/locde0/sportudei-ukma/backend/internal/router"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
	"github.com/locde0/sportudei-ukma/backend/internal/worker"
)

type Worker interface {
	Start(ctx context.Context)
	Name() string
}

type App struct {
	server  *http.Server
	pool    *pgxpool.Pool
	tx      *postgres.TxManager
	log     *slog.Logger
	workers []Worker
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

	storage := fileutil.NewLocalStorage(cfg.UploadDir)

	userRepo := postgres.NewUserRepo(txManager)
	eventRepo := postgres.NewEventRepo(txManager)

	authService := service.NewAuthService(userRepo, tokenProvider, passwordHasher, mailer)
	eventService := service.NewEventService(eventRepo, txManager, storage, logger)

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

	var workers []Worker

	photoCleanupWorker := worker.NewPhotoCleanupWorker(eventService, logger, 1*time.Hour)
	workers = append(workers, photoCleanupWorker)

	eventStatusWorker := worker.NewEventStatusWorker(eventService, logger, 5*time.Minute)
	workers = append(workers, eventStatusWorker)

	return &App{
		server:  srv,
		pool:    pool,
		tx:      txManager,
		log:     logger,
		workers: workers,
	}, nil
}

func (a *App) Run(ctx context.Context) error {
	workerCtx, cancelWorkers := context.WithCancel(context.Background())
	var wg sync.WaitGroup

	for _, w := range a.workers {
		wg.Add(1)
		go func(wrk Worker) {
			defer wg.Done()
			a.log.Info("starting background worker", slog.String("name", wrk.Name()))
			wrk.Start(workerCtx)
			a.log.Info("background worker stopped", slog.String("name", wrk.Name()))
		}(w)
	}

	serverErr := make(chan error, 1)
	go func() {
		a.log.Info("starting server", slog.String("addr", a.server.Addr))
		serverErr <- a.server.ListenAndServe()
	}()

	select {
	case err := <-serverErr:
		cancelWorkers()
		wg.Wait()
		return fmt.Errorf("server error: %w", err)

	case <-ctx.Done():
		a.log.Info("shutting down server", slog.String("addr", a.server.Addr))
		sdCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := a.server.Shutdown(sdCtx); err != nil {
			a.log.Error("shutdown server", slog.String("error", err.Error()))
		}

		cancelWorkers()
		wg.Wait()

		a.log.Info("server stopped gracefully")
		return nil
	}
}

func (a *App) Close() {
	a.pool.Close()
	a.log.Info("resources released")
}
