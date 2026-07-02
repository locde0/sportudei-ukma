package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type SettingsRepo struct {
	tx *TxManager
}

func NewSettingsRepo(tx *TxManager) *SettingsRepo {
	return &SettingsRepo{tx: tx}
}

func (r *SettingsRepo) GetSettings(ctx context.Context) (*domain.Settings, error) {
	row, err := r.tx.Q(ctx).GetSettings(ctx)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get settings: %w", err)
	}

	settings := r.toSettingsDomain(&row)
	return &settings, nil
}

func (r *SettingsRepo) UpdateSettings(ctx context.Context, settings *domain.Settings) error {
	err := r.tx.Q(ctx).UpdateSettings(ctx, gen.UpdateSettingsParams{
		IsEventsEnabled:     settings.IsEventsEnabled,
		IsGalleryEnabled:    settings.IsGalleryEnabled,
		IsContactsEnabled:   settings.IsContactsEnabled,
		IsPartnersEnabled:   settings.IsPartnersEnabled,
		IsTeamsEnabled:      settings.IsTeamsEnabled,
		IsMohylaGameEnabled: settings.IsMohylaGameEnabled,
	})
	if err != nil {
		return fmt.Errorf("update settings: %w", err)
	}
	return nil
}

func (r *SettingsRepo) toSettingsDomain(row *gen.Setting) domain.Settings {
	return domain.Settings{
		IsEventsEnabled:     row.IsEventsEnabled,
		IsGalleryEnabled:    row.IsGalleryEnabled,
		IsContactsEnabled:   row.IsContactsEnabled,
		IsPartnersEnabled:   row.IsPartnersEnabled,
		IsTeamsEnabled:      row.IsTeamsEnabled,
		IsMohylaGameEnabled: row.IsMohylaGameEnabled,
	}
}
