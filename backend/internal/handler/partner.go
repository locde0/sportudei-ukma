package handler

import (
	"errors"
	"net/http"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"github.com/locde0/sportudei-ukma/backend/internal/dto"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type PartnerHandler struct {
	service *service.PartnerService
}

func NewPartnerHandler(service *service.PartnerService) *PartnerHandler {
	return &PartnerHandler{
		service: service,
	}
}

// CreatePartner godoc
// @Summary      Create partner
// @Description  Create a new partner with an optional photo
// @Tags         admin-partners
// @Accept       multipart/form-data
// @Produce      json
// @Param        payload formData string true "CreatePartnerRequest JSON string"
// @Param        photo formData file false "Partner logo photo"
// @Success      201 "Created"
// @Security     BearerAuth
// @Router       /api/admin/partners [post]
func (h *PartnerHandler) CreatePartner(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePartnerRequest
	if err := httputil.ParseMultipartJSON(r, 10<<20, "payload", &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	file, header, err := httputil.ParseFile(r, "photo")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}
	defer file.Close()

	domainFile := &domain.File{
		Name:        header.Filename,
		ContentType: header.Header["Content-Type"][0],
		Size:        header.Size,
		Content:     file,
	}

	partner := &domain.Partner{
		Name:         req.Name,
		URL:          req.URL,
		IsActive:     req.IsActive,
		DisplayOrder: req.DisplayOrder,
	}
	if err := h.service.CreatePartner(r.Context(), partner, domainFile); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusCreated, nil)
}

// UpdatePartner godoc
// @Summary      Update partner
// @Description  Update an existing partner and its photo
// @Tags         admin-partners
// @Accept       multipart/form-data
// @Produce      json
// @Param        id path int true "Partner ID"
// @Param        payload formData string true "UpdatePartnerRequest JSON string"
// @Param        photo formData file false "Partner logo photo"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/partners/{id} [put]
func (h *PartnerHandler) UpdatePartner(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	var req dto.UpdatePartnerRequest
	if err := httputil.ParseMultipartJSON(r, 10<<20, "payload", &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	var domainFile *domain.File
	file, header, err := httputil.ParseFile(r, "photo")
	if err != nil {
		if !errors.Is(err, http.ErrMissingFile) {
			httputil.HandleError(w, err)
			return
		}
	} else {
		defer file.Close()
		domainFile = &domain.File{
			Name:        header.Filename,
			ContentType: header.Header["Content-Type"][0],
			Size:        header.Size,
			Content:     file,
		}
	}

	partner := &domain.Partner{
		ID:           id,
		Name:         req.Name,
		URL:          req.URL,
		IsActive:     req.IsActive,
		DisplayOrder: req.DisplayOrder,
	}
	if err := h.service.UpdatePartner(r.Context(), partner, domainFile); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// DeletePartner godoc
// @Summary      Delete partner
// @Description  Delete an existing partner by ID
// @Tags         admin-partners
// @Produce      json
// @Param        id path int true "Partner ID"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/partners/{id} [delete]
func (h *PartnerHandler) DeletePartner(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	if err := h.service.DeletePartner(r.Context(), id); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// ListAdminPartners godoc
// @Summary      List admin partners
// @Description  List all partners for admin view
// @Tags         admin-partners
// @Produce      json
// @Success      200 {object} dto.AdminPartnersListResponse
// @Security     BearerAuth
// @Router       /api/admin/partners [get]
func (h *PartnerHandler) ListAdminPartners(w http.ResponseWriter, r *http.Request) {
	partners, err := h.service.ListAdminPartners(r.Context())
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	list := make([]dto.AdminPartnerResponse, 0, len(partners))
	for _, partner := range partners {
		list = append(list, dto.AdminPartnerResponse{
			BasePartnerResponse: dto.BasePartnerResponse{
				ID:           partner.ID,
				Name:         partner.Name,
				LogoPath:     partner.LogoPath,
				URL:          partner.URL,
				DisplayOrder: partner.DisplayOrder,
			},
			IsActive: partner.IsActive,
		})
	}

	httputil.JSON(w, http.StatusOK, &dto.AdminPartnersListResponse{Partners: list})
}

// ListPublicPartners godoc
// @Summary      List public partners
// @Description  List active partners for public view
// @Tags         public-partners
// @Produce      json
// @Success      200 {object} dto.PublicPartnersListResponse
// @Router       /api/partners [get]
func (h *PartnerHandler) ListPublicPartners(w http.ResponseWriter, r *http.Request) {
	partners, err := h.service.ListPublicPartners(r.Context())
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	list := make([]dto.BasePartnerResponse, 0, len(partners))
	for _, partner := range partners {
		list = append(list, dto.BasePartnerResponse{
			ID:           partner.ID,
			Name:         partner.Name,
			LogoPath:     partner.LogoPath,
			URL:          partner.URL,
			DisplayOrder: partner.DisplayOrder,
		})
	}

	httputil.JSON(w, http.StatusOK, &dto.PublicPartnersListResponse{Partners: list})
}

// GetAdminPartner godoc
// @Summary      Get admin partner
// @Description  Get full partner details for admin by ID
// @Tags         admin-partners
// @Produce      json
// @Param        id path int true "Partner ID"
// @Success      200 {object} dto.AdminPartnerResponse
// @Security     BearerAuth
// @Router       /api/admin/partners/{id} [get]
func (h *PartnerHandler) GetAdminPartner(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	partner, err := h.service.GetAdminPartner(r.Context(), id)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	res := &dto.AdminPartnerResponse{
		BasePartnerResponse: dto.BasePartnerResponse{
			ID:           partner.ID,
			Name:         partner.Name,
			LogoPath:     partner.LogoPath,
			URL:          partner.URL,
			DisplayOrder: partner.DisplayOrder,
		},
		IsActive: partner.IsActive,
	}

	httputil.JSON(w, http.StatusOK, res)
}

// UpdatePartnerOrder godoc
// @Summary      Update partner order
// @Description  Update the display order of a partner
// @Tags         admin-partners
// @Accept       json
// @Produce      json
// @Param        id path int true "Partner ID"
// @Param        request body dto.UpdatePartnerOrderRequest true "New order"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/partners/{id}/order [put]
func (h *PartnerHandler) UpdatePartnerOrder(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	var req dto.UpdatePartnerOrderRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	partner := &domain.Partner{
		ID:           id,
		DisplayOrder: req.DisplayOrder,
	}
	if err := h.service.UpdatePartnerOrder(r.Context(), partner); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}
