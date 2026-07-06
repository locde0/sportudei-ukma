-- name: CreateGalleryAlbum :one
insert into gallery_albums (title, is_published, cover_image_path)
values ($1, $2, $3)
returning *;

-- name: UpdateGalleryAlbum :exec
update gallery_albums
set
    title = $2,
    is_published = $3,
    cover_image_path = $4
where id = $1;

-- name: DeleteGalleryAlbum :exec
delete from gallery_albums where id = $1;

-- name: GetAlbumByID :one
select * from gallery_albums
where id = $1 and (is_published = true or sqlc.arg('show_all')::bool = true)
limit 1;

-- name: GetAlbumsList :many
select
    sqlc.embed(ga),
    (select count(*)::int from gallery_photos gp where gp.album_id = ga.id) as photo_count
from gallery_albums ga
where (ga.is_published = true or sqlc.arg('show_all')::bool = true)
order by ga.created_at asc
limit $1 offset $2;


-- name: AddGalleryPhoto :one
insert into gallery_photos (album_id, image_path, display_order)
values ($1, $2, $3)
returning *;

-- name: UpdateGalleryPhoto :exec
update gallery_photos
set display_order = $3
where id = $1 and album_id = $2;

-- name: SoftDeleteGalleryPhotos :exec
update gallery_photos
set display_order = -1
where album_id = $1
  and id != all(sqlc.arg('retained_ids')::int[]);

-- name: DeleteGalleryPhoto :exec
delete from gallery_photos where id = $1;

-- name: GetGalleryPhotosByAlbumID :many
select * from gallery_photos
where album_id = $1 and display_order != -1
order by display_order asc, created_at asc
limit $2 offset $3;

-- name: DeleteOrphanedGalleryPhotos :many
delete from gallery_photos
where display_order = -1 and created_at < now() - interval '12 hours'
returning *;