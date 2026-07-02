package service

import (
	"context"
	"fmt"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type MohylaGameService struct {
	game domain.MohylaGameRepository
}

func NewMohylaGameService(game domain.MohylaGameRepository) *MohylaGameService {
	return &MohylaGameService{
		game: game,
	}
}

func (s *MohylaGameService) GetMohylaGame(ctx context.Context) (*domain.MohylaGame, error) {
	game, err := s.game.GetMohylaGame(ctx)
	if err != nil {
		return nil, fmt.Errorf("get mohyla game: %w", err)
	}

	return game, nil
}

func (s *MohylaGameService) UpdateMohylaGame(ctx context.Context, game *domain.MohylaGame) error {
	if err := s.game.UpdateMohylaGame(ctx, game); err != nil {
		return fmt.Errorf("update mohyla game: %w", err)
	}

	return nil
}
