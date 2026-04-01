import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Target, Rocket, Award, 
  Zap, Menu, X, ArrowRight, Globe, Share2,
  ShieldCheck, Briefcase, GraduationCap, MapPin, Calendar
} from 'lucide-react';
import '../App.css';
import nestMainLogo from '../assets/nest_logo.png';

const userTypeData: Record<string, any> = {
  'alumni': {
    title: 'Alumni Network',
    tagline: 'Leveraging years of expertise and corporate wisdom.',
    description: 'Our alumni network is the backbone of NeST Digital. Comprising former employees and trainees who have gone on to achieve great heights in the tech industry, this group provides invaluable mentorship and career pathways for current members.',
    heroImage: 'https://images.unsplash.com/photo-1523287562758-66c7fc58967f?q=80&w=1600&auto=format&fit=crop',
    color: '#C8102E',
    pillars: [
      { title: 'Global Presence', desc: 'Our alumni are spread across 15+ countries, holding senior leadership positions in FAANG and Fortune 500 companies.', icon: Globe },
      { title: 'Knowledge Transfer', desc: 'Regular guest lectures and technical workshops led by alumni to keep the community updated.', icon: Zap },
      { title: 'Career Acceleration', desc: 'Direct referral system that bypasses traditional ATS for qualified NeST community members.', icon: Briefcase }
    ],
    details: [
      { label: 'Network Size', value: 'Over 5,000 verified professionals globally.' },
      { label: 'Mentorship', value: '450+ active mentors available for 1-on-1 career guidance sessions.' },
      { label: 'Events', value: 'Quarterly networking mixers and an annual global excellence gala.' }
    ],
    features: [
      { icon: Users, title: 'Mentorship Program', desc: 'Connect with senior alumni for career guidance and technical mentorship.' },
      { icon: Target, title: 'Referral Pipeline', desc: 'Get direct referrals to top global companies through our trusted alumni network.' },
      { icon: Award, title: 'Annual Gala', desc: 'Join exclusive networking events and the annual alumni achievement awards.' }
    ]
  },
  'interns': {
    title: 'Intern Hub',
    tagline: 'Cultivating the next generation of digital leaders.',
    description: 'Our internship program offers students and fresh graduates the opportunity to work on real-world projects alongside industry experts. It is a launchpad for careers in software engineering, UI/UX, and data science.',
    heroImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop',
    color: '#1E4FA0',
    pillars: [
      { title: 'Structured Paths', desc: 'Each intern follows a 12-week modular roadmap tailored to their specific technology stack.', icon: MapPin },
      { title: 'Live Projects', desc: 'We do not believe in "dummy" projects. Our interns contribute to production-grade codebases.', icon: Rocket },
      { title: 'Performance Bonus', desc: 'High-performing interns receive financial incentives and priority for PPOs (Pre-Placement Offers).', icon: Award }
    ],
    details: [
      { label: 'Duration', value: 'Flexible 3 to 6-month programs depending on academic requirements.' },
      { label: 'Stacks', value: 'Full-stack Web, Mobile App Dev, AI/ML, and DevOps tracks available.' },
      { label: 'Support', value: 'Dedicated technical leads assigned to every small team for daily guidance.' }
    ],
    features: [
      { icon: Rocket, title: 'Real-world Projects', desc: 'Work on production-ready codebases and client projects from day one.' },
      { icon: Zap, title: 'Fast-track Hiring', desc: 'High-performing interns are prioritized for full-time roles at NeST Digital.' },
      { icon: Users, title: 'Peer Learning', desc: 'Collaborate with fellow interns in a vibrant, supportive ecosystem.' }
    ]
  },
  'trainees': {
    title: 'Trainee Program',
    tagline: 'Bridging the skill gap through intensive training.',
    description: 'The Trainee Program at NeST is designed for individuals who want to pivot or deep-dive into new technologies. We provide structured learning paths and hands-on laboratory sessions to ensure industry readiness.',
    heroImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop',
    color: '#10B981',
    pillars: [
      { title: 'Certified Labs', desc: 'Our state-of-the-art labs are equipped with the latest hardware and software environments.', icon: ShieldCheck },
      { title: 'Expert Faculty', desc: 'All training is delivered by certified architects with 10+ years of corporate experience.', icon: GraduationCap },
      { title: 'Soft Skills', desc: 'Communication, grooming, and interview preparation are integrated into the core curriculum.', icon: Users }
    ],
    details: [
      { label: 'Tech Range', value: 'Intensive training in 15+ modern tech stacks including Cloud and Cybersecurity.' },
      { label: 'Placement', value: '90%+ placement rate for trainees across our partner ecosystem.' },
      { label: 'Methodology', value: '70% Practical Laboratory work, 30% Theoretical framework sessions.' }
    ],
    features: [
      { icon: Award, title: 'Certified Paths', desc: 'Earn industry-recognized certifications upon completion of various modules.' },
      { icon: Target, title: 'Hands-on Labs', desc: 'Access 24/7 virtual and physical labs to practice your coding skills.' },
      { icon: Rocket, title: 'Placement Support', desc: 'Dedicated career services to help you land your dream job post-training.' }
    ]
  },
  'iv-students': {
    title: 'Industrial Visits',
    tagline: 'Experiencing engineering excellence first-hand.',
    description: 'We welcome students from various universities to visit our facilities and witness the engineering transformation at NeST Digital. These visits provide a window into the corporate world and help students align their learning with industry standards.',
    heroImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
    color: '#F59E0B',
    pillars: [
      { title: 'Expert Talks', desc: '30-minute power talks with our senior architects during the visit.', icon: Zap },
      { icon: Briefcase, title: 'Industry Insights', desc: 'Understand the lifecycle of a global software product development project.' },
      { icon: Globe, title: 'Future Readiness', desc: 'Learn how to bridge the gap between academic theory and corporate application.' }
    ],
    details: [
      { label: 'Capacity', value: 'We host up to 100 students per visit across our multiple office locations.' },
      { label: 'Scheduling', value: 'Weekly slots available for college groups; easy online booking system.' },
      { label: 'Participation', value: 'Every visitor receives a digital e-certificate of participation.' }
    ],
    features: [
      { icon: Users, title: 'Guided Factory Tours', desc: 'See how large-scale software and hardware systems are integrated.' },
      { icon: Zap, title: 'Tech Workshops', desc: 'Attend short power-talks by our senior architects during your visit.' },
      { icon: Rocket, title: 'Future Careers', desc: 'Understand the different roles available and find your calling in tech.' }
    ]
  },
  'event-leads': {
    title: 'Event Network',
    tagline: 'Connecting through shared tech interests.',
    description: 'Our events bring together tech enthusiasts, innovators, and leaders from across the globe. From hackathons to tech summits, we provide the platform to showcase talent and share knowledge.',
    heroImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1600&auto=format&fit=crop',
    color: '#8B5CF6',
    pillars: [
      { title: 'Global Summits', desc: 'Annual tech summits featuring speakers from major global organizations.', icon: Calendar },
      { icon: Target, title: 'Hackatons', desc: 'Intensive 48-hour coding challenges with significant prize pools and hiring opportunities.' },
      { icon: Share2, title: 'Networking Portal', desc: 'Exclusive access to our attendee networking portal for 1 month post-event.' }
    ],
    details: [
      { label: 'Frequency', value: '2+ major events per month including webinars, meetups, and summits.' },
      { label: 'Inclusivity', value: 'Events designed for everyone from beginners to seasoned architects.' },
      { label: 'Reach', value: 'Online events reach over 100,000+ tech enthusiasts annually.' }
    ],
    features: [
      { icon: Rocket, title: 'Hackathons', desc: 'Participate in high-stakes innovation challenges and win amazing prizes.' },
      { icon: Users, title: 'Tech Summits', desc: 'Hear from FAANG leaders and local heroes during our quarterly summits.' },
      { icon: Zap, title: 'Global Networking', desc: 'Build connections that transcend borders via our event portal.' }
    ]
  }
};

const UserTypeOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const data = id ? userTypeData[id] : null;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  if (!data) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: '#050d1e', minHeight: '100vh', color: 'white' }}>
         <h2>Information not found.</h2>
         <Link to="/" style={{ color: '#c8102e', textDecoration: 'underline' }}>Go Back Home</Link>
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
    initial: { opacity: 0, x: -20, filter: 'blur(10px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: 20, filter: 'blur(10px)' },
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
      <section style={{ position: 'relative', height: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#050d1e' }}>
        <motion.img 
          src={data.heroImage} 
          alt={data.title}
          initial={{ scale: 1.15, filter: 'blur(5px)' }}
          animate={{ scale: 1.05, filter: 'blur(0px)' }}
          transition={{ duration: 15, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, #ffffff 100%)' }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div {...pageTransition}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.12)', padding: '10px 24px', borderRadius: '50px', marginBottom: '32px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '14px', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Hub Overview
            </Link>
            <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, marginBottom: '20px', color: '#111827', textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 1 }}>
              <span style={{ 
                background: `linear-gradient(135deg, ${data.color} 0%, #111827 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                filter: `drop-shadow(0 0 20px ${data.color}20)`
              }}>{data.title}</span><br />
              <span style={{ fontSize: '0.4em', color: '#64748b', fontWeight: 500, letterSpacing: '2px' }}>NEST DIGITAL ECOSYSTEM</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ── Detailed Info Narrative ── */}
      <section style={{ padding: '60px 0 100px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '80px', alignItems: 'start' }}>
            
            <motion.div {...pageTransition} transition={{ delay: 0.2 }}>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em' }}>Everything you need to know</h2>
              <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '48px' }}>
                {data.description}
              </p>

              <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '32px' }}>Core Pillars</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  {data.pillars.map((pillar: any, i: number) => {
                    const PillarIcon = pillar.icon;
                    return (
                      <div key={i} style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: data.color, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                          <PillarIcon size={24} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{pillar.title}</h4>
                          <p style={{ color: '#64748b', lineHeight: 1.6 }}>{pillar.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div {...pageTransition} transition={{ delay: 0.4 }}>
              <div style={{ border: `2px solid ${data.color}20`, background: `${data.color}05`, padding: '40px', borderRadius: '32px', position: 'sticky', top: '120px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={24} color={data.color} /> Hub Specifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {data.details.map((detail: any, i: number) => (
                    <div key={i} style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: data.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{detail.label}</p>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{detail.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '32px', padding: '24px', background: '#0d2046', borderRadius: '20px', color: 'white' }}>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>LATEST UPDATE</p>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>System wide mentorship rollout is now active for all Hub members. Check your dashboard for details.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Features Hub ── */}
      <section style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Premium Benefits</h2>
            <p style={{ color: '#64748b' }}>Exclusive features unlocked for this talent group</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {data.features.map((feature: any, i: number) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                   key={i} 
                   {...pageTransition} 
                   transition={{ delay: 0.1 * i }}
                   style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9' }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `${data.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: data.color, marginBottom: '24px' }}>
                    <Icon size={28} />
                  </div>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>{feature.title}</h4>
                  <p style={{ color: '#64748b', lineHeight: 1.6 }}>{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Minimal CTA ── */}
      <section style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="container">
          <motion.div {...pageTransition}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.04em' }}>Ready to start?</h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 48px' }}>
              Create your global NeST Digital profile and join the {data.title} ecosystem.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <Link to="/register" className="btn-red" style={{ padding: '18px 48px', fontSize: '16px', borderRadius: '12px' }}>
                Join the Network
              </Link>
              <Link to="/login" style={{ background: '#f1f5f9', color: '#111827', padding: '18px 48px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '16px' }}>
                Sign In
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

export default UserTypeOverview;
