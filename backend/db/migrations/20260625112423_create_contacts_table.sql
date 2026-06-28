-- +goose Up
create table contacts (
    id serial primary key,
    platform varchar(50) not null,
    name varchar(50) not null,
    url text not null,
    display_order int not null default 0,
    created_at timestamptz default current_timestamp
);

-- +goose Down
drop table contacts;
