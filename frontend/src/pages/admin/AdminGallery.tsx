import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAlbum, deleteAlbum, fetchAdminAlbums } from '../../api/gallery';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Badge } from '../../components/ui/Badge';
import { LinkButton, Button } from '../../components/ui/Button';
import { resolveImageUrl } from '../../utils/imageUrl';
import type { GalleryAlbum } from '../../types/gallery';
import styles from './AdminListLayout.module.css';

export function AdminGallery() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminAlbums()
      .then(setAlbums)
      .catch(() => setError('Не вдалося завантажити альбоми'))
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

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { id } = await createAlbum({ title: 'Новий альбом', is_published: false });
      navigate(`/admin/gallery/${id}`);
    } catch {
      setError('Не вдалося створити альбом');
      setCreating(false);
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
      await deleteAlbum(id);
      load();
      setConfirmId(null);
    } catch {
      setDeleteErrorId(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Медіа"
        title="Галерея"
        description="Керуйте фотоальбомами."
        actions={
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Створюємо…' : '+ Новий альбом'}
          </Button>
        }
      />

      {error && (
        <div className={`${styles.stateBox} ${styles.stateBoxError}`}>{error}</div>
      )}

      {loading && (
        <div className={styles.stateBox}>Завантаження…</div>
      )}
      {!loading && !error && albums.length === 0 && (
        <div className={styles.stateBox}>
          <div className={styles.emptyIcon}>▣</div>
          <p className={styles.emptyTitle}>Альбомів ще немає</p>
          <p>Створіть перший альбом — він зʼявиться тут і на головній сторінці.</p>
          <div style={{ marginTop: '1.25rem' }}>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Створюємо…' : 'Створити альбом'}
            </Button>
          </div>
        </div>
      )}
      {!loading && !error && albums.length > 0 && (
        <div className={styles.list}>
          {albums.map((album) => {
            const isConfirming = confirmId === album.id;
            return (
            <article
              key={album.id}
              className={`${styles.card} ${isConfirming ? styles.cardConfirming : ''}`}
            >
              <div className={styles.thumbWrap}>
                {album.cover_photo_url ? (
                  <img
                    src={resolveImageUrl(album.cover_photo_url)}
                    alt=""
                    className={styles.thumb}
                  />
                ) : (
                  <div className={styles.thumbEmpty}>◎</div>
                )}
              </div>
              <div className={styles.body}>
                <div className={styles.meta}>
                  <span className={styles.id}>#{album.id}</span>
                  <Badge published={album.is_published} />
                  <span className={styles.count}>{album.photo_count} фото</span>
                </div>
                <h2 className={styles.title}>{album.title}</h2>
              </div>
              <div className={styles.actions}>
                <LinkButton to={`/admin/gallery/${album.id}`} variant="secondary" size="sm">
                  Редагувати
                </LinkButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(album.id);
                  }}
                  disabled={deletingId !== null}
                >
                  Видалити
                </Button>
              </div>

              {confirmId === album.id && (
                <div
                  className={styles.confirmOverlay}
                  role="dialog"
                  aria-modal="true"
                  onClick={cancelDelete}
                >
                  <div className={styles.confirmCenter}>
                    <p className={styles.confirmTitle}>Видалити альбом?</p>
                    {deleteErrorId === album.id && (
                      <p className={styles.confirmError}>Не вдалося видалити</p>
                    )}
                  </div>
                  <div
                    className={styles.confirmActions}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDelete(album.id)}
                      disabled={deletingId === album.id}
                    >
                      {deletingId === album.id ? 'Видалення…' : 'Так'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={cancelDelete}
                      disabled={deletingId === album.id}
                    >
                      Ні
                    </Button>
                  </div>
                </div>
              )}
            </article>
          )})}
        </div>
      )}
    </div>
  );
}
