import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchAlbum } from '../../api/gallery';
import { EventGallery } from '../../components/public/EventGallery';
import type { EventPhoto } from '../../types/event';
import styles from './GalleryAlbumPage.module.css';

export function GalleryAlbumPage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const albumId = Number(id);
    if (!albumId) {
      setError('Невірний ідентифікатор альбому');
      setLoading(false);
      return;
    }

    fetchAlbum(albumId)
      .then(({ album, photos: albumPhotos }) => {
        setTitle(album.title);
        setPhotos(
          albumPhotos.map((p, index) => ({
            id: p.id,
            image_url: p.image_url,
            is_main: index === 0,
            display_order: p.display_order,
          })),
        );
      })
      .catch(() => setError('Альбом не знайдено'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className={styles.state}>Завантаження...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <article className={styles.page}>
      <Link to="/gallery" className={styles.back}>
        ← Назад до галереї
      </Link>
      <h1 className={styles.title}>{title}</h1>
      {photos.length > 0 && <EventGallery photos={photos} title={title} />}
    </article>
  );
}
