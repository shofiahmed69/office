import { api } from './api';

export interface Assessment {
  id: number;
  userId: number;
  subjectId: number;
  subjectName?: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  skillScores: Record<string, number>;
  completedAt?: string;
  createdAt: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

interface StartAssessmentResponse {
  success: boolean;
  data: {
    assessmentId: number;
    questions: AssessmentQuestion[];
  };
}

interface AnswerResponse {
  success: boolean;
  data: {
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
    nextQuestion?: AssessmentQuestion;
  };
}

interface CompleteResponse {
  success: boolean;
  data: {
    assessment: Assessment;
    skillGaps: Record<string, any>;
    recommendations: string[];
  };
}

interface AIQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  explanation?: string;
}

interface GenerateQuestionsResponse {
  success: boolean;
  data: {
    questions: AIQuestion[];
  };
}

interface EvaluateAnswerResponse {
  success: boolean;
  data: {
    isCorrect: boolean;
    feedback: string;
    score: number;
  };
}

interface AnalyzeResultsResponse {
  success: boolean;
  data: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    skillGaps: Record<string, number>;
  };
}

interface CompleteWithResultsData {
  assessmentId: number;
  overallScore: number;
  skillScores: Record<string, number>;
  weakPoints: string[];
  conceptsTested: string[];
  correctAnswers: number;
  questionsAnswered: number;
}

export const assessmentService = {
  start: (subjectId: number, subjectName: string) =>
    api.post<StartAssessmentResponse>('/api/assessments/start', { subjectId, subjectName }),

  answer: (assessmentId: number, questionId: number, answerId: string, timeSpentSeconds: number) =>
    api.post<AnswerResponse>(`/api/assessments/${assessmentId}/answer`, {
      questionId,
      answerId,
      timeSpentSeconds,
    }),

  complete: (assessmentId: number) =>
    api.post<CompleteResponse>(`/api/assessments/${assessmentId}/complete`),

  completeWithResults: (
    assessmentId: number,
    payload: {
      answers: Array<{ questionId: string; correctAnswer: number; selectedOption: number; topic: string }>;
      timeSpentSeconds: number;
    }
  ) =>
    api.post<{ success: boolean; data: CompleteWithResultsData }>(
      `/api/assessments/${assessmentId}/complete-with-results`,
      payload
    ),

  getHistory: () =>
    api.get<{ success: boolean; data: Assessment[] }>('/api/assessments/history'),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Assessment }>(`/api/assessments/${id}`),

  // AI-powered methods (pass { signal } for long-running request, e.g. AbortController with 120s timeout)
  generateQuestions: (
    subject: string,
    difficulty?: string,
    numQuestions?: number,
    topics?: string[],
    requestOptions?: { signal?: AbortSignal }
  ) =>
    api.post<GenerateQuestionsResponse>(
      '/api/assessments/ai/generate-questions',
      { subject, difficulty, numQuestions, topics },
      requestOptions
    ),

  evaluateAnswer: (questionId: string, userAnswer: string, correctAnswer: string) =>
    api.post<EvaluateAnswerResponse>('/api/assessments/ai/evaluate', {
      questionId,
      userAnswer,
      correctAnswer,
    }),

  analyzeResults: (assessmentId: number) =>
    api.post<AnalyzeResultsResponse>(`/api/assessments/${assessmentId}/analyze`),
};
