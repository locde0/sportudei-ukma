import { apiClient } from './client';
import type {
  EventDetail,
  EventListItem,
  EventPhoto,
  PublicEventDetail,
  PublicEventListItem,
  UpdateEventPayload,
} from '../types/event';
// import { mockPublicEventsDetail, mockPublicEventsList } from '../data/mockEvents';

// const USE_MOCK =
//   import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.DEV;

export async function fetchPublicEvents(
  limit = 10,
  offset = 0,
): Promise<PublicEventListItem[]> {
  try {
    const { data } = await apiClient.get<PublicEventListItem[]>('/events', {
      params: { limit, offset },
    });
    return data;
  } catch {
    // if (USE_MOCK) return mockPublicEventsList.slice(offset, offset + limit);
    throw new Error('Не вдалося завантажити події');
  }
}

export async function fetchPublicEvent(id: number): Promise<PublicEventDetail> {
  try {
    const { data } = await apiClient.get<PublicEventDetail>(`/events/${id}`);
    return data;
  } catch {
    // const mock = mockPublicEventsDetail[id];
    // if (USE_MOCK && mock) return mock;
    throw new Error('Подію не знайдено');
  }
}

export async function fetchAdminEvents(
  limit = 10,
  offset = 0,
): Promise<EventListItem[]> {
  const { data } = await apiClient.get<EventListItem[]>('/admin/events', {
    params: { limit, offset },
  });
  return data;
}

export async function fetchAdminEvent(id: number): Promise<EventDetail> {
  const { data } = await apiClient.get<EventDetail>(`/admin/events/${id}`);
  return { ...data, photos: data.photos ?? [] };
}

export async function createEvent(
  formData: FormData,
): Promise<{ id: number }> {
  const { data } = await apiClient.post<{ id: number }>('/admin/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateEvent(
  id: number,
  payload: UpdateEventPayload,
): Promise<void> {
  await apiClient.put(`/admin/events/${id}`, payload);
}

export async function deleteEvent(id: number): Promise<void> {
  await apiClient.delete(`/admin/events/${id}`);
}

export async function uploadEventPhoto(
  eventId: number,
  file: File,
): Promise<EventPhoto> {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await apiClient.post<EventPhoto>(
    `/admin/events/${eventId}/photos`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

export async function deleteEventPhoto(photoId: number): Promise<void> {
  await apiClient.delete(`/admin/events/photos/${photoId}`);
}
