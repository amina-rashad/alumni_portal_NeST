import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Mail, Shield, Phone, ArrowLeft, Banknote, AlertCircle, Calendar,
  GraduationCap, BookOpen, School, CheckCircle2, Loader2
} from 'lucide-react';
import { adminApi, getUser } from '../../services/api';
import nestIcon from '../../assets/nest_icon.png';
import {
  validateEmail,
  validateName,
  validatePhone,
  validateSalary,
  validateDate
} from '../../utils/validation';

const AdminAddUser: React.FC = () => {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  // Check if the current logged-in user is a Super Admin
  const currentUser = getUser();
  const isSuperAdmin = currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'superadmin');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    salary: '',
    joining_date: '',
    batch: '',
    specialization: '',
    college: '',
    role: 'Alumni',
    status: 'Active / Verified'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formAlert, setFormAlert] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ type: '', text: '' });

  // Real-time email uniqueness check against backend
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
          const msg = res.data.message || 'This email is already registered in the system. Duplicate emails are not allowed.';
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

  // Field validation logic
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'first_name':
        return validateName(value, 'First name', 2, 50, true);
      case 'last_name':
        return validateName(value, 'Last name', 1, 50, true);
      case 'email':
        return validateEmail(value, true);
      case 'phone':
        return validatePhone(value, false);
      case 'salary':
        return validateSalary(value);
      case 'joining_date':
        return validateDate(value, 'Joining date', false);
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formAlert) setFormAlert('');
    if (field === 'email') {
      setEmailAvailable(null);
    }

    // If already touched, validate live
    if (touched[field]) {
      const errorMsg = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleBlur = async (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, (formData as any)[field] || '');
    setErrors(prev => ({ ...prev, [field]: errorMsg }));

    if (field === 'email' && !errorMsg) {
      await checkEmailAvailability(formData.email);
    }
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof (dateInputRef.current as any).showPicker === 'function') {
        (dateInputRef.current as any).showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    if (!isoVal) return;
    const [yyyy, mm, dd] = isoVal.split('-');
    const formatted = `${dd}/${mm}/${yyyy}`;
    handleFieldChange('joining_date', formatted);
    setTouched(prev => ({ ...prev, joining_date: true }));
    const errorMsg = validateField('joining_date', formatted);
    setErrors(prev => ({ ...prev, joining_date: errorMsg }));
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {
      first_name: validateField('first_name', formData.first_name),
      last_name: validateField('last_name', formData.last_name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      salary: validateField('salary', formData.salary),
      joining_date: validateField('joining_date', formData.joining_date)
    };

    setErrors(newErrors);
    setTouched({
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      salary: true,
      joining_date: true
    });

    const hasError = Object.values(newErrors).some(err => Boolean(err));
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormAlert('');

    if (!validateAll()) {
      setFormAlert('Please fix the errors in the highlighted fields before submitting.');
      return;
    }

    // Verify email duplicate before submission
    const isUnique = await checkEmailAvailability(formData.email);
    if (!isUnique) {
      setFormAlert('Please use a unique email address. The entered email is already registered.');
      return;
    }

    setIsSubmitting(true);

    // Auto-generate a secure random password to satisfy backend validation
    // since the portal uses passwordless OTP login.
    const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';

    const apiPayload = {
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      salary: formData.salary.trim(),
      joining_date: formData.joining_date.trim(),
      batch: formData.batch.trim() || 'N/A',
      specialization: formData.specialization.trim() || 'N/A',
      college: formData.college.trim() || 'N/A',
      role: formData.role.toLowerCase() === 'system admin' ? 'admin' : 'user',
      user_type: formData.role,
      password: randomPassword
    };

    const res = await adminApi.createUser(apiPayload);
    if (res.success) {
      setPopupMessage({ type: 'success', text: 'New user account has been created successfully.' });
      setShowPopup(true);
    } else {
      setPopupMessage({ type: 'error', text: res.message || 'Failed to create user account.' });
      setShowPopup(true);
    }
    setIsSubmitting(false);
  };

  const nestNavy = '#1a2652';

  const getInputStyle = (field: string, hasIconPadding = false) => {
    const isInvalid = touched[field] && Boolean(errors[field]);
    return {
      padding: hasIconPadding ? '12px 16px 12px 42px' : '12px 16px',
      borderRadius: '8px',
      border: `1px solid ${isInvalid ? '#ef4444' : '#e2e8f0'}`,
      backgroundColor: isInvalid ? '#fef2f2' : '#fff',
      outline: 'none',
      fontSize: '14px',
      color: '#1e293b',
      width: '100%',
      boxSizing: 'border-box' as const,
      transition: 'all 0.2s ease-in-out'
    };
  };

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
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: popupMessage.type === 'success' ? '#10b981' : '#c8102e' }} />

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={nestIcon} alt="NeST" style={{ height: '44px', objectFit: 'contain' }} />
                </div>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                {popupMessage.type === 'success' ? 'User Created!' : 'Action Failed'}
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
                  background: nestNavy,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/admin/users')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            color: '#64748b', 
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Create User</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
        
        {/* Top Info Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#f1f5f9', color: '#475569', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Add New User</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>Configure verified account details and assign platform roles for a new user.</p>
          </div>
        </div>

        {formAlert && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '10px', color: '#b91c1c', fontSize: '14px', marginBottom: '24px', fontWeight: 500 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{formAlert}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={18} color={nestNavy} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Basic Details</span>
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              {/* First Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                    First Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formData.first_name.length}/50</span>
                </div>
                <input 
                  type="text" 
                  placeholder="Enter first name" 
                  value={formData.first_name} 
                  onChange={e => handleFieldChange('first_name', e.target.value)} 
                  onBlur={() => handleBlur('first_name')}
                  style={getInputStyle('first_name')} 
                />
                {touched.first_name && errors.first_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px' }}>
                    <AlertCircle size={13} /> {errors.first_name}
                  </div>
                )}
              </div>
              
              {/* Last Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                    Last Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formData.last_name.length}/50</span>
                </div>
                <input 
                  type="text" 
                  placeholder="Enter last name" 
                  value={formData.last_name} 
                  onChange={e => handleFieldChange('last_name', e.target.value)} 
                  onBlur={() => handleBlur('last_name')}
                  style={getInputStyle('last_name')} 
                />
                {touched.last_name && errors.last_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px' }}>
                    <AlertCircle size={13} /> {errors.last_name}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  {isCheckingEmail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#3b82f6', fontWeight: 600 }}>
                      <Loader2 size={12} className="animate-spin" /> Verifying uniqueness...
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: touched.email && errors.email ? '#ef4444' : (emailAvailable ? '#16a34a' : '#94a3b8'), display: 'flex' }}>
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="user@nestgroup.net" 
                    value={formData.email} 
                    onChange={e => handleFieldChange('email', e.target.value)} 
                    onBlur={() => handleBlur('email')}
                    style={getInputStyle('email', true)} 
                  />
                  {emailAvailable && !errors.email && (
                    <div style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', color: '#16a34a', display: 'flex' }}>
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
                {touched.email && errors.email ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                    <AlertCircle size={13} /> {errors.email}
                  </div>
                ) : emailAvailable && !errors.email ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>
                    <CheckCircle2 size={13} /> Email is available and verified unique.
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    This email will receive login OTPs and system notifications. Must be unique across all portal users and staff.
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: touched.phone && errors.phone ? '#ef4444' : '#94a3b8', display: 'flex' }}>
                    <Phone size={16} />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    value={formData.phone} 
                    onChange={e => handleFieldChange('phone', e.target.value)} 
                    onBlur={() => handleBlur('phone')}
                    style={getInputStyle('phone', true)} 
                  />
                </div>
                {touched.phone && errors.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px' }}>
                    <AlertCircle size={13} /> {errors.phone}
                  </div>
                )}
              </div>

              {/* Salary / Stipend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Salary / Stipend</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: touched.salary && errors.salary ? '#ef4444' : '#94a3b8', display: 'flex' }}>
                    <Banknote size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. 25,000" 
                    value={formData.salary} 
                    onChange={e => handleFieldChange('salary', e.target.value)} 
                    onBlur={() => handleBlur('salary')}
                    style={getInputStyle('salary', true)} 
                  />
                </div>
                {touched.salary && errors.salary && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px' }}>
                    <AlertCircle size={13} /> {errors.salary}
                  </div>
                )}
              </div>

              {/* Joining Date (DD/MM/YYYY) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Joining Date</label>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>DD/MM/YYYY</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={openDatePicker}
                    style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: touched.joining_date && errors.joining_date ? '#ef4444' : '#94a3b8', display: 'flex', cursor: 'pointer' }}
                  >
                    <Calendar size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="DD/MM/YYYY" 
                    value={formData.joining_date} 
                    onChange={e => handleFieldChange('joining_date', e.target.value)} 
                    onBlur={() => handleBlur('joining_date')}
                    style={getInputStyle('joining_date', true)} 
                  />
                  <button
                    type="button"
                    onClick={openDatePicker}
                    title="Select date"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '10px',
                      transform: 'translateY(-50%)',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Select
                  </button>
                  <input 
                    ref={dateInputRef}
                    type="date"
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '24px', height: '24px', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: -1 }}
                    onChange={handleNativeDateChange}
                    tabIndex={-1}
                  />
                </div>
                {touched.joining_date && errors.joining_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px' }}>
                    <AlertCircle size={13} /> {errors.joining_date}
                  </div>
                )}
              </div>

              {/* Assign Role (Moved into Basic Details) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                  Assign Role <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <Shield size={16} />
                  </div>
                  <select 
                    value={formData.role} 
                    onChange={e => handleFieldChange('role', e.target.value)} 
                    style={{ 
                      padding: '12px 16px 12px 42px', 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0', 
                      outline: 'none', 
                      fontSize: '14px', 
                      color: '#1e293b', 
                      background: '#fff', 
                      cursor: 'pointer',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Applicant">Applicant</option>
                    <option value="Alumni">Alumni</option>
                    {isSuperAdmin && <option value="System Admin">System Admin</option>}
                    <option value="Intern">Intern</option>
                    <option value="IV Student">IV Student</option>
                    <option value="Staff">Staff</option>
                    <option value="Trainee">Trainee</option>
                  </select>
                </div>
              </div>

              {/* Batch / Year (Matches Excel Template) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                  Batch / Year
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <GraduationCap size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. 2024 or 2022-2026" 
                    value={formData.batch} 
                    onChange={e => handleFieldChange('batch', e.target.value)} 
                    style={getInputStyle('batch', true)} 
                  />
                </div>
              </div>

              {/* Specialization / Department (Matches Excel Template) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                  Specialization / Department
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <BookOpen size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. Computer Science / Robotics" 
                    value={formData.specialization} 
                    onChange={e => handleFieldChange('specialization', e.target.value)} 
                    style={getInputStyle('specialization', true)} 
                  />
                </div>
              </div>

              {/* College / Institution Name (Matches Excel Template) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                  College / Institution Name
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <School size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. Model Engineering College / CET" 
                    value={formData.college} 
                    onChange={e => handleFieldChange('college', e.target.value)} 
                    style={getInputStyle('college', true)} 
                  />
                </div>
              </div>

            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px -24px -32px -24px', padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button 
              type="button" 
              onClick={() => navigate('/admin/users')} 
              style={{ 
                padding: '12px 28px', 
                borderRadius: '8px', 
                background: '#fff', 
                color: '#475569', 
                fontWeight: 700, 
                border: '1px solid #cbd5e1', 
                cursor: 'pointer', 
                fontSize: '14px' 
              }}
            >
              Cancel
            </button>
            <button 
              disabled={isSubmitting} 
              type="submit" 
              style={{ 
                padding: '12px 28px', 
                borderRadius: '8px', 
                background: nestNavy, 
                color: '#fff', 
                fontWeight: 700, 
                border: 'none', 
                cursor: 'pointer', 
                opacity: isSubmitting ? 0.7 : 1, 
                fontSize: '14px', 
                boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminAddUser;
