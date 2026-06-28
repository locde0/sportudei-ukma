package handler

import (
	"net/http"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"github.com/locde0/sportudei-ukma/backend/internal/dto"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type ContactHandler struct {
	service *service.ContactService
}

func NewContactHandler(service *service.ContactService) *ContactHandler {
	return &ContactHandler{
		service: service,
	}
}

// CreateContact godoc
// @Summary      Create contact
// @Description  Create a new contact link
// @Tags         admin-contacts
// @Accept       json
// @Produce      json
// @Param        request body dto.CreateContactRequest true "Contact data"
// @Success      201 "Created"
// @Security     BearerAuth
// @Router       /api/admin/contacts [post]
func (h *ContactHandler) CreateContact(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateContactRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	contact := &domain.Contact{
		Platform:     req.Platform,
		Name:         req.Name,
		URL:          req.URL,
		DisplayOrder: req.DisplayOrder,
	}

	if err := h.service.CreateContact(r.Context(), contact); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusCreated, nil)
}

// UpdateContact godoc
// @Summary      Update contact
// @Description  Update an existing contact link
// @Tags         admin-contacts
// @Accept       json
// @Produce      json
// @Param        id path int true "Contact ID"
// @Param        request body dto.UpdateContactRequest true "Update data"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/contacts/{id} [put]
func (h *ContactHandler) UpdateContact(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	var req dto.UpdateContactRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	contact := &domain.Contact{
		ID:       id,
		Platform: req.Platform,
		Name:     req.Name,
		URL:      req.URL,
	}

	if err := h.service.UpdateContact(r.Context(), contact); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// DeleteContact godoc
// @Summary      Delete contact
// @Description  Delete an existing contact link by ID
// @Tags         admin-contacts
// @Produce      json
// @Param        id path int true "Contact ID"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/contacts/{id} [delete]
func (h *ContactHandler) DeleteContact(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	if err := h.service.DeleteContact(r.Context(), id); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// ListContacts godoc
// @Summary      List contacts
// @Description  List all contact links
// @Tags         public-contacts
// @Produce      json
// @Success      200 {object} dto.ContactsListResponse
// @Router       /api/contacts [get]
func (h *ContactHandler) ListContacts(w http.ResponseWriter, r *http.Request) {
	contacts, err := h.service.ListContacts(r.Context())
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	list := make([]dto.ContactResponse, 0, len(contacts))
	for _, contact := range contacts {
		list = append(list, dto.ContactResponse{
			ID:           contact.ID,
			Platform:     contact.Platform,
			Name:         contact.Name,
			URL:          contact.URL,
			DisplayOrder: contact.DisplayOrder,
		})
	}

	httputil.JSON(w, http.StatusOK, dto.ContactsListResponse{Contacts: list})
}

// UpdateContactOrder godoc
// @Summary      Update contact order
// @Description  Update the display order of a contact
// @Tags         admin-contacts
// @Accept       json
// @Produce      json
// @Param        id path int true "Contact ID"
// @Param        request body dto.UpdateContactOrderRequest true "New order"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/contacts/{id}/order [put]
func (h *ContactHandler) UpdateContactOrder(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	var req dto.UpdateContactOrderRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	contact := &domain.Contact{
		ID:           id,
		DisplayOrder: req.DisplayOrder,
	}

	if err := h.service.UpdateContactOrder(r.Context(), contact); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}
