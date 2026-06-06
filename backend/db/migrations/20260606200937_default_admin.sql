-- +goose Up
-- +goose StatementBegin
INSERT INTO users (email, password_hash)
VALUES (
           'loc.dilp@gmail.com',
           '$2a$10$7x9Z2kXx//6gEbZi733nH.P/NluObT8zv7GYgomSOc7YNW1CA6T6y' -- 'admin123'
       );
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM users WHERE email = 'loc.dilp@gmail.com';
-- +goose StatementEnd
