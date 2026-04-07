import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import { Mail, Lock, LogIn, ArrowLeft, Shield, Eye, EyeOff, Users, Linkedin, CheckCircle, Menu, X } from 'lucide-react';
=======
import { Mail, Lock, LogIn, ArrowLeft, Shield, Eye, EyeOff, Users, Linkedin, CheckCircle } from 'lucide-react';
>>>>>>> 3432fe238c0da96b4ba71610e57de3c6d925ade3
import { Link, useNavigate } from 'react-router-dom';
import nestMainLogo from '../assets/nest_logo.png';
import nestIcon from '../assets/nest_icon.png';
import { authApi, setTokens, setUser } from '../services/api';
import './Auth.css';

type SocialProvider = 'Google' | 'LinkedIn' | 'Microsoft' | null;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [activeProvider, setActiveProvider] = useState<SocialProvider>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.data) {
        setTokens(response.data.access_token, response.data.refresh_token);
        setUser(response.data.user);
        setLoggedInUser(response.data.user);
        setShowSuccess(true);
        setShowSuccessPopup(true);
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


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
      setTokens('social_mock_token', 'social_mock_refresh');
      const newUser = {
        email,
        full_name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        role: 'user',
        user_type: 'Alumni'
      };
      setUser(newUser);
      setLoggedInUser(newUser);
      setShowSuccessPopup(true);
    }, 1200);
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    const targetPath = loggedInUser?.role === 'admin' ? '/admin' : '/dashboard';
    navigate(targetPath);
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
        {showSuccess && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 2000, pointerEvents: 'none' }}>
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 100, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1)' }}
            >
              <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', padding: '6px', display: 'flex', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                <CheckCircle size={22} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#064E3B', fontSize: '1rem' }}>Login Successful</p>
                <p style={{ margin: 0, color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>Welcome back!</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="auth-container">
        <div className="auth-form-side">
          <motion.div 
            className="auth-header"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="auth-logo" style={{ marginBottom: '32px' }}>
              <img src={nestMainLogo} alt="NeST Digital" className="nest-main-logo" style={{ height: '70px', objectFit: 'contain' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Welcome Back</h2>
            <p>Enter your credentials to access your portal</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" name="email" placeholder="name@company.com" required value={formData.email} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            <div className="input-group">
              <div className="label-flex">
                <label>Password</label>
                <Link to="/forgot-password" className="forgot-pass">Forgot?</Link>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type={showPassword ? "text" : "password"} name="password" placeholder="........" required value={formData.password} onChange={handleChange} disabled={isLoading} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
              <LogIn size={18} /> {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>Or continue with</span></div>

          <div className="social-auth">
            <button type="button" className="social-btn" onClick={() => handleSocialSignIn('Google')}>
              <span className="dot" style={{ background: '#4285F4' }}></span> Google
            </button>
            <button type="button" className="social-btn" onClick={() => handleSocialSignIn('LinkedIn')}>
              <span className="dot" style={{ background: '#0077b5' }}></span> LinkedIn
            </button>
            <button type="button" className="social-btn" onClick={() => handleSocialSignIn('Microsoft')}>
              <span className="dot" style={{ background: '#00a1f1' }}></span> Microsoft
            </button>
          </div>

          <p className="auth-footer">New to the portal? <Link to="/register">Create an account</Link></p>
        </div>

        <div className="auth-image-side">
          <div className="image-overlay"></div>
          <div className="image-content">
            <div className="security-badge"><Shield size={20} /><span>Secure Connection</span></div>
            <h3>Empowering Global Talent</h3>
            <p>Access your personalized dashboard, track your learning progress, and stay updated with the latest opportunities at NeST Digital.</p>
          </div>
        </div>
      </div>

      {/* Social Auth Modal */}
      <AnimatePresence>
        {activeProvider && (
          <div key="social-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#fff', width: '400px', borderRadius: '12px', padding: '40px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>{getProviderIcon(activeProvider)}</div>
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#1e293b', textAlign: 'center', margin: '0 0 8px 0' }}>Sign in to NeST</h2>
              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>Use your {activeProvider} account to continue</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { name: 'Melbin Mani', email: `melbin@${activeProvider.toLowerCase()}.com`, avatar: 'M' },
                  { name: 'NeST Alumni', email: `alumni@${activeProvider.toLowerCase()}.com`, avatar: 'A' },
                ].map((acc, idx) => (
                  <button key={idx} onClick={() => handleAccountSelect(acc.email)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid transparent', borderRadius: '8px', background: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#475569' }}>{acc.avatar}</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{acc.name}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{acc.email}</span>
                    </div>
                  </button>
                ))}
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: 'none', background: 'none', cursor: 'pointer', marginTop: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} color="#64748b" /></div>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Use another account</span>
                </button>
              </div>

              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setActiveProvider(null)} style={{ padding: '8px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div 
            key="success-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', 
              background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)' 
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              style={{ 
                background: '#fff', width: '420px', borderRadius: '24px', 
                padding: '40px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' 
              }}
            >
              <div style={{ 
                width: '180px', height: '100px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 12px'
              }}>
                <img 
                  src={nestIcon} 
                  alt="NeST Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Welcome Back!</h2>
              <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                Hello <span style={{ fontWeight: 700, color: '#c8102e' }}>{loggedInUser?.full_name}</span>,<br/>
                You have successfully signed in to your portal.
              </p>
              <button 
                onClick={handleSuccessClose} 
                className="auth-btn" 
                style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              >
                Go to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
