import { Link } from 'react-router-dom';
import type { GalleryAlbum } from '../../types/gallery';
import { resolveImageUrl } from '../../utils/imageUrl';
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
            src={resolveImageUrl(album.cover_photo_url)}
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
      </div>
    </Link>
  );
}
