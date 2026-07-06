import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteAlbum, fetchAdminAlbums } from '../../api/gallery';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Badge } from '../../components/ui/Badge';
import { LinkButton, Button } from '../../components/ui/Button';
import { resolveVariantUrl } from '../../utils/imageUrl';
import type { GalleryAlbum } from '../../types/gallery';
import styles from './AdminListLayout.module.css';

const PAGE_SIZE = 12;

export function AdminGallery() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null);

  const loadPage = useCallback(async (offset: number, append: boolean) => {
    const batch = await fetchAdminAlbums(PAGE_SIZE, offset);
    setAlbums((prev) => (append ? [...prev, ...batch] : batch));
    setHasMore(batch.length === PAGE_SIZE);
  }, []);

  useEffect(() => {
    let ignore = false;
    loadPage(0, false)
      .catch(() => {
        if (!ignore) setError('Не вдалося завантажити альбоми');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [loadPage]);

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLoadingMore(true);
          loadPage(albums.length, true)
            .catch(() => setError('Не вдалося завантажити ще альбоми'))
            .finally(() => setLoadingMore(false));
        }
      }, { rootMargin: '200px' });

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore, loadPage, albums.length],
  );

  useEffect(() => {
    if (confirmId === null) return;
    const handleClickOutside = () => {
      setConfirmId(null);
      setDeleteErrorId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [confirmId]);

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
      loadPage(0, false);
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
          <LinkButton to="/admin/gallery/new">
            + Новий альбом
          </LinkButton>
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
          <p>Створіть перший альбом — введіть назву та оберіть обкладинку.</p>
          <div style={{ marginTop: '1.25rem' }}>
            <LinkButton to="/admin/gallery/new">
              Створити альбом
            </LinkButton>
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
                    src={resolveVariantUrl(album.cover_photo_url, 'md')}
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
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {album.photo_count} фото
                  </span>
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

      {!loading && !error && albums.length > 0 && hasMore && (
        <div
          ref={loadMoreRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem'
          }}
        >
          {loadingMore && (
            <>
              <span className={styles.spinner} style={{ width: '1rem', height: '1rem', borderTopColor: 'var(--color-text-muted)' }} />
              Завантаження...
            </>
          )}
        </div>
      )}
    </div>
  );
}
