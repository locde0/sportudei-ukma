package service

import (
	"context"
	"fmt"

	gen "github.com/locde0/sportudei-ukma/backend/db/generated"
)

func (s *EventService) ListPublicEvents(ctx context.Context, limit, offset int32) ([]PublicEventListDto, error) {
	events, err := s.store.GetPublicEventsList(ctx, gen.GetPublicEventsListParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get public events list: %w", err)
	}

	var dtos []PublicEventListDto
	for _, event := range events {
		var mainPhoto *string
		if event.MainPhotoUrl.Valid {
			mainPhoto = new(string)
			*mainPhoto = event.MainPhotoUrl.String
		}

		dtos = append(dtos, PublicEventListDto{
			ID:           event.ID,
			Title:        event.Title,
			ShortDesc:    event.ShortDescription,
			Date:         event.EventDate.Time,
			Location:     event.Location,
			Status:       EventStatus(event.Status),
			MainPhotoURL: mainPhoto,
		})
	}

	if dtos == nil {
		return []PublicEventListDto{}, nil
	}

	return dtos, nil
}

func (s *EventService) GetPublicEvent(ctx context.Context, eventID int32) (PublicEventDto, error) {
	event, err := s.store.GetPublicEvent(ctx, eventID)
	if err != nil {
		return PublicEventDto{}, fmt.Errorf("failed to get public event: %w", err)
	}

	photos, err := s.store.GetEventPhotos(ctx, eventID)
	if err != nil {
		return PublicEventDto{}, fmt.Errorf("failed to get event photos: %w", err)
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

	return PublicEventDto{
		ID:              event.ID,
		Title:           event.Title,
		ShortDesc:       event.ShortDescription,
		Content:         event.Content,
		Date:            event.EventDate.Time,
		Location:        event.Location,
		RegistrationURL: event.RegistrationUrl.String,
		Status:          EventStatus(event.Status),
		Photos:          photoDtos,
	}, nil
}
