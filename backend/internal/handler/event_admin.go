package handler

import (
	"encoding/json"
	"mime/multipart"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "failed to parse form data", http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")
	shortDesc := r.FormValue("short_description")
	content := r.FormValue("content")
	location := r.FormValue("location")
	registrationURL := r.FormValue("registration_url")
	isPublished := r.FormValue("is_published") == "true"
	mainPhotoIndex, err := strconv.Atoi(r.FormValue("main_photo_index"))
	if err != nil {
		mainPhotoIndex = 0
	}

	eventDate, err := time.Parse(time.RFC3339, r.FormValue("event_date"))
	if err != nil {
		http.Error(w, "invalid date format", http.StatusBadRequest)
		return
	}

	var files []*multipart.FileHeader
	if r.MultipartForm != nil && r.MultipartForm.File != nil {
		files = r.MultipartForm.File["photos"]
	}

	dto := service.CreateEventDto{
		Title:           title,
		ShortDesc:       shortDesc,
		Content:         content,
		Date:            eventDate,
		Location:        location,
		RegistrationURL: registrationURL,
		IsPublished:     isPublished,
		MainPhotoIndex:  mainPhotoIndex,
	}

	eventID, err := h.service.CreateEvent(r.Context(), dto, files)
	if err != nil {
		http.Error(w, "failed to create event", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id": eventID,
	})
}

func (h *EventHandler) ListAdminEvents(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")
	limit := 100
	offset := 0

	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil {
			limit = parsedLimit
		}
	}
	if offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil {
			offset = parsedOffset
		}
	}

	events, err := h.service.ListAdminEvents(r.Context(), int32(limit), int32(offset))
	if err != nil {
		http.Error(w, "failed to get events", http.StatusInternalServerError)
		return
	}

	var response []AdminEventListResponse
	for _, event := range events {
		response = append(response, AdminEventListResponse{
			ID:           event.ID,
			Title:        event.Title,
			Date:         event.Date,
			Location:     event.Location,
			IsPublished:  event.IsPublished,
			Status:       event.Status,
			MainPhotoURL: event.MainPhotoURL,
			CreatedAt:    event.CreatedAt,
		})
	}

	if response == nil {
		response = []AdminEventListResponse{}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *EventHandler) GetAdminEvent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid event id", http.StatusBadRequest)
		return
	}

	event, err := h.service.GetAdminEvent(r.Context(), int32(id))
	if err != nil {
		http.Error(w, "failed to get event", http.StatusInternalServerError)
		return
	}

	var photos []PhotoResponse
	for _, p := range event.Photos {
		photos = append(photos, PhotoResponse{
			ID:           p.ID,
			ImageURL:     p.ImageURL,
			IsMain:       p.IsMain,
			DisplayOrder: p.DisplayOrder,
		})
	}

	response := AdminEventResponse{
		ID:              event.ID,
		Title:           event.Title,
		ShortDesc:       event.ShortDesc,
		Content:         event.Content,
		EventDate:       event.Date,
		Location:        event.Location,
		RegistrationURL: event.RegistrationURL,
		IsPublished:     event.IsPublished,
		Status:          event.Status,
		Photos:          photos,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid event id", http.StatusBadRequest)
		return
	}

	var req UpdateEventAdminRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request format", http.StatusBadRequest)
		return
	}
	if !req.Status.IsValid() {
		http.Error(w, "invalid status", http.StatusBadRequest)
		return
	}

	var photos []service.UpdatePhotoDto
	for _, p := range req.Photos {
		photos = append(photos, service.UpdatePhotoDto{
			ID:           p.ID,
			IsMain:       p.IsMain,
			DisplayOrder: p.DisplayOrder,
		})
	}

	dto := service.UpdateEventDto{
		Title:           req.Title,
		ShortDesc:       req.ShortDesc,
		Content:         req.Content,
		Date:            req.EventDate,
		Location:        req.Location,
		RegistrationURL: req.RegistrationURL,
		IsPublished:     req.IsPublished,
		Status:          req.Status,
		Photos:          photos,
	}

	if err := h.service.UpdateEvent(r.Context(), int32(id), dto); err != nil {
		http.Error(w, "failed to update event", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid event id", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteEvent(r.Context(), int32(id)); err != nil {
		http.Error(w, "failed to delete event", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *EventHandler) UploadEventPhoto(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid event id", http.StatusBadRequest)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "failed to parse form data", http.StatusBadRequest)
		return
	}

	file, fileHeader, err := r.FormFile("photo")
	if err != nil {
		http.Error(w, "photo is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	photoDto, err := h.service.UploadEventPhoto(r.Context(), int32(id), fileHeader)
	if err != nil {
		http.Error(w, "failed to upload photo", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(PhotoResponse{
		ID:           photoDto.ID,
		ImageURL:     photoDto.ImageURL,
		IsMain:       photoDto.IsMain,
		DisplayOrder: photoDto.DisplayOrder,
	})
}

//func (h *EventHandler) DeleteEventPhoto(w http.ResponseWriter, r *http.Request) {
//	id, err := strconv.Atoi(chi.URLParam(r, "id"))
//	if err != nil {
//		http.Error(w, "invalid photo id", http.StatusBadRequest)
//		return
//	}
//
//	if err := h.service.DeleteEventPhoto(r.Context(), int32(id)); err != nil {
//		http.Error(w, "failed to delete photo", http.StatusInternalServerError)
//		return
//	}
//
//	w.WriteHeader(http.StatusNoContent)
//}
