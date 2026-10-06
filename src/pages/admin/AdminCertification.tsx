import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Search, RefreshCw, CheckCircle2, Clock,
  School, GraduationCap, BookOpen, Download, Eye, ChevronRight, X
} from 'lucide-react';
import { adminApi } from '../../services/api';
import UserAvatar from '../../components/UserAvatar';
import toast from 'react-hot-toast';
import { generateCourseCertificate, getIVCertificatePDF } from '../../utils/CertificateGenerator';

/* ──────────────────────────── Types ──────────────────────────── */
interface OverviewData {
  iv: any[];
  intern: any[];
  alumni: any[];
  course: any[];
  stats: {
    iv_total: number; iv_issued: number;
    intern_total: number; intern_issued: number;
    alumni_total: number; alumni_issued: number;
    course_total: number; course_issued: number;
  };
}

interface UnifiedCertificate {
  id: string; // enrollmentId or userId
  type: 'iv' | 'course';
  title: string;
  detail: string;
  status: string;
  issuedAt?: string | null;
  rawData: any;
}

interface GroupedUser {
  email: string;
  full_name: string;
  profile_picture?: string;
  userId?: string;
  college?: string;
  batch?: string;
  position?: string;
  userType?: string;
  certificates: UnifiedCertificate[];
}

const nestNavy = '#1a2652';
const nestRed  = '#c8102e';

/* ──────────────────────────── Main Component ──────────────────────────── */
const AdminCertification: React.FC = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes] = await Promise.all([
        adminApi.getCertificatesOverview(),
        adminApi.getAllUsers()
      ]);
      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data as any);
      }
      if (usersRes.success && usersRes.data) {
        setAllUsers(usersRes.data.users || []);
      }
    } catch (err) {
      toast.error('Failed to load certification data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Data Grouping ── */
  const groupedUsers = useMemo(() => {
    const groups: { [email: string]: GroupedUser } = {};

    (allUsers || []).forEach(u => {
      if (u.role === 'admin' || u.role === 'super_admin') return;

      const key = u.email.toLowerCase().trim();
      groups[key] = {
        email: key,
        full_name: u.full_name,
        profile_picture: u.profile_picture,
        userId: u.id,
        college: u.college,
        batch: u.batch,
        position: u.position,
        userType: u.user_type,
        certificates: []
      };
    });

    Object.values(groups).forEach(g => {
      // 1. IV
      if (g.userType === 'Industrial Student') {
        const ivItem = (overview?.iv || []).find(item => item.email.toLowerCase().trim() === g.email);
        if (ivItem) {
          g.certificates.push({
            id: ivItem.id,
            type: 'iv',
            title: 'Industrial Visit Certificate',
            detail: ivItem.college ? `College: ${ivItem.college}` : 'Industrial Visit Program',
            status: ivItem.cert_status,
            issuedAt: ivItem.issued_at,
            rawData: ivItem
          });
        } else {
          g.certificates.push({
            id: g.userId || '',
            type: 'iv',
            title: 'Industrial Visit Certificate',
            detail: g.college ? `College: ${g.college}` : 'Industrial Visit Program',
            status: 'Pending',
            issuedAt: null,
            rawData: null
          });
        }
      }

    });

    // 3. Course Completions from overview
    (overview?.course || []).forEach(item => {
      if (!item.email) return;
      const key = item.email.toLowerCase().trim();
      const g = groups[key];
      if (g) {
        if (!g.certificates.some(c => c.type === 'course' && c.id === item.id)) {
          g.certificates.push({
            id: item.id, // enrollment_id
            type: 'course',
            title: 'Course Completion Certificate',
            detail: `Course: ${item.course_name}`,
            status: item.cert_status,
            issuedAt: item.issued_at,
            rawData: item
          });
        }
      }
    });

    return Object.values(groups);
  }, [allUsers, overview]);

  /* ── Filtered Users ── */
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return groupedUsers;
    return groupedUsers.filter(u =>
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [groupedUsers, search]);

  /* ── Selected User Object ── */
  const selectedUser = useMemo(() => {
    if (!selectedUserEmail) return null;
    return groupedUsers.find(u => u.email === selectedUserEmail) || null;
  }, [groupedUsers, selectedUserEmail]);

  /* ── Actions ── */
  const handleIssueIV = async (userId: string, s: any) => {
    setActionLoading(`iv-${userId}`);
    try {
      const student = { name: s.full_name, email: s.email, college: s.college || 'N/A', batch: s.batch || 'N/A', date: new Date().toISOString().split('T')[0] };
      const res = await adminApi.bulkIssueIVCertificates([student]);
      if (res.success) {
        toast.success(`IV certificate issued to ${s.full_name}`);
        await fetchData();
      } else {
        toast.error(res.message || 'Failed to issue certificate');
      }
    } catch {
      toast.error('Error issuing certificate');
    } finally {
      setActionLoading(null);
    }
  };



  const handleGenerateCourse = async (enrollmentId: string, name: string, courseName: string) => {
    setActionLoading(`course-${enrollmentId}`);
    try {
      const res = await adminApi.generateCourseCertificate(enrollmentId);
      if (res.success) {
        toast.success(`Course certificate generated for ${name}`);
        await fetchData();
      } else {
        toast.error(res.message || 'Failed to generate certificate');
      }
    } catch {
      toast.error('Error generating certificate');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ paddingBottom: '48px', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ background: 'rgba(26,38,82,0.08)', padding: '10px', borderRadius: '14px', color: nestNavy }}>
              <Award size={22} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>Certification Management</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0, paddingLeft: '48px' }}>
            Track, generate and download credentials across all roles and programs.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Main Split-Screen Container */}
      <div style={{ display: 'flex', gap: '28px', minHeight: '640px', alignItems: 'stretch' }}>
        
        {/* Left Column: User Directory List */}
        <div style={{
          width: '380px',
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {/* Search bar wrapper */}
          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                style={{
                  width: '100%', padding: '11px 16px 11px 40px', border: '1px solid #e2e8f0', borderRadius: '12px',
                  outline: 'none', fontSize: '14px', fontWeight: 600, color: '#1e293b', background: '#f8fafc',
                  boxSizing: 'border-box'
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Directory list scrollarea */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>No users found.</span>
              </div>
            ) : (
              filteredUsers.map(user => {
                const isSelected = selectedUserEmail === user.email;
                const totalCerts = user.certificates.length;
                const pendingCount = user.certificates.filter(c => c.status !== 'Issued' && c.status !== 'Generated').length;
                const issuedCount = totalCerts - pendingCount;

                return (
                  <div
                    key={user.email}
                    onClick={() => setSelectedUserEmail(user.email)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
                      transition: 'all 0.2s',
                      marginBottom: '6px'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <UserAvatar src={user.profile_picture} name={user.full_name} size={36} bgColor={nestNavy} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? nestNavy : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.full_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '8px',
                        background: pendingCount > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                        color: pendingCount > 0 ? '#d97706' : '#16a34a'
                      }}>
                        {issuedCount}/{totalCerts}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Credentials View */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <AnimatePresence mode="wait">
            {!selectedUser ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: '#94a3b8', textAlign: 'center' }}
              >
                <div style={{ background: 'rgba(26, 38, 82, 0.04)', padding: '24px', borderRadius: '50%', color: nestNavy, marginBottom: '20px' }}>
                  <Award size={48} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>No User Selected</h3>
                <p style={{ fontSize: '14px', maxWidth: '360px', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  Select a user from the directory to review their credentials, view issued certificates, or generate pending ones.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedUser.email}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {/* Selected User Header */}
                <div style={{ padding: '28px', borderBottom: '1px solid #f1f5f9', background: '#fcfdfe', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <UserAvatar src={selectedUser.profile_picture} name={selectedUser.full_name} size={64} bgColor={nestNavy} />
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>{selectedUser.full_name}</h2>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontWeight: 500 }}>{selectedUser.email}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {selectedUser.college && (
                        <span style={{ fontSize: '11px', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px' }}>
                          🏫 {selectedUser.college}
                        </span>
                      )}
                      {selectedUser.position && (
                        <span style={{ fontSize: '11px', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: '6px' }}>
                          💼 {selectedUser.position}
                        </span>
                      )}
                      {selectedUser.batch && (
                        <span style={{ fontSize: '11px', fontWeight: 700, background: '#f7fee7', color: '#4d7c0f', padding: '3px 8px', borderRadius: '6px' }}>
                          🎓 Batch: {selectedUser.batch}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Certificates List Section */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>Credentials & Certificates</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedUser.certificates.map(cert => {
                      const isIssued = cert.status === 'Issued' || cert.status === 'Generated';
                      const isBusy = actionLoading === `${cert.type}-${cert.id}` || actionLoading === `course-${cert.id}`;

                      return (
                        <div
                          key={cert.type + '-' + cert.id}
                          style={{
                            padding: '20px',
                            background: '#fff',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '20px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                            <div style={{
                              background: isIssued ? 'rgba(22, 163, 74, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                              color: isIssued ? '#16a34a' : '#d97706',
                              padding: '12px',
                              borderRadius: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {cert.type === 'course' ? <BookOpen size={20} /> : <School size={20} />}
                            </div>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                                {cert.title}
                              </div>
                              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '6px' }}>
                                {cert.detail}
                              </div>
                              
                              {/* Status Badge */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  color: isIssued ? '#16a34a' : '#d97706',
                                }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isIssued ? '#16a34a' : '#d97706', display: 'inline-block' }} />
                                  {cert.status}
                                </span>
                                {isIssued && cert.issuedAt && (
                                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                                    • Issued on {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Certificate Actions */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {isIssued ? (
                              <>
                                <button
                                  onClick={() => {
                                    if (cert.type === 'iv') {
                                      const doc = getIVCertificatePDF(selectedUser.full_name, selectedUser.batch || '2024', cert.issuedAt || new Date().toISOString().split('T')[0]);
                                      window.open(doc.output('bloburl'), '_blank');
                                    } else if (cert.type === 'course') {
                                      generateCourseCertificate(
                                        selectedUser.full_name,
                                        cert.rawData.course_name,
                                        cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                      );
                                    }
                                  }}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '9px 16px', background: 'rgba(26, 38, 82, 0.05)', color: '#1a2652',
                                    border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(26, 38, 82, 0.1)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(26, 38, 82, 0.05)'}
                                >
                                  <Download size={14} /> PDF
                                </button>
                                
                                <button
                                  disabled={isBusy}
                                  onClick={() => {
                                    if (cert.type === 'iv') handleIssueIV(cert.id, selectedUser);
                                    else if (cert.type === 'course') handleGenerateCourse(cert.id, selectedUser.full_name, cert.rawData.course_name);
                                  }}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '9px 16px', background: '#fff', color: '#64748b',
                                    border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
                                    cursor: isBusy ? 'wait' : 'pointer', transition: 'all 0.2s', opacity: isBusy ? 0.7 : 1
                                  }}
                                >
                                  {isBusy ? (
                                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                  ) : (
                                    'Re-issue'
                                  )}
                                </button>
                              </>
                            ) : (
                              <button
                                disabled={isBusy}
                                onClick={() => {
                                  if (cert.type === 'iv') handleIssueIV(cert.id, selectedUser);
                                  else if (cert.type === 'course') handleGenerateCourse(cert.id, selectedUser.full_name, cert.rawData.course_name);
                                }}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                                  padding: '10px 18px', background: nestRed, color: '#fff',
                                  border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '13px',
                                  cursor: isBusy ? 'wait' : 'pointer', transition: 'all 0.2s', opacity: isBusy ? 0.7 : 1,
                                  boxShadow: `0 4px 12px rgba(200, 16, 46, 0.15)`
                                }}
                                onMouseEnter={e => {
                                  if (!isBusy) e.currentTarget.style.background = '#b00e27';
                                }}
                                onMouseLeave={e => {
                                  if (!isBusy) e.currentTarget.style.background = nestRed;
                                }}
                              >
                                {isBusy ? (
                                  <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  cert.type === 'course' ? 'Generate' : 'Issue Certificate'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminCertification;
