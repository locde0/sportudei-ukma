-- name: CreateEvent :one
INSERT INTO events (
    title, short_description, content, event_date, location, registration_url, is_published
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING id;

-- name: GetAdminEvent :one
SELECT id, title, short_description, content, event_date, location, registration_url, is_published, status, created_at, updated_at
FROM events
WHERE id = $1 LIMIT 1;

-- name: GetAdminEvents :many
SELECT
    e.id,
    e.title,
    e.event_date,
    e.location,
    e.is_published,
    e.status,
    e.created_at,
    p.image_url AS main_photo_url
FROM events e
    LEFT JOIN event_photos p ON e.id = p.event_id AND p.is_main = true
ORDER BY e.created_at DESC
    LIMIT $1 OFFSET $2;

-- name: UpdateEvent :exec
UPDATE events
SET
    title = $2,
    short_description = $3,
    content = $4,
    event_date = $5,
    location = $6,
    registration_url = $7,
    is_published = $8,
    status = $9,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: DeleteEvent :exec
DELETE FROM events
WHERE id = $1;

-- name: GetPublicEventsList :many
SELECT
    e.id,
    e.title,
    e.short_description,
    e.event_date,
    e.location,
    e.status,
    p.image_url AS main_photo_url
FROM events e
    LEFT JOIN event_photos p ON e.id = p.event_id AND p.is_main = true
WHERE e.is_published = true
ORDER BY e.event_date DESC
    LIMIT $1 OFFSET $2;

-- name: GetPublicEvent :one
SELECT id, title, short_description, content, event_date, location, registration_url, status
FROM events
WHERE id = $1 AND is_published = true LIMIT 1;

-- name: AddEventPhoto :one
INSERT INTO event_photos (
    event_id, image_url, is_main, display_order
) VALUES (
    $1, $2, $3, $4
) RETURNING id, image_url, is_main, display_order;

-- name: GetEventPhotos :many
SELECT id, event_id, image_url, is_main, display_order, created_at
FROM event_photos
WHERE event_id = $1
ORDER BY display_order ASC;

-- name: UpdateEventPhoto :exec
UPDATE event_photos
SET is_main = $1, display_order = $2
WHERE id = $3 AND event_id = $4;

-- name: DeleteEventPhoto :exec
DELETE FROM event_photos
WHERE id = $1;

-- name: AutoUpdateEventStatuses :exec
UPDATE events
SET status = 'in_progress'
WHERE status = 'planned' AND event_date <= CURRENT_TIMESTAMP;