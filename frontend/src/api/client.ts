import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

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

export function unwrapData<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  const body = response.data;
  if (!body.success) {
    throw new Error(body.error?.message ?? 'Request failed');
  }
  return body.data as T;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (
      response.config.responseType === 'blob' ||
      response.config.responseType === 'arraybuffer'
    ) {
      return response;
    }

    const body = response.data as ApiEnvelope | undefined;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject(
          new Error(body.error?.message ?? 'Request failed'),
        );
      }
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError<ApiEnvelope>) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._isRetry
    ) {
      const message = error.response?.data?.error?.message ?? error.message;
      return Promise.reject(new Error(message));
    }

    originalRequest._isRetry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post<ApiEnvelope<{ access_token: string }>>(
            `${API_BASE}/auth/refresh`,
            {},
            { withCredentials: true },
          )
          .then(({ data }) => {
            if (!data.success || !data.data?.access_token) {
              throw new Error('Refresh failed');
            }
            setAccessToken(data.data.access_token);
            return data.data.access_token;
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
