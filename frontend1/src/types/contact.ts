export type ContactPlatform = 'telegram' | 'instagram' | 'email' | 'phone' | 'facebook';

export interface Contact {
  id: number;
  platform_name: ContactPlatform;
  contact_value: string;
  display_order: number;
}

export interface CreateContactPayload {
  platform_name: ContactPlatform;
  contact_value: string;
}

export type UpdateContactPayload = CreateContactPayload;
