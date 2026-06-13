import { Link } from 'react-router-dom';
import type { PublicEventListItem } from '../../types/event';
import { formatEventDate } from '../../utils/date';
import { resolveImageUrl } from '../../utils/imageUrl';
import { EventStatusBadge } from '../ui/EventStatusBadge';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: PublicEventListItem;
  /** На головній — лише превʼю без переходу на детальну сторінку */
  asPreview?: boolean;
}

export function EventCard({ event, asPreview = false }: EventCardProps) {
  const content = (
      <>
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
          <p className={styles.description}>{event.short_description}</p>
          <span className={styles.location}>{event.location}</span>
        </div>
      </>

  );

  if (asPreview) {
    return <article className={`${styles.card} ${styles.preview}`}>{content}</article>;
  }

  return (
    <Link to={`/events/${event.id}`} className={styles.card}>
      {content}
    </Link>
  );
}
