import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import { User, Mail, Lock, Phone, GraduationCap, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, PartyPopper, Eye, EyeOff, Linkedin, Users, Menu, X } from 'lucide-react';
=======
import { User, Mail, Lock, Phone, GraduationCap, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, Eye, EyeOff, Linkedin } from 'lucide-react';
>>>>>>> 3432fe238c0da96b4ba71610e57de3c6d925ade3
import { Link, useNavigate } from 'react-router-dom';
import nestMainLogo from '../assets/nest_logo.png';
import nestIcon from '../assets/nest_icon.png';
import { authApi, setTokens, setUser } from '../services/api';
import './Auth.css';

type SocialProvider = 'Google' | 'LinkedIn' | 'Microsoft' | null;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [activeProvider, setActiveProvider] = useState<SocialProvider>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    userType: 'Alumni',
    batch: '',
    specialization: ''
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all account details.');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
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

<<<<<<< HEAD

  const handleSocialSignIn = (provider: SocialProvider) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setActiveProvider(provider);
    }, 600);
  };

=======
>>>>>>> 3432fe238c0da96b4ba71610e57de3c6d925ade3
  const handleAccountSelect = (email: string) => {
    setActiveProvider(null);
    setIsLoading(true);
    setTimeout(() => {
      setTokens('social_mock_token_reg', 'social_mock_refresh_reg');
      setUser({
        email,
        full_name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        role: 'user',
        user_type: 'Alumni'
      });
      navigate('/dashboard');
    }, 1200);
  };

  const getProviderIcon = (provider: SocialProvider) => {
    switch(provider) {
      case 'Google':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31l3.59 2.78c2.1-1.94 3.31-4.79 3.31-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.59-2.78c-1 .67-2.28 1.07-3.69 1.07-2.83 0-5.23-1.92-6.09-4.51L2.18 17.1c1.86 3.66 5.63 6.13 10.03 6.13z" fill="#34A853"/>
            <path d="M5.91 14.12c-.22-.67-.35-1.39-.35-2.12s.13-1.45.35-2.12L2.18 6.9C1.39 8.44 1 10.17 1 12s.39 3.56 1.18 5.1l3.73-2.98z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.59 1 3.82 3.47 1.96 7.13l3.73 2.98c.86-2.59 3.26-4.51 6.31-4.51z" fill="#EA4335"/>
          </svg>
        );
      case 'LinkedIn':
        return <Linkedin size={24} color="#0077b5" fill="#0077b5" />;
      case 'Microsoft':
        return (
          <svg width="24" height="24" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f35323" d="M0 0h11v11H0z"/><path fill="#80bb03" d="M12 0h11v11H12z"/><path fill="#05a6f0" d="M0 12h11v11H0z"/><path fill="#ffba08" d="M12 12h11v11H12z"/>
          </svg>
        );
      default: return null;
    }
  };

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Features', href: '/#features' },
    { name: 'User Types', href: '/#users' },
  ];

  return (
<<<<<<< HEAD
    <div className="auth-page" style={{ paddingTop: '80px' }}>
      
      {/* -- Header -- */}
      <header className={`header ${isScrolled ? 'header-scrolled' : 'header-glass'}`}>
        <div className="container header-container">
          <Link to="/" className="logo">
            <img src={nestMainLogo} alt="NeST Digital" className="nest-main-logo" style={{ background: '#fff', padding: '6px 14px', borderRadius: '8px' }} />
          </Link>
          <nav className="desktop-nav">
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="nav-link">{link.name}</Link>
                </li>
              ))}
            </ul>
            <Link to="/login" className="btn-navy">LOGIN</Link>
            <Link to="/register" className="btn-red">REGISTER</Link>
          </nav>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div 
            key="success-popup"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              style={{ background: 'white', padding: '40px', borderRadius: '24px', maxWidth: '440px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div style={{ width: '150px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <img src={nestIcon} alt="NeST" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>Registration Successful!</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>Welcome to the NeST Digital talent network. Your account has been created successfully.</p>
              <button 
                onClick={() => navigate('/login')} 
                className="auth-btn" 
                style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              >
                Go to Login Page
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
=======
    <div className="auth-page">
      <Link to="/" className="back-home">
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>
>>>>>>> 3432fe238c0da96b4ba71610e57de3c6d925ade3

      <motion.div 
        className="auth-container register-layout"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="auth-form-side">
          <motion.div 
            className="auth-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="auth-logo" style={{ marginBottom: '32px' }}>
              <img src={nestMainLogo} alt="NeST Digital" className="nest-main-logo" style={{ height: '70px', objectFit: 'contain' }} />
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Create <span style={{ color: '#c8102e' }}>Account</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Join the NeST Digital talent network</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '32px' }}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '13px', fontWeight: 500, marginBottom: '20px' }}
              >
                {error}
              </motion.div>
            )}
            <div className="form-steps-indicator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`} style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? '#c8102e' : '#f1f5f9', color: step >= 1 ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', transition: 'all 0.3s' }}>1</div>
              <div style={{ width: '40px', height: '2px', background: step >= 2 ? '#c8102e' : '#f1f5f9', transition: 'all 0.3s' }}></div>
              <div className={`step-dot ${step >= 2 ? 'active' : ''}`} style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? '#c8102e' : '#f1f5f9', color: step >= 2 ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', transition: 'all 0.3s' }}>2</div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  className="form-step-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="input-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={18} />
                      <input type="text" name="fullName" placeholder="name" required value={formData.fullName} onChange={handleChange} />
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="input-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} />
                      <input type="email" name="email" placeholder="email address" required value={formData.email} onChange={handleChange} />
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="input-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input type={showPassword ? "text" : "password"} name="password" placeholder="........" required value={formData.password} onChange={handleChange} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>
                  <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} type="button" className="auth-btn next-step-btn" style={{ marginTop: '24px', position: 'relative' }} onClick={handleNextStep}>
                    Next Step <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  className="form-step-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="input-group">
                    <label>User Type</label>
                    <div className="input-wrapper">
                      <ShieldCheck className="input-icon" size={18} />
                      <select name="userType" value={formData.userType} onChange={handleChange} style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', outline: 'none', cursor: 'pointer' }}>
                        <option value="Alumni">Alumni</option>
                        <option value="Intern">Intern</option>
                        <option value="Trainee">Trainee</option>
                        <option value="Industrial Student">Industrial Student</option>
                        <option value="Event Participant">Event Participant</option>
                      </select>
                    </div>
                  </div>
                  <div className="row" style={{ display: 'flex', gap: '16px' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>Batch / Year</label>
                      <div className="input-wrapper">
                        <GraduationCap className="input-icon" size={18} />
                        <input type="text" name="batch" placeholder="2024" required value={formData.batch} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>Phone</label>
                      <div className="input-wrapper">
                        <Phone className="input-icon" size={18} />
                        <input type="tel" name="phone" placeholder="+91 ..." required value={formData.phone} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Specialization / Department</label>
                    <div className="input-wrapper">
                      <CheckCircle2 className="input-icon" size={18} />
                      <input type="text" name="specialization" placeholder="Software Engineering" required value={formData.specialization} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="auth-actions" style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                    <button type="button" className="auth-btn back-btn" style={{ background: '#f1f5f9', color: '#64748b', border: 'none', flex: 1 }} onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button type="submit" className="auth-btn" style={{ flex: 2, opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
                      {isLoading ? 'Registering...' : 'Register Now'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="auth-footer" style={{ marginTop: '32px', textAlign: 'center' }}>
            Already have an account? <Link to="/login" style={{ color: '#c8102e', fontWeight: 700 }}>Sign In</Link>
          </p>
        </div>

        <div className="auth-image-side register-bg">
          <motion.div 
            className="background-motion"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 1, 0]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              zIndex: 0 
            }}
          />
          <div className="image-overlay"></div>
          
          <motion.div 
            className="glass-card-float"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -12, 0] // Gentle floating motion
            }}
            transition={{
              opacity: { duration: 0.8 },
              scale: { duration: 0.8 },
              y: { 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }
            }}
          >
            <div className="image-content">
              <h3>Start Your Journey</h3>
              <p>
                Connect with industry leaders, access exclusive courses, and track your career growth with NeST Digital.
              </p>
              <div className="auth-stats">
                <div className="auth-stat">
                  <motion.strong
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                  >
                    5K+
                  </motion.strong>
                  <span>Alumni</span>
                </div>
                <div className="auth-stat">
                  <motion.strong
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
                  >
                    300+
                  </motion.strong>
                  <span>Jobs</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showSuccessPopup && (
          <motion.div 
            key="success-popup"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              style={{ background: 'white', padding: '40px', borderRadius: '24px', maxWidth: '440px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div style={{ width: '150px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <img src={nestIcon} alt="NeST" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>Registration Successful!</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>Welcome to the NeST Digital talent network. Your account has been created successfully.</p>
              <button 
                onClick={() => navigate('/login')} 
                className="auth-btn" 
                style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              >
                Go to Login Page
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeProvider && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#fff', width: '400px', borderRadius: '12px', padding: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>{getProviderIcon(activeProvider)}</div>
              <h2 style={{ fontSize: '22px', fontWeight: 600, textAlign: 'center' }}>Sign in with {activeProvider}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
                {['melbin@gmail.com', 'alumni@nest.com'].map((email, i) => (
                  <button key={i} onClick={() => handleAccountSelect(email)} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontWeight: 600 }}>{email.split('@')[0]}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{email}</div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}><button onClick={() => setActiveProvider(null)} style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}>Cancel</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
