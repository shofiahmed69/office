import { api } from './api';

export interface LearningStats {
  totalStudyHours: number;
  sessionsCompleted: number;
  contentCompleted: number;
  assessmentsTaken: number;
  averageScore: number;
  streakDays: number;
  lastStudyDate?: string;
}

export interface ProgressData {
  date: string;
  studyMinutes: number;
  contentCompleted: number;
  assessmentScore?: number;
}

export interface SubjectProgress {
  subject: string;
  progressPercentage: number;
  hoursSpent: number;
  modulesCompleted: number;
  totalModules: number;
}

export interface AttentionData {
  sessionId: number;
  timestamp: string;
  attentionScore: number;
  distractionEvents: number;
}

interface StatsResponse {
  success: boolean;
  data: LearningStats;
}

interface ProgressResponse {
  success: boolean;
  data: ProgressData[];
}

interface SubjectsResponse {
  success: boolean;
  data: SubjectProgress[];
}

interface AttentionResponse {
  success: boolean;
  data: AttentionData[];
}

export const analyticsService = {
  getStats: () =>
    api.get<StatsResponse>('/api/analytics/stats'),

  getProgress: (days: number = 30) =>
    api.get<ProgressResponse>(`/api/analytics/progress?days=${days}`),

  getSubjectProgress: () =>
    api.get<SubjectsResponse>('/api/analytics/subjects'),

  getAttentionData: (sessionId?: number) => {
    const params = sessionId ? `?sessionId=${sessionId}` : '';
    return api.get<AttentionResponse>(`/api/analytics/attention${params}`);
  },

  trackAttention: (data: Omit<AttentionData, 'sessionId'> & { sessionId: number }) =>
    api.post<{ success: boolean }>('/api/analytics/attention', data),

  getWeeklyReport: () =>
    api.get<{ success: boolean; data: any }>('/api/analytics/weekly-report'),

  getAchievements: () =>
    api.get<{ success: boolean; data: any[] }>('/api/analytics/achievements'),
};
