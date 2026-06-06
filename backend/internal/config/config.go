package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Port              string
	DbURL             string
	JWTSecret         string
	JWTAccessExpDays  int
	JWTRefreshExpDays int
	RunMigrations     bool

	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:              envOr("PORT", "8080"),
		DbURL:             os.Getenv("DB_URL"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		JWTAccessExpDays:  envInt("JWT_ACCESS_EXP_DAYS", 1),
		JWTRefreshExpDays: envInt("JWT_REFRESH_EXP_DAYS", 3),
		RunMigrations:     envBool("RUN_MIGRATIONS", false),
		SMTPHost:          os.Getenv("SMTP_HOST"),
		SMTPPort:          os.Getenv("SMTP_PORT"),
		SMTPUsername:      os.Getenv("SMTP_USER"),
		SMTPPassword:      os.Getenv("SMTP_PASS"),
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *Config) validate() error {
	if c.DbURL == "" {
		return fmt.Errorf("DB_URL is required")
	}
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}
	if len(c.JWTSecret) < 32 {
		return fmt.Errorf("JWT_SECRET must be at least 32 characters for security")
	}
	if c.SMTPHost == "" {
		return fmt.Errorf("SMTP_HOST is required")
	}
	if c.SMTPPort == "" {
		return fmt.Errorf("SMTP_PORT is required")
	}
	if c.SMTPUsername == "" {
		return fmt.Errorf("SMTP_USER is required")
	}
	if c.SMTPPassword == "" {
		return fmt.Errorf("SMTP_PASS is required")
	}
	return nil
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func envInt(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return n
}

func envBool(key string, def bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return def
	}
	return b
}

//func envDbURL() string {
//	user := os.Getenv("DB_USER")
//	pass := os.Getenv("DB_PASSWORD")
//	dbName := os.Getenv("DB_NAME")
//
//	if user == "" || pass == "" || dbName == "" {
//		return ""
//	}
//
//	return fmt.Sprintf(
//		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
//		user,
//		pass,
//		envOr("DB_HOST", "localhost"),
//		envOr("DB_PORT", "5432"),
//		dbName,
//	)
//}
