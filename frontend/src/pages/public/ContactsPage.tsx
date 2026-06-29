import { useEffect, useState } from 'react';
import { fetchContacts } from '../../api/contacts';
import { ContactCard } from '../../components/public/ContactCard';
import type { Contact } from '../../types/contact';
import page from '../../styles/publicPage.module.css';

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
    <div className={page.page}>
      <header className={page.header}>
        <h1 className={page.title}>Контакти</h1>
        <p className={page.subtitle}>Звʼяжіться з командою Sportudei</p>
      </header>

      {loading && <p className={page.state}>Завантаження...</p>}
      {error && <p className={page.error}>{error}</p>}
      {!loading && !error && contacts.length === 0 && (
        <p className={page.state}>Контактів поки немає</p>
      )}
      {!loading && !error && contacts.length > 0 && (
        <div className={page.grid}>
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
}
