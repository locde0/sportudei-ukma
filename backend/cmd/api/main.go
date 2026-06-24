package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	_ "github.com/locde0/sportudei-ukma/backend/docs"
	"github.com/locde0/sportudei-ukma/backend/internal/app"
	"github.com/locde0/sportudei-ukma/backend/internal/config"
)

// @title           sportudei api
// @version         1.0
// @description     sportudei api server
// @BasePath        /
func main() {
	cfg := config.Load()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	application, err := app.New(ctx, cfg)
	if err != nil {
		slog.Error("failed to initialize app", "error", err)
		os.Exit(1)
	}
	defer application.Close()

	if err := application.Run(ctx); err != nil {
		slog.Error("app stopped with error", "error", err)
		os.Exit(1)
	}
}
