package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type PartnerRepo struct {
	tx *TxManager
}

func NewPartnerRepo(tx *TxManager) *PartnerRepo {
	return &PartnerRepo{tx: tx}
}

func (r *PartnerRepo) CreatePartner(ctx context.Context, partner *domain.Partner) error {
	row, err := r.tx.Q(ctx).CreatePartner(ctx, gen.CreatePartnerParams{
		Name:         partner.Name,
		LogoPath:     partner.LogoPath,
		Url:          partner.URL,
		IsActive:     partner.IsActive,
		DisplayOrder: partner.DisplayOrder,
	})
	if err != nil {
		return err
	}

	partner.ID = row.ID

	return nil
}

func (r *PartnerRepo) UpdatePartner(ctx context.Context, partner *domain.Partner) error {
	return r.tx.Q(ctx).UpdatePartner(ctx, gen.UpdatePartnerParams{
		ID:           partner.ID,
		Name:         partner.Name,
		LogoPath:     partner.LogoPath,
		Url:          partner.URL,
		IsActive:     partner.IsActive,
		DisplayOrder: partner.DisplayOrder,
	})
}

func (r *PartnerRepo) DeletePartner(ctx context.Context, id int32) error {
	return r.tx.Q(ctx).DeleteContact(ctx, id)
}

func (r *PartnerRepo) GetAdminPartnerByID(ctx context.Context, id int32) (*domain.Partner, error) {
	row, err := r.tx.Q(ctx).GetPartnerByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get admin partner by id: %w", err)
	}
	return new(r.toPartnerDomain(&row)), nil
}

func (r *PartnerRepo) GetAdminPartnersList(ctx context.Context) ([]domain.Partner, error) {
	rows, err := r.tx.Q(ctx).GetPartnersList(ctx, true)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get admin partners list: %w", err)
	}
	return mapSlice(rows, r.toPartnerDomain), nil
}

func (r *PartnerRepo) GetPublicPartnersList(ctx context.Context) ([]domain.Partner, error) {
	rows, err := r.tx.Q(ctx).GetPartnersList(ctx, false)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get public partners list: %w", err)
	}
	return mapSlice(rows, r.toPartnerDomain), nil
}

func (r *PartnerRepo) UpdatePartnerOrder(ctx context.Context, partner *domain.Partner) error {
	return r.tx.Q(ctx).UpdatePartnerOrder(ctx, gen.UpdatePartnerOrderParams{
		ID:           partner.ID,
		DisplayOrder: partner.DisplayOrder,
	})
}

func (r *PartnerRepo) toPartnerDomain(row *gen.Partner) domain.Partner {
	return domain.Partner{
		ID:           row.ID,
		Name:         row.Name,
		LogoPath:     row.LogoPath,
		URL:          row.Url,
		IsActive:     row.IsActive,
		DisplayOrder: row.DisplayOrder,
	}
}
