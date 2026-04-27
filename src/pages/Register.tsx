import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import { User, Mail, Lock, Phone, GraduationCap, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, PartyPopper, Eye, EyeOff, Linkedin, Users, Menu, X } from 'lucide-react';
=======
import { User, Mail, Phone, GraduationCap, BookOpen, Building2, Calendar, ShieldCheck, CheckCircle2, Menu, X, RefreshCw, ChevronDown } from 'lucide-react';
>>>>>>> b5a55a284d9dbff01cfc419439be311dfe2096da
import { Link, useNavigate } from 'react-router-dom';
import nestMainLogo from '../assets/nest_logo.png';
import nestIcon from '../assets/nest_icon.png';
import './Auth.css';

/* -- Alphanumeric CAPTCHA Generator -- */
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; // Removed ambiguous chars like 0, O, 1, l
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return { code: result };
};

/* -- Captcha Canvas Renderer -- */
const CaptchaDisplay: React.FC<{ text: string; onRefresh: () => void }> = ({ text, onRefresh }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 180;
    canvas.height = 64;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 180, 64);

    // 1. Add heavy peppering (dot noise)
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(50, 50, 50, ${Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * 180, Math.random() * 64, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Clearer text drawing
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 36px "Courier New", Courier, monospace'; // Monospace for that slightly older/technical look
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const chars = text.split('');
    let x = 30;
    chars.forEach((char) => {
      ctx.save();
      ctx.translate(x, 32 + (Math.random() * 10 - 5));
      ctx.rotate((Math.random() * 0.4) - 0.2);
      ctx.fillText(char, 0, 0);
      ctx.restore();
      x += 24;
    });

    // 3. Add curved noise lines crossing the text
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(80, 80, 80, 0.7)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * 64);
      ctx.bezierCurveTo(
        60, Math.random() * 64,
        120, Math.random() * 64,
        180, Math.random() * 64
      );
      ctx.stroke();
    }
  }, [text]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <canvas ref={canvasRef} style={{ borderRadius: '4px', border: '1px solid #333', height: '64px', width: '180px' }} />
      <button
        type="button"
        onClick={onRefresh}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px'
        }}
        title="Refresh"
      >
        <RefreshCw size={24} color="#facc15" strokeWidth={3} /> {/* f6e05e style yellow */}
      </button>
    </div>
  );
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    primaryEmail: '',
    phone: '',
    graduationLevel: '',
    course: '',
    batch: '',
    collegeName: '',
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.graduationLevel || formData.graduationLevel === 'Select') {
      setError('Please select your graduation level.');
      return;
    }
    if (captchaInput !== captcha.code) {
      setError('Captcha code is incorrect.');
      refreshCaptcha();
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms and Conditions.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowSuccessPopup(true);
    } catch {
      setError('Registration failed. Please try again.');
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
    switch (provider) {
      case 'Google':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31l3.59 2.78c2.1-1.94 3.31-4.79 3.31-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.59-2.78c-1 .67-2.28 1.07-3.69 1.07-2.83 0-5.23-1.92-6.09-4.51L2.18 17.1c1.86 3.66 5.63 6.13 10.03 6.13z" fill="#34A853" />
            <path d="M5.91 14.12c-.22-.67-.35-1.39-.35-2.12s.13-1.45.35-2.12L2.18 6.9C1.39 8.44 1 10.17 1 12s.39 3.56 1.18 5.1l3.73-2.98z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.59 1 3.82 3.47 1.96 7.13l3.73 2.98c.86-2.59 3.26-4.51 6.31-4.51z" fill="#EA4335" />
          </svg>
        );
      case 'LinkedIn':
        return <Linkedin size={24} color="#0077b5" fill="#0077b5" />;
      case 'Microsoft':
        return (
          <svg width="24" height="24" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f35323" d="M0 0h11v11H0z" /><path fill="#80bb03" d="M12 0h11v11H12z" /><path fill="#05a6f0" d="M0 12h11v11H0z" /><path fill="#ffba08" d="M12 12h11v11H12z" />
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
    <div className="auth-page" style={{ paddingTop: '80px' }}>

      {/* -- Header -- */}
=======
  return (
    <div className="auth-page" style={{ paddingTop: '80px', background: '#f8fafc' }}>

        {/* Header */}
>>>>>>> b5a55a284d9dbff01cfc419439be311dfe2096da
        <header className={`header ${isScrolled ? 'header-scrolled' : 'header-glass'}`}>
          <div className="container header-container">
            <Link to="/" className="logo">
              <img src={nestMainLogo} alt="NeST Digital" className="nest-main-logo" style={{ background: '#fff', padding: '6px 14px', borderRadius: '8px' }} />
            </Link>
            <nav className="desktop-nav">
<<<<<<< HEAD
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="nav-link">{link.name}</Link>
                </li>
              ))}
            </ul>
            <Link to="/login" className="btn-navy">LOGIN</Link>
            <Link to="/register" className="btn-red">REGISTER</Link>
          </nav >
  <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
  </button>
        </div >
      </header >

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
=======
             <Link to="/" className="nav-link">Home</Link>
      <Link to="/login" className="btn-navy">LOGIN</Link>
    </nav>
>>>>>>> b5a55a284d9dbff01cfc419439be311dfe2096da
  </div>
      </header >

  {/* Success Popup */ }
  <AnimatePresence>
{
  showSuccessPopup && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: 'white', padding: '40px', borderRadius: '24px', maxWidth: '440px', width: '90%', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle2 size={32} color="white" />
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Registration Successful!</h3>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>Welcome to the NeST Digital network. Your profile has been created.</p>
        <button onClick={() => navigate('/login')} className="auth-btn" style={{ width: '100%', padding: '14px', background: '#c8102e', color: 'white', borderRadius: '12px' }}>Go to Login</button>
      </motion.div>
    </motion.div>
  )
}
      </AnimatePresence >

  <div className="auth-container" style={{ maxWidth: '1100px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
    <div className="auth-form-side" style={{ padding: '48px 60px' }}>
      <div className="auth-header" style={{ marginBottom: '32px' }}>
        <img src={nestMainLogo} alt="NeST" style={{ height: '54px', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>IV Students <span style={{ color: '#c8102e' }}>Registration</span></h2>
        <p style={{ color: '#64748b' }}>Complete the form below in a single step to join the program.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'grid', gap: '20px' }}>
        {error && <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>{error}</div>}

        <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="input-group">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>First Name</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <User className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" name="firstName" placeholder="First name" required value={formData.firstName} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 122x 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', paddingLeft: '44px' }} />
            </div>
          </div>
          <div className="input-group">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Last Name</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <User className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" name="secondName" placeholder="Last name" required value={formData.secondName} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', paddingLeft: '44px' }} />
            </div>
          </div>
        </div>

        <div className="input-group">
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Primary Email</label>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Mail className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="email" name="primaryEmail" placeholder="your@email.com" required value={formData.primaryEmail} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', paddingLeft: '44px' }} />
          </div>
        </div>

        <div className="input-group">
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Phone Number</label>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Phone className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="tel" name="phone" placeholder="+91 ..." required value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', paddingLeft: '44px' }} />
          </div>
        </div>

        <div className="input-group">
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>College Name</label>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Building2 className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" name="collegeName" placeholder="Enter college name" required value={formData.collegeName} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', paddingLeft: '44px' }} />
          </div>
        </div>

        <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="input-group">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Graduation Level</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <GraduationCap className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <select name="graduationLevel" value={formData.graduationLevel} onChange={handleChange} required style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', paddingLeft: '44px', appearance: 'none' }}>
                <option value="">Select Level</option>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>
          <div className="input-group">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Course</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <BookOpen className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" name="course" placeholder="e.g. B.Tech" required value={formData.course} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', paddingLeft: '44px' }} />
            </div>
          </div>
        </div>

        <div className="input-group">
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Batch (in years)</label>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Calendar className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" name="batch" placeholder="e.g. 2024" required value={formData.batch} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', paddingLeft: '44px' }} />
          </div>
        </div>

        <div className="input-group" style={{
          background: '#2d3748', // Darker background for captcha area
          padding: '24px',
          borderRadius: '16px',
          marginTop: '10px'
        }}>
          <label style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '16px',
            display: 'block'
          }}>
            Captcha <span style={{ color: '#c8102e' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <CaptchaDisplay text={captcha.code} onRefresh={refreshCaptcha} />
            <input
              type="text"
              placeholder=""
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              required
              style={{
                padding: '16px',
                borderRadius: '4px',
                border: '1px solid #1a202c',
                background: '#1a202c',
                color: 'white',
                outline: 'none',
                fontSize: '18px',
                height: '56px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px', cursor: 'pointer' }} onClick={() => setAgreedToTerms(!agreedToTerms)}>
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: agreedToTerms ? 'none' : '2px solid #cbd5e1', background: agreedToTerms ? '#c8102e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0 }}>
            {agreedToTerms && <CheckCircle2 size={12} color="white" />}
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>I agree to the <span style={{ color: '#c8102e', fontWeight: 600 }}>Terms and Conditions</span> and Privacy Policy of NeST Digital.</p>
        </div>

        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#c8102e', color: 'white', fontWeight: 700, fontSize: '16px', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}>
          {isLoading ? 'Processing...' : 'Register'}
        </button>
      </form>
    </div>

    <div className="auth-image-side" style={{ background: '#0f172a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div className="image-overlay" style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', position: 'relative', zIndex: 1 }}>
        <h3 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Engineering Transformation</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', fontSize: '15px' }}>Join the exclusive NeST Digital talent network for Industrial Visit students. Share your details and start your journey with us.</p>
        <div style={{ marginTop: '32px', display: 'flex', gap: '24px' }}>
          <div><strong style={{ display: 'block', fontSize: '24px' }}>5K+</strong><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Alumni</span></div>
          <div><strong style={{ display: 'block', fontSize: '24px' }}>300+</strong><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Jobs</span></div>
        </div>
      </motion.div>
    </div>
  </div>
    </div >
  );
};

export default Register;
