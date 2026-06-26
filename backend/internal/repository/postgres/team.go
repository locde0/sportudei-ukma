package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type TeamRepo struct {
	tx *TxManager
}

func NewTeamRepo(tx *TxManager) *TeamRepo {
	return &TeamRepo{tx: tx}
}

func (r *TeamRepo) CreateTeam(ctx context.Context, team *domain.Team) error {
	row, err := r.tx.Q(ctx).CreateTeam(ctx, gen.CreateTeamParams{
		Name:         team.Name,
		LogoPath:     team.LogoPath,
		Description:  team.Description,
		IsActive:     team.IsActive,
		DisplayOrder: team.DisplayOrder,
	})
	if err != nil {
		return fmt.Errorf("create team: %w", err)
	}

	team.ID = row.ID

	return nil
}

func (r *TeamRepo) UpdateTeam(ctx context.Context, team *domain.Team) error {
	err := r.tx.Q(ctx).UpdateTeam(ctx, gen.UpdateTeamParams{
		ID:           team.ID,
		Name:         team.Name,
		LogoPath:     team.LogoPath,
		Description:  team.Description,
		IsActive:     team.IsActive,
		DisplayOrder: team.DisplayOrder,
	})
	if err != nil {
		return fmt.Errorf("update team: %w", err)
	}
	return nil
}

func (r *TeamRepo) DeleteTeam(ctx context.Context, id int32) error {
	return r.tx.Q(ctx).DeleteTeam(ctx, id)
}

func (r *TeamRepo) GetAdminTeamByID(ctx context.Context, id int32) (*domain.Team, error) {
	row, err := r.tx.Q(ctx).GetTeamByID(ctx, gen.GetTeamByIDParams{
		ID:      id,
		ShowAll: true,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get admin team by id: %w", err)
	}

	team := r.toTeamDomain(&row)
	return &team, nil
}

func (r *TeamRepo) GetPublicTeamByID(ctx context.Context, id int32) (*domain.Team, error) {
	row, err := r.tx.Q(ctx).GetTeamByID(ctx, gen.GetTeamByIDParams{
		ID:      id,
		ShowAll: false,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get public team by id: %w", err)
	}

	team := r.toTeamDomain(&row)
	return &team, nil
}

func (r *TeamRepo) GetAdminTeamsList(ctx context.Context) ([]domain.Team, error) {
	rows, err := r.tx.Q(ctx).GetTeamsList(ctx, true)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get admin teams list: %w", err)
	}
	return mapSlice(rows, r.toTeamDomain), nil
}

func (r *TeamRepo) GetPublicTeamsList(ctx context.Context) ([]domain.Team, error) {
	rows, err := r.tx.Q(ctx).GetTeamsList(ctx, false)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get public teams list: %w", err)
	}
	return mapSlice(rows, r.toTeamDomain), nil
}

func (r *TeamRepo) UpdateTeamOrder(ctx context.Context, team *domain.Team) error {
	err := r.tx.Q(ctx).UpdateTeamOrder(ctx, gen.UpdateTeamOrderParams{
		ID:           team.ID,
		DisplayOrder: team.DisplayOrder,
	})
	if err != nil {
		return fmt.Errorf("update team order: %w", err)
	}
	return nil
}

func (r *TeamRepo) toTeamDomain(row *gen.Team) domain.Team {
	return domain.Team{
		ID:           row.ID,
		Name:         row.Name,
		LogoPath:     row.LogoPath,
		Description:  row.Description,
		IsActive:     row.IsActive,
		DisplayOrder: row.DisplayOrder,
	}
}
