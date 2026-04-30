import type { CertificateRecord } from '../types/course-manager';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const certificateService = {
  getAllCertificates: async (): Promise<CertificateRecord[]> => {
    try {
      const res = await fetch(`${API_BASE}/course-manager/certificates`, { headers: getHeaders() });
      const data = await res.json();
      return data.success ? data.data.certificates : [];
    } catch { return []; }
  },

  updateCertificateStatus: async (enrollmentId: string, status: 'Generated' | 'Sent'): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/course-manager/certificates/${enrollmentId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      return data.success;
    } catch { return false; }
  }
};

export default certificateService;
