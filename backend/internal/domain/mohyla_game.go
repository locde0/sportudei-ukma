package domain

import (
	"context"
)

type MohylaGame struct {
	ID          int32
	Title       string
	Description string
	Content     string
}

type MohylaGameRepository interface {
	GetMohylaGame(ctx context.Context) (*MohylaGame, error)
	UpdateMohylaGame(ctx context.Context, game *MohylaGame) error
}
