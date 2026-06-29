import { apiClient } from './client';
import type {
  EventDetail,
  EventListItem,
  EventPhoto,
  PublicEventDetail,
  PublicEventListItem,
  UpdateEventPayload,
} from '../types/event';
import { bool, num, optionalStr, str } from '../utils/normalizeApi';

function mapEventPhoto(raw: Record<string, unknown>): EventPhoto {
  return {
    id: num(raw.id),
    image_url: str(raw.image_path ?? raw.image_url),
    is_main: bool(raw.is_main, false),
    display_order: num(raw.display_order),
  };
}

function mapPublicListItem(raw: Record<string, unknown>): PublicEventListItem {
  return {
    id: num(raw.id),
    title: str(raw.title),
    short_description: str(raw.desc ?? raw.short_description),
    event_date: str(raw.event_date),
    location: str(raw.location),
    status: str(raw.status, 'planned') as PublicEventListItem['status'],
    main_photo_url: optionalStr(raw.main_photo_path ?? raw.main_photo_url),
  };
}

function mapPublicDetail(raw: Record<string, unknown>): PublicEventDetail {
  const photos = Array.isArray(raw.photos)
    ? raw.photos.map((p) => mapEventPhoto(p as Record<string, unknown>))
    : [];
  return {
    id: num(raw.id),
    title: str(raw.title),
    short_description: str(raw.desc ?? raw.short_description),
    content: str(raw.content),
    event_date: str(raw.event_date),
    location: str(raw.location),
    registration_url: optionalStr(raw.url ?? raw.registration_url),
    status: str(raw.status, 'planned') as PublicEventDetail['status'],
    photos,
  };
}

function mapAdminListItem(raw: Record<string, unknown>): EventListItem {
  return {
    id: num(raw.id),
    title: str(raw.title),
    short_description: str(raw.desc ?? raw.short_description),
    event_date: str(raw.event_date),
    location: str(raw.location),
    is_published: bool(raw.is_published, false),
    status: str(raw.status, 'planned') as EventListItem['status'],
    main_photo_url: optionalStr(raw.main_photo_path ?? raw.main_photo_url),
  };
}

function mapAdminDetail(raw: Record<string, unknown>): EventDetail {
  const photos = Array.isArray(raw.photos)
    ? raw.photos.map((p) => mapEventPhoto(p as Record<string, unknown>))
    : [];
  return {
    id: num(raw.id),
    title: str(raw.title),
    short_description: str(raw.desc ?? raw.short_description),
    content: str(raw.content),
    event_date: str(raw.event_date),
    location: str(raw.location),
    registration_url: optionalStr(raw.url ?? raw.registration_url),
    is_published: bool(raw.is_published, false),
    status: str(raw.status, 'planned') as EventDetail['status'],
    photos,
  };
}

export async function fetchPublicEvents(
  limit = 10,
  offset = 0,
): Promise<PublicEventListItem[]> {
  const { data } = await apiClient.get<{ events: Record<string, unknown>[] }>('/events', {
    params: { limit, offset },
  });
  return (data?.events ?? []).map(mapPublicListItem);
}

export async function fetchPublicEvent(id: number): Promise<PublicEventDetail> {
  const { data } = await apiClient.get<Record<string, unknown>>(`/events/${id}`);
  return mapPublicDetail(data ?? {});
}

export async function fetchAdminEvents(
  limit = 10,
  offset = 0,
): Promise<EventListItem[]> {
  const { data } = await apiClient.get<{ events: Record<string, unknown>[] }>('/admin/events', {
    params: { limit, offset },
  });
  return (data?.events ?? []).map(mapAdminListItem);
}

export async function fetchAdminEvent(id: number): Promise<EventDetail> {
  const { data } = await apiClient.get<Record<string, unknown>>(`/admin/events/${id}`);
  return mapAdminDetail(data ?? {});
}

export async function createEvent(formData: FormData): Promise<void> {
  await apiClient.post('/admin/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function updateEvent(
  id: number,
  payload: UpdateEventPayload,
): Promise<void> {
  await apiClient.put(`/admin/events/${id}`, {
    title: payload.title,
    desc: payload.short_description,
    content: payload.content,
    event_date: payload.event_date,
    location: payload.location,
    url: payload.registration_url || null,
    is_published: payload.is_published,
    status: payload.status,
    photos: payload.photos.map((p) => ({
      id: p.id,
      is_main: p.is_main,
      display_order: p.display_order,
    })),
  });
}

export async function deleteEvent(id: number): Promise<void> {
  await apiClient.delete(`/admin/events/${id}`);
}

export async function uploadEventPhoto(eventId: number, file: File): Promise<EventPhoto> {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await apiClient.post<Record<string, unknown>>(`/admin/events/${eventId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return mapEventPhoto(data);
}

export function buildCreateEventFormData(fields: {
  title: string;
  short_description: string;
  content: string;
  event_date: string;
  location: string;
  registration_url: string;
  is_published: boolean;
  photos: File[];
}): FormData {
  const formData = new FormData();
  formData.append(
    'payload',
    JSON.stringify({
      title: fields.title,
      desc: fields.short_description,
      content: fields.content,
      event_date: fields.event_date,
      location: fields.location,
      url: fields.registration_url || null,
      is_published: fields.is_published,
    }),
  );
  fields.photos.forEach((file) => formData.append('photos', file));
  return formData;
}
