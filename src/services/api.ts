/**
 * API Service Layer
 * Handles all HTTP communication with the Flask backend.
 * Manages authentication tokens in localStorage.
 */

const API_BASE_URL = '/api';

// ── Token Management ──

export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const setUser = (user: unknown): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): Record<string, unknown> | null => {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};


// ── HTTP Client ──

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  errors?: string[];
  data?: T;
}

async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Attach JWT token if available
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    // Handle 401 — try refresh token
    if (response.status === 401 && getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryResponse = await fetch(url, { ...options, headers });
        return await retryResponse.json();
      } else {
        clearTokens();
      }
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getRefreshToken()}`,
      },
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success && data.data?.access_token) {
      localStorage.setItem('access_token', data.data.access_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}


// ── Auth API ──

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  user_type: string;
  batch: string;
  specialization: string;
}

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  role: string;
  profile_picture?: string | null;
}

export interface AuthData {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<AuthData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload) =>
    apiRequest<AuthData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verify: () =>
    apiRequest<{ user: AuthUser }>('/auth/verify', {
      method: 'GET',
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
};


// ── Users API ──

export const usersApi = {
  getProfile: () =>
    apiRequest('/users/me', { method: 'GET' }),

  updateProfile: (data: Record<string, unknown>) =>
    apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getUserById: (userId: string) =>
    apiRequest(`/users/${userId}`, { method: 'GET' }),
};


// ── Health API ──

export const healthApi = {
  check: () =>
    apiRequest('/health', { method: 'GET' }),
};

// ── Admin API ──
export const adminApi = {
  getStats: () => 
    apiRequest<{ stats: { total_users: number, interns: number, active_jobs: number, applications: number } }>('/admin/stats'),

  getAllUsers: () => 
    apiRequest<{ users: any[] }>('/admin/users'),

  getUserById: (userId: string) => 
    apiRequest<{ user: any }>(`/admin/users/${userId}`),

  createUser: (data: any) => 
    apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (userId: string, data: any) => 
    apiRequest(`/admin/users/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteUser: (userId: string) => 
    apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }),

  getInterns: () => 
    apiRequest<{ users: any[] }>('/admin/users?type=Intern'),

  addJob: (data: any) => 
    apiRequest('/admin/jobs', { method: 'POST', body: JSON.stringify(data) }),

  deleteJob: (jobId: string) => 
    apiRequest(`/admin/jobs/${jobId}`, { method: 'DELETE' }),

  getVisits: () => 
    apiRequest<{ visits: any[] }>('/admin/visits'),

  addVisit: (data: any) => 
    apiRequest('/admin/visits', { method: 'POST', body: JSON.stringify(data) }),

  deleteVisit: (visitId: string) => 
    apiRequest(`/admin/visits/${visitId}`, { method: 'DELETE' }),

  getApplications: () => 
    apiRequest<{ applications: any[] }>('/admin/applications'),

  getEvents: () =>
    apiRequest<{ events: any[] }>('/admin/events'),

  addEvent: (data: any) =>
    apiRequest('/admin/events', { method: 'POST', body: JSON.stringify(data) }),

  getPendingAssessments: () =>
    apiRequest<{ pending_assessments: any[] }>('/admin/assessments/pending'),

  reviewAssessment: (attemptId: string, data: { action: 'approve' | 'reject', stage: number, feedback?: string, score?: number }) =>
    apiRequest(`/admin/assessments/${attemptId}/review`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Courses API ──

export const coursesApi = {
  getAllCourses: () =>
    apiRequest('/courses', { method: 'GET' }),

  getCourseById: (courseId: string) =>
    apiRequest(`/courses/${courseId}`, { method: 'GET' }),

  enroll: (courseId: string) =>
    apiRequest(`/assessments/enroll/${courseId}`, { method: 'POST' }),

  getMyCourses: () =>
    apiRequest<{ courses: any[] }>('/assessments/my-courses', { method: 'GET' }),

  updateProgress: (courseId: string, progress: number) =>
    apiRequest('/assessments/update-progress', { 
      method: 'POST', 
      body: JSON.stringify({ course_id: courseId, progress }) 
    }),

  addCourse: (data: any) =>
    apiRequest('/admin/courses', { method: 'POST', body: JSON.stringify(data) }),

  updateCourse: (id: string, data: any) =>
    apiRequest(`/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteCourse: (id: string) =>
    apiRequest(`/admin/courses/${id}`, { method: 'DELETE' }),
};

// ── Assessments API ──

export const assessmentsApi = {
  getAssessmentStatus: (courseId: string) =>
    apiRequest<{ attempt: any }>(`/assessments/status/${courseId}`, { method: 'GET' }),

  submitStage: (courseId: string, stage: number, data: any) =>
    apiRequest(`/assessments/submit/${courseId}/${stage}`, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
};

// ── Jobs API ──

export const jobsApi = {
  getAllJobs: () =>
    apiRequest('/jobs', { method: 'GET' }),

  getJobById: (jobId: string) =>
    apiRequest(`/jobs/${jobId}`, { method: 'GET' }),
};

// ── Applications API ──

export const applicationsApi = {
  applyForJob: (data: { job_id: string; cover_letter?: string; resume_url?: string }) =>
    apiRequest('/applications', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),

  getMyApplications: () =>
    apiRequest<{ applications: any[] }>('/applications/me', { method: 'GET' }),

  withdrawApplication: (appId: string) =>
    apiRequest(`/applications/${appId}`, { method: 'DELETE' }),
};

// ── Events API ──

export const eventsApi = {
  getAllEvents: () =>
    apiRequest('/events', { method: 'GET' }),

  getEventById: (eventId: string) =>
    apiRequest(`/events/${eventId}`, { method: 'GET' }),

  registerForEvent: (eventId: string) =>
    apiRequest(`/events/${eventId}/register`, { method: 'POST' }),
};

// ── Networking API ──

export const networkingApi = {
  listAllUsers: (params?: { q?: string; batch?: string; spec?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/users?${query}`, { method: 'GET' });
  },
};

// ── Social API ──

export const socialApi = {
  getFeed: (page: number = 1, perPage: number = 20) =>
    apiRequest(`/social/feed?page=${page}&per_page=${perPage}&t=${Date.now()}`, { method: 'GET', cache: 'no-store' }),

  createPost: (data: { content: string; image_url?: string }) =>
    apiRequest('/social/posts', { method: 'POST', body: JSON.stringify(data) }),

  likePost: (postId: string) =>
    apiRequest(`/social/posts/${postId}/like`, { method: 'POST' }),

  addComment: (postId: string, text: string) =>
    apiRequest(`/social/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
};

// ── Notifications API ──

export const notificationsApi = {
  getNotifications: (page: number = 1, perPage: number = 30) =>
    apiRequest(`/notifications?page=${page}&per_page=${perPage}`, { method: 'GET' }),

  markAsRead: (notificationId: string) =>
    apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' }),

  markAllAsRead: () =>
    apiRequest('/notifications/read-all', { method: 'PATCH' }),

  deleteNotification: (notificationId: string) =>
    apiRequest(`/notifications/${notificationId}`, { method: 'DELETE' }),
};
