-- name: GetAdminDashboardStats :one
select
    (select count(*) from events where status = 'in_progress') as in_progress_events,
    (select count(*) from events where status = 'planned') as planned_events,
    (select count(*) from events where status = 'completed') as completed_events,
    (select count(*) from teams where is_active = true) as active_teams,
    (select count(*) from teams) as total_teams;

-- name: GetRecentEventsByStatus :many
select
    sqlc.embed(e),
    p.image_path AS main_image_path
from events e
    left join event_photos p on p.event_id = e.id and p.is_main = true
where e.status = $1
order by e.event_date asc
limit $2;
