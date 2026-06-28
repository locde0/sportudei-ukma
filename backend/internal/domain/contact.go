package domain

import "context"

type Contact struct {
	ID           int32
	Platform     string
	Name         string
	URL          string
	DisplayOrder int32
}

type ContactRepository interface {
	CreateContact(ctx context.Context, contact *Contact) error
	UpdateContact(ctx context.Context, contact *Contact) error
	DeleteContact(ctx context.Context, id int32) error

	GetContactsList(ctx context.Context) ([]Contact, error)

	UpdateContactOrder(ctx context.Context, id, order int32) error
}
