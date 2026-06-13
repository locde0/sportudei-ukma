package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func (h *EventHandler) ListPublicEvents(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")
	limit := 10
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

	events, err := h.service.ListPublicEvents(r.Context(), int32(limit), int32(offset))
	if err != nil {
		http.Error(w, "failed to get public events", http.StatusInternalServerError)
		return
	}

	var response []PublicEventListResponse
	for _, event := range events {
		response = append(response, PublicEventListResponse{
			ID:           event.ID,
			Title:        event.Title,
			ShortDesc:    event.ShortDesc,
			EventDate:    event.Date,
			Location:     event.Location,
			Status:       event.Status,
			MainPhotoURL: event.MainPhotoURL,
		})
	}

	if response == nil {
		response = []PublicEventListResponse{}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *EventHandler) GetPublicEvent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid event id", http.StatusBadRequest)
		return
	}

	event, err := h.service.GetPublicEvent(r.Context(), int32(id))
	if err != nil {
		http.Error(w, "failed to get public event", http.StatusInternalServerError)
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

	response := PublicEventResponse{
		ID:              event.ID,
		Title:           event.Title,
		ShortDesc:       event.ShortDesc,
		Content:         event.Content,
		EventDate:       event.Date,
		Location:        event.Location,
		RegistrationURL: event.RegistrationURL,
		Status:          event.Status,
		Photos:          photos,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
