-- name: GetSettings :one
select * from settings
where id = 1 limit 1;

-- name: UpdateSettings :exec
update settings
set
    is_events_enabled = $1,
    is_gallery_enabled = $2,
    is_contacts_enabled = $3,
    is_partners_enabled = $4,
    is_teams_enabled = $5,
    is_mohyla_game_enabled = $6,
    updated_at = current_timestamp
where id = 1;
