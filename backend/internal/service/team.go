package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type TeamService struct {
	teams   domain.TeamRepository
	storage domain.FileStorage
	log     *slog.Logger
}

func NewTeamService(teams domain.TeamRepository, storage domain.FileStorage, log *slog.Logger) *TeamService {
	return &TeamService{
		teams:   teams,
		storage: storage,
		log:     log,
	}
}

func (s *TeamService) CreateTeam(ctx context.Context, team *domain.Team, file *domain.File) error {
	path, err := s.storage.Upload(ctx, *file, "teams")
	if err != nil {
		return fmt.Errorf("upload team logo: %w", err)
	}

	team.LogoPath = path

	if err := s.teams.CreateTeam(ctx, team); err != nil {
		_ = s.storage.Delete(ctx, path)
		return fmt.Errorf("create team: %w", err)
	}

	return nil
}

func (s *TeamService) UpdateTeam(ctx context.Context, team *domain.Team, file *domain.File) error {
	oldTeam, err := s.teams.GetAdminTeamByID(ctx, team.ID)
	if err != nil {
		return fmt.Errorf("get old team: %w", err)
	}
	oldLogoPath := oldTeam.LogoPath

	if file != nil {
		path, err := s.storage.Upload(ctx, *file, "teams")
		if err != nil {
			return fmt.Errorf("upload new team logo: %w", err)
		}
		team.LogoPath = path
	} else {
		team.LogoPath = oldLogoPath
	}

	if err := s.teams.UpdateTeam(ctx, team); err != nil {
		if file != nil {
			_ = s.storage.Delete(ctx, team.LogoPath)
		}
		return fmt.Errorf("update team: %w", err)
	}

	if file != nil && oldLogoPath != "" {
		if err := s.storage.Delete(ctx, oldLogoPath); err != nil {
			s.log.Warn("delete old team logo", slog.String("path", oldLogoPath))
		}
	}

	return nil
}

func (s *TeamService) DeleteTeam(ctx context.Context, id int32) error {
	team, err := s.teams.GetAdminTeamByID(ctx, id)
	if err != nil {
		return fmt.Errorf("get team: %w", err)
	}

	if err := s.teams.DeleteTeam(ctx, id); err != nil {
		return fmt.Errorf("delete team: %w", err)
	}

	if err := s.storage.Delete(ctx, team.LogoPath); err != nil {
		s.log.Warn("delete team logo", slog.String("path", team.LogoPath))
	}

	return nil
}

func (s *TeamService) GetAdminTeam(ctx context.Context, id int32) (*domain.Team, error) {
	team, err := s.teams.GetAdminTeamByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get admin team: %w", err)
	}

	return team, nil
}

func (s *TeamService) GetPublicTeam(ctx context.Context, id int32) (*domain.Team, error) {
	team, err := s.teams.GetPublicTeamByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get public team: %w", err)
	}

	return team, nil
}

func (s *TeamService) ListAdminTeams(ctx context.Context) ([]domain.Team, error) {
	teams, err := s.teams.GetAdminTeamsList(ctx)
	if err != nil {
		return nil, fmt.Errorf("get admin teams list: %w", err)
	}

	return teams, nil
}

func (s *TeamService) ListPublicTeams(ctx context.Context) ([]domain.Team, error) {
	teams, err := s.teams.GetPublicTeamsList(ctx)
	if err != nil {
		return nil, fmt.Errorf("get public teams list: %w", err)
	}

	return teams, nil
}

func (s *TeamService) UpdateTeamOrder(ctx context.Context, team *domain.Team) error {
	if err := s.teams.UpdateTeamOrder(ctx, team); err != nil {
		return fmt.Errorf("update team order: %w", err)
	}

	return nil
}
