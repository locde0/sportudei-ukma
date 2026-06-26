-- +goose Up
create table teams (
    id serial primary key,
    name varchar(255) not null,
    logo_path text not null,
    description text not null,
    is_active bool not null default true,
    display_order int not null default 0,
    created_at timestamptz default current_timestamp
);

-- +goose Down
drop table teams;
