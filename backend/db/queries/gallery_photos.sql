-- name: GetAlbumPhotos :many
SELECT id, album_id, image_url, display_order
FROM gallery_photos
WHERE album_id = $1
ORDER BY display_order ASC;

-- name: AddAlbumPhoto :one
INSERT INTO gallery_photos (album_id, image_url, display_order)
VALUES ($1, $2, $3) RETURNING id, image_url, display_order;

-- name: UpdateAlbumPhoto :exec
UPDATE gallery_photos
SET display_order = $1
WHERE id = $2 AND album_id = $3;

-- name: DeleteAlbumPhoto :exec
DELETE FROM gallery_photos WHERE id = $1;