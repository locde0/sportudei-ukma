package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type UserRepo struct {
	tx *TxManager
}

func NewUserRepo(tx *TxManager) *UserRepo {
	return &UserRepo{tx: tx}
}

func (r *UserRepo) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	row, err := r.tx.Q(ctx).GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get user by email: %w", err)
	}
	return r.toDomain(row), nil
}

func (r *UserRepo) SetOTPCode(ctx context.Context, email string, code string, expiresAt time.Time) error {
	err := r.tx.Q(ctx).UpdateUserOTP(ctx, gen.UpdateUserOTPParams{
		Email:        email,
		OtpCode:      &code,
		OtpExpiresAt: &expiresAt,
	})
	if err != nil {
		return fmt.Errorf("set otp: %w", err)
	}
	return nil
}

func (r *UserRepo) ClearOTPCode(ctx context.Context, email string) error {
	if err := r.tx.Q(ctx).ClearUserOTP(ctx, email); err != nil {
		return fmt.Errorf("clear otp code: %w", err)
	}
	return nil
}

func (r *UserRepo) toDomain(row gen.GetUserByEmailRow) *domain.User {
	return &domain.User{
		ID:           row.ID,
		Email:        row.Email,
		PasswordHash: row.PasswordHash,
		OTPCode:      row.OtpCode,
		OTPExpiresAt: row.OtpExpiresAt,
	}
}
