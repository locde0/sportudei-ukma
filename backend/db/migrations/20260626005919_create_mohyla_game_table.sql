-- +goose Up
create table mohyla_game (
    id int primary key check (id = 1),
    title varchar(255) not null,
    description text not null,
    content text not null,
    updated_at timestamptz default current_timestamp
);

insert into mohyla_game (id, title, description, content)
values (1, 'Могилянські ігри', 'опис', '<p>контент</p>');

-- +goose Down
drop table mohyla_game;
