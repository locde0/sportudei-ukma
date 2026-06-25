package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type ContactRepo struct {
	tx *TxManager
}

func NewContactRepo(tx *TxManager) *ContactRepo {
	return &ContactRepo{tx: tx}
}

func (r *ContactRepo) CreateContact(ctx context.Context, contact *domain.Contact) error {
	row, err := r.tx.Q(ctx).CreateContact(ctx, gen.CreateContactParams{
		Platform:     contact.Platform,
		Name:         contact.Name,
		Url:          contact.URL,
		DisplayOrder: contact.DisplayOrder,
	})
	if err != nil {
		return err
	}

	contact.ID = row.ID

	return nil
}

func (r *ContactRepo) UpdateContact(ctx context.Context, contact *domain.Contact) error {
	return r.tx.Q(ctx).UpdateContact(ctx, gen.UpdateContactParams{
		ID:       contact.ID,
		Platform: contact.Platform,
		Name:     contact.Name,
		Url:      contact.URL,
	})
}

func (r *ContactRepo) DeleteContact(ctx context.Context, id int32) error {
	return r.tx.Q(ctx).DeleteContact(ctx, id)
}

func (r *ContactRepo) GetContactsList(ctx context.Context) ([]domain.Contact, error) {
	rows, err := r.tx.Q(ctx).GetContactsList(ctx)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get contacts list: %w", err)
	}
	return mapSlice(rows, r.toContactDomain), nil
}

func (r *ContactRepo) UpdateContactOrder(ctx context.Context, id, order int32) error {
	return r.tx.Q(ctx).UpdateContactOrder(ctx, gen.UpdateContactOrderParams{
		ID:           id,
		DisplayOrder: order,
	})
}

func (r *ContactRepo) toContactDomain(row *gen.Contact) domain.Contact {
	return domain.Contact{
		ID:           row.ID,
		Platform:     row.Platform,
		Name:         row.Name,
		URL:          row.Url,
		DisplayOrder: row.DisplayOrder,
	}
}
