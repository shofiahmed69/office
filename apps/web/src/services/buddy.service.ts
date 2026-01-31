import { api } from './api';

export interface StudyBuddy {
  id: number;
  partnershipId: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  subjects: string[];
  status: 'active' | 'pending' | 'inactive';
  connectedSince?: string;
}

export interface BuddyMatch {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  matchScore: number;
  matchReason: string;
  commonSubjects: string[];
  commonAvailability: string[];
}

export interface BuddyAssignment {
  id: number;
  assignedByUserId: number;
  assignedToUserId: number;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

interface FindMatchResponse {
  success: boolean;
  data: BuddyMatch[];
}

interface BuddiesResponse {
  success: boolean;
  data: StudyBuddy[];
}

interface RequestResponse {
  success: boolean;
  data: {
    requestId: number;
    status: string;
  };
}

interface AssignmentsResponse {
  success: boolean;
  data: BuddyAssignment[];
}

export const buddyService = {
  findMatches: (subjects?: string[]) => {
    const params = subjects?.length ? `?subjects=${subjects.join(',')}` : '';
    return api.get<FindMatchResponse>(`/api/study-buddy/find-match${params}`);
  },

  sendRequest: (toUserId: number, message?: string) =>
    api.post<RequestResponse>('/api/study-buddy/request', { toUserId, message }),

  acceptRequest: (requestId: number) =>
    api.post<{ success: boolean }>(`/api/study-buddy/request/${requestId}/accept`),

  rejectRequest: (requestId: number) =>
    api.post<{ success: boolean }>(`/api/study-buddy/request/${requestId}/reject`),

  getMyBuddies: () =>
    api.get<BuddiesResponse>('/api/study-buddy/my-buddies'),

  getPendingRequests: () =>
    api.get<{ success: boolean; data: any[] }>('/api/study-buddy/requests/pending'),

  removeBuddy: (partnershipId: number) =>
    api.delete<{ success: boolean }>(`/api/study-buddy/${partnershipId}`),

  // Assignments
  getAssignments: () =>
    api.get<AssignmentsResponse>('/api/study-buddy/assignments'),

  createAssignment: (data: Omit<BuddyAssignment, 'id' | 'assignedByUserId' | 'createdAt'>) =>
    api.post<{ success: boolean; data: BuddyAssignment }>('/api/study-buddy/assignments', data),

  updateAssignmentStatus: (assignmentId: number, status: BuddyAssignment['status']) =>
    api.patch<{ success: boolean }>(`/api/study-buddy/assignments/${assignmentId}`, { status }),
};
