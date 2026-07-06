import type { Partner } from '../../types/partner';
import { resolveVariantUrl } from '../../utils/imageUrl';
import { formatExternalUrl } from '../../utils/url';
import styles from './PartnerCard.module.css';

interface PartnerCardProps {
  partner: Partner;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const inner = (
    <>
      <div className={styles.logoWrapper}>
        <img
          src={resolveVariantUrl(partner.logo_url, 'md')}
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
        href={formatExternalUrl(partner.link_url)}
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
