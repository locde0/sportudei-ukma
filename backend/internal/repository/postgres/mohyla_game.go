package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type MohylaGameRepo struct {
	tx *TxManager
}

func NewMohylaGameRepo(tx *TxManager) *MohylaGameRepo {
	return &MohylaGameRepo{tx: tx}
}

func (r *MohylaGameRepo) GetMohylaGame(ctx context.Context) (*domain.MohylaGame, error) {
	row, err := r.tx.Q(ctx).GetMohylaGame(ctx)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("get mohyla game: %w", err)
	}

	game := r.toMohylaGameDomain(&row)
	return &game, nil
}

func (r *MohylaGameRepo) UpdateMohylaGame(ctx context.Context, game *domain.MohylaGame) error {
	err := r.tx.Q(ctx).UpdateMohylaGame(ctx, gen.UpdateMohylaGameParams{
		Title:       game.Title,
		Description: game.Description,
		Content:     game.Content,
	})
	if err != nil {
		return fmt.Errorf("update mohyla game: %w", err)
	}
	return nil
}

func (r *MohylaGameRepo) toMohylaGameDomain(row *gen.MohylaGame) domain.MohylaGame {
	return domain.MohylaGame{
		ID:          row.ID,
		Title:       row.Title,
		Description: row.Description,
		Content:     row.Content,
	}
}
