package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type GalleryService struct {
	gallery domain.GalleryRepository
	tx      domain.TxManager
	storage domain.FileStorage
	log     *slog.Logger
}

func NewGalleryService(
	gallery domain.GalleryRepository,
	tx domain.TxManager,
	storage domain.FileStorage,
	log *slog.Logger,
) *GalleryService {
	return &GalleryService{
		gallery: gallery,
		tx:      tx,
		storage: storage,
		log:     log,
	}
}

func (s *GalleryService) CreateAlbum(ctx context.Context, album *domain.GalleryAlbum, file *domain.File) error {
	if err := s.gallery.CreateAlbum(ctx, album); err != nil {
		return fmt.Errorf("create gallery album: %w", err)
	}

	if file == nil {
		return nil
	}

	folderPath := fmt.Sprintf("albums/%d", album.ID)
	path, err := s.storage.Upload(ctx, *file, folderPath)
	if err != nil {
		s.log.Error("upload initial album photo", slog.String("error", err.Error()))
		return nil
	}

	photo := &domain.GalleryPhoto{
		AlbumID:      album.ID,
		ImagePath:    path,
		DisplayOrder: 0,
	}
	if err := s.gallery.AddGalleryPhoto(ctx, photo); err != nil {
		s.log.Error("save initial photo to db", slog.String("error", err.Error()))
		return nil
	}

	album.CoverImagePath = &path

	if err := s.gallery.UpdateAlbum(ctx, album); err != nil {
		s.log.Error("update album cover", slog.String("error", err.Error()))
	}

	return nil
}

func (s *GalleryService) UpdateAlbum(ctx context.Context, album *domain.GalleryAlbum, photos []domain.GalleryPhoto) error {
	return s.tx.ExecTx(ctx, func(txCtx context.Context) error {
		if err := s.gallery.UpdateAlbum(txCtx, album); err != nil {
			return fmt.Errorf("update gallery album: %w", err)
		}

		retainedIDs := make([]int32, 0, len(photos))
		for _, photo := range photos {
			retainedIDs = append(retainedIDs, photo.ID)

			if err := s.gallery.UpdateGalleryPhoto(txCtx, &photo); err != nil {
				return fmt.Errorf("update gallery photo %d: %w", photo.ID, err)
			}
		}

		if err := s.gallery.SoftDeleteGalleryPhotos(txCtx, album.ID, retainedIDs); err != nil {
			return fmt.Errorf("soft delete gallery photos: %w", err)
		}

		return nil
	})
}

func (s *GalleryService) DeleteAlbum(ctx context.Context, id int32) error {
	if err := s.gallery.DeleteAlbum(ctx, id); err != nil {
		return fmt.Errorf("delete gallery album: %w", err)
	}

	folderPath := fmt.Sprintf("albums/%d", id)

	if err := s.storage.DeleteDir(ctx, folderPath); err != nil {
		s.log.Warn("delete event directory from storage",
			slog.Int("album_id", int(id)),
			slog.String("error", err.Error()),
		)
	}

	return nil
}

func (s *GalleryService) GetAdminAlbum(ctx context.Context, id int32) (*domain.GalleryAlbum, error) {
	album, err := s.gallery.GetAdminAlbumByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get admin gallery album: %w", err)
	}

	return album, nil
}

func (s *GalleryService) GetPublicAlbum(ctx context.Context, id int32) (*domain.GalleryAlbum, error) {
	album, err := s.gallery.GetPublicAlbumByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get public gallery album: %w", err)
	}

	return album, nil
}

func (s *GalleryService) ListAdminAlbums(ctx context.Context, limit, offset int32) ([]domain.GalleryAlbum, error) {
	albums, err := s.gallery.GetAdminAlbumsList(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("get admin albums list: %w", err)
	}

	return albums, nil
}

func (s *GalleryService) ListPublicAlbums(ctx context.Context, limit, offset int32) ([]domain.GalleryAlbum, error) {
	albums, err := s.gallery.GetPublicAlbumsList(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("get public albums list: %w", err)
	}

	return albums, nil
}

func (s *GalleryService) GetAlbumPhotos(ctx context.Context, id, limit, offset int32) ([]domain.GalleryPhoto, error) {
	photos, err := s.gallery.GetGalleryPhotosListByAlbumID(ctx, id, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("get gallery photos: %w", err)
	}

	return photos, nil
}

func (s *GalleryService) UploadAlbumPhoto(ctx context.Context, albumID int32, file domain.File) (*domain.GalleryPhoto, error) {
	folderPath := fmt.Sprintf("albums/%d", albumID)

	path, err := s.storage.Upload(ctx, file, folderPath)
	if err != nil {
		return nil, fmt.Errorf("upload gallery photo: %w", err)
	}

	photo := &domain.GalleryPhoto{
		AlbumID:      albumID,
		ImagePath:    path,
		DisplayOrder: -1,
	}
	if err := s.gallery.AddGalleryPhoto(ctx, photo); err != nil {
		return nil, fmt.Errorf("add gallery photo: %w", err)
	}

	return photo, nil
}

func (s *GalleryService) CleanupOrphanedGalleryPhotos(ctx context.Context) error {
	photos, err := s.gallery.DeleteOrphanedGalleryPhotos(ctx)
	if err != nil {
		return err
	}

	for _, photo := range photos {
		if err := s.storage.Delete(ctx, photo.ImagePath); err != nil {
			s.log.Error("failed to delete orphaned gallery photo from storage",
				slog.String("image_path", photo.ImagePath),
				slog.String("error", err.Error()),
			)
		}
	}

	return nil
}
