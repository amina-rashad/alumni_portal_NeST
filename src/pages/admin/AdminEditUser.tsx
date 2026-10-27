import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Mail, Shield, Phone, ArrowLeft, Banknote, Calendar, AlertCircle
} from 'lucide-react';
import { adminApi, getUser } from '../../services/api';
import nestIcon from '../../assets/nest_icon.png';
import {
  validateName,
  validatePhone,
  validateSalary,
  validateDate,
  validateLength
} from '../../utils/validation';

const AdminEditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Check if current user is Super Admin
  const currentUser = getUser();
  const isSuperAdmin = currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'superadmin');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    salary: '',
    joining_date: '',
    role: 'Alumni',
    is_active: true,
    batch: '',
    specialization: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formAlert, setFormAlert] = useState<string>('');
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
        const user = (res.data as any).user || {};

        // Split full name into first and last name
        const rawName = (user.full_name || '').trim();
        const spaceIdx = rawName.indexOf(' ');
        let fName = rawName;
        let lName = '';
        if (spaceIdx > 0) {
          fName = rawName.substring(0, spaceIdx);
          lName = rawName.substring(spaceIdx + 1).trim();
        }

        // Format joining date to DD/MM/YYYY if ISO format
        let jDate = user.joining_date || '';
        if (jDate && /^\d{4}-\d{2}-\d{2}/.test(jDate)) {
          const [yyyy, mm, dd] = jDate.substring(0, 10).split('-');
          jDate = `${dd}/${mm}/${yyyy}`;
        }

        // Determine initial role
        let initialRole = user.user_type || 'Applicant';
        if (user.role === 'admin' || user.role === 'super_admin' || user.user_type === 'System Admin') {
          initialRole = 'System Admin';
        }

        setFormData({
          first_name: fName,
          last_name: lName,
          email: user.email || '',
          phone: user.phone || '',
          salary: user.salary ? String(user.salary) : '',
          joining_date: jDate,
          role: initialRole,
          is_active: user.is_active !== false,
          batch: user.batch === 'N/A' ? '' : (user.batch || ''),
          specialization: user.specialization === 'N/A' ? '' : (user.specialization || '')
        });
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [id]);

  // Field validation logic matching AdminAddUser
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'first_name':
        return validateName(value, 'First name', 2, 50, true);
      case 'last_name':
        return validateName(value, 'Last name', 1, 50, true);
      case 'phone':
        return validatePhone(value, false);
      case 'salary':
        return validateSalary(value);
      case 'joining_date':
        return validateDate(value, 'Joining date', false);
      case 'batch':
        return validateLength(value, 0, 30, 'Batch');
      case 'specialization':
        return validateLength(value, 0, 60, 'Specialization');
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formAlert) setFormAlert('');

    // If touched, validate live
    if (touched[field]) {
      const errorMsg = validateField(field, String(value));
      setErrors(prev => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, (formData as any)[field] || '');
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
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
      phone: validateField('phone', formData.phone),
      salary: validateField('salary', formData.salary),
      joining_date: validateField('joining_date', formData.joining_date),
      batch: validateField('batch', formData.batch),
      specialization: validateField('specialization', formData.specialization)
    };

    setErrors(newErrors);
    setTouched({
      first_name: true,
      last_name: true,
      phone: true,
      salary: true,
      joining_date: true,
      batch: true,
      specialization: true
    });

    return !Object.values(newErrors).some(err => Boolean(err));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setFormAlert('');

    if (!validateAll()) {
      setFormAlert('Please fix the errors in the highlighted fields before saving.');
      return;
    }

    setIsSubmitting(true);

    const isSystemAdmin = formData.role.toLowerCase() === 'system admin';
    const updatePayload = {
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      phone: formData.phone.trim(),
      salary: formData.salary.trim(),
      joining_date: formData.joining_date.trim(),
      role: isSystemAdmin ? 'admin' : 'user',
      user_type: formData.role,
      is_active: formData.is_active,
      batch: formData.batch.trim() || 'N/A',
      specialization: formData.specialization.trim() || 'N/A'
    };

    const res = await adminApi.updateUser(id, updatePayload);
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
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: popupMessage.type === 'success' ? '#10b981' : '#c8102e' }} />

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={nestIcon} alt="NeST" style={{ height: '44px', objectFit: 'contain' }} />
                </div>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                {popupMessage.type === 'success' ? 'Profile Updated!' : 'Action Failed'}
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
                Done
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
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Edit User Profile</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>

        {/* Top Info Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#f8fafc', color: nestNavy, padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Modify Account Settings</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>Update identities, roles, academic details, and portal accessibility.</p>
          </div>
        </div>

        {formAlert && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '10px', color: '#b91c1c', fontSize: '14px', marginBottom: '24px', fontWeight: 500 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{formAlert}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Unified Basic Details Card */}
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

              {/* Email Address (Permanent) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                  Email Address (Permanent)
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    readOnly 
                    value={formData.email} 
                    style={{ 
                      padding: '12px 16px 12px 42px', 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0', 
                      outline: 'none', 
                      fontSize: '14px', 
                      color: '#64748b', 
                      background: '#f1f5f9',
                      cursor: 'not-allowed',
                      width: '100%',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Permanent identifier associated with this user account across the portal.
                </div>
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

              {/* Assign Role (Integrated into Basic Details) */}
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
                    {formData.role === 'Industrial Student' && <option value="Industrial Student">Industrial Student</option>}
                    <option value="Staff">Staff</option>
                    <option value="Trainee">Trainee</option>
                  </select>
                </div>
              </div>

              {/* Account Status (Active / Inactive) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                  Account Status <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_active: true }))}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '8px',
                      border: formData.is_active ? '2px solid #16a34a' : '1px solid #e2e8f0',
                      background: formData.is_active ? '#dcfce7' : '#f8fafc',
                      color: formData.is_active ? '#16a34a' : '#64748b',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: formData.is_active ? '#16a34a' : '#94a3b8' }} />
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_active: false }))}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '8px',
                      border: !formData.is_active ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      background: !formData.is_active ? '#fee2e2' : '#f8fafc',
                      color: !formData.is_active ? '#ef4444' : '#64748b',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: !formData.is_active ? '#ef4444' : '#94a3b8' }} />
                    Inactive
                  </button>
                </div>
              </div>



              {/* Batch / Year */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Batch / Year</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2024" 
                  value={formData.batch} 
                  onChange={e => handleFieldChange('batch', e.target.value)} 
                  onBlur={() => handleBlur('batch')}
                  style={getInputStyle('batch')} 
                />
                {touched.batch && errors.batch && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px' }}>
                    <AlertCircle size={13} /> {errors.batch}
                  </div>
                )}
              </div>

              {/* Specialization / Department */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Specialization / Department</label>
                <input 
                  type="text" 
                  placeholder="e.g. Computer Science & Engineering" 
                  value={formData.specialization} 
                  onChange={e => handleFieldChange('specialization', e.target.value)} 
                  onBlur={() => handleBlur('specialization')}
                  style={getInputStyle('specialization')} 
                />
                {touched.specialization && errors.specialization && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px' }}>
                    <AlertCircle size={13} /> {errors.specialization}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Form Actions */}
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
                boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' 
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminEditUser;
