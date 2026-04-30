import axios from 'axios';

// --- CONFIG ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- HELPERS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAccessToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// --- CORE API REQUEST HANDLER ---
async function apiRequest<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
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
        // Retry the original request with new token
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
    
  attendance: {
    getStats: async () => {
      await delay(800);
      return { success: true, data: [] };
    }
  }
};

// --- ADMIN API ---
export const adminApi = {
  getStats: () => 
    apiRequest('/admin/stats'),

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
};

// --- COURSE MANAGER API ---
export const courseManagerAPI = {
  fetchCourses: async () => {
    await delay(800);
    return {
      success: true,
      data: [
        { id: 1, title: 'Advanced Full-Stack Architecture', level: 'Advanced', duration: '12 Weeks', students: 156, status: 'Active' },
        { id: 2, title: 'Cloud Infrastructure with AWS', level: 'Intermediate', duration: '8 Weeks', students: 84, status: 'Active' },
        { id: 3, title: 'UX Design Fundamentals', level: 'Beginner', duration: '6 Weeks', students: 210, status: 'Draft' },
      ]
    };
  },
  createCourse: (data: any) => apiRequest('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: number, data: any) => apiRequest(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCourse: (id: number) => apiRequest(`/courses/${id}`, { method: 'DELETE' }),
  fetchStudents: async () => {
    await delay(1000);
    return {
      success: true,
      data: [
        { id: 'STU-001', name: 'Alex Johnson', email: 'alex.j@example.com', course: 'Advanced Full-Stack Architecture', progress: 45, status: 'Learning', lastActive: '2 hours ago' },
        { id: 'STU-002', name: 'Maria Garcia', email: 'm.garcia@example.com', course: 'Cloud Infrastructure with AWS', progress: 85, status: 'Assessment', lastActive: '1 day ago' },
      ]
    };
  },
  fetchSubmissions: async () => {
    await delay(1000);
    return { success: true, data: [] };
  },
  updateSubmissionStatus: (id: string, status: string) => apiRequest(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
};

// --- COURSES API ---
export const coursesApi = {
  getAllCourses: async () => {
    await delay(800);
    return {
      success: true,
      data: {
        courses: [
          { id: '1', title: 'Advanced Cloud Architecture & DevOps', instructor: 'Dr. Rajesh Nair', level: 'Advanced', duration: '36 Hours', description: 'Master the complexities of modern cloud infrastructure.' },
          { id: '2', title: 'Full Stack Development with React & Node', instructor: 'Priya Sharma', level: 'Intermediate', duration: '48 Hours', description: 'Build enterprise-grade web applications.' },
          { id: '3', title: 'Data Science & Machine Learning Essentials', instructor: 'Dr. Arun Menon', level: 'Beginner', duration: '30 Hours', description: 'Unlock the power of data.' },
          { id: '4', title: 'Cybersecurity Fundamentals & Ethical Hacking', instructor: 'Karthik Iyer', level: 'Intermediate', duration: '42 Hours', description: 'Protect digital assets.' }
        ]
      }
    };
  },
  getCourseById: async (id: string) => {
    await delay(500);
    return {
      success: true,
      data: { 
        course: { id, title: 'Course Details', instructor: 'Expert', level: 'Advanced', duration: '24 Hours' } 
      }
    };
  }
};

// --- OTHER MOCK APIS ---
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
  fetchRecommendations: async () => ({ success: true, data: [] }),
  deleteRecommendation: async (id: string) => ({ success: true })
};

export const insightsAPI = {
  fetchSummary: async () => ({ success: true, data: { dailyActiveUsers: [], completionRates: [], streaks: [], inactiveLearners: [] } })
};

export const gamificationApi = {
  fetchRecommendedPathways: async () => ({ success: true, data: [] }),
  fetchMyQueries: async () => ({ success: true, data: [] })
};

export const recruiterApi = {
  getApplications: () => apiRequest('/recruiter/applications'),
  getMyJobs: () => apiRequest('/recruiter/jobs'),
  deleteJob: (jobId: string) => apiRequest(`/recruiter/jobs/${jobId}`, { method: 'DELETE' }),
  addJob: (data: any) => apiRequest('/recruiter/jobs', { method: 'POST', body: JSON.stringify(data) }),
  getStats: () => apiRequest('/recruiter/stats'),
};

export const jobsApi = { 
  getAll: async () => ({ success: true, data: { jobs: [] } }),
  getAllJobs: async () => ({ success: true, data: { jobs: [] } })
};
export const eventsApi = { 
  getAll: async () => ({ success: true, data: { events: [] } }),
  getAllEvents: async () => ({ success: true, data: { events: [] } }),
  registerForEvent: async (id: string) => ({ success: true, message: 'Registered successfully' })
};
export const socialApi = { getFeed: async () => ({ success: true, data: [] }) };
export const networkingApi = { 
  getDirectory: async () => ({ success: true, data: [] }),
  listAllUsers: async (params?: any) => {
    // If we had a real backend, we'd use apiRequest
    // return apiRequest('/networking/users', { params });
    await delay(300);
    return { success: true, data: { users: [] } };
  }
};

export const studentAPI = {
  fetchPersonalInsights: async () => ({ success: true, data: {} }),
  fetchRecommendedPathways: async () => ({ success: true, data: [] }),
  fetchMyQueries: async () => ({ success: true, data: [] })
};

// --- HELPERS ---
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const setUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined' || user === '[object Object]') return null;
    return JSON.parse(user);
  } catch (err) {
    console.error("Failed to parse user from localStorage", err);
    localStorage.removeItem('user');
    return null;
  }
};


export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
