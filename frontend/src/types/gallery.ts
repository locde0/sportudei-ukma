export interface GalleryAlbum {
  id: number;
  title: string;
  cover_photo_url: string | null;
  is_published: boolean;
  photo_count: number;
}

export interface GalleryPhoto {
  id: number;
  image_url: string;
  display_order: number;
}

export interface GalleryAlbumDetail {
  album: GalleryAlbum;
  photos: GalleryPhoto[];
}

export interface CreateAlbumPayload {
  title: string;
  is_published: boolean;
}

export interface UpdateAlbumPhotoPayload {
  id: number;
  display_order: number;
}

export interface UpdateAlbumPayload {
  title: string;
  is_published: boolean;
  cover_image_path?: string | null;
  photos: UpdateAlbumPhotoPayload[];
}
