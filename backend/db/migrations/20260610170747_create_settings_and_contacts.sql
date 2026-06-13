-- +goose Up
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    is_mohyla_games_enabled BOOLEAN NOT NULL DEFAULT true,
    is_schedule_enabled BOOLEAN NOT NULL DEFAULT true,
    is_teams_enabled BOOLEAN NOT NULL DEFAULT true,
    is_partners_enabled BOOLEAN NOT NULL DEFAULT true,
    is_gallery_enabled BOOLEAN NOT NULL DEFAULT true,
    is_contacts_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_settings (id)
VALUES (1);

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    platform_name VARCHAR(50) NOT NULL,
    contact_value TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

-- +goose Down
DROP TABLE contacts;
DROP TABLE site_settings;