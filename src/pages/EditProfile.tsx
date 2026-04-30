import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, User as UserIcon, Book, Building, 
  Phone, AlignLeft, ShieldCheck, CheckCircle2, 
  FileText, UploadCloud, Edit3, X, Upload, Camera, Briefcase, Award, GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usersApi, setUser, getUser, type AuthUser } from '../services/api';
import { AnimatePresence, motion } from 'framer-motion';
import InlineResumeBuilder from './InlineResumeBuilder';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resumeOption, setResumeOption] = useState('upload'); // 'upload', 'create'
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    batch: '',
    specialization: '',
    skills: '',
    status: 'none', // 'open_to_work', 'hiring', 'none'
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    portfolio_url: ''
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<{id: string, name: string, url: string, issuer: string, date: string, type: 'uploaded' | 'portal'}[]>([]);
  const [experience, setExperience] = useState<{id: string, role: string, company: string, type: string, duration: string, description?: string}[]>([]);
  const [education, setEducation] = useState<{id: string, degree: string, school: string, year: string}[]>([]);

  // Overlay state for adding items
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'experience' | 'education' | 'certificate'>('none');
  const [overlayData, setOverlayData] = useState<any>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersApi.getProfile();
        const data = res.data as any;
        if (res.success && data && data.user) {
          const u = data.user;
          setFormData(prev => ({
            ...prev,
            full_name: u.full_name || '',
            bio: u.bio || '',
            phone: u.phone || '',
            batch: u.batch || '',
            specialization: u.specialization || '',
            skills: Array.isArray(u.skills) ? u.skills.join(', ') : '',
            status: u.status || 'none',
            linkedin_url: u.linkedin_url || '',
            github_url: u.github_url || '',
            twitter_url: u.twitter_url || '',
            portfolio_url: u.portfolio_url || ''
          }));
          setProfilePicture(u.profile_picture || null);
          setExperience(u.experience || []);
          setEducation(u.education || []);
          setCertificates(u.certificates || []);
        } else {
          // Mock data fallback if guest
          const u = getUser() as any;
          if (u) {
            setFormData(prev => ({
              ...prev,
              full_name: u.full_name || 'Melbin',
              bio: u.bio || '',
              phone: u.phone || '+91 98765 43210',
              batch: u.batch || '2023',
              specialization: u.specialization || 'Software Engineer',
              skills: Array.isArray(u.skills) ? u.skills.join(', ') : 'React, TypeScript',
              status: u.status || 'open_to_work'
            }));
            setProfilePicture(u.profile_picture || null);
            setCertificates(u.certificates || [
              { id: '1', name: 'Cloud Architecture Professional', issuer: 'NeST Learning Portal', date: 'Oct 2023', url: '#', type: 'portal' },
              { id: '2', name: 'React Advanced Patterns', issuer: 'Meta', date: 'Jan 2024', url: '#', type: 'uploaded' }
            ]);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (resumeOption === 'create' && !resumeData) {
        setMessage({ type: 'error', text: "Please click 'Attach as PDF' inside the resume builder before saving." });
        setSaving(false);
        return;
      }

      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      const updatePayload: any = { 
        ...formData, 
        skills: skillsArray,
        profile_picture: profilePicture,
        certificates: certificates,
        experience: experience,
        education: education
      };

      if (resumeFile) {
        const fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(resumeFile);
        });
        updatePayload.resume_url = fileData;
      }

      if (resumeOption === 'create') {
        updatePayload.is_resume_created = true;
        if (resumeData) updatePayload.resume_data = resumeData;
      } else {
        updatePayload.is_resume_created = false;
        // If they uploaded a new file, it overwrites the old resume_data flag
      }

      const currentUser = getUser() as any;
      if (currentUser) {
        setUser({ ...currentUser, ...updatePayload });
      }

      const res = await usersApi.updateProfile(updatePayload);
      
      if (res.success && res.data) {
        const data = res.data as any;
        const updatedUser = data.user;
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Update local storage
        const currentUser = getUser() as any;
        if (currentUser) {
          setUser({ ...currentUser, ...updatedUser });
        }
        
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        setMessage({ 
          type: 'error', 
          text: res.message || 'Failed to update profile. Please try again.' 
        });
      }
    } catch (err) {
      console.error("Submit Error:", err);
      setMessage({ type: 'error', text: 'An unexpected error occurred while saving.' });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    background: '#f8fafc',
    color: '#1e293b',
    outline: 'none',
    transition: 'all 0.2s',
    fontWeight: 500,
    marginTop: '8px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: 700,
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#c8102e', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto', fontFamily: '"Montserrat", sans-serif' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: 800 }}>Edit Profile</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Update your professional identity and contact details</p>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#1a2652', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' }}
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px', marginBottom: '24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#16a34a' : '#ef4444', border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
            {message.type === 'success' ? <CheckCircle2 size={18}/> : <ShieldCheck size={18}/>}
            {message.text}
          </motion.div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Profile Picture & Status Section */}
          <section style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', paddingBottom: '32px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '32px', 
                background: '#f8fafc', 
                border: '2px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={48} color="#94a3b8" />
                )}
                <div 
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                >
                  <Camera size={24} color="white" />
                </div>
              </div>
              <input 
                id="photo-upload"
                type="file" 
                accept="image/*"
                style={{ display: 'none' }} 
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onloadend = () => setProfilePicture(reader.result as string);
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
              <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>Profile Photo</p>
            </div>

            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}><Briefcase size={16} color="#c8102e"/> Profile Status</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                {[
                  { id: 'none', label: 'None', color: '#64748b' },
                  { id: 'open_to_work', label: 'Open to Work', color: '#16a34a' },
                  { id: 'hiring', label: 'Hiring', color: '#0284c7' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: opt.id })}
                    style={{ 
                      padding: '10px 18px', 
                      borderRadius: '10px', 
                      border: `2px solid ${formData.status === opt.id ? opt.color : '#e2e8f0'}`,
                      background: formData.status === opt.id ? `${opt.color}10` : 'white',
                      color: formData.status === opt.id ? opt.color : '#64748b',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#94a3b8' }}>This will be visible on your profile card to other alumni and recruiters.</p>
            </div>
          </section>

          {/* Personal Identity Section */}
          <section>
            <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 800, color: '#1e293b', borderLeft: '4px solid #c8102e', paddingLeft: '12px' }}>Personal Identity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={labelStyle}><UserIcon size={16} color="#c8102e"/> Full Name</label>
                <input name="full_name" value={formData.full_name} onChange={handleChange} style={inputStyle} placeholder="Your full name" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}><Building size={16} color="#c8102e"/> Specialization</label>
                  <input name="specialization" value={formData.specialization} onChange={handleChange} style={inputStyle} placeholder="e.g. Software Engineer" />
                </div>
                <div>
                  <label style={labelStyle}><Book size={16} color="#c8102e"/> Batch Year</label>
                  <input name="batch" value={formData.batch} onChange={handleChange} style={inputStyle} placeholder="e.g. 2023" />
                </div>
              </div>
            </div>
          </section>

          {/* Professional Bio section */}
          <section>
            <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 800, color: '#1e293b', borderLeft: '4px solid #c8102e', paddingLeft: '12px' }}>About You</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={labelStyle}><AlignLeft size={16} color="#c8102e"/> Professional Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={5} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} placeholder="Write a short professional summary..." />
              </div>
              <div>
                <label style={labelStyle}><CheckCircle2 size={16} color="#c8102e"/> Skills (Comma separated)</label>
                <input name="skills" value={formData.skills} onChange={handleChange} style={inputStyle} placeholder="React, TypeScript, Node.js..." />
              </div>
            </div>
          </section>

          {/* Experience Section */}
          <section>
            <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 800, color: '#1e293b', borderLeft: '4px solid #c8102e', paddingLeft: '12px' }}>Experience</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {experience.map((exp) => (
                <div key={exp.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', position: 'relative' }}>
                  <button onClick={() => setExperience(experience.filter(e => e.id !== exp.id))} style={{ position: 'absolute', top: '12px', right: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{exp.role}</h4>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748b' }}>{exp.company} • {exp.type}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{exp.duration}</p>
                </div>
              ))}
            </div>
            <button 
              type="button"
              onClick={() => {
                setOverlayData({ role: '', company: '', duration: '', type: 'Full-time' });
                setActiveOverlay('experience');
              }}
              style={{ padding: '10px 20px', background: 'white', border: '1px solid #c8102e', color: '#c8102e', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Briefcase size={16} /> Add Experience
            </button>
          </section>

          {/* Education Section */}
          <section>
            <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 800, color: '#1e293b', borderLeft: '4px solid #c8102e', paddingLeft: '12px' }}>Education</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', position: 'relative' }}>
                  <button onClick={() => setEducation(education.filter(e => e.id !== edu.id))} style={{ position: 'absolute', top: '12px', right: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{edu.degree}</h4>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748b' }}>{edu.school}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Class of {edu.year}</p>
                </div>
              ))}
            </div>
            <button 
              type="button"
              onClick={() => {
                setOverlayData({ degree: '', school: '', year: '' });
                setActiveOverlay('education');
              }}
              style={{ padding: '10px 20px', background: 'white', border: '1px solid #c8102e', color: '#c8102e', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <GraduationCap size={16} /> Add Education
            </button>
          </section>

          {/* Social Links Section */}
          <section>
            <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 800, color: '#1e293b', borderLeft: '4px solid #c8102e', paddingLeft: '12px' }}>Social Profiles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>LinkedIn URL</label>
                <input name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} style={inputStyle} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label style={labelStyle}>GitHub URL</label>
                <input name="github_url" value={formData.github_url} onChange={handleChange} style={inputStyle} placeholder="https://github.com/..." />
              </div>
              <div>
                <label style={labelStyle}>Twitter URL</label>
                <input name="twitter_url" value={formData.twitter_url} onChange={handleChange} style={inputStyle} placeholder="https://twitter.com/..." />
              </div>
              <div>
                <label style={labelStyle}>Portfolio URL</label>
                <input name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} style={inputStyle} placeholder="https://yourportfolio.com" />
              </div>
            </div>
          </section>

          {/* Contact & Verification Section */}
          <section>
            <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 800, color: '#1e293b', borderLeft: '4px solid #c8102e', paddingLeft: '12px' }}>Contact & Verification</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}><Phone size={16} color="#c8102e"/> Mobile Number</label>
                <input name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <ShieldCheck size={20} color="#64748b" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                  Your email address and employee ID are verified and cannot be changed directly. Please contact HR for updates.
                </p>
              </div>
            </div>
          </section>

          {/* Resume Options Section */}
          <section>
            <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 800, color: '#1e293b', borderLeft: '4px solid #c8102e', paddingLeft: '12px' }}>Resume Managed</h3>
            <p style={{ margin: '8px 0 20px', fontSize: '14px', color: '#64748b' }}>Choose Resume Option *</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {[
                { id: 'upload', label: 'Upload New File', icon: <UploadCloud size={24} /> },
                { id: 'create', label: 'Create New Resume', icon: <Edit3 size={24} /> }
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => setResumeOption(option.id)}
                  style={{
                    padding: '32px 20px',
                    borderRadius: '16px',
                    border: `2px solid ${resumeOption === option.id ? '#c8102e' : '#e2e8f0'}`,
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    textAlign: 'center',
                    boxShadow: resumeOption === option.id ? '0 8px 16px rgba(200, 16, 46, 0.08)' : 'none',
                    transform: resumeOption === option.id ? 'translateY(-2px)' : 'none'
                  }}
                >
                  <div style={{ 
                    color: resumeOption === option.id ? '#c8102e' : '#64748b',
                    transition: 'color 0.2s'
                  }}>
                    {option.icon}
                  </div>
                  <span style={{ 
                    fontSize: '15px', 
                    fontWeight: 700, 
                    color: resumeOption === option.id ? '#c8102e' : '#475569' 
                  }}>
                    {option.label}
                  </span>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {resumeOption === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    border: '2px dashed #c8102e',
                    borderRadius: '20px',
                    padding: '60px 40px',
                    textAlign: 'center',
                    background: '#fcfcfc',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff1f1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fcfcfc'; e.currentTarget.style.transform = 'none'; }}
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  {resumeFile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8102e' }}>
                        <FileText size={32} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{resumeFile.name}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                        style={{ marginTop: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#ef4444', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                        <Upload size={48} color="#c8102e" />
                      </div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Click to upload or drag and drop</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>PDF, DOCX up to 5MB</p>
                    </>
                  )}
                  <input 
                    id="resume-upload"
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setResumeFile(e.target.files[0]);
                      }
                    }}
                  />
                </motion.div>
              )}

              {resumeOption === 'create' && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <InlineResumeBuilder 
                    initialData={{
                      fullName: formData.full_name,
                      phone: formData.phone,
                      email: getUser()?.email || '',
                      address: formData.batch ? `Batch of ${formData.batch}` : '',
                      title: formData.specialization,
                      summary: formData.bio,
                      experience: experience,
                      education: education,
                      certificates: certificates,
                      portfolio: formData.portfolio_url
                    }}
                    onAttach={(file, data) => {
                      setResumeFile(file);
                      setResumeData(data);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
          {/* Certificates Section */}
          <section style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '17px', fontWeight: 800, color: '#1e293b', borderLeft: '4px solid #c8102e', paddingLeft: '12px' }}>Professional Certificates</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {certificates.map((cert) => (
                <div key={cert.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: cert.type === 'portal' ? '#fff1f1' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cert.type === 'portal' ? '#c8102e' : '#64748b' }}>
                      <Award size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{cert.name}</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>{cert.issuer} • {cert.date}</p>
                    </div>
                  </div>
                  {cert.type === 'uploaded' && (
                    <button 
                      onClick={() => setCertificates(certificates.filter(c => c.id !== cert.id))}
                      style={{ padding: '8px', color: '#ef4444', background: 'white', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                  {cert.type === 'portal' && (
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#c8102e', background: '#fff1f1', padding: '4px 8px', borderRadius: '6px' }}>PORTAL EARNED</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ padding: '24px', border: '2px dashed #e2e8f0', borderRadius: '20px', textAlign: 'center' }}>
              <Award size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>Add New Certificate</h4>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#94a3b8' }}>Upload certificates you've earned from other platforms</p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <input 
                  id="cert-upload"
                  type="file" 
                  accept=".pdf,image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setOverlayData({
                          name: file.name.split('.')[0],
                          issuer: '',
                          url: reader.result as string
                        });
                        setActiveOverlay('certificate');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button 
                  onClick={() => document.getElementById('cert-upload')?.click()}
                  style={{ padding: '10px 20px', background: 'white', border: '1px solid #c8102e', color: '#c8102e', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Upload size={16} /> Upload Certificate
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* --- ADD ITEM OVERLAYS --- */}
      <AnimatePresence>
        {activeOverlay !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setActiveOverlay('none')}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {activeOverlay === 'experience' && 'Add Experience'}
                  {activeOverlay === 'education' && 'Add Education'}
                  {activeOverlay === 'certificate' && 'Add Certificate'}
                </h3>
                <button onClick={() => setActiveOverlay('none')} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeOverlay === 'experience' && (
                  <>
                    <div>
                      <label style={labelStyle}>Role Name</label>
                      <input value={overlayData.role} onChange={e => setOverlayData({...overlayData, role: e.target.value})} style={inputStyle} placeholder="e.g. Senior Developer" />
                    </div>
                    <div>
                      <label style={labelStyle}>Company</label>
                      <input value={overlayData.company} onChange={e => setOverlayData({...overlayData, company: e.target.value})} style={inputStyle} placeholder="e.g. NeST Digital" />
                    </div>
                    <div>
                      <label style={labelStyle}>Duration</label>
                      <input value={overlayData.duration} onChange={e => setOverlayData({...overlayData, duration: e.target.value})} style={inputStyle} placeholder="e.g. Jan 2023 - Present" />
                    </div>
                  </>
                )}

                {activeOverlay === 'education' && (
                  <>
                    <div>
                      <label style={labelStyle}>Degree / Course</label>
                      <input value={overlayData.degree} onChange={e => setOverlayData({...overlayData, degree: e.target.value})} style={inputStyle} placeholder="e.g. B.Tech Computer Science" />
                    </div>
                    <div>
                      <label style={labelStyle}>School / University</label>
                      <input value={overlayData.school} onChange={e => setOverlayData({...overlayData, school: e.target.value})} style={inputStyle} placeholder="e.g. KTU University" />
                    </div>
                    <div>
                      <label style={labelStyle}>Graduation Year</label>
                      <input value={overlayData.year} onChange={e => setOverlayData({...overlayData, year: e.target.value})} style={inputStyle} placeholder="e.g. 2023" />
                    </div>
                  </>
                )}

                {activeOverlay === 'certificate' && (
                  <>
                    <div>
                      <label style={labelStyle}>Certificate Name</label>
                      <input value={overlayData.name} onChange={e => setOverlayData({...overlayData, name: e.target.value})} style={inputStyle} placeholder="e.g. AWS Solutions Architect" />
                    </div>
                    <div>
                      <label style={labelStyle}>Issuing Organization</label>
                      <input value={overlayData.issuer} onChange={e => setOverlayData({...overlayData, issuer: e.target.value})} style={inputStyle} placeholder="e.g. Amazon Web Services" />
                    </div>
                  </>
                )}

                <button 
                  onClick={() => {
                    if (activeOverlay === 'experience') {
                      setExperience([...experience, { ...overlayData, id: Math.random().toString(36).substr(2, 9) }]);
                    } else if (activeOverlay === 'education') {
                      setEducation([...education, { ...overlayData, id: Math.random().toString(36).substr(2, 9) }]);
                    } else if (activeOverlay === 'certificate') {
                      setCertificates([...certificates, { 
                        ...overlayData, 
                        id: Math.random().toString(36).substr(2, 9), 
                        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                        type: 'uploaded'
                      }]);
                    }
                    setActiveOverlay('none');
                  }}
                  style={{ marginTop: '12px', width: '100%', padding: '14px', background: '#1a2652', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Add to Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EditProfile;
