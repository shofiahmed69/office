/**
 * Shared TypeScript types for the frontend
 */

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  pagination: {
    page: number;
    limit: number;
    totalResults: number;
    totalPages: number;
  };
}

export interface Roadmap {
  id: number;
  userId: number;
  subject: string;
  learningGoal: string;
  skillGaps: Record<string, any>;
  roadmapData: Record<string, any>;
  hoursPerWeek: number;
  estimatedWeeks: number;
  status: string;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyBuddy {
  id: number;
  userId: number;
  username: string;
  firstName: string;
  profilePictureUrl?: string;
  matchScore: number;
  matchReason: string;
}

export interface StudySession {
  id: number;
  sessionName: string;
  hostUserId: number;
  buddyUserId?: number;
  videoCallRoomId: string;
  status: 'scheduled' | 'active' | 'completed';
  scheduledStartTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  isAIListeningEnabled: boolean;
}
