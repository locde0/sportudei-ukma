export interface AdminDashboardStatsResponse {
  events_in_progress: number;
  events_planned: number;
  events_completed: number;
  teams_active: number;
  teams_total: number;
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStatsResponse;
  recent_in_progress_events: any[]; // will map to EventListItem
  recent_planned_events: any[]; // will map to EventListItem
}
