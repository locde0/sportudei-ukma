import { apiClient } from './client';
import type {
  CreateAlbumPayload,
  GalleryAlbum,
  GalleryAlbumDetail,
  GalleryPhoto,
  UpdateAlbumPayload,
} from '../types/gallery';
import { bool, num, optionalStr, str } from '../utils/normalizeApi';

function mapAlbum(raw: Record<string, unknown>): GalleryAlbum {
  return {
    id: num(raw.id),
    title: str(raw.title),
    cover_photo_url: optionalStr(raw.cover_image_path ?? raw.cover_photo_url),
    is_published: bool(raw.is_published, false),
    photo_count: num(raw.photo_count, 0),
  };
}

function mapPhoto(raw: Record<string, unknown>): GalleryPhoto {
  return {
    id: num(raw.id),
    image_url: str(raw.image_path ?? raw.image_url),
    display_order: num(raw.display_order),
  };
}

export async function fetchPublicAlbums(
  limit = 6,
  offset = 0,
): Promise<GalleryAlbum[]> {
  const { data } = await apiClient.get<{ albums: Record<string, unknown>[] }>('/gallery', {
    params: { limit, offset },
  });
  return (data?.albums ?? []).map(mapAlbum);
}

export async function fetchAdminAlbums(
  limit = 100,
  offset = 0,
): Promise<GalleryAlbum[]> {
  const { data } = await apiClient.get<{ albums: Record<string, unknown>[] }>('/admin/gallery', {
    params: { limit, offset },
  });
  return (data?.albums ?? []).map(mapAlbum);
}

export async function fetchAlbum(id: number): Promise<GalleryAlbumDetail> {
  const { data: albumData } = await apiClient.get<Record<string, unknown>>(`/gallery/${id}`);
  const { data: photosData } = await apiClient.get<{ photos: Record<string, unknown>[] }>(
    `/gallery/${id}/photos`,
    { params: { limit: 24, offset: 0 } },
  );
  return {
    album: mapAlbum(albumData ?? {}),
    photos: (photosData?.photos ?? []).map(mapPhoto),
  };
}

export async function fetchAdminAlbumDetail(id: number): Promise<GalleryAlbumDetail> {
  const { data: albumData } = await apiClient.get<Record<string, unknown>>(`/admin/gallery/${id}`);
  const { data: photosData } = await apiClient.get<{ photos: Record<string, unknown>[] }>(
    `/gallery/${id}/photos`,
    { params: { limit: 16, offset: 0 } },
  );
  return {
    album: mapAlbum(albumData ?? {}),
    photos: (photosData?.photos ?? []).map(mapPhoto),
  };
}

export async function fetchAdminAlbum(id: number): Promise<GalleryAlbum> {
  const { data } = await apiClient.get<Record<string, unknown>>(`/admin/gallery/${id}`);
  return mapAlbum(data ?? {});
}

export async function fetchAlbumPhotos(
  albumId: number,
  limit = 100,
  offset = 0,
): Promise<GalleryPhoto[]> {
  const { data } = await apiClient.get<{ photos: Record<string, unknown>[] }>(
    `/gallery/${albumId}/photos`,
    { params: { limit, offset } },
  );
  return (data?.photos ?? []).map(mapPhoto);
}

export async function createAlbum(
  payload: CreateAlbumPayload,
  cover: File,
): Promise<void> {
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  formData.append('photo', cover);
  await apiClient.post('/admin/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function updateAlbum(id: number, payload: UpdateAlbumPayload): Promise<void> {
  await apiClient.put(`/admin/gallery/${id}`, {
    title: payload.title,
    is_published: payload.is_published,
    cover_image_path: payload.cover_image_path ?? null,
    photos: payload.photos.map((p) => ({
      id: p.id,
      display_order: p.display_order,
    })),
  });
}

export async function deleteAlbum(id: number): Promise<void> {
  await apiClient.delete(`/admin/gallery/${id}`);
}

export async function uploadAlbumPhoto(albumId: number, file: File): Promise<GalleryPhoto> {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await apiClient.post<Record<string, unknown>>(`/admin/gallery/${albumId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return mapPhoto(data);
}

export function galleryPhotoToEventPhoto(
  photo: GalleryPhoto,
  isMain: boolean,
): import('../types/event').EventPhoto {
  return {
    id: photo.id,
    image_url: photo.image_url,
    is_main: isMain,
    display_order: photo.display_order,
  };
}

export function eventPhotoToGalleryUpdate(
  photos: import('../types/event').EventPhoto[],
): UpdateAlbumPayload['photos'] {
  return photos.map((p, index) => ({
    id: p.id,
    display_order: index,
  }));
}
