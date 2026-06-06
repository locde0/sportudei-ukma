package main

import (
	"log"

	"github.com/locde0/sportudei-ukma/backend/internal/app"
	"github.com/locde0/sportudei-ukma/backend/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	application, err := app.New(cfg)
	if err != nil {
		log.Fatalf("failed to initialize app: %v", err)
	}

	if err := application.Run(); err != nil {
		log.Fatalf("application stopped with error: %v", err)
	}
}
