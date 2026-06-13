-- name: GetSettings :one
SELECT id, is_mohyla_games_enabled, is_schedule_enabled, is_teams_enabled, is_partners_enabled, is_gallery_enabled, is_contacts_enabled, updated_at
FROM site_settings
WHERE id = 1 LIMIT 1;

-- name: UpdateSettings :exec
UPDATE site_settings
SET is_mohyla_games_enabled = $1, is_schedule_enabled = $2, is_teams_enabled = $3, is_partners_enabled = $4, is_gallery_enabled = $5, is_contacts_enabled = $6, updated_at = CURRENT_TIMESTAMP
WHERE id = 1;