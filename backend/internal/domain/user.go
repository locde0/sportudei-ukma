package domain

import (
	"context"
	"time"
)

type User struct {
	ID           int32
	Email        string
	PasswordHash string
	OTPCode      *string
	OTPExpiresAt *time.Time
}

type UserRepository interface {
	GetByEmail(ctx context.Context, email string) (*User, error)
	SetOTPCode(ctx context.Context, email, code string, expiresAt time.Time) error
	ClearOTPCode(ctx context.Context, email string) error
}
