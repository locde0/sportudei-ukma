package service

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	gen "github.com/locde0/sportudei-ukma/backend/db/generated"
	"github.com/locde0/sportudei-ukma/backend/internal/db"
	"github.com/locde0/sportudei-ukma/backend/internal/email"
	"github.com/locde0/sportudei-ukma/backend/internal/jwt"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidOTP         = errors.New("invalid or expired verification code")
	ErrInvalidToken       = errors.New("invalid or expired token")
)

type AuthService struct {
	store      *db.Store
	mailer     *email.SMTPMailer
	jwtSecret  string
	accessExp  int
	refreshExp int
}

func NewAuthService(s *db.Store, m *email.SMTPMailer, secret string, accessExp, refreshExp int) *AuthService {
	return &AuthService{
		store:      s,
		mailer:     m,
		jwtSecret:  secret,
		accessExp:  accessExp,
		refreshExp: refreshExp,
	}
}

func (s *AuthService) LoginAndSendOTP(ctx context.Context, email, password string) error {
	user, err := s.store.GetUserByEmail(ctx, email)
	if err != nil {
		return ErrInvalidCredentials
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return ErrInvalidCredentials
	}

	n, _ := rand.Int(rand.Reader, big.NewInt(900000))
	code := fmt.Sprintf("%06d", n.Int64()+100000)
	expiresAt := time.Now().Add(5 * time.Minute)

	err = s.store.UpdateUserOTP(ctx, gen.UpdateUserOTPParams{
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
		return fmt.Errorf("failed to update otp: %w", err)
	}

	go func() {
		_ = s.mailer.SendOTP(email, code)
	}()

	return nil
}

func (s *AuthService) Verify(ctx context.Context, email, code string) (string, string, error) {
	user, err := s.store.GetUserByEmail(ctx, email)
	if err != nil || !user.OtpCode.Valid || !user.OtpExpiresAt.Valid {
		return "", "", ErrInvalidOTP
	}

	if user.OtpCode.String != code || time.Now().After(user.OtpExpiresAt.Time) {
		return "", "", ErrInvalidOTP
	}

	_ = s.store.ClearUserOTP(ctx, email)

	userIDStr := strconv.Itoa(int(user.ID))
	return jwt.GenerateTokenPair(userIDStr, s.jwtSecret, s.accessExp, s.refreshExp)
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (string, string, error) {
	userIDStr, err := jwt.ParseToken(refreshToken, s.jwtSecret, "refresh")
	if err != nil {
		return "", "", ErrInvalidToken
	}

	//userID, _ := strconv.Atoi(userIDStr)

	return jwt.GenerateTokenPair(userIDStr, s.jwtSecret, s.accessExp, s.refreshExp)
}
