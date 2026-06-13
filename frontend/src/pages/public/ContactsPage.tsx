import { useEffect, useState } from 'react';
import { fetchContacts } from '../../api/contacts';
import type { Contact } from '../../types/contact';
import styles from './ContactsPage.module.css';

const PLATFORM_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  email: 'Email',
  phone: 'Телефон',
};

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts()
      .then(setContacts)
      .catch(() => setError('Не вдалося завантажити контакти'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Контакти</h1>
        <p className={styles.subtitle}>Звʼяжіться з командою Sportudei</p>
      </header>

      {loading && <p className={styles.state}>Завантаження...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && contacts.length === 0 && (
        <p className={styles.state}>Контактів поки немає</p>
      )}
      {!loading && !error && contacts.length > 0 && (
        <ul className={styles.list}>
          {contacts.map((contact) => (
            <li key={contact.id} className={styles.item}>
              <span className={styles.platform}>
                {PLATFORM_LABELS[contact.platform_name] ?? contact.platform_name}
              </span>
              <span className={styles.value}>{contact.contact_value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
