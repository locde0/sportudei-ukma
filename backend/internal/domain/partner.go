package domain

import "context"

type Partner struct {
	ID           int32
	Name         string
	LogoPath     string
	URL          *string
	IsActive     bool
	DisplayOrder int32
}

type PartnerRepository interface {
	CreatePartner(ctx context.Context, partner *Partner) error
	UpdatePartner(ctx context.Context, partner *Partner) error
	DeletePartner(ctx context.Context, id int32) error

	GetAdminPartnerByID(ctx context.Context, id int32) (*Partner, error)
	GetAdminPartnersList(ctx context.Context) ([]Partner, error)
	GetPublicPartnersList(ctx context.Context) ([]Partner, error)

	UpdatePartnerOrder(ctx context.Context, partner *Partner) error
}
