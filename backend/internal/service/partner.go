package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type PartnerService struct {
	partners domain.PartnerRepository
	storage  domain.FileStorage
	log      *slog.Logger
}

func NewPartnerService(partners domain.PartnerRepository, storage domain.FileStorage, log *slog.Logger) *PartnerService {
	return &PartnerService{
		partners: partners,
		storage:  storage,
		log:      log,
	}
}

func (s *PartnerService) CreatePartner(ctx context.Context, partner *domain.Partner, file *domain.File) error {
	path, err := s.storage.Upload(ctx, *file, "partners")
	if err != nil {
		return fmt.Errorf("upload partner logo: %w", err)
	}

	partner.LogoPath = path

	if err := s.partners.CreatePartner(ctx, partner); err != nil {
		_ = s.storage.Delete(ctx, path)
		return fmt.Errorf("create partner: %w", err)
	}

	return nil
}

func (s *PartnerService) UpdatePartner(ctx context.Context, partner *domain.Partner, file *domain.File) error {
	oldPartner, err := s.partners.GetAdminPartnerByID(ctx, partner.ID)
	if err != nil {
		return fmt.Errorf("get old partner: %w", err)
	}
	oldLogoPath := oldPartner.LogoPath

	if file != nil {
		path, err := s.storage.Upload(ctx, *file, "partners")
		if err != nil {
			return fmt.Errorf("upload new partner logo: %w", err)
		}
		partner.LogoPath = path
	} else {
		partner.LogoPath = oldLogoPath
	}

	if err := s.partners.UpdatePartner(ctx, partner); err != nil {
		if file != nil {
			_ = s.storage.Delete(ctx, partner.LogoPath)
		}
		return fmt.Errorf("update partner: %w", err)
	}

	if file != nil && oldLogoPath != "" {
		if err := s.storage.Delete(ctx, oldLogoPath); err != nil {
			s.log.Warn("delete old partner logo", slog.String("path", oldLogoPath))
		}
	}

	return nil
}

func (s *PartnerService) DeletePartner(ctx context.Context, id int32) error {
	partner, err := s.partners.GetAdminPartnerByID(ctx, id)
	if err != nil {
		return fmt.Errorf("get partner: %w", err)
	}

	if err := s.partners.DeletePartner(ctx, id); err != nil {
		return fmt.Errorf("delete partner: %w", err)
	}

	if err := s.storage.Delete(ctx, partner.LogoPath); err != nil {
		s.log.Warn("delete partner logo", slog.String("path", partner.LogoPath))
	}

	return nil
}

func (s *PartnerService) GetAdminPartner(ctx context.Context, id int32) (*domain.Partner, error) {
	partner, err := s.partners.GetAdminPartnerByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get admin partner: %w", err)
	}

	return partner, nil
}

func (s *PartnerService) ListAdminPartners(ctx context.Context) ([]domain.Partner, error) {
	partners, err := s.partners.GetAdminPartnersList(ctx)
	if err != nil {
		return nil, fmt.Errorf("get admin partners list: %w", err)
	}

	return partners, nil
}

func (s *PartnerService) ListPublicPartners(ctx context.Context) ([]domain.Partner, error) {
	partners, err := s.partners.GetPublicPartnersList(ctx)
	if err != nil {
		return nil, fmt.Errorf("get public partners list: %w", err)
	}

	return partners, nil
}

func (s *PartnerService) UpdatePartnerOrder(ctx context.Context, partner *domain.Partner) error {
	if err := s.partners.UpdatePartnerOrder(ctx, partner); err != nil {
		return fmt.Errorf("update partner order: %w", err)
	}

	return nil
}
