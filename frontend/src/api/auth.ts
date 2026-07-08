import { apiClient } from './client';
import type { LoginRequest, TokenResponse, VerifyOTPRequest } from '../types/auth';

export async function login(data: LoginRequest): Promise<void> {
  await apiClient.post('/auth/login', data);
}

export async function verifyOTP(data: VerifyOTPRequest): Promise<TokenResponse> {
  const { data: response } = await apiClient.post<TokenResponse>('/auth/verify', data);
  return response;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
