import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import nestMainLogo from '../assets/nest_logo.png';
import './Auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    alert('Login successful! Welcome back.');
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
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
                />
              </div>
            </div>

            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Keep me logged in</label>
            </div>

            <button type="submit" className="auth-btn">
              <LogIn size={18} /> Sign In
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
