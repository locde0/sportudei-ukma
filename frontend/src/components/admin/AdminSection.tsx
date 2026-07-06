import type { ReactNode } from 'react';
import styles from './AdminSection.module.css';

interface AdminSectionProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  compact?: boolean;
}

export function AdminSection({
  icon,
  title,
  description,
  children,
  compact,
}: AdminSectionProps) {
  return (
    <section className={`${styles.section} ${compact ? styles.compact : ''}`}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden>{icon}</span>
        <div className={styles.headText}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {description && <p className={styles.sectionDesc}>{description}</p>}
        </div>
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
