import { useCallback, useEffect, useRef, useState } from 'react';
import { LinkButton, Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EventStatusBadge } from '../../components/ui/EventStatusBadge';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { deleteEvent, fetchAdminEvents } from '../../api/events';
import { IconCalendar } from '../../components/ui/Icons';
import type { EventListItem } from '../../types/event';
import { formatEventDate } from '../../utils/date';
import { resolveVariantUrl } from '../../utils/imageUrl';
import styles from './AdminListLayout.module.css';

const PAGE_SIZE = 10;

export function AdminEvents() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null);

  const loadPage = useCallback(async (offset: number, append: boolean) => {
    const batch = await fetchAdminEvents(PAGE_SIZE, offset);
    setEvents((prev) => (append ? [...prev, ...batch] : batch));
    setHasMore(batch.length === PAGE_SIZE);
  }, []);

  useEffect(() => {
    let ignore = false;
    loadPage(0, false)
      .catch(() => {
        if (!ignore) setError('Не вдалося завантажити події');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [loadPage]);

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLoadingMore(true);
          loadPage(events.length, true)
            .catch(() => setError('Не вдалося завантажити ще події'))
            .finally(() => setLoadingMore(false));
        }
      }, { rootMargin: '200px' });

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore, loadPage, events.length],
  );
  useEffect(() => {
    if (confirmId === null) return;
    const handleClickOutside = () => {
      setConfirmId(null);
      setDeleteErrorId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [confirmId]);
  const handleDeleteClick = (id: number) => {
    setConfirmId(id);
    setDeleteErrorId(null);
  };

  const cancelDelete = () => {
    if (deletingId !== null) return;
    setConfirmId(null);
    setDeleteErrorId(null);
  };

  const confirmDelete = async (id: number) => {
    setDeletingId(id);
    setDeleteErrorId(null);
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setConfirmId(null);
    } catch {
      setDeleteErrorId(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Каталог"
        title="Усі події"
        description="Керуйте подіями та активностями."
        actions={<LinkButton to="/admin/events/new">+ Нова подія</LinkButton>}
      />



      {loading && (
        <div className={styles.stateBox}>Завантажуємо події…</div>
      )}

      {error && (
        <div className={`${styles.stateBox} ${styles.stateBoxError}`}>{error}</div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className={styles.stateBox}>
          <div className={styles.emptyIcon}><IconCalendar size={24} /></div>
          <p className={styles.emptyTitle}>Подій ще немає</p>
          <p>Створіть першу подію — введіть назву та оберіть дату.</p>
          <div style={{ marginTop: '1.25rem' }}>
            <LinkButton to="/admin/events/new">Створити подію</LinkButton>
          </div>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className={styles.list}>
          {events.map((event) => {
            const isConfirming = confirmId === event.id;
            const isDeleting = deletingId === event.id;

            return (
            <article
              key={event.id}
              className={`${styles.card} ${isConfirming ? styles.cardConfirming : ''}`}
            >
              <div className={styles.thumbWrap}>
                {event.main_photo_url ? (
                  <img
                    src={resolveVariantUrl(event.main_photo_url, 'sm')}
                    alt=""
                    className={styles.thumb}
                  />
                ) : (
                  <div className={styles.thumbEmpty}><IconCalendar size={18} /></div>
                )}
              </div>

              <div className={styles.body}>
                <div className={styles.meta}>
                  <span className={styles.id}>#{event.id}</span>
                  <Badge published={event.is_published} />
                  {event.status && <EventStatusBadge status={event.status} />}
                </div>
                <h2 className={styles.title}>{event.title}</h2>
                <div className={styles.details}>
                  <span className={styles.detail}>
                    <span className={styles.detailAccent}>◷</span>
                    {formatEventDate(event.event_date)}
                  </span>
                  <span className={styles.detail}>📍 {event.location}</span>
                </div>
              </div>

              <div className={styles.actions}>
                <LinkButton to={`/admin/events/${event.id}`} variant="secondary" size="sm">
                  Редагувати
                </LinkButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(event.id);
                  }}
                  disabled={isConfirming}
                >
                  Видалити
                </Button>
              </div>

              {isConfirming && (
                <div
                  className={styles.confirmOverlay}
                  role="dialog"
                  aria-modal="true"
                  onClick={cancelDelete}
                >
                  <div className={styles.confirmCenter}>
                    <p className={styles.confirmTitle}>Видалити подію?</p>
                    {deleteErrorId === event.id && (
                      <p className={styles.confirmError}>Не вдалося видалити</p>
                    )}
                  </div>
                  <div
                    className={styles.confirmActions}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDelete(event.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? '…' : 'Так'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={cancelDelete}
                      disabled={isDeleting}
                    >
                      Ні
                    </Button>
                  </div>
                </div>
              )}
            </article>
            );
          })}
        </div>
      )}

      {!loading && !error && events.length > 0 && hasMore && (
        <div
          ref={loadMoreRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem'
          }}
        >
          {loadingMore && (
            <>
              <span className={styles.spinner} style={{ width: '1rem', height: '1rem', borderTopColor: 'var(--color-text-muted)' }} />
              Завантаження...
            </>
          )}
        </div>
      )}
    </div>
  );
}
