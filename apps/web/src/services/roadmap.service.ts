import { api } from './api';

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
  roadmapId?: number;
  moduleName?: string;
  moduleDescription?: string;
  name?: string;
  description?: string;
  topics: string[];
  estimatedHours: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  subContents?: SubContent[];
}

export interface Roadmap {
  id: number;
  userId: number;
  subject: string;
  learningGoal: string;
  skillGaps: Record<string, any>;
  roadmapData: {
    modules: RoadmapModule[];
    milestones: any[];
  };
  hoursPerWeek: number;
  estimatedWeeks: number;
  status: 'active' | 'paused' | 'completed';
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface GenerateRoadmapInput {
  subject: string;
  learningGoal: string;
  hoursPerWeek: number;
  skillGaps?: Record<string, number>;
  assessmentId?: number;
}

interface RoadmapResponse {
  success: boolean;
  data: Roadmap;
}

interface RoadmapsResponse {
  success: boolean;
  data: Roadmap[];
}

export const roadmapService = {
  generate: (data: GenerateRoadmapInput) =>
    api.post<RoadmapResponse>('/api/roadmaps/generate', data),

  getAll: () =>
    api.get<{ success: boolean; data: { roadmaps: Roadmap[] } }>('/api/roadmaps'),

  getById: (id: number) =>
    api.get<RoadmapResponse>(`/api/roadmaps/${id}`),

  updateModuleStatus: (roadmapId: number, moduleId: number, status: RoadmapModule['status']) =>
    api.patch<RoadmapResponse>(`/api/roadmaps/${roadmapId}/module/${moduleId}`, { status }),

  delete: (id: number) =>
    api.delete<{ success: boolean }>(`/api/roadmaps/${id}`),
};
