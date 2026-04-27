import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for attaching auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- COURSE MANAGER API ---
export const courseManagerAPI = {
  fetchCourses: async () => {
    await delay(800);
    return {
      data: [
        { id: 1, title: 'Advanced Full-Stack Architecture', level: 'Advanced', duration: '12 Weeks', students: 156, status: 'Active' },
        { id: 2, title: 'Cloud Infrastructure with AWS', level: 'Intermediate', duration: '8 Weeks', students: 84, status: 'Active' },
        { id: 3, title: 'UX Design Fundamentals', level: 'Beginner', duration: '6 Weeks', students: 210, status: 'Draft' },
      ]
    };
  },
  createCourse: async (courseData: any) => {
    await delay(1500);
    return { data: { message: 'Course created successfully', id: Math.random() } };
  },
  updateCourse: async (id: number, data: any) => {
    await delay(500);
    return { data: { message: 'Course updated' } };
  },
  deleteCourse: async (id: number) => {
    await delay(500);
    return { data: { message: 'Course deleted' } };
  },
  fetchStudents: async () => {
    await delay(1000);
    return {
      data: [
        { id: 'STU-001', name: 'Alex Johnson', email: 'alex.j@example.com', course: 'Advanced Full-Stack Architecture', progress: 45, status: 'Learning', lastActive: '2 hours ago' },
        { id: 'STU-002', name: 'Maria Garcia', email: 'm.garcia@example.com', course: 'Cloud Infrastructure with AWS', progress: 85, status: 'Assessment', lastActive: '1 day ago' },
        { id: 'STU-003', name: 'David Chen', email: 'd.chen@example.com', course: 'UX Design Fundamentals', progress: 100, status: 'Completed', lastActive: '3 days ago' },
      ]
    };
  },
  fetchSubmissions: async () => {
    await delay(1000);
    return {
      data: [
        { id: 'sub-001', studentName: 'Alex Johnson', course: 'Advanced Full-Stack Architecture', assessmentType: 'Project', submittedAt: '2 hours ago', content: { type: 'github', url: 'https://github.com/alexj/microservices-final' }, status: 'Pending' },
        { id: 'sub-002', studentName: 'Maria Garcia', course: 'UX Design Fundamentals', assessmentType: 'Video Demo', submittedAt: '5 hours ago', content: { type: 'video', url: 'https://loom.com/share/123456789' }, status: 'Pending' },
      ]
    };
  },
  updateSubmissionStatus: async (id: string, status: 'Approved' | 'Rejected') => {
    await delay(800);
    return { data: { message: 'Status updated successfully' } };
  }
};

// --- AUTH & USER API ---
export const authApi = {
  sendOtp: async (email: string) => {
    await delay(500);
    return { success: true, message: 'OTP sent' };
  },
  loginWithOtp: async (payload: any) => {
    await delay(800);
    let role = 'user';
    if (payload.email.toLowerCase().includes('manager')) role = 'course_manager';
    if (payload.email.toLowerCase().includes('admin')) role = 'course_manager';
    if (payload.email.toLowerCase().includes('owner')) role = 'admin';

    return { 
      success: true, 
      data: { 
        access_token: 'mock_access', 
        refresh_token: 'mock_refresh', 
        user: { 
          full_name: payload.email.split('@')[0], 
          email: payload.email, 
          role,
          user_type: role === 'course_manager' ? 'Staff' : 'Alumni'
        } 
      } 
    };
  },
  logout: async () => {
    localStorage.clear();
    return { success: true };
  }
};

export const usersApi = {
  getProfile: async () => {
    await delay(500);
    return { success: true, data: { user: JSON.parse(localStorage.getItem('user') || '{}') } };
  },
  updateProfile: async (data: any) => {
    await delay(800);
    return { success: true, data: { user: data } };
  }
};

// --- GENERAL MOCK APIS ---
export const coursesApi = {
  getAllCourses: async () => {
    await delay(800);
    return {
      success: true,
      data: {
        courses: [
          {
            id: '1',
            title: 'Advanced Cloud Architecture & DevOps',
            instructor: 'Dr. Rajesh Nair',
            level: 'Advanced',
            duration: '36 Hours',
            description: 'Master the complexities of modern cloud infrastructure and automated delivery pipelines with NeST digital experts.'
          },
          {
            id: '2',
            title: 'Full Stack Development with React & Node',
            instructor: 'Priya Sharma',
            level: 'Intermediate',
            duration: '48 Hours',
            description: 'Build enterprise-grade web applications from scratch using the most popular JavaScript ecosystem.'
          },
          {
            id: '3',
            title: 'Data Science & Machine Learning Essentials',
            instructor: 'Dr. Arun Menon',
            level: 'Beginner',
            duration: '30 Hours',
            description: 'Unlock the power of data through statistical modeling and modern machine learning algorithms.'
          },
          {
            id: '4',
            title: 'Cybersecurity Fundamentals & Ethical Hacking',
            instructor: 'Karthik Iyer',
            level: 'Intermediate',
            duration: '42 Hours',
            description: 'Protect digital assets and learn how to secure modern network architectures against evolving threats.'
          }
        ]
      }
    };
  },
  getCourseById: async (id: string) => {
    await delay(500);
    const courses = [
      { id: '1', title: 'Advanced Cloud Architecture & DevOps', instructor: 'Dr. Rajesh Nair', level: 'Advanced', duration: '36 Hours' },
      { id: '2', title: 'Full Stack Development with React & Node', instructor: 'Priya Sharma', level: 'Intermediate', duration: '48 Hours' },
      { id: '3', title: 'Data Science & Machine Learning Essentials', instructor: 'Dr. Arun Menon', level: 'Beginner', duration: '30 Hours' },
      { id: '4', title: 'Cybersecurity Fundamentals & Ethical Hacking', instructor: 'Karthik Iyer', level: 'Intermediate', duration: '42 Hours' },
    ];
    const course = courses.find(c => c.id === id) || courses[0];
    return {
      success: true,
      data: { course }
    };
  }
};
export const jobsApi = { getAll: async () => ({ data: [] }) };
export const eventsApi = { getAll: async () => ({ data: [] }) };
export const socialApi = { getFeed: async () => ({ data: [] }) };
export const networkingApi = { getDirectory: async () => ({ data: [] }) };
export const adminApi = { getStats: async () => ({ data: {} }) };

// --- TOKEN HELPERS ---
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const setUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export type AuthUser = {
  full_name: string;
  email: string;
  role: string;
  user_type?: string;
};

export default api;
