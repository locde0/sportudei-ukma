import { apiClient } from './client';
import type { Team } from '../types/team';
import { bool, num, str } from '../utils/normalizeApi';

function mapTeam(raw: Record<string, unknown>): Team {
  return {
    id: num(raw.id ?? raw.ID),
    name: str(raw.name ?? raw.Name),
    logo_url: str(raw.logo_url ?? raw.LogoURL),
    description: str(raw.description ?? raw.Description),
    is_active: bool(raw.is_active ?? raw.IsActive, true),
  };
}

export async function fetchTeams(): Promise<Team[]> {
  const { data } = await apiClient.get<Record<string, unknown>[]>('/teams');
  return (data ?? []).map(mapTeam);
}

export async function createTeam(formData: FormData): Promise<{ id: number }> {
  const { data } = await apiClient.post<{ id: number }>('/admin/teams', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateTeam(id: number, formData: FormData): Promise<void> {
  await apiClient.put(`/admin/teams/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteTeam(id: number): Promise<void> {
  await apiClient.delete(`/admin/teams/${id}`);
}

export function buildTeamFormData(fields: {
  name: string;
  description: string;
  is_active: boolean;
  logo?: File | null;
}): FormData {
  const formData = new FormData();
  formData.append('name', fields.name);
  formData.append('description', fields.description);
  formData.append('is_active', String(fields.is_active));
  if (fields.logo) formData.append('logo', fields.logo);
  return formData;
}
