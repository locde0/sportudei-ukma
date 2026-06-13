package service

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/locde0/sportudei-ukma/backend/db/generated"
	"github.com/locde0/sportudei-ukma/backend/internal/db"
)

type PartnerService struct {
	store *db.Store
}

func NewPartnerService(store *db.Store) *PartnerService {
	return &PartnerService{store: store}
}

type PartnerDto struct {
	ID           int32
	Name         string
	LogoURL      string
	LinkURL      *string
	IsActive     bool
	DisplayOrder int32
}

func (s *PartnerService) saveLogo(fileHeader *multipart.FileHeader) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	ext := filepath.Ext(fileHeader.Filename)
	newFilename := fmt.Sprintf("partner_%d%s", time.Now().UnixNano(), ext)
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

func (s *PartnerService) ListPublicPartners(ctx context.Context) ([]PartnerDto, error) {
	partners, err := s.store.GetPublicPartners(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get public partners: %w", err)
	}

	var dtos []PartnerDto
	for _, p := range partners {
		dtos = append(dtos, PartnerDto{
			ID:           p.ID,
			Name:         p.Name,
			LogoURL:      p.LogoUrl,
			LinkURL:      fromPgText(p.LinkUrl),
			IsActive:     p.IsActive,
			DisplayOrder: p.DisplayOrder,
		})
	}
	return dtos, nil
}

func (s *PartnerService) ListAdminPartners(ctx context.Context) ([]PartnerDto, error) {
	partners, err := s.store.GetAdminPartners(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get admin partners: %w", err)
	}

	var dtos []PartnerDto
	for _, p := range partners {
		dtos = append(dtos, PartnerDto{
			ID:           p.ID,
			Name:         p.Name,
			LogoURL:      p.LogoUrl,
			LinkURL:      fromPgText(p.LinkUrl),
			IsActive:     p.IsActive,
			DisplayOrder: p.DisplayOrder,
		})
	}
	return dtos, nil
}

func (s *PartnerService) CreatePartner(ctx context.Context, dto PartnerDto, logo *multipart.FileHeader) (int32, error) {
	logoURL, err := s.saveLogo(logo)
	if err != nil {
		return 0, err
	}

	id, err := s.store.CreatePartner(ctx, gen.CreatePartnerParams{
		Name:         dto.Name,
		LogoUrl:      logoURL,
		LinkUrl:      toPgText(dto.LinkURL),
		IsActive:     dto.IsActive,
		DisplayOrder: dto.DisplayOrder,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to create partner in db: %w", err)
	}

	return id, nil
}

func (s *PartnerService) UpdatePartner(ctx context.Context, id int32, dto PartnerDto, logo *multipart.FileHeader) error {
	logoURL := dto.LogoURL
	if logo != nil {
		newLogoURL, err := s.saveLogo(logo)
		if err != nil {
			return err
		}
		logoURL = newLogoURL
	} else {
		partners, err := s.store.GetAdminPartners(ctx)
		if err == nil {
			for _, p := range partners {
				if p.ID == id {
					logoURL = p.LogoUrl
					break
				}
			}
		}
	}

	err := s.store.UpdatePartner(ctx, gen.UpdatePartnerParams{
		ID:       id,
		Name:     dto.Name,
		LogoUrl:  logoURL,
		LinkUrl:  toPgText(dto.LinkURL),
		IsActive: dto.IsActive,
	})
	if err != nil {
		return fmt.Errorf("failed to update partner in db: %w", err)
	}

	return nil
}

func (s *PartnerService) DeletePartner(ctx context.Context, id int32) error {
	err := s.store.DeletePartner(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete partner: %w", err)
	}
	return nil
}

func (s *PartnerService) UpdatePartnerOrder(ctx context.Context, orderedIDs []int32) error {
	for i, id := range orderedIDs {
		err := s.store.UpdatePartnerOrder(ctx, gen.UpdatePartnerOrderParams{
			ID:           id,
			DisplayOrder: int32(i),
		})
		if err != nil {
			return fmt.Errorf("failed to update partner order for id %d: %w", id, err)
		}
	}
	return nil
}
