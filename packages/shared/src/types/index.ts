/**
 * Shared TypeScript types used across API and Web
 */

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  emailConfirmed: boolean;
  primaryRoleId: number;
  roleName?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  stack?: string; // Only in development
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

// Roadmap types
export interface Roadmap {
  id: number;
  userId: number;
  subject: string;
  learningGoal: string;
  skillGaps: Record<string, number>;
  roadmapData: RoadmapData;
  hoursPerWeek: number;
  estimatedWeeks: number;
  status: 'active' | 'paused' | 'completed' | 'archived';
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapData {
  modules: RoadmapModule[];
  milestones: Milestone[];
}

export interface RoadmapModule {
  id: number;
  name: string;
  description: string;
  topics: string[];
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: number[];
  contentIds: number[];
  sequenceOrder: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface Milestone {
  week: number;
  name: string;
  description: string;
}

// Study Buddy types
export interface StudyBuddy {
  buddyId: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  connectedAt: string;
  totalSessions: number;
  lastSessionAt?: string;
  isActive: boolean;
}

export interface StudyBuddyMatch {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  matchScore: number;
  matchReason: string;
  sharedGoals: string[];
  availableTimes: string[];
  timezone: string;
}

// Study Session types
export interface StudySession {
  id: number;
  sessionName: string;
  sessionDescription?: string;
  hostUserId: number;
  studyBuddyUserId?: number;
  videoCallType: 'webrtc' | 'daily';
  videoCallRoomId: string;
  videoCallUrl?: string;
  isAIListeningEnabled: boolean;
  isRecordingEnabled: boolean;
  isPublic: boolean;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledStartTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  durationMinutes?: number;
  studyTopics: string[];
  learningGoals: string[];
  aiSummary?: string;
  aiKeyInsights?: string[];
  aiActionItems?: string[];
  engagementScore?: number;
  createdAt: string;
  updatedAt: string;
}

// Content types
export interface EducationalContent {
  id: number;
  sourceId: number;
  externalId: string;
  title: string;
  description?: string;
  contentUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  topics: string[];
  qualityScore: number;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

// Validation error types
export interface ValidationError {
  type: string;
  value: any;
  msg: string;
  path: string;
  location: string;
}

export interface ValidationErrorResponse {
  success: false;
  error: 'Validation failed';
  details: ValidationError[];
}

// Health check types
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
}

export interface ReadinessCheckResponse {
  status: 'ready' | 'not_ready';
  checks: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
  };
}
