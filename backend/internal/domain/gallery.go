package domain

import (
	"context"
)

type GalleryAlbum struct {
	ID             int32
	Title          string
	CoverImagePath *string
	IsPublished    bool
	PhotoCount     int32
}

type GalleryPhoto struct {
	ID           int32
	AlbumID      int32
	ImagePath    string
	DisplayOrder int32
}

type GalleryRepository interface {
	CreateAlbum(ctx context.Context, album *GalleryAlbum) error
	UpdateAlbum(ctx context.Context, album *GalleryAlbum) error
	DeleteAlbum(ctx context.Context, id int32) error

	GetAdminAlbumByID(ctx context.Context, id int32) (*GalleryAlbum, error)
	GetPublicAlbumByID(ctx context.Context, id int32) (*GalleryAlbum, error)
	GetAdminAlbumsList(ctx context.Context, limit, offset int32) ([]GalleryAlbum, error)
	GetPublicAlbumsList(ctx context.Context, limit, offset int32) ([]GalleryAlbum, error)

	AddGalleryPhoto(ctx context.Context, photo *GalleryPhoto) error
	UpdateGalleryPhoto(ctx context.Context, photo *GalleryPhoto) error
	DeleteGalleryPhoto(ctx context.Context, id int32) error
	SoftDeleteGalleryPhotos(ctx context.Context, id int32, retainedIDs []int32) error

	GetGalleryPhotosListByAlbumID(ctx context.Context, albumID int32, limit, offset int32) ([]GalleryPhoto, error)

	DeleteOrphanedGalleryPhotos(ctx context.Context) ([]GalleryPhoto, error)
}
