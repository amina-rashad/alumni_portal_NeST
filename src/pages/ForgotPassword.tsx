import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import nestMainLogo from '../assets/nest_logo.png';
import '../App.css';

const ForgotPassword: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
          style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}
        >
          {!submitted ? (
            <>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>Forgot Password?</h2>
              <p style={{ color: '#64748b', marginBottom: '32px' }}>No worries! Enter your email address and we'll send you a link to reset your password.</p>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
                    <input 
                      type="email" 
                      placeholder="name@company.com" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-red" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 700 }}>
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                 <Mail size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Check your email</h3>
              <p style={{ color: '#64748b', marginBottom: '32px' }}>We've sent a password reset link to <strong>{email}</strong>.</p>
              <button onClick={() => setSubmitted(false)} style={{ background: '#f1f5f9', border: 'none', color: '#475569', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                Didn't get the email? Try again
              </button>
            </div>
          )}
          
          <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#c8102e', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
