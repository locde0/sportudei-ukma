-- +goose Up
create table gallery_albums (
    id serial primary key,
    title varchar(255) not null,
    cover_image_path text,
    is_published bool not null default false,
    created_at timestamptz default current_timestamp
);

create table gallery_photos (
    id serial primary key,
    album_id int not null references gallery_albums(id) on delete cascade,
    image_path text not null,
    display_order int not null default -1,
    created_at timestamptz default current_timestamp
);

create index idx_gallery_photos_album_id on gallery_photos(album_id);

-- +goose Down
drop table gallery_albums;
drop table gallery_photos;
