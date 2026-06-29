import { Link } from 'react-router-dom';
import type { PublicEventListItem } from '../../types/event';
import { formatEventDate } from '../../utils/date';
import { resolveImageUrl } from '../../utils/imageUrl';
import { EventStatusBadge } from '../ui/EventStatusBadge';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: PublicEventListItem;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link to={`/events/${event.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {event.main_photo_url ? (
          <img
            src={resolveImageUrl(event.main_photo_url)}
            alt={event.title}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder}>Без фото</div>
        )}
        {event.status && (
          <div className={styles.statusWrap}>
            <EventStatusBadge status={event.status} />
          </div>
        )}
      </div>
      <div className={styles.body}>
        <time className={styles.date} dateTime={event.event_date}>
          {formatEventDate(event.event_date)}
        </time>
        <h3 className={styles.title}>{event.title}</h3>
      </div>
    </Link>
  );
}
