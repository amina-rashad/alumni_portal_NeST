import type { StudentAttendanceSummary } from '../types/course-manager';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const attendanceService = {
  getAttendanceByCourse: async (courseName: string): Promise<StudentAttendanceSummary[]> => { 
    try {
      const res = await fetch(`${API_BASE}/course-manager/attendance/insights?course=${encodeURIComponent(courseName)}`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? data.data.logs : [];
    } catch { return []; }
  },

  updateStudentAttendance: async (studentId: string, status: 'Present' | 'Absent' | 'Late'): Promise<boolean> => { 
    // This could call an endpoint to record manual override
    return true; 
  },

  exportAttendanceReport: async (courseName: string): Promise<string> => {
    // Simulate a slight delay then return a mock filename
    await new Promise(r => setTimeout(r, 1500));
    return `Attendance_Report_${courseName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  }
};
