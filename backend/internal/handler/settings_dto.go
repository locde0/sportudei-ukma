package handler

type SiteSettingsResponse struct {
	IsMohylaGamesEnabled bool `json:"is_mohyla_games_enabled"`
	IsScheduleEnabled    bool `json:"is_schedule_enabled"`
	IsTeamsEnabled       bool `json:"is_teams_enabled"`
	IsPartnersEnabled    bool `json:"is_partners_enabled"`
	IsGalleryEnabled     bool `json:"is_gallery_enabled"`
	IsContactsEnabled    bool `json:"is_contacts_enabled"`
}

type UpdateSiteSettingsRequest struct {
	IsMohylaGamesEnabled bool `json:"is_mohyla_games_enabled"`
	IsScheduleEnabled    bool `json:"is_schedule_enabled"`
	IsTeamsEnabled       bool `json:"is_teams_enabled"`
	IsPartnersEnabled    bool `json:"is_partners_enabled"`
	IsGalleryEnabled     bool `json:"is_gallery_enabled"`
	IsContactsEnabled    bool `json:"is_contacts_enabled"`
}

type PartnerResponse struct {
	ID           int32   `json:"id"`
	Name         string  `json:"name"`
	LogoURL      string  `json:"logo_url"`
	LinkURL      *string `json:"link_url"`
	IsActive     bool    `json:"is_active"`
	DisplayOrder int32   `json:"display_order"`
}

type ContactResponse struct {
	ID           int32  `json:"id"`
	PlatformName string `json:"platform_name"`
	ContactValue string `json:"contact_value"`
	DisplayOrder int32  `json:"display_order"`
}
