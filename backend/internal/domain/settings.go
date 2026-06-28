package domain

import (
	"context"
)

type Settings struct {
	IsEventsEnabled     bool
	IsGalleryEnabled    bool
	IsContactsEnabled   bool
	IsPartnersEnabled   bool
	IsTeamsEnabled      bool
	IsMohylaGameEnabled bool
}

type SettingsRepository interface {
	GetSettings(ctx context.Context) (*Settings, error)
	UpdateSettings(ctx context.Context, settings *Settings) error
}
