package fileutil

import (
	"context"
	"fmt"
	"image"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/disintegration/imaging"
	"github.com/google/uuid"
	"github.com/kolesa-team/go-webp/encoder"
	"github.com/kolesa-team/go-webp/webp"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"golang.org/x/sync/errgroup"
)

type LocalStorage struct {
	uploadDir string
}

func NewLocalStorage(uploadDir string) *LocalStorage {
	return &LocalStorage{uploadDir: uploadDir}
}

func (s *LocalStorage) Upload(ctx context.Context, file domain.File, folder string) (string, error) {
	isImage := strings.HasPrefix(file.ContentType, "image/")
	if !isImage {
		return "", fmt.Errorf("only image files are allowed")
	}

	allowedMimeTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/webp": true,
	}
	if !allowedMimeTypes[file.ContentType] {
		return "", fmt.Errorf("unsupported image format (only jpeg, png, webp allowed)")
	}

	baseName := uuid.New().String()
	targetDir := filepath.Join(s.uploadDir, folder)

	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", fmt.Errorf("create target directory: %w", err)
	}

	if file.Size > 50*1024*1024 {
		return "", fmt.Errorf("file too large: max 50MB allowed")
	}

	img, err := imaging.Decode(file.Content, imaging.AutoOrientation(true))
	if err != nil {
		return "", fmt.Errorf("decode image: %w", err)
	}

	var g errgroup.Group

	g.Go(func() error {
		options, err := encoder.NewLossyEncoderOptions(encoder.PresetPhoto, 85)
		if err != nil {
			return err
		}
		fullImg := imaging.Fit(img, 1920, 1920, imaging.Lanczos)
		return saveWebp(fullImg, filepath.Join(targetDir, baseName+".webp"), options)
	})

	g.Go(func() error {
		mdOptions, err := encoder.NewLossyEncoderOptions(encoder.PresetPhoto, 80)
		if err != nil {
			return err
		}
		mdImg := imaging.Fit(img, 800, 800, imaging.Lanczos)
		return saveWebp(mdImg, filepath.Join(targetDir, baseName+"_md.webp"), mdOptions)
	})

	g.Go(func() error {
		smOptions, err := encoder.NewLossyEncoderOptions(encoder.PresetPhoto, 80)
		if err != nil {
			return err
		}
		smImg := imaging.Fit(img, 150, 150, imaging.Box)
		return saveWebp(smImg, filepath.Join(targetDir, baseName+"_sm.webp"), smOptions)
	})

	if err := g.Wait(); err != nil {
		return "", fmt.Errorf("process image variants: %w", err)
	}

	return path.Join("/uploads", folder, baseName+".webp"), nil
}

func saveWebp(img image.Image, path string, options *encoder.Options) error {
	out, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("create webp file: %w", err)
	}
	defer out.Close()

	if err := webp.Encode(out, img, options); err != nil {
		return fmt.Errorf("encode webp: %w", err)
	}
	return nil
}

func (s *LocalStorage) Delete(ctx context.Context, urlPath string) error {
	relPath := strings.TrimPrefix(urlPath, "/uploads/")
	fsPath := filepath.Join(s.uploadDir, relPath)

	err := os.Remove(fsPath)
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
