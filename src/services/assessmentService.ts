const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const assessmentService = {
  // Student side (Stage submission)
  getAssessmentStatus: async (courseId: string) => {
    try {
      const res = await fetch(`${API_BASE}/assessments/status/${courseId}`, { headers: getHeaders() });
      return await res.json();
    } catch { return { success: false }; }
  },

  submitStage: async (courseId: string, stage: number, data: any) => {
    try {
      const res = await fetch(`${API_BASE}/assessments/submit/${courseId}/${stage}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch { return { success: false, message: 'Submission failed' }; }
  },

  // Admin/Manager side (Reviewing)
  getAllSubmissions: async () => {
    try {
      const res = await fetch(`${API_BASE}/course-manager/assessments/pending`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        return data.data.pending_assessments.map((s: any) => {
          const isUrl = s.submission?.startsWith('http');
          const isGithub = s.submission?.includes('github.com');
          const isVideo = s.submission?.includes('vimeo') || s.submission?.includes('youtube');

          return {
            id: s.id,
            studentName: s.studentName,
            studentEmail: s.studentEmail,
            course: s.courseName, // Map courseName to course
            assessmentType: s.assessmentType || 'Portfolio Validation',
            submittedAt: s.submittedAt ? new Date(s.submittedAt).toLocaleString() : 'Recently',
            status: 'Pending',
            stage: s.stage,
            content: {
              type: isGithub ? 'github' : isVideo ? 'video' : isUrl ? 'link' : 'text',
              url: isUrl ? s.submission : undefined,
              text: !isUrl ? s.submission : undefined,
            }
          };
        });
      }
      return [];
    } catch { return []; }
  },

  getPendingSubmissions: async () => {
    return assessmentService.getAllSubmissions();
  },

  updateSubmissionStatus: async (attemptId: string, action: 'Approved' | 'Rejected', stage: number = 1) => {
    try {
      const res = await fetch(`${API_BASE}/course-manager/assessments/${attemptId}/review`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ 
          action: action, 
          stage: stage, 
          feedback: action === 'Approved' ? 'Excellent work.' : 'Please revise and resubmit.',
          score: 100 
        })
      });
      return await res.json();
    } catch { return { success: false, message: 'Update failed' }; }
  },

  reviewSubmission: async (attemptId: string, stage: number, action: 'approve' | 'reject', feedback: string, score: number = 0) => {
    try {
      const res = await fetch(`${API_BASE}/admin/assessments/${attemptId}/review`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ action, stage: String(stage), feedback, score })
      });
      return await res.json();
    } catch { return { success: false, message: 'Review failed' }; }
  },

  getAllAssessments: async () => {
    // This could call a real endpoint if we add it to course-manager routes
    return [];
  },

  createAssessment: async (data: any) => {
    // This could call a real endpoint if needed
    return { success: true };
  }
};
