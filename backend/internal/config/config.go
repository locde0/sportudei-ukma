package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Env  string
	Port string

	DbURL         string
	RunMigrations bool

	JWTSecret         string
	JWTAccessExpDays  int
	JWTRefreshExpDays int

	SMTPHost string
	SMTPPort string
	SMTPUser string
	SMTPPass string
	SMTPFrom string

	CORSOrigins []string

	UploadDir string
}

func Load() *Config {
	cfg := &Config{
		Env:               envOr("APP_ENV", "dev"),
		Port:              envOr("PORT", "8000"),
		DbURL:             os.Getenv("DB_URL"),
		RunMigrations:     envBool("RUN_MIGRATIONS", false),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		JWTAccessExpDays:  envInt("JWT_ACCESS_EXP_DAYS", 1),
		JWTRefreshExpDays: envInt("JWT_REFRESH_EXP_DAYS", 3),
		SMTPHost:          os.Getenv("SMTP_HOST"),
		SMTPPort:          os.Getenv("SMTP_PORT"),
		SMTPUser:          os.Getenv("SMTP_USER"),
		SMTPPass:          os.Getenv("SMTP_PASS"),
		SMTPFrom:          envOr("SMTP_FROM", "noreply@sportudei.com"),
		CORSOrigins:       strings.Split(envOr("CORS_ORIGINS", "http://localhost:*"), ","),
		UploadDir:         envOr("UPLOAD_DIR", "uploads"),
	}

	if err := cfg.validate(); err != nil {
		panic(fmt.Sprintf("invalid config: %v", err))
	}

	return cfg
}

func (c *Config) IsProd() bool {
	return c.Env == "prod"
}

func (c *Config) validate() error {
	if c.DbURL == "" {
		return fmt.Errorf("DB_URL is required")
	}
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}
	if len(c.JWTSecret) < 32 {
		return fmt.Errorf("JWT_SECRET must be at least 32 characters")
	}
	if c.SMTPHost == "" {
		return fmt.Errorf("SMTP_HOST is required")
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
