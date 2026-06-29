import { apiClient } from './client';
import type { MohylaGame, UpdateMohylaGamePayload } from '../types/game';
import { str } from '../utils/normalizeApi';

function mapMohylaGame(raw: Record<string, unknown>): MohylaGame {
  return {
    title: str(raw.title),
    description: str(raw.description ?? raw.short_description),
    content: str(raw.content),
  };
}

export async function fetchMohylaGame(): Promise<MohylaGame> {
  const { data } = await apiClient.get<Record<string, unknown>>('/mohyla-game');
  return mapMohylaGame(data ?? {});
}

export async function updateMohylaGame(payload: UpdateMohylaGamePayload): Promise<void> {
  await apiClient.put('/admin/mohyla_game', payload);
}
