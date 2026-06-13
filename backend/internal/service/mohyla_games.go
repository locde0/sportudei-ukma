package service

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	gen "github.com/locde0/sportudei-ukma/backend/db/generated"
	"github.com/locde0/sportudei-ukma/backend/internal/db"
)

type GameService struct {
	store *db.Store
}

func NewGameService(store *db.Store) *GameService {
	return &GameService{store: store}
}

type MohylaGameDto struct {
	ID        int32
	Title     string
	ShortDesc string
	Content   string
}

type TeamDto struct {
	ID          int32
	Name        string
	LogoURL     string
	Description string
	IsActive    bool
}

func (s *GameService) saveLogo(fileHeader *multipart.FileHeader) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	ext := filepath.Ext(fileHeader.Filename)
	newFilename := fmt.Sprintf("team_%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join("uploads", newFilename)

	dst, err := os.Create(savePath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to save file content: %w", err)
	}

	return "/" + filepath.ToSlash(savePath), nil
}

func (s *GameService) GetGame(ctx context.Context, id int32) (MohylaGameDto, error) {
	game, err := s.store.GetGame(ctx, id)
	if err != nil {
		return MohylaGameDto{}, fmt.Errorf("failed to get game: %w", err)
	}

	return MohylaGameDto{
		ID:        game.ID,
		Title:     game.Title,
		ShortDesc: game.ShortDescription,
		Content:   game.Content,
	}, nil
}

func (s *GameService) UpdateGame(ctx context.Context, id int32, dto MohylaGameDto) error {
	err := s.store.UpdateGame(ctx, gen.UpdateGameParams{
		ID:               id,
		Title:            dto.Title,
		ShortDescription: dto.ShortDesc,
		Content:          dto.Content,
	})
	if err != nil {
		return fmt.Errorf("failed to update game: %w", err)
	}
	return nil
}

func (s *GameService) ListTeams(ctx context.Context) ([]TeamDto, error) {
	teams, err := s.store.GetTeams(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get teams: %w", err)
	}

	var dtos []TeamDto
	for _, t := range teams {
		dtos = append(dtos, TeamDto{
			ID:          t.ID,
			Name:        t.Name,
			LogoURL:     t.LogoUrl,
			Description: t.Description,
			IsActive:    t.IsActive,
		})
	}
	return dtos, nil
}

func (s *GameService) CreateTeam(ctx context.Context, dto TeamDto, logo *multipart.FileHeader) (int32, error) {
	logoURL, err := s.saveLogo(logo)
	if err != nil {
		return 0, err
	}

	id, err := s.store.CreateTeam(ctx, gen.CreateTeamParams{
		Name:        dto.Name,
		LogoUrl:     logoURL,
		Description: dto.Description,
		IsActive:    dto.IsActive,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to create team: %w", err)
	}

	return id, nil
}

func (s *GameService) UpdateTeam(ctx context.Context, id int32, dto TeamDto, logo *multipart.FileHeader) error {
	logoURL := dto.LogoURL
	if logo != nil {
		newLogoURL, err := s.saveLogo(logo)
		if err != nil {
			return err
		}
		logoURL = newLogoURL
	} else {
		teams, err := s.store.GetTeams(ctx)
		if err == nil {
			for _, t := range teams {
				if t.ID == id {
					logoURL = t.LogoUrl
					break
				}
			}
		}
	}

	err := s.store.UpdateTeam(ctx, gen.UpdateTeamParams{
		ID:          id,
		Name:        dto.Name,
		LogoUrl:     logoURL,
		Description: dto.Description,
		IsActive:    dto.IsActive,
	})
	if err != nil {
		return fmt.Errorf("failed to update team: %w", err)
	}

	return nil
}

func (s *GameService) DeleteTeam(ctx context.Context, id int32) error {
	err := s.store.DeleteTeam(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete team: %w", err)
	}
	return nil
}
