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

	httputil.JSON(w, http.StatusCreated, map[string]int32{"id": event.ID})
}

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
