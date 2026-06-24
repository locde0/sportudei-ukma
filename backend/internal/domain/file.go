package domain

import (
	"context"
	"io"
)

type File struct {
	Name        string
	ContentType string
	Size        int64
	Content     io.Reader
}

type FileStorage interface {
	Upload(ctx context.Context, file File) (string, error)
	Delete(ctx context.Context, path string) error
}
