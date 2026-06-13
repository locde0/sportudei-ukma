export type EventStatus = 'planned' | 'in_progress' | 'completed';

export interface EventPhoto {
  id: number;
  image_url: string;
  is_main: boolean;
  display_order: number;
}

/** Публічний список — GET /api/events */
export interface PublicEventListItem {
  id: number;
  title: string;
  short_description: string;
  event_date: string;
  location: string;
  status: EventStatus;
  main_photo_url: string | null;
}

/** Публічна деталь — GET /api/events/:id */
export interface PublicEventDetail {
  id: number;
  title: string;
  short_description: string;
  content: string;
  event_date: string;
  location: string;
  registration_url: string;
  status: EventStatus;
  photos: EventPhoto[];
}

/** Адмін-список — GET /api/admin/events */
export interface EventListItem {
  id: number;
  title: string;
  short_description?: string;
  event_date: string;
  location: string;
  is_published: boolean;
  status: EventStatus;
  main_photo_url: string | null;
  created_at: string;
}

export interface EventDetail {
  id: number;
  title: string;
  short_description: string;
  content: string;
  event_date: string;
  location: string;
  registration_url: string | null;
  is_published: boolean;
  status: EventStatus;
  photos: EventPhoto[];
  created_at?: string;
  updated_at?: string;
}

export interface EventFormData {
  title: string;
  short_description: string;
  content: string;
  event_date: string;
  location: string;
  registration_url: string;
  is_published: boolean;
}

export interface UpdateEventPhotoPayload {
  id: number;
  is_main: boolean;
  display_order: number;
}

export interface UpdateEventPayload extends EventFormData {
  event_date: string;
  status?: EventStatus;
  photos: UpdateEventPhotoPayload[];
}

/** Локальний елемент галереї при створенні події */
export interface LocalGalleryItem {
  localId: string;
  file: File;
  previewUrl: string;
  isMain: boolean;
}
