package service

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	gen "github.com/locde0/sportudei-ukma/backend/db/generated"
	"github.com/locde0/sportudei-ukma/backend/internal/db"
)

type GalleryService struct {
	store *db.Store
}

func NewGalleryService(store *db.Store) *GalleryService {
	return &GalleryService{store: store}
}

type GalleryAlbumDto struct {
	ID            int32
	Title         string
	CoverPhotoURL *string
	IsPublished   bool
	PhotoCount    int32
}

type GalleryPhotoDto struct {
	ID           int32
	AlbumID      int32
	ImageURL     string
	DisplayOrder int32
}

func (s *GalleryService) savePhoto(fileHeader *multipart.FileHeader) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	ext := filepath.Ext(fileHeader.Filename)
	newFilename := fmt.Sprintf("gallery_%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join("uploads", newFilename)

	dst, err := os.Create(savePath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to save file content: %w", err)
	}

	return "/" + filepath.ToSlash(savePath), nil
}

func (s *GalleryService) ListPublicAlbums(ctx context.Context, limit, offset int32) ([]GalleryAlbumDto, error) {
	albums, err := s.store.GetPublicAlbums(ctx, gen.GetPublicAlbumsParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get public albums: %w", err)
	}

	var dtos []GalleryAlbumDto
	for _, a := range albums {
		dtos = append(dtos, GalleryAlbumDto{
			ID:            a.ID,
			Title:         a.Title,
			CoverPhotoURL: fromPgText(a.CoverPhotoUrl),
			IsPublished:   a.IsPublished,
			PhotoCount:    a.PhotoCount,
		})
	}
	return dtos, nil
}

func (s *GalleryService) ListAdminAlbums(ctx context.Context, limit, offset int32) ([]GalleryAlbumDto, error) {
	albums, err := s.store.GetAdminAlbums(ctx, gen.GetAdminAlbumsParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get admin albums: %w", err)
	}

	var dtos []GalleryAlbumDto
	for _, a := range albums {
		dtos = append(dtos, GalleryAlbumDto{
			ID:            a.ID,
			Title:         a.Title,
			CoverPhotoURL: fromPgText(a.CoverPhotoUrl),
			IsPublished:   a.IsPublished,
			PhotoCount:    a.PhotoCount,
		})
	}
	return dtos, nil
}

func (s *GalleryService) GetAlbum(ctx context.Context, id int32) (GalleryAlbumDto, []GalleryPhotoDto, error) {
	album, err := s.store.GetAlbum(ctx, id)
	if err != nil {
		return GalleryAlbumDto{}, nil, fmt.Errorf("failed to get album: %w", err)
	}

	photos, err := s.store.GetAlbumPhotos(ctx, id)
	if err != nil {
		return GalleryAlbumDto{}, nil, fmt.Errorf("failed to get album photos: %w", err)
	}

	albumDto := GalleryAlbumDto{
		ID:            album.ID,
		Title:         album.Title,
		CoverPhotoURL: fromPgText(album.CoverPhotoUrl),
		IsPublished:   album.IsPublished,
		PhotoCount:    int32(len(photos)),
	}

	var photoDtos []GalleryPhotoDto
	for _, p := range photos {
		photoDtos = append(photoDtos, GalleryPhotoDto{
			ID:           p.ID,
			AlbumID:      p.AlbumID,
			ImageURL:     p.ImageUrl,
			DisplayOrder: p.DisplayOrder,
		})
	}

	return albumDto, photoDtos, nil
}

func (s *GalleryService) CreateAlbum(ctx context.Context, title string, isPublished bool) (int32, error) {
	id, err := s.store.CreateAlbum(ctx, gen.CreateAlbumParams{
		Title:       title,
		IsPublished: isPublished,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to create album: %w", err)
	}
	return id, nil
}

func (s *GalleryService) UpdateAlbum(ctx context.Context, id int32, title string, isPublished bool, photos []UpdatePhotoDto) error {
	existingPhotos, err := s.store.GetAlbumPhotos(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get existing photos: %w", err)
	}

	reqPhotosMap := make(map[int32]UpdatePhotoDto)
	var coverPhotoURL *string

	for _, p := range photos {
		reqPhotosMap[p.ID] = p
	}

	for _, ep := range existingPhotos {
		if reqPhoto, exists := reqPhotosMap[ep.ID]; exists {
			err := s.store.UpdateAlbumPhoto(ctx, gen.UpdateAlbumPhotoParams{
				DisplayOrder: reqPhoto.DisplayOrder,
				ID:           ep.ID,
				AlbumID:      id,
			})
			if err != nil {
				return fmt.Errorf("failed to update photo order: %w", err)
			}
			if reqPhoto.IsMain {
				url := ep.ImageUrl
				coverPhotoURL = &url
			}
		} else {
			err := s.store.DeleteAlbumPhoto(ctx, ep.ID)
			if err != nil {
				return fmt.Errorf("failed to delete removed photo: %w", err)
			}
		}
	}

	err = s.store.UpdateAlbum(ctx, gen.UpdateAlbumParams{
		ID:            id,
		Title:         title,
		IsPublished:   isPublished,
		CoverPhotoUrl: toPgText(coverPhotoURL),
	})
	if err != nil {
		return fmt.Errorf("failed to update album details: %w", err)
	}

	return nil
}

func (s *GalleryService) DeleteAlbum(ctx context.Context, id int32) error {
	err := s.store.DeleteAlbum(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete album: %w", err)
	}
	return nil
}

func (s *GalleryService) UploadAlbumPhoto(ctx context.Context, albumID int32, photo *multipart.FileHeader) (GalleryPhotoDto, error) {
	photoURL, err := s.savePhoto(photo)
	if err != nil {
		return GalleryPhotoDto{}, err
	}

	existingPhotos, _ := s.store.GetAlbumPhotos(ctx, albumID)
	nextOrder := int32(len(existingPhotos))

	newPhoto, err := s.store.AddAlbumPhoto(ctx, gen.AddAlbumPhotoParams{
		AlbumID:      albumID,
		ImageUrl:     photoURL,
		DisplayOrder: nextOrder,
	})
	if err != nil {
		return GalleryPhotoDto{}, fmt.Errorf("failed to add photo to db: %w", err)
	}

	return GalleryPhotoDto{
		ID:           newPhoto.ID,
		AlbumID:      albumID,
		ImageURL:     newPhoto.ImageUrl,
		DisplayOrder: newPhoto.DisplayOrder,
	}, nil
}
