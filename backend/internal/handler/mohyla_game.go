package handler

import (
	"net/http"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"github.com/locde0/sportudei-ukma/backend/internal/dto"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type MohylaGameHandler struct {
	service *service.MohylaGameService
}

func NewMohylaGameHandler(service *service.MohylaGameService) *MohylaGameHandler {
	return &MohylaGameHandler{
		service: service,
	}
}

// GetMohylaGame godoc
// @Summary      Get Mohyla Games info
// @Description  Get the main tournament page info and content
// @Tags         public-mohyla-game
// @Produce      json
// @Success      200 {object} dto.MohylaGameResponse
// @Router       /api/mohyla-game [get]
func (h *MohylaGameHandler) GetMohylaGame(w http.ResponseWriter, r *http.Request) {
	game, err := h.service.GetMohylaGame(r.Context())
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	res := &dto.MohylaGameResponse{
		Title:       game.Title,
		Description: game.Description,
		Content:     game.Content,
	}

	httputil.JSON(w, http.StatusOK, res)
}

// UpdateMohylaGame godoc
// @Summary      Update Mohyla Games info
// @Description  Update the main tournament page content
// @Tags         admin-mohyla-game
// @Accept       json
// @Produce      json
// @Param        request body dto.UpdateMohylaGameRequest true "New content"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/mohyla-game [put]
func (h *MohylaGameHandler) UpdateMohylaGame(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateMohylaGameRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	game := &domain.MohylaGame{
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
	}

	if err := h.service.UpdateMohylaGame(r.Context(), game); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}
