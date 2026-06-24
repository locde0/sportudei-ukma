package handler

import (
	"fmt"
	"net/http"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"github.com/locde0/sportudei-ukma/backend/internal/dto"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type EventHandler struct {
	service *service.EventService
}

func NewEventHandler(service *service.EventService) *EventHandler {
	return &EventHandler{service: service}
}

// CreateEvent godoc
// @Summary      Create event
// @Description  Create a new event with photos
// @Tags         admin-events
// @Accept       multipart/form-data
// @Produce      json
// @Param        payload formData string true "CreateEventRequest JSON string"
// @Param        photos formData file false "Event photos"
// @Success      201 "OK"
// @Security     BearerAuth
// @Router       /api/admin/events [post]
func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateEventRequest
	if err := httputil.ParseMultipartJSON(r, 32<<20, "payload", &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	defer r.MultipartForm.RemoveAll()

	fileHeaders := r.MultipartForm.File["photos"]
	domainFiles := make([]domain.File, 0, len(fileHeaders))

	for _, fh := range fileHeaders {
		file, err := fh.Open()
		if err != nil {
			httputil.HandleError(w, fmt.Errorf("open uploaded file %s: %w", fh.Filename, domain.ErrInvalidInput))
			return
		}

		defer file.Close()

		domainFiles = append(domainFiles, domain.File{
			Name:        fh.Filename,
			ContentType: fh.Header["Content-Type"][0],
			Size:        fh.Size,
			Content:     file,
		})
	}

	event := &domain.Event{
		Title:       req.Title,
		Description: req.Desc,
		Content:     req.Content,
		EventDate:   req.EventDate,
		Location:    req.Location,
		URL:         req.URL,
		IsPublished: req.IsPublished,
	}

	if err := h.service.CreateEvent(r.Context(), event, domainFiles); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusCreated, nil)
}

// UpdateEvent godoc
// @Summary      Update event
// @Description  Update an existing event and its photos
// @Tags         admin-events
// @Accept       json
// @Produce      json
// @Param        id path int true "Event ID"
// @Param        request body dto.UpdateEventRequest true "Update data"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/events/{id} [put]
func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateEventRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	event := &domain.Event{
		ID:          id,
		Title:       req.Title,
		Description: req.Desc,
		Content:     req.Content,
		EventDate:   req.EventDate,
		Location:    req.Location,
		URL:         req.URL,
		Status:      req.Status,
		IsPublished: req.IsPublished,
	}

	var photos []domain.EventPhoto
	for _, photo := range req.Photos {
		photos = append(photos, domain.EventPhoto{
			ID:           photo.ID,
			EventID:      id,
			IsMain:       photo.IsMain,
			DisplayOrder: photo.DisplayOrder,
		})
	}

	if err := h.service.UpdateEvent(r.Context(), event, photos); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// DeleteEvent godoc
// @Summary      Delete event
// @Description  Delete an existing event by ID
// @Tags         admin-events
// @Produce      json
// @Param        id path int true "Event ID"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/events/{id} [delete]
func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	if err := h.service.DeleteEvent(r.Context(), id); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// UploadEventPhoto godoc
// @Summary      Upload event photo
// @Description  Upload an additional photo for an event
// @Tags         admin-events
// @Accept       multipart/form-data
// @Produce      json
// @Param        id path int true "Event ID"
// @Param        photo formData file true "Photo to upload"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/events/{id}/photos [post]
func (h *EventHandler) UploadEventPhoto(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	file, header, err := httputil.ParseFile(r, "photo")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}
	defer file.Close()

	domainFile := domain.File{
		Name:        header.Filename,
		ContentType: header.Header["Content-Type"][0],
		Size:        header.Size,
		Content:     file,
	}

	if err := h.service.UploadEventPhoto(r.Context(), id, domainFile); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// GetAdminEvent godoc
// @Summary      Get admin event
// @Description  Get full event details for admin by ID
// @Tags         admin-events
// @Produce      json
// @Param        id path int true "Event ID"
// @Success      200 {object} dto.AdminEventResponse
// @Security     BearerAuth
// @Router       /api/admin/events/{id} [get]
func (h *EventHandler) GetAdminEvent(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	event, photos, err := h.service.GetAdminEvent(r.Context(), id)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	base := dto.BaseEventResponse{
		ID:        id,
		Title:     event.Title,
		Desc:      event.Description,
		Location:  event.Location,
		EventDate: event.EventDate,
		Status:    event.Status,
	}
	res := dto.AdminEventResponse{
		BaseEventResponse: base,
		Content:           event.Content,
		IsPublished:       event.IsPublished,
		URL:               event.URL,
	}

	for _, photo := range photos {
		res.Photos = append(res.Photos, dto.EventPhotoResponse{
			ID:           photo.ID,
			ImagePath:    photo.ImagePath,
			IsMain:       photo.IsMain,
			DisplayOrder: photo.DisplayOrder,
		})
	}

	httputil.JSON(w, http.StatusOK, res)
}

// GetPublicEvent godoc
// @Summary      Get public event
// @Description  Get event details for public view by ID
// @Tags         public-events
// @Produce      json
// @Param        id path int true "Event ID"
// @Success      200 {object} dto.PublicEventResponse
// @Router       /api/events/{id} [get]
func (h *EventHandler) GetPublicEvent(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	event, photos, err := h.service.GetPublicEvent(r.Context(), id)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	base := dto.BaseEventResponse{
		ID:        id,
		Title:     event.Title,
		Desc:      event.Description,
		Location:  event.Location,
		EventDate: event.EventDate,
		Status:    event.Status,
	}
	res := dto.PublicEventResponse{
		BaseEventResponse: base,
		Content:           event.Content,
		URL:               event.URL,
	}

	for _, photo := range photos {
		res.Photos = append(res.Photos, dto.EventPhotoResponse{
			ID:           photo.ID,
			ImagePath:    photo.ImagePath,
			IsMain:       photo.IsMain,
			DisplayOrder: photo.DisplayOrder,
		})
	}

	httputil.JSON(w, http.StatusOK, res)
}

// ListAdminEvents godoc
// @Summary      List admin events
// @Description  List all events for admin view with pagination
// @Tags         admin-events
// @Produce      json
// @Param        limit query int false "Pagination limit" default(10)
// @Param        offset query int false "Pagination offset" default(0)
// @Success      200 {object} dto.AdminEventsListResponse
// @Security     BearerAuth
// @Router       /api/admin/events [get]
func (h *EventHandler) ListAdminEvents(w http.ResponseWriter, r *http.Request) {
	pagination := httputil.ParsePagination(r, 10, 0)

	events, err := h.service.ListAdminEvents(r.Context(), pagination.Limit, pagination.Offset)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	list := make([]dto.AdminEventsListItemResponse, len(events))
	for _, event := range events {
		base := dto.BaseEventResponse{
			ID:        event.ID,
			Title:     event.Title,
			Desc:      event.Description,
			Location:  event.Location,
			EventDate: event.EventDate,
			Status:    event.Status,
		}
		list = append(list, dto.AdminEventsListItemResponse{
			BaseEventResponse: base,
			IsPublished:       event.IsPublished,
			MainPhotoPath:     event.MainImagePath,
		})
	}

	httputil.JSON(w, http.StatusOK, dto.AdminEventsListResponse{Events: list})
}

// ListPublicEvents godoc
// @Summary      List public events
// @Description  List published events for public view with pagination
// @Tags         public-events
// @Produce      json
// @Param        limit query int false "Pagination limit" default(3)
// @Param        offset query int false "Pagination offset" default(0)
// @Success      200 {object} dto.PublicEventsListResponse
// @Router       /api/events [get]
func (h *EventHandler) ListPublicEvents(w http.ResponseWriter, r *http.Request) {
	pagination := httputil.ParsePagination(r, 3, 0)

	events, err := h.service.ListPublicEvents(r.Context(), pagination.Limit, pagination.Offset)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	list := make([]dto.PublicEventsListItemResponse, len(events))
	for _, event := range events {
		base := dto.BaseEventResponse{
			ID:        event.ID,
			Title:     event.Title,
			Desc:      event.Description,
			Location:  event.Location,
			EventDate: event.EventDate,
			Status:    event.Status,
		}
		list = append(list, dto.PublicEventsListItemResponse{
			BaseEventResponse: base,
			MainPhotoPath:     event.MainImagePath,
		})
	}

	httputil.JSON(w, http.StatusOK, dto.PublicEventsListResponse{Events: list})
}
