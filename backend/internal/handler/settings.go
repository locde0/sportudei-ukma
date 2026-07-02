package handler

import (
	"net/http"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"github.com/locde0/sportudei-ukma/backend/internal/dto"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type SettingsHandler struct {
	service *service.SettingsService
}

func NewSettingsHandler(service *service.SettingsService) *SettingsHandler {
	return &SettingsHandler{
		service: service,
	}
}

// GetSettings godoc
// @Summary      Get global settings
// @Description  Get global settings (feature toggles) for the frontend
// @Tags         public-settings
// @Produce      json
// @Success      200 {object} dto.SettingsResponse
// @Router       /api/settings [get]
func (h *SettingsHandler) GetSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := h.service.GetSettings(r.Context())
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	res := &dto.SettingsResponse{
		IsEventsEnabled:     settings.IsEventsEnabled,
		IsGalleryEnabled:    settings.IsGalleryEnabled,
		IsContactsEnabled:   settings.IsContactsEnabled,
		IsPartnersEnabled:   settings.IsPartnersEnabled,
		IsTeamsEnabled:      settings.IsTeamsEnabled,
		IsMohylaGameEnabled: settings.IsMohylaGameEnabled,
	}

	httputil.JSON(w, http.StatusOK, res)
}

// UpdateSettings godoc
// @Summary      Update global settings
// @Description  Update feature toggles (enable/disable pages)
// @Tags         admin-settings
// @Accept       json
// @Produce      json
// @Param        request body dto.UpdateSettingsRequest true "New settings state"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/settings [put]
func (h *SettingsHandler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateSettingsRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	settings := &domain.Settings{
		IsEventsEnabled:     req.IsEventsEnabled,
		IsGalleryEnabled:    req.IsGalleryEnabled,
		IsContactsEnabled:   req.IsContactsEnabled,
		IsPartnersEnabled:   req.IsPartnersEnabled,
		IsTeamsEnabled:      req.IsTeamsEnabled,
		IsMohylaGameEnabled: req.IsMohylaGameEnabled,
	}

	if err := h.service.UpdateSettings(r.Context(), settings); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}
