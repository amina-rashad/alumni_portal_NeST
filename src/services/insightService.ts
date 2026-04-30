/* Insight Service - Course Manager */
import type { InsightSummary } from '../types/course-manager';

export const insightService = {
  getSummary: async (): Promise<InsightSummary> => { 
    return {
      dailyActiveUsers: [30, 45, 38, 52, 48, 60, 75],
      streaks: [
        { student: "Rahul Sharma", days: 12 },
        { student: "Anjali Nair", days: 9 },
        { student: "Vivek K", days: 7 }
      ],
      completionRates: [
        { course: "Full Stack Development", percentage: 84 },
        { course: "UI/UX Design Masterclass", percentage: 62 },
        { course: "Advanced Python Pro", percentage: 45 }
      ],
      inactiveLearners: [
        { name: "Suresh Mani", lastActive: "3 days ago", risk: "High" },
        { name: "Priya Das", lastActive: "2 days ago", risk: "Medium" }
      ]
    }; 
  },
  getCourseInsight: async (courseId: string): Promise<InsightSummary | null> => { return null; },
};
