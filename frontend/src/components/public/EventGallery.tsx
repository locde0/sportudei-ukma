import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EventPhoto } from '../../types/event';
import { resolveImageUrl } from '../../utils/imageUrl';
import styles from './EventGallery.module.css';

interface EventGalleryProps {
  photos: EventPhoto[];
  title: string;
}

function sortPhotos(photos: EventPhoto[]): EventPhoto[] {
  return [...photos].sort((a, b) => {
    if (a.is_main !== b.is_main) return a.is_main ? -1 : 1;
    return a.display_order - b.display_order;
  });
}

export function EventGallery({ photos, title }: EventGalleryProps) {
  const sorted = useMemo(() => sortPhotos(photos), [photos]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= sorted.length) return;
      setActiveIndex(index);
    },
    [sorted.length],
  );

  const goPrev = useCallback(() => {
    goTo(activeIndex === 0 ? sorted.length - 1 : activeIndex - 1);
  }, [activeIndex, goTo, sorted.length]);

  const goNext = useCallback(() => {
    goTo(activeIndex === sorted.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, goTo, sorted.length]);

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen, goPrev, goNext]);

  if (sorted.length === 0) return null;

  const active = sorted[activeIndex];
  const hasMultiple = sorted.length > 1;

  return (
    <section className={styles.gallery} aria-label="Галерея">
      <div className={styles.masonry}>
        {sorted.map((photo, idx) => (
          <div
            key={photo.id}
            className={styles.masonryItem}
            onClick={() => openLightbox(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(idx)}
            aria-label={`Відкрити фото ${idx + 1}`}
          >
            <img
              src={resolveImageUrl(photo.image_url)}
              alt={`${title} — фото ${idx + 1}`}
              loading="lazy"
              className={styles.masonryImage}
            />
            <div className={styles.overlay}>
              <div className={styles.overlayIcon}>⤢</div>
            </div>
          </div>
        ))}
      </div>

      {lightboxOpen &&
        createPortal(
          <div
            className={styles.lightbox}
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Перегляд фотографій"
          >
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setLightboxOpen(false)}
              aria-label="Закрити"
            >
              ×
            </button>

            {hasMultiple && (
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Попереднє"
              >
                ‹
              </button>
            )}

            <div className={styles.lightboxImageContainer} onClick={(e) => e.stopPropagation()}>
              <img
                src={resolveImageUrl(active.image_url)}
                alt={`${title} — фото ${activeIndex + 1}`}
                className={styles.lightboxImage}
              />
            </div>

            {hasMultiple && (
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Наступне"
              >
                ›
              </button>
            )}

            {hasMultiple && (
              <span className={styles.lightboxCounter}>
                {activeIndex + 1} / {sorted.length}
              </span>
            )}
          </div>,
          document.body,
        )}
    </section>
  );
}
