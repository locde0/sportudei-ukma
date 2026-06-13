package service

import (
	"context"
	"fmt"

	"github.com/locde0/sportudei-ukma/backend/db/generated"
	"github.com/locde0/sportudei-ukma/backend/internal/db"
)

type SettingsService struct {
	store *db.Store
}

func NewSettingsService(store *db.Store) *SettingsService {
	return &SettingsService{store: store}
}

type SiteSettingsDto struct {
	IsMohylaGamesEnabled bool
	IsScheduleEnabled    bool
	IsTeamsEnabled       bool
	IsPartnersEnabled    bool
	IsGalleryEnabled     bool
	IsContactsEnabled    bool
}

func (s *SettingsService) GetSettings(ctx context.Context) (SiteSettingsDto, error) {
	settings, err := s.store.GetSettings(ctx)
	if err != nil {
		return SiteSettingsDto{}, fmt.Errorf("failed to fetch site settings from db: %w", err)
	}

	return SiteSettingsDto{
		IsMohylaGamesEnabled: settings.IsMohylaGamesEnabled,
		IsScheduleEnabled:    settings.IsScheduleEnabled,
		IsTeamsEnabled:       settings.IsTeamsEnabled,
		IsPartnersEnabled:    settings.IsPartnersEnabled,
		IsGalleryEnabled:     settings.IsGalleryEnabled,
		IsContactsEnabled:    settings.IsContactsEnabled,
	}, nil
}

func (s *SettingsService) UpdateSettings(ctx context.Context, dto SiteSettingsDto) error {
	err := s.store.UpdateSettings(ctx, gen.UpdateSettingsParams{
		IsMohylaGamesEnabled: dto.IsMohylaGamesEnabled,
		IsScheduleEnabled:    dto.IsScheduleEnabled,
		IsTeamsEnabled:       dto.IsTeamsEnabled,
		IsPartnersEnabled:    dto.IsPartnersEnabled,
		IsGalleryEnabled:     dto.IsGalleryEnabled,
		IsContactsEnabled:    dto.IsContactsEnabled,
	})

	if err != nil {
		return fmt.Errorf("failed to update site settings in db: %w", err)
	}

	return nil
}
