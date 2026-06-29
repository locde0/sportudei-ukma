import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  eventPhotoToGalleryUpdate,
  fetchAdminAlbumDetail,
  galleryPhotoToEventPhoto,
  updateAlbum,
  uploadAlbumPhoto,
} from '../../api/gallery';
import { AdminField } from '../../components/admin/AdminField';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSection } from '../../components/admin/AdminSection';
import { EventGalleryEditor } from '../../components/admin/EventGalleryEditor';
import { Button, LinkButton } from '../../components/ui/Button';
import type { EventPhoto } from '../../types/event';
import styles from './AdminFormLayout.module.css';

function sortPhotos(photos: EventPhoto[]): EventPhoto[] {
  return [...photos].sort((a, b) => a.display_order - b.display_order);
}

export function AlbumForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchAdminAlbumDetail(Number(id))
      .then(({ album, photos: albumPhotos }) => {
        setTitle(album.title);
        setIsPublished(album.is_published);
        const sorted = [...albumPhotos].sort((a, b) => a.display_order - b.display_order);
        setPhotos(sorted.map((p) => galleryPhotoToEventPhoto(p, p.image_url === album.cover_photo_url)));
      })
      .catch(() => setError('Не вдалося завантажити альбом'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!title.trim()) {
      setError('Не вдалося зберегти. Перевірте поля та спробуйте ще раз.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const normalized = sortPhotos(photos);
      if (normalized.length > 0 && !normalized.some((p) => p.is_main)) {
        normalized[0] = { ...normalized[0], is_main: true };
      }
      
      const mainPhoto = normalized.find(p => p.is_main);
      const coverImagePath = mainPhoto ? mainPhoto.image_url : null;
      
      await updateAlbum(Number(id), {
        title,
        is_published: isPublished,
        cover_image_path: coverImagePath,
        photos: eventPhotoToGalleryUpdate(normalized),
      });
      navigate('/admin/gallery');
    } catch {
      setError('Не вдалося зберегти альбом');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Завантажуємо альбом…
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/admin/gallery')}>
        ← До галереї
      </button>

      <AdminPageHeader
        eyebrow="Галерея"
        title={title || 'Альбом'}
        description="Завантажуйте фото, змінюйте порядок і обкладинку. Зміни застосовуються після збереження."
      />

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.grid}>
        <div className={styles.mainCol}>
          <AdminSection icon="✦" title="Альбом">
            <AdminField
              id="title"
              label="Назва"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </AdminSection>

          <AdminSection icon="▣" title="Фотографії">
            {id && (
              <EventGalleryEditor
                mode="edit"
                photos={photos}
                onChange={setPhotos}
                onUpload={async (file) => {
                  const p = await uploadAlbumPhoto(Number(id), file);
                  return galleryPhotoToEventPhoto(p, false);
                }}
              />
            )}
          </AdminSection>
        </div>

        <aside className={styles.sideCol}>
          <div className={styles.publishCard}>
            <p className={styles.publishCardTitle}>Статус</p>
            <div className={styles.publishRow}>
              <div>
                <p className={styles.publishLabel}>
                  {isPublished ? 'Опубліковано' : 'Чернетка'}
                </p>
                <p className={styles.publishHint}>
                  {isPublished
                    ? 'Видно на головній сторінці'
                    : 'Збережеться, але не показується'}
                </p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <span className={styles.toggleTrack} />
                <span className={styles.toggleThumb} />
              </label>
            </div>
            <div className={styles.sideActions}>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Зберігаємо…' : 'Зберегти альбом'}
              </Button>
              <LinkButton to="/admin/gallery" variant="secondary">
                Скасувати
              </LinkButton>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
