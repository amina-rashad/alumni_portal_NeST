import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, GraduationCap, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import nestMainLogo from '../assets/nest_logo.png';
import './Auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState(1);
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show premium toast
    setShowSuccess(true);
    setTimeout(() => {
	    navigate('/login');
    }, 1500);
  };

  return (
    <div className="auth-page">
      <AnimatePresence>
        {showSuccess && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 30, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1)' }}
            >
              <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', padding: '6px', display: 'flex', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                <CheckCircle2 size={22} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#064E3B', fontSize: '1rem' }}>Registration Successful</p>
                <p style={{ margin: 0, color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>Welcome to the network!</p>
              </div>
            </motion.div>
          </div>
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
                  <button type="button" className="auth-btn secondary" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="auth-btn">
                    Register Now
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
