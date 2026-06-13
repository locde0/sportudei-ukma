import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken } from '../api/client';

export function ProtectedRoute() {
  if (!getAccessToken()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}
