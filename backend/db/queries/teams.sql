-- name: GetTeams :many
SELECT id, name, logo_url, description, is_active
FROM teams
ORDER BY id ASC;

-- name: CreateTeam :one
INSERT INTO teams (name, logo_url, description, is_active)
VALUES ($1, $2, $3, $4) RETURNING id;

-- name: UpdateTeam :exec
UPDATE teams
SET name = $2, logo_url = $3, description = $4, is_active = $5
WHERE id = $1;

-- name: DeleteTeam :exec
DELETE FROM teams WHERE id = $1;