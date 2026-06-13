import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchPublicPartners } from '../../api/partners';
import { fetchPublicAlbums } from '../../api/gallery';
import { fetchTeams } from '../../api/teams';
import { fetchMohylaGame, MOHYLA_GAME_ID } from '../../api/games';
import { fetchContacts } from '../../api/contacts';
import { fetchPublicEvents } from '../../api/events';
import { HeroSection } from '../../components/public/HeroSection';
import { EventCard } from '../../components/public/EventCard';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import type { PublicEventListItem } from '../../types/event';
import type { Partner } from '../../types/partner';
import type { GalleryAlbum } from '../../types/gallery';
import type { Team } from '../../types/team';
import type { Contact } from '../../types/contact';
import type { MohylaGame } from '../../types/game';
import styles from './HomePage.module.css';

const PLATFORM_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  email: 'Email',
  phone: 'Телефон',
};

function scrollToHash(hash: string) {
  if (!hash) return;
  const id = hash.replace(/^#/, '');
  const el = document.getElementById(id);
  if (el) {
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

export function HomePage() {
  const { settings } = useSiteSettings();
  const { hash } = useLocation();
  const [events, setEvents] = useState<PublicEventListItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [game, setGame] = useState<MohylaGame | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingGame, setLoadingGame] = useState(false);
  const [errorEvents, setErrorEvents] = useState('');

  useEffect(() => {
    scrollToHash(hash);
  }, [hash]);

  useEffect(() => {
    if (!settings.is_schedule_enabled) return;
    setLoadingEvents(true);
    fetchPublicEvents(3)
      .then(setEvents)
      .catch(() => setErrorEvents('Не вдалося завантажити події'))
      .finally(() => setLoadingEvents(false));
  }, [settings.is_schedule_enabled]);

  useEffect(() => {
    if (!settings.is_partners_enabled) return;
    fetchPublicPartners()
      .then((list) => setPartners(list.filter((p) => p.is_active)))
      .catch(() => setPartners([]));
  }, [settings.is_partners_enabled]);

  useEffect(() => {
    if (!settings.is_gallery_enabled) return;
    fetchPublicAlbums().then(setAlbums).catch(() => setAlbums([]));
  }, [settings.is_gallery_enabled]);

  useEffect(() => {
    if (!settings.is_teams_enabled) return;
    fetchTeams()
      .then((list) => setTeams(list.filter((t) => t.is_active)))
      .catch(() => setTeams([]));
  }, [settings.is_teams_enabled]);

  useEffect(() => {
    if (!settings.is_contacts_enabled) return;
    fetchContacts().then(setContacts).catch(() => setContacts([]));
  }, [settings.is_contacts_enabled]);

  useEffect(() => {
    if (!settings.is_mohyla_games_enabled) return;
    setLoadingGame(true);
    fetchMohylaGame(MOHYLA_GAME_ID)
      .then(setGame)
      .catch(() => setGame(null))
      .finally(() => setLoadingGame(false));
  }, [settings.is_mohyla_games_enabled]);

  return (
    <>
      <HeroSection />

      <section className={styles.mission}>
        <div className={styles.missionInner}>
          <div>
            <span className={styles.missionLabel}>Наша місія</span>
            <h2 className={styles.missionTitle}>Рух — частина студентського життя</h2>
          </div>
          <p className={styles.missionText}>
            Ми створюємо простір, де кожен студент НаУКМА може знайти свою активність —
            від благодійних марафонів до міжуніверситетських турнірів. Наша мета —
            популяризувати здоровий спосіб життя та зміцнювати спільноту через спорт.
          </p>
        </div>
      </section>

      {settings.is_mohyla_games_enabled && (
        <section id="mohyla-games" className={`${styles.section} ${styles.anchorSection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Могилянські ігри</h2>
              <p className={styles.sectionSubtitle}>
                Головний спортивний турнір студентської спільноти
              </p>
            </div>
          </div>

          {loadingGame && <p className={styles.loading}>Завантаження...</p>}
          {!loadingGame && game?.is_published && (
            <div className={styles.gamePreview}>
              <h3 className={styles.gameTitle}>{game.title}</h3>
              <p className={styles.gameLead}>{game.short_description}</p>
              {game.content && (
                <p className={styles.gameExcerpt}>
                  {game.content.length > 220 ? `${game.content.slice(0, 220)}…` : game.content}
                </p>
              )}
            </div>
          )}
          {!loadingGame && (!game || !game.is_published) && (
            <p className={styles.empty}>Інформація про ігри зʼявиться незабаром</p>
          )}

          <div className={styles.sectionFooter}>
            <Link to="/mohyla-games" className={styles.sectionCta}>
              Дізнатися більше
            </Link>
          </div>
        </section>
      )}

      {settings.is_schedule_enabled && (
        <section id="events" className={`${styles.section} ${styles.anchorSection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Розклад подій</h2>
              <p className={styles.sectionSubtitle}>Активне життя організації</p>
            </div>
          </div>

          {loadingEvents && <p className={styles.loading}>Завантаження...</p>}
          {errorEvents && <p className={styles.error}>{errorEvents}</p>}
          {!loadingEvents && !errorEvents && events.length === 0 && (
            <p className={styles.empty}>Наразі немає опублікованих подій</p>
          )}
          {!loadingEvents && !errorEvents && events.length > 0 && (
            <div className={styles.grid}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} asPreview />
              ))}
            </div>
          )}

          <div className={styles.sectionFooter}>
            <Link to="/events" className={styles.sectionCta}>
              Усі події
            </Link>
          </div>
        </section>
      )}

      {settings.is_teams_enabled && (
        <section id="teams" className={`${styles.section} ${styles.anchorSection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Команди</h2>
              <p className={styles.sectionSubtitle}>Спортивні колективи НаУКМА</p>
            </div>
          </div>

          {teams.length === 0 && (
            <p className={styles.empty}>Активних команд наразі немає</p>
          )}
          {teams.length > 0 && (
            <div className={styles.teamsRow}>
              {teams.slice(0, 4).map((team) => (
                <div key={team.id} className={styles.teamCard}>
                  <img src={resolveImageUrl(team.logo_url)} alt="" className={styles.teamLogo} />
                  <span className={styles.teamName}>{team.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.sectionFooter}>
            <Link to="/teams" className={styles.sectionCta}>
              Усі команди
            </Link>
          </div>
        </section>
      )}

      {settings.is_gallery_enabled && (
        <section id="gallery" className={`${styles.section} ${styles.anchorSection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Галерея</h2>
              <p className={styles.sectionSubtitle}>Фото з наших заходів</p>
            </div>
          </div>

          {albums.length === 0 && (
            <p className={styles.empty}>Альбомів наразі немає</p>
          )}
          {albums.length > 0 && (
            <div className={styles.albumsRow}>
              {albums.slice(0, 3).map((album) => (
                <div key={album.id} className={styles.albumCard}>
                  {album.cover_photo_url ? (
                    <img
                      src={resolveImageUrl(album.cover_photo_url)}
                      alt=""
                      className={styles.albumCover}
                    />
                  ) : (
                    <div className={styles.albumPlaceholder}>◎</div>
                  )}
                  <span className={styles.albumTitle}>{album.title}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.sectionFooter}>
            <Link to="/gallery" className={styles.sectionCta}>
              Усі альбоми
            </Link>
          </div>
        </section>
      )}

      {settings.is_partners_enabled && (
        <section id="partners" className={`${styles.section} ${styles.anchorSection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Партнери</h2>
              <p className={styles.sectionSubtitle}>Разом робимо спорт доступнішим</p>
            </div>
          </div>

          {partners.length === 0 && (
            <p className={styles.empty}>Партнерів наразі немає</p>
          )}
          {partners.length > 0 && (
            <div className={styles.partnersRow}>
              {partners.map((partner) => {
                const inner = (
                  <img
                    src={resolveImageUrl(partner.logo_url)}
                    alt={partner.name}
                    className={styles.partnerLogo}
                  />
                );
                return partner.link_url ? (
                  <a
                    key={partner.id}
                    href={partner.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.partnerCard}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={partner.id} className={styles.partnerCard}>
                    {inner}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {settings.is_contacts_enabled && (
        <section id="contacts" className={`${styles.section} ${styles.anchorSection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Контакти</h2>
              <p className={styles.sectionSubtitle}>Звʼяжіться з нами</p>
            </div>
          </div>

          {contacts.length === 0 && (
            <p className={styles.empty}>Контактів наразі немає</p>
          )}
          {contacts.length > 0 && (
            <ul className={styles.contactsList}>
              {contacts.map((contact) => (
                <li key={contact.id} className={styles.contactItem}>
                  <span className={styles.contactPlatform}>
                    {PLATFORM_LABELS[contact.platform_name] ?? contact.platform_name}
                  </span>
                  <span className={styles.contactValue}>{contact.contact_value}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
