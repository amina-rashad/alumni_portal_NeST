import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Eye, FileText, ChevronDown, ChevronUp, Filter, Search, RotateCcw, Check, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../services/api';
import { formatDateTime, formatDateOnly, formatTimeOnly } from '../utils/dateUtils';

// Status type
type ApplicationStatus = 'Applied' | 'Aptitude' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Rejected' | 'Withdrawn';

interface TimelineEvent {
  action: string;
  status: string;
  previous_status?: string | null;
  timestamp: string;
  actor_name?: string;
  actor_role?: string;
  note?: string;
}

interface Application {
  id: string;
  jobId: string;
  title: string;
  department: string;
  location: string;
  type: string;
  appliedDate: string;
  withdrawnDate?: string;
  reappliedDate?: string;
  statusUpdatedDate?: string;
  status: ApplicationStatus;
  lastUpdated: string;
  interviewDate?: string;
  notes?: string;
  isJobActive?: boolean;
  jobStatus?: string;
  timeline?: TimelineEvent[];
}

const STATUS_CONFIG: Record<ApplicationStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Applied': { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0', icon: <Briefcase size={16} /> },
  'Aptitude': { color: '#e67700', bg: '#fff9db', border: '#ffd43b', icon: <Clock size={16} /> },
  'Shortlisted': { color: '#1971c2', bg: '#e7f5ff', border: '#74c0fc', icon: <Eye size={16} /> },
  'Interview Scheduled': { color: '#7048e8', bg: '#f3f0ff', border: '#b197fc', icon: <AlertCircle size={16} /> },
  'Offered': { color: '#2b8a3e', bg: '#ebfbee', border: '#69db7c', icon: <CheckCircle2 size={16} /> },
  'Rejected': { color: '#c92a2a', bg: '#fff5f5', border: '#ffa8a8', icon: <XCircle size={16} /> },
  'Withdrawn': { color: '#868e96', bg: '#f8f9fa', border: '#dee2e6', icon: <XCircle size={16} /> }
};

const ALL_STATUSES: ApplicationStatus[] = ['Applied', 'Aptitude', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Rejected', 'Withdrawn'];

const STATUS_MAP: Record<string, ApplicationStatus> = {
  'Applied': 'Applied',
  'pending': 'Applied',
  'Aptitude': 'Aptitude',
  'Aptitude Test': 'Aptitude',
  'Shortlisted': 'Shortlisted',
  'shortlisted': 'Shortlisted',
  'Interview Scheduled': 'Interview Scheduled',
  'interview': 'Interview Scheduled',
  'Offered': 'Offered',
  'hired': 'Offered',
  'Rejected': 'Rejected',
  'rejected': 'Rejected',
  'Withdrawn': 'Withdrawn',
  'withdrawn': 'Withdrawn'
};

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleWithdraw = async (appId: string, _jobTitle?: string) => {
    try {
      setWithdrawingId(appId);
      const res = await applicationsApi.withdrawApplication(appId);
      if (res.success) {
        const nowIso = new Date().toISOString();
        setApplications(prev => prev.map(a => {
          if (a.id !== appId) return a;
          const newEvent: TimelineEvent = {
            action: 'Withdrawn',
            status: 'Withdrawn',
            previous_status: a.status,
            timestamp: nowIso,
            actor_name: 'You (Candidate)',
            actor_role: 'Candidate',
            note: 'Application withdrawn by candidate.'
          };
          return {
            ...a,
            status: 'Withdrawn',
            withdrawnDate: nowIso,
            statusUpdatedDate: nowIso,
            lastUpdated: nowIso,
            timeline: [...(a.timeline || []), newEvent]
          };
        }));
      } else {
        console.error('Failed to withdraw application:', res.message);
      }
    } catch (err: any) {
      console.error('Withdraw error:', err);
    } finally {
      setWithdrawingId(null);
    }
  };

  useEffect(() => {
    const fetchApps = async (isPoll = false) => {
      try {
        if (!isPoll) setLoading(true);
        const res = await applicationsApi.getMyApplications();
        if (res.success && res.data && (res.data as any).applications) {
          const apiApps = (res.data as any).applications.map((app: any) => ({
            id: app.id,
            jobId: app.job_id,
            title: app.job_title || 'Untitled Position',
            department: app.job_company || 'NeST Digital',
            location: app.job_location || 'Remote',
            type: 'Full-time',
            appliedDate: app.applied_at,
            withdrawnDate: app.withdrawn_at,
            reappliedDate: app.reapplied_at,
            statusUpdatedDate: app.status_updated_at || app.updated_at,
            status: STATUS_MAP[app.status] || 'Applied',
            lastUpdated: app.status_updated_at || app.updated_at || app.applied_at,
            interviewDate: app.interviewDate,
            notes: app.notes || (app.cover_letter ? `Cover Letter: ${app.cover_letter}` : undefined),
            isJobActive: app.job_is_active !== false && String(app.job_status || '').toLowerCase() !== 'closed',
            jobStatus: app.job_status || (app.job_is_active === false ? 'Closed' : 'Active'),
            timeline: app.timeline || []
          }));
          setApplications(apiApps);
        }
      } catch (err) {
        if (!isPoll) {
          console.error("Failed to fetch applications", err);
          setError('Failed to load your applications.');
        }
      } finally {
        if (!isPoll) setLoading(false);
      }
    };
    fetchApps();
    const interval = setInterval(() => fetchApps(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredApps = applications.filter(app => {
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDate = formatDateOnly;

  interface LifecycleStep {
    key: string;
    label: string;
    state: 'completed' | 'current' | 'withdrawn' | 'reapplied' | 'rejected' | 'pending';
    timestamp?: string | null;
    actor?: string;
    note?: string;
    color: string;
    bg: string;
    border: string;
  }

  const getApplicationLifecycleSteps = (app: Application): LifecycleStep[] => {
    const steps: LifecycleStep[] = [];
    const timeline = app.timeline || [];

    const findEv = (predicate: (ev: TimelineEvent) => boolean) => {
      return timeline.find(predicate);
    };

    // 1. Initial Application
    const appliedEv = findEv(e => e.action === 'Applied' || e.status === 'Applied');
    const appliedTs = app.appliedDate || appliedEv?.timestamp;
    const isAppliedCurrent = app.status === 'Applied' && !app.reappliedDate;

    steps.push({
      key: 'applied',
      label: 'Applied',
      state: isAppliedCurrent ? 'current' : 'completed',
      timestamp: appliedTs,
      actor: appliedEv?.actor_name,
      note: appliedEv?.note,
      color: isAppliedCurrent ? '#1e1b4b' : '#16a34a',
      bg: isAppliedCurrent ? '#ede9fe' : '#dcfce7',
      border: isAppliedCurrent ? '#c4b5fd' : '#86efac'
    });

    // 2. Withdrawal & Reapplication check
    const withdrawnEv = findEv(e => e.action === 'Withdrawn' || e.status === 'Withdrawn');
    const hasWithdrawn = Boolean(app.withdrawnDate || withdrawnEv || app.status === 'Withdrawn');
    const reappliedEv = findEv(e => e.action === 'Reapplied');
    const hasReapplied = Boolean(app.reappliedDate || reappliedEv);

    if (hasWithdrawn) {
      const withdrawnTs = app.withdrawnDate || withdrawnEv?.timestamp || (app.status === 'Withdrawn' ? app.lastUpdated : null);
      if (hasReapplied) {
        // Candidate withdrew previously, then reapplied
        steps.push({
          key: 'withdrawn_prev',
          label: 'Withdrawn',
          state: 'withdrawn',
          timestamp: withdrawnTs,
          actor: withdrawnEv?.actor_name,
          note: withdrawnEv?.note || 'Application withdrawn by candidate.',
          color: '#dc2626',
          bg: '#fef2f2',
          border: '#fecaca'
        });
        const isReappliedCurrent = app.status === 'Applied';
        steps.push({
          key: 'reapplied',
          label: 'Reapplied',
          state: isReappliedCurrent ? 'current' : 'reapplied',
          timestamp: app.reappliedDate || reappliedEv?.timestamp,
          actor: reappliedEv?.actor_name,
          note: reappliedEv?.note || 'Candidate reapplied for position.',
          color: '#2563eb',
          bg: '#eff6ff',
          border: '#bfdbfe'
        });
      } else {
        // Currently Withdrawn
        steps.push({
          key: 'withdrawn',
          label: 'Withdrawn',
          state: 'withdrawn',
          timestamp: withdrawnTs,
          actor: withdrawnEv?.actor_name,
          note: withdrawnEv?.note || 'Application withdrawn by candidate.',
          color: '#dc2626',
          bg: '#fee2e2',
          border: '#fca5a5'
        });
        return steps;
      }
    }

    // 3. Pipeline milestones
    const pipelineStages: { id: ApplicationStatus; label: string; rank: number }[] = [
      { id: 'Aptitude', label: 'Aptitude', rank: 1 },
      { id: 'Shortlisted', label: 'Shortlisted', rank: 2 },
      { id: 'Interview Scheduled', label: 'Interview Scheduled', rank: 3 },
    ];

    const stageRanks: Record<string, number> = {
      'Applied': 0,
      'Aptitude': 1,
      'Shortlisted': 2,
      'Interview Scheduled': 3,
      'Offered': 4,
      'Rejected': 4
    };
    const currentRank = stageRanks[app.status] ?? 0;

    for (const stg of pipelineStages) {
      const ev = findEv(e => e.status === stg.id);
      let stageTs: string | null | undefined = ev?.timestamp;
      if (app.status === stg.id && !stageTs) {
        stageTs = app.statusUpdatedDate || app.lastUpdated;
      }

      let state: 'completed' | 'current' | 'pending' = 'pending';
      let color = '#94a3b8';
      let bg = '#f8fafc';
      let border = '#e2e8f0';

      if (app.status === stg.id) {
        state = 'current';
        color = STATUS_CONFIG[stg.id]?.color || '#1e1b4b';
        bg = STATUS_CONFIG[stg.id]?.bg || '#f1f5f9';
        border = STATUS_CONFIG[stg.id]?.border || '#cbd5e1';
      } else if (currentRank > stg.rank) {
        state = 'completed';
        color = '#16a34a';
        bg = '#dcfce7';
        border = '#86efac';
      }

      steps.push({
        key: stg.id,
        label: stg.label,
        state,
        timestamp: stageTs,
        actor: ev?.actor_name,
        note: ev?.note,
        color,
        bg,
        border
      });
    }

    // 4. Final Milestone: Offered or Rejected
    if (app.status === 'Rejected') {
      const rejEv = findEv(e => e.status === 'Rejected' || e.action === 'Rejected');
      steps.push({
        key: 'rejected',
        label: 'Rejected',
        state: 'rejected',
        timestamp: rejEv?.timestamp || app.statusUpdatedDate || app.lastUpdated,
        actor: rejEv?.actor_name,
        note: rejEv?.note || app.notes,
        color: '#dc2626',
        bg: '#fee2e2',
        border: '#fca5a5'
      });
    } else {
      const offerEv = findEv(e => e.status === 'Offered');
      const isOffered = app.status === 'Offered';
      steps.push({
        key: 'offered',
        label: 'Offered',
        state: isOffered ? 'completed' : 'pending',
        timestamp: isOffered ? (offerEv?.timestamp || app.statusUpdatedDate || app.lastUpdated) : null,
        actor: offerEv?.actor_name,
        note: offerEv?.note,
        color: isOffered ? '#16a34a' : '#94a3b8',
        bg: isOffered ? '#dcfce7' : '#f8fafc',
        border: isOffered ? '#86efac' : '#e2e8f0'
      });
    }

    return steps;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a1a1a', fontFamily: 'Montserrat, sans-serif' }}>
      <div>

        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ 
            background: '#1e1b4b', 
            padding: '5rem 3.5rem', 
            width: '100%', 
            marginBottom: '3rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: 800, 
              margin: 0, 
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              <span style={{ color: '#ef4444' }}>Application</span> <span style={{ color: '#ffffff' }}>Center</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginTop: '1rem', fontWeight: 400, fontFamily: '"Outfit", sans-serif' }}>
              Track and manage your professional journey at NeST Digital.
            </p>
          </div>
        </motion.div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>


        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
              <Briefcase size={40} color="#d32f2f" />
            </motion.div>
            <p style={{ marginTop: '1rem', color: '#64748B' }}>Loading your applications...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff5f5', borderRadius: '20px', border: '1px solid #ffa8a8' }}>
            <AlertCircle size={40} color="#c92a2a" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#c92a2a', marginBottom: '0.5rem' }}>{error}</h3>
            <button onClick={() => window.location.reload()} style={{ color: '#c92a2a', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Try Again</button>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '1.5rem',
                marginBottom: '2.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                border: '1px solid #E2E8F0',
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={20} />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 3rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    color: '#1a1a1a',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d32f2f'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Filter size={18} color="#94A3B8" />
                {['All', ...ALL_STATUSES.filter(s => statusCounts[s])].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      border: `1px solid ${filterStatus === status ? '#d32f2f' : '#E2E8F0'}`,
                      background: filterStatus === status ? '#d32f2f' : 'white',
                      color: filterStatus === status ? 'white' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: filterStatus === status ? '0 4px 12px rgba(211,47,47,0.2)' : 'none'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Applications List */}
        <AnimatePresence mode="popLayout">
          {filteredApps.length > 0 ? (
            filteredApps.map((app, index) => {
              const config = STATUS_CONFIG[app.status];
              const isExpanded = expandedId === app.id;
              const lifecycleSteps = getApplicationLifecycleSteps(app);

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  layout
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${isExpanded ? config.border : '#e9ecef'}`,
                    borderRadius: '16px',
                    padding: '1.5rem 1.8rem',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isExpanded ? `0 8px 24px ${config.bg}` : '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  onMouseEnter={(e) => { if (!isExpanded) { e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#dee2e6'; } }}
                  onMouseLeave={(e) => { if (!isExpanded) { e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#e9ecef'; } }}
                >
                  {/* Main Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{app.department}</span>
                        <span style={{ color: '#dee2e6' }}>•</span>
                        <span style={{ color: '#6c757d', fontSize: '0.78rem' }}>{app.type}</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.6rem 0' }}>{app.title}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6c757d', fontSize: '0.82rem' }}>
                          <MapPin size={14} color="var(--primary)" /> {app.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontSize: '0.82rem', fontWeight: 500 }}>
                          <FileText size={14} color="var(--primary)" /> Applied {formatDateTime(app.appliedDate)}
                        </span>
                        {app.reappliedDate && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', fontSize: '0.78rem', background: '#eff6ff', padding: '0.15rem 0.55rem', borderRadius: '12px', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                            <RotateCcw size={12} /> Reapplied {formatDateTime(app.reappliedDate)}
                          </span>
                        )}
                        {app.status === 'Withdrawn' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#dc2626', fontSize: '0.78rem', background: '#fef2f2', padding: '0.15rem 0.55rem', borderRadius: '12px', fontWeight: 700, border: '1px solid #fee2e2' }}>
                            <XCircle size={12} /> Withdrawn {formatDateTime(app.withdrawnDate || app.lastUpdated)}
                          </span>
                        )}
                        {app.status !== 'Applied' && app.status !== 'Withdrawn' && app.statusUpdatedDate && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: config.color, fontSize: '0.78rem', background: config.bg, padding: '0.15rem 0.55rem', borderRadius: '12px', fontWeight: 600, border: `1px solid ${config.border}` }}>
                            <Clock size={12} /> {app.status}: {formatDateTime(app.statusUpdatedDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Status Badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 1rem',
                        borderRadius: '20px',
                        background: config.bg,
                        border: `1px solid ${config.border}`,
                        color: config.color,
                        fontWeight: 600,
                        fontSize: '0.82rem'
                      }}>
                        {config.icon}
                        {app.status}
                      </div>

                      {!app.isJobActive && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 1rem',
                          borderRadius: '20px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          color: '#64748b',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Closed
                        </div>
                      )}

                      {/* Expand Toggle */}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: '#adb5bd', display: 'flex' }}
                      >
                        <ChevronDown size={20} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ borderTop: '1px solid #e9ecef', marginTop: '1.5rem', paddingTop: '1.5rem' }}>

                          {/* Enhanced Application Lifecycle Stepper tracking Date & Time */}
                          <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '1.75rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={16} color="var(--primary)" />
                                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                  Application Progress & Milestones
                                </h4>
                              </div>
                              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                                Live activity tracker with exact date & time
                              </span>
                            </div>

                            {/* Stepper nodes - Centered CSS Grid with exact node-to-node connecting lines */}
                            <div style={{
                              width: '100%',
                              overflowX: lifecycleSteps.length > 4 ? 'auto' : 'visible',
                              paddingBottom: '0.5rem'
                            }}>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${lifecycleSteps.length}, 1fr)`,
                                position: 'relative',
                                maxWidth: lifecycleSteps.length === 2 ? '440px' : lifecycleSteps.length === 3 ? '600px' : '100%',
                                minWidth: lifecycleSteps.length > 4 ? '560px' : 'auto',
                                margin: '0 auto',
                                width: '100%',
                                padding: '0.5rem 0'
                              }}>
                                {lifecycleSteps.map((step, idx) => {
                                  const isLast = idx === lifecycleSteps.length - 1;
                                  const isCompleted = step.state === 'completed';
                                  const isCurrent = step.state === 'current';
                                  const isWithdrawn = step.state === 'withdrawn';
                                  const isReapplied = step.state === 'reapplied';
                                  const isRejected = step.state === 'rejected';

                                  const nextStep = lifecycleSteps[idx + 1];
                                  const isNextWithdrawn = nextStep?.state === 'withdrawn';
                                  const isNextRejected = nextStep?.state === 'rejected';
                                  const isNextReapplied = nextStep?.state === 'reapplied';

                                  let lineColor = '#e2e8f0';
                                  if (isNextWithdrawn || isNextRejected) {
                                    lineColor = '#fca5a5';
                                  } else if (isNextReapplied) {
                                    lineColor = '#93c5fd';
                                  } else if (isCompleted || isReapplied) {
                                    lineColor = '#16a34a';
                                  }

                                  return (
                                    <div
                                      key={step.key}
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        position: 'relative'
                                      }}
                                    >
                                      {/* Horizontal Connecting Line - spans from center of this column to center of next column */}
                                      {!isLast && (
                                        <div style={{
                                          position: 'absolute',
                                          top: '18px',
                                          left: '50%',
                                          width: '100%',
                                          height: '3px',
                                          background: lineColor,
                                          zIndex: 1,
                                          transition: 'background 0.3s ease'
                                        }} />
                                      )}

                                      {/* Step Node Column */}
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', zIndex: 2, position: 'relative' }}>
                                        {/* Circle Icon Node */}
                                        <motion.div
                                          initial={false}
                                          animate={{ scale: isCurrent ? 1.15 : 1 }}
                                          style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: isCurrent ? step.color : step.bg,
                                            border: `2px solid ${isCurrent ? step.color : step.border}`,
                                            color: isCurrent ? '#ffffff' : step.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: isCurrent ? `0 0 0 5px ${step.color}25` : '0 2px 4px rgba(0,0,0,0.04)',
                                            transition: 'all 0.3s ease',
                                            marginBottom: '0.6rem'
                                          }}
                                        >
                                          {isCompleted ? (
                                            <Check size={18} strokeWidth={2.8} />
                                          ) : isWithdrawn ? (
                                            <XCircle size={18} />
                                          ) : isRejected ? (
                                            <XCircle size={18} />
                                          ) : isReapplied ? (
                                            <RotateCcw size={16} />
                                          ) : isCurrent ? (
                                            <Clock size={17} />
                                          ) : (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }} />
                                          )}
                                        </motion.div>

                                        {/* Step Label */}
                                        <span style={{
                                          fontSize: '0.82rem',
                                          fontWeight: isCurrent ? 800 : (isCompleted || isReapplied || isWithdrawn || isRejected) ? 700 : 500,
                                          color: isCurrent ? step.color : (isCompleted || isReapplied || isWithdrawn || isRejected) ? '#1e293b' : '#94a3b8',
                                          marginBottom: '0.35rem',
                                          whiteSpace: 'nowrap'
                                        }}>
                                          {step.label}
                                        </span>

                                        {/* Date & Time pill */}
                                        {step.timestamp ? (
                                          <div style={{
                                            display: 'inline-flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            background: isCurrent ? 'rgba(30, 27, 75, 0.05)' : '#ffffff',
                                            border: `1px solid ${isCurrent ? step.border : '#e2e8f0'}`,
                                            padding: '0.2rem 0.55rem',
                                            borderRadius: '8px',
                                            gap: '2px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                          }}>
                                            <span style={{ fontSize: '0.73rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
                                              {formatDateOnly(step.timestamp)}
                                            </span>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                                              <Clock size={10} color="#94a3b8" /> {formatTimeOnly(step.timestamp)}
                                            </span>
                                          </div>
                                        ) : (
                                          <span style={{
                                            fontSize: '0.72rem',
                                            color: '#94a3b8',
                                            fontWeight: 500,
                                            fontStyle: 'italic',
                                            padding: '0.2rem 0.4rem'
                                          }}>
                                            Pending
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Withdrawn Notice Card with Re-apply validation */}
                          {app.status === 'Withdrawn' && (
                            <div style={{
                              marginBottom: '2rem',
                              padding: '1.25rem 1.5rem',
                              background: app.isJobActive !== false ? '#fef2f2' : '#f8fafc',
                              border: `1px solid ${app.isJobActive !== false ? '#fee2e2' : '#e2e8f0'}`,
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1rem'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                flexWrap: 'wrap'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                  <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    background: app.isJobActive !== false ? '#fee2e2' : '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: app.isJobActive !== false ? '#dc2626' : '#64748b',
                                    flexShrink: 0
                                  }}>
                                    {app.isJobActive !== false ? <XCircle size={22} /> : <Lock size={20} />}
                                  </div>
                                  <div>
                                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: app.isJobActive !== false ? '#991b1b' : '#334155' }}>
                                      Application Withdrawn on {formatDateTime(app.withdrawnDate || app.lastUpdated)}
                                    </h4>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: app.isJobActive !== false ? '#b91c1c' : '#64748b' }}>
                                      Originally applied on {formatDateTime(app.appliedDate)}.
                                      {app.isJobActive !== false
                                        ? ' You can re-apply anytime as this position is currently open.'
                                        : ' You cannot re-apply because this job opening has been closed by recruiters.'}
                                    </p>
                                  </div>
                                </div>
                                {app.isJobActive !== false ? (
                                  <Link
                                    to={`/jobs/${app.jobId}`}
                                    style={{
                                      padding: '0.65rem 1.3rem',
                                      borderRadius: '8px',
                                      background: '#c8102e',
                                      color: '#ffffff',
                                      fontSize: '0.88rem',
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.45rem',
                                      transition: 'all 0.2s',
                                      boxShadow: '0 2px 6px rgba(200, 16, 46, 0.2)'
                                    }}
                                  >
                                    <RotateCcw size={15} /> Re-Apply for Job
                                  </Link>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                                    <button
                                      disabled
                                      style={{
                                        padding: '0.65rem 1.2rem',
                                        borderRadius: '8px',
                                        background: '#f1f5f9',
                                        color: '#94a3b8',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.88rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.45rem',
                                        cursor: 'not-allowed'
                                      }}
                                      title="This position is closed. Re-application is not available."
                                    >
                                      <Lock size={15} /> Position Closed
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Explicit explanation why applicant cannot re-apply if inactive */}
                              {app.isJobActive === false && (
                                <div style={{
                                  padding: '0.75rem 1rem',
                                  background: '#fff1f2',
                                  border: '1px solid #fecdd3',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.65rem',
                                  fontSize: '0.84rem',
                                  color: '#9f1239'
                                }}>
                                  <AlertCircle size={18} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
                                  <div>
                                    <span style={{ fontWeight: 700 }}>Why can't I re-apply? </span>
                                    <span>
                                      This job vacancy for <strong>"{app.title}"</strong> has been closed by recruiters (Status: {app.jobStatus || 'Closed'}). It is no longer accepting new submissions or re-applications.
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Additional Info */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div style={{ flex: '1 1 200px' }}>
                              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>First Applied</p>
                              <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.92rem' }}>{formatDateTime(app.appliedDate)}</p>
                            </div>
                            {app.reappliedDate && (
                              <div style={{ flex: '1 1 200px' }}>
                                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Reapplied On</p>
                                <p style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.92rem' }}>{formatDateTime(app.reappliedDate)}</p>
                              </div>
                            )}
                            {app.withdrawnDate && (
                              <div style={{ flex: '1 1 200px' }}>
                                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Withdrawn On</p>
                                <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.92rem' }}>{formatDateTime(app.withdrawnDate)}</p>
                              </div>
                            )}
                            <div style={{ flex: '1 1 200px' }}>
                              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Last Status Update</p>
                              <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.92rem' }}>{formatDateTime(app.statusUpdatedDate || app.lastUpdated)}</p>
                            </div>
                            {app.interviewDate && (
                              <div style={{ flex: '1 1 200px' }}>
                                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Interview Date</p>
                                <p style={{ color: '#7048e8', fontWeight: 600, fontSize: '0.95rem' }}>{formatDateTime(app.interviewDate)}</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            <Link
                              to={`/jobs/${app.jobId}`}
                              style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                background: '#ffffff',
                                border: '1px solid #ced4da',
                                color: '#4a4a4a',
                                fontSize: '0.88rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#ced4da'; e.currentTarget.style.color = '#4a4a4a'; }}
                            >
                              <Briefcase size={15} /> View Job Details
                            </Link>
                            {app.status === 'Withdrawn' && (
                              app.isJobActive !== false ? (
                                <Link
                                  to={`/jobs/${app.jobId}`}
                                  style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    background: '#c8102e',
                                    color: '#ffffff',
                                    fontSize: '0.88rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 6px rgba(200, 16, 46, 0.2)'
                                  }}
                                >
                                  <RotateCcw size={15} /> Re-Apply
                                </Link>
                              ) : (
                                <button
                                  disabled
                                  style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    color: '#94a3b8',
                                    fontSize: '0.88rem',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    cursor: 'not-allowed'
                                  }}
                                  title="This position is closed. You cannot re-apply to this position."
                                >
                                  <Lock size={15} /> Position Closed (Cannot Re-Apply)
                                </button>
                              )
                            )}
                            {(app.status !== 'Rejected' && app.status !== 'Withdrawn') && (
                              <button
                                disabled={withdrawingId === app.id}
                                onClick={() => handleWithdraw(app.id, app.title)}
                                style={{
                                  padding: '0.6rem 1.2rem',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  border: '1px solid #ffa8a8',
                                  color: '#c92a2a',
                                  fontSize: '0.88rem',
                                  fontWeight: 600,
                                  cursor: withdrawingId === app.id ? 'not-allowed' : 'pointer',
                                  opacity: withdrawingId === app.id ? 0.6 : 1,
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { if (withdrawingId !== app.id) e.currentTarget.style.background = '#fff5f5'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                              >
                                {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw Application'}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ background: '#f8f9fa', display: 'inline-block', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <Briefcase size={40} color="#adb5bd" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>No applications found</h3>
              <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                {filterStatus !== 'All' || searchTerm
                  ? 'Try changing your filters to see more results.'
                  : "You haven't applied to any jobs yet. Explore opportunities and get started!"}
              </p>
              {filterStatus !== 'All' || searchTerm ? (
                <button
                  onClick={() => { setFilterStatus('All'); setSearchTerm(''); }}
                  style={{ background: '#ffffff', color: '#1a1a1a', border: '1px solid #ced4da', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/jobs"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.8rem 2rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'background 0.3s'
                  }}
                >
                  Browse Job Listings
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
};

export default MyApplications;
