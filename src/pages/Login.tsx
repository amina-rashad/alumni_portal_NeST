import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import nestMainLogo from '../assets/nest_logo.png';
import { authApi, setTokens, setUser } from '../services/api';
import './Auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        
        // Dynamic Role-based Routing!
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.message || 'Login failed. Please try again.');
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

      <Link to="/" className="back-home">
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>

      <div className="auth-container">
        <div className="auth-form-side">
          <motion.div 
            className="auth-header"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="auth-logo">
              <img src={nestMainLogo} alt="NeST Digital" className="nest-main-logo" style={{ height: '50px' }} />
            </div>
            <h2>Welcome Back</h2>
            <p>Enter your credentials to access your portal</p>
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

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="name@company.com" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-flex">
                <label>Password</label>
                <Link to="/forgot-password" className="forgot-pass">Forgot?</Link>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Keep me logged in</label>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
              <LogIn size={18} /> {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>

          <div className="social-auth">
            <button className="social-btn linkedin">
              <span className="dot"></span> LinkedIn
            </button>
            <button className="social-btn microsoft">
              <span className="dot"></span> Microsoft
            </button>
          </div>

          <p className="auth-footer">
            New to the portal? <Link to="/register">Create an account</Link>
          </p>
        </div>

        <div className="auth-image-side">
          <div className="image-overlay"></div>
          <div className="image-content">
            <div className="security-badge">
              <Shield size={20} />
              <span>Secure Connection</span>
            </div>
            <h3>Empowering Global Talent</h3>
            <p>Access your personalized dashboard, track your learning progress, and stay updated with the latest opportunities at NeST Digital.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
