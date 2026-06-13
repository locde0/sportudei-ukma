import { useCallback, useEffect, useState } from 'react';
import { fetchPublicEvents } from '../../api/events';
import { EventCard } from '../../components/public/EventCard';
import { Button } from '../../components/ui/Button';
import type { PublicEventListItem } from '../../types/event';
import styles from './EventsCatalog.module.css';

const PAGE_SIZE = 6;

export function EventsCatalog() {
  const [events, setEvents] = useState<PublicEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);

  const loadPage = useCallback(async (offset: number, append: boolean) => {
    const batch = await fetchPublicEvents(PAGE_SIZE, offset);
    setEvents((prev) => (append ? [...prev, ...batch] : batch));
    setHasMore(batch.length === PAGE_SIZE);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    loadPage(0, false)
      .catch(() => setError('Не вдалося завантажити каталог подій'))
      .finally(() => setLoading(false));
  }, [loadPage]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await loadPage(events.length, true);
    } catch {
      setError('Не вдалося завантажити ще події');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Каталог подій</h1>
        <p className={styles.subtitle}>
          Марафони, турніри, лекції та інші активності Sportudei-UKMA
        </p>
      </header>

      {loading && <p className={styles.loading}>Завантаження...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className={styles.empty}>Наразі немає опублікованих подій</p>
      )}
      {!loading && !error && events.length > 0 && (
        <>
          <div className={styles.grid}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {hasMore && (
            <div className={styles.loadMore}>
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Завантаження…' : 'Завантажити ще'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
