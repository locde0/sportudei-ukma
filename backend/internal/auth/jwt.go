package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenProvider interface {
	GenerateTokenPair(email string) (accessToken, refreshToken string, err error)
	ParseToken(token, expectedType string) (email string, err error)
}

type JWTProvider struct {
	secret     []byte
	accessExp  time.Duration
	refreshExp time.Duration
}

type tokenClaims struct {
	Type string `json:"typ"`
	jwt.RegisteredClaims
}

func NewJWTProvider(secret string, accessExp, refreshExp int) *JWTProvider {
	return &JWTProvider{
		secret:     []byte(secret),
		accessExp:  time.Duration(accessExp) * time.Hour * 24,
		refreshExp: time.Duration(refreshExp) * time.Hour * 24,
	}
}

func (p *JWTProvider) GenerateTokenPair(email string) (string, string, error) {
	now := time.Now()

	access, err := p.generateToken(email, "access", now, p.accessExp)
	if err != nil {
		return "", "", fmt.Errorf("generate access token: %w", err)
	}

	refresh, err := p.generateToken(email, "refresh", now, p.refreshExp)
	if err != nil {
		return "", "", fmt.Errorf("generate refresh token: %w", err)
	}

	return access, refresh, nil
}

func (p *JWTProvider) ParseToken(tokenString, expectedType string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &tokenClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return p.secret, nil
	})
	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(*tokenClaims)
	if !ok || !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	if claims.Type != expectedType {
		return "", fmt.Errorf("expected token type %q, got %q", expectedType, claims.Type)
	}

	return claims.Subject, nil
}

func (p *JWTProvider) generateToken(email, typ string, now time.Time, exp time.Duration) (string, error) {
	claims := tokenClaims{
		Type: typ,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   email,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(exp)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(p.secret)
}
