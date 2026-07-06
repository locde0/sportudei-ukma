import { Link, useLocation } from 'react-router-dom';
import styles from './Logo.module.css';

interface LogoProps {
  size?: number;
  showText?: boolean;
  to?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function Logo({ size = 40, showText = true, to = '/', className = '', onClick }: LogoProps) {
  const location = useLocation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    if (to === '/' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Also clear the hash in the URL without reloading
      if (location.hash) {
        window.history.pushState(null, '', '/');
      }
    }
  };
  const content = (
    <>
      <img
        src="/logo.png"
        alt="Спортудей"
        width={size}
        height={size}
        className={styles.img}
      />
      {showText && (
        <span className={styles.textBlock}>
          <span className={styles.name}>Спортудей</span>
          <span className={styles.sub}>НаУКМА</span>
        </span>
      )}
    </>
  );

  const cls = `${styles.logo} ${className}`;

  if (to) {
    return (
      <Link to={to} className={cls} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return <div className={cls}>{content}</div>;
}
