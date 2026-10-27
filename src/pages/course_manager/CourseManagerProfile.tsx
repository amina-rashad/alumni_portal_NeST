import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Save, Check, Mail, Phone, MapPin, 
  Briefcase, Building2, Linkedin, Sparkles, 
  Camera, ShieldCheck, CheckCircle2, Loader2, BookOpen
} from 'lucide-react';
import { usersApi, getUser } from '../../services/api';
import toast from 'react-hot-toast';

const CourseManagerProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State initialized to empty strings (NO hardcoded fake values)
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    department: '',
    location: '',
    hiringFocus: '',
    linkedin: '',
    bio: '',
    profilePicture: ''
  });

  // Account metadata from DB (read-only, used for badges)
  const [accountMeta, setAccountMeta] = useState({
    role: '',
    isActive: false,
    isEmailVerified: false
  });

  // Load real profile from database on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await usersApi.getProfile();
        if (res.success && res.data?.user) {
          const u = res.data.user;
          setFormData({
            fullName: u.full_name || '',
            title: u.title || '',
            email: u.email || '',
            phone: u.phone || '',
            department: u.department || '',
            location: u.location || '',
            hiringFocus: u.hiring_focus || '',
            linkedin: u.linkedin_url || '',
            bio: u.bio || '',
            profilePicture: u.profile_picture || ''
          });
          setAccountMeta({
            role: u.role || '',
            isActive: u.is_active !== false,
            isEmailVerified: !!u.is_email_verified
          });
        } else {
          const cached = getUser() as any;
          if (cached) {
            setFormData(prev => ({
              ...prev,
              fullName: cached.full_name || cached.name || '',
              email: cached.email || '',
              phone: cached.phone || '',
              title: cached.title || '',
              department: cached.department || '',
              profilePicture: cached.profile_picture || ''
            }));
            setAccountMeta(prev => ({ ...prev, role: cached.role || '' }));
          }
        }
      } catch (err) {
        console.error('Failed to load profile from database:', err);
        toast.error('Could not load profile from database');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle Profile Photo Upload
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Profile image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, profilePicture: base64 }));
      toast.success('Photo chosen. Click "Save Changes" to commit to database.');
    };
    reader.readAsDataURL(file);
  };

  // Save changes directly to MongoDB database
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload: Record<string, any> = {
        full_name: formData.fullName,
        phone: formData.phone,
        title: formData.title,
        department: formData.department,
        location: formData.location,
        hiring_focus: formData.hiringFocus,
        linkedin_url: formData.linkedin,
        bio: formData.bio
      };

      if (formData.profilePicture) {
        payload.profile_picture = formData.profilePicture;
      }

      const res = await usersApi.updateProfile(payload);
      if (res.success) {
        toast.success('Profile updated and saved to database!');
        setSaveSuccess(true);

        try {
          const cached = getUser() as any;
          if (cached) {
            const updated = {
              ...cached,
              name: formData.fullName,
              full_name: formData.fullName,
              phone: formData.phone,
              title: formData.title,
              department: formData.department,
              location: formData.location,
              profile_picture: formData.profilePicture || cached.profile_picture
            };
            localStorage.setItem('user', JSON.stringify(updated));
          }
        } catch (e) {
          console.warn('Failed to update local session cache:', e);
        }

        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        toast.error(res.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error saving profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for input styling
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: 600,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const initials = formData.fullName
    ? formData.fullName
        .split(' ')
        .map(n => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  const roleLabel = accountMeta.role
    .split('_')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const mutedText = '#94a3b8';
  const brandPrimary = '#233167';
  const brandRed = '#c8102e';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '48px', fontFamily: "'Inter', sans-serif" }}>
      {/* Hidden file input for photo upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePhotoChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* Top Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            color: '#1e293b', 
            margin: '0 0 6px 0', 
            letterSpacing: '-0.02em' 
          }}>
            Course Manager Profile Settings
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
            Manage your personal academic module profile and instructor presence synced directly with the database.
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving || isLoading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '12px 28px', 
            background: saveSuccess ? '#10b981' : (isSaving ? '#64748b' : brandRed), 
            border: 'none', 
            borderRadius: '14px', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: '14px',
            cursor: isSaving || isLoading ? 'wait' : 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '170px',
            justifyContent: 'center',
            boxShadow: saveSuccess ? '0 4px 15px rgba(16, 185, 129, 0.3)' : '0 4px 15px rgba(200, 16, 46, 0.25)'
          }}
        >
          {isSaving ? (
            <><Loader2 size={18} className="animate-spin" /> Saving to DB...</>
          ) : saveSuccess ? (
            <><Check size={18} /> Profile Saved</>
          ) : (
            <><Save size={18} /> Save Changes</>
          )}
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 0', color: '#64748b', gap: '12px' }}>
          <Loader2 size={24} className="animate-spin" color={brandPrimary} />
          <span style={{ fontSize: '16px', fontWeight: 600 }}>Loading profile details from database...</span>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(300px, 340px) 1fr', 
          gap: '32px', 
          alignItems: 'start' 
        }}>
          
          {/* Left Column: Live Profile Card Preview */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            {/* Header Banner */}
            <div style={{
              height: '110px',
              background: 'linear-gradient(135deg, #1a2652 0%, #233167 60%, #c8102e 100%)',
              position: 'relative'
            }}>
              {accountMeta.isEmailVerified && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={14} /> Email Verified
                </div>
              )}
            </div>

            {/* Profile Details Container */}
            <div style={{ padding: '0 24px 24px 24px', textAlign: 'center' }}>
              {/* Avatar */}
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '-46px', marginBottom: '14px' }}>
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt={formData.fullName || 'Course Manager'}
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid #ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    background: brandPrimary,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 800,
                    border: '4px solid #ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {initials || <User size={36} />}
                  </div>
                )}
                <button 
                  type="button"
                  onClick={handlePhotoClick}
                  title="Upload / Change Photo"
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: brandRed,
                    border: '2px solid #ffffff',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  <Camera size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 800, color: formData.fullName ? '#1e293b' : mutedText, margin: '0 0 4px 0' }}>
                {formData.fullName || 'Name not added'}
              </h3>
              <p style={{ fontSize: '13px', color: formData.title ? '#64748b' : mutedText, margin: '0 0 16px 0', fontWeight: 600 }}>
                {formData.title || 'Title not added'}
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '100px',
                background: accountMeta.isActive ? '#f0fdf4' : '#fef2f2',
                color: accountMeta.isActive ? '#16a34a' : '#dc2626',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '20px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accountMeta.isActive ? '#16a34a' : '#dc2626' }} />
                {accountMeta.isActive ? 'Active' : 'Inactive'}{roleLabel ? ` · ${roleLabel}` : ' · Course Manager'}
              </div>

              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569' }}>
                  <Mail size={16} color={brandRed} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: formData.email ? '#475569' : mutedText }}>
                    {formData.email || 'No email registered'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569' }}>
                  <Phone size={16} color={brandRed} style={{ flexShrink: 0 }} />
                  <span style={{ color: formData.phone ? '#475569' : '#94a3b8' }}>
                    {formData.phone || 'No phone added'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569' }}>
                  <MapPin size={16} color={brandRed} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: formData.location ? '#475569' : '#94a3b8' }}>
                    {formData.location || 'Location not specified'}
                  </span>
                </div>
              </div>

              <div style={{
                marginTop: '20px',
                padding: '14px',
                borderRadius: '14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Specialization Focus
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: formData.hiringFocus ? '#1e293b' : mutedText }}>
                  {formData.hiringFocus || 'Academic Curriculum & Pedagogy'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Edit Form */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            padding: '36px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Section 1: Basic Information */}
              <div>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                    Profile Information
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                    Personal and academic details displayed on course listings, student communications, and certificates.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>
                      <User size={15} color={brandRed} /> Full Name
                    </label>
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={e => handleChange('fullName', e.target.value)}
                      placeholder="Enter full name" 
                      style={inputStyle} 
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      <Briefcase size={15} color={brandRed} /> Professional Title
                    </label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => handleChange('title', e.target.value)}
                      placeholder="e.g. Lead Academic Curriculum Specialist" 
                      style={inputStyle} 
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      <Mail size={15} color={brandRed} /> Work Email (Official NeST Group)
                    </label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      disabled
                      placeholder="manager@nestgroup.net" 
                      style={{ ...inputStyle, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }} 
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      <Phone size={15} color={brandRed} /> Contact Phone
                    </label>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => handleChange('phone', e.target.value)}
                      placeholder="e.g. +91 98765 43210" 
                      style={inputStyle} 
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Organization & Work Location */}
              <div>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                    Organization & Placement
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                    NeST Digital academic alignment, department branch, and regional coverage.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>
                      <Building2 size={15} color={brandRed} /> Department / Academic Unit
                    </label>
                    <input 
                      type="text" 
                      value={formData.department} 
                      onChange={e => handleChange('department', e.target.value)}
                      placeholder="e.g. Technical Training & Academic Excellence" 
                      style={inputStyle} 
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      <MapPin size={15} color={brandRed} /> Primary Work Location
                    </label>
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={e => handleChange('location', e.target.value)}
                      placeholder="e.g. NeST Digital - Infopark Kochi, Kerala" 
                      style={inputStyle} 
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      <Sparkles size={15} color={brandRed} /> Focus Areas / Curriculum Scope
                    </label>
                    <input 
                      type="text" 
                      value={formData.hiringFocus} 
                      onChange={e => handleChange('hiringFocus', e.target.value)}
                      placeholder="e.g. Full Stack Engineering, AI & Cloud Computing" 
                      style={inputStyle} 
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      <Linkedin size={15} color={brandRed} /> LinkedIn or Portfolio Profile
                    </label>
                    <input 
                      type="url" 
                      value={formData.linkedin} 
                      onChange={e => handleChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/username" 
                      style={inputStyle} 
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Professional Philosophy / Bio */}
              <div>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                    Instructor Bio & Academic Philosophy
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                    This biography is featured on your course portfolio headers and certificate verification credentials.
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>
                    Academic Philosophy / Department Overview
                  </label>
                  <textarea 
                    rows={4} 
                    value={formData.bio} 
                    onChange={e => handleChange('bio', e.target.value)}
                    placeholder="Share details about pedagogical methodologies, technical curriculum design, and learning impact..." 
                    style={{ 
                      ...inputStyle, 
                      lineHeight: '1.6', 
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }} 
                  />
                </div>
              </div>

              {/* Bottom Save Action */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                alignItems: 'center', 
                paddingTop: '16px', 
                borderTop: '1px solid #f1f5f9',
                gap: '14px' 
              }}>
                <AnimatePresence>
                  {saveSuccess && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={16} /> All profile changes saved successfully to database!
                    </motion.span>
                  )}
                </AnimatePresence>

                <button 
                  type="submit"
                  disabled={isSaving}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '12px 28px', 
                    background: saveSuccess ? '#10b981' : (isSaving ? '#64748b' : brandRed), 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    fontWeight: 700, 
                    fontSize: '14px',
                    cursor: isSaving ? 'wait' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: saveSuccess ? '0 4px 15px rgba(16, 185, 129, 0.3)' : '0 4px 15px rgba(200, 16, 46, 0.25)'
                  }}
                >
                  {isSaving ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving...</>
                  ) : saveSuccess ? (
                    <><Check size={18} /> Saved</>
                  ) : (
                    <><Save size={18} /> Save Profile</>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default CourseManagerProfile;
