import { api } from './api';

export interface StudySession {
  id: number;
  sessionName: string;
  hostUserId: number;
  buddyUserId?: number;
  videoCallRoomId: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledStartTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  durationMinutes?: number;
  isAIListeningEnabled: boolean;
  subject?: string;
  notes?: string;
  hostUser?: {
    id: number;
    username: string;
    firstName: string;
    profilePictureUrl?: string;
  };
  buddyUser?: {
    id: number;
    username: string;
    firstName: string;
    profilePictureUrl?: string;
  };
}

export interface TranscriptChunk {
  id: number;
  sessionId: number;
  speakerUserId: number;
  chunkText: string;
  startTimestamp: string;
  endTimestamp: string;
  sequenceNumber: number;
}

export interface AIAssistance {
  id: number;
  sessionId: number;
  questionAsked: string;
  aiResponse: string;
  askedByUserId: number;
  createdAt: string;
}

interface CreateSessionInput {
  sessionName: string;
  buddyUserId?: number;
  scheduledStartTime: string;
  isAIListeningEnabled?: boolean;
  subject?: string;
}

interface SessionResponse {
  success: boolean;
  data: StudySession;
}

interface SessionsResponse {
  success: boolean;
  data: StudySession[];
}

interface TranscriptResponse {
  success: boolean;
  data: TranscriptChunk[];
}

export const sessionService = {
  create: (data: CreateSessionInput) =>
    api.post<SessionResponse>('/api/session/create', data),

  getAll: () =>
    api.get<SessionsResponse>('/api/session'),

  getById: (id: number) =>
    api.get<SessionResponse>(`/api/session/${id}`),

  join: (sessionId: number) =>
    api.post<SessionResponse>(`/api/session/${sessionId}/join`),

  start: (sessionId: number) =>
    api.post<SessionResponse>(`/api/session/${sessionId}/start`),

  end: (sessionId: number, notes?: string) =>
    api.post<SessionResponse>(`/api/session/${sessionId}/end`, { notes }),

  cancel: (sessionId: number) =>
    api.post<{ success: boolean }>(`/api/session/${sessionId}/cancel`),

  getTranscript: (sessionId: number) =>
    api.get<TranscriptResponse>(`/api/session/${sessionId}/transcript`),

  addTranscriptChunk: (sessionId: number, chunk: Omit<TranscriptChunk, 'id' | 'sessionId'>) =>
    api.post<{ success: boolean }>(`/api/session/${sessionId}/transcript`, chunk),

  getUpcoming: () =>
    api.get<SessionsResponse>('/api/session?status=scheduled'),

  getPast: () =>
    api.get<SessionsResponse>('/api/session?status=completed'),
};
