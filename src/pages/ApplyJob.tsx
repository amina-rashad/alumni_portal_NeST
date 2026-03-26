import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UploadCloud, CheckCircle2, AlertCircle, MapPin, Building, Briefcase } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

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
  const job = id && JOB_CONTEXT[id] ? JOB_CONTEXT[id] : JOB_CONTEXT['1'];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', padding: '4rem 2rem', background: '#f8f9fa', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: '#ffffff', padding: '4rem', borderRadius: '24px', textAlign: 'center', maxWidth: '600px', width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e9ecef' }}
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ display: 'inline-flex', background: '#e3fbee', padding: '1.5rem', borderRadius: '50%', marginBottom: '2rem' }}
          >
            <CheckCircle2 size={64} color="#2b8a3e" />
          </motion.div>
          <h2 style={{ fontSize: '2.5rem', color: '#1a1a1a', marginBottom: '1rem', fontFamily: 'Playfair Display, serif' }}>Application Sent!</h2>
          <p style={{ color: '#4a4a4a', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Thank you for applying for the <strong>{job.title}</strong> role at NeST Digital. Our talent team will review your alumni profile and application closely and reach out soon.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/jobs/applications')}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
            >
              View My Applications
            </button>
            <button 
              onClick={() => navigate('/jobs')}
              style={{ background: '#ffffff', color: '#4a4a4a', border: '1px solid #ced4da', padding: '1rem 2.5rem', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#adb5bd'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#ced4da'; }}
            >
              Browse More Jobs
            </button>
          </div>
        </motion.div>
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
              <input type="text" required placeholder="Jane" style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>Last Name *</label>
              <input type="text" required placeholder="Doe" style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>Email Address *</label>
              <input type="email" required placeholder="jane.doe@example.com" style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>Phone Number *</label>
              <input type="tel" required placeholder="+91 98765 43210" style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2.5rem' }}>
            <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>LinkedIn Profile URL (Optional)</label>
            <input type="url" placeholder="https://linkedin.com/in/janedoe" style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
          </div>

          <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '1.5rem', fontWeight: 600 }}>Resume & Cover Letter</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>Resume / CV *</label>
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
                  required 
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
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#4a4a4a', fontSize: '0.9rem' }}>Cover Letter (Optional)</label>
              <textarea 
                rows={6} 
                placeholder="Briefly tell us why you're a great fit for this role..." 
                style={{ background: '#ffffff', color: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ced4da', outline: 'none', fontSize: '1rem', width: '100%', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} 
              />
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ApplyJob;
