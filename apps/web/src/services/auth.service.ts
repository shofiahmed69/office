/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from '@/lib/api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
  message: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/register', data);
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/login', credentials);
  },

  async refreshToken(refreshToken: string): Promise<{ success: boolean; data: { tokens: AuthTokens } }> {
    return apiClient.post('/api/auth/refresh', { refreshToken });
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/api/auth/logout');
  },
};
