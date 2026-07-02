package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/locde0/sportudei-ukma/backend/internal/auth"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
)

type contextKey string

const EmailKey contextKey = "email"

func Auth(tokenProvider auth.TokenProvider) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if header == "" {
				httputil.Error(w, http.StatusUnauthorized, "MISSING_AUTH", "missing authorization header")
				return
			}

			parts := strings.SplitN(header, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
				httputil.Error(w, http.StatusUnauthorized, "INVALID_AUTH", "invalid authorization header")
				return
			}

			email, err := tokenProvider.ParseToken(parts[1], "access")
			if err != nil {
				httputil.Error(w, http.StatusUnauthorized, "INVALID_TOKEN", "invalid or expired token")
				return
			}

			ctx := context.WithValue(r.Context(), EmailKey, email)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetEmail(ctx context.Context) (string, bool) {
	email, ok := ctx.Value(EmailKey).(string)
	return email, ok
}
