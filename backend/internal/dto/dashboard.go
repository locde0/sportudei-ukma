package dto

type AdminDashboardStatsResponse struct {
	EventsInProgress int64 `json:"events_in_progress"`
	EventsPlanned    int64 `json:"events_planned"`
	EventsCompleted  int64 `json:"events_completed"`
	TeamsActive      int64 `json:"teams_active"`
	TeamsTotal       int64 `json:"teams_total"`
}

type AdminDashboardResponse struct {
	Stats                  AdminDashboardStatsResponse   `json:"stats"`
	RecentInProgressEvents []AdminEventsListItemResponse `json:"recent_in_progress_events"`
	RecentPlannedEvents    []AdminEventsListItemResponse `json:"recent_planned_events"`
}
