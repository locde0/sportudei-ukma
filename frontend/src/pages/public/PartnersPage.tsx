import { useEffect, useState } from 'react';
import { fetchPublicPartners } from '../../api/partners';
import { resolveImageUrl } from '../../utils/imageUrl';
import type { Partner } from '../../types/partner';
import styles from './PartnersPage.module.css';

export function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicPartners()
      .then(setPartners)
      .catch(() => setError('Не вдалося завантажити партнерів'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Партнери</h1>
        <p className={styles.subtitle}>Організації, що підтримують Sportudei</p>
      </header>

      {loading && <p className={styles.state}>Завантаження...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && partners.length === 0 && (
        <p className={styles.state}>Партнерів поки немає</p>
      )}
      {!loading && !error && partners.length > 0 && (
        <div className={styles.cloud}>
          {partners.map((partner) => {
            const content = (
              <>
                <div className={styles.logoWrapper}>
                  <img
                    src={resolveImageUrl(partner.logo_url)}
                    alt={partner.name}
                    className={styles.logo}
                    loading="lazy"
                  />
                </div>
                <span className={styles.name}>{partner.name}</span>
              </>
            );
            return partner.link_url ? (
              <a
                key={partner.id}
                href={partner.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.item}
                aria-label={`Перейти на сайт ${partner.name}`}
              >
                {content}
              </a>
            ) : (
              <div key={partner.id} className={styles.item}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
