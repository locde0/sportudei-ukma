-- +goose Up
create table settings (
    id int primary key check (id = 1),
    is_events_enabled bool not null default true,
    is_gallery_enabled bool not null default true,
    is_contacts_enabled bool not null default true,
    is_partners_enabled bool not null default true,
    is_teams_enabled bool not null default true,
    is_mohyla_game_enabled bool not null default true,
    updated_at timestamptz default current_timestamp
);

insert into settings (
    id,
    is_events_enabled,
    is_gallery_enabled,
    is_contacts_enabled,
    is_partners_enabled,
    is_teams_enabled,
    is_mohyla_game_enabled
) values (1, true, true, true, true, true, true);

-- +goose Down
drop table settings;
