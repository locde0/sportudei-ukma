-- +goose Up
CREATE TABLE gallery_albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    cover_photo_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gallery_photos (
    id SERIAL PRIMARY KEY,
    album_id INT NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

-- +goose Down
DROP TABLE gallery_photos;
DROP TABLE gallery_albums;