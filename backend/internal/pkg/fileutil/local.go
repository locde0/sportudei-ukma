package fileutil

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type LocalStorage struct {
	uploadDir string
}

func NewLocalStorage(uploadDir string) *LocalStorage {
	return &LocalStorage{uploadDir: uploadDir}
}

func (s *LocalStorage) Upload(ctx context.Context, file domain.File) (string, error) {
	fileName := uuid.New().String() + filepath.Ext(file.Name)
	fullPath := filepath.Join(s.uploadDir, fileName)

	dst, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("create file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file.Content); err != nil {
		return "", fmt.Errorf("copy file content: %w", err)
	}

	return filepath.ToSlash(fullPath), nil
}

func (s *LocalStorage) Delete(ctx context.Context, path string) error {
	err := os.Remove(path)
	if err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("delete file: %w", err)
	}
	return nil
}
