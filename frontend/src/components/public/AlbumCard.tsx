import { Link } from 'react-router-dom';
import type { GalleryAlbum } from '../../types/gallery';
import { resolveVariantUrl } from '../../utils/imageUrl';
import page from '../../styles/publicPage.module.css';

interface AlbumCardProps {
  album: GalleryAlbum;
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link to={`/gallery/${album.id}`} className={page.card}>
      <div className={page.coverWrap}>
        {album.cover_photo_url ? (
          <img
            src={resolveVariantUrl(album.cover_photo_url, 'md')}
            alt=""
            className={page.cover}
            loading="lazy"
          />
        ) : (
          <div className={page.coverPlaceholder}>Без обкладинки</div>
        )}
      </div>
      <div className={page.cardBody}>
        <h3 className={page.cardTitle}>{album.title}</h3>
        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {album.photo_count} фото
        </p>
      </div>
    </Link>
  );
}
