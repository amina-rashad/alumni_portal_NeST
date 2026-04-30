const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface DashboardStats {
  totalCourses: number;
  totalEnrollments: number;
  pendingReviews: number;
  certificatesIssued: number;
  engagementRate: number;
  activeToday: number;
  pendingAlerts: number;
}

export const dashboardService = {
  getDashboardKPIs: async (): Promise<DashboardStats> => {
    try {
      const res = await fetch(`${API_BASE}/course-manager/stats`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        const stats = data.data.stats;
        return {
          totalCourses: stats.total_courses || 0,
          totalEnrollments: stats.active_enrollments || 0,
          pendingReviews: stats.pending_reviews || 0,
          certificatesIssued: stats.certificates_issued || 0,
          engagementRate: parseInt(stats.avg_completion) || 0,
          activeToday: 42, // Still placeholder for now
          pendingAlerts: stats.at_risk_learners || 0
        };
      }
      throw new Error('Failed to fetch stats');
    } catch {
      // Fallback data
      return {
        totalCourses: 12,
        totalEnrollments: 1284,
        pendingReviews: 8,
        certificatesIssued: 142,
        engagementRate: 74,
        activeToday: 42,
        pendingAlerts: 5
      };
    }
  }
};
