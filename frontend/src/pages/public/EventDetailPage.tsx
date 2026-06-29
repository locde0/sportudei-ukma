import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EventGallery } from '../../components/public/EventGallery';
import { EventStatusBadge } from '../../components/ui/EventStatusBadge';
import { fetchPublicEvent } from '../../api/events';
import type { PublicEventDetail } from '../../types/event';
import { formatEventDateTime } from '../../utils/date';
import page from '../../styles/publicPage.module.css';
import styles from './EventDetailPage.module.css';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<PublicEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const eventId = Number(id);
    if (!eventId) {
      // Intentionally avoiding setError inside effect if possible, but if needed, do it asynchronously or ignore
      setError('Невірний ідентифікатор події');
      setLoading(false);
      return;
    }

    let ignore = false;
    fetchPublicEvent(eventId)
      .then((data) => {
        if (!ignore) setEvent(data);
      })
      .catch(() => {
        if (!ignore) setError('Подію не знайдено');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
      
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <p className={page.state}>Завантаження...</p>;
  if (error || !event) return <p className={page.error}>{error || 'Подію не знайдено'}</p>;

  return (
    <article className={page.page}>
      <Link to="/events" className={page.back}>
        ← Назад до каталогу
      </Link>

      {event.photos.length > 0 && (
        <EventGallery photos={event.photos} title={event.title} />
      )}

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <strong>Статус</strong>
          {event.status && <EventStatusBadge status={event.status} />}
        </div>
        <div className={styles.metaItem}>
          <strong>Дата</strong>
          {formatEventDateTime(event.event_date)}
        </div>
        <div className={styles.metaItem}>
          <strong>Локація</strong>
          {event.location}
        </div>
      </div>

      <header className={page.header}>
        <h1 className={page.title}>{event.title}</h1>
        {event.short_description && (
          <p className={page.subtitle}>{event.short_description}</p>
        )}
      </header>

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
