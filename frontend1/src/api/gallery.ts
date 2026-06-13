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
    id: num(raw.id ?? raw.ID),
    title: str(raw.title ?? raw.Title),
    cover_photo_url: optionalStr(raw.cover_photo_url ?? raw.CoverPhotoURL),
    is_published: bool(raw.is_published ?? raw.IsPublished, false),
    photo_count: num(raw.photo_count ?? raw.PhotoCount),
  };
}

function mapPhoto(raw: Record<string, unknown>): GalleryPhoto {
  return {
    id: num(raw.id ?? raw.ID),
    album_id: num(raw.album_id ?? raw.AlbumID),
    image_url: str(raw.image_url ?? raw.ImageURL),
    display_order: num(raw.display_order ?? raw.DisplayOrder),
  };
}

export async function fetchPublicAlbums(): Promise<GalleryAlbum[]> {
  const { data } = await apiClient.get<Record<string, unknown>[]>('/gallery/albums');
  return (data ?? []).map(mapAlbum);
}

export async function fetchAdminAlbums(): Promise<GalleryAlbum[]> {
  const { data } = await apiClient.get<Record<string, unknown>[]>('/admin/gallery/albums');
  return (data ?? []).map(mapAlbum);
}

export async function fetchAlbum(id: number): Promise<GalleryAlbumDetail> {
  const { data } = await apiClient.get<{
    album: Record<string, unknown>;
    photos: Record<string, unknown>[];
  }>(`/gallery/albums/${id}`);
  return {
    album: mapAlbum(data.album),
    photos: (data.photos ?? []).map(mapPhoto),
  };
}

export async function createAlbum(payload: CreateAlbumPayload): Promise<{ id: number }> {
  const { data } = await apiClient.post<{ id: number }>('/admin/gallery/albums', payload);
  return data;
}

export async function updateAlbum(id: number, payload: UpdateAlbumPayload): Promise<void> {
  await apiClient.put(`/admin/gallery/albums/${id}`, {
    title: payload.title,
    is_published: payload.is_published,
    photos: payload.photos.map((p) => ({
      ID: p.id,
      IsMain: p.is_main,
      DisplayOrder: p.display_order,
    })),
  });
}

export async function deleteAlbum(id: number): Promise<void> {
  await apiClient.delete(`/admin/gallery/albums/${id}`);
}

export async function uploadAlbumPhoto(albumId: number, file: File): Promise<GalleryPhoto> {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await apiClient.post<Record<string, unknown>>(
    `/admin/gallery/albums/${albumId}/photos`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
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
    is_main: p.is_main,
    display_order: index,
  }));
}
