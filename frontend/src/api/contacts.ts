import { apiClient } from './client';
import type {
  Contact,
  ContactPlatform,
  CreateContactPayload,
  UpdateContactPayload,
} from '../types/contact';
import { num, str } from '../utils/normalizeApi';

function mapContact(raw: Record<string, unknown>): Contact {
  return {
    id: num(raw.id),
    platform: str(raw.platform ?? raw.platform_name) as ContactPlatform,
    name: str(raw.name ?? raw.contact_value),
    url: str(raw.url ?? raw.contact_value),
    display_order: num(raw.displayOrder ?? raw.display_order),
  };
}

export async function fetchContacts(): Promise<Contact[]> {
  const { data } = await apiClient.get<{ contacts: Record<string, unknown>[] }>('/contacts');
  return (data?.contacts ?? []).map(mapContact);
}

export async function createContact(payload: CreateContactPayload): Promise<void> {
  await apiClient.post('/admin/contacts', payload);
}

export async function updateContact(id: number, payload: UpdateContactPayload): Promise<void> {
  await apiClient.put(`/admin/contacts/${id}`, payload);
}

export async function deleteContact(id: number): Promise<void> {
  await apiClient.delete(`/admin/contacts/${id}`);
}

export async function updateContactOrder(id: number, displayOrder: number): Promise<void> {
  await apiClient.put(`/admin/contacts/${id}/order`, { displayOrder });
}
