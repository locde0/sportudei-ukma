import { apiClient } from './client';
import type { AdminDashboardResponse } from '../types/dashboard';

export async function fetchAdminDashboardStats(): Promise<AdminDashboardResponse> {
  const { data } = await apiClient.get<AdminDashboardResponse>('/admin/dashboard');
  return data;
}
