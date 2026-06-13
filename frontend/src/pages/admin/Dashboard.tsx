import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Badge } from '../../components/ui/Badge';
import { fetchAdminEvents } from '../../api/events';
import { fetchTeams } from '../../api/teams';
import { fetchAdminPartners } from '../../api/partners';
import { fetchAdminAlbums } from '../../api/gallery';
import type { EventListItem } from '../../types/event';
import type { Team } from '../../types/team';
import type { Partner } from '../../types/partner';
import type { GalleryAlbum } from '../../types/gallery';
import { formatEventDate } from '../../utils/date';
import { resolveImageUrl } from '../../utils/imageUrl';
import styles from './Dashboard.module.css';

function pickUpcoming(events: EventListItem[], limit = 5): EventListItem[] {
  const now = Date.now();
  const upcoming = events
    .filter((e) => new Date(e.event_date).getTime() >= now)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  if (upcoming.length >= limit) return upcoming.slice(0, limit);
  const rest = events
    .filter((e) => new Date(e.event_date).getTime() < now)
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  return [...upcoming, ...rest].slice(0, limit);
}

function pickRecent<T extends { id: number }>(items: T[], limit = 3): T[] {
  return [...items].sort((a, b) => b.id - a.id).slice(0, limit);
}

export function Dashboard() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAdminEvents().catch(() => [] as EventListItem[]),
      fetchTeams().catch(() => [] as Team[]),
      fetchAdminPartners().catch(() => [] as Partner[]),
      fetchAdminAlbums().catch(() => [] as GalleryAlbum[]),
    ])
      .then(([eventsData, teamsData, partnersData, albumsData]) => {
        setEvents(eventsData);
        setTeams(teamsData);
        setPartners(partnersData);
        setAlbums(albumsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const upcoming = useMemo(() => pickUpcoming(events), [events]);
  const recentAlbums = useMemo(() => pickRecent(albums), [albums]);
  const recentTeams = useMemo(() => pickRecent(teams), [teams]);

  const stats = [
    {
      label: 'Події',
      value: events.length,
      hint: `${events.filter(e => e.status === 'in_progress').length} зараз у процесі`,
    },
    {
      label: 'Команди',
      value: teams.length,
      hint: `${teams.filter((t) => t.is_active).length} активних`,
    },
    {
      label: 'Партнери',
      value: partners.length,
      hint: `${partners.filter((p) => p.is_active).length} на головній`,
    },
    {
      label: 'Галерея',
      value: albums.length,
      hint: 'опублікованих альбомів',
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
        description="Загальна статистика та швидкий доступ до розділів сайту."
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
        {/* COL 1: EVENTS */}
        <section className={styles.widget}>
          <h2 className={styles.widgetHeader}>Найближчі події</h2>
          {upcoming.length === 0 ? (
            <div className={styles.emptyState}>Подій немає. Створіть нову подію для відображення.</div>
          ) : (
            <div className={styles.list}>
              {upcoming.map(event => (
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

        {/* COL 2: RECENT TEAMS & MEDIA */}
        <section className={styles.widget}>
          <h2 className={styles.widgetHeader}>Останні оновлення</h2>
          
          <div className={styles.list}>
            {recentAlbums.map(album => (
              <Link key={`album-${album.id}`} to={`/admin/gallery/${album.id}`} className={styles.listItem}>
                <div className={styles.thumbWrap}>
                  {album.cover_photo_url ? (
                    <img src={resolveImageUrl(album.cover_photo_url)} alt="" className={styles.thumb} />
                  ) : (
                    <span className={styles.thumbIcon}>▣</span>
                  )}
                </div>
                <div className={styles.itemBody}>
                  <h3 className={styles.itemTitle}>{album.title}</h3>
                  <div className={styles.itemMeta}>Альбом галереї</div>
                </div>
              </Link>
            ))}

            {recentTeams.map(team => (
              <Link key={`team-${team.id}`} to={`/admin/teams/${team.id}`} className={styles.listItem}>
                <div className={styles.thumbWrap}>
                  {team.logo_url ? (
                    <img src={resolveImageUrl(team.logo_url)} alt="" className={styles.thumb} />
                  ) : (
                    <span className={styles.thumbIcon}>⬢</span>
                  )}
                </div>
                <div className={styles.itemBody}>
                  <h3 className={styles.itemTitle}>{team.name}</h3>
                  <div className={styles.itemMeta}>Команда</div>
                </div>
              </Link>
            ))}

            {recentAlbums.length === 0 && recentTeams.length === 0 && (
              <div className={styles.emptyState}>Немає нещодавніх змін</div>
            )}
          </div>
        </section>

        {/* COL 3: QUICK ACTIONS */}
        <section className={styles.widget}>
          <h2 className={styles.widgetHeader}>Швидкі дії</h2>
          <div className={styles.list}>
            <Link to="/admin/events/new" className={styles.actionBtn}>
              <span className={styles.actionIcon}>＋</span>
              Створити подію
            </Link>
            <Link to="/admin/teams/new" className={styles.actionBtn}>
              <span className={styles.actionIcon}>＋</span>
              Додати команду
            </Link>
            <Link to="/admin/partners/new" className={styles.actionBtn}>
              <span className={styles.actionIcon}>＋</span>
              Новий партнер
            </Link>
            <Link to="/admin/gallery" className={styles.actionBtn}>
              <span className={styles.actionIcon}>▣</span>
              Фотоальбоми
            </Link>
            <Link to="/admin/settings" className={styles.actionBtn}>
              <span className={styles.actionIcon}>⚙</span>
              Налаштування сайту
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
