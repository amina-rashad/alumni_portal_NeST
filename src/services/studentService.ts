import type { StudentEnrollment } from '../types/course-manager';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const studentService = {
  getManagedStudents: async (): Promise<StudentEnrollment[]> => {
    try {
      const res = await fetch(`${API_BASE}/course-manager/students`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? data.data.students : [];
    } catch { return []; }
  },

  searchStudents: async (query: string): Promise<StudentEnrollment[]> => {
    const students = await studentService.getManagedStudents();
    return students.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) || 
      s.email.toLowerCase().includes(query.toLowerCase())
    );
  },

  updateEnrollmentStatus: async (enrollmentId: string, status: string): Promise<boolean> => {
    // This could call a PATCH endpoint if we add it
    return true;
  }
};
