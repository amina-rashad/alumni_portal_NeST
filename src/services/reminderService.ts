/* Reminder Service - Course Manager */
import type { AcademicAlert } from '../types/course-manager';

export const reminderService = {
  getAlerts: async (): Promise<AcademicAlert[]> => { 
    return []; 
  },
  sendReminder: async (id: string): Promise<boolean> => { 
    return true; 
  },
  createAlert: async (alert: Partial<AcademicAlert>): Promise<boolean> => { 
    return true; 
  },
};
