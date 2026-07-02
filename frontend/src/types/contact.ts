export type ContactPlatform = 'telegram' | 'instagram' | 'facebook' | 'email' | 'tiktok' | 'whatsapp';

export interface Contact {
  id: number;
  platform: ContactPlatform;
  name: string;
  url: string;
  display_order: number;
}

export interface CreateContactPayload {
  platform: ContactPlatform;
  name: string;
  url: string;
  displayOrder: number;
}

export interface UpdateContactPayload {
  platform: ContactPlatform;
  name: string;
  url: string;
}
