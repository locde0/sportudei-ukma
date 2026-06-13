-- name: GetGame :one
SELECT id, title, short_description, content
FROM mohyla_games
WHERE id = $1 LIMIT 1;

-- name: UpdateGame :exec
UPDATE mohyla_games
SET title = $2, short_description = $3, content = $4
WHERE id = $1;