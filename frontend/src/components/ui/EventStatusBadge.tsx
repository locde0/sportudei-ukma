import type { EventStatus } from '../../types/event';
import styles from './EventStatusBadge.module.css';

const LABELS: Record<EventStatus, string> = {
  planned: 'Заплановано',
  in_progress: 'В процесі',
  completed: 'Завершено',
};

interface EventStatusBadgeProps {
  status: EventStatus;
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {LABELS[status] ?? status}
    </span>
  );
}

export const EVENT_STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'planned', label: 'Заплановано' },
  { value: 'in_progress', label: 'В процесі' },
  { value: 'completed', label: 'Завершено' },
];
