package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type PartnerHandler struct {
	service *service.PartnerService
}

func NewPartnerHandler(s *service.PartnerService) *PartnerHandler {
	return &PartnerHandler{service: s}
}

func (h *PartnerHandler) RegisterRoutes(r chi.Router, authMw func(http.Handler) http.Handler) {
	r.Get("/api/partners", h.ListPublicPartners)

	r.Route("/api/admin/partners", func(r chi.Router) {
		r.Use(authMw)
		r.Get("/", h.ListAdminPartners)
		r.Post("/", h.CreatePartner)
		r.Put("/order", h.UpdatePartnerOrder)
		r.Put("/{id}", h.UpdatePartner)
		r.Delete("/{id}", h.DeletePartner)
	})
}

func (h *PartnerHandler) ListPublicPartners(w http.ResponseWriter, r *http.Request) {
	partners, err := h.service.ListPublicPartners(r.Context())
	if err != nil {
		http.Error(w, "failed to get public partners.sql", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(partners)
}

func (h *PartnerHandler) ListAdminPartners(w http.ResponseWriter, r *http.Request) {
	partners, err := h.service.ListAdminPartners(r.Context())
	if err != nil {
		http.Error(w, "failed to get admin partners.sql", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(partners)
}

func (h *PartnerHandler) CreatePartner(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "failed to parse form", http.StatusBadRequest)
		return
	}

	name := r.FormValue("name")
	linkURL := r.FormValue("link_url")
	isActive := r.FormValue("is_active") == "true"

	file, fileHeader, err := r.FormFile("logo")
	if err != nil {
		http.Error(w, "logo is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	var linkPtr *string
	if linkURL != "" {
		linkPtr = &linkURL
	}

	dto := service.PartnerDto{
		Name:     name,
		LinkURL:  linkPtr,
		IsActive: isActive,
	}

	id, err := h.service.CreatePartner(r.Context(), dto, fileHeader)
	if err != nil {
		http.Error(w, "failed to create partner", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int32{"id": id})
}

func (h *PartnerHandler) UpdatePartner(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "failed to parse form", http.StatusBadRequest)
		return
	}

	name := r.FormValue("name")
	linkURL := r.FormValue("link_url")
	isActive := r.FormValue("is_active") == "true"

	var linkPtr *string
	if linkURL != "" {
		linkPtr = &linkURL
	}

	dto := service.PartnerDto{
		Name:     name,
		LinkURL:  linkPtr,
		IsActive: isActive,
	}

	file, fileHeader, _ := r.FormFile("logo")
	if file != nil {
		defer file.Close()
	}

	if err := h.service.UpdatePartner(r.Context(), int32(id), dto, fileHeader); err != nil {
		http.Error(w, "failed to update partner", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *PartnerHandler) DeletePartner(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := h.service.DeletePartner(r.Context(), int32(id)); err != nil {
		http.Error(w, "failed to delete partner", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *PartnerHandler) UpdatePartnerOrder(w http.ResponseWriter, r *http.Request) {
	var req struct {
		OrderedIDs []int32 `json:"ordered_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdatePartnerOrder(r.Context(), req.OrderedIDs); err != nil {
		http.Error(w, "failed to update order", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
