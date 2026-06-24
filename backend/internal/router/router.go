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
	eventHandler *handler.EventHandler,
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

		r.Route("/events", func(r chi.Router) {
			r.Post("/", eventHandler.CreateEvent)
			r.Get("/", eventHandler.ListAdminEvents)

			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", eventHandler.GetAdminEvent)
				r.Put("/", eventHandler.UpdateEvent)
				r.Delete("/", eventHandler.DeleteEvent)
				r.Post("/photos", eventHandler.UploadEventPhoto)
			})
		})
	})

	r.Route("/api/events", func(r chi.Router) {
		r.Get("/", eventHandler.ListPublicEvents)
		r.Get("/{id}", eventHandler.GetPublicEvent)
	})

	return r
}
