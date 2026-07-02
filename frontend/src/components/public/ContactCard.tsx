import type { Contact, ContactPlatform } from '../../types/contact';
import styles from './ContactCard.module.css';

const PLATFORM_LABELS: Record<ContactPlatform, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  facebook: 'Facebook',
  email: 'Email',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
};

const PLATFORM_ICONS: Record<ContactPlatform, React.ReactNode> = {
  telegram: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.15 4.39-2.92 5.74-1.76 1.34-4.04 1.86-6.17 1.5-2.14-.36-4.05-1.57-5.26-3.29-1.21-1.71-1.62-3.92-1.16-5.94.47-2.02 1.75-3.79 3.51-4.83 1.76-1.04 3.92-1.32 5.88-.76v4.06c-1.34-.63-3.03-.52-4.22.3-1.19.82-1.8 2.3-1.52 3.7.27 1.4 1.4 2.58 2.78 2.91 1.38.33 2.91-.07 3.91-.98 1-1.03 1.48-2.52 1.48-3.97l.04-16.2z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.064-.301-.15-1.264-.464-2.406-1.484-.888-.795-1.484-1.776-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.098-.201.046-.37-.029-.523-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.285-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345zm-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.99 1.005-3.66-.24-.375c-.99-1.576-1.515-3.391-1.515-5.26 0-5.445 4.455-9.885 9.916-9.885 2.655 0 5.145 1.035 7.02 2.91 1.875 1.875 2.91 4.365 2.91 7.02 0 5.43-4.441 9.855-9.896 9.855zm8.461-18.33c-2.265-2.265-5.28-3.51-8.475-3.51-6.585 0-11.94 5.355-11.94 11.94 0 2.115.555 4.17 1.605 5.985l-1.74 6.33 6.465-1.695c1.77.945 3.75 1.455 5.79 1.455h.015c6.585 0 11.94-5.355 11.94-11.94 0-3.195-1.245-6.195-3.51-8.46z" />
    </svg>
  ),
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
      className={`${styles.chip} ${styles[contact.platform]}`}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      aria-label={`${PLATFORM_LABELS[contact.platform]}: ${contact.name}`}
    >
      <span className={styles.icon} aria-hidden="true">
        {PLATFORM_ICONS[contact.platform]}
      </span>
      <span className={styles.content}>
        <span className={styles.platform}>{PLATFORM_LABELS[contact.platform]}</span>
        <span className={styles.name}>{contact.name}</span>
      </span>
    </a>
  );
}
