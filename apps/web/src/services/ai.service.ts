import { api } from './api';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

interface AskResponse {
  success: boolean;
  data: {
    response: string;
    conversationId?: string;
  };
}

interface TranscribeResponse {
  success: boolean;
  data: {
    text: string;
    confidence: number;
  };
}

export const aiService = {
  ask: (question: string, context?: string, conversationId?: string) =>
    api.post<AskResponse>('/api/ai/ask', { question, context, conversationId }),

  transcribe: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/transcribe`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.accessToken}`,
      },
    }).then(res => res.json()) as Promise<TranscribeResponse>;
  },

  getConversation: (conversationId: string) =>
    api.get<{ success: boolean; data: AIConversation }>(`/api/ai/conversation/${conversationId}`),

  getConversations: () =>
    api.get<{ success: boolean; data: AIConversation[] }>('/api/ai/conversations'),

  deleteConversation: (conversationId: string) =>
    api.delete<{ success: boolean }>(`/api/ai/conversation/${conversationId}`),
};
