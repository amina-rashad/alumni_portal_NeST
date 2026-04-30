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
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (err) {
    console.error("Failed to save user to localStorage:", err);
  }
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
  console.log(`[API Request] ${options.method || 'GET'} ${endpoint}`, options.body ? '(with body)' : '');
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

    console.log(`[API Response] ${response.status} ${endpoint}`);
    const data: ApiResponse<T> = await response.json();
    console.log(`[API Data] ${endpoint}:`, data);

    // Handle 401 — try refresh token
    if (response.status === 401 && getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryResponse = await fetch(url, { ...options, headers });
        const retryData = await retryResponse.json();
        console.log(`[API Retry Data] ${endpoint}:`, retryData);
        return retryData;
      } else {
        const token = getAccessToken();
        if (token && token !== 'mock_token' && token !== 'social_mock_token') {
          clearTokens();
        }
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
  status?: string;
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

  sendOtp: (email: string) =>
    apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  loginWithOtp: (payload: { email: string; otp: string }) =>
    apiRequest<AuthData>('/auth/login-otp', {
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

  getPublicProfile: (userId: string) =>
    apiRequest<{ user: any }>(`/users/${userId}/public`, { method: 'GET' }),
};


// ── Health API ──

export const healthApi = {
  check: () =>
    apiRequest('/health', { method: 'GET' }),
};

// ── Admin API ──
export const adminApi = {
  getStats: () => 
    apiRequest<{ 
      stats: { 
        total_users: number, 
        interns: number, 
        active_jobs: number, 
        applications: number,
        total_managers: number,
        distribution: { [key: string]: number }
      } 
    }>('/admin/stats'),

  getAllUsers: () => 
    apiRequest<{ users: any[] }>('/admin/users'),

  createUser: (data: any) => 
    apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (userId: string, data: any) => 
    apiRequest(`/admin/users/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),

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

  addEvent: (data: any) =>
    apiRequest('/admin/events', { method: 'POST', body: JSON.stringify(data) }),

  getEvents: () =>
    apiRequest<{ events: any[] }>('/admin/events'),

  getPendingAssessments: () =>
    apiRequest('/admin/assessments/pending'),

  reviewAssessment: (id: string, data: any) =>
    apiRequest(`/admin/assessments/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),

  deleteUser: (userId: string) =>
    apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }),

  getUserById: (userId: string) =>
    apiRequest(`/admin/users/${userId}`, { method: 'GET' }),

  getManagers: () =>
    apiRequest<{ managers: any[] }>('/admin/managers'),
};

// ── Courses API ──

export const coursesApi = {
  getAllCourses: () =>
    apiRequest('/courses', { method: 'GET' }),

  getCourseById: (courseId: string) =>
    apiRequest(`/courses/${courseId}`, { method: 'GET' }),

  getMyCourses: () =>
    apiRequest('/assessments/my-courses', { method: 'GET' }),

  addCourse: (data: any) =>
    apiRequest('/admin/courses', { method: 'POST', body: JSON.stringify(data) }),

  updateCourse: (courseId: string, data: any) =>
    apiRequest(`/admin/courses/${courseId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteCourse: (courseId: string) =>
    apiRequest(`/admin/courses/${courseId}`, { method: 'DELETE' }),
};

// ── Jobs API ──

export const jobsApi = {
  getAllJobs: () =>
    apiRequest('/jobs', { method: 'GET' }),

  getJobById: (jobId: string) =>
    apiRequest(`/jobs/${jobId}`, { method: 'GET' }),
};

// ── Events API ──

export const eventsApi = {
  getAllEvents: () =>
    apiRequest('/events', { method: 'GET' }),

  getEventById: (eventId: string) =>
    apiRequest(`/events/${eventId}`, { method: 'GET' }),

  registerForEvent: (eventId: string) =>
    apiRequest(`/events/${eventId}/register`, { method: 'POST' }),

  getMyEvents: () =>
    apiRequest<{ events: any[] }>('/events/my-events', { method: 'GET' }),
};

// ── Event Manager API ──

export const eventManagerApi = {
  getStats: () =>
    apiRequest<{ stats: any, distribution: any[] }>('/events/manager/stats', { method: 'GET' }),
  
  getUpcomingEvents: () =>
    apiRequest<{ events: any[] }>('/events/manager/upcoming', { method: 'GET' }),

  createEvent: (data: any) =>
    apiRequest('/events/create', { method: 'POST', body: JSON.stringify(data) }),
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
    apiRequest<{ posts: any[]; total: number }>(`/social/feed?page=${page}&per_page=${perPage}&t=${Date.now()}`, { method: 'GET', cache: 'no-store' }),

  getMyPosts: () =>
    apiRequest<{ posts: any[] }>('/social/my-posts', { method: 'GET' }),

  createPost: (data: { content: string; image_url?: string }) =>
    apiRequest('/social/posts', { method: 'POST', body: JSON.stringify(data) }),

  likePost: (postId: string) =>
    apiRequest<{ liked: boolean }>(`/social/posts/${postId}/like`, { method: 'POST' }),

  addComment: (postId: string, text: string) =>
    apiRequest(`/social/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),

  deletePost: (postId: string) =>
    apiRequest(`/social/posts/${postId}`, { method: 'DELETE' }),
};

// ── Recruiter API ──

export const recruiterApi = {
  getApplications: () => 
    apiRequest<{ applications: any[] }>('/recruiter/applications'),

  getMyJobs: () => 
    apiRequest<{ jobs: any[] }>('/recruiter/jobs'),

  deleteJob: (jobId: string) => 
    apiRequest(`/recruiter/jobs/${jobId}`, { method: 'DELETE' }),

  addJob: (data: any) => 
    apiRequest('/recruiter/jobs', { method: 'POST', body: JSON.stringify(data) }),

  getStats: () => 
    apiRequest<{ stats: any }>('/recruiter/stats', { method: 'GET' }),

  getTalentFilters: () =>
    apiRequest<{ specializations: string[], courses: string[], skills: string[] }>('/recruiter/talent-filters'),

  searchTalents: (params: { skill?: string, course?: string, specialization?: string }) => {
    const query = new URLSearchParams();
    if (params.skill) query.append('skill', params.skill);
    if (params.course) query.append('course', params.course);
    if (params.specialization) query.append('specialization', params.specialization);
    return apiRequest<{ talents: any[] }>(`/recruiter/talents?${query.toString()}`);
  },

  sendBroadcastMail: (data: { recipients: string[], subject: string, body: string }) =>
    apiRequest('/recruiter/broadcast-mail', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
};

// ── Assessments API ──
export const assessmentsApi = {
  getQuizzes: () => apiRequest('/assessments/quizzes'),
  getAnalytics: () => apiRequest('/assessments/analytics'),
  getAssessmentStatus: (id: string) => apiRequest(`/assessments/${id}/status`),
  submitStage: (id: string, stage: number, payload: any) => 
    apiRequest(`/assessments/${id}/stage/${stage}`, { method: 'POST', body: JSON.stringify(payload) }),
};

// ── Notifications API ──
export const notificationsApi = {
  getNotifications: () => apiRequest<{ notifications: any[]; unread_count: number }>('/notifications'),
  markAsRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),
  deleteNotification: (id: string) => apiRequest(`/notifications/${id}`, { method: 'DELETE' }),
};

// ── Applications API ──
export const applicationsApi = {
  applyForJob: (data: any) =>
    apiRequest('/applications', { method: 'POST', body: JSON.stringify(data) }),
  
  getMyApplications: () =>
    apiRequest('/applications/me'),
};
