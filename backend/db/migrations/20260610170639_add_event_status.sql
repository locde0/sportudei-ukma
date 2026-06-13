-- +goose Up
CREATE TYPE event_status AS ENUM ('planned', 'in_progress', 'completed');
ALTER TABLE events ADD COLUMN status event_status NOT NULL DEFAULT 'planned';

-- +goose Down
ALTER TABLE events DROP COLUMN status;
DROP TYPE event_status;