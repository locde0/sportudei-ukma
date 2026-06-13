package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(jwtSecret string) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	fs := http.FileServer(http.Dir("uploads"))
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", fs))

	r.Route("/api", func(r chi.Router) {
		r.Get("/health", Health())

		//r.Route("/events", func(r chi.Router) {
		//	// Тут будуть твої майбутні ручки
		//	// r.Get("/", GetAllEvents)
		//	// r.Get("/{id}", GetEventByID)
		//})

		//r.Route("/admin", func(r chi.Router) {
		//	r.Use(middleware.Auth(jwtSecret))
		//
		//	// r.Post("/events", CreateEvent)
		//	// r.Put("/events/{id}", UpdateEvent)
		//	// r.Delete("/events/{id}", DeleteEvent)
		//})
	})

	return r
}
