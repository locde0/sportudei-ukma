import { useCallback, useEffect, useState } from 'react';
import { LinkButton, Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EventStatusBadge } from '../../components/ui/EventStatusBadge';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { deleteEvent, fetchAdminEvents } from '../../api/events';
import type { EventListItem } from '../../types/event';
import { formatEventDate } from '../../utils/date';
import { resolveImageUrl } from '../../utils/imageUrl';
import styles from './AdminListLayout.module.css';

export function AdminEvents() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null);

  const loadEvents = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAdminEvents()
      .then(setEvents)
      .catch(() => setError('Не вдалося завантажити події'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);
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
          <div className={styles.emptyIcon}>◎</div>
          <p className={styles.emptyTitle}>Подій ще немає</p>
          <p>Створіть першу подію — вона зʼявиться тут і на головній сторінці.</p>
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
                    src={resolveImageUrl(event.main_photo_url)}
                    alt=""
                    className={styles.thumb}
                  />
                ) : (
                  <div className={styles.thumbEmpty}>◎</div>
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
    </div>
  );
}
