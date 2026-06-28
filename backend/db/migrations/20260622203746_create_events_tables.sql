-- +goose Up
create type event_status as enum ('planned', 'in_progress', 'completed');

create table events (
    id serial primary key,
    title varchar(255) not null,
    description varchar(500) not null,
    content text not null,
    event_date timestamptz not null,
    location varchar(255) not null,
    url text,
    status event_status not null default 'planned',
    is_published bool not null default false,
    created_at timestamptz default current_timestamp
);

create table event_photos (
    id serial primary key,
    event_id int not null references events(id) on delete cascade,
    image_path text not null,
    is_main bool not null default false,
    display_order int not null default -1,
    created_at timestamptz default current_timestamp
);

create index idx_event_photos_event_id on event_photos(event_id);

-- +goose Down
drop table event_photos;
drop table events;

