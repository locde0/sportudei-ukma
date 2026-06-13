package handler

import (
	"time"

	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type AdminEventListResponse struct {
	ID           int32               `json:"id"`
	Title        string              `json:"title"`
	Date         time.Time           `json:"event_date"`
	Location     string              `json:"location"`
	IsPublished  bool                `json:"is_published"`
	MainPhotoURL *string             `json:"main_photo_url"`
	Status       service.EventStatus `json:"status"`
	CreatedAt    time.Time           `json:"created_at"`
}

type AdminEventResponse struct {
	ID              int32               `json:"id"`
	Title           string              `json:"title"`
	ShortDesc       string              `json:"short_description"`
	Content         string              `json:"content"`
	EventDate       time.Time           `json:"event_date"`
	Location        string              `json:"location"`
	RegistrationURL string              `json:"registration_url"`
	IsPublished     bool                `json:"is_published"`
	Status          service.EventStatus `json:"status"`
	Photos          []PhotoResponse     `json:"photos"`
}

type PhotoResponse struct {
	ID           int32  `json:"id"`
	ImageURL     string `json:"image_url"`
	IsMain       bool   `json:"is_main"`
	DisplayOrder int32  `json:"display_order"`
}

type UpdatePhotoRequest struct {
	ID           int32 `json:"id"`
	IsMain       bool  `json:"is_main"`
	DisplayOrder int32 `json:"display_order"`
}

type UpdateEventAdminRequest struct {
	Title           string               `json:"title"`
	ShortDesc       string               `json:"short_description"`
	Content         string               `json:"content"`
	EventDate       time.Time            `json:"event_date"`
	Location        string               `json:"location"`
	RegistrationURL string               `json:"registration_url"`
	IsPublished     bool                 `json:"is_published"`
	Status          service.EventStatus  `json:"status"`
	Photos          []UpdatePhotoRequest `json:"photos"`
}

type PublicEventListResponse struct {
	ID           int32               `json:"id"`
	Title        string              `json:"title"`
	ShortDesc    string              `json:"short_description"`
	EventDate    time.Time           `json:"event_date"`
	Location     string              `json:"location"`
	Status       service.EventStatus `json:"status"`
	MainPhotoURL *string             `json:"main_photo_url"`
}

type PublicEventResponse struct {
	ID              int32               `json:"id"`
	Title           string              `json:"title"`
	ShortDesc       string              `json:"short_description"`
	Content         string              `json:"content"`
	EventDate       time.Time           `json:"event_date"`
	Location        string              `json:"location"`
	RegistrationURL string              `json:"registration_url"`
	Status          service.EventStatus `json:"status"`
	Photos          []PhotoResponse     `json:"photos"`
}
