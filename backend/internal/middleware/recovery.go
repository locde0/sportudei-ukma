package middleware

import (
	"log/slog"
	"net/http"
	"runtime/debug"

	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
)

func Recovery(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					logger.Error("panic recovered",
						slog.Any("error", err),
						slog.String("stack", string(debug.Stack())),
					)
					httputil.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", "internal server error")
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}
