import { useEffect, useState } from 'react';
import { fetchSiteSettings, updateSiteSettings } from '../../api/settings';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSection } from '../../components/admin/AdminSection';
import { AdminToggle } from '../../components/admin/AdminToggle';
import { Button } from '../../components/ui/Button';
import type { SiteSettings } from '../../types/settings';
import styles from './AdminFormLayout.module.css';

export function SiteSettingsPage() {
  const { refresh: refreshGlobalSettings } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSiteSettings()
      .then(setForm)
      .catch(() => setError('Не вдалося завантажити налаштування'))
      .finally(() => setLoading(false));
  }, []);

  const patch = (partial: Partial<SiteSettings>) => {
    setForm((prev) => (prev ? { ...prev, ...partial } : prev));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError('');
    setSaved(false);
    setSubmitting(true);
    try {
      await updateSiteSettings(form);
      await refreshGlobalSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Не вдалося зберегти налаштування');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        Завантажуємо налаштування…
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminPageHeader
        eyebrow="Сайт"
        title="Налаштування"
        description="Видимість розділів для відвідувачів."
      />

      <form onSubmit={handleSubmit} className={styles.grid}>
        <div className={styles.mainCol}>
          {error && <div className={styles.error} style={{ marginBottom: '0.25rem' }}>{error}</div>}
          {saved && <div className={styles.success} style={{ marginBottom: '0.25rem' }}>Налаштування успішно збережено!</div>}
          <AdminSection icon="◈" title="Розділи сайту" description="Увімкніть або вимкніть блоки">
            <AdminToggle
              id="schedule"
              label="Розклад подій"
              checked={form.is_schedule_enabled}
              onChange={(v) => patch({ is_schedule_enabled: v })}
            />
            <AdminToggle
              id="mohyla"
              label="Могилянські ігри"
              checked={form.is_mohyla_games_enabled}
              onChange={(v) => patch({ is_mohyla_games_enabled: v })}
            />
            <AdminToggle
              id="teams"
              label="Команди"
              checked={form.is_teams_enabled}
              onChange={(v) => patch({ is_teams_enabled: v })}
            />
            <AdminToggle
              id="partners"
              label="Партнери"
              checked={form.is_partners_enabled}
              onChange={(v) => patch({ is_partners_enabled: v })}
            />
            <AdminToggle
              id="gallery"
              label="Галерея"
              checked={form.is_gallery_enabled}
              onChange={(v) => patch({ is_gallery_enabled: v })}
            />
            <AdminToggle
              id="contacts"
              label="Контакти"
              checked={form.is_contacts_enabled}
              onChange={(v) => patch({ is_contacts_enabled: v })}
            />
            
            <div style={{ marginTop: '1rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Зберігаємо…' : 'Зберегти налаштування'}
              </Button>
            </div>
          </AdminSection>
        </div>
      </form>
    </div>
  );
}
