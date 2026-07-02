import { useCallback, useEffect, useState } from 'react';
import {
  createContact,
  deleteContact,
  fetchContacts,
  updateContact,
  updateContactOrder,
} from '../../api/contacts';
import { AdminField } from '../../components/admin/AdminField';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSection } from '../../components/admin/AdminSection';
import { SortableList } from '../../components/admin/SortableList';
import { Button } from '../../components/ui/Button';
import type { Contact, ContactPlatform } from '../../types/contact';
import styles from './AdminCrudList.module.css';
import listStyles from './AdminListLayout.module.css';

const PLATFORMS: { value: ContactPlatform; label: string }[] = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'email', label: 'Email' },
];

export function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [platform, setPlatform] = useState<ContactPlatform>('telegram');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchContacts()
      .then((list) => setContacts([...list].sort((a, b) => a.display_order - b.display_order)))
      .catch(() => setError('Не вдалося завантажити контакти'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (confirmId === null) return;
    const handleClickOutside = () => {
      setConfirmId(null);
      setDeleteErrorId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [confirmId]);

  const resetForm = () => {
    setEditingId(null);
    setPlatform('telegram');
    setName('');
    setUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    if (!name.trim() || !url.trim()) {
      setError(
        editingId
          ? 'Не вдалося зберегти. Перевірте поля та спробуйте ще раз.'
          : 'Не вдалося додати. Перевірте поля та спробуйте ще раз.'
      );
      setTimeout(() => setError(''), 3000);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await updateContact(editingId, { platform, name: name.trim(), url: url.trim() });
      } else {
        await createContact({
          platform,
          name: name.trim(),
          url: url.trim(),
          displayOrder: contacts.length,
        });
      }
      const msg = editingId ? 'Зміни успішно збережено!' : 'Контакт успішно додано!';
      resetForm();
      load();
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError(editingId ? 'Не вдалося зберегти контакт' : 'Не вдалося додати контакт');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setConfirmId(id);
    setDeleteErrorId(null);
  };

  const cancelDelete = () => {
    if (deletingId !== null) return;
    setConfirmId(null);
    setDeleteErrorId(null);
  };

  const confirmDelete = async (id: number) => {
    setDeletingId(id);
    setDeleteErrorId(null);
    try {
      await deleteContact(id);
      if (editingId === id) resetForm();
      load();
      setConfirmId(null);
    } catch {
      setDeleteErrorId(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleReorder = async (next: Contact[]) => {
    setContacts(next);
    setSavingOrder(true);
    try {
      await Promise.all(
        next.map((contact, index) => updateContactOrder(contact.id, index)),
      );
    } catch {
      setError('Не вдалося зберегти порядок');
      load();
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className={styles.pageContent}>
      <AdminPageHeader
        eyebrow="Управління"
        title="Контакти"
        description="Керуйте контактними даними. Перетягніть для зміни порядку."
      />

      {error && <div className={styles.error}>{error}</div>}
      {successMsg && <div className={styles.success}>{successMsg}</div>}

      <AdminSection icon={editingId ? '✎' : '+'} title={editingId ? 'Редагування' : 'Новий контакт'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <AdminField
              as="select"
              label="Платформа"
              name="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as ContactPlatform)}
              options={PLATFORMS}
              required
            />
            <AdminField
              label="Назва"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sportudei UKMA"
              required
            />
            <AdminField
              label="Посилання"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://t.me/... або mailto:..."
              required
            />
          </div>
          <div className={styles.formActions}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Зберігаємо…' : editingId ? 'Зберегти' : 'Додати'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Скасувати
              </Button>
            )}
          </div>
        </form>
      </AdminSection>

      {loading && (
        <div className={listStyles.stateBox}>Завантаження…</div>
      )}
      {!loading && contacts.length === 0 && (
        <div className={listStyles.stateBox}>
          <div className={listStyles.emptyIcon}>☎</div>
          <p className={listStyles.emptyTitle}>Контактів ще немає</p>
          <p>Додайте перший контакт через форму вище.</p>
        </div>
      )}
      {!loading && contacts.length > 0 && (
        <AdminSection
          icon="⠿"
          title="Список"
          description={savingOrder ? 'Зберігаємо порядок…' : 'Перетягніть для сортування'}
        >
          <SortableList
            items={contacts}
            onReorder={handleReorder}
            disabled={savingOrder}
            onDragStart={() => setConfirmId(null)}
            confirmingId={confirmId}
            renderItem={(contact, index) => (
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
                <div className={listStyles.body}>
                  <h2 className={listStyles.title}>
                    <span className={listStyles.id} style={{ marginRight: '0.5rem' }}>#{index + 1}</span>
                    {PLATFORMS.find((p) => p.value === contact.platform)?.label ??
                      contact.platform}
                  </h2>
                  <div className={listStyles.details}>
                    <span className={listStyles.detail}>{contact.name}</span>
                    <span className={listStyles.detailMuted}>{contact.url}</span>
                  </div>
                </div>
                <div className={listStyles.actions} style={{ marginLeft: 'auto' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingId(contact.id);
                      setPlatform(contact.platform);
                      setName(contact.name);
                      setUrl(contact.url);
                    }}
                  >
                    Редагувати
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={listStyles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(contact.id);
                    }}
                    disabled={deletingId !== null}
                  >
                    Видалити
                  </Button>
                </div>

                {confirmId === contact.id && (
                  <div
                    className={listStyles.confirmOverlay}
                    role="dialog"
                    aria-modal="true"
                    onClick={cancelDelete}
                  >
                    <div className={listStyles.confirmCenter}>
                      <p className={listStyles.confirmTitle}>Видалити контакт?</p>
                      {deleteErrorId === contact.id && (
                        <p className={listStyles.confirmError}>Не вдалося видалити</p>
                      )}
                    </div>
                    <div
                      className={listStyles.confirmActions}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => confirmDelete(contact.id)}
                        disabled={deletingId === contact.id}
                      >
                        {deletingId === contact.id ? 'Видалення…' : 'Так'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelDelete}
                        disabled={deletingId === contact.id}
                      >
                        Ні
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          />
        </AdminSection>
      )}
    </div>
  );
}
