import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Eye, FileText, ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../services/api';

// Status type
type ApplicationStatus = 'Applied' | 'Aptitude' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Rejected' | 'Withdrawn';

interface Application {
  id: string;
  jobId: string;
  title: string;
  department: string;
  location: string;
  type: string;
  appliedDate: string;
  status: ApplicationStatus;
  lastUpdated: string;
  interviewDate?: string;
  notes?: string;
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
            status: STATUS_MAP[app.status] || 'Applied',
            lastUpdated: app.updated_at || app.applied_at,
            interviewDate: app.interviewDate,
            notes: app.notes || (app.cover_letter ? `Cover Letter: ${app.cover_letter}` : undefined)
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getTimelineSteps = (status: ApplicationStatus) => {
    const steps = ['Applied', 'Aptitude', 'Shortlisted', 'Interview Scheduled', 'Offered'];
    
    const statusMap: Record<ApplicationStatus, number> = {
      'Applied': 0,
      'Aptitude': 1,
      'Shortlisted': 2,
      'Interview Scheduled': 3,
      'Offered': 4,
      'Rejected': 3, // If rejected, point to the last successful stage (e.g. Interview)
      'Withdrawn': 3
    };
    const activeStep = statusMap[status];
    return { steps, activeStep };
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
              const { steps, activeStep } = getTimelineSteps(app.status);

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
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6c757d', fontSize: '0.85rem' }}>
                          <MapPin size={14} color="var(--primary)" /> {app.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6c757d', fontSize: '0.85rem' }}>
                          <FileText size={14} color="var(--primary)" /> Applied {formatDate(app.appliedDate)}
                        </span>
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

                          {/* Progress Timeline */}                          <div style={{ marginBottom: '3rem', padding: '0 1.5rem' }}>
                            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Application Progress</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0', position: 'relative', height: '40px' }}>
                              {steps.map((step, i) => {
                                
                                // Color logic
                                const stepStatus = steps[i];
                                const stepConfig = STATUS_CONFIG[stepStatus as ApplicationStatus] || STATUS_CONFIG['Applied'];
                                
                                // Activation logic
                                let isActive = false;
                                if (app.status === 'Rejected') {
                                  // If rejected, show progress up to the point of rejection (mapped in getTimelineSteps)
                                  isActive = i <= activeStep;
                                } else {
                                  isActive = i <= activeStep;
                                }

                                const isCurrent = i === activeStep && app.status !== 'Rejected' && app.status !== 'Offered';
                                const dotColor = (app.status === 'Rejected' && i === activeStep) ? '#ef4444' : isActive ? (isCurrent ? stepConfig.color : '#1e1b4b') : '#e2e8f0';
                                const textColor = isCurrent ? stepConfig.color : isActive ? '#1e1b4b' : '#94a3b8';
                                
                                // Line color logic
                                const lineColor = isActive && i < activeStep ? '#1e1b4b' : '#e2e8f0';

                                return (
                                  <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '20px' }}>
                                      <motion.div 
                                        initial={false}
                                        animate={{ 
                                          scale: isCurrent ? 1.2 : 1,
                                          backgroundColor: dotColor
                                        }}
                                        style={{
                                          width: '12px',
                                          height: '12px',
                                          borderRadius: '50%',
                                          zIndex: 2,
                                          boxShadow: isCurrent ? `0 0 0 4px ${dotColor}20` : 'none'
                                        }} 
                                      />
                                      <span style={{
                                        position: 'absolute',
                                        top: '24px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '0.75rem',
                                        color: textColor,
                                        fontWeight: isCurrent ? 800 : 600,
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center',
                                        transition: 'all 0.3s'
                                      }}>
                                        {step}
                                      </span>
                                    </div>
                                    {i < steps.length - 1 && (
                                      <div style={{ flex: 1, height: '2px', background: lineColor, margin: '0 -4px', zIndex: 1, transition: 'background 0.3s' }} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '2.5rem' }}>
                            <div style={{ flex: '1 1 200px' }}>
                              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Last Updated</p>
                              <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '0.95rem' }}>{formatDate(app.lastUpdated)}</p>
                            </div>
                            {app.interviewDate && (
                              <div style={{ flex: '1 1 200px' }}>
                                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Interview Date</p>
                                <p style={{ color: '#7048e8', fontWeight: 600, fontSize: '0.95rem' }}>{formatDate(app.interviewDate)}</p>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {app.notes && (
                            <div style={{ background: config.bg, border: `1px solid ${config.border}`, borderRadius: '10px', padding: '1rem 1.2rem', marginTop: '1rem' }}>
                              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: config.color, marginBottom: '0.3rem' }}>
                                {config.icon} Note from Recruiter
                              </p>
                              <p style={{ color: '#4a4a4a', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{app.notes}</p>
                            </div>
                          )}

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
                            {(app.status !== 'Rejected' && app.status !== 'Withdrawn') && (
                              <button
                                style={{
                                  padding: '0.6rem 1.2rem',
                                  borderRadius: '8px',
                                  background: '#ffffff',
                                  border: '1px solid #ffa8a8',
                                  color: '#c92a2a',
                                  fontSize: '0.88rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#fff5f5'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                              >
                                Withdraw Application
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
