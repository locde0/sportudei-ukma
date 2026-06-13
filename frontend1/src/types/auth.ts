export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOTPRequest {
  email: string;
  code: string;
}

export interface TokenResponse {
  access_token: string;
}
