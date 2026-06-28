package fileutil

import (
	"context"
	"fmt"
	"io"
	"os"
	"path"
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

func (s *LocalStorage) Upload(ctx context.Context, file domain.File, folder string) (string, error) {
	fileName := uuid.New().String() + filepath.Ext(file.Name)
	targetDir := filepath.Join(s.uploadDir, folder)

	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", fmt.Errorf("create target directory: %w", err)
	}

	fullPath := filepath.Join(targetDir, fileName)

	dst, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("create file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file.Content); err != nil {
		return "", fmt.Errorf("copy file content: %w", err)
	}

	return "/" + path.Join(s.uploadDir, folder, fileName), nil
}

func (s *LocalStorage) Delete(ctx context.Context, path string) error {
	err := os.Remove(path)
	if err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("delete file: %w", err)
	}
	return nil
}

func (s *LocalStorage) DeleteDir(ctx context.Context, folder string) error {
	dirPath := filepath.Join(s.uploadDir, folder)

	err := os.RemoveAll(dirPath)
	if err != nil {
		return fmt.Errorf("delete directory: %w", err)
	}
	return nil
}
