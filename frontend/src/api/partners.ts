import { apiClient } from './client';
import type { Partner } from '../types/partner';
import { bool, num, optionalStr, str } from '../utils/normalizeApi';

const PUBLIC_PATH = '/partners';
const ADMIN_PATH = '/admin/partners';

function mapPartner(raw: Record<string, unknown>): Partner {
  return {
    id: num(raw.id ?? raw.ID),
    name: str(raw.name ?? raw.Name),
    logo_url: str(raw.logo_url ?? raw.LogoURL),
    link_url: optionalStr(raw.link_url ?? raw.LinkURL),
    is_active: bool(raw.is_active ?? raw.IsActive, true),
    display_order: num(raw.display_order ?? raw.DisplayOrder),
  };
}

export async function fetchPublicPartners(): Promise<Partner[]> {
  const { data } = await apiClient.get<Record<string, unknown>[]>(PUBLIC_PATH);
  return (data ?? []).map(mapPartner);
}

export async function fetchAdminPartners(): Promise<Partner[]> {
  const { data } = await apiClient.get<Record<string, unknown>[]>(ADMIN_PATH);
  return (data ?? []).map(mapPartner);
}

export async function createPartner(formData: FormData): Promise<{ id: number }> {
  const { data } = await apiClient.post<{ id: number }>(ADMIN_PATH, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updatePartner(id: number, formData: FormData): Promise<void> {
  await apiClient.put(`${ADMIN_PATH}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deletePartner(id: number): Promise<void> {
  await apiClient.delete(`${ADMIN_PATH}/${id}`);
}

export async function updatePartnerOrder(orderedIds: number[]): Promise<void> {
  await apiClient.put(`${ADMIN_PATH}/order`, { ordered_ids: orderedIds });
}

export function buildPartnerFormData(fields: {
  name: string;
  link_url: string;
  is_active: boolean;
  logo?: File | null;
}): FormData {
  const formData = new FormData();
  formData.append('name', fields.name);
  if (fields.link_url) formData.append('link_url', fields.link_url);
  formData.append('is_active', String(fields.is_active));
  if (fields.logo) formData.append('logo', fields.logo);
  return formData;
}
