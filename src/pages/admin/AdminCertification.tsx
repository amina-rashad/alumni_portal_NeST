import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, GraduationCap, FileCheck, Search, Filter, Users, ChevronDown, Download, CheckCircle2, XCircle, Award } from 'lucide-react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

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

  const [ivStudents, setIvStudents] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [alumni, setAlumni] = useState<any[]>([]);
  const [issuedCertificates, setIssuedCertificates] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'assessments') {
        const res = await adminApi.getPendingAssessments();
        if (res.success && res.data) {
          setPendingAssessments((res.data as any).pending_assessments);
        }
      } else if (activeTab === 'iv') {
        const [userRes, certRes] = await Promise.all([
          adminApi.getAllUsers({ type: 'Industrial Student' }),
          adminApi.getIssuedIVCertificates()
        ]);
        if (userRes.success) setIvStudents(userRes.data.users);
        if (certRes.success) setIssuedCertificates(certRes.data.certificates);
      } else if (activeTab === 'intern') {
        const res = await adminApi.getAllUsers({ type: 'Intern' });
        if (res.success) setInterns(res.data.users);
      } else if (activeTab === 'alumni') {
        const res = await adminApi.getAllUsers({ type: 'Alumni' });
        if (res.success) setAlumni(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleIssueIV = async (s: any) => {
    if (!s.email) {
      toast.error('Student email missing');
      return;
    }
    const student = {
      name: s.full_name,
      email: s.email,
      college: s.college || 'Saintgits College',
      batch: s.batch || '2024-2026',
      date: new Date().toISOString().split('T')[0]
    };
    
    try {
      const res = await adminApi.bulkIssueIVCertificates([student]);
      if (res.success) {
        alert(`Certificate issued to ${s.full_name}`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        fetchData();
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
        ) : activeTab === 'iv' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>Student Name</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>Institution</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>Batch</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>Cert Status</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ivStudents.length > 0 ? ivStudents.map((s) => {
                  const cert = issuedCertificates.find(c => c.email === s.email);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', fontWeight: 700, color: '#1e293b' }}>{s.full_name}</td>
                      <td style={{ padding: '16px', color: '#475569' }}>{s.college || 'N/A'}</td>
                      <td style={{ padding: '16px', color: '#475569' }}>{s.batch || 'N/A'}</td>
                      <td style={{ padding: '16px' }}>
                        {cert ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>
                            <CheckCircle2 size={14} /> Issued
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleIssueIV(s)}
                          style={{ background: cert ? '#f1f5f9' : '#1e293b', color: cert ? '#64748b' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FileCheck size={14} /> {cert ? 'Re-issue' : 'Issue Certificate'}
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No industrial students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'intern' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: 700 }}>Intern Name</th>
                  <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: 700 }}>Position</th>
                  <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: 700 }}>Department</th>
                  <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: 700 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {interns.length > 0 ? interns.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontWeight: 700, color: '#1e293b' }}>{s.full_name}</td>
                    <td style={{ padding: '16px', color: '#1e293b' }}>{s.position || 'Intern'}</td>
                    <td style={{ padding: '16px', color: '#1e293b' }}>{s.department || 'General'}</td>
                    <td style={{ padding: '16px' }}>
                      <button style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Generate Cert</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No interns found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'alumni' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: 700 }}>Alumni Name</th>
                  <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: 700 }}>Last Position</th>
                  <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: 700 }}>Relieving Date</th>
                  <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: 700 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {alumni.length > 0 ? alumni.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontWeight: 700, color: '#1e293b' }}>{s.full_name}</td>
                    <td style={{ padding: '16px', color: '#1e293b' }}>{s.position || 'Ex-Employee'}</td>
                    <td style={{ padding: '16px', color: '#1e293b' }}>{s.relieving_date || 'N/A'}</td>
                    <td style={{ padding: '16px' }}>
                      <button style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Generate Work Exp</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No alumni found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Unexpected state.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCertification;
