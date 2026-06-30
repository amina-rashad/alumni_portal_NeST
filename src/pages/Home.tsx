/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Menu, X, Users,
  ArrowRight, MapPin, Mail, Phone, Linkedin, Twitter, Facebook,
  BarChart2,
  CheckCircle, Shield,
  Rocket, 
  Calendar, Star, Target, Award, Zap, Globe
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import heroBg from '../assets/hero-bg.jpg';
import splash1 from '../assets/splash1.jpg';
import splash2 from '../assets/splash2.jpg';
import splash3 from '../assets/splash3.jpg';
import nestMainLogo from '../assets/nest_logo.png';
import nestIcon from '../assets/nest_icon.png';
import CinematicCTA from '../components/CinematicCTA';
import LoginModal from '../components/LoginModal';


/* -- Animated Counter -- */
const Counter: React.FC<{ end: number; suffix: string; label: string }> = ({ end, suffix, label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 25);
    return () => clearInterval(timer);
  }, [inView, end]);
  return (
    <div className="stat-item" ref={ref}>
      <h3>{count}{suffix}</h3>
      <p>{label}</p>
    </div>
  );
};

const aboutImages = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop"
];

const AboutSplash: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % aboutImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="about-splash-container">
      <AnimatePresence>
        <motion.div
          key={index}
          className="about-splash-card"
          initial={{ opacity: 0, borderRadius: '40% 10% 40% 10%', scale: 1.05 }}
          animate={{ opacity: 1, borderRadius: '24px', scale: 1 }}
          exit={{ opacity: 0, borderRadius: '10% 40% 10% 40%', scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <img src={aboutImages[index]} alt="NeST Experience" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* -- Tech Interactive Background for Events -- */
const TechInteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    // Initialize particles
    const particleCount = Math.min(60, Math.floor((width * height) / 15000));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: i % 3 === 0 ? 'rgba(200, 16, 46, 0.4)' : i % 3 === 1 ? 'rgba(0, 200, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)',
      });
    }

    let mouse = { x: -1000, y: -1000, radius: 150 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);
    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    let time = 0;

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      // 1. Moving gradient mesh (drawn directly on canvas for smooth colors)
      const gradient1 = ctx.createRadialGradient(
        width * 0.2 + Math.sin(time * 0.005) * 100,
        height * 0.3 + Math.cos(time * 0.005) * 100,
        0,
        width * 0.2,
        height * 0.3,
        Math.max(width, height) * 0.5
      );
      gradient1.addColorStop(0, 'rgba(200, 16, 46, 0.08)');
      gradient1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      const gradient2 = ctx.createRadialGradient(
        width * 0.8 + Math.cos(time * 0.004) * 150,
        height * 0.7 + Math.sin(time * 0.004) * 150,
        0,
        width * 0.8,
        height * 0.7,
        Math.max(width, height) * 0.6
      );
      gradient2.addColorStop(0, 'rgba(26, 38, 82, 0.25)');
      gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      // 2. Abstract tech waves
      ctx.lineWidth = 1;
      // Wave 1 - Crimson
      ctx.beginPath();
      ctx.moveTo(0, height * 0.8);
      for (let x = 0; x < width; x++) {
        const y = Math.sin(x * 0.003 + time * 0.015) * 25 + Math.cos(x * 0.0015 + time * 0.008) * 12 + height * 0.75;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(200, 16, 46, 0.06)';
      ctx.stroke();

      // Wave 2 - Cyan
      ctx.beginPath();
      ctx.moveTo(0, height * 0.82);
      for (let x = 0; x < width; x++) {
        const y = Math.cos(x * 0.0025 + time * 0.012) * 20 + Math.sin(x * 0.002 + time * 0.006) * 15 + height * 0.78;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.04)';
      ctx.stroke();

      // 3. Floating particles & Network Connection lines
      particles.forEach((p, index) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interaction with mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 1.5;
          p.y += (dy / dist) * force * 1.5;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Connect to neighbors
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ndx = p.x - p2.x;
          const ndy = p.y - p2.y;
          const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
          if (ndist < 130) {
            const alpha = (130 - ndist) / 130 * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

/* -- Card Micro Effects -- */
const CardMicroEffects: React.FC<{ isHovered: boolean; highlight?: boolean }> = ({ isHovered, highlight }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    // Initialize micro particles
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    let time = 0;

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      // Draw active hover gradient mesh
      if (isHovered) {
        const hoverGrad = ctx.createRadialGradient(
          width * 0.5 + Math.sin(time * 0.02) * (width * 0.2),
          height * 0.5 + Math.cos(time * 0.02) * (height * 0.2),
          0,
          width * 0.5,
          height * 0.5,
          width * 0.8
        );
        if (highlight) {
          hoverGrad.addColorStop(0, 'rgba(200, 16, 46, 0.12)');
          hoverGrad.addColorStop(1, 'rgba(200, 16, 46, 0.02)');
        } else {
          hoverGrad.addColorStop(0, 'rgba(0, 200, 255, 0.08)');
          hoverGrad.addColorStop(1, 'rgba(26, 38, 82, 0.01)');
        }
        ctx.fillStyle = hoverGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw subtle wave
      ctx.beginPath();
      ctx.moveTo(0, height * 0.9);
      for (let x = 0; x < width; x++) {
        const y = Math.sin(x * 0.01 + time * 0.03) * (isHovered ? 6 : 3) + height * 0.92;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = highlight 
        ? `rgba(200, 16, 46, ${isHovered ? 0.15 : 0.05})` 
        : `rgba(255, 255, 255, ${isHovered ? 0.12 : 0.04})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Render micro particles
      particles.forEach((p) => {
        p.x += p.vx * (isHovered ? 1.8 : 1.0);
        p.y += p.vy * (isHovered ? 1.8 : 1.0);

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = highlight 
          ? `rgba(200, 16, 46, ${isHovered ? p.alpha * 1.5 : p.alpha})` 
          : `rgba(255, 255, 255, ${isHovered ? p.alpha * 1.5 : p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isHovered, highlight]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');
  const [splashIndex, setSplashIndex] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState<number | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const splashImages = [splash1, splash2, splash3];
  const splashLabels = ['Corporate Excellence', 'Team Collaboration', 'Innovation at Work'];

  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Splash auto-rotate every 3s
    const splashTimer = setInterval(() => {
      setSplashIndex(prev => (prev + 1) % splashImages.length);
    }, 3000);

    // Scroll tracking for inner .app div
    const handleScroll = () => {
      if (appRef.current) setIsScrolled(appRef.current.scrollTop > 60);
    };
    
    const appEl = appRef.current;
    if (appEl) appEl.addEventListener('scroll', handleScroll);

    // Active section tracking
    const sectionIds = ['home', 'about', 'features', 'users', 'events', 'jobs', 'contact'];
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { 
          if (entry.isIntersecting) {
            setActiveSection(`#${id}`);
          }
        },
        { 
          threshold: 0.35,
          root: appEl || null // Observe relative to the app container
        }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      clearInterval(splashTimer);
      if (appEl) appEl.removeEventListener('scroll', handleScroll);
      observers.forEach(o => o.disconnect());
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      setShowLoginModal(true);
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'User Types', href: '#users' },
    { name: 'Events', href: '#events' },
    { name: 'Jobs', href: '#jobs' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <div className="app" ref={appRef}>
      {/* -- Header -- */}
      <header className={`header ${isScrolled ? 'header-scrolled' : ''} ${activeSection !== '#home' ? 'header-glass' : ''}`}>
        <div className="container header-container">
          <a 
            href="#home" 
            className="logo" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              ...( (activeSection !== '#home' && !isScrolled) ? {
                background: 'rgba(5, 13, 30, 0.95)',
                padding: '6px 16px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
              } : {
                background: 'transparent',
                padding: '0',
                borderRadius: '0',
                boxShadow: 'none'
              })
            }}
          >
            <img 
              src={nestIcon} 
              alt="NeST" 
              style={{ 
                height: '36px', 
                objectFit: 'contain',
                borderRadius: '50%'
              }} 
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1', textAlign: 'left' }}>
              <span style={{ 
                fontFamily: "'Sora', 'Inter', sans-serif", 
                fontSize: '18px', 
                fontWeight: 800, 
                color: '#ffffff', 
                letterSpacing: '0.02em'
              }}>NeST</span>
              <span style={{ 
                fontFamily: "'Inter', sans-serif", 
                fontSize: '9px', 
                fontWeight: 700, 
                color: '#cbd5e1', 
                letterSpacing: '0.12em'
              }}>DIGITAL</span>
            </div>
            
            <div style={{ 
              height: '24px', 
              width: '1px', 
              backgroundColor: 'rgba(255, 255, 255, 0.25)', 
              margin: '0 4px'
            }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.15', textAlign: 'left' }}>
              <span style={{ 
                fontFamily: "'Inter', sans-serif", 
                fontSize: '9px', 
                fontWeight: 500, 
                color: '#cbd5e1', 
                letterSpacing: '0.08em'
              }}>ENGINEERING</span>
              <span style={{ 
                fontFamily: "'Inter', sans-serif", 
                fontSize: '9px', 
                fontWeight: 500, 
                color: '#cbd5e1', 
                letterSpacing: '0.08em'
              }}>TRANSFORMATION</span>
            </div>
          </a>
          <nav className="desktop-nav">
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className={`nav-link ${activeSection === link.href ? 'active' : ''}`}>{link.name}</a>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowLoginModal(true)} className="btn-navy" style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>LOGIN</button>
          </nav>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-nav-overlay"
          >
            <ul className="mobile-nav-list">
              {navLinks.map((link) => (
                <li key={link.name} onClick={() => setMobileMenuOpen(false)}>
                  <a href={link.href}>{link.name}</a>
                </li>
              ))}
              <li><button onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true); }} className="btn-navy mobile-btn" style={{ cursor: 'pointer', border: 'none', width: '100%', fontFamily: 'inherit' }}>LOGIN</button></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section id="home" className="hero">
        <div className="hero-background">
          <img src={heroBg} alt="NeST Digital Portal" />
          <div className="hero-overlay" />
        </div>
        <div className="container hero-content hero-two-col">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="hero-text-area"
          >
            <h1 className="hero-title" style={{ fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: 0, marginBottom: '1rem' }}>
              <span style={{ fontWeight: 800 }}>NDA</span>
              <span style={{ fontWeight: 300 }}>Connect</span>
              <div style={{ width: '14px', height: '14px', backgroundColor: '#c8102e', borderRadius: '50%', display: 'inline-block', marginLeft: '4px' }} />
            </h1>
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}
            >
              <span style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 600, 
                fontSize: '1.2rem', 
                color: 'rgba(255, 255, 255, 0.85)', 
                letterSpacing: '0.2em' 
              }}>YOUR CAREER PARTNER</span>
            </motion.div>
            <p className="hero-subtitle">
              A centralized platform to maintain long-term relationships with alumni, interns,
              trainees, and event participants — and identify the best candidates for your next opportunity.
            </p>
            <div className="hero-actions">
              <a href="#about" className="btn-hero-primary">
                LEARN MORE
              </a>
              <motion.a href="#features" className="btn-hero-ghost" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div className="play-icon-container">
                  <Play size={18} fill="currentColor" />
                </div>
                <span>Explore Features</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Image Splash Slider */}
          <div className="hero-cards-area">
            <div className="splash-img-container">
              <AnimatePresence mode="wait">
                <motion.div
                  key={splashIndex}
                  className="splash-img-slide"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                  <img src={splashImages[splashIndex]} alt={splashLabels[splashIndex]} />
                  <div className="splash-img-overlay" />
                  <div className="splash-img-label">{splashLabels[splashIndex]}</div>
                </motion.div>
              </AnimatePresence>

              {/* Dot indicators */}
              <div className="splash-dots">
                {splashImages.map((_, i) => (
                  <button
                    key={i}
                    className={`splash-dot ${i === splashIndex ? 'active' : ''}`}
                    onClick={() => setSplashIndex(i)}
                  />
                ))}
              </div>

              {/* Stat badges overlaid */}
              <div className="splash-stat-badges">
                {[
                  { value: '5,000+', label: 'Alumni Network' },
                  { value: '300+', label: 'Jobs Posted' },
                  { value: '95%', label: 'Match Accuracy' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    className="splash-stat-badge"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.2, duration: 0.6 }}
                  >
                    <span className="ssb-value">{s.value}</span>
                    <span className="ssb-label">{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Stats Bar -- */}
      <section className="stats-section">
        <div className="container stats-grid">
          <Counter end={5000} suffix="+" label="Portal Members" />
          <Counter end={120} suffix="+" label="Courses Available" />
          <Counter end={300} suffix="+" label="Job Opportunities Posted" />
          <Counter end={95} suffix="%" label="Candidate Match Accuracy" />
        </div>
      </section>

      {/* -- About -- */}
      <section id="about" className="about-section">
        <div className="container about-grid">
          <AboutSplash />
          <motion.div 
            className="about-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">Our Vision</span>
            <h2>Bridging the Gap Between Talent &amp; Opportunity</h2>
            <p>
              <strong>NDA Connect</strong> is designed to maintain lifelong
              connections. Whether you're an alumnus sharing wisdom or a trainee looking for your
              first break, we provide the platform to thrive.
            </p>
            <ul className="about-features">
              <li><CheckCircle size={20} className="text-primary" /> Personalized growth tracking</li>
              <li><CheckCircle size={20} className="text-primary" /> Direct connection to industry experts</li>
              <li><CheckCircle size={20} className="text-primary" /> Early access to job openings</li>
            </ul>
            <a href="#features" className="btn-red inline-btn">Explore Features <ArrowRight size={18} /></a>
          </motion.div>
        </div>
      </section>

      {/* -- Features -- */}
      <section id="features" className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-tag" style={{ letterSpacing: '4px' }}>Platform Capabilities</span>
            <h2 style={{ fontSize: '48px', fontWeight: 900 }}>Everything You Need in One Portal</h2>
            <p style={{ fontSize: '18px', opacity: 0.7 }}>Built to cover every aspect of talent engagement — from tracking to hiring.</p>
          </motion.div>
          <div className="features-grid cinematic-grid">
            {[
              { id: 'talent-tracking', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop', title: 'Talent Tracking', desc: 'Monitor skills, course completions, and engagement in real-time.' },
              { id: 'job-management', img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=800&auto=format&fit=crop', title: 'Job Management', desc: 'Streamline vacancies and identify top-tier matches instantly.' },
              { id: 'learning-courses', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop', title: 'Learning & Courses', desc: 'Dynamic learning paths built for modern industrial excellence.' },
              { id: 'assessments', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop', title: 'Assessments', desc: 'Advanced cognitive & skill testing with automated AI scoring.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-50px" }}
                className="cinematic-card"
              >
                <Link to={`/platform-capabilities/${f.id}`} className="card-inner">
                  <div className="card-image-bg">
                    <img src={f.img} alt={f.title} />
                    <div className="card-overlay-gradient" />
                  </div>
                  <div className="card-content-cinematic">
                    <div className="card-title-wrap">
                      <div className="card-line" />
                      <h3>{f.title}</h3>
                    </div>
                    <p>{f.desc}</p>
                    <div className="card-action-hint">
                      <span>Explore Detail</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- User Types -- */}
      <section id="users" className="users-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">Network Members</span>
            <h2>Who is this for?</h2>
            <p>Our ecosystem connects diverse talent groups with organizational goals.</p>
          </motion.div>
          <div className="users-grid">
            {[
              { 
                id: 'alumni',
                img: "https://images.unsplash.com/photo-1523287562758-66c7fc58967f?q=80&w=800&auto=format&fit=crop", 
                title: 'Alumni', 
                desc: 'Former employees & trainees',
                color: '#C8102E'
              },
              { 
                id: 'interns',
                img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop", 
                title: 'Interns', 
                desc: 'Current & former interns',
                color: '#1E4FA0'
              },
              { 
                id: 'trainees',
                img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop", 
                title: 'Trainees', 
                desc: 'Skill-building participants',
                color: '#10B981'
              },
              { 
                id: 'iv-students',
                img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop", 
                title: 'IV Students', 
                desc: 'Industrial Visit visitors',
                color: '#F59E0B'
              },
            ].map((u, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1] 
                }}
                viewport={{ once: true, margin: "-50px" }}
                className={`gradient-border-wrapper ${selectedUserType === i ? 'active' : ''}`}
                onClick={() => {
                  setSelectedUserType(i);
                  setTimeout(() => navigate(`/user-type-overview/${u.id}`), 400);
                }}
                style={{ '--primary': u.color } as any}
              >
                <div className={`user-card-premium ${selectedUserType === i ? 'active' : ''}`}>
                  <div className="user-card-image-wrapper">
                    <img 
                      src={u.img} 
                      alt={u.title} 
                      className="user-card-image"
                    />
                  </div>
                  <div className="user-card-content">
                    <h3 style={{ color: selectedUserType === i ? u.color : '#111827' }}>
                      {u.title}
                    </h3>
                    <p>{u.desc}</p>
                  </div>
                  {selectedUserType === i && (
                    <div 
                      className="user-card-active-indicator"
                      style={{ backgroundColor: u.color }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Events Section -- */}
      <section 
        id="events" 
        className="features-section" 
        style={{ 
          background: '#040612', 
          position: 'relative', 
          overflow: 'hidden',
          padding: '100px 0'
        }}
      >
        <TechInteractiveBackground />
        
        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '2rem' }}
          >
            <span className="section-tag" style={{ color: 'var(--primary)', fontWeight: 800 }}>Upcoming Events</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: '#ffffff' }}>Connect, Learn & Grow Together</h2>
            <p style={{ maxWidth: '650px', margin: '0 auto', color: '#94a3b8' }}>Join exclusive alumni-powered events ranging from tech talks to networking meetups.</p>
          </motion.div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '24px' 
          }}>
            {[
              { icon: <Zap size={20} strokeWidth={2.5} />, title: 'Annual Tech Summit 2025', desc: 'A flagship 2-day conference featuring keynotes from industry leaders, panel discussions, and live demos from NeST alumni working at FAANG companies.', meta: 'May 15–16 • Kochi', iconType: 'lightning' },
              { icon: <Rocket size={20} strokeWidth={2.5} />, title: 'Innovation Hackathon', desc: 'A 48-hour hackathon where alumni and current students team up to solve real-world industry challenges with prizes worth ₹5,00,000.', meta: 'June 8–10 • Virtual + Onsite', iconType: 'rocket' },
              { icon: <Users size={20} strokeWidth={2.5} />, title: 'Mentorship Mixer', desc: 'An intimate networking session connecting fresh graduates with experienced alumni mentors across domains like AI, cloud, and product management.', meta: 'Apr 20 • Bangalore', highlight: true, iconType: 'users' },
              { icon: <Award size={20} strokeWidth={2.5} />, title: 'Career Fair & Recruitment Drive', desc: 'An exclusive recruitment drive with 30+ partner companies offering direct interviews and referrals to NeST alumni and trainees.', meta: 'Jul 5 • Hybrid', iconType: 'award' },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                onMouseEnter={() => setHoveredEvent(i)}
                onMouseLeave={() => setHoveredEvent(null)}
                style={{ 
                  background: 'rgba(15, 23, 42, 0.4)', 
                  backdropFilter: 'blur(12px)',
                  borderRadius: '18px', 
                  padding: '24px',
                  border: event.highlight ? '1px solid rgba(200, 16, 46, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: event.highlight ? '0 15px 30px rgba(200,16,46,0.12)' : '0 8px 20px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transform: hoveredEvent === i ? 'translateY(-4px)' : 'none'
                }}
              >
                <CardMicroEffects isHovered={hoveredEvent === i} highlight={event.highlight} />
                
                <div style={{ 
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: event.highlight ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: event.highlight ? '#ffffff' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                  position: 'relative',
                  zIndex: 10
                }}>
                  {event.icon}
                </div>
                
                <h3 style={{ 
                  fontSize: '1.12rem', 
                  fontWeight: 800, 
                  color: event.highlight ? '#ff4d6d' : '#ffffff', 
                  marginBottom: '8px',
                  lineHeight: 1.3,
                  position: 'relative',
                  zIndex: 10
                }}>
                  {event.title}
                </h3>
                
                <p style={{ 
                  fontSize: '0.86rem', 
                  color: '#94a3b8', 
                  lineHeight: 1.5,
                  marginBottom: '18px',
                  flexGrow: 1,
                  position: 'relative',
                  zIndex: 10
                }}>
                  {event.desc}
                </p>

                <div style={{ 
                  marginTop: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: '#cbd5e1', 
                  fontSize: '0.8rem', 
                  fontWeight: 600,
                  paddingTop: '14px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  zIndex: 10
                }}>
                  <Calendar size={12} style={{ color: 'var(--primary)' }} /> {event.meta}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Jobs Section -- */}
      <section id="jobs" className="users-section" style={{ background: '#f8f9fb' }}>
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '2rem' }}
          >
            <span className="section-tag" style={{ color: 'var(--primary)', fontWeight: 800 }}>Internal Openings</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Grow Your Career at NeST Digital</h2>
            <p style={{ maxWidth: '650px', margin: '0 auto' }}>Explore current openings across departments — build your future right here at NeST Digital.</p>
          </motion.div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '24px' 
          }}>
            {[
              { icon: <Globe size={20} strokeWidth={2.5} />, title: 'Senior Software Engineer', company: 'NeST Digital — Engineering', location: 'Kochi, Kerala', desc: 'Architect and develop enterprise-grade web applications using React, Java, and Spring Boot for NeST Digital\'s product engineering division.', tags: ['Full-time', '3–5 yrs', 'Internal Hiring'] },
              { icon: <BarChart2 size={20} strokeWidth={2.5} />, title: 'AI / ML Engineer', company: 'NeST Digital — Data & AI', location: 'Trivandrum, Kerala', desc: 'Design and deploy machine learning models and intelligent automation pipelines for NeST Digital\'s smart manufacturing and IoT solutions.', tags: ['Full-time', '2–4 yrs', 'Internal Hiring'] },
              { icon: <Target size={20} strokeWidth={2.5} />, title: 'HR Business Partner', company: 'NeST Digital — People & Culture', location: 'Kochi, Kerala', desc: 'Drive talent strategy, employee engagement, and organizational development initiatives across NeST Digital\'s engineering teams.', highlight: true, tags: ['Full-time', '4–7 yrs', 'Internal Hiring'] },
              { icon: <Shield size={20} strokeWidth={2.5} />, title: 'Cloud Infrastructure Lead', company: 'NeST Digital — IT Infrastructure', location: 'CSEZ, Kakkanad', desc: 'Lead the cloud migration strategy and manage hybrid infrastructure across AWS and Azure for NeST Digital\'s enterprise clients.', tags: ['Full-time', '5+ yrs', 'Internal Hiring'] },
            ].map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                style={{ 
                  background: '#ffffff', 
                  borderRadius: '18px', 
                  padding: '24px',
                  border: job.highlight ? '2px solid rgba(200,16,46,0.1)' : '1px solid #f0f0f0',
                  boxShadow: job.highlight ? '0 15px 30px rgba(200,16,46,0.12)' : '0 8px 20px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: job.highlight ? 'var(--primary)' : 'rgba(200,16,46,0.08)',
                  color: job.highlight ? '#ffffff' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}>
                  {job.icon}
                </div>
                
                <h3 style={{ 
                  fontSize: '1.12rem', 
                  fontWeight: 800, 
                  color: job.highlight ? 'var(--primary)' : '#1a1a1a', 
                  marginBottom: '6px',
                  lineHeight: 1.3
                }}>
                  {job.title}
                </h3>

                <div style={{ 
                  fontSize: '0.82rem', 
                  fontWeight: 700, 
                  color: 'var(--primary)', 
                  marginBottom: '6px'
                }}>
                  {job.company}
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  color: '#94a3b8', 
                  fontSize: '0.78rem', 
                  fontWeight: 600,
                  marginBottom: '12px'
                }}>
                  <MapPin size={12} /> {job.location}
                </div>
                
                <p style={{ 
                  fontSize: '0.86rem', 
                  color: '#666', 
                  lineHeight: 1.5,
                  marginBottom: '18px',
                  flexGrow: 1
                }}>
                  {job.desc}
                </p>

                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '6px',
                  paddingTop: '14px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  {job.tags.map((tag, j) => (
                    <span 
                      key={j}
                      style={{ 
                        fontSize: '0.7rem', 
                        background: tag === 'Internal Hiring' ? '#ECFDF5' : (tag.includes('yrs') ? '#F3F4F6' : '#FEF2F2'),
                        color: tag === 'Internal Hiring' ? '#065F46' : (tag.includes('yrs') ? '#374151' : '#991B1B'),
                        padding: '3px 10px', 
                        borderRadius: '99px', 
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {tag === 'Internal Hiring' && <Star size={10} />}
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- CTA -- */}
      <CinematicCTA />

      {/* -- Footer -- */}
      <footer id="contact" className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <img src={nestMainLogo} alt="NeST Digital" className="nest-main-logo sm" style={{ background: '#fff', padding: '4px 10px', borderRadius: '6px' }} />
            </div>
            <p className="footer-desc">Building future-proof talent through continuous engagement and strategic tracking.</p>
            <div className="social-links">
              <a href="#"><Linkedin size={18} /></a>
              <a href="#"><Twitter size={18} /></a>
              <a href="#"><Facebook size={18} /></a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#users">User Types</a></li>
            </ul>
          </div>
          <div className="footer-links">
             <h4>Resources</h4>
            <ul>
              <li><a href="#">Learning Center</a></li>
              <li><a href="#">Job Board</a></li>
              <li><a href="#">Events</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <ul>
              <li><MapPin size={18} /> NeST Digital, Plot No. 2, <br />CSEZ, Kakkanad, Kochi, Kerala</li>
              <li><Phone size={18} /> +91 484 2413100</li>
              <li><Mail size={18} /> info@nestdigital.io</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 NeST Digital. All Rights Reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </footer>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Home;
