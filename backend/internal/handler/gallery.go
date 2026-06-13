package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type GalleryHandler struct {
	service *service.GalleryService
}

func NewGalleryHandler(s *service.GalleryService) *GalleryHandler {
	return &GalleryHandler{service: s}
}

func (h *GalleryHandler) RegisterRoutes(r chi.Router, authMw func(http.Handler) http.Handler) {
	r.Get("/api/gallery/albums", h.ListPublicAlbums)
	r.Get("/api/gallery/albums/{id}", h.GetAlbum)

	r.Route("/api/admin/gallery/albums", func(r chi.Router) {
		r.Use(authMw)
		r.Get("/", h.ListAdminAlbums)
		r.Post("/", h.CreateAlbum)
		r.Put("/{id}", h.UpdateAlbum)
		r.Delete("/{id}", h.DeleteAlbum)
		r.Post("/{id}/photos", h.UploadAlbumPhoto)
	})
}

func (h *GalleryHandler) ListPublicAlbums(w http.ResponseWriter, r *http.Request) {
	albums, err := h.service.ListPublicAlbums(r.Context(), 10, 0)
	if err != nil {
		http.Error(w, "failed to get public albums", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(albums)
}

func (h *GalleryHandler) ListAdminAlbums(w http.ResponseWriter, r *http.Request) {
	albums, err := h.service.ListAdminAlbums(r.Context(), 50, 0)
	if err != nil {
		http.Error(w, "failed to get admin albums", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(albums)
}

func (h *GalleryHandler) GetAlbum(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	album, photos, err := h.service.GetAlbum(r.Context(), int32(id))
	if err != nil {
		http.Error(w, "failed to get album", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"album":  album,
		"photos": photos,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *GalleryHandler) CreateAlbum(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title       string `json:"title"`
		IsPublished bool   `json:"is_published"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	id, err := h.service.CreateAlbum(r.Context(), req.Title, req.IsPublished)
	if err != nil {
		http.Error(w, "failed to create album", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int32{"id": id})
}

func (h *GalleryHandler) UpdateAlbum(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var req struct {
		Title       string                   `json:"title"`
		IsPublished bool                     `json:"is_published"`
		Photos      []service.UpdatePhotoDto `json:"photos"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateAlbum(r.Context(), int32(id), req.Title, req.IsPublished, req.Photos); err != nil {
		http.Error(w, "failed to update album", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *GalleryHandler) DeleteAlbum(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteAlbum(r.Context(), int32(id)); err != nil {
		http.Error(w, "failed to delete album", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *GalleryHandler) UploadAlbumPhoto(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "failed to parse form", http.StatusBadRequest)
		return
	}

	file, fileHeader, err := r.FormFile("photo")
	if err != nil {
		http.Error(w, "photo is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	photoDto, err := h.service.UploadAlbumPhoto(r.Context(), int32(id), fileHeader)
	if err != nil {
		http.Error(w, "failed to upload photo", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(photoDto)
}
