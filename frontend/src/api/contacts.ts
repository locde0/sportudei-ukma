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
    id: num(raw.id ?? raw.ID),
    platform_name: str(raw.platform_name ?? raw.PlatformName) as ContactPlatform,
    contact_value: str(raw.contact_value ?? raw.ContactValue),
    display_order: num(raw.display_order ?? raw.DisplayOrder),
  };
}

export async function fetchContacts(): Promise<Contact[]> {
  const { data } = await apiClient.get<Record<string, unknown>[]>('/contacts');
  return (data ?? []).map(mapContact);
}

export async function createContact(payload: CreateContactPayload): Promise<{ id: number }> {
  const { data } = await apiClient.post<{ id: number }>('/admin/contacts', payload);
  return data;
}

export async function updateContact(id: number, payload: UpdateContactPayload): Promise<void> {
  await apiClient.put(`/admin/contacts/${id}`, payload);
}

export async function deleteContact(id: number): Promise<void> {
  await apiClient.delete(`/admin/contacts/${id}`);
}

export async function updateContactOrder(orderedIds: number[]): Promise<void> {
  await apiClient.put('/admin/contacts/order', { ordered_ids: orderedIds });
}
