package service

import (
	"context"
	"errors"
	"fmt"
	"math/rand/v2"
	"strconv"
	"time"

	"github.com/locde0/sportudei-ukma/backend/internal/auth"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"github.com/locde0/sportudei-ukma/backend/internal/email"
)

type AuthService struct {
	users  domain.UserRepository
	tokens auth.TokenProvider
	hasher auth.PasswordHasher
	mailer email.EmailSender
	otpTTL time.Duration
}

func NewAuthService(
	users domain.UserRepository,
	tokens auth.TokenProvider,
	hasher auth.PasswordHasher,
	mailer email.EmailSender,
) *AuthService {
	return &AuthService{
		users:  users,
		tokens: tokens,
		hasher: hasher,
		mailer: mailer,
		otpTTL: 5 * time.Minute,
	}
}

func (s *AuthService) Login(ctx context.Context, email, password string) error {
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return fmt.Errorf("%w: invalid email or password", domain.ErrUnauthorized)
		}
		return fmt.Errorf("get user: %w", err)
	}

	if err := s.hasher.Compare(password, user.PasswordHash); err != nil {
		return fmt.Errorf("%w: invalid email or password", domain.ErrUnauthorized)
	}

	code := strconv.Itoa(rand.IntN(900000) + 100000)
	expiresAt := time.Now().Add(s.otpTTL)
	if err := s.users.SetOTPCode(ctx, email, code, expiresAt); err != nil {
		return fmt.Errorf("set otp: %w", err)
	}

	if err := s.mailer.SendOTPCode(email, code); err != nil {
		return fmt.Errorf("send otp: %w", err)
	}

	return nil
}

func (s *AuthService) VerifyOTP(ctx context.Context, email, code string) (string, string, error) {
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		return "", "", fmt.Errorf("%w: invalid verification", domain.ErrUnauthorized)
	}

	if user.OTPCode == nil || user.OTPExpiresAt == nil {
		return "", "", fmt.Errorf("%w: no active otp", domain.ErrUnauthorized)
	}
	if *user.OTPCode != code {
		return "", "", fmt.Errorf("%w: invalid otp", domain.ErrUnauthorized)
	}
	if time.Now().After(*user.OTPExpiresAt) {
		return "", "", fmt.Errorf("%w: otp expired", domain.ErrUnauthorized)
	}

	if err := s.users.ClearOTPCode(ctx, email); err != nil {
		return "", "", fmt.Errorf("clear otp: %w", err)
	}

	access, refresh, err := s.tokens.GenerateTokenPair(user.Email)
	if err != nil {
		return "", "", fmt.Errorf("generate token pair: %w", err)
	}

	return access, refresh, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (string, string, error) {
	emailAddr, err := s.tokens.ParseToken(refreshToken, "refresh")
	if err != nil {
		return "", "", fmt.Errorf("%w: invalid refresh token", domain.ErrUnauthorized)
	}

	_, err = s.users.GetByEmail(ctx, emailAddr)
	if err != nil {
		return "", "", fmt.Errorf("%w: user no longer exists", domain.ErrUnauthorized)
	}

	access, refresh, err := s.tokens.GenerateTokenPair(emailAddr)
	if err != nil {
		return "", "", fmt.Errorf("generate token pair: %w", err)
	}

	return access, refresh, nil
}
