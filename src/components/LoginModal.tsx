import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Shield, Eye, EyeOff, Users, Linkedin, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import nestMainLogo from '../assets/nest_logo.png';
import nestIcon from '../assets/nest_icon.png';
import { authApi, setTokens, setUser } from '../services/api';
import { validateEmail, validateOtp } from '../utils/validation';
import '../pages/Auth.css';

type SocialProvider = 'Google' | 'LinkedIn' | 'Microsoft' | null;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: ''
  });
  const [activeProvider, setActiveProvider] = useState<SocialProvider>(null);
  const [isGoogleFlow, setIsGoogleFlow] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset steps on close or open change
  useEffect(() => {
    if (!isOpen) {
      setStep('credentials');
      setOtpCode('');
      setError('');
      setIsGoogleFlow(false);
      setShowCustomGoogleInput(false);
      setCustomGoogleEmail('');
    }
  }, [isOpen]);

  // Scroll Lock for Modal and Success Popup
  useEffect(() => {
    if (isOpen || showSuccessPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, showSuccessPopup]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(formData.email, true);
    if (emailError) {
      setError(emailError);
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    setFormData({ email: cleanEmail });
    setIsLoading(true);
    setError('');
    setIsGoogleFlow(false);

    try {
      const response = await authApi.sendOtp(cleanEmail, undefined, 'email');

      if (response && response.success) {
        setStep('otp');
        setResendTimer(30);
      } else {
        setError(response?.message || 'Failed to send verification code. Please check your email.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAccountSelect = async (selectedEmail: string, selectedName?: string) => {
    const emailError = validateEmail(selectedEmail, true);
    if (emailError) {
      setError(emailError);
      return;
    }

    const cleanEmail = selectedEmail.trim().toLowerCase();
    setFormData({ email: cleanEmail });
    setIsGoogleFlow(true);
    setError('');
    setOtpCode('');
    // Advance directly to the OTP step so user sees Google Account Connected badge immediately
    setStep('otp');
    setActiveProvider(null);
    setShowCustomGoogleInput(false);
    setIsLoading(true);

    try {
      const response = await authApi.sendOtp(
        cleanEmail,
        selectedName,
        'google'
      );

      if (response && response.success) {
        setResendTimer(30);
      } else if (response && response.message) {
        setError(response.message);
      }
    } catch {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpError = validateOtp(otpCode);
    if (otpError) {
      setError(otpError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.loginWithOtp({
        email: formData.email,
        otp: otpCode,
        auth_provider: isGoogleFlow ? 'google' : 'email'
      });

      if (response.success && response.data) {
        setTokens(response.data.access_token, response.data.refresh_token);
        setUser(response.data.user);
        setLoggedInUser(response.data.user);
        setShowSuccessPopup(true);
      } else {
        setError(response.message || 'Invalid verification code. Please check and try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.sendOtp(
        formData.email,
        undefined,
        isGoogleFlow ? 'google' : 'email'
      );
      if (response && response.success === false) {
        setError(response.message || 'Failed to resend verification code.');
      } else {
        setResendTimer(30);
      }
    } catch {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    onClose();
    let targetPath = '/dashboard';
    if (loggedInUser?.role === 'admin' || loggedInUser?.role === 'super_admin') {
      targetPath = '/admin';
    } else if (loggedInUser?.role === 'event_manager') {
      targetPath = '/event-manager';
    } else if (loggedInUser?.role === 'course_manager') {
      targetPath = '/course-manager/dashboard';
    } else if (loggedInUser?.role === 'recruiter' || loggedInUser?.role === 'job_recruiter') {
      targetPath = '/recruiter';
    }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="login-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(1, 6, 20, 0.65)',
            backdropFilter: 'blur(8px)',
            padding: '20px',
          }}
          onClick={onClose}
        >

          <motion.div
            className="auth-container"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxHeight: '92vh',
              overflow: 'hidden',
              borderRadius: '24px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
            }}
          >
            <style>{`
              .auth-container::-webkit-scrollbar,
              .auth-form-side::-webkit-scrollbar,
              .auth-image-side::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
            `}</style>

            {/* Modal Close Button */}
            <button 
              onClick={onClose} 
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(241, 245, 249, 0.9)',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'all 0.2s',
                zIndex: 50,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(241, 245, 249, 0.9)';
                e.currentTarget.style.color = '#64748b';
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div 
              className="auth-form-side"
              style={{
                padding: '44px 48px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <motion.div 
                className="auth-header"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ marginBottom: '28px' }}
              >
                <div className="auth-logo luxury-logo-sweep" style={{ marginBottom: '20px', background: 'white', padding: '6px 14px', width: 'fit-content' }}>
                  <img src={nestMainLogo} alt="NeST Digital" className="nest-main-logo" style={{ height: '56px', objectFit: 'contain' }} />
                </div>
                <h2 className="luxury-title" style={{ fontSize: '30px', fontWeight: 800, marginBottom: '6px' }}>Welcome</h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Enter your credentials to access your portal</p>
              </motion.div>

              {step === 'credentials' ? (
                <form onSubmit={handleSendOtp} className="auth-form">
                  {error && (
                    <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>
                      {error}
                    </div>
                  )}

                  <div className="input-group" style={{ marginBottom: '20px' }}>
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} />
                      <input type="email" name="email" placeholder="name@company.com" required value={formData.email} onChange={handleChange} disabled={isLoading} />
                    </div>
                  </div>

                  <button type="submit" className="auth-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                    <LogIn size={18} /> {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="auth-form">
                  {error && (
                    <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px', fontWeight: 500 }}>
                      {error}
                    </div>
                  )}

                  {isGoogleFlow && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31l3.59 2.78c2.1-1.94 3.31-4.79 3.31-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.59-2.78c-1 .67-2.28 1.07-3.69 1.07-2.83 0-5.23-1.92-6.09-4.51L2.18 17.1c1.86 3.66 5.63 6.13 10.03 6.13z" fill="#34A853"/>
                        <path d="M5.91 14.12c-.22-.67-.35-1.39-.35-2.12s.13-1.45.35-2.12L2.18 6.9C1.39 8.44 1 10.17 1 12s.39 3.56 1.18 5.1l3.73-2.98z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.59 1 3.82 3.47 1.96 7.13l3.73 2.98c.86-2.59 3.26-4.51 6.31-4.51z" fill="#EA4335"/>
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Google Account Connected</span>
                        <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>{formData.email}</span>
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <label>Enter 6-Digit Verification Code</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        We sent a code to <strong style={{ color: '#1e293b' }}>{formData.email}</strong>
                      </p>
                      <div className="input-wrapper">
                        <Lock className="input-icon" size={18} />
                        <input 
                          type="text" 
                          maxLength={6} 
                          placeholder="123456" 
                          required 
                          value={otpCode} 
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                          disabled={isLoading}
                          style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="auth-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                    <LogIn size={18} /> {isLoading ? 'Verifying...' : 'Verify & Log In'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => { setStep('credentials'); setIsGoogleFlow(false); setError(''); }} 
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <ArrowLeft size={16} /> Back to Email
                    </button>
                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      disabled={isLoading || resendTimer > 0}
                      style={{ background: 'none', border: 'none', color: (isLoading || resendTimer > 0) ? '#94a3b8' : '#c8102e', fontSize: '13px', cursor: (isLoading || resendTimer > 0) ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                    >
                      {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
              <p className="auth-footer" style={{ textAlign: 'center', marginTop: '24px', width: '100%' }}>Secure Access Only</p>
            </div>

            <div className="auth-image-side" style={{ overflow: 'hidden' }}>
              <div className="image-overlay"></div>
              <div className="image-content">
                <div className="security-badge"><Shield size={20} /><span>Secure Connection</span></div>
                <h3>Empowering Global Talent</h3>
                <p>Access your personalized dashboard, track your learning progress, and stay updated with the latest opportunities at NeST Digital.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Social Auth Modal - Independent Overlay */}
      <AnimatePresence>
        {activeProvider && (
          <div 
            key="social-modal" 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              zIndex: 10005, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'rgba(15, 23, 42, 0.4)', 
              backdropFilter: 'blur(8px)' 
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveProvider(null);
              setShowCustomGoogleInput(false);
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              style={{ background: '#fff', width: '420px', borderRadius: '16px', padding: '36px 32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>{getProviderIcon(activeProvider)}</div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', textAlign: 'center', margin: '0 0 6px 0' }}>Sign in with {activeProvider}</h2>
              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>Choose an account to continue to NeST Alumni Portal</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Amina Rashad', email: 'amina.rashad@nestgroup.net', avatar: 'A' },
                  { name: 'NeST Alumni', email: 'alumni.nest@gmail.com', avatar: 'N' },
                ].map((acc, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGoogleAccountSelect(acc.email, acc.name);
                    }} 
                    disabled={isLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} 
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }} 
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{acc.avatar}</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{acc.name}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{acc.email}</span>
                    </div>
                  </button>
                ))}

                {showCustomGoogleInput ? (
                  <form 
                    onSubmit={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation();
                      if (customGoogleEmail.trim()) handleGoogleAccountSelect(customGoogleEmail); 
                    }} 
                    style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={16} />
                      <input 
                        type="email" 
                        placeholder="Enter your Google email address" 
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        required
                        autoFocus
                        disabled={isLoading}
                        style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading || !customGoogleEmail.trim()}
                      className="auth-btn"
                      style={{ padding: '10px', fontSize: '13px', borderRadius: '8px' }}
                    >
                      {isLoading ? 'Sending Code...' : 'Continue with Verification Code'}
                    </button>
                  </form>
                ) : (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCustomGoogleInput(true);
                    }} 
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', border: '1px dashed #cbd5e1', borderRadius: '10px', background: '#f8fafc', cursor: 'pointer', marginTop: '4px', textAlign: 'left', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} color="#64748b" /></div>
                    <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Use another account</span>
                  </button>
                )}
              </div>

              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center' }}>
                <button 
                  type="button"
                  onClick={(e) => { 
                    e.stopPropagation();
                    setActiveProvider(null); 
                    setShowCustomGoogleInput(false); 
                  }} 
                  style={{ padding: '8px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Success Popup - Clean Static Card */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div 
            key="success-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
              zIndex: 10010, display: 'flex', alignItems: 'center', justifyContent: 'center', 
              background: 'rgba(5, 8, 22, 0.95)', backdropFilter: 'blur(20px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Clean, static card with no animations or transitions */}
            <div 
              style={{ 
                width: '400px', 
                borderRadius: '28px', 
                padding: '40px 36px', 
                textAlign: 'center', 
                position: 'relative', 
                overflow: 'hidden',
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 30px 100px -20px rgba(0, 0, 0, 0.3)',
                fontFamily: "'Montserrat', sans-serif"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo */}
              <div 
                style={{ 
                  width: '140px', 
                  height: '80px', 
                  margin: '0 auto 16px', 
                  position: 'relative', 
                  zIndex: 10 
                }}
              >
                <img src={nestIcon} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

              {/* Title */}
              <h2 style={{ 
                fontSize: '26px', 
                fontWeight: 900, 
                color: '#0f172a', 
                marginBottom: '12px',
                position: 'relative', 
                zIndex: 10,
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Welcome!
              </h2>

              {/* Greeting */}
              <p 
                style={{ 
                  color: '#64748b', fontSize: '15px', lineHeight: '1.5', marginBottom: '32px',
                  position: 'relative', zIndex: 10,
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                Hello, <br/>
                <span 
                  style={{ 
                    fontWeight: 900, 
                    fontSize: '20px',
                    background: 'linear-gradient(90deg, #c8102e, #1a2652, #c8102e)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                    marginTop: '4px',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  {loggedInUser?.full_name}
                </span>
              </p>

              {/* Dashboard button */}
              <div style={{ position: 'relative', zIndex: 10 }}>
                <button 
                  onClick={handleSuccessClose} 
                  style={{ 
                    width: '100%', padding: '16px', fontSize: '15px', fontWeight: 800,
                    borderRadius: '14px', background: '#c8102e', color: 'white',
                    border: 'none', cursor: 'pointer', position: 'relative',
                    boxShadow: '0 8px 25px rgba(200, 16, 46, 0.3)',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  Go to Dashboard
                </button>
              </div>

              {/* Status badge */}
              <div
                style={{
                  marginTop: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  position: 'relative', zIndex: 10,
                }}
              >
                <div
                  style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}
                />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Montserrat', sans-serif" }}>
                  Session Secured
                </span>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default LoginModal;
