-- name: GetMohylaGame :one
select * from mohyla_game
where id = 1 limit 1;

-- name: UpdateMohylaGame :exec
update mohyla_game
set
    title = $1,
    description = $2,
    content = $3,
    updated_at = current_timestamp
where id = 1;
