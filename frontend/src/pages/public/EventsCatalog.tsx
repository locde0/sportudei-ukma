import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicEvents } from '../../api/events';
import { EventCard } from '../../components/public/EventCard';
import { Button } from '../../components/ui/Button';
import { IconArrowLeft } from '../../components/ui/Icons';
import type { PublicEventListItem } from '../../types/event';
import page from '../../styles/publicPage.module.css';

const PAGE_SIZE = 6;

export function EventsCatalog() {
  const [events, setEvents] = useState<PublicEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (offset: number, append: boolean) => {
    const batch = await fetchPublicEvents(PAGE_SIZE, offset);
    setEvents((prev) => (append ? [...prev, ...batch] : batch));
    setHasMore(batch.length === PAGE_SIZE);
  }, []);

  useEffect(() => {
    let ignore = false;
    loadPage(0, false)
      .catch(() => {
        if (!ignore) setError('Не вдалося завантажити каталог подій');
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
      await loadPage(events.length, true);
      setAutoLoadEnabled(true);
    } catch {
      setError('Не вдалося завантажити ще події');
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
          loadPage(events.length, true)
            .catch(() => setError('Не вдалося завантажити ще події'))
            .finally(() => setLoadingMore(false));
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [autoLoadEnabled, hasMore, loadingMore, events.length, loadPage]);

  return (
    <div className={page.page}>
      <Link to="/" className={page.back} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <IconArrowLeft size={16} /> На головну
      </Link>
      <header className={page.header}>
        <h1 className={page.title}>Каталог подій</h1>
      </header>

      {loading && <p className={page.loading}>Завантаження...</p>}
      {error && <p className={page.error}>{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className={page.empty}>Подій наразі немає</p>
      )}
      {!loading && !error && events.length > 0 && (
        <>
          <div className={page.grid}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {hasMore && !autoLoadEnabled && (
            <div className={page.loadMore}>
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
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
