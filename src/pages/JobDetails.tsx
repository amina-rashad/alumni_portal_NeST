import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Briefcase, Clock, Building, CheckCircle2, Star, Share2, Upload, Check } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import nestIcon from '../assets/nest_icon.png';

import { jobsApi, applicationsApi } from '../services/api';
import StatusModal from '../components/StatusModal';
import ApplicationFormModal, { type ApplicationProfileData } from '../components/ApplicationFormModal';
import { formatDateTime, formatDateOnly } from '../utils/dateUtils';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<any>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    title: '',
    message: '',
    confirmText: 'Okay',
    showConfirmOnly: true,
    onConfirm: undefined as (() => void) | undefined
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await jobsApi.getJobById(id);
        if (res.success && res.data) {
          const apiJob = (res.data as any).job;

          setJob({
            id: apiJob.id,
            title: apiJob.title || 'Untitled Position',
            department: apiJob.department || 'General',
            company: apiJob.company || 'NeST Digital',
            location: apiJob.location || 'Remote',
            type: apiJob.type || 'Full-time',
            experience: apiJob.experience_level || 'Entry Level',
            postedAt: apiJob.createdAt ? formatDateOnly(apiJob.createdAt) : 'Recently',
            salary: apiJob.salary || 'Not Disclosed',
            aboutContext: apiJob.description || 'No description provided.',
            responsibilities: apiJob.responsibilities || [
              'No specific responsibilities listed.',
              'Collaborate with cross-functional teams.',
              'Participate in code reviews.'
            ],
            requirements: apiJob.requirements || [],
            skills: apiJob.skills_required || [],
            urgent: apiJob.is_urgent,
            is_active: apiJob.is_active ?? true
          });
        }
      } catch (err) {
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
    
    const checkApplicationStatus = async () => {
      try {
        const res = await applicationsApi.getMyApplications();
        if (res.success && res.data && (res.data as any).applications) {
          const apps = (res.data as any).applications;
          const userApp = apps.find((app: any) => app.job_id === id && app.status !== 'Withdrawn' && app.status !== 'withdrawn');
          if (userApp) {
            setIsApplied(true);
            setApplication(userApp);
          } else {
            setIsApplied(false);
            setApplication(null);
          }
        }
      } catch (err) {
        console.error("Failed to check application status", err);
      }
    };
    checkApplicationStatus();
    window.scrollTo(0, 0);
  }, [id]);

  const handleApply = () => {
    if (!job) return;
    setIsFormModalOpen(true);
  };

  const handleConfirmApply = async () => {
    try {
      setModalConfig(prev => ({ ...prev, isOpen: false }));
      const res = await applicationsApi.applyForJob({ job_id: job.id });
      if (res.success) {
        setIsApplied(true);
        setModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Application Successful!',
          message: 'You can track your application in the "My Applications" dashboard.',
          confirmText: 'View Dashboard',
          showConfirmOnly: true,
          onConfirm: () => navigate('/jobs/applications')
        });
      }
    } catch (err) {
        console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Briefcase size={48} color="#c8102e" />
        </motion.div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: '#1a1a1a', marginBottom: '1rem' }}>{error || 'Listing Unavailable'}</h2>
        <Link to="/jobs" style={{ color: '#c8102e', fontWeight: 700, textDecoration: 'none' }}>Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem 5rem', background: '#f8f9fa', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @media (max-width: 860px) {
          .job-details-grid {
            grid-template-columns: 1fr !important;
          }
          .job-details-hero {
            padding: 1.5rem !important;
          }
        }
      `}</style>

      {/* Main Centered Container with Standard Margin */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <button 
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/jobs')}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '8px 16px', 
            color: '#475569', 
            cursor: 'pointer', 
            marginBottom: '1.75rem', 
            fontWeight: 600, 
            fontSize: '14px', 
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease' 
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#c8102e';
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.background = '#f8fafc';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#475569';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = '#ffffff';
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <motion.div 
          className="job-details-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem 3rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', border: '1px solid #e9ecef', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}
        >
          {job.urgent && (
            <div style={{ position: 'absolute', top: '1.5rem', right: '-2.5rem', background: '#c8102e', color: 'white', padding: '0.4rem 3rem', transform: 'rotate(45deg)', fontSize: '0.8rem', fontWeight: 700 }}>
              URGENT MATCH
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}>
              <img src={nestIcon} alt="NeST Digital" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h1 style={{ fontSize: '2.2rem', color: '#1a1a1a', margin: '0 0 1rem 0', fontWeight: 800, lineHeight: 1.25 }}>{job.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#6c757d', fontSize: '1rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building size={18} /> {job.company}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} /> {job.location}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={18} /> {job.experience}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e9ecef', paddingTop: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Posted {job.postedAt}</p>
              {isApplied && application && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', background: '#f0f4ff', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8', fontWeight: 700, fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} /> Status: {application.status}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} color="#94a3b8" />
                    {application.reapplied_at ? `Reapplied ${formatDateTime(application.reapplied_at)}` : application.status_updated_at && application.status !== 'Applied' ? `Status updated ${formatDateTime(application.status_updated_at)}` : `Applied ${formatDateTime(application.applied_at)}`}
                  </span>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleApply}
              disabled={isApplied || job.is_active === false}
              style={{
                background: job.is_active === false ? '#64748b' : (isApplied ? '#e3fbee' : '#c8102e'),
                color: job.is_active === false ? 'white' : (isApplied ? '#2b8a3e' : 'white'),
                padding: '0.9rem 2.5rem',
                borderRadius: '8px',
                fontSize: '1.05rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: (isApplied || job.is_active === false) ? 'default' : 'pointer',
                border: isApplied ? '1px solid #b2f2bb' : (job.is_active === false ? '1px solid #64748b' : 'none'),
                transition: 'all 0.2s ease'
              }}
            >
              {job.is_active === false ? (
                <>Closed</>
              ) : (
                isApplied ? (
                  <>
                    <Check size={18} /> {application?.status === 'Applied' ? 'Already Applied' : application?.status}
                  </>
                ) : (
                  <>
                    Apply Now <Upload size={18} />
                  </>
                )
              )}
            </button>
          </div>
          
          {isApplied && application?.notes && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff9db', borderRadius: '12px', border: '1px solid #ffe066' }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#e67700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> Recruiter Note
              </p>
              <p style={{ margin: '0.5rem 0 0', color: '#5c940d', fontSize: '1rem' }}>{application.notes}</p>
              {application.interviewDate && (
                 <p style={{ margin: '0.5rem 0 0', fontWeight: 600, color: '#1a1a1a' }}>
                   Scheduled for: {formatDateTime(application.interviewDate)}
                 </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Content Section */}
        <div className="job-details-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '2rem' }}>
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {/* About Role */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1.2rem', fontWeight: 600 }}>About the Role</h3>
              <p style={{ color: '#4a4a4a', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                {job.aboutContext}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1.2rem', fontWeight: 600 }}>Requirements</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {job.requirements.map((req: string, i: number) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#4a4a4a', lineHeight: 1.6, fontSize: '1.05rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c8102e', marginTop: '8px', flexShrink: 0 }}></div>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '1.2rem', fontWeight: 600 }}>Required Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                  {job.skills.map((skill: string, index: number) => (
                    <span key={index} style={{ fontSize: '0.9rem', background: '#f8f9fa', color: '#4a4a4a', border: '1px solid #e9ecef', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 500 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Summary */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '1.5rem', fontWeight: 600 }}>Job Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <p style={{ color: '#868e96', fontSize: '0.85rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Experience Level</p>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '1.05rem' }}>{job.experience}</p>
                </div>
                <div>
                  <p style={{ color: '#868e96', fontSize: '0.85rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Job Type</p>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '1.05rem' }}>{job.type}</p>
                </div>
                <div>
                  <p style={{ color: '#868e96', fontSize: '0.85rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Salary</p>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '1.05rem' }}>{job.salary || 'Not Disclosed'}</p>
                </div>
              </div>

              <div style={{ marginTop: '2rem', borderTop: '1px solid #e9ecef', paddingTop: '1.5rem' }}>
                <p style={{ color: '#6c757d', fontSize: '0.9rem', textAlign: 'center' }}>
                  Not the right fit?
                </p>
                <Link to="/jobs" style={{ display: 'block', textAlign: 'center', color: '#c8102e', fontWeight: 600, marginTop: '0.5rem', textDecoration: 'none' }}>
                  View more jobs
                </Link>
              </div>
            </div>
            
          </motion.div>
        </div>
      </div>

      <StatusModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        showConfirmOnly={modalConfig.showConfirmOnly}
        onConfirm={modalConfig.onConfirm}
      />

      {job && (
        <ApplicationFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          type="job"
          itemTitle={job.title}
          itemSubtitle={`${job.company} • ${job.location}`}
          jobSkills={job.skills || job.requirements}
          jobDetails={job}
          onSubmit={async (formData: ApplicationProfileData) => {
            const res = await applicationsApi.applyForJob({
              job_id: job.id,
              ...formData,
            });
            if (res.success) {
              setIsApplied(true);
              setIsFormModalOpen(false);
              setModalConfig({
                isOpen: true,
                type: 'success',
                title: 'Application Successful!',
                message: 'Your application and profile details have been securely recorded. You can track this in "My Applications".',
                confirmText: 'View Dashboard',
                showConfirmOnly: true,
                onConfirm: () => navigate('/jobs/applications')
              });
            } else {
              throw new Error(res.message || 'Failed to submit application');
            }
          }}
        />
      )}
    </div>
  );
};

export default JobDetails;
