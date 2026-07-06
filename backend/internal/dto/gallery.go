package dto

type BaseGalleryAlbumRequest struct {
	Title       string `json:"title" validate:"required,min=1,max=100"`
	IsPublished bool   `json:"is_published"`
}

type CreateGalleryAlbumRequest struct {
	BaseGalleryAlbumRequest
}

type UpdateGalleryAlbumRequest struct {
	BaseGalleryAlbumRequest
	CoverImagePath *string                     `json:"cover_image_path" validate:"omitempty"`
	Photos         []UpdateGalleryPhotoRequest `json:"photos" validate:"dive"`
}

type UpdateGalleryPhotoRequest struct {
	ID           int32 `json:"id" validate:"required,gt=0"`
	DisplayOrder int32 `json:"display_order" validate:"gte=-1"`
}

type GalleryPhotoResponse struct {
	ID           int32  `json:"id"`
	ImagePath    string `json:"image_path"`
	DisplayOrder int32  `json:"display_order"`
}

type GalleryPhotosListResponse struct {
	Photos []GalleryPhotoResponse `json:"photos"`
}

type BaseGalleryAlbumResponse struct {
	ID             int32   `json:"id"`
	Title          string  `json:"title"`
	CoverImagePath *string `json:"cover_image_path"`
	PhotoCount     int32   `json:"photo_count"`
}

type PublicGalleryAlbumResponse struct {
	BaseGalleryAlbumResponse
}

type PublicGalleryAlbumsListResponse struct {
	Albums []PublicGalleryAlbumResponse `json:"albums"`
}

type AdminGalleryAlbumResponse struct {
	BaseGalleryAlbumResponse
	IsPublished bool `json:"is_published"`
}

type AdminGalleryAlbumsListResponse struct {
	Albums []AdminGalleryAlbumResponse `json:"albums"`
}
