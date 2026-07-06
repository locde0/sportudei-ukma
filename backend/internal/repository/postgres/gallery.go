package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type GalleryRepo struct {
	tx *TxManager
}

func NewGalleryRepo(tx *TxManager) *GalleryRepo {
	return &GalleryRepo{tx: tx}
}

func (r *GalleryRepo) CreateAlbum(ctx context.Context, album *domain.GalleryAlbum) error {
	row, err := r.tx.Q(ctx).CreateGalleryAlbum(ctx, gen.CreateGalleryAlbumParams{
		Title:          album.Title,
		IsPublished:    album.IsPublished,
		CoverImagePath: album.CoverImagePath,
	})
	if err != nil {
		return err
	}

	album.ID = row.ID

	return nil
}

func (r *GalleryRepo) UpdateAlbum(ctx context.Context, album *domain.GalleryAlbum) error {
	return r.tx.Q(ctx).UpdateGalleryAlbum(ctx, gen.UpdateGalleryAlbumParams{
		ID:             album.ID,
		Title:          album.Title,
		IsPublished:    album.IsPublished,
		CoverImagePath: album.CoverImagePath,
	})
}

func (r *GalleryRepo) DeleteAlbum(ctx context.Context, id int32) error {
	return r.tx.Q(ctx).DeleteGalleryAlbum(ctx, id)
}

func (r *GalleryRepo) GetAdminAlbumByID(ctx context.Context, id int32) (*domain.GalleryAlbum, error) {
	row, err := r.tx.Q(ctx).GetAlbumByID(ctx, gen.GetAlbumByIDParams{
		ID:      id,
		ShowAll: true,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get admin album by id: %w", err)
	}
	res := r.toGalleryAlbumDomain(&row)
	return &res, nil
}

func (r *GalleryRepo) GetPublicAlbumByID(ctx context.Context, id int32) (*domain.GalleryAlbum, error) {
	row, err := r.tx.Q(ctx).GetAlbumByID(ctx, gen.GetAlbumByIDParams{
		ID:      id,
		ShowAll: false,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get public album by id: %w", err)
	}
	res := r.toGalleryAlbumDomain(&row)
	return &res, nil
}

func (r *GalleryRepo) GetAdminAlbumsList(ctx context.Context, limit, offset int32) ([]domain.GalleryAlbum, error) {
	rows, err := r.tx.Q(ctx).GetAlbumsList(ctx, gen.GetAlbumsListParams{
		Limit:   limit,
		Offset:  offset,
		ShowAll: true,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get admin albums list: %w", err)
	}
	return mapSlice(rows, r.toGalleryAlbumsListDomain), nil
}

func (r *GalleryRepo) GetPublicAlbumsList(ctx context.Context, limit, offset int32) ([]domain.GalleryAlbum, error) {
	rows, err := r.tx.Q(ctx).GetAlbumsList(ctx, gen.GetAlbumsListParams{
		Limit:   limit,
		Offset:  offset,
		ShowAll: false,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get public albums list: %w", err)
	}
	return mapSlice(rows, r.toGalleryAlbumsListDomain), nil
}

func (r *GalleryRepo) AddGalleryPhoto(ctx context.Context, photo *domain.GalleryPhoto) error {
	row, err := r.tx.Q(ctx).AddGalleryPhoto(ctx, gen.AddGalleryPhotoParams{
		AlbumID:      photo.AlbumID,
		ImagePath:    photo.ImagePath,
		DisplayOrder: photo.DisplayOrder,
	})
	if err != nil {
		return err
	}

	photo.ID = row.ID

	return nil
}

func (r *GalleryRepo) UpdateGalleryPhoto(ctx context.Context, photo *domain.GalleryPhoto) error {
	return r.tx.Q(ctx).UpdateGalleryPhoto(ctx, gen.UpdateGalleryPhotoParams{
		ID:           photo.ID,
		AlbumID:      photo.AlbumID,
		DisplayOrder: photo.DisplayOrder,
	})
}

func (r *GalleryRepo) DeleteGalleryPhoto(ctx context.Context, id int32) error {
	return r.tx.Q(ctx).DeleteGalleryPhoto(ctx, id)
}

func (r *GalleryRepo) SoftDeleteGalleryPhotos(ctx context.Context, id int32, retainedIDs []int32) error {
	return r.tx.Q(ctx).SoftDeleteGalleryPhotos(ctx, gen.SoftDeleteGalleryPhotosParams{
		AlbumID:     id,
		RetainedIds: retainedIDs,
	})
}

func (r *GalleryRepo) GetGalleryPhotosListByAlbumID(ctx context.Context, albumID int32, limit, offset int32) ([]domain.GalleryPhoto, error) {
	rows, err := r.tx.Q(ctx).GetGalleryPhotosByAlbumID(ctx, gen.GetGalleryPhotosByAlbumIDParams{
		AlbumID: albumID,
		Limit:   limit,
		Offset:  offset,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get gallery photos list by album id: %w", err)
	}
	return mapSlice(rows, r.toGalleryPhotoDomain), nil
}

func (r *GalleryRepo) DeleteOrphanedGalleryPhotos(ctx context.Context) ([]domain.GalleryPhoto, error) {
	photos, err := r.tx.Q(ctx).DeleteOrphanedGalleryPhotos(ctx)
	if err != nil {
		return nil, fmt.Errorf("delete orphaned gallery photos: %w", err)
	}

	return mapSlice(photos, r.toGalleryPhotoDomain), nil
}

func (r *GalleryRepo) toGalleryAlbumDomain(row *gen.GalleryAlbum) domain.GalleryAlbum {
	return domain.GalleryAlbum{
		ID:             row.ID,
		Title:          row.Title,
		CoverImagePath: row.CoverImagePath,
		IsPublished:    row.IsPublished,
	}
}

func (r *GalleryRepo) toGalleryAlbumsListDomain(row *gen.GetAlbumsListRow) domain.GalleryAlbum {
	return domain.GalleryAlbum{
		ID:             row.GalleryAlbum.ID,
		Title:          row.GalleryAlbum.Title,
		CoverImagePath: row.GalleryAlbum.CoverImagePath,
		IsPublished:    row.GalleryAlbum.IsPublished,
		PhotoCount:     row.PhotoCount,
	}
}

func (r *GalleryRepo) toGalleryPhotoDomain(row *gen.GalleryPhoto) domain.GalleryPhoto {
	return domain.GalleryPhoto{
		ID:           row.ID,
		AlbumID:      row.AlbumID,
		ImagePath:    row.ImagePath,
		DisplayOrder: row.DisplayOrder,
	}
}
