package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type EventRepo struct {
	tx *TxManager
}

func NewEventRepo(tx *TxManager) *EventRepo {
	return &EventRepo{tx: tx}
}

func (r *EventRepo) CreateEvent(ctx context.Context, event *domain.Event) error {
	row, err := r.tx.Q(ctx).CreateEvent(ctx, gen.CreateEventParams{
		Title:       event.Title,
		Description: event.Description,
		Content:     event.Content,
		EventDate:   event.EventDate,
		Location:    event.Location,
		Url:         event.URL,
		IsPublished: event.IsPublished,
	})
	if err != nil {
		return err
	}

	event.ID = row.ID

	return nil
}

func (r *EventRepo) UpdateEvent(ctx context.Context, event *domain.Event) error {
	return r.tx.Q(ctx).UpdateEvent(ctx, gen.UpdateEventParams{
		ID:          event.ID,
		Title:       event.Title,
		Description: event.Description,
		Content:     event.Content,
		EventDate:   event.EventDate,
		Location:    event.Location,
		Url:         event.URL,
		Status:      toPgEventStatus(event.Status),
		IsPublished: event.IsPublished,
	})
}

func (r *EventRepo) DeleteEvent(ctx context.Context, id int32) error {
	return r.tx.Q(ctx).DeleteEvent(ctx, id)
}

func (r *EventRepo) GetAdminEventByID(ctx context.Context, id int32) (*domain.Event, error) {
	row, err := r.tx.Q(ctx).GetAdminEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get admin event by id: %w", err)
	}
	return r.toEventDomain(&row), nil
}

func (r *EventRepo) GetPublicEventByID(ctx context.Context, id int32) (*domain.Event, error) {
	row, err := r.tx.Q(ctx).GetPublicEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get public event by id: %w", err)
	}
	return r.toEventDomain(&row), nil
}

func (r *EventRepo) GetAdminEventsList(ctx context.Context, limit, offset int32) ([]domain.EventListItem, error) {
	rows, err := r.tx.Q(ctx).GetEventsList(ctx, gen.GetEventsListParams{
		Limit:   limit,
		Offset:  offset,
		ShowAll: true,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get admin events list: %w", err)
	}
	return mapSlice(rows, r.toEventListItemDomain), nil
}

func (r *EventRepo) GetPublicEventsList(ctx context.Context, limit, offset int32) ([]domain.EventListItem, error) {
	rows, err := r.tx.Q(ctx).GetEventsList(ctx, gen.GetEventsListParams{
		Limit:   limit,
		Offset:  offset,
		ShowAll: false,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get public events list: %w", err)
	}
	return mapSlice(rows, r.toEventListItemDomain), nil
}

func (r *EventRepo) AddEventPhoto(ctx context.Context, photo *domain.EventPhoto) error {
	row, err := r.tx.Q(ctx).AddEventPhoto(ctx, gen.AddEventPhotoParams{
		EventID:      photo.EventID,
		ImagePath:    photo.ImagePath,
		IsMain:       photo.IsMain,
		DisplayOrder: photo.DisplayOrder,
	})
	if err != nil {
		return err
	}

	photo.ID = row.ID

	return nil
}

func (r *EventRepo) UpdateEventPhoto(ctx context.Context, photo *domain.EventPhoto) error {
	return r.tx.Q(ctx).UpdateEventPhoto(ctx, gen.UpdateEventPhotoParams{
		ID:           photo.ID,
		EventID:      photo.EventID,
		IsMain:       photo.IsMain,
		DisplayOrder: photo.DisplayOrder,
	})
}

func (r *EventRepo) DeleteEventPhoto(ctx context.Context, id int32) error {
	return r.tx.Q(ctx).DeleteEventPhoto(ctx, id)
}

func (r *EventRepo) GetEventPhotosListByEventID(ctx context.Context, eventID int32) ([]domain.EventPhoto, error) {
	rows, err := r.tx.Q(ctx).GetEventPhotosListByEventID(ctx, eventID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get event photos list by event id: %w", err)
	}
	return mapSlice(rows, r.toEventPhotoDomain), nil
}

func (r *EventRepo) UpdateEventStatuses(ctx context.Context) error {
	return r.tx.Q(ctx).UpdateEventStatuses(ctx)
}

func (r *EventRepo) toEventDomain(row *gen.Event) *domain.Event {
	return &domain.Event{
		ID:          row.ID,
		Title:       row.Title,
		Description: row.Description,
		Content:     row.Content,
		EventDate:   row.EventDate,
		Location:    row.Location,
		URL:         row.Url,
		Status:      fromPgEventStatus(row.Status),
		IsPublished: row.IsPublished,
	}
}

func (r *EventRepo) toEventListItemDomain(row *gen.GetEventsListRow) domain.EventListItem {
	event := domain.EventListItem{
		ID:          row.Event.ID,
		Title:       row.Event.Title,
		Description: row.Event.Description,
		EventDate:   row.Event.EventDate,
		Location:    row.Event.Location,
		Status:      domain.EventStatus(row.Event.Status),
	}

	if row.MainImagePath != nil {
		event.MainImagePath = *row.MainImagePath
	}

	return event
}

func (r *EventRepo) toEventPhotoDomain(row *gen.EventPhoto) domain.EventPhoto {
	return domain.EventPhoto{
		ID:           row.ID,
		EventID:      row.EventID,
		ImagePath:    row.ImagePath,
		IsMain:       row.IsMain,
		DisplayOrder: row.DisplayOrder,
	}
}
