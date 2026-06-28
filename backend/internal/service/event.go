package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type EventService struct {
	events  domain.EventRepository
	tx      domain.TxManager
	storage domain.FileStorage
	log     *slog.Logger
}

func NewEventService(
	events domain.EventRepository,
	tx domain.TxManager,
	storage domain.FileStorage,
	log *slog.Logger,
) *EventService {
	return &EventService{
		events:  events,
		tx:      tx,
		storage: storage,
		log:     log,
	}
}

func (s *EventService) CreateEvent(ctx context.Context, event *domain.Event, files []domain.File) error {
	if err := s.events.CreateEvent(ctx, event); err != nil {
		return fmt.Errorf("create event: %w", err)
	}

	folderPath := fmt.Sprintf("events/%d", event.ID)
	for i, file := range files {
		path, err := s.storage.Upload(ctx, file, folderPath)
		if err != nil {
			s.log.Error("upload photo during event creation",
				slog.Int("event_id", int(event.ID)),
				slog.String("error", err.Error()),
			)
			continue
		}

		photo := &domain.EventPhoto{
			EventID:      event.ID,
			ImagePath:    path,
			IsMain:       i == 0,
			DisplayOrder: int32(i),
		}

		if err := s.events.AddEventPhoto(ctx, photo); err != nil {
			s.log.Error("save event photo to db", slog.String("error", err.Error()))
		}
	}

	return nil
}

func (s *EventService) UpdateEvent(ctx context.Context, event *domain.Event, photos []domain.EventPhoto) error {
	return s.tx.ExecTx(ctx, func(txCtx context.Context) error {
		if err := s.events.UpdateEvent(txCtx, event); err != nil {
			return fmt.Errorf("update event: %w", err)
		}

		retainedIDs := make([]int32, 0, len(photos))
		for _, photo := range photos {
			retainedIDs = append(retainedIDs, photo.ID)

			if err := s.events.UpdateEventPhoto(txCtx, &photo); err != nil {
				return fmt.Errorf("update event photo %d: %w", photo.ID, err)
			}
		}

		if err := s.events.SoftDeleteEventPhotos(txCtx, event.ID, retainedIDs); err != nil {
			return fmt.Errorf("soft delete event photos: %w", err)
		}

		return nil
	})
}

func (s *EventService) DeleteEvent(ctx context.Context, id int32) error {
	if err := s.events.DeleteEvent(ctx, id); err != nil {
		return fmt.Errorf("delete event: %w", err)
	}

	folderPath := fmt.Sprintf("events/%d", id)

	if err := s.storage.DeleteDir(ctx, folderPath); err != nil {
		s.log.Warn("delete event directory from storage",
			slog.Int("event_id", int(id)),
			slog.String("error", err.Error()),
		)
	}

	return nil
}

func (s *EventService) GetAdminEvent(ctx context.Context, id int32) (*domain.Event, []domain.EventPhoto, error) {
	event, err := s.events.GetAdminEventByID(ctx, id)
	if err != nil {
		return nil, nil, fmt.Errorf("get admin event: %w", err)
	}

	photos, err := s.events.GetEventPhotosListByEventID(ctx, id)
	if err != nil {
		return nil, nil, fmt.Errorf("get event photos: %w", err)
	}

	return event, photos, nil
}

func (s *EventService) GetPublicEvent(ctx context.Context, id int32) (*domain.Event, []domain.EventPhoto, error) {
	event, err := s.events.GetPublicEventByID(ctx, id)
	if err != nil {
		return nil, nil, fmt.Errorf("get public event: %w", err)
	}

	photos, err := s.events.GetEventPhotosListByEventID(ctx, id)
	if err != nil {
		return nil, nil, fmt.Errorf("get event photos: %w", err)
	}

	return event, photos, nil
}

func (s *EventService) ListAdminEvents(ctx context.Context, limit, offset int32) ([]domain.EventListItem, error) {
	events, err := s.events.GetAdminEventsList(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("get admin events list: %w", err)
	}

	return events, nil
}

func (s *EventService) ListPublicEvents(ctx context.Context, limit, offset int32) ([]domain.EventListItem, error) {
	events, err := s.events.GetPublicEventsList(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("get public events list: %w", err)
	}

	return events, nil
}

func (s *EventService) UploadEventPhoto(ctx context.Context, eventID int32, file domain.File) error {
	folderPath := fmt.Sprintf("events/%d", eventID)

	path, err := s.storage.Upload(ctx, file, folderPath)
	if err != nil {
		return fmt.Errorf("upload event photo: %w", err)
	}

	photo := &domain.EventPhoto{
		EventID:      eventID,
		ImagePath:    path,
		IsMain:       false,
		DisplayOrder: -1,
	}
	if err := s.events.AddEventPhoto(ctx, photo); err != nil {
		return fmt.Errorf("add event photo: %w", err)
	}

	return nil
}

func (s *EventService) UpdateEventStatuses(ctx context.Context) error {
	if err := s.events.UpdateEventStatuses(ctx); err != nil {
		return fmt.Errorf("update event statuses: %w", err)
	}
	return nil
}

func (s *EventService) CleanupOrphanedEventPhotos(ctx context.Context) error {
	photos, err := s.events.DeleteOrphanedEventPhotos(ctx)
	if err != nil {
		return err
	}

	for _, photo := range photos {
		if err := s.storage.Delete(ctx, photo.ImagePath); err != nil {
			s.log.Error("failed to delete orphaned event photo from storage",
				slog.String("image_path", photo.ImagePath),
				slog.String("error", err.Error()),
			)
		}
	}

	return nil
}
