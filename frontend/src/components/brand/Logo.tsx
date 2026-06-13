import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

interface LogoProps {
  size?: number;
  showText?: boolean;
  to?: string;
  className?: string;
}

export function Logo({ size = 40, showText = true, to = '/', className = '' }: LogoProps) {
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
      <Link to={to} className={cls}>
        {content}
      </Link>
    );
  }

  return <div className={cls}>{content}</div>;
}
