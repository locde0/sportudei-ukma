import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicAlbums } from '../../api/gallery';
import { AlbumCard } from '../../components/public/AlbumCard';
import { IconArrowLeft } from '../../components/ui/Icons';
import type { GalleryAlbum } from '../../types/gallery';
import page from '../../styles/publicPage.module.css';

const PAGE_SIZE = 6;

export function GalleryCatalog() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (offset: number, append: boolean) => {
    const batch = await fetchPublicAlbums(PAGE_SIZE, offset);
    setAlbums((prev) => (append ? [...prev, ...batch] : batch));
    setHasMore(batch.length === PAGE_SIZE);
  }, []);

  useEffect(() => {
    let ignore = false;
    loadPage(0, false)
      .catch(() => {
        if (!ignore) setError('Не вдалося завантажити галерею');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
      
    return () => {
      ignore = true;
    };
  }, [loadPage]);


  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore && hasMore) {
          setLoadingMore(true);
          loadPage(albums.length, true)
            .catch(() => setError('Не вдалося завантажити ще альбоми'))
            .finally(() => setLoadingMore(false));
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, albums.length, loadPage]);

  return (
    <div className={page.page}>
      <Link to="/#gallery" className={page.back} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <IconArrowLeft size={16} /> На головну
      </Link>
      <header className={page.header}>
        <h1 className={page.title}>Галерея</h1>
      </header>

      {loading && <p className={page.state}>Завантаження...</p>}
      {error && <p className={page.error}>{error}</p>}
      {!loading && !error && albums.length === 0 && (
        <p className={page.empty}>Альбомів наразі немає</p>
      )}
      {!loading && !error && albums.length > 0 && (
        <>
          <div className={page.grid}>
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
          {hasMore && (
            <div
              ref={sentinelRef}
              className={page.loadMore}
              style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              {loadingMore && 'Завантаження...'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
