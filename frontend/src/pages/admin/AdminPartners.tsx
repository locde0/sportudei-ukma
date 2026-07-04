import { useCallback, useEffect, useState, useRef } from 'react';
import {
  buildPartnerFormData,
  createPartner,
  deletePartner,
  fetchAdminPartners,
  updatePartner,
  updatePartnerOrder,
} from '../../api/partners';
import { AdminField } from '../../components/admin/AdminField';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSection } from '../../components/admin/AdminSection';
import { SortableList } from '../../components/admin/SortableList';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { resolveImageUrl } from '../../utils/imageUrl';
import type { Partner } from '../../types/partner';
import styles from './AdminCrudList.module.css';
import listStyles from './AdminListLayout.module.css';

export function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (error || successMsg) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error, successMsg]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null);

  /* ── Form state ────────────────────────────────── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ── Load list ─────────────────────────────────── */
  const load = useCallback(() => {
    setLoading(true);
    fetchAdminPartners()
      .then((list) => setPartners([...list].sort((a, b) => a.display_order - b.display_order)))
      .catch(() => setError('Не вдалося завантажити партнерів'))
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

  /* ── Form helpers ──────────────────────────────── */
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setLinkUrl('');
    setIsActive(true);
    setLogo(null);
    setCurrentLogoUrl('');
  };

  const startEdit = (partner: Partner) => {
    setEditingId(partner.id);
    setName(partner.name);
    setLinkUrl(partner.link_url ?? '');
    setIsActive(partner.is_active);
    setCurrentLogoUrl(partner.logo_url);
    setLogo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || (!editingId && !logo)) {
      setError(
        editingId
          ? 'Не вдалося зберегти. Перевірте поля та спробуйте ще раз.'
          : 'Не вдалося додати. Перевірте поля та спробуйте ще раз.'
      );
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSubmitting(true);
    try {
      const formData = buildPartnerFormData({
        name: name.trim(),
        link_url: linkUrl.trim(),
        is_active: isActive,
        logo,
      });
      if (editingId) {
        await updatePartner(editingId, formData);
      } else {
        await createPartner(formData);
      }
      const msg = editingId ? 'Зміни успішно збережено!' : 'Партнера успішно додано!';
      resetForm();
      load();
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError(editingId ? 'Не вдалося зберегти партнера' : 'Не вдалося додати партнера');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setLogo(e.dataTransfer.files[0]);
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
      await deletePartner(id);
      if (editingId === id) resetForm();
      load();
      setConfirmId(null);
    } catch {
      setDeleteErrorId(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleReorder = async (next: Partner[]) => {
    setPartners(next);
    setSavingOrder(true);
    try {
      await Promise.all(
        next.map((partner, index) => updatePartnerOrder(partner.id, index)),
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
        title="Партнери"
        description="Керуйте списком партнерів. Перетягніть для зміни порядку."
      />

      {error && <div className={styles.error}>{error}</div>}
      {successMsg && <div className={styles.success}>{successMsg}</div>}

      <AdminSection icon={editingId ? '✎' : '+'} title={editingId ? 'Редагування партнера' : 'Новий партнер'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <AdminField
                id="partnerName"
                label="Назва"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Назва організації"
              />
              <AdminField
                id="partnerLink"
                label="Посилання"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                hint="Необовʼязково"
              />
            </div>

            <div className={styles.toggleRow} style={{ alignSelf: 'start', marginTop: '1.5rem' }}>
              <div>
                <p className={styles.toggleLabel}>
                  {isActive ? 'Активний' : 'Неактивний'}
                </p>
                <p className={styles.toggleHint}>
                  {isActive ? 'Видно на сайті' : 'Приховано'}
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
          </div>

          <div className={styles.fileField}>
            <span className={styles.fileLabel}>
              Логотип{!editingId && <span className={styles.required}>*</span>}
            </span>
            <div
              className={`${styles.fileZone} ${isDraggingFiles ? styles.fileZoneDragging : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFiles(true);
              }}
              onDragLeave={() => setIsDraggingFiles(false)}
              onDrop={handleFileDrop}
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
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
              />
            </div>
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
      {!loading && partners.length === 0 && (
        <div className={listStyles.stateBox}>
          <div className={listStyles.emptyIcon}>◆</div>
          <p className={listStyles.emptyTitle}>Партнерів ще немає</p>
          <p>Додайте першого партнера через форму вище.</p>
        </div>
      )}
      {!loading && partners.length > 0 && (
        <AdminSection
          icon="⠿"
          title="Список"
          description={savingOrder ? 'Зберігаємо порядок…' : 'Перетягніть для сортування'}
        >
          <SortableList
            items={partners}
            onReorder={handleReorder}
            disabled={savingOrder}
            onDragStart={() => setConfirmId(null)}
            confirmingId={confirmId}
            renderItem={(partner, index) => (
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '1.25rem' }}>
                <div className={listStyles.thumbWrap} style={{ width: '64px', height: '48px' }}>
                  <img src={resolveImageUrl(partner.logo_url)} alt="" className={listStyles.thumbContain} />
                </div>
                <div className={listStyles.body}>
                  <div className={listStyles.meta}>
                    <span className={listStyles.id}>#{index + 1}</span>
                    <Badge active={partner.is_active} labelTrue="Активний" labelFalse="Неактивний" />
                    <span className={`${listStyles.id} ${listStyles.linkTruncate}`} title={partner.link_url || ''}>
                      {partner.link_url || 'Без посилання'}
                    </span>
                  </div>
                  <h2 className={listStyles.title}>{partner.name}</h2>
                </div>
                <div className={listStyles.actions} style={{ marginLeft: 'auto' }}>
                  <Button variant="secondary" size="sm" onClick={() => startEdit(partner)}>
                    Редагувати
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={listStyles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(partner.id);
                    }}
                    disabled={deletingId !== null}
                  >
                    Видалити
                  </Button>
                </div>

                {confirmId === partner.id && (
                  <div
                    className={listStyles.confirmOverlay}
                    role="dialog"
                    aria-modal="true"
                    onClick={cancelDelete}
                  >
                    <div className={listStyles.confirmCenter}>
                      <p className={listStyles.confirmTitle}>Видалити партнера?</p>
                      {deleteErrorId === partner.id && (
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
                        onClick={() => confirmDelete(partner.id)}
                        disabled={deletingId === partner.id}
                      >
                        {deletingId === partner.id ? 'Видалення…' : 'Так'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelDelete}
                        disabled={deletingId === partner.id}
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
