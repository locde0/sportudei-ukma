package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type ContactHandler struct {
	service *service.ContactService
}

func NewContactHandler(s *service.ContactService) *ContactHandler {
	return &ContactHandler{service: s}
}

func (h *ContactHandler) RegisterRoutes(r chi.Router, authMw func(http.Handler) http.Handler) {
	r.Get("/api/contacts", h.ListContacts)

	r.Route("/api/admin/contacts", func(r chi.Router) {
		r.Use(authMw)
		r.Post("/", h.CreateContact)
		r.Put("/order", h.UpdateContactOrder)
		r.Put("/{id}", h.UpdateContact)
		r.Delete("/{id}", h.DeleteContact)
	})
}

func (h *ContactHandler) ListContacts(w http.ResponseWriter, r *http.Request) {
	contacts, err := h.service.ListContacts(r.Context())
	if err != nil {
		http.Error(w, "failed to list contacts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contacts)
}

func (h *ContactHandler) CreateContact(w http.ResponseWriter, r *http.Request) {
	var req struct {
		PlatformName string `json:"platform_name"`
		ContactValue string `json:"contact_value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	id, err := h.service.CreateContact(r.Context(), service.ContactDto{
		PlatformName: service.ContactType(req.PlatformName),
		ContactValue: req.ContactValue,
	})
	if err != nil {
		http.Error(w, "failed to create contact", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int32{"id": id})
}

func (h *ContactHandler) UpdateContact(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(chi.URLParam(r, "id"))
	var req struct {
		PlatformName string `json:"platform_name"`
		ContactValue string `json:"contact_value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateContact(r.Context(), int32(id), service.ContactDto{
		PlatformName: service.ContactType(req.PlatformName),
		ContactValue: req.ContactValue,
	})
	if err != nil {
		http.Error(w, "failed to update contact", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *ContactHandler) DeleteContact(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(chi.URLParam(r, "id"))
	if err := h.service.DeleteContact(r.Context(), int32(id)); err != nil {
		http.Error(w, "failed to delete contact", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ContactHandler) UpdateContactOrder(w http.ResponseWriter, r *http.Request) {
	var req struct {
		OrderedIDs []int32 `json:"ordered_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateContactOrder(r.Context(), req.OrderedIDs); err != nil {
		http.Error(w, "failed to update order", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
