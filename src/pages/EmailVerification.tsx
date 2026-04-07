import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Menu, X, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import nestMainLogo from '../assets/nest_logo.png';
import '../App.css';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    
    // Simulate verification
    const timer = setTimeout(() => setVerified(true), 3000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Features', href: '/#features' },
    { name: 'User Types', href: '/#users' },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#111827', fontFamily: '"Outfit", sans-serif', paddingTop: '100px' }}>
      
      {/* ── Header ── */}
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

      <div className="container" style={{ maxWidth: '480px', marginTop: '60px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', textAlign: 'center' }}
        >
          {!verified ? (
            <>
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 32px' }}>
                <div style={{ position: 'absolute', inset: 0, border: '3px solid #f1f5f9', borderRadius: '50%' }}></div>
                <motion.div 
                  style={{ position: 'absolute', inset: 0, border: '3px solid #c8102e', borderTopColor: 'transparent', borderRadius: '50%' }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <Mail size={32} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Verifying Identity</h2>
              <p style={{ color: '#64748b', marginBottom: '32px' }}>We're authenticating your profile. This will only take a moment.</p>
            </>
          ) : (
            <>
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ width: '80px', height: '80px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}
              >
                 <CheckCircle size={40} />
              </motion.div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Email Verified</h2>
              <p style={{ color: '#64748b', marginBottom: '32px' }}>Your account is now fully active. You're ready to explore the NeST Digital ecosystem.</p>
              <button 
                onClick={() => navigate('/login')}
                className="btn-red" 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 700 }}
              >
                Go to Dashboard
              </button>
            </>
          )}
          
          <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
              <ArrowLeft size={16} /> Already have issues? Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerification;
