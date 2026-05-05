import axios from 'axios';

// --- CONFIG ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- HELPERS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAccessToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setTokens = (token: string, refresh?: string) => {
  localStorage.setItem('token', token);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

const clearTokens = () => {
  localStorage.removeItem('token');
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
  if (!stored || stored === 'undefined' || stored === '[object Object]') return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// ── HTTP Client ──
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Handle 401 — try refresh token
    if (response.status === 401 && getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryResponse = await fetch(fullUrl, { ...options, headers });
        return await retryResponse.json();
      } else {
        if (token && token !== 'mock_token' && token !== 'social_mock_token') {
          clearTokens();
        }
      }
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, message: 'Network error occurred' };
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
      localStorage.setItem('token', data.data.access_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// --- AUTH API ---
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

  logout: async () => {
    clearTokens();
    return { success: true };
  }
};

// --- USERS API ---
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
    
  attendance: {
    getStats: async () => {
      await delay(800);
      return { success: true, data: [] };
    }
  }
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

  getAttendees: () =>
    apiRequest<{ attendees: any[] }>('/events/manager/attendees', { method: 'GET' }),

  createEvent: (data: any) =>
    apiRequest('/events/create', { method: 'POST', body: JSON.stringify(data) }),
  
  updateEvent: (eventId: string, data: any) =>
    apiRequest(`/events/${eventId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  deleteEvent: (eventId: string) =>
    apiRequest(`/events/${eventId}`, { method: 'DELETE' }),

  toggleAttendance: (eventId: string, userId: string) =>
    apiRequest('/events/manager/attendees/toggle', { 
      method: 'POST', 
      body: JSON.stringify({ event_id: eventId, user_id: userId }) 
    }),

  issueCertificate: (eventId: string, userId: string) =>
    apiRequest('/events/manager/attendees/issue-certificate', { 
      method: 'POST', 
      body: JSON.stringify({ event_id: eventId, user_id: userId }) 
    }),

  getRecentCertificates: () =>
    apiRequest<{ certificates: any[] }>('/events/manager/recent-certificates', { method: 'GET' }),

  removeRegistration: (eventId: string, userId: string) =>
    apiRequest('/events/manager/attendees/remove', { 
      method: 'POST', 
      body: JSON.stringify({ event_id: eventId, user_id: userId }) 
    }),
};

// ── Networking API ──

export const networkingApi = {
  listAllUsers: (params?: { q?: string; batch?: string; spec?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/users?${query}`, { method: 'GET' });
  },
  getDirectory: async () => {
    return apiRequest('/networking/directory', { method: 'GET' });
  }
};

// --- COURSE MANAGER API ---
export const courseManagerAPI = {
  fetchCourses: async () => {
    return apiRequest('/admin/courses', { method: 'GET' });
  },
  createCourse: (data: any) => apiRequest('/admin/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: string | number, data: any) => apiRequest(`/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCourse: (id: string | number) => apiRequest(`/admin/courses/${id}`, { method: 'DELETE' }),
  fetchStudents: async () => {
    return apiRequest('/admin/users?type=Intern', { method: 'GET' });
  },
  fetchSubmissions: async () => {
    return apiRequest('/admin/assessments/pending', { method: 'GET' });
  },
  updateSubmissionStatus: (id: string, status: string) => apiRequest(`/admin/assessments/${id}/review`, { method: 'POST', body: JSON.stringify({ status }) })
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
  deleteAllNotifications: () => apiRequest('/notifications/all', { method: 'DELETE' }),
};

// ── Applications API ──
export const applicationsApi = {
  applyForJob: (data: any) =>
    apiRequest('/applications', { method: 'POST', body: JSON.stringify(data) }),
  
  getMyApplications: () =>
    apiRequest('/applications/me'),
};

// --- MOCK / HELPER APIS (To support legacy UI) ---
export const reminderAPI = {
  fetchAlerts: async () => ({ success: true, data: [] }),
  sendReminder: async (id: string) => ({ success: true })
};

export const forumAPI = {
  fetchDiscussions: async () => ({ success: true, data: [] }),
  resolveDiscussion: async (id: string) => ({ success: true }),
  deleteDiscussion: async (id: string) => ({ success: true }),
  postReply: async (id: string, text: string) => ({ success: true })
};

export const achievementAPI = {
  fetchAchievements: async () => ({ success: true, data: [] }),
  fetchIssuedHistory: async () => ({ success: true, data: [] })
};

export const recommendationAPI = {
  fetchRecommendations: async () => apiRequest('/recommendations', { method: 'GET' }),
  deleteRecommendation: (id: string) => apiRequest(`/recommendations/${id}`, { method: 'DELETE' })
};

export const insightsAPI = {
  fetchSummary: async () => apiRequest('/insights/summary', { method: 'GET' })
};

export const gamificationApi = {
  fetchRecommendedPathways: async () => ({ success: true, data: [] }),
  fetchMyQueries: async () => ({ success: true, data: [] })
};

// --- ADMIN API ---
export const adminApi = {
  getStats: () => 
    apiRequest<{ 
      stats: { 
        total_users: number, 
        interns: number, 
        active_jobs: number, 
        applications: number,
        total_managers: number,
        total_events: number,
        distribution: { [key: string]: number }
      } 
    }>('/admin/stats'),

  getActivity: () =>
    apiRequest<{ activities: any[] }>('/admin/activity'),

  getAllUsers: (params?: { type?: string }) => 
    apiRequest<{ users: any[] }>('/admin/users', { 
      method: 'GET',
      ...(params?.type ? { endpoint: `/admin/users?type=${params.type}` } : {}) // Note: apiRequest doesn't handle this well, let's fix
    }),

  getUsers: (params?: { type?: string }) => {
    const query = params?.type ? `?type=${params.type}` : '';
    return apiRequest<{ users: any[] }>(`/admin/users${query}`);
  },

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

  getAuditLogs: () =>
    apiRequest<{ logs: any[] }>('/admin/audit-logs'),
};

export const recruiterApi = {
  getApplications: () => 
    apiRequest<{ applications: any[] }>('/recruiter/applications'),

  updateApplicationStatus: (appId: string, data: { status: string, interviewDate?: string, notes?: string }) =>
    apiRequest(`/recruiter/applications/${appId}/status`, { 
        method: 'PATCH', 
        body: JSON.stringify(data) 
    }),

  getMyJobs: () => 
    apiRequest<{ jobs: any[] }>('/recruiter/jobs'),

  deleteJob: (jobId: string) => 
    apiRequest(`/recruiter/jobs/${jobId}`, { method: 'DELETE' }),

  addJob: (data: any) => 
    apiRequest('/recruiter/jobs', { method: 'POST', body: JSON.stringify(data) }),

  getStats: () => 
    apiRequest<{ stats: any }>('/recruiter/stats', { method: 'GET' }),

  getRecentApplications: () => 
    apiRequest<{ pipeline: any[] }>('/recruiter/applications/recent', { method: 'GET' }),

  getTalentFilters: () =>
    apiRequest<{ specializations: string[], courses: string[], skills: string[] }>('/recruiter/talent-filters'),

  searchTalents: (params: { skill?: string, course?: string, specialization?: string }) => {
    const query = new URLSearchParams();
    if (params.skill) query.append('skill', params.skill);
    if (params.course) query.append('course', params.course);
    if (params.specialization) query.append('specialization', params.specialization);
    return apiRequest<{ talents: any[] }>(`/recruiter/talents?${query.toString()}`);
  },

  broadcastMail: (data: { recipients: string[], subject: string, body: string }) =>
    apiRequest('/recruiter/broadcast-mail', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
  sendBroadcastMail: (data: { recipients: string[], subject: string, body: string }) =>
    apiRequest('/recruiter/broadcast-mail', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
};

export const logout = () => {
  clearTokens();
  window.location.href = '/login';
};

export const studentAPI = {
  fetchPersonalInsights: async () => ({ success: true, data: [] }),
  fetchRecommendedPathways: async () => ({ success: true, data: [] }),
  fetchMyQueries: async () => ({ success: true, data: [] })
};
