/* Recommendation Service - Course Manager */
import type { RecommendationRule } from '../types/course-manager';

export const recommendationService = {
  getRules: async (): Promise<RecommendationRule[]> => { return []; },
  saveRule: async (rule: Partial<RecommendationRule>): Promise<boolean> => { return true; },
  deleteRule: async (id: string): Promise<boolean> => { return true; },
};
