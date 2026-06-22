package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type UserRepo struct {
	q *gen.Queries
}

func NewUserRepo(q *gen.Queries) *UserRepo {
	return &UserRepo{q: q}
}

func (r *UserRepo) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	row, err := r.q.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get user by email: %w", err)
	}
	return r.toDomain(row), nil
}

func (r *UserRepo) SetOTPCode(ctx context.Context, email string, code string, expiresAt time.Time) error {
	err := r.q.UpdateUserOTP(ctx, gen.UpdateUserOTPParams{
		Email: email,
		OtpCode: pgtype.Text{
			String: code,
			Valid:  true,
		},
		OtpExpiresAt: pgtype.Timestamptz{
			Time:  expiresAt,
			Valid: true,
		},
	})
	if err != nil {
		return fmt.Errorf("set otp: %w", err)
	}
	return nil
}

func (r *UserRepo) ClearOTPCode(ctx context.Context, email string) error {
	if err := r.q.ClearUserOTP(ctx, email); err != nil {
		return fmt.Errorf("clear otp code: %w", err)
	}
	return nil
}

func (r *UserRepo) toDomain(row gen.GetUserByEmailRow) *domain.User {
	user := &domain.User{
		ID:           row.ID,
		Email:        row.Email,
		PasswordHash: row.PasswordHash,
	}

	if row.OtpCode.Valid {
		user.OTPCode = &row.OtpCode.String
	}
	if row.OtpExpiresAt.Valid {
		user.OTPExpiresAt = &row.OtpExpiresAt.Time
	}

	return user
}
