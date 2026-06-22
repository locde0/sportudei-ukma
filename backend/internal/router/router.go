package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/locde0/sportudei-ukma/backend/internal/handler"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
)

func New(
	corsOrigins []string,
	uploadDir string,
	authMw func(http.Handler) http.Handler,
	authHandler *handler.AuthHandler,
) chi.Router {
	r := chi.NewRouter()

	r.Use(chimw.RequestID)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   corsOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	fileServer := http.FileServer(http.Dir(uploadDir))
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", fileServer))

	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		httputil.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/login", authHandler.Login)
		r.Post("/verify", authHandler.VerifyOTP)
		r.Post("/refresh", authHandler.Refresh)
	})

	r.Route("/api/admin", func(r chi.Router) {
		r.Use(authMw)

	})

	return r
}
