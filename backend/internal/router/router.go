package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/locde0/sportudei-ukma/backend/internal/handler"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
	"github.com/swaggo/http-swagger/v2"
)

func New(
	corsOrigins []string,
	uploadDir string,
	authMw func(http.Handler) http.Handler,
	authHandler *handler.AuthHandler,
	eventHandler *handler.EventHandler,
	galleryHandler *handler.GalleryHandler,
	contactHandler *handler.ContactHandler,
	partnerHandler *handler.PartnerHandler,
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

	r.Get("/api/health", HealthCheck)

	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
	))

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

		r.Route("/gallery", func(r chi.Router) {
			r.Post("/", galleryHandler.CreateAlbum)
			r.Get("/", galleryHandler.ListAdminAlbums)

			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", galleryHandler.GetAdminAlbum)
				r.Put("/", galleryHandler.UpdateAlbum)
				r.Delete("/", galleryHandler.DeleteAlbum)
				r.Post("/photos", galleryHandler.UploadAlbumPhoto)
			})
		})

		r.Route("/contacts", func(r chi.Router) {
			r.Post("/", contactHandler.CreateContact)

			r.Route("/{id}", func(r chi.Router) {
				r.Put("/", contactHandler.UpdateContact)
				r.Delete("/", contactHandler.DeleteContact)

				r.Put("/order", contactHandler.UpdateContactOrder)
			})
		})

		r.Route("/partners", func(r chi.Router) {
			r.Post("/", partnerHandler.CreatePartner)
			r.Get("/", partnerHandler.ListAdminPartners)

			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", partnerHandler.GetAdminPartner)
				r.Put("/", partnerHandler.UpdatePartner)
				r.Delete("/", partnerHandler.DeletePartner)

				r.Put("/order", partnerHandler.UpdatePartnerOrder)
			})
		})
	})

	r.Route("/api/events", func(r chi.Router) {
		r.Get("/", eventHandler.ListPublicEvents)
		r.Get("/{id}", eventHandler.GetPublicEvent)
	})

	r.Route("/api/gallery", func(r chi.Router) {
		r.Get("/", galleryHandler.ListPublicAlbums)

		r.Route("/{id}", func(r chi.Router) {
			r.Get("/", galleryHandler.GetPublicAlbum)
			r.Get("/photos", galleryHandler.GetAlbumPhotos)
		})
	})

	r.Route("/api/contacts", func(r chi.Router) {
		r.Get("/", contactHandler.ListContacts)
	})

	r.Route("/api/partners", func(r chi.Router) {
		r.Get("/", partnerHandler.ListPublicPartners)
	})

	return r
}

// HealthCheck godoc
// @Summary      Health check
// @Description  Check if the API is running
// @Tags         health
// @Produce      json
// @Success      200 "OK"
// @Router       /api/health [get]
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
