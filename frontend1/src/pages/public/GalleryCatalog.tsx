import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicAlbums } from '../../api/gallery';
import { resolveImageUrl } from '../../utils/imageUrl';
import type { GalleryAlbum } from '../../types/gallery';
import styles from './GalleryCatalog.module.css';

export function GalleryCatalog() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicAlbums()
      .then(setAlbums)
      .catch(() => setError('Не вдалося завантажити галерею'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Галерея</h1>
        <p className={styles.subtitle}>Фотоальбоми Sportudei-UKMA</p>
      </header>

      {loading && <p className={styles.state}>Завантаження...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && albums.length === 0 && (
        <p className={styles.state}>Альбомів поки немає</p>
      )}
      {!loading && !error && albums.length > 0 && (
        <div className={styles.grid}>
          {albums.map((album) => (
            <Link key={album.id} to={`/gallery/${album.id}`} className={styles.card}>
              {album.cover_photo_url ? (
                <img
                  src={resolveImageUrl(album.cover_photo_url)}
                  alt=""
                  className={styles.cover}
                />
              ) : (
                <div className={styles.placeholder}>◎</div>
              )}
              <div className={styles.body}>
                <h2 className={styles.cardTitle}>{album.title}</h2>
                <span className={styles.count}>{album.photo_count} фото</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
