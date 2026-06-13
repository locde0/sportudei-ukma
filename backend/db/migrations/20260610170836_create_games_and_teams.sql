-- +goose Up
CREATE TABLE mohyla_games (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_description TEXT NOT NULL,
    content TEXT NOT NULL
);

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

insert into mohyla_games(id, title, short_description, content)
values (1, 'dsdsd', 'nvbcvbc', 'nxbmnbvnxbvbcvnbcnxbvxcvxv');

-- +goose Down
DROP TABLE teams;
DROP TABLE mohyla_games;