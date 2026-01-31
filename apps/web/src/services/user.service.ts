import { api } from './api';
import type { User } from '@/stores/auth.store';

export interface UserTag {
  id: number;
  tagName: string;
  tagValue?: string;
  tagGroupName?: string;
  tagCategoryName?: string;
  ratingScore?: number;
  isFilled: boolean;
  isVerified: boolean;
  aiSuggested: boolean;
}

export interface UserPreferences {
  studyReminders: boolean;
  emailNotifications: boolean;
  weeklyReport: boolean;
  timezone: string;
  language: string;
  preferredStudyTime: string[];
  dailyStudyGoalMinutes: number;
}

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePictureUrl?: string;
}

interface UserResponse {
  success: boolean;
  data: User;
}

interface TagsResponse {
  success: boolean;
  data: UserTag[];
}

interface PreferencesResponse {
  success: boolean;
  data: UserPreferences;
}

export const userService = {
  getProfile: () =>
    api.get<UserResponse>('/api/users/me'),

  updateProfile: (data: ProfileUpdateData) =>
    api.patch<UserResponse>('/api/users/me', data),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.patch<{ success: boolean }>('/api/users/me/password', {
      currentPassword,
      newPassword,
    }),

  getTags: () =>
    api.get<TagsResponse>('/api/users/me/tags'),

  updateTags: (tags: Partial<UserTag>[]) =>
    api.post<TagsResponse>('/api/users/me/tags', { tags }),

  getPreferences: () =>
    api.get<PreferencesResponse>('/api/users/me/preferences'),

  updatePreferences: (preferences: Partial<UserPreferences>) =>
    api.patch<PreferencesResponse>('/api/users/me/preferences', preferences),

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.accessToken}`,
      },
    });
    
    return response.json() as Promise<{ success: boolean; data: { url: string } }>;
  },

  deleteAccount: () =>
    api.delete<{ success: boolean }>('/api/users/me'),
};
