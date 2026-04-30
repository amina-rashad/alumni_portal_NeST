import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CloudUpload as UploadCloud, CircleCheckBig as CheckCircle2, CircleAlert as AlertCircle, MapPin, Building, Briefcase, FileText, Pencil as PenBox } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { jobsApi, applicationsApi, usersApi } from '../services/api';
import InlineResumeBuilder from './InlineResumeBuilder';
import StatusModal from '../components/StatusModal';

// Simple mock data for context
const JOB_CONTEXT: Record<string, any> = {
  '1': { title: 'Senior Full Stack Developer', department: 'Engineering', location: 'Kochi, Kerala (Hybrid)', type: 'Full-time' },
  '2': { title: 'Lead UX/UI Designer', department: 'Design', location: 'Trivandrum, Kerala (On-site)', type: 'Full-time' },
  '3': { title: 'Cloud Infrastructure Architect', department: 'IT Infrastructure', location: 'Remote', type: 'Contract' },
  '4': { title: 'Product Manager', department: 'Product', location: 'Dubai, UAE (On-site)', type: 'Full-time' },
  '5': { title: 'Frontend React Developer', department: 'Engineering', location: 'Kochi, Kerala (Hybrid)', type: 'Full-time' },
  '6': { title: 'Data Scientist', department: 'Data & Analytics', location: 'Remote', type: 'Full-time' }
};

const ApplyJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    coverLetter: ''
  });

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
  
  const [resumeOption, setResumeOption] = useState<'profile' | 'upload' | 'build'>('upload');


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchJob = async () => {
      if (!id) return;

      // Fallback for mock IDs
      if (id.includes('-') || id.length < 5) {
        setJob(JOB_CONTEXT[id] || JOB_CONTEXT['1']);
        setLoading(false);
        return;
      }

      const res = await jobsApi.getJobById(id);
      if (res.success && res.data && (res.data as any).job) {
        setJob((res.data as any).job);
      } else {
        setJob(JOB_CONTEXT['1']);
      }
      setLoading(false);
    };

    const fetchUserProfile = async () => {
      try {
        const res = await usersApi.getProfile();
        if (res.success && res.data) {
          const profile = (res.data as any).profile || res.data;
          setUserProfile({
            fullName: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            title: profile.headline || profile.job_title || 'Alumnus',
            email: profile.email,
            phone: profile.phone_number || '',
            address: profile.location || '',
            summary: profile.bio || '',
            experience: profile.experience || [],
            education: profile.education || [],
            certificates: profile.certificates || [],
            portfolio: profile.portfolio_url || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile for resume:", err);
      }
    };

    fetchJob();
    fetchUserProfile();
  }, [id]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setModalConfig({
      isOpen: true,
      type: 'info',
      title: 'Submit Application?',
      message: `Are you sure you want to submit your application for the ${job?.title || 'this'} position?`,
      confirmText: 'Yes, Submit Now',
      showConfirmOnly: false,
      onConfirm: () => handleConfirmSubmit()
    });
  };

  const handleConfirmSubmit = async () => {
    if (!id) return;
    setIsSubmitting(true);
    setModalConfig(prev => ({ ...prev, isOpen: false }));

    try {
      const res = await applicationsApi.applyForJob({
        job_id: id,
        cover_letter: formData.coverLetter,
        resume_url: resumeFile ? `mock_url/${resumeFile.name}` : '' 
      });

      if (res.success) {
        setModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Application Successful!',
          message: 'Your application has been received. You can track its status in your dashboard.',
          confirmText: 'View My Applications',
          showConfirmOnly: true,
          onConfirm: () => navigate('/applications')
        });
      } else {
        setModalConfig({
          isOpen: true,
          type: 'error',
          title: 'Submission Failed',
          message: res.message || 'We could not submit your application at this time.',
          confirmText: 'Try Again',
          showConfirmOnly: true,
          onConfirm: undefined
        });
      }
    } catch (err) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Network Error',
        message: 'A connection error occurred. Please try again.',
        confirmText: 'Okay',
        showConfirmOnly: true,
        onConfirm: undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f1f3f5', borderTopColor: '#c8102e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <p style={{ color: '#6c757d' }}>Job not found.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '4rem 2rem', background: '#f8f9fa', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header & Back Nav */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to={`/jobs/${id}`}
            style={{ display: 'inline-flex', alignItems: 'center', color: '#666666', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.3s', marginBottom: '2rem' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#666666'; }}
          >
            <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Job Details
          </Link>

          <h1 style={{ fontSize: '2.5rem', color: '#1a1a1a', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Apply for this Role</h1>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>Submit your application for the {job.title} role.</p>
        </div>

        {/* Job Context Snippet */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', border: '1px solid #e9ecef', marginBottom: '3rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
        >
          <div>
            <p style={{ color: '#868e96', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '0.3rem' }}>Role</p>
            <p style={{ color: '#1a1a1a', fontWeight: 600 }}>{job.title}</p>
          </div>
          <div>
            <p style={{ color: '#868e96', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '0.3rem' }}>Department</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4a4a4a', fontWeight: 500 }}>
              <Building size={16} color="var(--primary)" /> {job.department}
            </div>
          </div>
          <div>
            <p style={{ color: '#868e96', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '0.3rem' }}>Location</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4a4a4a', fontWeight: 500 }}>
              <MapPin size={16} color="var(--primary)" /> {job.location}
            </div>
          </div>
          <div>
            <p style={{ color: '#868e96', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '0.3rem' }}>Type</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4a4a4a', fontWeight: 500 }}>
              <Briefcase size={16} color="var(--primary)" /> {job.type}
            </div>
          </div>
        </motion.div>

        {/* Application Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          style={{ background: '#ffffff', borderRadius: '20px', padding: '3rem', border: '1px solid #e9ecef', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}
        >

          <div style={{ background: '#f8f9fa', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e9ecef', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>JD</div>
              <div>
                <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.95rem' }}>Use Alumni Profile Data?</p>
                <p style={{ color: '#6c757d', fontSize: '0.8rem' }}>Auto-fill fields from your verified NeST profile</p>
              </div>
            </div>
            <button type="button" style={{ background: '#ffffff', border: '1px solid #ced4da', padding: '0.5rem 1rem', borderRadius: '6px', color: '#4a4a4a', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f3f5'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}>
              Auto-fill
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>First Name *</label>
              <input type="text" required placeholder="Jane" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>Last Name *</label>
              <input type="text" required placeholder="Doe" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>Email Address *</label>
              <input type="email" required placeholder="jane.doe@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>Phone Number *</label>
              <input type="tel" required placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2.5rem' }}>
            <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>LinkedIn Profile URL (Optional)</label>
            <input type="url" placeholder="https://linkedin.com/in/janedoe" value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
          </div>

          <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '1.5rem', fontWeight: 600 }}>Resume Options</h3>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem', display: 'block', marginBottom: '1rem' }}>Choose Resume Option *</label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setResumeOption('profile')}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: `2px solid ${resumeOption === 'profile' ? 'var(--primary)' : '#e9ecef'}`,
                    background: resumeOption === 'profile' ? '#fff1f1' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <FileText size={24} color={resumeOption === 'profile' ? 'var(--primary)' : '#6c757d'} />
                  <span style={{ fontWeight: 600, color: resumeOption === 'profile' ? 'var(--primary)' : '#4a4a4a', fontSize: '0.95rem' }}>Use Profile Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResumeOption('upload')}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: `2px solid ${resumeOption === 'upload' ? 'var(--primary)' : '#e9ecef'}`,
                    background: resumeOption === 'upload' ? '#fff1f1' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <UploadCloud size={24} color={resumeOption === 'upload' ? 'var(--primary)' : '#6c757d'} />
                  <span style={{ fontWeight: 600, color: resumeOption === 'upload' ? 'var(--primary)' : '#4a4a4a', fontSize: '0.95rem' }}>Upload New File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResumeOption('build')}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: `2px solid ${resumeOption === 'build' ? 'var(--primary)' : '#e9ecef'}`,
                    background: resumeOption === 'build' ? '#fff1f1' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <PenBox size={24} color={resumeOption === 'build' ? 'var(--primary)' : '#6c757d'} />
                  <span style={{ fontWeight: 600, color: resumeOption === 'build' ? 'var(--primary)' : '#4a4a4a', fontSize: '0.95rem' }}>Create New Resume</span>
                </button>
              </div>

              {resumeOption === 'profile' && (
                <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.8rem', background: '#e3fbee', borderRadius: '8px' }}>
                    <CheckCircle2 size={24} color="#2b8a3e" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '0.2rem' }}>Jane_Doe_Resume_Current.pdf</p>
                    <p style={{ color: '#6c757d', fontSize: '0.85rem' }}>Attached from your verified Profile</p>
                  </div>
                </div>
              )}

              {resumeOption === 'upload' && (
                <div
                  style={{
                    border: '2px dashed #ced4da',
                    borderRadius: '12px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.3s, border-color 0.3s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f3f5'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#ced4da'; }}
                >
                  <input
                    type="file"
                    required={resumeOption === 'upload' && !resumeFile}
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  {!resumeFile ? (
                    <>
                      <UploadCloud size={40} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
                      <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.3rem' }}>Click to upload or drag and drop</p>
                      <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>PDF, DOCX up to 5MB</p>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                      <CheckCircle2 size={24} color="#2b8a3e" />
                      <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '1.05rem' }}>{resumeFile.name}</p>
                    </div>
                  )}
                </div>
              )}

              {resumeOption === 'build' && (
                <InlineResumeBuilder 
                  initialData={userProfile}
                  onAttach={(file, data) => setResumeFile(file)} 
                />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? '#e9ecef' : 'var(--primary)',
                color: isSubmitting ? '#adb5bd' : 'white',
                padding: '1.2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = 'var(--primary-hover)'; }}
              onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = 'var(--primary)'; }}
            >
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: '#adb5bd', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Submitting Application...
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
            <p style={{ color: '#6c757d', fontSize: '0.85rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <AlertCircle size={14} /> By applying, you agree to our Candidate Privacy Policy.
            </p>
          </div>

        </motion.form>
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ApplyJob;
