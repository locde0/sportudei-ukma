import { apiClient } from './client';
import type { SiteSettings, UpdateSiteSettingsPayload } from '../types/settings';
import { bool } from '../utils/normalizeApi';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  is_mohyla_games_enabled: true,
  is_schedule_enabled: true,
  is_teams_enabled: true,
  is_partners_enabled: true,
  is_gallery_enabled: true,
  is_contacts_enabled: true,
};

function mapSiteSettings(raw: Record<string, unknown>): SiteSettings {
  return {
    is_mohyla_games_enabled: bool(
      raw.is_mohyla_games_enabled ?? raw.IsMohylaGamesEnabled,
      true,
    ),
    is_schedule_enabled: bool(raw.is_schedule_enabled ?? raw.IsScheduleEnabled, true),
    is_teams_enabled: bool(raw.is_teams_enabled ?? raw.IsTeamsEnabled, true),
    is_partners_enabled: bool(raw.is_partners_enabled ?? raw.IsPartnersEnabled, true),
    is_gallery_enabled: bool(raw.is_gallery_enabled ?? raw.IsGalleryEnabled, true),
    is_contacts_enabled: bool(raw.is_contacts_enabled ?? raw.IsContactsEnabled, true),
  };
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const { data } = await apiClient.get<Record<string, unknown>>('/settings');
    return mapSiteSettings(data);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function updateSiteSettings(payload: UpdateSiteSettingsPayload): Promise<void> {
  await apiClient.put('/admin/settings', payload);
}
