/**
 * Shared TypeScript types for the frontend
 */

// Re-export types from services
export type { User } from '@/stores/auth.store';
export type { Assessment, AssessmentQuestion } from '@/services/assessment.service';
export type { Roadmap, RoadmapModule } from '@/services/roadmap.service';
export type { Content, ContentProgress } from '@/services/content.service';
export type { StudyBuddy, BuddyMatch, BuddyAssignment } from '@/services/buddy.service';
export type { StudySession, TranscriptChunk, AIAssistance } from '@/services/session.service';
export type { AIMessage, AIConversation } from '@/services/ai.service';
export type { LearningStats, ProgressData, SubjectProgress, AttentionData } from '@/services/analytics.service';
export type { UserTag, UserPreferences } from '@/services/user.service';

// Common response types
export interface APIResponse<T = unknown> {
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

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
}

// Subject options for assessments/roadmaps
export const SUBJECTS = [
  { value: '1', label: 'Mathematics' },
  { value: '2', label: 'Physics' },
  { value: '3', label: 'Chemistry' },
  { value: '4', label: 'Biology' },
  { value: '5', label: 'Computer Science' },
  { value: '6', label: 'Data Science' },
  { value: '7', label: 'Machine Learning' },
  { value: '8', label: 'Web Development' },
  { value: '9', label: 'Mobile Development' },
  { value: '10', label: 'Cloud Computing' },
] as const;

// Topics per subject for focused quizzes (e.g. Computer Science → Flutter)
export const SUBJECT_TOPICS: Record<string, { value: string; label: string }[]> = {
  '5': [ // Computer Science
    { value: 'flutter', label: 'Flutter' },
    { value: 'react', label: 'React' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'algorithms', label: 'Algorithms' },
    { value: 'data-structures', label: 'Data Structures' },
  ],
  '8': [ // Web Development
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'nextjs', label: 'Next.js' },
    { value: 'css', label: 'CSS' },
    { value: 'nodejs', label: 'Node.js' },
  ],
  '9': [ // Mobile Development
    { value: 'flutter', label: 'Flutter' },
    { value: 'react-native', label: 'React Native' },
    { value: 'ios', label: 'iOS / Swift' },
    { value: 'android', label: 'Android / Kotlin' },
  ],
  '6': [ // Data Science
    { value: 'python', label: 'Python' },
    { value: 'pandas', label: 'Pandas' },
    { value: 'sql', label: 'SQL' },
    { value: 'visualization', label: 'Data Visualization' },
  ],
  '7': [ // Machine Learning
    { value: 'supervised', label: 'Supervised Learning' },
    { value: 'deep-learning', label: 'Deep Learning' },
    { value: 'nlp', label: 'NLP' },
    { value: 'computer-vision', label: 'Computer Vision' },
  ],
  '1': [{ value: 'algebra', label: 'Algebra' }, { value: 'calculus', label: 'Calculus' }, { value: 'statistics', label: 'Statistics' }],
  '2': [{ value: 'mechanics', label: 'Mechanics' }, { value: 'thermodynamics', label: 'Thermodynamics' }, { value: 'electromagnetism', label: 'Electromagnetism' }],
  '3': [{ value: 'organic', label: 'Organic Chemistry' }, { value: 'inorganic', label: 'Inorganic' }, { value: 'physical', label: 'Physical Chemistry' }],
  '4': [{ value: 'cell-biology', label: 'Cell Biology' }, { value: 'genetics', label: 'Genetics' }, { value: 'ecology', label: 'Ecology' }],
  '10': [{ value: 'aws', label: 'AWS' }, { value: 'azure', label: 'Azure' }, { value: 'docker', label: 'Docker/Kubernetes' }],
}

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

// Content types
export const CONTENT_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
  { value: 'course', label: 'Course' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'quiz', label: 'Quiz' },
] as const;
