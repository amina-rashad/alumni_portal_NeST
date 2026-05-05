import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Briefcase, Clock, Building, CheckCircle2, Star, Share2, Upload, Check } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

// Comprehensive mock data covering the jobs from JobListings
import { jobsApi, applicationsApi } from '../services/api';
import StatusModal from '../components/StatusModal';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<any>(null);
  const [isApplied, setIsApplied] = useState(false);

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
            postedAt: apiJob.createdAt ? new Date(apiJob.createdAt).toLocaleDateString() : 'Recently',
            salary: apiJob.salary || 'Not Disclosed',
            aboutContext: apiJob.description || 'No description provided.',
            responsibilities: apiJob.responsibilities || [
              'No specific responsibilities listed.',
              'Collaborate with cross-functional teams.',
              'Participate in code reviews.'
            ],
            requirements: apiJob.requirements || [],
            skills: apiJob.skills_required || [],
            urgent: apiJob.is_urgent
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
          const userApp = apps.find((app: any) => app.job_id === id);
          if (userApp) {
            setIsApplied(true);
            setApplication(userApp);
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
    setModalConfig({
      isOpen: true,
      type: 'info',
      title: 'Submit Application?',
      message: `Are you sure you want to apply for the ${job.title} role?`,
      confirmText: 'Yes, Submit Application',
      showConfirmOnly: false,
      onConfirm: () => handleConfirmApply()
    });
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
    <div style={{ minHeight: '100vh', padding: '1rem 0', background: '#f8f9fa', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <button onClick={() => navigate('/jobs')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', border: 'none', background: 'transparent', color: '#4a4a4a', fontWeight: 600, cursor: 'pointer' }}>
            <ArrowLeft size={20} /> Back to Jobs
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: '#ffffff', borderRadius: '16px', padding: '3rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e9ecef', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}
        >
          {job.urgent && (
            <div style={{ position: 'absolute', top: '1.5rem', right: '-2.5rem', background: '#c8102e', color: 'white', padding: '0.4rem 3rem', transform: 'rotate(45deg)', fontSize: '0.8rem', fontWeight: 700 }}>
              URGENT MATCH
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#f8f9fa', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="https://media.licdn.com/dms/image/C560BAQGNt2PXXs_WkQ/company-logo_200_200/0/1630656715690/nest_software_logo?e=2147483647&v=beta&t=GkMvL3fQ2zIq805g8A6iU21Nkx1bYwR7y5sL_V0zHwM" alt="NeST" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
            </div>
            <div>
              <span style={{ color: '#c8102e', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{job.department}</span>
              <h1 style={{ fontSize: '2.5rem', color: '#1a1a1a', margin: '0.5rem 0 1rem 0', fontWeight: 800 }}>{job.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#6c757d', fontSize: '1rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building size={18} /> {job.company}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} /> {job.location}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={18} /> {job.experience}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e9ecef', paddingTop: '2rem' }}>
            <div>
              <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Posted {job.postedAt}</p>
              {isApplied && application && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0f4ff', padding: '0.4rem 0.8rem', borderRadius: '6px', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} /> Status: {application.status}
                </div>
              )}
            </div>
            <button 
              onClick={handleApply}
              disabled={isApplied}
              style={{
                background: isApplied ? '#e3fbee' : '#c8102e',
                color: isApplied ? '#2b8a3e' : 'white',
                padding: '1rem 3rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: isApplied ? 'default' : 'pointer',
                border: isApplied ? '1px solid #b2f2bb' : 'none'
              }}
            >
              {isApplied ? (
                <>
                  <Check size={18} /> {application?.status === 'Applied' ? 'Already Applied' : application?.status}
                </>
              ) : (
                <>
                  Apply Now <Upload size={18} />
                </>
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
                   Scheduled for: {new Date(application.interviewDate).toLocaleDateString()}
                 </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Content Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
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

            {/* Responsibilities */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1.2rem', fontWeight: 600 }}>Key Responsibilities</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {job.responsibilities.map((req: string, i: number) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#4a4a4a', lineHeight: 1.6, fontSize: '1.05rem' }}>
                    <CheckCircle2 color="#c8102e" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
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
                  <p style={{ color: '#868e96', fontSize: '0.85rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Department</p>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '1.05rem' }}>{job.department}</p>
                </div>
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
    </div>
  </div>
  );
};

export default JobDetails;
