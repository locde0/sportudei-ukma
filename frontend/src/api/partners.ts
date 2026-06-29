import { apiClient } from './client';
import type { Partner } from '../types/partner';
import { bool, num, optionalStr, str } from '../utils/normalizeApi';

const PUBLIC_PATH = '/partners';
const ADMIN_PATH = '/admin/partners';

function mapPartner(raw: Record<string, unknown>): Partner {
  return {
    id: num(raw.id),
    name: str(raw.name),
    logo_url: str(raw.logo_path ?? raw.logo_url),
    link_url: optionalStr(raw.url ?? raw.link_url),
    is_active: bool(raw.is_active, true),
    display_order: num(raw.display_order),
  };
}

export async function fetchPublicPartners(): Promise<Partner[]> {
  const { data } = await apiClient.get<{ partners: Record<string, unknown>[] }>(PUBLIC_PATH);
  return (data?.partners ?? []).map(mapPartner);
}

export async function fetchAdminPartners(): Promise<Partner[]> {
  const { data } = await apiClient.get<{ partners: Record<string, unknown>[] }>(ADMIN_PATH);
  return (data?.partners ?? []).map(mapPartner);
}

export async function createPartner(formData: FormData): Promise<void> {
  await apiClient.post(ADMIN_PATH, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function updatePartner(id: number, formData: FormData): Promise<void> {
  await apiClient.put(`${ADMIN_PATH}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deletePartner(id: number): Promise<void> {
  await apiClient.delete(`${ADMIN_PATH}/${id}`);
}

export async function updatePartnerOrder(id: number, displayOrder: number): Promise<void> {
  await apiClient.put(`${ADMIN_PATH}/${id}/order`, { display_order: displayOrder });
}

export function buildPartnerFormData(fields: {
  name: string;
  link_url: string;
  is_active: boolean;
  display_order?: number;
  logo?: File | null;
}): FormData {
  const formData = new FormData();
  formData.append(
    'payload',
    JSON.stringify({
      name: fields.name,
      url: fields.link_url || null,
      is_active: fields.is_active,
      display_order: fields.display_order ?? 0,
    }),
  );
  if (fields.logo) formData.append('photo', fields.logo);
  return formData;
}
