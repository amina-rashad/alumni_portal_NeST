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
          user_type: role === 'course_manager' ? 'Staff' : 'Alumni',
          profile_picture: 'https://i.pravatar.cc/150?u=' + payload.email
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
  },
  attendance: {
    getStats: async () => {
      await delay(800);
      return { success: true, data: [] };
    }
  }
};

export const reminderAPI = {
  fetchAlerts: async () => {
    await delay(1000);
    return {
      success: true,
      data: [
        {
          id: '1',
          studentName: 'Amina Rashad',
          studentEmail: 'amina.r@nestdigital.com',
          type: 'Low Attendance',
          details: 'Current attendance is 64%. Requires immediate attention to meet the 75% threshold.',
          severity: 'High',
          status: 'Pending'
        },
        {
          id: '2',
          studentName: 'Melbin Mani',
          studentEmail: 'melbin.m@nestdigital.com',
          type: 'Upcoming Assessment',
          details: 'Full Stack Development Quiz scheduled for tomorrow at 10:00 AM.',
          severity: 'Medium',
          status: 'Pending'
        },
        {
          id: '3',
          studentName: 'Rahul Kumar',
          studentEmail: 'rahul.k@nestdigital.com',
          type: 'Inactive Student',
          details: 'No login activity detected since April 15, 2024 (13 days ago).',
          severity: 'High',
          status: 'Pending'
        },
        {
          id: '4',
          studentName: 'Sneha Joseph',
          studentEmail: 'sneha.j@nestdigital.com',
          type: 'Pending Completion',
          details: 'Course "Advanced React Patterns" is 92% complete. 2 assessments pending.',
          severity: 'Low',
          status: 'Pending'
        }
      ]
    };
  },
  sendReminder: async (alertId: string) => {
    await delay(1500);
    return { success: true, message: 'Reminder sent successfully' };
  }
};

export const forumAPI = {
  fetchDiscussions: async () => {
    await delay(1000);
    return {
      success: true,
      data: [
        {
          id: '1',
          courseName: 'Advanced Full-Stack Architecture',
          studentName: 'Alex Johnson',
          title: 'Difficulty with Microservices orchestration',
          content: 'I am struggling with setting up the Kubernetes cluster for the final module. The YAML configurations seem to have issues with the ingress controller.',
          status: 'Unresolved',
          createdAt: '2 hours ago',
          repliesCount: 0
        },
        {
          id: '2',
          courseName: 'UX Design Fundamentals',
          studentName: 'Maria Garcia',
          title: 'Figma Auto-layout issue',
          content: 'When I use auto-layout on my navigation bar, the icons are overlapping instead of stacking. Is there a specific setting for this?',
          status: 'Unresolved',
          createdAt: '5 hours ago',
          repliesCount: 2
        },
        {
          id: '3',
          courseName: 'Cloud Infrastructure with AWS',
          studentName: 'David Chen',
          title: 'IAM Policy permissions for S3',
          content: 'Thank you for the explanation on IAM. It helped me resolve the bucket access issue.',
          status: 'Resolved',
          createdAt: '1 day ago',
          repliesCount: 1
        }
      ]
    };
  },
  resolveDiscussion: async (id: string) => {
    await delay(800);
    return { success: true };
  },
  deleteDiscussion: async (id: string) => {
    await delay(800);
    return { success: true };
  },
  postReply: async (id: string, text: string) => {
    await delay(1500);
    return { success: true };
  }
};

export const achievementAPI = {
  fetchAchievements: async () => {
    await delay(1000);
    return {
      success: true,
      data: [
        { id: '1', name: 'Early Bird', type: 'Badge', trigger: 'First Enrollment', rewardValue: 'BADGE_SILVER', status: 'Active', createdAt: '2024-04-10' },
        { id: '2', name: 'Quiz Master', type: 'XP', trigger: '100% Quiz Score', rewardValue: '500 XP', status: 'Active', createdAt: '2024-04-12' },
        { id: '3', name: 'Course finisher', type: 'Celebration', trigger: 'Course Completion', rewardValue: 'POPUP_CELEB', status: 'Draft', createdAt: '2024-04-15' },
      ]
    };
  },
  fetchIssuedHistory: async () => {
    await delay(800);
    return {
      success: true,
      data: [
        { id: 'h1', studentName: 'Alex Johnson', achievementName: 'Early Bird', rewardType: 'Badge', issuedAt: '2 hours ago' },
        { id: 'h2', studentName: 'Maria Garcia', achievementName: 'Quiz Master', rewardType: 'XP', issuedAt: '5 hours ago' },
        { id: 'h3', studentName: 'David Chen', achievementName: 'Early Bird', rewardType: 'Badge', issuedAt: '1 day ago' },
      ]
    };
  }
};

export const recommendationAPI = {
  fetchRecommendations: async () => {
    await delay(1000);
    return {
      success: true,
      data: [
        {
          id: '1',
          sourceCourseId: 'c1',
          sourceCourseName: 'Full Stack Development',
          targetCourseId: 'c2',
          targetCourseName: 'Advanced Full-Stack Architecture',
          conversionRate: '24%',
          enrolledStudents: 156
        },
        {
          id: '2',
          sourceCourseId: 'c3',
          sourceCourseName: 'UX Design Fundamentals',
          targetCourseId: 'c4',
          targetCourseName: 'Advanced UI Design & Prototyping',
          conversionRate: '18%',
          enrolledStudents: 84
        }
      ]
    };
  },
  deleteRecommendation: async (id: string) => {
    await delay(800);
    return { success: true };
  }
};

export const insightsAPI = {
  fetchSummary: async () => {
    await delay(1000);
    return {
      success: true,
      data: {
        dailyActiveUsers: [45, 52, 48, 61, 55, 67, 72],
        completionRates: [
          { course: 'Full Stack Dev', percentage: 78 },
          { course: 'Cloud Arch', percentage: 42 },
          { course: 'UX Design', percentage: 91 },
          { course: 'Data Science', percentage: 56 }
        ],
        streaks: [
          { student: 'Alex Johnson', days: 12, trend: 'up' },
          { student: 'Maria Garcia', days: 8, trend: 'up' },
          { student: 'David Chen', days: 7, trend: 'stable' },
          { student: 'Sneha Joseph', days: 5, trend: 'up' }
        ],
        inactiveLearners: [
          { name: 'John Doe', lastActive: '5 days ago', risk: 'High' },
          { name: 'Sarah Smith', lastActive: '3 days ago', risk: 'Medium' }
        ]
      }
    };
  }
};

export const studentAPI = {
  fetchPersonalInsights: async () => {
    await delay(800);
    return {
      success: true,
      data: {
        streak: 7,
        xp: 1250,
        badges: [
          { id: 'b1', name: 'Early Bird', icon: 'Award', color: '#fbbf24' },
          { id: 'b2', name: 'Quiz Master', icon: 'Zap', color: '#3b82f6' }
        ],
        nextMilestone: 'Elite Developer (1500 XP)'
      }
    };
  },
  fetchRecommendedPathways: async () => {
    await delay(1000);
    return {
      success: true,
      data: [
        { id: 'p1', title: 'Full Stack Master', source: 'React Basics', target: 'Advanced React Architecture', reason: 'Based on your 98% Quiz Score' },
        { id: 'p2', title: 'Cloud Specialist', source: 'Intro to AWS', target: 'Serverless Excellence', reason: 'High Industry Demand' }
      ]
    };
  },
  fetchMyQueries: async () => {
    await delay(800);
    return {
      success: true,
      data: [
        { id: 'q1', title: 'State management issue in Module 4', status: 'Resolved', replies: 1 },
        { id: 'q2', title: 'How to deploy to Netlify?', status: 'Unresolved', replies: 0 }
      ]
    };
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
  profile_picture?: string;
};

export default api;
