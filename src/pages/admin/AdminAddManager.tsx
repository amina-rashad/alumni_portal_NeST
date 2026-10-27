import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Shield, Mail, Lock, User, Briefcase, 
  ChevronLeft, CheckCircle, ArrowLeft, Zap, Info, Phone, AlertCircle, Loader2
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { validateEmail, validateName, validatePhone } from '../../utils/validation';

const AdminAddManager: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser.role === 'super_admin';

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'job_recruiter',
    phone: '',
    emp_id: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const brandNavy = '#1a2652';
  const brandCrimson = '#c8102e';

  // Real-time email uniqueness check
  const checkEmailAvailability = async (emailToTest: string): Promise<boolean> => {
    const cleanEmail = (emailToTest || '').trim().toLowerCase();
    if (!cleanEmail) {
      setEmailAvailable(null);
      return false;
    }
    const formatErr = validateEmail(cleanEmail, true);
    if (formatErr) {
      setErrors(prev => ({ ...prev, email: formatErr }));
      setEmailAvailable(false);
      return false;
    }

    setIsCheckingEmail(true);
    try {
      const res = await adminApi.checkEmailExists(cleanEmail);
      if (res.success && res.data) {
        if (res.data.exists) {
          const msg = res.data.message || 'This email is already in use by an existing user/manager. Duplicate emails are not allowed.';
          setErrors(prev => ({ ...prev, email: msg }));
          setEmailAvailable(false);
          return false;
        } else {
          setErrors(prev => {
            const next = { ...prev };
            delete next.email;
            return next;
          });
          setEmailAvailable(true);
          return true;
        }
      }
      return true;
    } catch (err) {
      console.error('Error verifying email availability:', err);
      return true;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'full_name':
        return validateName(value, 'Full legal name', 2, 80, true);
      case 'emp_id': {
        const clean = (value || '').trim();
        if (!clean) return 'Employee Identity (Emp ID) is required.';
        if (clean.length < 2) return 'Employee ID must be at least 2 characters.';
        if (clean.length > 30) return 'Employee ID cannot exceed 30 characters.';
        return '';
      }
      case 'email':
        return validateEmail(value, true);
      case 'phone':
        return validatePhone(value, false);
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (field === 'email') {
      setEmailAvailable(null);
    }

    if (touched[field]) {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = async (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, (formData as any)[field] || '');
    setErrors(prev => ({ ...prev, [field]: err }));

    if (field === 'email' && !err) {
      await checkEmailAvailability(formData.email);
    }
  };

  const validateAll = (): boolean => {
    const newErrors = {
      full_name: validateField('full_name', formData.full_name),
      emp_id: validateField('emp_id', formData.emp_id),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
    };

    setErrors(newErrors);
    setTouched({
      full_name: true,
      emp_id: true,
      email: true,
      phone: true,
    });

    return !Object.values(newErrors).some(err => Boolean(err));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateAll()) {
      setError('Please review and correct the invalid fields highlighted below.');
      return;
    }

    // Verify email duplicate before submission
    const isUnique = await checkEmailAvailability(formData.email);
    if (!isUnique) {
      setError('A user or manager with this email already exists. Duplicate emails are strictly prohibited.');
      return;
    }

    setIsLoading(true);

    // Auto-generate a secure random password to satisfy backend validation
    // since the portal uses passwordless OTP login.
    const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';

    try {
      const res = await adminApi.createUser({
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: randomPassword,
        role: formData.role,
        user_type: 'Staff',
        phone: formData.phone.trim(),
        emp_id: formData.emp_id.trim(),
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

  const isFieldInvalid = (field: string) => Boolean(touched[field] && errors[field]);

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
          gap: 8px;
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
          box-sizing: border-box;
        }
        .luxury-input:focus {
          background: #fff;
          border-color: ${brandNavy};
          box-shadow: 0 0 0 4px rgba(26, 38, 82, 0.05);
        }
        .luxury-input.input-error {
          border-color: #ef4444 !important;
          background-color: #fef2f2 !important;
        }
        .luxury-input.input-error:focus {
          border-color: #dc2626 !important;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
        }
        .input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          transition: color 0.3s;
          pointer-events: none;
        }
        .input-icon.icon-error {
          color: #ef4444 !important;
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
                <form onSubmit={handleSubmit} noValidate>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', color: brandCrimson, fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                      <AlertCircle size={20} /> {error}
                    </motion.div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    
                    {/* Full Legal Name */}
                    <div className="form-input-container">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          Full Legal Name <span style={{ color: brandCrimson }}>*</span>
                        </label>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{formData.full_name.length}/80</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text" 
                          placeholder="e.g. Alexander Pierce" 
                          value={formData.full_name} 
                          onChange={e => handleFieldChange('full_name', e.target.value)} 
                          onBlur={() => handleBlur('full_name')}
                          className={`luxury-input ${isFieldInvalid('full_name') ? 'input-error' : ''}`} 
                        />
                        <User className={`input-icon ${isFieldInvalid('full_name') ? 'icon-error' : ''}`} size={20} />
                      </div>
                      {isFieldInvalid('full_name') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                          <AlertCircle size={13} /> {errors.full_name}
                        </div>
                      )}
                    </div>

                    {/* Employee Identity */}
                    <div className="form-input-container">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          Employee Identity (Emp ID) <span style={{ color: brandCrimson }}>*</span>
                        </label>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{formData.emp_id.length}/30</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text" 
                          placeholder="e.g. NEST-2024-X" 
                          value={formData.emp_id} 
                          onChange={e => handleFieldChange('emp_id', e.target.value)} 
                          onBlur={() => handleBlur('emp_id')}
                          className={`luxury-input ${isFieldInvalid('emp_id') ? 'input-error' : ''}`} 
                        />
                        <Shield className={`input-icon ${isFieldInvalid('emp_id') ? 'icon-error' : ''}`} size={20} />
                      </div>
                      {isFieldInvalid('emp_id') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                          <AlertCircle size={13} /> {errors.emp_id}
                        </div>
                      )}
                    </div>

                    {/* Corporate Email */}
                    <div className="form-input-container">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          Corporate Email <span style={{ color: brandCrimson }}>*</span>
                        </label>
                        {isCheckingEmail && (
                          <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Loader2 size={12} className="animate-spin" /> Verifying uniqueness...
                          </span>
                        )}
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="email" 
                          placeholder="manager@nestdigital.com" 
                          value={formData.email} 
                          onChange={e => handleFieldChange('email', e.target.value)} 
                          onBlur={() => handleBlur('email')}
                          className={`luxury-input ${isFieldInvalid('email') ? 'input-error' : ''}`} 
                        />
                        <Mail className={`input-icon ${isFieldInvalid('email') ? 'icon-error' : ''}`} size={20} />
                        {emailAvailable && !errors.email && (
                          <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#16a34a', display: 'flex' }}>
                            <CheckCircle size={18} />
                          </div>
                        )}
                      </div>
                      {isFieldInvalid('email') ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                          <AlertCircle size={13} /> {errors.email}
                        </div>
                      ) : emailAvailable && !errors.email ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>
                          <CheckCircle size={13} /> Corporate email is verified unique and available.
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Official company email address. Must be unique across all users and system managers.
                        </div>
                      )}
                    </div>

                    {/* Contact Extension */}
                    <div className="form-input-container">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          Contact Extension / Phone
                        </label>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>7-15 digits</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="tel" 
                          placeholder="+91 98765 43210" 
                          value={formData.phone} 
                          onChange={e => handleFieldChange('phone', e.target.value)} 
                          onBlur={() => handleBlur('phone')}
                          className={`luxury-input ${isFieldInvalid('phone') ? 'input-error' : ''}`} 
                        />
                        <Phone className={`input-icon ${isFieldInvalid('phone') ? 'icon-error' : ''}`} size={20} />
                      </div>
                      {isFieldInvalid('phone') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                          <AlertCircle size={13} /> {errors.phone}
                        </div>
                      )}
                    </div>

                    {/* Operational Role */}
                    <div className="form-input-container" style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        Operational Role <span style={{ color: brandCrimson }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select 
                          value={formData.role} 
                          onChange={e => handleFieldChange('role', e.target.value)} 
                          className="luxury-input" 
                          style={{ cursor: 'pointer', appearance: 'none', background: '#fff' }}
                        >
                          <option value="job_recruiter">Recruiter</option>
                          <option value="event_manager">Event Manager</option>
                          <option value="course_manager">Course Manager</option>
                          {isSuperAdmin && <option value="admin">Platform Admin</option>}
                        </select>
                        <Briefcase className="input-icon" size={20} />
                      </div>
                    </div>

                  </div>

                  <div style={{ marginTop: '48px', display: 'flex', alignItems: 'center', gap: '24px' }}>
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
                    
                    <div style={{ flexShrink: 0, width: '240px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.4, fontWeight: 500 }}>
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

export default AdminAddManager;
