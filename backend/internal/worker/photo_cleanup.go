package worker

import (
	"context"
	"log/slog"
	"time"

	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type PhotoCleanupWorker struct {
	eventService   *service.EventService
	galleryService *service.GalleryService
	log            *slog.Logger
	interval       time.Duration
}

func NewPhotoCleanupWorker(
	es *service.EventService,
	gs *service.GalleryService,
	log *slog.Logger,
	interval time.Duration,
) *PhotoCleanupWorker {
	return &PhotoCleanupWorker{
		eventService:   es,
		galleryService: gs,
		log:            log,
		interval:       interval,
	}
}

func (w *PhotoCleanupWorker) Name() string {
	return "PhotoCleanupCron"
}

func (w *PhotoCleanupWorker) Start(ctx context.Context) {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return

		case <-ticker.C:
			w.runJob()
		}
	}
}

func (w *PhotoCleanupWorker) runJob() {
	w.log.Debug("running cleanup for orphaned photos")

	jobCtx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)

	if err := w.eventService.CleanupOrphanedEventPhotos(jobCtx); err != nil {
		w.log.Error("failed to cleanup orphaned event photos", slog.String("error", err.Error()))
	}

	if err := w.galleryService.CleanupOrphanedGalleryPhotos(jobCtx); err != nil {
		w.log.Error("failed to cleanup orphaned gallery photos", slog.String("error", err.Error()))
	}

	cancel()
}
