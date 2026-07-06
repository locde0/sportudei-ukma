import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearAccessToken } from '../api/client';
import { Logo } from '../components/brand/Logo';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import styles from './AdminLayout.module.css';

import {
  IconDashboard,
  IconFlag,
  IconCalendar,
  IconUsers,
  IconPhoto,
  IconHandshake,
  IconPhone,
  IconSettings,
} from '../components/ui/Icons';

type NavItem = {
  to: string;
  end?: boolean;
  icon: React.ReactNode;
  label: string;
  match?: (path: string) => boolean;
};

const navItems: NavItem[] = [
  { to: '/admin', end: true, icon: <IconDashboard />, label: 'Огляд' },
  { to: '/admin/mohyla-games', end: true, icon: <IconFlag />, label: 'Могилянські ігри' },
  {
    to: '/admin/events',
    icon: <IconCalendar />,
    label: 'Події',
    match: (path) => path === '/admin/events' || path.startsWith('/admin/events/'),
  },
  {
    to: '/admin/teams',
    icon: <IconUsers />,
    label: 'Команди',
    match: (path) => path === '/admin/teams' || path.startsWith('/admin/teams/'),
  },
  {
    to: '/admin/gallery',
    icon: <IconPhoto />,
    label: 'Галерея',
    match: (path) =>
      path === '/admin/gallery' || path.startsWith('/admin/gallery/'),
  },
  { to: '/admin/partners', end: true, icon: <IconHandshake />, label: 'Партнери' },
  { to: '/admin/contacts', end: true, icon: <IconPhone />, label: 'Контакти' },
  { to: '/admin/settings', end: true, icon: <IconSettings />, label: 'Налаштування' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    clearAccessToken();
    navigate('/admin/login');
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <NavLink to="/admin" className={styles.brand}>
          <Logo size={40} showText={false} />
          <span className={styles.brandText}>
            <span className={styles.brandName}>Спортудей</span>
            <span className={styles.brandRole}>Керування</span>
          </span>
        </NavLink>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const active = item.match ? item.match(pathname) : pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.sidebarActions}>
            <ThemeToggle />
            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
              Вийти
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.mainInner}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
