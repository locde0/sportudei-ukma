import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _isRetry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function setAccessToken(token: string): void {
  localStorage.setItem('access_token', token);
}

export function clearAccessToken(): void {
  localStorage.removeItem('access_token');
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._isRetry
    ) {
      return Promise.reject(error);
    }

    originalRequest._isRetry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post<{ access_token: string }>(
            `${API_BASE}/auth/refresh`,
            {},
            { withCredentials: true },
          )
          .then(({ data }) => {
            setAccessToken(data.access_token);
            return data.access_token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
      return Promise.reject(refreshError);
    }
  },
);
