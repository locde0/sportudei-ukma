package service

import (
	"time"

	"github.com/locde0/sportudei-ukma/backend/internal/db"
)

type EventService struct {
	store *db.Store
}

func NewEventService(store *db.Store) *EventService {
	return &EventService{store: store}
}

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

type CreateEventDto struct {
	Title           string
	ShortDesc       string
	Content         string
	Date            time.Time
	Location        string
	RegistrationURL string
	IsPublished     bool
	MainPhotoIndex  int
}

type UpdatePhotoDto struct {
	ID           int32
	IsMain       bool
	DisplayOrder int32
}

type UpdateEventDto struct {
	Title           string
	ShortDesc       string
	Content         string
	Date            time.Time
	Location        string
	RegistrationURL string
	IsPublished     bool
	Status          EventStatus
	Photos          []UpdatePhotoDto
}

type AdminEventDto struct {
	ID              int32
	Title           string
	ShortDesc       string
	Content         string
	Date            time.Time
	Location        string
	RegistrationURL string
	IsPublished     bool
	Status          EventStatus
	Photos          []EventPhotoDto
}

type EventPhotoDto struct {
	ID           int32
	ImageURL     string
	IsMain       bool
	DisplayOrder int32
}

type AdminEventListDto struct {
	ID           int32
	Title        string
	Date         time.Time
	Location     string
	IsPublished  bool
	Status       EventStatus
	MainPhotoURL *string
	CreatedAt    time.Time
}

type PublicEventListDto struct {
	ID           int32
	Title        string
	ShortDesc    string
	Date         time.Time
	Location     string
	Status       EventStatus
	MainPhotoURL *string
}

type PublicEventDto struct {
	ID              int32
	Title           string
	ShortDesc       string
	Content         string
	Date            time.Time
	Location        string
	RegistrationURL string
	Status          EventStatus
	Photos          []EventPhotoDto
}
