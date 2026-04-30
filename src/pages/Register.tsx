import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, GraduationCap, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, PartyPopper, Eye, EyeOff, Linkedin, Users, Menu, X, Building2, ChevronDown, BookOpen, Calendar, RefreshCw } from 'lucide-react';
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


  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Features', href: '/#features' },
    { name: 'User Types', href: '/#users' },
  ];

  return (
    <div className="auth-page" style={{ paddingTop: '80px', background: '#f8fafc' }}>
      {/* Header */}
      <header className={`header ${isScrolled ? 'header-scrolled' : 'header-glass'}`}>
        <div className="container header-container">
          <Link to="/" className="logo">
            <img src={nestMainLogo} alt="NeST Digital" className="nest-main-logo" style={{ background: '#fff', padding: '6px 14px', borderRadius: '8px' }} />
          </Link>
          <nav className="desktop-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/login" className="btn-navy">LOGIN</Link>
          </nav>
        </div>
      </header>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
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
        )}
      </AnimatePresence>

      <div className="auth-container" style={{ maxWidth: '1100px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', margin: '0 auto' }}>
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
                  <input type="text" name="firstName" placeholder="First name" required value={formData.firstName} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                </div>
              </div>
              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Last Name</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <User className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" name="secondName" placeholder="Last name" required value={formData.secondName} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Primary Email</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Mail className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="email" name="primaryEmail" placeholder="your@email.com" required value={formData.primaryEmail} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Phone Number</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Phone className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="tel" name="phone" placeholder="+91 ..." required value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>College Name</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Building2 className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" name="collegeName" placeholder="Enter college name" required value={formData.collegeName} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
            </div>

            <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Graduation Level</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <GraduationCap className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <select name="graduationLevel" value={formData.graduationLevel} onChange={handleChange} required style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', appearance: 'none' }}>
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
                  <input type="text" name="course" placeholder="e.g. B.Tech" required value={formData.course} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Batch (in years)</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Calendar className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" name="batch" placeholder="e.g. 2024" required value={formData.batch} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
            </div>

            <div className="input-group" style={{ background: '#2d3748', padding: '24px', borderRadius: '16px', marginTop: '10px' }}>
              <label style={{ fontSize: '18px', fontWeight: 600, color: '#94a3b8', marginBottom: '16px', display: 'block' }}>Captcha <span style={{ color: '#c8102e' }}>*</span></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <CaptchaDisplay text={captcha.code} onRefresh={refreshCaptcha} />
                <input type="text" placeholder="" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required style={{ padding: '16px', borderRadius: '4px', border: '1px solid #1a202c', background: '#1a202c', color: 'white', outline: 'none', fontSize: '18px', height: '56px' }} />
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
    </div>  );
};

export default Register;
