-- name: CreateEvent :one
insert into events (title, description, content, event_date, location, url, is_published)
values ($1, $2, $3, $4, $5, $6, $7)
returning *;

-- name: UpdateEvent :exec
update events
set
    title = $2,
    description = $3,
    content = $4,
    event_date = $5,
    location = $6,
    url = $7,
    status = $8,
    is_published = $9
where id = $1;

-- name: DeleteEvent :exec
delete from events where id = $1;

-- name: GetAdminEventByID :one
select * from events
where id = $1 limit 1;

-- name: GetPublicEventByID :one
select * from events
where id = $1 and is_published = true limit 1;

-- name: GetEventsList :many
select
    sqlc.embed(e),
    p.image_path as main_image_path
from events e
    left join event_photos p on p.event_id = e.id and p.is_main = true
where (e.is_published = true or sqlc.arg('show_all')::bool = true)
order by e.event_date desc
    limit $1 offset $2;

-- name: AddEventPhoto :one
insert into event_photos (event_id, image_path, is_main, display_order)
values ($1, $2, $3, $4)
returning *;

-- name: UpdateEventPhoto :exec
update event_photos
set
    is_main = $3,
    display_order = $4
where id = $1 and event_id = $2;

-- name: DeleteEventPhoto :exec
delete from event_photos where id = $1;

-- name: GetEventPhotosListByEventID :many
select * from event_photos
where event_id = $1
order by display_order desc;

-- name: UpdateEventStatuses :exec
update events
set status = 'in_progress'
where status = 'planned' and event_date <= current_timestamp;

-- name: DeleteOrphanedPhotos :many
delete from event_photos
where display_order = -1 and created_at < now() - interval '12 hours'
returning *;