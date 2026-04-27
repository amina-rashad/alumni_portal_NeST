import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, User as UserIcon, Book, Building, Phone, AlignLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usersApi, setUser, getUser, type AuthUser } from '../services/api';
import nestIcon from '../assets/nest_icon.png';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPopup, setShowPopup] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    batch: '',
    specialization: '',
    skills: '' // We'll store as comma separated string for simple editing
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
            skills: (u.skills || []).join(', ')
          });
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
        skills: skillsArray
      };

      const res = await usersApi.updateProfile(updatePayload);
      const data = res.data as any;
      
      if (res.success && data && data.user) {
        setMessage({ type: 'success', text: 'Your profile has been updated successfully.' });
        setShowPopup(true);
        
        // Update local cached user softly to reflect new name in header
        const currentUser = getUser() as unknown as AuthUser;
        if (currentUser) {
          setUser({ ...currentUser, ...data.user });
        }
      } else {
        setMessage({ type: 'error', text: res.message || 'We encountered an error while updating your profile.' });
        setShowPopup(true);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection issue. Please try again.' });
      setShowPopup(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Loading profile data...</p>
      </div>
    );
  }

  return (
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
        
      <AnimatePresence>
        {showPopup && message.text && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ 
                background: '#fff', 
                width: '360px', 
                borderRadius: '20px', 
                padding: '32px', 
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Branding Strip at Top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: '#c8102e' }} />
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={nestIcon} alt="NeST" style={{ height: '44px', objectFit: 'contain' }} />
                </div>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                {message.type === 'success' ? 'Success!' : 'Update Failed'}
              </h2>
              
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5', marginBottom: '24px' }}>
                {message.text}
              </p>

              <button 
                onClick={() => setShowPopup(false)}
                style={{ 
                  width: '100%', 
                  padding: '12px 24px', 
                  background: '#0f172a', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  fontSize: '0.95rem', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
  );
};

export default EditProfile;
