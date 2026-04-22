import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, GraduationCap, FileCheck, Search, Filter, Users, ChevronDown, Download, CheckCircle2, XCircle } from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminCertification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'iv' | 'intern' | 'alumni' | 'assessments'>('iv');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingAssessments, setPendingAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');

  // Hardcoded Data for static tabs
  const ivStudents = [
    { id: 1, name: 'Rahul Sharma', college: 'CET Trivandrum', course: 'B.Tech CS', batch: '2024-2026', date: '2024-03-15' },
    { id: 2, name: 'Anjali Desai', college: 'Model Engineering College', course: 'MCA', batch: '2024-2026', date: '2024-03-15' },
  ];

  const interns = [
    { id: 1, name: 'Arun Kumar', college: 'NSS College Palakkad', position: 'Frontend Developer Intern', duration: '3 Months' },
  ];

  const alumni = [
    { id: 1, name: 'Rohit Thomas', position: 'Software Engineer', joinDate: '2023-01-10', endDate: '2024-01-15' },
  ];

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingAssessments();
      if (res.success && res.data) {
        setPendingAssessments(res.data.pending_assessments);
      }
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'assessments') {
      fetchAssessments();
    }
  }, [activeTab]);

  const handleReview = async (attemptId: string, stage: number, action: 'approve' | 'reject') => {
    const feedback = prompt('Enter feedback (optional):') || '';
    try {
      const res = await adminApi.reviewAssessment(attemptId, {
        action,
        stage,
        feedback,
        score: action === 'approve' ? 100 : 0
      });
      if (res.success) {
        alert(res.message);
        fetchAssessments();
      }
    } catch (err) {
      console.error('Review failed:', err);
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Certification Management</h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Review student assessments and manage program certificates.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', background: '#fff', padding: '6px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {(['iv', 'intern', 'alumni', 'assessments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '12px', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
              backgroundColor: activeTab === tab ? '#1e293b' : 'transparent',
              color: activeTab === tab ? '#fff' : '#64748b',
              transition: 'all 0.3s'
            }}
          >
            {tab === 'assessments' ? 'Assessments' : tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', minHeight: '400px', padding: '24px' }}>
        {activeTab === 'assessments' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>Student</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>Course</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>Stage</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>Submission</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAssessments.length > 0 ? pendingAssessments.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontWeight: 700 }}>{a.user_name}</td>
                    <td style={{ padding: '16px' }}>{a.course_title}</td>
                    <td style={{ padding: '16px' }}><span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>Stage {a.stage}</span></td>
                    <td style={{ padding: '16px', fontSize: '12px', color: '#64748b', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {JSON.stringify(a.submission)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleReview(a.id, a.stage, 'reject')} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                        <button onClick={() => handleReview(a.id, a.stage, 'approve')} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No pending assessments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Static content for {activeTab.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCertification;
