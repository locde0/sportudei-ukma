package domain

import (
	"context"
	"time"
)

type EventStatus string

const (
	EventStatusPlanned    EventStatus = "planned"
	EventStatusInProgress EventStatus = "in_progress"
	EventStatusCompleted  EventStatus = "completed"
)

func (s EventStatus) IsValid() bool {
	switch s {
	case EventStatusPlanned, EventStatusInProgress, EventStatusCompleted:
		return true
	}
	return false
}

type Event struct {
	ID          int32
	Title       string
	Description string
	Content     string
	EventDate   time.Time
	Location    string
	URL         *string
	Status      EventStatus
	IsPublished bool
}

type EventListItem struct {
	ID            int32
	Title         string
	Description   string
	EventDate     time.Time
	Location      string
	Status        EventStatus
	MainImagePath string
}

type EventPhoto struct {
	ID           int32
	EventID      int32
	ImagePath    string
	IsMain       bool
	DisplayOrder int32
}

type EventRepository interface {
	CreateEvent(ctx context.Context, event *Event) error
	UpdateEvent(ctx context.Context, event *Event) error
	DeleteEvent(ctx context.Context, id int32) error

	GetAdminEventByID(ctx context.Context, id int32) (*Event, error)
	GetPublicEventByID(ctx context.Context, id int32) (*Event, error)
	GetAdminEventsList(ctx context.Context, limit, offset int32) ([]EventListItem, error)
	GetPublicEventsList(ctx context.Context, limit, offset int32) ([]EventListItem, error)

	AddEventPhoto(ctx context.Context, photo *EventPhoto) error
	UpdateEventPhoto(ctx context.Context, photo *EventPhoto) error
	DeleteEventPhoto(ctx context.Context, id int32) error

	GetEventPhotosListByEventID(ctx context.Context, eventID int32) ([]EventPhoto, error)

	UpdateEventStatuses(ctx context.Context) error
}
