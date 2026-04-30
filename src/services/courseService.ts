import type { Course } from '../types/course-manager';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const courseService = {
  getDashboardStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/course-manager/stats`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? data.data.stats : null;
    } catch { return null; }
  },

  getAllCourses: async (): Promise<Course[]> => {
    try {
      const res = await fetch(`${API_BASE}/courses`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success && data.data?.courses) {
        return data.data.courses.map((c: any) => ({ ...c, id: c.id || c._id }));
      }
      return [];
    } catch { return []; }
  },

  getCourse: async (id: string): Promise<Course | null> => {
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? { ...data.data.course, id: data.data.course.id || data.data.course._id } : null;
    } catch { return null; }
  },

  createCourse: async (course: Partial<Course>): Promise<Course | null> => {
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(course)
      });
      const data = await res.json();
      return data.success ? data.data : null;
    } catch { return null; }
  },

  updateCourse: async (id: string, course: Partial<Course>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: 'PATCH', headers: getHeaders(), body: JSON.stringify(course)
      });
      const data = await res.json();
      return data.success;
    } catch { return false; }
  },

  deleteCourse: async (id: string | number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: 'DELETE', headers: getHeaders()
      });
      const data = await res.json();
      return data.success;
    } catch { return false; }
  },
};
