import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { Logo } from '../brand/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import styles from './PublicLayout.module.css';

const NAV_ITEMS = [
  {
    hash: 'mohyla-games',
    label: 'Могилянські ігри',
    flag: 'is_mohyla_games_enabled' as const,
  },
  { hash: 'events', label: 'Розклад подій', flag: 'is_schedule_enabled' as const },
  { hash: 'teams', label: 'Команди', flag: 'is_teams_enabled' as const },
  { hash: 'gallery', label: 'Галерея', flag: 'is_gallery_enabled' as const },
  { hash: 'partners', label: 'Партнери', flag: 'is_partners_enabled' as const },
  { hash: 'contacts', label: 'Контакти', flag: 'is_contacts_enabled' as const },
];

function scrollToSection(hash: string) {
  const id = hash.replace(/^#/, '');
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function PublicLayout() {
  const { settings } = useSiteSettings();
  const { pathname, hash } = useLocation();
  const isHome = pathname === '/';
  const [activeHash, setActiveHash] = useState(hash);
  const isScrollSpyActive = useRef(true);

  useEffect(() => {
    document.documentElement.classList.add('public-no-scrollbar');
    return () => document.documentElement.classList.remove('public-no-scrollbar');
  }, []);

  useEffect(() => {
    setActiveHash(hash);
  }, [hash]);

  // Scroll-spy: observe section elements and update activeHash
  useEffect(() => {
    if (!isHome) return;

    const sectionIds = NAV_ITEMS.filter((item) => settings[item.flag]).map(
      (item) => item.hash,
    );
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!isScrollSpyActive.current) return;
        // Find the first entry that is intersecting (top-most visible section)
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const newHash = `#${entry.target.id}`;
            setActiveHash(newHash);
            break;
          }
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome, settings]);

  const visibleNav = NAV_ITEMS.filter((item) => settings[item.flag]);

  const handleSectionClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionHash: string) => {
      const target = `#${sectionHash}`;
      if (isHome) {
        e.preventDefault();
        // Temporarily disable scroll-spy so the clicked item stays highlighted
        isScrollSpyActive.current = false;
        setActiveHash(target);
        scrollToSection(target);
        window.history.pushState(null, '', target);
        // Re-enable scroll-spy after scroll finishes
        setTimeout(() => {
          isScrollSpyActive.current = true;
        }, 800);
      }
    },
    [isHome],
  );

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo size={42} />

          <div className={styles.headerRight}>
            <nav className={styles.nav}>
              {visibleNav.map((item) => {
                const href = `/#${item.hash}`;
                const isActive = isHome && activeHash === `#${item.hash}`;

                return (
                  <a
                    key={item.hash}
                    href={href}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    onClick={(e) => handleSectionClick(e, item.hash)}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrandRow}>
            <Logo size={36} showText={false} to="/" />
            <div className={styles.footerText}>
              <span className={styles.footerBrand}>Спортудей</span>
              <span className={styles.footerMotto}>Спорт завжди!</span>
            </div>
          </div>
          {isHome && visibleNav.length > 0 && (
            <nav className={styles.footerNav} aria-label="Розділи сторінки">
              {visibleNav.map((item) => (
                <a
                  key={item.hash}
                  href={`/#${item.hash}`}
                  className={styles.footerNavLink}
                  onClick={(e) => handleSectionClick(e, item.hash)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
          {!isHome && (
            <Link to="/" className={styles.footerHomeLink}>
              На головну
            </Link>
          )}
          <span className={styles.footerCopy}>
            © {new Date().getFullYear()} Студентська організація НаУКМА
          </span>
        </div>
      </footer>
    </div>
  );
}
