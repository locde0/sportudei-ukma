-- name: CreatePartner :one
insert into partners (name, logo_path, url, is_active, display_order)
values ($1, $2, $3, $4, $5)
returning *;

-- name: UpdatePartner :exec
update partners
set
    name = $2,
    logo_path = $3,
    url = $4,
    is_active = $5,
    display_order = $6
where id = $1;

-- name: DeletePartner :exec
delete from partners
where id = $1;

-- name: GetPartnersList :many
select * from partners
where (is_active = true or sqlc.arg('show_all')::bool = true)
order by display_order asc, created_at asc;

-- name: GetPartnerByID :one
select * from partners
where id = $1 limit 1;

-- name: UpdatePartnerOrder :exec
update partners
set display_order = $2
where id = $1;
