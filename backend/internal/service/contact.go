package service

import (
	"context"
	"fmt"

	"github.com/locde0/sportudei-ukma/backend/db/generated"
	"github.com/locde0/sportudei-ukma/backend/internal/db"
)

type ContactService struct {
	store *db.Store
}

func NewContactService(store *db.Store) *ContactService {
	return &ContactService{store: store}
}

type ContactType string

const (
	ContactTypeTelegram  ContactType = "telegram"
	ContactTypeInstagram ContactType = "instagram"
	ContactTypeFacebook  ContactType = "facebook"
	ContactTypeEmail     ContactType = "email"
	ContactTypePhone     ContactType = "phone"
)

func (c ContactType) IsValid() bool {
	switch c {
	case ContactTypeTelegram, ContactTypeInstagram, ContactTypeFacebook, ContactTypeEmail, ContactTypePhone:
		return true
	}
	return false
}

type ContactDto struct {
	ID           int32
	PlatformName ContactType
	ContactValue string
	DisplayOrder int32
}

func (s *ContactService) ListContacts(ctx context.Context) ([]ContactDto, error) {
	contacts, err := s.store.GetContacts(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get contacts from db: %w", err)
	}

	dtos := make([]ContactDto, len(contacts))
	for i, c := range contacts {
		dtos[i] = ContactDto{
			ID:           c.ID,
			PlatformName: ContactType(c.PlatformName),
			ContactValue: c.ContactValue,
			DisplayOrder: c.DisplayOrder,
		}
	}

	return dtos, nil
}

func (s *ContactService) CreateContact(ctx context.Context, dto ContactDto) (int32, error) {
	id, err := s.store.CreateContact(ctx, gen.CreateContactParams{
		PlatformName: string(dto.PlatformName),
		ContactValue: dto.ContactValue,
		DisplayOrder: dto.DisplayOrder,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to create contact in db: %w", err)
	}

	return id, nil
}

func (s *ContactService) UpdateContact(ctx context.Context, id int32, dto ContactDto) error {
	err := s.store.UpdateContact(ctx, gen.UpdateContactParams{
		ID:           id,
		PlatformName: string(dto.PlatformName),
		ContactValue: dto.ContactValue,
	})
	if err != nil {
		return fmt.Errorf("failed to update contact in db: %w", err)
	}

	return nil
}

func (s *ContactService) DeleteContact(ctx context.Context, id int32) error {
	err := s.store.DeleteContact(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete contact from db: %w", err)
	}

	return nil
}

func (s *ContactService) UpdateContactOrder(ctx context.Context, orderedIDs []int32) error {
	for i, id := range orderedIDs {
		err := s.store.UpdateContactOrder(ctx, gen.UpdateContactOrderParams{
			ID:           id,
			DisplayOrder: int32(i),
		})
		if err != nil {
			return fmt.Errorf("failed to update contact order for id %d: %w", id, err)
		}
	}
	return nil
}
