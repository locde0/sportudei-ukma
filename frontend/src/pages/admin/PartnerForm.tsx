import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buildPartnerFormData,
  createPartner,
  fetchAdminPartners,
  updatePartner,
} from '../../api/partners';
import { AdminField } from '../../components/admin/AdminField';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSection } from '../../components/admin/AdminSection';
import { Button, LinkButton } from '../../components/ui/Button';
import { IconArrowLeft, IconText } from '../../components/ui/Icons';
import { resolveVariantUrl } from '../../utils/imageUrl';
import styles from './AdminFormLayout.module.css';

export function PartnerForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
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
    fetchAdminPartners()
      .then((list) => {
        const partner = list.find((p) => p.id === Number(id));
        if (!partner) throw new Error('not found');
        setName(partner.name);
        setLinkUrl(partner.link_url ?? '');
        setIsActive(partner.is_active);
        setCurrentLogoUrl(partner.logo_url);
      })
      .catch(() => setError('Не вдалося завантажити партнера'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || (!isEdit && !logo)) {
      setError('Заповніть назву та завантажте логотип');
      return;
    }
    setSubmitting(true);
    try {
      const formData = buildPartnerFormData({
        name,
        link_url: linkUrl,
        is_active: isActive,
        logo,
      });
      if (isEdit && id) {
        await updatePartner(Number(id), formData);
      } else {
        await createPartner(formData);
      }
      navigate('/admin/partners');
    } catch {
      setError('Не вдалося зберегти партнера');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        Завантажуємо партнера…
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/admin/partners')}>
        <IconArrowLeft size={16} /> До списку
      </button>

      <AdminPageHeader
        eyebrow="Партнери"
        title={isEdit ? name || 'Партнер' : 'Новий партнер'}
      />

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.grid}>
        <div className={styles.mainCol}>
          <AdminSection icon={<IconText />} title="Дані партнера">
            <AdminField
              id="name"
              label="Назва"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <AdminField
              id="linkUrl"
              label="Посилання"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              hint="Необовʼязково"
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
              >
                {logo ? (
                  <img src={URL.createObjectURL(logo)} alt="" className={styles.preview} />
                ) : currentLogoUrl ? (
                  <img src={resolveVariantUrl(currentLogoUrl, 'md')} alt="" className={styles.preview} />
                ) : (
                  <>
                    <div className={styles.fileZoneIcon}>+</div>
                    <p className={styles.fileZoneText}>Додати логотип</p>
                    <p className={styles.fileZoneHint}>Перетягніть або натисніть</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
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
                  {isActive ? 'Активний' : 'Неактивний'}
                </p>
                <p className={styles.publishHint}>
                  {isActive
                    ? 'Видно на головній сторінці'
                    : 'Партнера приховано'}
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
              <LinkButton to="/admin/partners" variant="secondary" disabled={submitting}>
                Скасувати
              </LinkButton>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
