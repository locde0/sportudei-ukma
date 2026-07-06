import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buildTeamFormData, createTeam, fetchAdminTeam, updateTeam } from '../../api/teams';
import { AdminField } from '../../components/admin/AdminField';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSection } from '../../components/admin/AdminSection';
import { Button, LinkButton } from '../../components/ui/Button';
import { resolveImageUrl } from '../../utils/imageUrl';
import styles from './AdminFormLayout.module.css';

export function TeamForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    fetchAdminTeam(Number(id))
      .then((team) => {
        setName(team.name);
        setDescription(team.description);
        setIsActive(team.is_active);
        setCurrentLogoUrl(team.logo_url);
      })
      .catch(() => setError('Не вдалося завантажити команду'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || (!isEdit && !logo)) {
      setError('Не вдалося зберегти. Перевірте поля та спробуйте ще раз.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formData = buildTeamFormData({
        name,
        description,
        is_active: isActive,
        logo,
      });
      if (isEdit && id) {
        await updateTeam(Number(id), formData);
      } else {
        await createTeam(formData);
      }
      navigate('/admin/teams');
    } catch {
      setError('Не вдалося зберегти команду');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        Завантажуємо команду…
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/admin/teams')}>
        ← До списку команд
      </button>

      <AdminPageHeader
        eyebrow="Команди"
        title={isEdit ? name || 'Команда' : 'Нова команда'}
      />

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.grid}>
        <div className={styles.mainCol}>
          <AdminSection icon="✦" title="Дані команди">
            <AdminField
              id="name"
              label="Назва"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <AdminField
              as="textarea"
              id="description"
              label="Опис"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <div className={styles.fileField} style={{ marginTop: '0.5rem' }}>
              <span className={styles.fileLabel}>
                Логотип{!isEdit && <span className={styles.required}>*</span>}
              </span>
              <div
                className={`${styles.fileZone} ${isDraggingFiles ? styles.fileZoneDragging : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFiles(true);
                }}
                onDragLeave={() => setIsDraggingFiles(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFiles(false);
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) setLogo(file);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <div className={styles.fileZoneIcon}>+</div>
                <p className={styles.fileZoneText}>Додати логотип</p>
                <p className={styles.fileZoneHint}>Натисніть або перетягніть (PNG, JPEG, WebP, SVG)</p>
                
                {currentLogoUrl && !logo && (
                  <div style={{ marginTop: '1rem' }}>
                    <img src={resolveImageUrl(currentLogoUrl)} alt="" className={styles.preview} />
                  </div>
                )}
                {logo && (
                  <div style={{ marginTop: '1rem' }}>
                    <img src={URL.createObjectURL(logo)} alt="" className={styles.preview} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  ref={fileInputRef}
                  onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </AdminSection>
        </div>

        <aside className={styles.sideCol}>
          <div className={styles.publishCard}>
            <p className={styles.publishCardTitle}>Статус</p>

            <div className={styles.publishRow}>
              <div>
                <p className={styles.publishLabel}>
                  {isActive ? 'Активна' : 'Неактивна'}
                </p>
                <p className={styles.publishHint}>
                  {isActive
                    ? 'Видно на головній сторінці'
                    : 'Команду приховано'}
                </p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className={styles.toggleTrack} />
                <span className={styles.toggleThumb} />
              </label>
            </div>

            <div className={styles.sideActions}>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Зберігаємо…' : 'Зберегти'}
              </Button>
              <LinkButton to="/admin/teams" variant="secondary" disabled={submitting}>
                Скасувати
              </LinkButton>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
