package domain

type DashboardStats struct {
	InProgressEvents int64
	PlannedEvents    int64
	CompletedEvents  int64
	ActiveTeams      int64
	TotalTeams       int64
}
