import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, GraduationCap, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, PartyPopper } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import nestMainLogo from '../assets/nest_logo.png';
import { authApi } from '../services/api';
import './Auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    userType: 'Alumni',
    batch: '',
    specialization: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.register({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        user_type: formData.userType,
        batch: formData.batch,
        specialization: formData.specialization,
      });

      if (response.success && response.data) {
        setShowSuccessPopup(true);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div 
            className="success-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)'
            }}
          >
            <motion.div 
              className="success-popup-card"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              style={{
                background: 'white', padding: '40px', borderRadius: '24px',
                maxWidth: '440px', width: '90%', textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', 
                background: '#f8fafc', color: '#c8102e', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', border: '2px solid #e2e8f0'
              }}>
                <PartyPopper size={40} />
              </div>
              <h3 className="luxury-title" style={{ fontSize: '28px', marginBottom: '12px' }}>Registration Successful!</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                Welcome to the NeST Digital talent network. Your account has been created successfully. You can now log in to explore your dashboard and opportunities.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="auth-btn"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '16px', display: 'flex', justifyContent: 'center' }}
              >
                Go to Login Page
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/" className="back-home">
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>
      
      <div className="auth-container register-layout">
        <div className="auth-form-side">
          <motion.div 
            className="auth-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="auth-logo">
              <img src={nestMainLogo} alt="NeST Digital" className="nest-main-logo" style={{ height: '50px' }} />
            </div>
            <motion.h2 className="luxury-title" whileHover={{ letterSpacing: '2px' }} transition={{ duration: 0.3 }}>Create Account</motion.h2>
            <p>Join the NeST Digital talent network</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div style={{
                padding: '12px 16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <div className="form-steps-indicator">
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className="step-line"></div>
              <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
            </div>

            {step === 1 ? (
              <motion.div 
                className="form-step-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="input-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input 
                      type="text" 
                      name="fullName" 
                      placeholder="name" 
                      required 
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="email address" 
                      required 
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input 
                      type="password" 
                      name="password" 
                      placeholder="••••••••" 
                      required 
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 0.97, borderRadius: "25px" }} 
                  whileTap={{ scale: 0.93 }}
                  type="button" 
                  className="auth-btn next-step-btn" 
                  onClick={() => setStep(2)}
                >
                  Next Step <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                className="form-step-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="input-group">
                  <label>User Type</label>
                  <div className="input-wrapper">
                    <ShieldCheck className="input-icon" size={18} />
                    <select name="userType" value={formData.userType} onChange={handleChange}>
                      <option value="Alumni">Alumni</option>
                      <option value="Intern">Intern</option>
                      <option value="Trainee">Trainee</option>
                      <option value="Industrial Student">Industrial Student</option>
                      <option value="Event Participant">Event Participant</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="input-group">
                    <label>Batch / Year</label>
                    <div className="input-wrapper">
                      <GraduationCap className="input-icon" size={18} />
                      <input 
                        type="text" 
                        name="batch" 
                        placeholder="2024" 
                        required 
                        value={formData.batch}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Phone</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={18} />
                      <input 
                        type="tel" 
                        name="phone" 
                        placeholder="+91 ..." 
                        required 
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Specialization / Department</label>
                  <div className="input-wrapper">
                    <CheckCircle2 className="input-icon" size={18} />
                    <input 
                      type="text" 
                      name="specialization" 
                      placeholder="Software Engineering" 
                      required 
                      value={formData.specialization}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="auth-actions">
                  <button type="button" className="auth-btn secondary" onClick={() => setStep(1)} disabled={isLoading}>
                    Back
                  </button>
                  <button type="submit" className="auth-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? 'Creating Account...' : 'Register Now'}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>

        <div className="auth-image-side register-bg">
          <div className="image-overlay"></div>
          <motion.div 
            className="glass-card-float"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          >
            <div className="image-content">
              <h3>Start Your Journey</h3>
              <p>Connect with industry leaders, access exclusive courses, and track your career growth with NeST Digital.</p>
              <div className="auth-stats">
                <div className="auth-stat">
                  <strong>5K+</strong>
                  <span>Alumni</span>
                </div>
                <div className="auth-stat">
                  <strong>300+</strong>
                  <span>Jobs</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
