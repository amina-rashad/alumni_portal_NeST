import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User as UserIcon, Book, Building, Phone, AlignLeft, ShieldCheck, CheckCircle2, FileText, UploadCloud, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usersApi, setUser, getUser, type AuthUser } from '../services/api';
import InlineResumeBuilder from './InlineResumeBuilder';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    batch: '',
    specialization: '',
    skills: '', // We'll store as comma separated string for simple editing
    resume_url: '',
    is_resume_created: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersApi.getProfile();
        const data = res.data as any;
        if (res.success && data && data.user) {
          const u = data.user;
          setFormData({
            full_name: u.full_name || '',
            bio: u.bio || '',
            phone: u.phone || '',
            batch: u.batch || '',
            specialization: u.specialization || '',
            skills: (u.skills || []).join(', '),
            resume_url: u.resume_url || '',
            is_resume_created: u.is_resume_created || false
          });
          if (u.resume_data) {
             setResumeData(u.resume_data);
          }
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData({ ...formData, resume_url: dataUrl, is_resume_created: false });
        setMessage({ type: 'success', text: `Resume "${file.name}" uploaded and ready to preview!` });
      };
      reader.readAsDataURL(file);
    }
  };

  const getAutofillData = () => ({
    fullName: formData.full_name || '',
    title: formData.specialization || '',
    phone: formData.phone || '',
    summary: formData.bio || '',
    experience: resumeData?.experience || '',
    projects: resumeData?.projects || '',
    education: resumeData?.education || '',
    certification: resumeData?.certification || '',
    email: resumeData?.email || '',
    address: resumeData?.address || '',
    portfolio: resumeData?.portfolio || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Format skills back to array
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      
      const updatePayload = {
        ...formData,
        skills: skillsArray,
        resume_data: resumeData || null
      };

      const res = await usersApi.updateProfile(updatePayload);
      const data = res.data as any;
      
      if (res.success && data && data.user) {
        setMessage({ type: 'success', text: 'Profile & Resume updated successfully!' });
        
        // Update local cached user softly to reflect new name in header
        const currentUser = getUser() as unknown as AuthUser;
        if (currentUser) {
          setUser({ ...currentUser, ...data.user });
        }
        
        setTimeout(() => {
          navigate('/profile');
        }, 800);
      } else {
        setMessage({ type: 'error', text: res.message || 'Update failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error while saving.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeAttach = (_file: File, data: any) => {
    setResumeData(data);
    setFormData({ ...formData, is_resume_created: true, resume_url: 'System Generated Resume' });
    setMessage({ type: 'success', text: 'Resume saved! Click "Save Profile Changes" to store it.' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Loading profile data...</p>
      </div>
    );
  }

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: '#64748b', textDecoration: 'none', marginRight: '1rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
          <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back
        </button>
        <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: 800 }}>Edit Profile</h1>
      </div>
      
      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
        
        {message.text && (
          <div style={{ 
            padding: '16px', marginBottom: '24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#16a34a' : '#ef4444',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            {message.type === 'success' ? <CheckCircle2 size={18}/> : <ShieldCheck size={18}/>}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserIcon size={16}/> Full Name</label>
            <input 
              name="full_name" value={formData.full_name} onChange={handleChange} required
              style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc', color: '#1e293b', outline: 'none', transition: '0.2s', fontWeight: 500 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building size={16}/> Department / Specialization</label>
              <input 
                name="specialization" value={formData.specialization} onChange={handleChange}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc', color: '#1e293b', outline: 'none', transition: '0.2s', fontWeight: 500 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Book size={16}/> Batch Year</label>
              <input 
                name="batch" value={formData.batch} onChange={handleChange}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc', color: '#1e293b', outline: 'none', transition: '0.2s', fontWeight: 500 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16}/> Contact Phone</label>
              <input 
                name="phone" value={formData.phone} onChange={handleChange}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc', color: '#1e293b', outline: 'none', transition: '0.2s', fontWeight: 500 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16}/> Skills (comma separated)</label>
              <input 
                name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Python, UI/UX"
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc', color: '#1e293b', outline: 'none', transition: '0.2s', fontWeight: 500 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlignLeft size={16}/> Professional Bio</label>
            <textarea 
              name="bio" value={formData.bio} onChange={handleChange} rows={4}
              placeholder="Tell the network about yourself, your career path, and what you are building..."
              style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc', color: '#1e293b', outline: 'none', resize: 'vertical', minHeight: '120px', lineHeight: 1.5, fontWeight: 500 }}
            />
          </div>

          {/* ── Resume Section ── */}
          <div style={{ 
            marginTop: '1rem', padding: '24px', borderRadius: '16px', 
            background: 'linear-gradient(to right, #f8fafc, #fff)', border: '1px solid #e2e8f0' 
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <FileText size={22} color="#c8102e" /> Professional Resume
                </h3>
                {formData.resume_url && (
                   <span style={{ fontSize: '12px', padding: '4px 12px', background: '#dcfce7', color: '#16a34a', borderRadius: '99px', fontWeight: 700 }}>
                      ✓ Resume Ready
                   </span>
                )}
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: showResumeBuilder ? '20px' : 0 }}>
                <div 
                   onClick={() => document.getElementById('resume-upload-profile')?.click()}
                   style={{ 
                      padding: '24px', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center',
                      cursor: 'pointer', transition: '0.2s', background: 'white'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c8102e'}
                   onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                   <UploadCloud size={28} color="#64748b" style={{ margin: '0 auto 12px' }} />
                   <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Upload PDF/Doc</div>
                   <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Max size 10MB</div>
                   <input 
                      id="resume-upload-profile" type="file" accept=".pdf,.doc,.docx" 
                      style={{ display: 'none' }} onChange={handleFileUpload} 
                   />
                </div>

                <div 
                   onClick={() => setShowResumeBuilder(prev => !prev)}
                   style={{ 
                      padding: '24px', border: `2px solid ${showResumeBuilder ? '#c8102e' : '#e2e8f0'}`, borderRadius: '12px', textAlign: 'center',
                      cursor: 'pointer', transition: '0.2s', background: showResumeBuilder ? '#fff1f1' : 'white'
                   }}
                   onMouseEnter={(e) => { if (!showResumeBuilder) e.currentTarget.style.borderColor = '#0f172a'; }}
                   onMouseLeave={(e) => { if (!showResumeBuilder) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                   <Plus size={28} color={showResumeBuilder ? '#c8102e' : '#64748b'} style={{ margin: '0 auto 12px' }} />
                   <div style={{ fontSize: '14px', fontWeight: 700, color: showResumeBuilder ? '#c8102e' : '#1e293b' }}>{formData.is_resume_created ? 'Edit Created Resume' : 'Create Resume Online'}</div>
                   <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{showResumeBuilder ? 'Click to collapse' : 'Automated Form Builder'}</div>
                </div>
             </div>

             {/* Inline Resume Builder — same as ApplyJob page */}
             {showResumeBuilder && (
               <InlineResumeBuilder
                 onAttach={handleResumeAttach}
                 initialData={resumeData || getAutofillData()}
                 buttonText="Save Resume"
               />
             )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '14px 28px', 
                background: '#0f172a', color: 'white', border: 'none', borderRadius: '999px',
                fontSize: '1rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1, transition: '0.3s'
              }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      </div>
    </motion.div>
    </>
  );
};

export default EditProfile;
