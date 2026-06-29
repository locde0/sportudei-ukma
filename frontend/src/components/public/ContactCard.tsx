import type { Contact, ContactPlatform } from '../../types/contact';
import styles from './ContactCard.module.css';

const PLATFORM_LABELS: Record<ContactPlatform, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  facebook: 'Facebook',
  email: 'Email',
};

const PLATFORM_ICONS: Record<ContactPlatform, string> = {
  telegram: '✈',
  instagram: '◎',
  facebook: 'f',
  email: '@',
};

function contactHref(contact: Contact): string {
  if (contact.platform === 'email' && !contact.url.startsWith('mailto:')) {
    return `mailto:${contact.url}`;
  }
  return contact.url;
}

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  const href = contactHref(contact);
  const isExternal = contact.platform !== 'email';

  return (
    <a
      href={href}
      className={styles.card}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className={styles.icon} aria-hidden>
        {PLATFORM_ICONS[contact.platform]}
      </span>
      <span className={styles.platform}>
        {PLATFORM_LABELS[contact.platform]}
      </span>
      <span className={styles.name}>{contact.name}</span>
    </a>
  );
}
