import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Shield, Mail, Lock, User, Briefcase, 
  ChevronLeft, CheckCircle, ArrowLeft, Zap, Info, Phone
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

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

  const brandNavy = '#1a2652';
  const brandCrimson = '#c8102e';

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
        setTimeout(() => navigate('/admin/dashboard'), 2500);
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
    <div style={{ padding: '20px 40px 60px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        .onboarding-card {
          background: #ffffff;
          border-radius: 32px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
          overflow: hidden;
        }
        .form-input-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .luxury-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          outline: none;
          font-size: 15px;
          font-weight: 500;
          color: #1e293b;
          background: #f8fafc;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .luxury-input:focus {
          background: #fff;
          border-color: ${brandNavy};
          box-shadow: 0 0 0 4px rgba(26, 38, 82, 0.05);
        }
        .input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          transition: color 0.3s;
        }
        .luxury-input:focus + .input-icon {
          color: ${brandNavy};
        }
        .btn-initialize {
          width: 100%;
          padding: 20px;
          border-radius: 20px;
          border: none;
          background: ${brandNavy};
          color: #fff;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          display: flex;
          alignItems: center;
          justifyContent: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(26, 38, 82, 0.2);
        }
        .btn-initialize:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(26, 38, 82, 0.25);
          background: #0f172a;
        }
        .btn-initialize:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>

      {/* Navigation Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}
      >
        <button 
          onClick={() => navigate(-1)}
          style={{ background: '#fff', border: '1px solid #e2e8f0', width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = brandNavy}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <ArrowLeft size={20} color={brandNavy} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>Management Onboarding</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            <Shield size={14} /> Global Authorization Console
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            style={{ textAlign: 'center', padding: '120px 0', background: '#fff', borderRadius: '40px', border: '1px solid #f1f5f9' }}
          >
            <motion.div 
              initial={{ rotate: -20, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              style={{ width: '120px', height: '120px', background: '#f0fdf4', color: '#10b981', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px' }}
            >
              <CheckCircle size={64} />
            </motion.div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', margin: 0 }}>Authorization Synchronized</h2>
            <p style={{ color: '#64748b', marginTop: '16px', fontSize: '18px', fontWeight: 500, maxWidth: '500px', margin: '16px auto 0', lineHeight: 1.6 }}>
              The management account for <span style={{ color: brandNavy, fontWeight: 700 }}>{formData.full_name}</span> has been initialized across the network.
            </p>
            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ marginTop: '40px', color: brandNavy, fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Syncing system registries... <Zap size={16} fill={brandNavy} />
            </motion.div>
          </motion.div>
        ) : (
          <div className="onboarding-card">
            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr' }}>
              
              {/* Info Sidebar */}
              <div style={{ background: brandNavy, padding: '60px 40px', color: '#fff', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(to top, rgba(200, 16, 46, 0.1), transparent)', pointerEvents: 'none' }} />
                <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 20px 0', lineHeight: 1.2 }}>Privileged <br/>Access Initialization</h2>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '40px' }}>
                  Onboarding a new system administrator or department manager requires full validation of corporate identity.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={20} color="#f59e0b" />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800 }}>Instant Deployment</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Roles are active immediately upon initialization.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Shield size={20} color="#10b981" />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800 }}>Encrypted Sync</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Temporary passwords are hashed and secured.</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '80px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  Security Protocol v4.2.0
                </div>
              </div>

              {/* Form Content */}
              <div style={{ padding: '60px' }}>
                <form onSubmit={handleSubmit}>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', color: brandCrimson, fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                      <AlertCircle size={20} /> {error}
                    </motion.div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div className="form-input-container">
                      <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Full Legal Name</label>
                      <div style={{ position: 'relative' }}>
                        <input required type="text" placeholder="e.g. Alexander Pierce" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="luxury-input" />
                        <User className="input-icon" size={20} />
                      </div>
                    </div>

                    <div className="form-input-container">
                      <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Employee Identity (Emp ID)</label>
                      <div style={{ position: 'relative' }}>
                        <input required type="text" placeholder="e.g. NEST-2024-X" value={formData.emp_id} onChange={e => setFormData({...formData, emp_id: e.target.value})} className="luxury-input" />
                        <Shield className="input-icon" size={20} />
                      </div>
                    </div>

                    <div className="form-input-container">
                      <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Corporate Email</label>
                      <div style={{ position: 'relative' }}>
                        <input required type="email" placeholder="manager@nestdigital.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="luxury-input" />
                        <Mail className="input-icon" size={20} />
                      </div>
                    </div>

                    <div className="form-input-container">
                      <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Contact Extension</label>
                      <div style={{ position: 'relative' }}>
                        <input type="text" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="luxury-input" />
                        <Phone className="input-icon" size={20} />
                      </div>
                    </div>

                    <div className="form-input-container">
                      <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Operational Role</label>
                      <div style={{ position: 'relative' }}>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="luxury-input" style={{ cursor: 'pointer', appearance: 'none' }}>
                          <option value="job_recruiter">Job Recruiter (Talent Hub)</option>
                          <option value="event_manager">Event Manager (Engagements)</option>
                          <option value="course_manager">Course Manager (L&D)</option>
                          {isSuperAdmin && <option value="admin">Platform Admin (Full Access)</option>}
                        </select>
                        <Briefcase className="input-icon" size={20} />
                      </div>
                    </div>

                    <div className="form-input-container">
                      <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Access Key (Temp Password)</label>
                      <div style={{ position: 'relative' }}>
                        <input required type="text" placeholder="Set initial security key" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="luxury-input" />
                        <Lock className="input-icon" size={20} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '60px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button 
                      disabled={isLoading}
                      type="submit"
                      className="btn-initialize"
                    >
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%' }} />
                      ) : (
                        <><UserPlus size={22} /> Initialize Governance Account</>
                      )}
                    </button>
                    
                    <div style={{ flexShrink: 0, width: '200px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.4, fontWeight: 500 }}>
                      All manager initializations are logged and audited by System Security.
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal icon for alerts
const AlertCircle: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default AdminAddManager;
