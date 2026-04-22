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
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import heroBg from '../assets/hero-bg.jpg';
import splash1 from '../assets/splash1.jpg';
import splash2 from '../assets/splash2.jpg';
import splash3 from '../assets/splash3.jpg';
import nestMainLogo from '../assets/nest_logo.png';

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

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');
  const [splashIndex, setSplashIndex] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState<number | null>(null);
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
          <a href="#home" className="logo">
            <img src={nestMainLogo} alt="NeST Digital" className="nest-main-logo" style={{ background: '#fff', padding: '6px 14px', borderRadius: '8px' }} />
          </a>
          <nav className="desktop-nav">
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className={`nav-link ${activeSection === link.href ? 'active' : ''}`}>{link.name}</a>
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
              <li><Link to="/login" className="btn-navy mobile-btn">LOGIN</Link></li>
              <li><Link to="/register" className="btn-red mobile-btn">REGISTER</Link></li>
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
            <motion.span className="hero-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              🚀 Talent Engagement &amp; Alumni Tracking Portal
            </motion.span>
            <h1 className="hero-title">TRACK. ENGAGE. HIRE.</h1>
            <p className="hero-subtitle">
              A centralized platform to maintain long-term relationships with alumni, interns,
              trainees, and event participants — and identify the best candidates for your next opportunity.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-hero-primary">
                JOIN THE PORTAL
              </Link>
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
              The Talent Engagement &amp; Alumni Tracking Portal is designed to maintain lifelong
              connections. Whether you're an alumnus sharing wisdom or a trainee looking for your
              first break, we provide the platform to thrive.
            </p>
            <ul className="about-features">
              <li><CheckCircle size={20} className="text-primary" /> Personalized growth tracking</li>
              <li><CheckCircle size={20} className="text-primary" /> Direct connection to industry experts</li>
              <li><CheckCircle size={20} className="text-primary" /> Early access to job openings</li>
            </ul>
            <Link to="/register" className="btn-red inline-btn">Explore Opportunities <ArrowRight size={18} /></Link>
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
      <section id="events" className="features-section" style={{ background: '#ffffff' }}>
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '4rem' }}
          >
            <span className="section-tag" style={{ color: 'var(--primary)', fontWeight: 800 }}>Upcoming Events</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Connect, Learn & Grow Together</h2>
            <p style={{ maxWidth: '650px', margin: '0 auto' }}>Join exclusive alumni-powered events ranging from tech talks to networking meetups.</p>
          </motion.div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '24px' 
          }}>
            {[
              { icon: <Zap size={24} strokeWidth={2.5} />, title: 'Annual Tech Summit 2025', desc: 'A flagship 2-day conference featuring keynotes from industry leaders, panel discussions, and live demos from NeST alumni working at FAANG companies.', meta: 'May 15–16 • Kochi', iconType: 'lightning' },
              { icon: <Rocket size={24} strokeWidth={2.5} />, title: 'Innovation Hackathon', desc: 'A 48-hour hackathon where alumni and current students team up to solve real-world industry challenges with prizes worth ₹5,00,000.', meta: 'June 8–10 • Virtual + Onsite', iconType: 'rocket' },
              { icon: <Users size={24} strokeWidth={2.5} />, title: 'Mentorship Mixer', desc: 'An intimate networking session connecting fresh graduates with experienced alumni mentors across domains like AI, cloud, and product management.', meta: 'Apr 20 • Bangalore', highlight: true, iconType: 'users' },
              { icon: <Award size={24} strokeWidth={2.5} />, title: 'Career Fair & Recruitment Drive', desc: 'An exclusive recruitment drive with 30+ partner companies offering direct interviews and referrals to NeST alumni and trainees.', meta: 'Jul 5 • Hybrid', iconType: 'award' },
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                style={{ 
                  background: '#ffffff', 
                  borderRadius: '24px', 
                  padding: '32px',
                  border: event.highlight ? '2px solid rgba(200,16,46,0.1)' : '1px solid #f0f0f0',
                  boxShadow: event.highlight ? '0 20px 40px rgba(200,16,46,0.08)' : '0 10px 30px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: event.highlight ? 'var(--primary)' : 'rgba(200,16,46,0.08)',
                  color: event.highlight ? '#ffffff' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  {event.icon}
                </div>
                
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 800, 
                  color: event.highlight ? 'var(--primary)' : '#1a1a1a', 
                  marginBottom: '12px',
                  lineHeight: 1.3
                }}>
                  {event.title}
                </h3>
                
                <p style={{ 
                  fontSize: '0.95rem', 
                  color: '#666', 
                  lineHeight: 1.6,
                  marginBottom: '24px',
                  flexGrow: 1
                }}>
                  {event.desc}
                </p>

                <div style={{ 
                  marginTop: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  color: '#888', 
                  fontSize: '0.85rem', 
                  fontWeight: 600,
                  paddingTop: '20px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <Calendar size={14} style={{ color: 'var(--primary)' }} /> {event.meta}
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
            style={{ marginBottom: '4rem' }}
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
              { icon: <Globe size={24} strokeWidth={2.5} />, title: 'Senior Software Engineer', company: 'NeST Digital — Engineering', location: 'Kochi, Kerala', desc: 'Architect and develop enterprise-grade web applications using React, Java, and Spring Boot for NeST Digital\'s product engineering division.', tags: ['Full-time', '3–5 yrs', 'Internal Hiring'] },
              { icon: <BarChart2 size={24} strokeWidth={2.5} />, title: 'AI / ML Engineer', company: 'NeST Digital — Data & AI', location: 'Trivandrum, Kerala', desc: 'Design and deploy machine learning models and intelligent automation pipelines for NeST Digital\'s smart manufacturing and IoT solutions.', tags: ['Full-time', '2–4 yrs', 'Internal Hiring'] },
              { icon: <Target size={24} strokeWidth={2.5} />, title: 'HR Business Partner', company: 'NeST Digital — People & Culture', location: 'Kochi, Kerala', desc: 'Drive talent strategy, employee engagement, and organizational development initiatives across NeST Digital\'s engineering teams.', highlight: true, tags: ['Full-time', '4–7 yrs', 'Internal Hiring'] },
              { icon: <Shield size={24} strokeWidth={2.5} />, title: 'Cloud Infrastructure Lead', company: 'NeST Digital — IT Infrastructure', location: 'CSEZ, Kakkanad', desc: 'Lead the cloud migration strategy and manage hybrid infrastructure across AWS and Azure for NeST Digital\'s enterprise clients.', tags: ['Full-time', '5+ yrs', 'Internal Hiring'] },
            ].map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                style={{ 
                  background: '#ffffff', 
                  borderRadius: '24px', 
                  padding: '32px',
                  border: job.highlight ? '2px solid rgba(200,16,46,0.1)' : '1px solid #f0f0f0',
                  boxShadow: job.highlight ? '0 20px 40px rgba(200,16,46,0.08)' : '0 10px 30px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: job.highlight ? 'var(--primary)' : 'rgba(200,16,46,0.08)',
                  color: job.highlight ? '#ffffff' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  {job.icon}
                </div>
                
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 800, 
                  color: job.highlight ? 'var(--primary)' : '#1a1a1a', 
                  marginBottom: '8px',
                  lineHeight: 1.3
                }}>
                  {job.title}
                </h3>

                <div style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 700, 
                  color: 'var(--primary)', 
                  marginBottom: '8px'
                }}>
                  {job.company}
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  color: '#94a3b8', 
                  fontSize: '0.85rem', 
                  fontWeight: 600,
                  marginBottom: '16px'
                }}>
                  <MapPin size={14} /> {job.location}
                </div>
                
                <p style={{ 
                  fontSize: '0.95rem', 
                  color: '#666', 
                  lineHeight: 1.6,
                  marginBottom: '24px',
                  flexGrow: 1
                }}>
                  {job.desc}
                </p>

                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px',
                  paddingTop: '20px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  {job.tags.map((tag, j) => (
                    <span 
                      key={j}
                      style={{ 
                        fontSize: '0.75rem', 
                        background: tag === 'Internal Hiring' ? '#ECFDF5' : (tag.includes('yrs') ? '#F3F4F6' : '#FEF2F2'),
                        color: tag === 'Internal Hiring' ? '#065F46' : (tag.includes('yrs') ? '#374151' : '#991B1B'),
                        padding: '4px 12px', 
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
      <section className="cta-section">
        <div className="cta-light-sweep" />
        <div className="cta-lighting-overlay" />
        
        <motion.div 
          className="container cta-content cta-floating-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
              }
            }
          }}
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
            }}
          >
            Ready to Transform Your Career?
          </motion.h2>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
          >
            Join the thousands of professionals who have already connected with NeST Digital.
          </motion.p>
          <motion.div 
            className="cta-actions"
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "backOut" } }
            }}
          >
            <Link to="/register" className="btn-hero-primary">Get Started Now</Link>
            <a href="#contact" className="btn-hero-ghost-dark">Contact Support</a>
          </motion.div>
        </motion.div>
      </section>

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
    </div>
  );
};

export default Home;
