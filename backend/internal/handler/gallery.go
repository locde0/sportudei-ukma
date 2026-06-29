package handler

import (
	"net/http"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"github.com/locde0/sportudei-ukma/backend/internal/dto"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type GalleryHandler struct {
	service *service.GalleryService
}

func NewGalleryHandler(service *service.GalleryService) *GalleryHandler {
	return &GalleryHandler{
		service: service,
	}
}

// CreateAlbum godoc
// @Summary      Create album
// @Description  Create a new gallery album with a cover photo
// @Tags         admin-gallery
// @Accept       multipart/form-data
// @Produce      json
// @Param        payload formData string true "CreateGalleryAlbumRequest JSON string"
// @Param        photo formData file true "Cover photo"
// @Success      201 "Created"
// @Security     BearerAuth
// @Router       /api/admin/gallery [post]
func (h *GalleryHandler) CreateAlbum(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateGalleryAlbumRequest
	if err := httputil.ParseMultipartJSON(r, 10<<20, "payload", &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	album := &domain.GalleryAlbum{
		Title:       req.Title,
		IsPublished: req.IsPublished,
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

	if err := h.service.CreateAlbum(r.Context(), album, domainFile); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusCreated, nil)
}

// UpdateAlbum godoc
// @Summary      Update album
// @Description  Update an existing gallery album and its photos
// @Tags         admin-gallery
// @Accept       json
// @Produce      json
// @Param        id path int true "Album ID"
// @Param        request body dto.UpdateGalleryAlbumRequest true "Update data"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/gallery/{id} [put]
func (h *GalleryHandler) UpdateAlbum(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateGalleryAlbumRequest
	if err := httputil.ParseJSON(r, &req); err != nil {
		httputil.HandleError(w, err)
		return
	}

	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	album := &domain.GalleryAlbum{
		ID:             id,
		Title:          req.Title,
		CoverImagePath: req.CoverImagePath,
		IsPublished:    req.IsPublished,
	}

	var photos []domain.GalleryPhoto
	for _, photo := range req.Photos {
		photos = append(photos, domain.GalleryPhoto{
			ID:           photo.ID,
			AlbumID:      id,
			DisplayOrder: photo.DisplayOrder,
		})
	}

	if err := h.service.UpdateAlbum(r.Context(), album, photos); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// DeleteAlbum godoc
// @Summary      Delete album
// @Description  Delete an existing gallery album by ID
// @Tags         admin-gallery
// @Produce      json
// @Param        id path int true "Album ID"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/gallery/{id} [delete]
func (h *GalleryHandler) DeleteAlbum(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	if err := h.service.DeleteAlbum(r.Context(), id); err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSON(w, http.StatusOK, nil)
}

// UploadAlbumPhoto godoc
// @Summary      Upload album photo
// @Description  Upload an additional photo for an album
// @Tags         admin-gallery
// @Accept       multipart/form-data
// @Produce      json
// @Param        id path int true "Album ID"
// @Param        photo formData file true "Photo to upload"
// @Success      200 "OK"
// @Security     BearerAuth
// @Router       /api/admin/gallery/{id}/photos [post]
func (h *GalleryHandler) UploadAlbumPhoto(w http.ResponseWriter, r *http.Request) {
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

	photo, err := h.service.UploadAlbumPhoto(r.Context(), id, domainFile)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	res := dto.GalleryPhotoResponse{
		ID:           photo.ID,
		ImagePath:    photo.ImagePath,
		DisplayOrder: photo.DisplayOrder,
	}

	httputil.JSON(w, http.StatusOK, res)
}

// GetAdminAlbum godoc
// @Summary      Get admin album
// @Description  Get full album details for admin by ID
// @Tags         admin-gallery
// @Produce      json
// @Param        id path int true "Album ID"
// @Success      200 {object} dto.AdminGalleryAlbumResponse
// @Security     BearerAuth
// @Router       /api/admin/gallery/{id} [get]
func (h *GalleryHandler) GetAdminAlbum(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	album, err := h.service.GetAdminAlbum(r.Context(), id)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	base := dto.BaseGalleryAlbumResponse{
		ID:             id,
		Title:          album.Title,
		CoverImagePath: album.CoverImagePath,
	}
	res := &dto.AdminGalleryAlbumResponse{
		BaseGalleryAlbumResponse: base,
		IsPublished:              album.IsPublished,
	}

	httputil.JSON(w, http.StatusOK, res)
}

// GetPublicAlbum godoc
// @Summary      Get public album
// @Description  Get album details for public view by ID
// @Tags         public-gallery
// @Produce      json
// @Param        id path int true "Album ID"
// @Success      200 {object} dto.PublicGalleryAlbumResponse
// @Router       /api/gallery/{id} [get]
func (h *GalleryHandler) GetPublicAlbum(w http.ResponseWriter, r *http.Request) {
	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	album, err := h.service.GetPublicAlbum(r.Context(), id)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	res := &dto.PublicGalleryAlbumResponse{
		BaseGalleryAlbumResponse: dto.BaseGalleryAlbumResponse{
			ID:             id,
			Title:          album.Title,
			CoverImagePath: album.CoverImagePath,
		},
	}

	httputil.JSON(w, http.StatusOK, res)
}

// ListAdminAlbums godoc
// @Summary      List admin albums
// @Description  List all albums for admin view with pagination
// @Tags         admin-gallery
// @Produce      json
// @Param        limit query int false "Pagination limit" default(10)
// @Param        offset query int false "Pagination offset" default(0)
// @Success      200 {object} dto.AdminGalleryAlbumsListResponse
// @Security     BearerAuth
// @Router       /api/admin/gallery [get]
func (h *GalleryHandler) ListAdminAlbums(w http.ResponseWriter, r *http.Request) {
	pagination := httputil.ParsePagination(r, 10, 0)

	albums, err := h.service.ListAdminAlbums(r.Context(), pagination.Limit, pagination.Offset)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	list := make([]dto.AdminGalleryAlbumResponse, 0, len(albums))
	for _, album := range albums {
		base := dto.BaseGalleryAlbumResponse{
			ID:             album.ID,
			Title:          album.Title,
			CoverImagePath: album.CoverImagePath,
		}
		list = append(list, dto.AdminGalleryAlbumResponse{
			BaseGalleryAlbumResponse: base,
			IsPublished:              album.IsPublished,
		})
	}

	httputil.JSON(w, http.StatusOK, dto.AdminGalleryAlbumsListResponse{Albums: list})
}

// ListPublicAlbums godoc
// @Summary      List public albums
// @Description  List published albums for public view with pagination
// @Tags         public-gallery
// @Produce      json
// @Param        limit query int false "Pagination limit" default(6)
// @Param        offset query int false "Pagination offset" default(0)
// @Success      200 {object} dto.PublicGalleryAlbumsListResponse
// @Router       /api/gallery [get]
func (h *GalleryHandler) ListPublicAlbums(w http.ResponseWriter, r *http.Request) {
	pagination := httputil.ParsePagination(r, 6, 0)

	albums, err := h.service.ListPublicAlbums(r.Context(), pagination.Limit, pagination.Offset)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	list := make([]dto.PublicGalleryAlbumResponse, 0, len(albums))
	for _, album := range albums {
		base := dto.BaseGalleryAlbumResponse{
			ID:             album.ID,
			Title:          album.Title,
			CoverImagePath: album.CoverImagePath,
		}
		list = append(list, dto.PublicGalleryAlbumResponse{
			BaseGalleryAlbumResponse: base,
		})
	}

	httputil.JSON(w, http.StatusOK, dto.PublicGalleryAlbumsListResponse{Albums: list})
}

// GetAlbumPhotos godoc
// @Summary      Get album photos
// @Description  Get photos of an album with pagination
// @Tags         public-gallery
// @Produce      json
// @Param        id path int true "Album ID"
// @Param        limit query int false "Pagination limit" default(10)
// @Param        offset query int false "Pagination offset" default(0)
// @Success      200 {object} dto.GalleryPhotosListResponse
// @Router       /api/gallery/{id}/photos [get]
func (h *GalleryHandler) GetAlbumPhotos(w http.ResponseWriter, r *http.Request) {
	pagination := httputil.ParsePagination(r, 10, 0)

	id, err := httputil.ParseID(r, "id")
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	photos, err := h.service.GetAlbumPhotos(r.Context(), id, pagination.Limit, pagination.Offset)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	list := make([]dto.GalleryPhotoResponse, 0, len(photos))
	for _, photo := range photos {
		list = append(list, dto.GalleryPhotoResponse{
			ID:           photo.ID,
			ImagePath:    photo.ImagePath,
			DisplayOrder: photo.DisplayOrder,
		})
	}

	httputil.JSON(w, http.StatusOK, dto.GalleryPhotosListResponse{Photos: list})
}
