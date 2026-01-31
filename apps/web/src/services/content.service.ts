import { api } from './api';

export interface Content {
  id: number;
  title: string;
  description?: string;
  contentType: 'video' | 'article' | 'course' | 'exercise' | 'quiz';
  sourceUrl: string;
  sourceName: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  rating?: number;
  viewCount: number;
}

export interface ContentProgress {
  contentId: number;
  progressPercentage: number;
  isCompleted: boolean;
  lastAccessedAt: string;
}

interface SearchParams {
  query?: string;
  topics?: string[];
  contentType?: Content['contentType'];
  difficulty?: Content['difficulty'];
  page?: number;
  limit?: number;
}

interface SearchResponse {
  success: boolean;
  data: {
    results: Content[];
    pagination: {
      page: number;
      limit: number;
      totalResults: number;
      totalPages: number;
    };
  };
}

interface ContentResponse {
  success: boolean;
  data: Content;
}

interface RecommendationsResponse {
  success: boolean;
  data: Content[];
}

export const contentService = {
  search: (params: SearchParams) => {
    const queryString = new URLSearchParams();
    if (params.query) queryString.append('query', params.query);
    if (params.topics?.length) queryString.append('topics', params.topics.join(','));
    if (params.contentType) queryString.append('contentType', params.contentType);
    if (params.difficulty) queryString.append('difficulty', params.difficulty);
    if (params.page) queryString.append('page', params.page.toString());
    if (params.limit) queryString.append('limit', params.limit.toString());
    
    return api.get<SearchResponse>(`/api/content/search?${queryString}`);
  },

  getById: (id: number) =>
    api.get<ContentResponse>(`/api/content/${id}`),

  getProgress: (contentId: number) =>
    api.get<{ success: boolean; data: ContentProgress }>(`/api/content/${contentId}/progress`),

  updateProgress: (contentId: number, progressPercentage: number) =>
    api.post<{ success: boolean }>(`/api/content/${contentId}/progress`, { progressPercentage }),

  getRecommendations: () =>
    api.get<RecommendationsResponse>('/api/content/recommendations'),

  markComplete: (contentId: number) =>
    api.post<{ success: boolean }>(`/api/content/${contentId}/complete`),

  /** Get topic suggestions for content library (from YouTube/Piped/Invidious, same source as videos) */
  getTopics: (max?: number) =>
    api.get<{ success: boolean; data: { topics: string[] } }>(`/api/content/topics${max ? `?max=${max}` : ''}`),

  /** Get course topics for the current user (from their roadmaps). Only these topics are allowed for video suggestions. */
  getCourseTopics: () =>
    api.get<{ success: boolean; data: { topics: string[] } }>('/api/content/course-topics'),

  /** Discover videos by topic. Topic must be one of your course topics; results are filtered and cached. */
  discoverByTopic: (topic: string, maxResults?: number) =>
    api.get<{
      success: boolean
      data: {
        topic: string
        videos: { id: string; title: string; thumbnail: string; duration: string; youtubeId: string; channelTitle?: string }[]
        fromCache?: boolean
        error?: string
      }
    }>(`/api/content/discover-by-topic?topic=${encodeURIComponent(topic)}${maxResults ? `&maxResults=${maxResults}` : ''}`),
}
