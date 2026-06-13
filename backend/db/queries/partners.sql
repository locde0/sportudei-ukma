-- name: GetPublicPartners :many
SELECT id, name, logo_url, link_url, is_active, display_order
FROM partners
WHERE is_active = true
ORDER BY display_order ASC;

-- name: GetAdminPartners :many
SELECT id, name, logo_url, link_url, is_active, display_order
FROM partners
ORDER BY display_order ASC;

-- name: CreatePartner :one
INSERT INTO partners (name, logo_url, link_url, is_active, display_order)
VALUES ($1, $2, $3, $4, $5) RETURNING id;

-- name: UpdatePartner :exec
UPDATE partners
SET name = $2, logo_url = $3, link_url = $4, is_active = $5
WHERE id = $1;

-- name: DeletePartner :exec
DELETE FROM partners WHERE id = $1;

-- name: UpdatePartnerOrder :exec
UPDATE partners SET display_order = $2 WHERE id = $1;