import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Badge } from '../../components/ui/Badge';
import { LinkButton } from '../../components/ui/Button';
import { fetchAdminEvents } from '../../api/events';
import { fetchAdminTeams } from '../../api/teams';
import type { EventListItem } from '../../types/event';
import type { Team } from '../../types/team';
import { formatEventDate } from '../../utils/date';
import { resolveImageUrl } from '../../utils/imageUrl';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAdminEvents().catch(() => [] as EventListItem[]),
      fetchAdminTeams().catch(() => [] as Team[]),
    ])
      .then(([eventsData, teamsData]) => {
        setEvents(eventsData);
        setTeams(teamsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const completedEvents = useMemo(() => events.filter(e => e.status === 'completed'), [events]);
  const inProgressEvents = useMemo(() => events.filter(e => e.status === 'in_progress'), [events]);
  const plannedEvents = useMemo(() => events.filter(e => e.status === 'planned'), [events]);

  const stats = [
    {
      label: 'Подій в процесі',
      value: inProgressEvents.length,
      hint: 'Зараз тривають',
    },
    {
      label: 'Заплановані події',
      value: plannedEvents.length,
      hint: 'Чекають на початок',
    },
    {
      label: 'Завершені події',
      value: completedEvents.length,
      hint: 'Успішно проведено',
    },
    {
      label: 'Активні команди',
      value: teams.filter((t) => t.is_active).length,
      hint: `Всього ${teams.length} у базі`,
    },
  ];

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Завантаження даних...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminPageHeader
        eyebrow="Головна панель керування"
        title="Огляд"
        description="Панель керування платформою. Тут ви бачите головні показники по подіях та маєте швидкий доступ до створення контенту."
      />

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statHint}>{stat.hint}</span>
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        <section className={styles.widget}>
          <h2 className={styles.widgetHeader}>Події в процесі 🟢</h2>
          {inProgressEvents.length === 0 ? (
            <div className={styles.emptyState}>Наразі немає подій у процесі.</div>
          ) : (
            <div className={styles.list}>
              {inProgressEvents.map(event => (
                <Link key={event.id} to={`/admin/events/${event.id}`} className={styles.listItem}>
                  <div className={styles.thumbWrap}>
                    {event.main_photo_url ? (
                      <img src={resolveImageUrl(event.main_photo_url)} alt="" className={styles.thumb} />
                    ) : (
                      <span className={styles.thumbIcon}>◎</span>
                    )}
                  </div>
                  <div className={styles.itemBody}>
                    <h3 className={styles.itemTitle}>{event.title}</h3>
                    <div className={styles.itemMeta}>
                      <span>{formatEventDate(event.event_date)}</span>
                      <span>·</span>
                      <Badge published={event.is_published} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className={styles.widget}>
          <h2 className={styles.widgetHeader}>Заплановані події 📅</h2>
          {plannedEvents.length === 0 ? (
            <div className={styles.emptyState}>Запланованих подій немає.</div>
          ) : (
            <div className={styles.list}>
              {plannedEvents.map(event => (
                <Link key={event.id} to={`/admin/events/${event.id}`} className={styles.listItem}>
                  <div className={styles.thumbWrap}>
                    {event.main_photo_url ? (
                      <img src={resolveImageUrl(event.main_photo_url)} alt="" className={styles.thumb} />
                    ) : (
                      <span className={styles.thumbIcon}>◎</span>
                    )}
                  </div>
                  <div className={styles.itemBody}>
                    <h3 className={styles.itemTitle}>{event.title}</h3>
                    <div className={styles.itemMeta}>
                      <span>{formatEventDate(event.event_date)}</span>
                      <span>·</span>
                      <Badge published={event.is_published} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className={styles.widget}>
          <h2 className={styles.widgetHeader}>Швидкі дії</h2>
          <div className={styles.list}>
            <LinkButton to="/admin/events/new" variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Створити подію
            </LinkButton>
            <LinkButton to="/admin/teams/new" variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Додати команду
            </LinkButton>
            <LinkButton to="/admin/partners/new" variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Новий партнер
            </LinkButton>
            <LinkButton to="/admin/gallery" variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Фотоальбоми
            </LinkButton>
            <LinkButton to="/admin/settings" variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Налаштування сайту
            </LinkButton>
          </div>
        </section>
      </div>
    </div>
  );
}
