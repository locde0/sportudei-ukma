import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPublicAlbums } from '../../api/gallery';
import { AlbumCard } from '../../components/public/AlbumCard';
import { Button } from '../../components/ui/Button';
import type { GalleryAlbum } from '../../types/gallery';
import page from '../../styles/publicPage.module.css';

const PAGE_SIZE = 12;

export function GalleryCatalog() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(false);
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

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await loadPage(albums.length, true);
      setAutoLoadEnabled(true);
    } catch {
      setError('Не вдалося завантажити ще альбоми');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!autoLoadEnabled || !hasMore || loadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
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
  }, [autoLoadEnabled, hasMore, loadingMore, albums.length, loadPage]);

  return (
    <div className={page.page}>
      <header className={page.header}>
        <h1 className={page.title}>Галерея</h1>
        <p className={page.subtitle}>Фотоальбоми Sportudei-UKMA</p>
      </header>

      {loading && <p className={page.state}>Завантаження...</p>}
      {error && <p className={page.error}>{error}</p>}
      {!loading && !error && albums.length === 0 && (
        <p className={page.state}>Альбомів поки немає</p>
      )}
      {!loading && !error && albums.length > 0 && (
        <>
          <div className={page.grid}>
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
          {hasMore && !autoLoadEnabled && (
            <div className={page.loadMore}>
              <Button variant="secondary" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Завантаження…' : 'Завантажити ще'}
              </Button>
            </div>
          )}
          {autoLoadEnabled && hasMore && (
            <div ref={sentinelRef} className={page.sentinel} aria-hidden />
          )}
          {autoLoadEnabled && loadingMore && (
            <p className={page.loading}>Завантаження…</p>
          )}
        </>
      )}
    </div>
  );
}
