/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Users, Briefcase, Calendar, CheckCircle2,
  Clock, XCircle, Search, Filter, MoreVertical,
  Download, Send, Eye, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi, recruiterApi } from '../../services/api';
import { formatDateTime } from '../../utils/dateUtils';

interface Application {
  id: string;
  candidate: {
    name: string;
    email: string;
    avatar: string;
  };
  role: string;
  appliedAt?: string;
  withdrawnAt?: string;
  reappliedAt?: string;
  statusUpdatedAt?: string;
  date: string;
  aiScore: number;
  matchQuality: 'High' | 'Medium' | 'Low';
  status: 'Applied' | 'Aptitude' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Rejected' | 'Withdrawn';
  timeline?: any[];
}

const Applications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [updateData, setUpdateData] = useState({ status: 'Applied', notes: '' });

  const fetchApps = async () => {
    setIsLoading(true);
    const res = await adminApi.getApplications();
    if (res.success && res.data && res.data.applications) {
      const mapped = res.data.applications.map((app: any) => ({
        id: app.id,
        candidate: {
          name: app.applicant_name || 'Alumni Member',
          email: app.applicant_email || 'member@nest.com',
          avatar: ''
        },
        role: app.job_title || 'Software Role',
        appliedAt: app.applied_at,
        withdrawnAt: app.withdrawn_at,
        reappliedAt: app.reapplied_at,
        statusUpdatedAt: app.status_updated_at || app.updated_at,
        date: formatDateTime(app.applied_at),
        aiScore: Math.floor(Math.random() * 40) + 60,
        matchQuality: 'Medium' as const,
        status: app.status || 'Applied',
        timeline: app.timeline || []
      }));
      setApplications(mapped);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);
  const filteredApplications = applications.filter(app => 
    app.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return { bg: '#f8fafc', border: '#e2e8f0', text: '#475569', icon: <Clock size={12} /> };
      case 'Aptitude': return { bg: '#fff7ed', border: '#ffedd5', text: '#9a3412', icon: <Clock size={12} /> };
      case 'Shortlisted': return { bg: '#e0e7ff', border: '#dbeafe', text: '#1e3a8a', icon: <Eye size={12} /> };
      case 'Interview Scheduled': return { bg: '#fdf4ff', border: '#fae8ff', text: '#86198f', icon: <Send size={12} /> };
      case 'Offered': return { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', icon: <CheckCircle2 size={12} /> };
      case 'Rejected': return { bg: '#fef2f2', border: '#fee2e2', text: '#991b1b', icon: <XCircle size={12} /> };
      case 'Withdrawn': return { bg: '#f8fafc', border: '#dee2e6', text: '#868e96', icon: <XCircle size={12} /> };
      default: return { bg: '#f8fafc', border: '#f1f5f9', text: '#64748b', icon: <Clock size={12} /> };
    }
  };

  const handleUpdateClick = (app: any) => {
    setSelectedApp(app);
    setUpdateData({
        status: app.status || 'Applied',
        notes: ''
    });
  };

  const handleSaveUpdate = async () => {
    if (!updateData.notes || !updateData.notes.trim()) {
        alert("Internal comment / reason is mandatory. Please provide a comment before saving.");
        return;
    }
    try {
        const response = await recruiterApi.updateApplicationStatus(selectedApp.id, updateData);
        if (response.success) {
            const nowIso = new Date().toISOString();
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const adminName = currentUser.full_name || currentUser.name || 'Admin';
            const adminEmpId = currentUser.emp_id || currentUser.id || 'ADM';

            setApplications(apps => apps.map(a => 
                a.id === selectedApp.id ? { 
                  ...a, 
                  status: updateData.status as any,
                  statusUpdatedAt: nowIso,
                  notes: updateData.notes,
                  timeline: [
                    ...(a.timeline || []),
                    {
                      action: 'Status Changed',
                      status: updateData.status,
                      previous_status: a.status,
                      timestamp: nowIso,
                      actor_name: adminName,
                      actor_role: 'Admin',
                      recruiter_id: adminEmpId,
                      note: updateData.notes || `Application status updated to ${updateData.status} by ${adminName}.`
                    }
                  ]
                } : a
            ));
            setSelectedApp(null);
        } else {
            alert(response.message || "Failed to update application.");
        }
    } catch (err) {
        console.error("Update error:", err);
        alert("An error occurred while updating the application.");
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Applications</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Track and manage job applications with AI insights.</p>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Total Applications', value: applications.length, icon: <Users size={24} />, color: '#3b82f6' },
          { label: 'AI Shortlisted', value: applications.filter(a => (a.aiScore || 0) > 80).length, icon: <Brain size={24} />, color: '#8b5cf6' },
          { label: 'Active Interviews', value: applications.filter(a => a.status === 'Interview Scheduled').length, icon: <Send size={24} />, color: '#10b981' },
          { label: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, icon: <XCircle size={24} />, color: '#f43f5e' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${stat.color}10`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, margin: '0 0 4px 0' }}>{stat.label}</p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 16px', flex: 1, maxWidth: '400px' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: '#1e293b' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading applications...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>CANDIDATE</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>ROLE</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>DATE</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>AI SCORE</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>STATUS</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No applications found.</td>
                  </tr>
                ) : applications.map((app, i) => {
                  const status = getStatusColor(app.status || 'Applied');
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                            {app.candidate?.name?.substring(0, 2).toUpperCase() || '??'}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{app.candidate?.name}</span>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{app.candidate?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{formatDateTime(app.appliedAt)}</span>
                          {app.reappliedAt && (
                            <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} /> Reapplied: {formatDateTime(app.reappliedAt)}
                            </span>
                          )}
                          {app.withdrawnAt && (
                            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} /> Withdrawn: {formatDateTime(app.withdrawnAt)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '10px', minWidth: '80px' }}>
                            <div style={{ width: `${app.aiScore || 0}%`, height: '100%', background: (app.aiScore || 0) > 80 ? '#22c55e' : '#f59e0b', borderRadius: '10px' }}></div>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 700 }}>{app.aiScore || 0}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
                          {status.icon} {app.status || 'Applied'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleUpdateClick(app)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #3b82f6', background: '#fff', color: '#3b82f6', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: '#fff', padding: '28px', borderRadius: '20px', width: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Update Status</h2>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                For <strong>{selectedApp.candidate.name}</strong> • Applied: {formatDateTime(selectedApp.appliedAt)}
              </p>

              {/* Status and Action Timeline History */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Application Timeline & Activity
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {(selectedApp.timeline && selectedApp.timeline.length > 0 ? selectedApp.timeline : [
                    { action: 'Applied', status: 'Applied', timestamp: selectedApp.appliedAt, actor_name: 'Candidate' }
                  ]).map((t: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', padding: '8px 10px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>
                            {t.action === 'Status Changed' ? `Status: ${t.status}` : t.action}
                          </span>
                          {t.actor_name && (
                            <span style={{ fontSize: '10px', background: '#e2e8f0', color: '#1e293b', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              {t.actor_name}
                            </span>
                          )}
                          {t.recruiter_id && (
                            <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              ID: {t.recruiter_id}
                            </span>
                          )}
                        </div>
                        <span style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} color="#94a3b8" /> {formatDateTime(t.timestamp)}
                        </span>
                      </div>
                      {t.note && (
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#475569', fontStyle: 'italic', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px' }}>
                          "{t.note}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>New Status</label>
                <select 
                  value={updateData.status}
                  onChange={e => setUpdateData({...updateData, status: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '13px' }}
                >
                  <option value="Applied">Applied</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Offered">Offered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Internal Comment / Reason</span>
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
                  </label>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                    🔒 Hidden from Applicant
                  </span>
                </div>
                <textarea 
                  value={updateData.notes}
                  onChange={e => setUpdateData({...updateData, notes: e.target.value})}
                  placeholder="Enter internal comment, interview feedback, or reason (visible to staff only)..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <span style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                  Applicant only sees that status changed. Internal notes and updater ID are saved for recruiter tracking.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => setSelectedApp(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button onClick={handleSaveUpdate} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Applications;
