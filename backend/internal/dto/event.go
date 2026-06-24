package dto

import (
	"time"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type BaseEventRequest struct {
	Title       string    `json:"title" validate:"required,min=1,max=100"`
	Desc        string    `json:"desc" validate:"required,min=1,max=500"`
	Content     string    `json:"content" validate:"required,min=1"`
	EventDate   time.Time `json:"event_date" validate:"required"`
	Location    string    `json:"location" validate:"required,min=1,max=300"`
	URL         *string   `json:"url" validate:"omitempty,url"`
	IsPublished bool      `json:"is_published"`
}

type CreateEventRequest struct {
	BaseEventRequest
}

type UpdateEventRequest struct {
	BaseEventRequest
	Status domain.EventStatus   `json:"status" validate:"required,oneof=planned in_progress completed"`
	Photos []UpdatePhotoRequest `json:"photos" validate:"dive"`
}

type UpdatePhotoRequest struct {
	ID           int32 `json:"id" validate:"required,gt=0"`
	IsMain       bool  `json:"is_main"`
	DisplayOrder int32 `json:"display_order" validate:"gte=-1"`
}

type BaseEventResponse struct {
	ID        int32              `json:"id"`
	Title     string             `json:"title"`
	Desc      string             `json:"desc"`
	EventDate time.Time          `json:"event_date"`
	Location  string             `json:"location"`
	Status    domain.EventStatus `json:"status"`
}

type EventPhotoResponse struct {
	ID           int32  `json:"id"`
	ImagePath    string `json:"image_path"`
	IsMain       bool   `json:"is_main"`
	DisplayOrder int32  `json:"display_order"`
}

type PublicEventsListItemResponse struct {
	BaseEventResponse
	MainPhotoPath string `json:"main_photo_path"`
}

type PublicEventResponse struct {
	BaseEventResponse
	Content string               `json:"content"`
	URL     *string              `json:"url"`
	Photos  []EventPhotoResponse `json:"photos"`
}

type PublicEventsListResponse struct {
	Events []PublicEventsListItemResponse `json:"events"`
}

type AdminEventsListItemResponse struct {
	BaseEventResponse
	IsPublished   bool   `json:"is_published"`
	MainPhotoPath string `json:"main_photo_path"`
}

type AdminEventResponse struct {
	BaseEventResponse
	Content     string               `json:"content"`
	URL         *string              `json:"url"`
	IsPublished bool                 `json:"is_published"`
	Photos      []EventPhotoResponse `json:"photos"`
}

type AdminEventsListResponse struct {
	Events []AdminEventsListItemResponse `json:"events"`
}
