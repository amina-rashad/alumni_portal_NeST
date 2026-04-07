import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle, Zap, ShieldCheck, 
  Menu, X
} from 'lucide-react';
import '../App.css';
import nestMainLogo from '../assets/nest_logo.png';

const featureDetails: Record<string, any> = {
  'talent-tracking': {
    title: 'Talent Tracking',
    subtitle: 'Comprehensive lifecycle tracking for all platform members.',
    heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop',
    color: '#c8102e',
    narrative: 'Our Talent Tracking system is engineered to provide a 360-degree view of your ecosystem. From the moment a trainee joins to their evolution into a senior alumnus, NeST Digital tracks every milestone, skill acquisition, and interaction.',
    specs: [
      { label: 'Tracking capacity', value: '1,000,000+ unique profiles' },
      { label: 'Data Points', value: 'Real-time velocity and engagement scoring' },
      { label: 'Compliance', value: 'GDPR and SOC2 Type II certified data handling' }
    ],
    cards: [
       { icon: CheckCircle, title: 'Skill Matrices', desc: 'Visualize capabilities across your entire alumni network instantly.' },
       { icon: Zap, title: 'Engagement Scoring', desc: 'Automated points system based on interactions, course completions, and participation.' },
       { icon: ShieldCheck, title: 'Predictive Analytics', desc: 'Forecast future talent availability based on current trainee progress.' }
    ]
  },
  'job-management': {
    title: 'Job Management',
    subtitle: 'Streamline hiring directly from your vetted NeST pipeline.',
    heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
    color: '#1e4fa0',
    narrative: 'NeST Jobs bridges the gap between hiring needs and verified talent. Our proprietary matching algorithm ensures that you find the perfect fit based on technical skills, behavioral scores, and cultural alignment.',
    specs: [
      { label: 'Matching Logic', value: 'AI-driven candidate-to-role compatibility scoring' },
      { label: 'Time-to-Hire', value: 'Reduced by 40% compared to traditional ATS' },
      { label: 'Reliability', value: '100% verified credentials and background checks' }
    ],
    cards: [
       { icon: CheckCircle, title: 'Smart Recommendations', desc: 'AI-driven mapping of your open jobs to the best alumni profiles.' },
       { icon: Zap, title: 'Referral System', desc: 'Gamified built-in referral system for high-trust hiring.' },
       { icon: ShieldCheck, title: 'ATS Integration', desc: 'Seamlessly port candidates into your existing HR tools.' }
    ]
  },
  'learning-courses': {
    title: 'Learning & Courses',
    subtitle: 'Provide continuous upskilling resources.',
    heroImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
    color: '#10b981',
    narrative: 'Upskilling is at the heart of engineering transformation. Our Learning Management System (LMS) provides modular, high-impact courses designed by industry architects to ensure your team stays ahead of the curve.',
    specs: [
      { label: 'Content Library', value: '500+ hours of modular video and lab content' },
      { label: 'Certification', value: 'Industry-recognized e-certificates on completion' },
      { label: 'Accessibility', value: '24/7 web and mobile cross-platform learning' }
    ],
    cards: [
       { icon: CheckCircle, title: 'Custom Curriculums', desc: 'Build modular courses with videos, documents, and quizzes.' },
       { icon: Zap, title: 'Progress Monitoring', desc: 'Track where users drop off and optimize your training material.' },
       { icon: ShieldCheck, title: 'Certification Engine', desc: 'Automatically generate and issue verified certificates.' }
    ]
  },
  'assessments': {
    title: 'Assessments',
    subtitle: 'Ensure quality and readiness with automated skill checks.',
    heroImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop',
    color: '#f59e0b',
    narrative: 'Validation is key to maintaining high standards. NeST Assessments provide secure, automated testing environments for coding, behavioral analysis, and domain-specific knowledge checks.',
    specs: [
      { label: 'Test Security', value: 'AI-monitored proctoring and plagiarism detection' },
      { label: 'Evaluation', value: 'Instant automated scoring for technical quizzes' },
      { label: 'Insights', value: 'Individual and batch-level performance analytics' }
    ],
    cards: [
       { icon: CheckCircle, title: 'Code Validations', desc: 'Test engineering candidates securely within the browser.' },
       { icon: Zap, title: 'Behavioral Quizzes', desc: 'Measure cultural fit through interactive scenarios.' },
       { icon: ShieldCheck, title: 'Live Leaderboards', desc: 'Encourage healthy competition among interns and trainees.' }
    ]
  }
};

const PlatformCapabilities: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const feature = id ? featureDetails[id] : null;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  if (!feature) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: '#050d1e', minHeight: '100vh', color: 'white' }}>
         <h2>Feature not found.</h2>
         <Link to="/" style={{ color: '#c8102e', textDecoration: 'underline' }}>Go Back</Link>
      </div>
    );
  }

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Features', href: '/#features' },
    { name: 'User Types', href: '/#users' },
  ];

  const pageTransition: any = {
    initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#111827', fontFamily: '"Outfit", sans-serif', overflowX: 'hidden' }}>
      
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

      {/* ── Hero Hub ── */}
      <section style={{ position: 'relative', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#050d1e' }}>
        <motion.img 
          src={feature.heroImage} 
          alt={feature.title}
          initial={{ scale: 1.15, filter: 'blur(5px)' }}
          animate={{ scale: 1.05, filter: 'blur(0px)' }}
          transition={{ duration: 15, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, #ffffff 100%)' }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div {...pageTransition}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.12)', padding: '10px 24px', borderRadius: '50px', marginBottom: '32px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '14px', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Capabilities Hub
            </Link>
            <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, marginBottom: '16px', color: '#111827', textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 1 }}>
              <span style={{ 
                background: `linear-gradient(135deg, ${feature.color} 0%, #111827 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                filter: `drop-shadow(0 0 20px ${feature.color}20)`
              }}>{feature.title}</span><br />
              <span style={{ fontSize: '0.4em', color: '#64748b', fontWeight: 500, letterSpacing: '2px' }}>NEST DIGITAL ECOSYSTEM</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>{feature.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Narrative & Specs ── */}
      <section style={{ padding: '60px 0 100px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '80px', alignItems: 'start' }}>
            
            <motion.div {...pageTransition} transition={{ delay: 0.2 }}>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '24px' }}>Strategic Advantage</h2>
              <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '48px' }}>
                {feature.narrative}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {feature.cards.map((c: any, i: number) => {
                  const Icon = c.icon;
                  return (
                    <motion.div 
                      key={i}
                      style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}
                      whileHover={{ y: -8, borderColor: feature.color }}
                    >
                      <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Icon size={28} />
                      </div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>{c.title}</h3>
                      <p style={{ color: '#64748b', lineHeight: 1.6 }}>{c.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div {...pageTransition} transition={{ delay: 0.4 }}>
              <div style={{ border: `2px solid ${feature.color}20`, background: `${feature.color}05`, padding: '40px', borderRadius: '32px', position: 'sticky', top: '120px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={24} color={feature.color} /> Engineering Specs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {feature.specs.map((spec: any, i: number) => (
                    <div key={i} style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: feature.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{spec.label}</p>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{spec.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '32px', padding: '24px', background: '#0d2046', borderRadius: '20px', color: 'white' }}>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>DEPLOYMENT STATUS</p>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>Live across all NeST Digital global data centers. Guaranteed 99.99% uptime.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Minimal CTA ── */}
      <section style={{ padding: '80px 0 120px', textAlign: 'center' }}>
        <div className="container">
          <motion.div {...pageTransition}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.04em' }}>Power your ecosystem</h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 48px' }}>
              Integrate {feature.title} into your organizational workflow today.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <Link to="/register" className="btn-red" style={{ padding: '18px 48px', fontSize: '16px', borderRadius: '12px' }}>
                Get Started Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer Hub ── */}
      <footer style={{ padding: '60px 0', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>&copy; 2025 NeST Digital. All Rights Reserved. Transforming Engineering for a Digital Future.</p>
      </footer>
    </div>
  );
};

export default PlatformCapabilities;
