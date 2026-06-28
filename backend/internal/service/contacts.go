package service

import (
	"context"
	"fmt"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type ContactService struct {
	contacts domain.ContactRepository
}

func NewContactService(contacts domain.ContactRepository) *ContactService {
	return &ContactService{
		contacts: contacts,
	}
}

func (s *ContactService) CreateContact(ctx context.Context, contact *domain.Contact) error {
	if err := s.contacts.CreateContact(ctx, contact); err != nil {
		return fmt.Errorf("create contact: %w", err)
	}

	return nil
}

func (s *ContactService) UpdateContact(ctx context.Context, contact *domain.Contact) error {
	if err := s.contacts.UpdateContact(ctx, contact); err != nil {
		return fmt.Errorf("update contact: %w", err)
	}

	return nil
}

func (s *ContactService) DeleteContact(ctx context.Context, id int32) error {
	if err := s.contacts.DeleteContact(ctx, id); err != nil {
		return fmt.Errorf("delete contact: %w", err)
	}

	return nil
}

func (s *ContactService) ListContacts(ctx context.Context) ([]domain.Contact, error) {
	contacts, err := s.contacts.GetContactsList(ctx)
	if err != nil {
		return nil, fmt.Errorf("get contacts list: %w", err)
	}

	return contacts, nil
}

func (s *ContactService) UpdateContactOrder(ctx context.Context, contact *domain.Contact) error {
	if err := s.contacts.UpdateContactOrder(ctx, contact.ID, contact.DisplayOrder); err != nil {
		return fmt.Errorf("update contact order: %w", err)
	}

	return nil
}
