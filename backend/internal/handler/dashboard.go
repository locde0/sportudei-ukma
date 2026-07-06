package handler

import (
	"net/http"

	"github.com/locde0/sportudei-ukma/backend/internal/domain"
	"github.com/locde0/sportudei-ukma/backend/internal/dto"
	"github.com/locde0/sportudei-ukma/backend/internal/pkg/httputil"
	"github.com/locde0/sportudei-ukma/backend/internal/service"
)

type DashboardHandler struct {
	service *service.DashboardService
}

func NewDashboardHandler(service *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{service: service}
}

// GetDashboard godoc
// @Summary      Get dashboard stats
// @Description  Get aggregated stats and recent events for admin dashboard
// @Tags         admin-dashboard
// @Produce      json
// @Success      200 {object} dto.AdminDashboardResponse
// @Security     BearerAuth
// @Router       /api/admin/dashboard [get]
func (h *DashboardHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	stats, inProgress, planned, err := h.service.GetAdminDashboard(r.Context())
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	statsDto := dto.AdminDashboardStatsResponse{
		EventsInProgress: stats.InProgressEvents,
		EventsPlanned:    stats.PlannedEvents,
		EventsCompleted:  stats.CompletedEvents,
		TeamsActive:      stats.ActiveTeams,
		TeamsTotal:       stats.TotalTeams,
	}

	res := dto.AdminDashboardResponse{
		Stats:                  statsDto,
		RecentInProgressEvents: mapEventListToDto(inProgress),
		RecentPlannedEvents:    mapEventListToDto(planned),
	}

	httputil.JSON(w, http.StatusOK, res)
}

func mapEventListToDto(events []domain.EventListItem) []dto.AdminEventsListItemResponse {
	list := make([]dto.AdminEventsListItemResponse, 0, len(events))
	for _, e := range events {
		list = append(list, dto.AdminEventsListItemResponse{
			BaseEventResponse: dto.BaseEventResponse{
				ID:        e.ID,
				Title:     e.Title,
				Desc:      e.Description,
				EventDate: e.EventDate,
				Location:  e.Location,
				Status:    e.Status,
			},
			IsPublished:   e.IsPublished,
			MainPhotoPath: e.MainImagePath,
		})
	}
	return list
}
