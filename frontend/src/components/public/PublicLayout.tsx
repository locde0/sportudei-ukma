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
    flag: 'is_mohyla_game_enabled' as const,
    wide: true,
  },
  { hash: 'events', label: 'Події', flag: 'is_events_enabled' as const },
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('public-no-scrollbar');
    return () => document.documentElement.classList.remove('public-no-scrollbar');
  }, []);

  // Close menu on route/hash change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, hash]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    setActiveHash(hash);
  }, [hash]);

  // Scroll-spy: track scroll position to update activeHash
  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      if (!isScrollSpyActive.current) return;

      const sectionIds = NAV_ITEMS.filter((item) => settings[item.flag]).map((item) => item.hash);
      if (sectionIds.length === 0) return;

      // Check if we're at the very bottom of the page
      const isAtBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50;
      if (isAtBottom) {
        setActiveHash(`#${sectionIds[sectionIds.length - 1]}`);
        return;
      }

      let currentActive = '';
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      // Get valid elements and sort them by offsetTop
      const elements = sectionIds
        .map((id) => ({ id, el: document.getElementById(id) }))
        .filter(({ el }) => el !== null)
        .sort((a, b) => a.el!.offsetTop - b.el!.offsetTop);

      for (const { id, el } of elements) {
        if (el!.offsetTop <= scrollPosition) {
          currentActive = `#${id}`;
        }
      }

      // If we scroll to the very top, clear active hash (or set it to hero, but hero isn't in NAV_ITEMS)
      if (window.scrollY < 100) {
        currentActive = '';
      }

      setActiveHash(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome, settings]);

  const visibleNav = NAV_ITEMS.filter((item) => settings[item.flag]);

  const handleSectionClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionHash: string) => {
      setMenuOpen(false);
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

  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
      setActiveHash('');
    }
  }, [isHome]);

  return (
    <div className={styles.layout}>
      <header className={`${styles.header} ${menuOpen ? styles.headerMenuOpen : ''}`}>
        <div className={styles.headerInner}>
          <Logo size={42} onClick={handleLogoClick} />

          <div className={styles.headerRight}>
            {/* Desktop nav */}
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
            {/* Mobile hamburger */}
            <button
              className={styles.burger}
              aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineTop : ''}`} />
              <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineMid : ''}`} />
              <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineBot : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ''}`}
        aria-label="Мобільна навігація"
      >
        {visibleNav.map((item) => {
          const href = `/#${item.hash}`;
          const isActive = isHome && activeHash === `#${item.hash}`;
          return (
          <a
              key={item.hash}
              href={href}
              className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''} ${'wide' in item && item.wide ? styles.mobileNavLinkWide : ''}`}
              onClick={(e) => handleSectionClick(e, item.hash)}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrandRow}>
            <Logo size={36} showText={false} to="/" onClick={handleLogoClick} />
            <span className={styles.footerBrand}>Спортудей</span>
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
            © {new Date().getFullYear()} Спортудей. Студентська організація НаУКМА
          </span>
        </div>
      </footer>
    </div>
  );
}
