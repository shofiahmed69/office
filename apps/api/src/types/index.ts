// User types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  primaryRoleId: number;
  emailConfirmed: boolean;
  activeOrArchive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserTag {
  id: number;
  userId: number;
  tagName: string;
  tagValue?: string;
  masterTagId?: number;
  ratingScore?: number;
  sourceType: 'manual' | 'ai' | 'imported';
  isFilled: boolean;
  isVerified: boolean;
  createdAt: Date;
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
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Assessment types
export interface Assessment {
  id: number;
  userId: number;
  subjectId: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  skillScores: Record<string, number>;
  completedAt?: Date;
}

export interface AssessmentQuestion {
  id: number;
  questionText: string;
  options: { id: string; text: string }[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface RoadmapData {
  modules: RoadmapModule[];
  milestones: Milestone[];
}

/** A single learning item (video, article, etc.) within a module */
export interface SubContent {
  id: number;
  contentId: number;
  title: string;
  type: 'video' | 'article' | 'exercise';
  durationMinutes?: number;
  durationSeconds?: number;
  externalId?: string;
  contentUrl?: string;
  thumbnailUrl?: string;
  sequenceOrder: number;
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
  startedAt?: string;
  completedAt?: string;
  /** Detailed learning items (videos, articles) for this module – populated when fetching roadmap */
  subContents?: SubContent[];
}

export interface Milestone {
  week: number;
  name: string;
  description: string;
}

// Content types
export interface Content {
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
}

export interface ContentProgress {
  id: number;
  userId: number;
  contentId: number;
  watchTimeSeconds: number;
  totalDuration: number;
  lastPosition: number;
  isCompleted: boolean;
  completedAt?: Date;
}

// Study Buddy types
export interface StudyBuddyMatch {
  id: number;
  requesterUserId: number;
  requestedUserId: number;
  matchScore: number;
  matchReason?: string;
  personalMessage?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  requestedAt: Date;
  respondedAt?: Date;
}

export interface StudyBuddy {
  id: number;
  userId1: number;
  userId2: number;
  connectedAt: Date;
  totalSessions: number;
  lastSessionAt?: Date;
  isActive: boolean;
}

export interface BuddyAssignment {
  id: number;
  buddyId: number;
  roadmapId: number;
  moduleId?: number;
  status: 'active' | 'paused' | 'ended';
  createdAt: Date;
  updatedAt: Date;
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
  scheduledStartTime?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  durationMinutes?: number;
  studyTopics: string[];
  learningGoals: string[];
  aiSummary?: string;
  aiKeyInsights?: string[];
  aiActionItems?: string[];
}

export interface TranscriptChunk {
  id: number;
  sessionId: number;
  speakerUserId?: number;
  transcriptText: string;
  timestamp: Date;
  sequenceNumber: number;
  confidenceScore?: number;
  languageDetected?: string;
}

// Analytics types
export interface AttentionData {
  id: number;
  sessionId: number;
  userId: number;
  focusPercentage: number;
  totalSamples: number;
  focusedSamples: number;
  distractionEvents: number;
  recordedAt: Date;
}

export interface LearningProgress {
  userId: number;
  currentRoadmap?: Roadmap;
  skillProgress: Record<string, { initialScore: number; currentScore: number; improvement: number }>;
  studySessions: { totalSessions: number; totalHours: number; averageSessionDuration: number };
}

// Admin types
export interface AdminUserFilters {
  role?: number;
  status?: 'active' | 'archived' | 'locked';
  search?: string;
}

export interface PlatformAnalytics {
  dailyActiveUsers: number;
  totalSignups: number;
  activeSubscriptions: number;
  studySessionsToday: number;
  avgSessionDuration: number;
}
