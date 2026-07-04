import { useEffect, useState } from 'react';
import { fetchMohylaGame, updateMohylaGame } from '../../api/games';
import { AdminField } from '../../components/admin/AdminField';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSection } from '../../components/admin/AdminSection';
import { Button, LinkButton } from '../../components/ui/Button';
import styles from './AdminFormLayout.module.css';

export function MohylaGamesForm() {
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (error || saved) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error, saved]);

  useEffect(() => {
    fetchMohylaGame()
      .then((game) => {
        setTitle(game.title);
        setShortDesc(game.description);
        setContent(game.content);
      })
      .catch(() => setError('Не вдалося завантажити сторінку'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!title.trim() || !shortDesc.trim() || !content.trim()) {
      setError('Заповніть усі поля');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSubmitting(true);
    try {
      await updateMohylaGame({
        title,
        description: shortDesc,
        content,
      });
      setSaved(true);
      // Hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Не вдалося зберегти');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        Завантажуємо контент…
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminPageHeader
        eyebrow="Контент"
        title="Могилянські ігри"
        description="Редагування сторінки Могилянських ігор."
      />

      {error && <div className={styles.error}>{error}</div>}
      {saved && <div className={styles.success}>Зміни успішно збережено!</div>}

      <form onSubmit={handleSubmit} className={styles.grid}>
        <div className={styles.mainCol}>
          <AdminSection icon="✦" title="Заголовок і превʼю">
            <AdminField
              id="title"
              label="Назва"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <AdminField
              as="textarea"
              id="shortDesc"
              label="Короткий опис"
              required
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              style={{ minHeight: '100px' }}
            />
          </AdminSection>

          <AdminSection icon="¶" title="Повний текст">
            <AdminField
              as="textarea"
              id="content"
              label="Контент"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </AdminSection>
        </div>

        <aside className={styles.sideCol}>
          <div className={styles.publishCard}>
            <p className={styles.publishCardTitle}>Дії</p>
            <div className={styles.sideActions}>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Зберігаємо…' : 'Зберегти зміни'}
              </Button>
              <LinkButton to="/admin" variant="secondary" disabled={submitting}>
                Скасувати
              </LinkButton>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
