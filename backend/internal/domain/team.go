package domain

import (
	"context"
)

type Team struct {
	ID           int32
	Name         string
	LogoPath     string
	Description  string
	IsActive     bool
	DisplayOrder int32
}

type TeamRepository interface {
	CreateTeam(ctx context.Context, team *Team) error
	UpdateTeam(ctx context.Context, team *Team) error
	DeleteTeam(ctx context.Context, id int32) error

	GetAdminTeamByID(ctx context.Context, id int32) (*Team, error)
	GetPublicTeamByID(ctx context.Context, id int32) (*Team, error)

	GetAdminTeamsList(ctx context.Context) ([]Team, error)
	GetPublicTeamsList(ctx context.Context) ([]Team, error)

	UpdateTeamOrder(ctx context.Context, team *Team) error
}
