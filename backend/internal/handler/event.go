package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type EventHandler struct {
	service *service.EventService
}

func NewEventHandler(svc *service.EventService) *EventHandler {
	return &EventHandler{service: svc}
}

func (h *EventHandler) RegisterRoutes(r chi.Router, authMw func(http.Handler) http.Handler) {
	r.Route("/api/events", func(r chi.Router) {
		r.Get("/", h.ListPublicEvents)
		r.Get("/{id}", h.GetPublicEvent)
	})

	r.Route("/api/admin/events", func(r chi.Router) {
		r.Use(authMw)

		r.Post("/", h.CreateEvent)
		r.Get("/", h.ListAdminEvents)
		r.Get("/{id}", h.GetAdminEvent)
		r.Put("/{id}", h.UpdateEvent)
		r.Delete("/{id}", h.DeleteEvent)

		r.Post("/{id}/photos", h.UploadEventPhoto)
		//r.Delete("/photos/{id}", h.DeleteEventPhoto)
	})
}
