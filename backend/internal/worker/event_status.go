package worker

import (
	"context"
	"log/slog"
	"time"

	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type EventStatusWorker struct {
	eventService *service.EventService
	log          *slog.Logger
	interval     time.Duration
}

func NewEventStatusWorker(es *service.EventService, log *slog.Logger, interval time.Duration) *EventStatusWorker {
	return &EventStatusWorker{
		eventService: es,
		log:          log,
		interval:     interval,
	}
}

func (w *EventStatusWorker) Name() string {
	return "EventStatusCron"
}

func (w *EventStatusWorker) Start(ctx context.Context) {
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

func (w *EventStatusWorker) runJob() {
	w.log.Debug("running update for event statuses")

	jobCtx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	if err := w.eventService.UpdateEventStatuses(jobCtx); err != nil {
		w.log.Error("failed to update event statuses", slog.String("error", err.Error()))
	}
}
