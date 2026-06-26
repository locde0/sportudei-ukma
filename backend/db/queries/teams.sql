-- name: CreateTeam :one
insert into teams (name, logo_path, description, is_active, display_order)
values ($1, $2, $3, $4, $5)
    returning *;

-- name: UpdateTeam :exec
update teams
set
    name = $2,
    logo_path = $3,
    description = $4,
    is_active = $5,
    display_order = $6
where id = $1;

-- name: DeleteTeam :exec
delete from teams
where id = $1;

-- name: GetTeamsList :many
select * from teams
where (is_active = true or sqlc.arg('show_all')::bool = true)
order by display_order asc, created_at asc;

-- name: GetTeamByID :one
select * from teams
where id = $1 and (is_active = true or sqlc.arg('show_all')::bool = true)
limit 1;

-- name: UpdateTeamOrder :exec
update teams
set display_order = $2
where id = $1;
