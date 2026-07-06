import { useEffect, useRef, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAlbum, fetchAdminAlbums } from '../../api/gallery';
import { AdminField } from '../../components/admin/AdminField';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSection } from '../../components/admin/AdminSection';
import { Button, LinkButton } from '../../components/ui/Button';
import styles from './AdminFormLayout.module.css';

export function AlbumCreateForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const handleFileSelect = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !coverFile) {
      setError('Заповніть назву та оберіть обкладинку альбому.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const beforeAlbums = await fetchAdminAlbums();
      const beforeIds = new Set(beforeAlbums.map((a) => a.id));
      await createAlbum({ title: title.trim(), is_published: isPublished }, coverFile);
      const updated = await fetchAdminAlbums();
      const created = updated.find((a) => !beforeIds.has(a.id)) ?? updated[updated.length - 1];
      if (created) {
        navigate(`/admin/gallery/${created.id}`);
      } else {
        navigate('/admin/gallery');
      }
    } catch {
      setError('Не вдалося створити альбом');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/admin/gallery')}>
        ← До списку альбомів
      </button>

      <AdminPageHeader
        eyebrow="Галерея"
        title="Новий альбом"
      />

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.grid}>
        <div className={styles.mainCol}>
          <AdminSection icon="✦" title="Альбом">
            <AdminField
              id="title"
              label="Назва"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </AdminSection>

          <AdminSection icon="▣" title="Обкладинка">
            <div className={styles.fileField}>
              <span className={styles.fileLabel}>
                Фото обкладинки<span className={styles.required}>*</span>
              </span>
              <div
                className={`${styles.fileZone} ${isDragging ? styles.fileZoneDragging : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <div className={styles.fileZoneIcon}>+</div>
                <p className={styles.fileZoneText}>Додайте обкладинку</p>
                <p className={styles.fileZoneHint}>Натисніть або перетягніть (PNG, JPEG, WebP)</p>

                {previewUrl && (
                  <div style={{ marginTop: '1rem' }}>
                    <img src={previewUrl} alt="" className={styles.preview} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  className={styles.fileInput}
                  ref={fileInputRef}
                  onChange={handleInputChange}
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
                  {isPublished ? 'Опубліковано' : 'Чернетка'}
                </p>
                <p className={styles.publishHint}>
                  {isPublished
                    ? 'Видно на головній сторінці'
                    : 'Збережеться, але не показується'}
                </p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <span className={styles.toggleTrack} />
                <span className={styles.toggleThumb} />
              </label>
            </div>
            <div className={styles.sideActions}>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Створюємо…' : 'Створити альбом'}
              </Button>
              <LinkButton to="/admin/gallery" variant="secondary">
                Скасувати
              </LinkButton>
            </div>
          </div>

          <div className={styles.tips}>
            Після створення альбому ви зможете додати більше фотографій, змінити їх порядок та обкладинку на сторінці редагування.
          </div>
        </aside>
      </form>
    </div>
  );
}
