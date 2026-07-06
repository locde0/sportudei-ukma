import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAlbum, fetchAlbumPhotos } from '../../api/gallery';
import { EventGallery } from '../../components/public/EventGallery';
import type { EventPhoto } from '../../types/event';
import page from '../../styles/publicPage.module.css';

export function GalleryAlbumPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

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
          setHasMore(albumPhotos.length === 24);
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

  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore && hasMore) {
          setLoadingMore(true);
          try {
            const batch = await fetchAlbumPhotos(Number(id), 24, photos.length);
            if (batch.length > 0) {
              setPhotos((prev) => [
                ...prev,
                ...batch.map((p, index) => ({
                  id: p.id,
                  image_url: p.image_url,
                  is_main: prev.length === 0 && index === 0,
                  display_order: p.display_order,
                })),
              ]);
            }
            setHasMore(batch.length === 24);
          } catch {
            setError('Не вдалося завантажити ще фотографії');
          } finally {
            setLoadingMore(false);
          }
        }
      },
      { rootMargin: '400px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, id, photos.length]);

  if (loading) return <p className={page.state}>Завантаження...</p>;
  if (error) return <p className={page.error}>{error}</p>;

  return (
    <article className={page.page}>
      <button onClick={() => navigate(-1)} className={page.back}>
        ← Назад
      </button>
      <header className={page.header}>
        <h1 className={page.title}>{title}</h1>
      </header>
      {photos.length > 0 ? (
        <>
          <EventGallery photos={photos} title={title} layout="masonry" />
          {hasMore && (
            <div
              ref={sentinelRef}
              style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              {loadingMore && 'Завантаження...'}
            </div>
          )}
        </>
      ) : (
        <p className={page.state}>У цьому альбомі ще немає фото</p>
      )}
    </article>
  );
}
