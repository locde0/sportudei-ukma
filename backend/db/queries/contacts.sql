-- name: GetContacts :many
SELECT id, platform_name, contact_value, display_order
FROM contacts
ORDER BY display_order ASC;

-- name: CreateContact :one
INSERT INTO contacts (platform_name, contact_value, display_order)
VALUES ($1, $2, $3) RETURNING id;

-- name: UpdateContact :exec
UPDATE contacts
SET platform_name = $2, contact_value = $3
WHERE id = $1;

-- name: DeleteContact :exec
DELETE FROM contacts WHERE id = $1;

-- name: UpdateContactOrder :exec
UPDATE contacts
SET display_order = $2
WHERE id = $1;