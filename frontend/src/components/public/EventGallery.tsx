import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EventPhoto } from '../../types/event';
import { resolveImageUrl, resolveVariantUrl } from '../../utils/imageUrl';
import styles from './EventGallery.module.css';

interface EventGalleryProps {
  photos: EventPhoto[];
  title: string;
  layout?: 'default' | 'masonry';
  viewerVariant?: 'md' | 'full';
}

function sortPhotos(photos: EventPhoto[]): EventPhoto[] {
  return [...photos].sort((a, b) => {
    if (a.is_main !== b.is_main) return a.is_main ? -1 : 1;
    return a.display_order - b.display_order;
  });
}

export function EventGallery({ photos, title, layout = 'default', viewerVariant = 'md' }: EventGalleryProps) {
  const sorted = useMemo(() => sortPhotos(photos), [photos]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [fading, setFading] = useState(false);
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const mainThumbRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (lightboxOpen && activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    if (!lightboxOpen && mainThumbRef.current) {
      mainThumbRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeIndex, lightboxOpen]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= sorted.length || index === activeIndex) return;
      setFading(true);
      window.setTimeout(() => {
        setActiveIndex(index);
        setFading(false);
      }, 120);
    },
    [activeIndex, sorted.length],
  );

  const goPrev = useCallback(() => {
    goTo(activeIndex === 0 ? sorted.length - 1 : activeIndex - 1);
  }, [activeIndex, goTo, sorted.length]);

  const goNext = useCallback(() => {
    goTo(activeIndex === sorted.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, goTo, sorted.length]);

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
    <section className={styles.gallery} aria-label="Галерея події">
      {layout === 'masonry' ? (
        <div className={styles.masonryGrid}>
          {sorted.map((photo, idx) => (
            <div
              key={photo.id}
              className={styles.masonryItem}
              onClick={() => {
                goTo(idx);
                setLightboxOpen(true);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  goTo(idx);
                  setLightboxOpen(true);
                }
              }}
            >
              <img src={resolveVariantUrl(photo.image_url, 'md')} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div
        className={styles.viewer}
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setLightboxOpen(true)}
        aria-label="Відкрити фото на весь екран"
      >
        <img
          src={viewerVariant === 'full' ? resolveImageUrl(active.image_url) : resolveVariantUrl(active.image_url, 'md')}
          alt={`${title} — фото ${activeIndex + 1}`}
          className={`${styles.viewerImage} ${fading ? styles.viewerFade : ''}`}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navPrev}`}
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Попереднє фото"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Наступне фото"
            >
              ›
            </button>
          </>
        )}

        <div className={styles.viewerOverlay} />
        <div className={styles.viewerMeta}>
          {hasMultiple && (
            <span className={styles.counter}>
              {activeIndex + 1} / {sorted.length}
            </span>
          )}
          <span className={styles.expandHint}>Натисніть для збільшення</span>
        </div>
      </div>

      {hasMultiple && (
        <div className={styles.thumbs} role="tablist" aria-label="Мініатюри">
          {sorted.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Фото ${idx + 1}`}
              className={`${styles.thumb} ${idx === activeIndex ? styles.thumbActive : ''}`}
              onClick={() => goTo(idx)}
              ref={idx === activeIndex ? mainThumbRef : null}
            >
              <img src={resolveVariantUrl(photo.image_url, 'sm')} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      </>
      )}

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

            <img
              src={resolveImageUrl(active.image_url)}
              alt={`${title} — фото ${activeIndex + 1}`}
              className={styles.lightboxImage}
              onClick={(e) => e.stopPropagation()}
            />

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
              <>
                <span className={styles.lightboxCounter}>
                  {activeIndex + 1} / {sorted.length}
                </span>
                <div className={styles.lightboxStrip} onClick={(e) => e.stopPropagation()}>
                  {sorted.map((photo, idx) => (
                    <button
                      key={photo.id}
                      type="button"
                      className={`${styles.lightboxThumb} ${
                        idx === activeIndex ? styles.lightboxThumbActive : ''
                      }`}
                      onClick={() => goTo(idx)}
                      ref={idx === activeIndex ? activeThumbRef : null}
                    >
                      <img src={resolveVariantUrl(photo.image_url, 'sm')} alt="" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>,
          document.body,
        )}
    </section>
  );
}
