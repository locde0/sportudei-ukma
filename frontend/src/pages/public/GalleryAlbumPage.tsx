import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchAlbum } from '../../api/gallery';
import { EventGallery } from '../../components/public/EventGallery';
import type { EventPhoto } from '../../types/event';
import page from '../../styles/publicPage.module.css';

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

    let ignore = false;
    fetchAlbum(albumId)
      .then(({ album, photos: albumPhotos }) => {
        if (!ignore) {
          setTitle(album.title);
          setPhotos(
            albumPhotos.map((p, index) => ({
              id: p.id,
              image_url: p.image_url,
              is_main: index === 0,
              display_order: p.display_order,
            })),
          );
        }
      })
      .catch(() => {
        if (!ignore) setError('Альбом не знайдено');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
      
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <p className={page.state}>Завантаження...</p>;
  if (error) return <p className={page.error}>{error}</p>;

  return (
    <article className={page.page}>
      <Link to="/gallery" className={page.back}>
        ← Назад до галереї
      </Link>
      <header className={page.header}>
        <h1 className={page.title}>{title}</h1>
      </header>
      {photos.length > 0 ? (
        <EventGallery photos={photos} title={title} />
      ) : (
        <p className={page.state}>У цьому альбомі ще немає фото</p>
      )}
    </article>
  );
}
