package service

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	gen "github.com/locde0/sportudei-ukma/backend/db/generated"
)

func (s *EventService) CreateEvent(ctx context.Context, dto CreateEventDto, files []*multipart.FileHeader) (int32, error) {
	var eventID int32

	err := s.store.ExecTx(ctx, func(q *gen.Queries) error {
		id, err := q.CreateEvent(ctx, gen.CreateEventParams{
			Title:            dto.Title,
			ShortDescription: dto.ShortDesc,
			Content:          dto.Content,
			Location:         dto.Location,
			IsPublished:      dto.IsPublished,
			EventDate: pgtype.Timestamptz{
				Time:  dto.Date,
				Valid: true,
			},
			RegistrationUrl: pgtype.Text{
				String: dto.RegistrationURL,
				Valid:  dto.RegistrationURL != "",
			},
		})
		if err != nil {
			return fmt.Errorf("failed to insert event: %w", err)
		}

		eventID = id

		if err := s.processEventPhotos(ctx, q, eventID, dto.MainPhotoIndex, files); err != nil {
			return fmt.Errorf("failed to process photos: %w", err)
		}

		return nil
	})

	if err != nil {
		return 0, err
	}

	return eventID, nil
}

func (s *EventService) ListAdminEvents(ctx context.Context, limit, offset int32) ([]AdminEventListDto, error) {
	events, err := s.store.GetAdminEvents(ctx, gen.GetAdminEventsParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get events: %w", err)
	}

	var eventDtos []AdminEventListDto
	for _, event := range events {
		var mainPhotoUrl *string
		if event.MainPhotoUrl.Valid {
			mainPhotoUrl = new(string)
			*mainPhotoUrl = event.MainPhotoUrl.String
		}

		eventDtos = append(eventDtos, AdminEventListDto{
			ID:           event.ID,
			Title:        event.Title,
			Date:         event.EventDate.Time,
			Location:     event.Location,
			IsPublished:  event.IsPublished,
			Status:       EventStatus(event.Status),
			MainPhotoURL: mainPhotoUrl,
			CreatedAt:    event.CreatedAt.Time,
		})
	}

	if eventDtos == nil {
		return []AdminEventListDto{}, nil
	}

	return eventDtos, nil
}

func (s *EventService) GetAdminEvent(ctx context.Context, eventID int32) (AdminEventDto, error) {
	event, err := s.store.GetAdminEvent(ctx, eventID)
	if err != nil {
		return AdminEventDto{}, err
	}

	photos, err := s.store.GetEventPhotos(ctx, eventID)
	if err != nil {
		return AdminEventDto{}, err
	}

	var photoDtos []EventPhotoDto
	for _, photo := range photos {
		photoDtos = append(photoDtos, EventPhotoDto{
			ID:           photo.ID,
			ImageURL:     photo.ImageUrl,
			IsMain:       photo.IsMain,
			DisplayOrder: photo.DisplayOrder,
		})
	}

	return AdminEventDto{
		ID:              event.ID,
		Title:           event.Title,
		ShortDesc:       event.ShortDescription,
		Content:         event.Content,
		Date:            event.EventDate.Time,
		Location:        event.Location,
		RegistrationURL: event.RegistrationUrl.String,
		IsPublished:     event.IsPublished,
		Status:          EventStatus(event.Status),
		Photos:          photoDtos,
	}, nil
}

func (s *EventService) UpdateEvent(ctx context.Context, eventID int32, dto UpdateEventDto) error {
	return s.store.ExecTx(ctx, func(q *gen.Queries) error {
		err := q.UpdateEvent(ctx, gen.UpdateEventParams{
			ID:               eventID,
			Title:            dto.Title,
			ShortDescription: dto.ShortDesc,
			Content:          dto.Content,
			Location:         dto.Location,
			IsPublished:      dto.IsPublished,
			Status:           gen.EventStatus(dto.Status),
			EventDate: pgtype.Timestamptz{
				Time:  dto.Date,
				Valid: true,
			},
			RegistrationUrl: pgtype.Text{
				String: dto.RegistrationURL,
				Valid:  dto.RegistrationURL != "",
			},
		})
		if err != nil {
			return fmt.Errorf("failed to update event: %w", err)
		}

		existingPhotos, err := q.GetEventPhotos(ctx, eventID)
		if err != nil {
			return fmt.Errorf("failed to fetch existing photos: %w", err)
		}

		incomingPhotosMap := make(map[int32]UpdatePhotoDto)
		for _, p := range dto.Photos {
			incomingPhotosMap[p.ID] = p
		}

		for _, existing := range existingPhotos {
			if _, found := incomingPhotosMap[existing.ID]; !found {
				err := q.DeleteEventPhoto(ctx, existing.ID)
				if err != nil {
					return fmt.Errorf("failed to delete removed photo from db: %w", err)
				}
				os.Remove(existing.ImageUrl)
			}
		}

		for _, incoming := range dto.Photos {
			err := q.UpdateEventPhoto(ctx, gen.UpdateEventPhotoParams{
				IsMain:       incoming.IsMain,
				DisplayOrder: incoming.DisplayOrder,
				ID:           incoming.ID,
				EventID:      eventID,
			})
			if err != nil {
				return fmt.Errorf("failed to update photo order: %w", err)
			}
		}

		return nil
	})
}

func (s *EventService) DeleteEvent(ctx context.Context, eventID int32) error {
	err := s.store.DeleteEvent(ctx, eventID)
	if err != nil {
		return fmt.Errorf("failed to delete event: %w", err)
	}

	return nil
}

func (s *EventService) UploadEventPhoto(ctx context.Context, eventID int32, photo *multipart.FileHeader) (EventPhotoDto, error) {
	fileURL, err := savePhoto(photo)
	if err != nil {
		return EventPhotoDto{}, err
	}

	row, err := s.store.AddEventPhoto(ctx, gen.AddEventPhotoParams{
		EventID:      eventID,
		ImageUrl:     fileURL,
		IsMain:       false,
		DisplayOrder: 99,
	})
	if err != nil {
		return EventPhotoDto{}, fmt.Errorf("failed to insert photo record to db: %w", err)
	}

	return EventPhotoDto{
		ID:           row.ID,
		ImageURL:     row.ImageUrl,
		IsMain:       row.IsMain,
		DisplayOrder: row.DisplayOrder,
	}, nil
}

//func (s *EventService) DeleteEventPhoto(ctx context.Context, photoID int32) error {
//	return s.store.DeleteEventPhoto(ctx, photoID)
//}

func (s *EventService) processEventPhotos(ctx context.Context, q *gen.Queries, eventID int32, mainIndex int, files []*multipart.FileHeader) error {
	if len(files) == 0 {
		return nil
	}

	for i, fh := range files {
		fileURL, err := savePhoto(fh)
		if err != nil {
			return err
		}

		_, err = q.AddEventPhoto(ctx, gen.AddEventPhotoParams{
			EventID:      eventID,
			ImageUrl:     fileURL,
			IsMain:       i == mainIndex,
			DisplayOrder: int32(i),
		})
		if err != nil {
			return fmt.Errorf("failed to insert photo record to db: %w", err)
		}
	}

	return nil
}

func savePhoto(fh *multipart.FileHeader) (string, error) {
	fileURL := filepath.Join("uploads", uuid.New().String()+filepath.Ext(fh.Filename))

	osFile, err := os.Create(fileURL)
	if err != nil {
		return "", fmt.Errorf("failed to create empty file on disk: %w", err)
	}
	defer osFile.Close()

	file, err := fh.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open multipart file: %w", err)
	}
	defer file.Close()

	if _, err := io.Copy(osFile, file); err != nil {
		return "", fmt.Errorf("failed to copy file data: %w", err)
	}

	return fileURL, nil
}
