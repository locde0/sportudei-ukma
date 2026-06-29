import type { Partner } from '../../types/partner';
import { resolveImageUrl } from '../../utils/imageUrl';
import styles from './PartnerCard.module.css';

interface PartnerCardProps {
  partner: Partner;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const inner = (
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

  if (partner.link_url) {
    return (
      <a
        href={partner.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.item}
        aria-label={`Перейти на сайт ${partner.name}`}
      >
        {inner}
      </a>
    );
  }

  return <div className={styles.item}>{inner}</div>;
}
