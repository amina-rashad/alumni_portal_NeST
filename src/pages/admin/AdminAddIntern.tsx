import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, User, GraduationCap, Briefcase, FileText, ArrowLeft, Calendar, Mail, Phone, Clock
} from 'lucide-react';
import { adminApi } from '../../services/api';
import nestIcon from '../../assets/nest_icon.png';

const AdminAddIntern: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: 'Select gender',
    college: '',
    course: '',
    graduation_year: '',
    role_domain: '',
    start_date: '',
    duration: '',
    mentor: '',
    password: 'password123', // Default temporary password
    role: 'user',
    user_type: 'Intern',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mapping to API expectations while sending extra data
    const apiPayload = {
      ...formData,
      batch: `${formData.college} ${formData.graduation_year}`.trim(),
      specialization: formData.role_domain
    };

    const res = await adminApi.createUser(apiPayload);
    if (res.success) {
      setPopupMessage({ type: 'success', text: 'New intern has been registered successfully.' });
      setShowPopup(true);
    } else {
      setPopupMessage({ type: 'error', text: res.message || 'Failed to register intern.' });
      setShowPopup(true);
    }
    setIsSubmitting(false);
  };

  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '40px' }}>

      <AnimatePresence>
        {showPopup && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                background: '#fff',
                width: '380px',
                borderRadius: '24px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#c8102e' }} />

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <img src={nestIcon} alt="NeST" style={{ height: '48px', objectFit: 'contain' }} />
                </div>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
                {popupMessage.type === 'success' ? 'Registration Complete!' : 'Action Error'}
              </h2>

              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                {popupMessage.text}
              </p>

              <button
                onClick={() => {
                  setShowPopup(false);
                  if (popupMessage.type === 'success') navigate('/admin/interns');
                }}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: nestNavy,
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)'
                }}
              >
                {popupMessage.type === 'success' ? 'View Intern Roster' : 'Try Again'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/admin/interns')}
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
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Register New Intern</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: 500 }}>Onboard institutional partners into the internship program.</p>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

            {/* Section: Personal Details */}
            <div style={{ border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
              <div style={{ background: '#f8fafc', padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: 800, fontSize: '15px' }}>
                <User size={18} color={nestNavy} /> Personal Information
              </div>
              <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>Full Name</label>
                  <input required type="text" placeholder="Enter full name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff', fontWeight: 500 }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input required type="email" placeholder="intern@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '14px 18px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff', fontWeight: 500 }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="tel" placeholder="+91 XXXX XXXX XX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '14px 18px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff', fontWeight: 500 }} />
                  </div>
                </div>

              </div>
            </div>

            {/* Section: Academic Background */}
            <div style={{ border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
              <div style={{ background: '#f8fafc', padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: 800, fontSize: '15px' }}>
                <GraduationCap size={18} color={nestNavy} /> Academic Details
              </div>
              <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>College/University Name</label>
                  <input required type="text" placeholder="e.g. NIT Calicut" value={formData.college} onChange={e => setFormData({ ...formData, college: e.target.value })} style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff', fontWeight: 500 }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>Course / Specialization</label>
                  <input required type="text" placeholder="e.g. B.Tech Computer Science" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff', fontWeight: 500 }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>Graduation Year</label>
                  <input required type="text" placeholder="e.g. 2024" value={formData.graduation_year} onChange={e => setFormData({ ...formData, graduation_year: e.target.value })} style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff', fontWeight: 500 }} />
                </div>

              </div>
            </div>

            {/* Section: Internship Configuration */}
            <div style={{ border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
              <div style={{ background: '#f8fafc', padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: 800, fontSize: '15px' }}>
                <Briefcase size={18} color={nestNavy} /> Project & Mentor Assignment
              </div>
              <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>Internship Domain / Role</label>
                  <input required type="text" placeholder="e.g. Full Stack Development" value={formData.role_domain} onChange={e => setFormData({ ...formData, role_domain: e.target.value })} style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff', fontWeight: 500 }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>Commencement Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input required type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '14px 18px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff', cursor: 'pointer', fontWeight: 500 }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>Duration (Months)</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input required type="text" placeholder="e.g. 6" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '14px 18px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff', fontWeight: 500 }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>Reporting Mentor</label>
                  <input required type="text" placeholder="Enter mentor name" value={formData.mentor} onChange={e => setFormData({ ...formData, mentor: e.target.value })} style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff', fontWeight: 500 }} />
                </div>

              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
              <button type="button" onClick={() => navigate('/admin/interns')} style={{ padding: '14px 32px', borderRadius: '14px', background: '#fff', color: '#475569', fontWeight: 800, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '14px', transition: '0.2s' }}>
                Cancel
              </button>
              <button disabled={isSubmitting} type="submit" style={{ padding: '14px 36px', borderRadius: '14px', background: nestNavy, color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1, fontSize: '14px', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)', transition: '0.2s' }}>
                {isSubmitting ? 'Onboarding...' : 'Register Intern'}
              </button>
            </div>

          </form>
        </div>
      </div>
      );
};

      export default AdminAddIntern;

