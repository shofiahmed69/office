import { api } from './api';
import type { User } from '@/stores/auth.store';

export type { User };

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
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
}

export interface RefreshResponse {
  success: boolean;
  data: {
    tokens: AuthTokens;
  };
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/api/auth/login', credentials),

  register: (data: RegisterData) =>
    api.post<AuthResponse>('/api/auth/register', data),

  logout: () =>
    api.post<{ success: boolean }>('/api/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<RefreshResponse>('/api/auth/refresh', { refreshToken }),

  getMe: () =>
    api.get<{ success: boolean; data: User }>('/api/users/me'),

  forgotPassword: (email: string) =>
    api.post<{ success: boolean }>('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ success: boolean }>('/api/auth/reset-password', { token, password }),
};
