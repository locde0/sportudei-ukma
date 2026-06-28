package dto

type UpdateSettingsRequest struct {
	IsEventsEnabled     bool `json:"is_events_enabled"`
	IsGalleryEnabled    bool `json:"is_gallery_enabled"`
	IsContactsEnabled   bool `json:"is_contacts_enabled"`
	IsPartnersEnabled   bool `json:"is_partners_enabled"`
	IsTeamsEnabled      bool `json:"is_teams_enabled"`
	IsMohylaGameEnabled bool `json:"is_mohyla_game_enabled"`
}

type SettingsResponse struct {
	IsEventsEnabled     bool `json:"is_events_enabled"`
	IsGalleryEnabled    bool `json:"is_gallery_enabled"`
	IsContactsEnabled   bool `json:"is_contacts_enabled"`
	IsPartnersEnabled   bool `json:"is_partners_enabled"`
	IsTeamsEnabled      bool `json:"is_teams_enabled"`
	IsMohylaGameEnabled bool `json:"is_mohyla_game_enabled"`
}
