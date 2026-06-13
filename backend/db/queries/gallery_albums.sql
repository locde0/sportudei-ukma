-- name: GetPublicAlbums :many
SELECT
    a.id,
    a.title,
    a.cover_photo_url,
    a.is_published,
    a.created_at,
    (SELECT COUNT(id)::int FROM gallery_photos p WHERE p.album_id = a.id) AS photo_count
FROM gallery_albums a
WHERE a.is_published = true
ORDER BY a.created_at DESC
    LIMIT $1 OFFSET $2;

-- name: GetAdminAlbums :many
SELECT
    a.id,
    a.title,
    a.cover_photo_url,
    a.is_published,
    a.created_at,
    (SELECT COUNT(id)::int FROM gallery_photos p WHERE p.album_id = a.id) AS photo_count
FROM gallery_albums a
ORDER BY a.created_at DESC
    LIMIT $1 OFFSET $2;

-- name: GetAlbum :one
SELECT id, title, cover_photo_url, is_published, created_at
FROM gallery_albums
WHERE id = $1 LIMIT 1;

-- name: CreateAlbum :one
INSERT INTO gallery_albums (title, is_published)
VALUES ($1, $2) RETURNING id;

-- name: UpdateAlbum :exec
UPDATE gallery_albums
SET title = $2, is_published = $3, cover_photo_url = $4
WHERE id = $1;

-- name: DeleteAlbum :exec
DELETE FROM gallery_albums WHERE id = $1;