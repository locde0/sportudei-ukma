import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Badge } from '../../components/ui/Badge';
import { fetchAdminDashboardStats } from '../../api/dashboard';
import type { AdminDashboardResponse } from '../../types/dashboard';
import { formatEventDate } from '../../utils/date';
import { resolveVariantUrl } from '../../utils/imageUrl';
import styles from './Dashboard.module.css';

const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconPhoto = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export function Dashboard() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardStats()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: 'Подій в процесі',
      value: data?.stats.events_in_progress || 0,
      hint: 'Зараз тривають',
      icon: <IconZap />,
      accent: false,
    },
    {
      label: 'Заплановані',
      value: data?.stats.events_planned || 0,
      hint: 'Чекають на початок',
      icon: <IconCalendar />,
      accent: false,
    },
    {
      label: 'Завершені',
      value: data?.stats.events_completed || 0,
      hint: 'Успішно проведено',
      icon: <IconCheck />,
      accent: false,
    },
    {
      label: 'Активні команди',
      value: data?.stats.teams_active || 0,
      hint: `З ${data?.stats.teams_total || 0} у базі`,
      icon: <IconUsers />,
      accent: false,
    },
  ];

  const inProgressEvents = data?.recent_in_progress_events || [];
  const plannedEvents = data?.recent_planned_events || [];

  const quickActions = [
    { to: '/admin/events/new', label: 'Нова подія', icon: <IconZap />, primary: false },
    { to: '/admin/teams/new', label: 'Нова команда', icon: <IconUsers />, primary: false },
    { to: '/admin/gallery/new', label: 'Новий альбом', icon: <IconPhoto />, primary: false },
    { to: '/admin/settings', label: 'Налаштування', icon: <IconSettings />, primary: false },
  ];

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <span>Завантаження даних…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminPageHeader
        eyebrow="Панель керування"
        title="Огляд"
        description="Головні показники платформи та швидкий доступ до управління контентом."
      />

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={stat.label} className={`${styles.statCard} ${stat.accent ? styles.statCardAccent : ''}`} style={{ animationDelay: `${i * 60}ms` }}>
            <div className={styles.statTop}>
              <span className={styles.statLabel}>{stat.label}</span>
              <div className={`${styles.statIcon} ${stat.accent ? styles.statIconAccent : ''}`}>
                {stat.icon}
              </div>
            </div>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statHint}>{stat.hint}</span>
            {stat.accent && <div className={styles.statGlow} />}
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div className={styles.mainGrid}>

        {/* Events in progress */}
        <section className={styles.widget}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetHeaderLeft}>
              <div className={`${styles.widgetDot} ${styles.widgetDotGreen}`} />
              <h2 className={styles.widgetTitle}>Зараз тривають</h2>
              {inProgressEvents.length > 0 && (
                <span className={styles.widgetBadge}>{inProgressEvents.length}</span>
              )}
            </div>
            <Link to="/admin/events" className={styles.widgetLink}>
              Всі події <IconArrow />
            </Link>
          </div>
          <div className={styles.widgetBody}>
            {inProgressEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><IconZap /></div>
                <p>Наразі немає активних подій</p>
              </div>
            ) : (
              <div className={styles.list}>
                {inProgressEvents.slice(0, 5).map(event => (
                  <Link key={event.id} to={`/admin/events/${event.id}`} className={styles.listItem}>
                    <div className={styles.thumbWrap}>
                      {event.main_photo_url ? (
                        <img src={resolveVariantUrl(event.main_photo_url, 'sm')} alt="" className={styles.thumb} />
                      ) : (
                        <div className={styles.thumbIcon}><IconZap /></div>
                      )}
                    </div>
                    <div className={styles.itemBody}>
                      <h3 className={styles.itemTitle}>{event.title}</h3>
                      <div className={styles.itemMeta}>
                        <span>{formatEventDate(event.event_date)}</span>
                        <span className={styles.dot}>·</span>
                        <Badge published={event.is_published} />
                      </div>
                    </div>
                    <div className={styles.itemArrow}><IconArrow /></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Planned events */}
        <section className={styles.widget}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetHeaderLeft}>
              <div className={`${styles.widgetDot} ${styles.widgetDotBlue}`} />
              <h2 className={styles.widgetTitle}>Заплановані</h2>
              {plannedEvents.length > 0 && (
                <span className={styles.widgetBadge}>{plannedEvents.length}</span>
              )}
            </div>
            <Link to="/admin/events" className={styles.widgetLink}>
              Всі події <IconArrow />
            </Link>
          </div>
          <div className={styles.widgetBody}>
            {plannedEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><IconCalendar /></div>
                <p>Запланованих подій немає</p>
              </div>
            ) : (
              <div className={styles.list}>
                {plannedEvents.slice(0, 5).map(event => (
                  <Link key={event.id} to={`/admin/events/${event.id}`} className={styles.listItem}>
                    <div className={styles.thumbWrap}>
                      {event.main_photo_url ? (
                        <img src={resolveVariantUrl(event.main_photo_url, 'sm')} alt="" className={styles.thumb} />
                      ) : (
                        <div className={styles.thumbIcon}><IconCalendar /></div>
                      )}
                    </div>
                    <div className={styles.itemBody}>
                      <h3 className={styles.itemTitle}>{event.title}</h3>
                      <div className={styles.itemMeta}>
                        <span>{formatEventDate(event.event_date)}</span>
                        <span className={styles.dot}>·</span>
                        <Badge published={event.is_published} />
                      </div>
                    </div>
                    <div className={styles.itemArrow}><IconArrow /></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section className={styles.widget}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetHeaderLeft}>
              <div className={`${styles.widgetDot} ${styles.widgetDotGreen}`} />
              <h2 className={styles.widgetTitle}>Швидкі дії</h2>
            </div>
          </div>
          <div className={styles.widgetBody}>
            <div className={styles.actions}>
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`${styles.actionBtn} ${action.primary ? styles.actionBtnPrimary : ''}`}
                >
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <span className={styles.actionLabel}>{action.label}</span>
                  <span className={styles.actionArrow}><IconPlus /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
