export interface SiteSettings {
  is_events_enabled: boolean;
  is_mohyla_game_enabled: boolean;
  is_teams_enabled: boolean;
  is_partners_enabled: boolean;
  is_gallery_enabled: boolean;
  is_contacts_enabled: boolean;
}

export type UpdateSiteSettingsPayload = SiteSettings;
