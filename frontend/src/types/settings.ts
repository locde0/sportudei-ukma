export interface SiteSettings {
  is_mohyla_games_enabled: boolean;
  is_schedule_enabled: boolean;
  is_teams_enabled: boolean;
  is_partners_enabled: boolean;
  is_gallery_enabled: boolean;
  is_contacts_enabled: boolean;
}

export type UpdateSiteSettingsPayload = SiteSettings;
