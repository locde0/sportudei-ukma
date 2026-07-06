import { useCallback, useRef, useState, type DragEvent } from 'react';
import type { EventPhoto, LocalGalleryItem } from '../../types/event';
import { resolveVariantUrl } from '../../utils/imageUrl';
import { IconStar, IconX } from '../ui/Icons';
import styles from './EventGalleryEditor.module.css';

function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function newLocalId() {
  return `local-${crypto.randomUUID()}`;
}

interface CreateGalleryProps {
  mode: 'create';
  items: LocalGalleryItem[];
  onChange: (items: LocalGalleryItem[]) => void;
}

interface EditGalleryProps {
  mode: 'edit';
  photos: EventPhoto[];
  onChange: (photos: EventPhoto[]) => void;
  onUpload: (file: File) => Promise<EventPhoto>;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

type EventGalleryEditorProps = CreateGalleryProps | EditGalleryProps;

export function EventGalleryEditor(props: EventGalleryEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState('');

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (props.mode !== 'edit') return;
      if (props.loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && props.hasMore && props.onLoadMore) {
          props.onLoadMore();
        }
      }, { rootMargin: '200px' });

      if (node) observerRef.current.observe(node);
    },
    [props],
  );

  const count =
    props.mode === 'create' ? props.items.length : props.photos.length;

  const acceptFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const images = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) return;

    setError('');

    if (props.mode === 'create') {
      const newItems: LocalGalleryItem[] = images.map((file) => ({
        localId: newLocalId(),
        file,
        previewUrl: URL.createObjectURL(file),
        isMain: false,
      }));
      const merged = [...props.items, ...newItems];
      if (!merged.some((i) => i.isMain) && merged.length > 0) {
        merged[0].isMain = true;
      }
      props.onChange(merged);
      return;
    }

    setUploading(true);
    setUploadProgress({ done: 0, total: images.length });
    try {
      // Upload in parallel with concurrency limit of 4
      const CONCURRENCY = 4;
      const results: EventPhoto[] = [];
      for (let i = 0; i < images.length; i += CONCURRENCY) {
        const batch = images.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.all(batch.map((f) => props.onUpload(f)));
        results.push(...batchResults);
        setUploadProgress({ done: Math.min(i + CONCURRENCY, images.length), total: images.length });
      }
      const next = [...props.photos, ...results];
      const normalized =
        !next.some((p) => p.is_main) && next.length > 0
          ? next.map((p, i) => ({ ...p, is_main: i === 0 }))
          : next;
      props.onChange(normalized);
    } catch {
      setError('Не вдалося завантажити фото');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDraggingFiles(false);
    acceptFiles(e.dataTransfer.files);
  };

  const handleCardDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleCardDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    setDropIndex(index);
  };

  const handleCardDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }

    if (props.mode === 'create') {
      props.onChange(reorder(props.items, dragIndex, index));
    } else {
      const reordered = reorder(props.photos, dragIndex, index).map((p, i) => ({
        ...p,
        display_order: i,
      }));
      props.onChange(reordered);
    }

    setDragIndex(null);
    setDropIndex(null);
  };

  const handleCardDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const setMainCreate = (index: number) => {
    if (props.mode !== 'create') return;
    props.onChange(
      props.items.map((item, i) => ({ ...item, isMain: i === index })),
    );
  };

  const setMainEdit = (index: number) => {
    if (props.mode !== 'edit') return;
    props.onChange(
      props.photos.map((p, i) => ({ ...p, is_main: i === index })),
    );
  };

  const removeCreate = (index: number) => {
    if (props.mode !== 'create') return;
    URL.revokeObjectURL(props.items[index].previewUrl);
    const next = props.items.filter((_, i) => i !== index);
    if (next.length > 0 && !next.some((i) => i.isMain)) {
      next[0].isMain = true;
    }
    props.onChange(next);
  };

  const removeEdit = (index: number) => {
    if (props.mode !== 'edit') return;
    const photo = props.photos[index];
    let next = props.photos.filter((_, i) => i !== index);
    if (photo.is_main && next.length > 0) {
      next = next.map((p, i) => ({ ...p, is_main: i === 0 }));
    }
    props.onChange(next.map((p, i) => ({ ...p, display_order: i })));
  };

  const renderCreateCard = (item: LocalGalleryItem, index: number) => (
    <div
      key={item.localId}
      className={[
        styles.card,
        item.isMain ? styles.cardMain : '',
        dragIndex === index ? styles.cardDragging : '',
        dropIndex === index && dragIndex !== index ? styles.cardDropTarget : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable
      onDragStart={() => handleCardDragStart(index)}
      onDragOver={(e) => handleCardDragOver(e, index)}
      onDrop={() => handleCardDrop(index)}
      onDragEnd={handleCardDragEnd}
    >
      <img src={item.previewUrl} alt={`Фото ${index + 1}`} draggable={false} />
      <span className={styles.position}>{index + 1}</span>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={item.isMain ? styles.iconBtnStarActive : styles.iconBtn}
          onClick={() => setMainCreate(index)}
          aria-label="Зробити обкладинкою"
          title="Обкладинка"
        >
          <IconStar size={16} />
        </button>
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
          onClick={() => removeCreate(index)}
          aria-label="Видалити"
          title="Видалити"
        >
          <IconX size={16} />
        </button>
      </div>
      {item.isMain && <span className={styles.mainLabel}>обкладинка</span>}
    </div>
  );

  const renderEditCard = (photo: EventPhoto, index: number) => (
    <div
      key={photo.id}
      className={[
        styles.card,
        photo.is_main ? styles.cardMain : '',
        dragIndex === index ? styles.cardDragging : '',
        dropIndex === index && dragIndex !== index ? styles.cardDropTarget : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable
      onDragStart={() => handleCardDragStart(index)}
      onDragOver={(e) => handleCardDragOver(e, index)}
      onDrop={() => handleCardDrop(index)}
      onDragEnd={handleCardDragEnd}
    >
      <img
        src={resolveVariantUrl(photo.image_url, 'md')}
        alt={`Фото ${index + 1}`}
        draggable={false}
      />
      <span className={styles.position}>{index + 1}</span>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={photo.is_main ? styles.iconBtnStarActive : styles.iconBtn}
          onClick={() => setMainEdit(index)}
          aria-label="Зробити обкладинкою"
          title="Обкладинка"
        >
          <IconStar size={16} />
        </button>
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
          onClick={() => removeEdit(index)}
          aria-label="Видалити"
          title="Видалити"
        >
          <IconX size={16} />
        </button>
      </div>
      {photo.is_main && <span className={styles.mainLabel}>обкладинка</span>}
    </div>
  );

  return (
    <div className={styles.root}>
      <div
        className={`${styles.zone} ${isDraggingFiles && !uploading ? styles.zoneDragging : ''} ${uploading ? styles.zoneUploading : ''}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setIsDraggingFiles(true);
        }}
        onDragLeave={() => setIsDraggingFiles(false)}
        onDrop={(e) => { if (!uploading) handleFileDrop(e); else e.preventDefault(); }}
        role="button"
        tabIndex={uploading ? -1 : 0}
        aria-disabled={uploading}
        onKeyDown={(e) => !uploading && e.key === 'Enter' && fileInputRef.current?.click()}
      >
        {uploading && uploadProgress ? (
          <>
            <div className={styles.zoneProgressRing}>
              <span className={styles.spinnerLg} />
              <span className={styles.zoneProgressCount}>
                {uploadProgress.done}/{uploadProgress.total}
              </span>
            </div>
            <p className={styles.zoneText}>Обробка фотографій…</p>
            <p className={styles.zoneHint}>Зачекайте, нові фото можна буде додати після завершення</p>
          </>
        ) : (
          <>
            <div className={styles.zoneIcon}>+</div>
            <p className={styles.zoneText}>Додати фотографії</p>
            <p className={styles.zoneHint}>
              Натисніть або перетягніть (PNG, JPEG, WebP)
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp"
          className={styles.fileInput}
          disabled={uploading}
          onChange={(e) => acceptFiles(e.target.files)}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {count > 0 && (
        <>
          <div className={styles.grid}>
            {props.mode === 'create'
              ? props.items.map(renderCreateCard)
              : props.photos.map(renderEditCard)}
          </div>
          {props.mode === 'edit' && props.hasMore && (
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
              {props.loadingMore && (
                <>
                  <span className={styles.spinner} style={{ width: '1rem', height: '1rem', borderTopColor: 'var(--color-text-muted)' }} />
                  Завантаження...
                </>
              )}
            </div>
          )}

          <div className={styles.footer}>
            <span className={styles.count}>{count} фото</span>
            <span className={styles.hint}>
              Перетягніть картки для зміни порядку · <IconStar size={12} className={styles.inlineIcon} /> — обкладинка
            </span>
          </div>
        </>
      )}
    </div>
  );
}
