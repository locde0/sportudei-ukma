package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type SettingsHandler struct {
	service *service.SettingsService
}

func NewSettingsHandler(s *service.SettingsService) *SettingsHandler {
	return &SettingsHandler{service: s}
}

func (h *SettingsHandler) RegisterRoutes(r chi.Router, authMw func(http.Handler) http.Handler) {
	r.Get("/api/settings", h.GetSettings)

	r.Route("/api/admin/settings", func(r chi.Router) {
		r.Use(authMw)
		r.Put("/", h.UpdateSettings)
	})
}

func (h *SettingsHandler) GetSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := h.service.GetSettings(r.Context())
	if err != nil {
		http.Error(w, "failed to get settings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(settings)
}

func (h *SettingsHandler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	var req UpdateSiteSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	dto := service.SiteSettingsDto{
		IsMohylaGamesEnabled: req.IsMohylaGamesEnabled,
		IsScheduleEnabled:    req.IsScheduleEnabled,
		IsTeamsEnabled:       req.IsTeamsEnabled,
		IsPartnersEnabled:    req.IsPartnersEnabled,
		IsGalleryEnabled:     req.IsGalleryEnabled,
		IsContactsEnabled:    req.IsContactsEnabled,
	}

	if err := h.service.UpdateSettings(r.Context(), dto); err != nil {
		http.Error(w, "failed to update settings", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
