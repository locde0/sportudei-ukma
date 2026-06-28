-- name: CreateContact :one
insert into contacts (platform, name, url, display_order)
values ($1, $2, $3, $4)
returning *;

-- name: UpdateContact :exec
update contacts
set platform = $2, name = $3, url = $4
where id = $1;

-- name: DeleteContact :exec
delete from contacts where id = $1;

-- name: GetContactsList :many
select * from contacts
order by display_order asc, created_at asc;

-- name: UpdateContactOrder :exec
update contacts
set display_order = $2
where id = $1;
