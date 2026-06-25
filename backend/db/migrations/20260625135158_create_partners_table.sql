-- +goose Up
create table partners (
    id serial primary key,
    name varchar(255) not null,
    logo_path text not null,
    url text,
    is_active bool not null default true,
    display_order int not null default 0,
    created_at timestamptz default current_timestamp
);

-- +goose Down
drop table partners;
