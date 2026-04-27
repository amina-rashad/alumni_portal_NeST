import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Shield, Mail, Lock, User, Briefcase, ChevronLeft, CheckCircle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const nestNavy = '#1a2652';

const AdminAddManager: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser.role === 'super_admin';

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'job_recruiter',
    phone: '',
    emp_id: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await adminApi.createUser({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        user_type: 'Staff',
        phone: formData.phone,
        emp_id: formData.emp_id,
        is_active: true
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      } else {
        setError(res.message || 'Failed to create manager account.');
      }
    } catch (err) {
      setError('A system error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '100px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', marginBottom: '32px', fontSize: '14px', transition: 'color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.color = nestNavy}
        onMouseOut={e => e.currentTarget.style.color = '#64748b'}
      >
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      <div style={{ background: '#fff', borderRadius: '40px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}>
        
        {/* Banner Header */}
        <div style={{ background: `linear-gradient(135deg, ${nestNavy} 0%, #0f172a 100%)`, padding: '60px 48px', textAlign: 'center', color: '#fff' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <UserPlus size={40} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>Create Manager Account</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '12px', fontSize: '16px', maxWidth: '500px', margin: '12px auto 0' }}>
            Initialize a new administrative staff member with secure platform privileges and unique employee identification.
          </p>
        </div>

        <div style={{ padding: '60px' }}>
          <AnimatePresence>
            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '100px', height: '100px', background: '#f0fdf4', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                  <CheckCircle size={56} />
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#166534', margin: 0 }}>Onboarding Successful</h2>
                <p style={{ color: '#64748b', marginTop: '12px', fontSize: '16px' }}>The manager's account has been synchronized. Returning to dashboard...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                
                {error && (
                  <div style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', color: '#991b1b', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield size={20} /> {error}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  
                  {/* Employee Identity Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>Personal Identity</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input required type="text" placeholder="e.g. John Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee ID (Emp ID)</label>
                      <div style={{ position: 'relative' }}>
                        <Shield size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input required type="text" placeholder="e.g. NEST-2024-001" value={formData.emp_id} onChange={e => setFormData({...formData, emp_id: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Number</label>
                      <input type="text" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ ...inputStyle, paddingLeft: '20px' }} />
                    </div>
                  </div>

                  {/* System Access Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>System Access</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Corporate Email</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input required type="email" placeholder="manager@nestdigital.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Role</label>
                      <div style={{ position: 'relative' }}>
                        <Briefcase size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ ...inputStyle, cursor: 'pointer', background: '#fff' }}>
                          <option value="job_recruiter">Job Recruiter</option>
                          <option value="event_manager">Event Manager</option>
                          <option value="course_manager">Course Manager</option>
                          {isSuperAdmin && <option value="admin">Platform Admin</option>}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Temporary Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input required type="text" placeholder="Set initial security key" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
                  <button 
                    disabled={isLoading}
                    type="submit"
                    style={{ 
                      width: '100%', padding: '20px', borderRadius: '20px', border: 'none', 
                      background: isLoading ? '#94a3b8' : nestNavy, color: '#fff', fontWeight: 800, fontSize: '16px',
                      cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
                      boxShadow: isLoading ? 'none' : '0 15px 30px rgba(26, 38, 82, 0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                    }}
                  >
                    {isLoading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <UserPlus size={20} /> Initialize Manager Account
                      </>
                    )}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
                    <Shield size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Secure system initialization. Onboarding will be logged for audit.
                  </p>
                </div>

              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%', 
  padding: '16px 16px 16px 48px', 
  borderRadius: '16px', 
  border: '1.5px solid #e2e8f0', 
  outline: 'none', 
  fontSize: '15px', 
  color: '#1e293b', 
  boxSizing: 'border-box',
  transition: 'all 0.2s',
  background: '#fcfcfc'
};

export default AdminAddManager;
