package service

import (
	"context"
	"fmt"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type SettingsService struct {
	settings domain.SettingsRepository
}

func NewSettingsService(settings domain.SettingsRepository) *SettingsService {
	return &SettingsService{
		settings: settings,
	}
}

func (s *SettingsService) GetSettings(ctx context.Context) (*domain.Settings, error) {
	settings, err := s.settings.GetSettings(ctx)
	if err != nil {
		return nil, fmt.Errorf("get settings: %w", err)
	}

	return settings, nil
}

func (s *SettingsService) UpdateSettings(ctx context.Context, settings *domain.Settings) error {
	if err := s.settings.UpdateSettings(ctx, settings); err != nil {
		return fmt.Errorf("update settings: %w", err)
	}

	return nil
}
