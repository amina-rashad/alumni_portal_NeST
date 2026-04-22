import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Mail, Shield, Lock, Phone, ArrowLeft, Calendar, DollarSign, Save
} from 'lucide-react';
import { adminApi } from '../../services/api';
import nestIcon from '../../assets/nest_icon.png';

const AdminEditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    user_type: 'Alumni',
    role: 'user',
    is_active: true,
    batch: '',
    specialization: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setIsLoading(true);
      const res = await adminApi.getUserById(id);
      if (res.success && res.data) {
        setFormData({
          full_name: res.data.user.full_name || '',
          email: res.data.user.email || '',
          phone: res.data.user.phone || '',
          user_type: res.data.user.user_type || 'Alumni',
          role: res.data.user.role || 'user',
          is_active: res.data.user.is_active !== false,
          batch: res.data.user.batch || '',
          specialization: res.data.user.specialization || ''
        });
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    
    const res = await adminApi.updateUser(id, formData);
    if (res.success) {
      setPopupMessage({ type: 'success', text: 'User profile has been updated successfully.' });
      setShowPopup(true);
    } else {
      setPopupMessage({ type: 'error', text: res.message || 'Failed to update user profile.' });
      setShowPopup(true);
    }
    setIsSubmitting(false);
  };

  const nestNavy = '#1a2652';

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: nestNavy }}>
        <p>Loading user details...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      <AnimatePresence>
        {showPopup && (
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
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: '#c8102e' }} />
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={nestIcon} alt="NeST" style={{ height: '44px', objectFit: 'contain' }} />
                </div>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                {popupMessage.type === 'success' ? 'Success!' : 'Update Failed'}
              </h2>
              
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5', marginBottom: '24px' }}>
                {popupMessage.text}
              </p>

              <button 
                onClick={() => {
                  setShowPopup(false);
                  if (popupMessage.type === 'success') navigate('/admin/users');
                }}
                style={{ 
                  width: '100%', 
                  padding: '12px 24px', 
                  background: '#0f172a', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  fontSize: '0.95rem', 
                  fontWeight: 700, 
                  cursor: 'pointer'
                }}
              >
                {popupMessage.type === 'success' ? 'Continue' : 'Try Again'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/admin/users')}
          style={{ 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Edit User</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section: Basic Details */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <Mail size={18} color="#475569" /> Basic Details
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Full Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Enter full name" 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    fontSize: '14px', 
                    color: '#1e293b',
                    background: '#fff',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }} 
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Email Address</label>
                <input 
                  required 
                  type="email" 
                  readOnly 
                  value={formData.email} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    fontSize: '14px', 
                    color: '#64748b', 
                    background: '#f8fafc',
                    cursor: 'not-allowed'
                  }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="Enter phone number" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    fontSize: '14px', 
                    color: '#1e293b',
                    background: '#fff'
                  }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Batch</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2024" 
                  value={formData.batch} 
                  onChange={e => setFormData({...formData, batch: e.target.value})} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    fontSize: '14px', 
                    color: '#1e293b',
                    background: '#fff'
                  }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Specialization</label>
                <input 
                  type="text" 
                  placeholder="e.g. Computer Science" 
                  value={formData.specialization} 
                  onChange={e => setFormData({...formData, specialization: e.target.value})} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    fontSize: '14px', 
                    color: '#1e293b',
                    background: '#fff'
                  }} 
                />
              </div>

            </div>
          </div>

          {/* Section: Account Configuration */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <Shield size={18} color="#475569" /> Account Configuration
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Identity</label>
                <select 
                  value={formData.user_type} 
                  onChange={e => setFormData({...formData, user_type: e.target.value})} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    fontSize: '14px', 
                    color: '#1e293b',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Alumni">Alumni</option>
                  <option value="Intern">Intern</option>
                  <option value="Industrial Student">IV Student</option>
                  <option value="Staff">Staff</option>
                  <option value="Trainee">Trainee</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>System Role</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    fontSize: '14px', 
                    color: '#1e293b',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Account Status</label>
                <select 
                  value={formData.is_active ? 'Active' : 'Inactive'} 
                  onChange={e => setFormData({...formData, is_active: e.target.value === 'Active'})} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none', 
                    fontSize: '14px', 
                    color: formData.is_active ? '#10b981' : '#ef4444', 
                    fontWeight: 600,
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button type="button" onClick={() => navigate('/admin/users')} style={{ padding: '12px 28px', borderRadius: '8px', background: '#fff', color: '#475569', fontWeight: 700, border: '1px solid #cbd5e1', cursor: 'pointer' }}>
              Cancel
            </button>
            <button disabled={isSubmitting} type="submit" style={{ padding: '12px 28px', borderRadius: '8px', background: nestNavy, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
              <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminEditUser;
