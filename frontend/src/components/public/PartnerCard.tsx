import type { Partner } from '../../types/partner';
import { resolveImageUrl } from '../../utils/imageUrl';
import styles from './PartnerCard.module.css';

interface PartnerCardProps {
  partner: Partner;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const inner = (
    <>
      <img
        src={resolveImageUrl(partner.logo_url)}
        alt={partner.name}
        className={styles.logo}
      />
      <span className={styles.name}>{partner.name}</span>
    </>
  );

  if (partner.link_url) {
    return (
      <a
        href={partner.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.card}
      >
        {inner}
      </a>
    );
  }

  return <div className={styles.card}>{inner}</div>;
}
