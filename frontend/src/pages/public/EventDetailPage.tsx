import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EventGallery } from '../../components/public/EventGallery';
import { EventStatusBadge } from '../../components/ui/EventStatusBadge';
import { fetchPublicEvent } from '../../api/events';
import type { PublicEventDetail } from '../../types/event';
import { formatEventDateTime } from '../../utils/date';
import styles from './EventDetailPage.module.css';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<PublicEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const eventId = Number(id);
    if (!eventId) {
      setError('Невірний ідентифікатор події');
      setLoading(false);
      return;
    }

    fetchPublicEvent(eventId)
      .then(setEvent)
      .catch(() => setError('Подію не знайдено'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className={styles.loading}>Завантаження...</p>;
  if (error || !event) return <p className={styles.error}>{error || 'Подію не знайдено'}</p>;

  return (
    <article className={styles.page}>
      <button onClick={() => navigate(-1)} className={styles.back}>
        ← Назад
      </button>

      {event.photos.length > 0 && (
        <EventGallery photos={event.photos} title={event.title} viewerVariant="full" />
      )}

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <strong>Дата</strong>
          {formatEventDateTime(event.event_date)}
        </div>
        <div className={styles.metaItem}>
          <strong>Локація</strong>
          {event.location}
        </div>
        <div className={`${styles.metaItem} ${styles.metaStatus}`}>
          <strong>Статус</strong>
          {event.status && <EventStatusBadge status={event.status} />}
        </div>
      </div>

      <h1 className={styles.title}>{event.title}</h1>
      <div className={styles.content}>{event.content}</div>

      {event.registration_url && (
        <a
          href={event.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          Зареєструватися
        </a>
      )}
    </article>
  );
}
