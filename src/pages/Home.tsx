import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Menu, X, Users,
  ArrowRight, MapPin, Mail, Phone, Linkedin, Twitter, Facebook,
  Briefcase, BookOpen, BarChart2,
  UserCheck, CheckCircle, Shield,
  GraduationCap, Rocket, Compass, Building2, Ticket
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../App.css';
import heroBg from '../assets/hero-bg.jpg';
import splash1 from '../assets/splash1.jpg';
import splash2 from '../assets/splash2.jpg';
import splash3 from '../assets/splash3.jpg';
import nestMainLogo from '../assets/nest_logo.png';

/* ── Animated Counter ── */
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');
  const [splashIndex, setSplashIndex] = useState(0);
  const splashImages = [splash1, splash2, splash3];
  const splashLabels = ['Corporate Excellence', 'Team Collaboration', 'Innovation at Work'];

  useEffect(() => {
    // Splash auto-rotate every 3s
    const splashTimer = setInterval(() => {
      setSplashIndex(prev => (prev + 1) % splashImages.length);
    }, 3000);

    // Scroll
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);

    // Active section tracking
    const sectionIds = ['home', 'about', 'features', 'users', 'events', 'jobs', 'contact'];
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(`#${id}`); },
        { threshold: 0.35 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      clearInterval(splashTimer);
      window.removeEventListener('scroll', handleScroll);
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
    <div className="app">
      {/* ── Header ── */}
      <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
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

      {/* ── Stats Bar ── */}
      <section className="stats-section">
        <div className="container stats-grid">
          <Counter end={5000} suffix="+" label="Portal Members" />
          <Counter end={120} suffix="+" label="Courses Available" />
          <Counter end={300} suffix="+" label="Job Opportunities Posted" />
          <Counter end={95} suffix="%" label="Candidate Match Accuracy" />
        </div>
      </section>

      {/* ── About ── */}
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

      {/* ── Features ── */}
      <section id="features" className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">Platform Capabilities</span>
            <h2>Everything You Need in One Portal</h2>
            <p>Built to cover every aspect of talent engagement — from tracking to hiring.</p>
          </motion.div>
          <div className="features-grid">
            {[
              { icon: <UserCheck />, title: 'Talent Tracking', desc: 'Track skills, course completions, and engagement of every individual.' },
              { icon: <Briefcase />, title: 'Job Management', desc: 'Post vacancies and get smart recommendations for your open positions.' },
              { icon: <BookOpen />, title: 'Learning & Courses', desc: 'Access structured courses, upload materials, and monitor progress.' },
              { icon: <BarChart2 />, title: 'Assessments', desc: 'Conduct quizzes and skills assessments with automated scoring.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                className="feature-card"
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── User Types ── */}
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
              { icon: <GraduationCap size={44} strokeWidth={1.2} />, title: 'Alumni', desc: 'Former employees & trainees' },
              { icon: <Rocket size={44} strokeWidth={1.2} />, title: 'Interns', desc: 'Current & former interns' },
              { icon: <Compass size={44} strokeWidth={1.2} />, title: 'Trainees', desc: 'Skill-building participants' },
              { icon: <Building2 size={44} strokeWidth={1.2} />, title: 'IV Students', desc: 'Industrial Visit visitors' },
              { icon: <Ticket size={44} strokeWidth={1.2} />, title: 'Event Leads', desc: 'Event participants' },
            ].map((u, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                className="user-card"
              >
                <div className="user-icon-container">
                  <motion.div
                    className="user-icon"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2
                    }}
                  >
                    {u.icon}
                  </motion.div>
                </div>
                <h3>{u.title}</h3>
                <p>{u.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">Simple Process</span>
            <h2>How the Portal Works</h2>
          </motion.div>
          <div className="how-grid">
            {[
              { step: '01', title: 'Register', desc: 'Create your profile and specify your relationship with NeST.' },
              { step: '02', title: 'Engage', desc: 'Participate in courses, events, and skill assessments.' },
              { step: '03', title: 'Grow', desc: 'Earn certifications and badges as you progress.' },
              { step: '04', title: 'Hired', desc: 'Get matched with relevant career opportunities.' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                className="how-card"
              >
                <span className="how-step">{s.step}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="roles-section">
        <div className="container roles-grid">
          <motion.div
            className="role-card admin-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="role-icon"><Shield size={36} /></div>
            <h3>Administrators</h3>
            <p>Full control over the platform. Manage users, track global metrics, post jobs, and curate content.</p>
            <ul className="role-list">
              <li><CheckCircle size={16} /> User Management</li>
              <li><CheckCircle size={16} /> Job Posting & Matching</li>
              <li><CheckCircle size={16} /> Advanced Analytics</li>
            </ul>
            <Link to="/login" className="btn-red">Go to Dashboard</Link>
          </motion.div>

          <motion.div
            className="role-card user-card-role"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="role-icon"><Users size={36} /></div>
            <h3>Portal Members</h3>
            <p>Create your profile, grow your skills, participate in courses and events, and get discovered for exciting job opportunities.</p>
            <ul className="role-list">
              <li><CheckCircle size={16} /> Skill Assessments</li>
              <li><CheckCircle size={16} /> Course Enrollment</li>
              <li><CheckCircle size={16} /> Job Discovery</li>
            </ul>
            <Link to="/register" className="btn-navy">Create Account</Link>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <motion.div 
          className="container cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Ready to Transform Your Career?</h2>
          <p>Join the thousands of professionals who have already connected with NeST Digital.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn-hero-primary">Get Started Now</Link>
            <a href="#contact" className="btn-hero-ghost-dark">Contact Support</a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
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
