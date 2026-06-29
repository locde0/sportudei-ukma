import { apiClient } from './client';
import type { Team } from '../types/team';
import { bool, num, str } from '../utils/normalizeApi';

function mapTeam(raw: Record<string, unknown>): Team {
  return {
    id: num(raw.id),
    name: str(raw.name),
    logo_url: str(raw.logo_path ?? raw.logo_url),
    description: str(raw.description),
    is_active: bool(raw.is_active, true),
    display_order: num(raw.display_order),
  };
}

export async function fetchTeams(): Promise<Team[]> {
  const { data } = await apiClient.get<{ teams: Record<string, unknown>[] }>('/teams');
  return (data?.teams ?? []).map(mapTeam);
}

export async function fetchTeam(id: number): Promise<Team> {
  const { data } = await apiClient.get<Record<string, unknown>>(`/teams/${id}`);
  return mapTeam(data ?? {});
}

export async function fetchAdminTeams(): Promise<Team[]> {
  const { data } = await apiClient.get<{ teams: Record<string, unknown>[] }>('/admin/teams');
  return (data?.teams ?? []).map(mapTeam);
}

export async function fetchAdminTeam(id: number): Promise<Team> {
  const { data } = await apiClient.get<Record<string, unknown>>(`/admin/teams/${id}`);
  return mapTeam(data ?? {});
}

export async function createTeam(formData: FormData): Promise<void> {
  await apiClient.post('/admin/teams', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function updateTeam(id: number, formData: FormData): Promise<void> {
  await apiClient.put(`/admin/teams/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteTeam(id: number): Promise<void> {
  await apiClient.delete(`/admin/teams/${id}`);
}

export async function updateTeamOrder(id: number, displayOrder: number): Promise<void> {
  await apiClient.put(`/admin/teams/${id}/order`, { display_order: displayOrder });
}

export function buildTeamFormData(fields: {
  name: string;
  description: string;
  is_active: boolean;
  display_order?: number;
  logo?: File | null;
}): FormData {
  const formData = new FormData();
  formData.append(
    'payload',
    JSON.stringify({
      name: fields.name,
      description: fields.description,
      is_active: fields.is_active,
      display_order: fields.display_order ?? 0,
    }),
  );
  if (fields.logo) formData.append('photo', fields.logo);
  return formData;
}
