import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchPublicPartners } from '../../api/partners';
import { fetchPublicAlbums } from '../../api/gallery';
import { fetchTeams } from '../../api/teams';
import { fetchMohylaGame } from '../../api/games';
import { fetchContacts } from '../../api/contacts';
import { fetchPublicEvents } from '../../api/events';
import { HeroSection } from '../../components/public/HeroSection';
import { EventCard } from '../../components/public/EventCard';
import { TeamCard } from '../../components/public/TeamCard';
import { AlbumCard } from '../../components/public/AlbumCard';
import { PartnerCard } from '../../components/public/PartnerCard';
import { ContactCard } from '../../components/public/ContactCard';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import type { PublicEventListItem } from '../../types/event';
import type { Partner } from '../../types/partner';
import type { GalleryAlbum } from '../../types/gallery';
import type { Team } from '../../types/team';
import type { Contact } from '../../types/contact';
import type { MohylaGame } from '../../types/game';
import styles from './HomePage.module.css';

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
  const [loadingEvents, setLoadingEvents] = useState(settings.is_events_enabled);
  const [loadingGame, setLoadingGame] = useState(settings.is_mohyla_game_enabled);
  const [errorEvents, setErrorEvents] = useState('');

  useEffect(() => {
    scrollToHash(hash);
  }, [hash]);

  useEffect(() => {
    if (!settings.is_events_enabled) return;
    let ignore = false;
    fetchPublicEvents(3, 0)
      .then((data) => { if (!ignore) setEvents(data); })
      .catch(() => { if (!ignore) setErrorEvents('Не вдалося завантажити події'); })
      .finally(() => { if (!ignore) setLoadingEvents(false); });
    return () => { ignore = true; };
  }, [settings.is_events_enabled]);

  useEffect(() => {
    if (!settings.is_partners_enabled) return;
    fetchPublicPartners()
      .then(setPartners)
      .catch(() => setPartners([]));
  }, [settings.is_partners_enabled]);

  useEffect(() => {
    if (!settings.is_gallery_enabled) return;
    fetchPublicAlbums(3, 0).then(setAlbums).catch(() => setAlbums([]));
  }, [settings.is_gallery_enabled]);

  useEffect(() => {
    if (!settings.is_teams_enabled) return;
    fetchTeams()
      .then(setTeams)
      .catch(() => setTeams([]));
  }, [settings.is_teams_enabled]);

  useEffect(() => {
    if (!settings.is_contacts_enabled) return;
    fetchContacts().then(setContacts).catch(() => setContacts([]));
  }, [settings.is_contacts_enabled]);

  useEffect(() => {
    if (!settings.is_mohyla_game_enabled) return;
    let ignore = false;
    fetchMohylaGame()
      .then((data) => { if (!ignore) setGame(data); })
      .catch(() => { if (!ignore) setGame(null); })
      .finally(() => { if (!ignore) setLoadingGame(false); });
    return () => { ignore = true; };
  }, [settings.is_mohyla_game_enabled]);

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

      {settings.is_mohyla_game_enabled && (
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
          {!loadingGame && game?.title && (
            <div className={styles.gamePreview}>
              <h3 className={styles.gameTitle}>{game.title}</h3>
              {game.description && (
                <p className={styles.gameLead}>{game.description}</p>
              )}
              {game.content && (
                <p className={styles.gameExcerpt}>
                  {game.content.length > 220 ? `${game.content.slice(0, 220)}…` : game.content}
                </p>
              )}
            </div>
          )}
          {!loadingGame && !game?.title && (
            <p className={styles.empty}>Інформація про ігри зʼявиться незабаром</p>
          )}

          <div className={styles.sectionFooter}>
            <Link to="/mohyla-games" className={styles.sectionCta}>
              Дізнатися більше
            </Link>
          </div>
        </section>
      )}

      {settings.is_events_enabled && (
        <section id="events" className={`${styles.section} ${styles.anchorSection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Події</h2>
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
                <EventCard key={event.id} event={event} />
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
            <div className={styles.grid}>
              {teams.slice(0, 4).map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}

          {teams.length > 4 && (
            <div className={styles.sectionFooter}>
              <Link to="/teams" className={styles.sectionCta}>
                Усі команди
              </Link>
            </div>
          )}
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
            <div className={styles.grid}>
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          )}

          <div className={styles.sectionFooter}>
            <Link to="/gallery" className={styles.sectionCta}>
              Уся галерея
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
            <div className={styles.cloud}>
              {partners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
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
            <div className={styles.chips}>
              {contacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
