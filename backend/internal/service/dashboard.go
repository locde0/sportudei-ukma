package service

import (
	"context"

	"github.com/locde0/sportudei-ukma/backend/db/gen"
	"github.com/locde0/sportudei-ukma/backend/internal/domain"
)

type DashboardService struct {
	queries *gen.Queries
}

func NewDashboardService(queries *gen.Queries) *DashboardService {
	return &DashboardService{queries: queries}
}

func (s *DashboardService) GetAdminDashboard(ctx context.Context) (domain.DashboardStats, []domain.EventListItem, []domain.EventListItem, error) {
	statsRow, err := s.queries.GetAdminDashboardStats(ctx)
	if err != nil {
		return domain.DashboardStats{}, nil, nil, err
	}

	stats := domain.DashboardStats{
		InProgressEvents: statsRow.InProgressEvents,
		PlannedEvents:    statsRow.PlannedEvents,
		CompletedEvents:  statsRow.CompletedEvents,
		ActiveTeams:      statsRow.ActiveTeams,
		TotalTeams:       statsRow.TotalTeams,
	}

	inProgressRows, err := s.queries.GetRecentEventsByStatus(ctx, gen.GetRecentEventsByStatusParams{
		Status: gen.EventStatusInProgress,
		Limit:  5,
	})
	if err != nil {
		return domain.DashboardStats{}, nil, nil, err
	}

	plannedRows, err := s.queries.GetRecentEventsByStatus(ctx, gen.GetRecentEventsByStatusParams{
		Status: gen.EventStatusPlanned,
		Limit:  5,
	})
	if err != nil {
		return domain.DashboardStats{}, nil, nil, err
	}

	inProgressList := mapRecentEvents(inProgressRows)
	plannedList := mapRecentEvents(plannedRows)

	return stats, inProgressList, plannedList, nil
}

func mapRecentEvents(rows []gen.GetRecentEventsByStatusRow) []domain.EventListItem {
	list := make([]domain.EventListItem, 0, len(rows))
	for _, row := range rows {
		item := domain.EventListItem{
			ID:          row.Event.ID,
			Title:       row.Event.Title,
			Description: row.Event.Description,
			Location:    row.Event.Location,
			EventDate:   row.Event.EventDate,
			Status:      domain.EventStatus(row.Event.Status),
			IsPublished: row.Event.IsPublished,
		}
		if row.MainImagePath != nil {
			item.MainImagePath = *row.MainImagePath
		}
		list = append(list, item)
	}
	return list
}
