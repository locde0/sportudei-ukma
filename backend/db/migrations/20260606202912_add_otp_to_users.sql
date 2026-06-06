-- +goose Up
-- +goose StatementBegin
ALTER TABLE users
    ADD COLUMN otp_code VARCHAR(6),
ADD COLUMN otp_expires_at TIMESTAMP WITH TIME ZONE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users
DROP COLUMN otp_code,
DROP COLUMN otp_expires_at;
-- +goose StatementEnd