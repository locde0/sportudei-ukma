import { apiClient } from './client';
import type { MohylaGame, UpdateMohylaGamePayload } from '../types/game';
import { bool, num, str } from '../utils/normalizeApi';

export const MOHYLA_GAME_ID = 1;

function mapMohylaGame(raw: Record<string, unknown>): MohylaGame {
  return {
    id: num(raw.id ?? raw.ID),
    title: str(raw.title ?? raw.Title),
    short_description: str(raw.short_description ?? raw.ShortDesc),
    content: str(raw.content ?? raw.Content),
  };
}

export async function fetchMohylaGame(id = MOHYLA_GAME_ID): Promise<MohylaGame> {
  const { data } = await apiClient.get<Record<string, unknown>>(`/mohyla-games/${id}`);
  return mapMohylaGame(data);
}

export async function updateMohylaGame(
  id: number,
  payload: UpdateMohylaGamePayload,
): Promise<void> {
  await apiClient.put(`/admin/mohyla-games/${id}`, {
    Title: payload.title,
    ShortDesc: payload.short_description,
    Content: payload.content,
  });
}
