import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Briefcase, Clock,
  TrendingUp, Zap,
  Building, SlidersHorizontal,
  Bookmark, BookmarkCheck,
  Plus, Info, AlertCircle,
  Calendar, ChevronRight, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../services/api';

interface Job {
  id: string;
  title: string;
  department: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  postedAt: string;
  description: string;
  skills: string[];
  salary?: string;
  isUrgent?: boolean;
  isNew?: boolean;
  matchScore?: number;
}

const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Architect',
    department: 'Engineering',
    company: 'NeST Digital',
    location: 'Kochi, Kerala (Remote)',
    type: 'Full-time',
    experience: '6-10 Years',
    postedAt: '2 hours ago',
    description: 'Lead the architectural design of our next-generation digital platforms. Expertise in React, TypeScript, and micro-frontends required.',
    skills: ['React', 'TypeScript', 'System Design', 'Module Federation'],
    salary: '₹22-35 LPA',
    isUrgent: true,
    isNew: true,
    matchScore: 95
  },
  {
    id: 'job-2',
    title: 'Backend Systems Engineer',
    department: 'Platform Engineering',
    company: 'NeST It & Infrastructure',
    location: 'Trivandrum, Kerala (On-site)',
    type: 'Full-time',
    experience: '3-5 Years',
    postedAt: '5 hours ago',
    description: 'Build robust, scalable backend services using Go and Python. Experience with Kubernetes and cloud native technologies is a must.',
    skills: ['Go', 'Python', 'Kubernetes', 'gRPC'],
    salary: '₹15-24 LPA',
    isNew: true,
    matchScore: 88
  },
  {
    id: 'job-3',
    title: 'AI/ML Solutions Lead',
    department: 'Innovation Lab',
    company: 'NeST Cybernetics',
    location: 'Bangalore, Karnataka (Hybrid)',
    type: 'Contract',
    experience: '5-8 Years',
    postedAt: '1 day ago',
    description: 'Drive AI initiatives and lead the development of machine learning models for predictive maintenance and industrial automation.',
    skills: ['PyTorch', 'TensorFlow', 'NLP', 'Computer Vision'],
    salary: '₹30-45 LPA',
    isUrgent: true,
    matchScore: 75
  },
  {
    id: 'job-4',
    title: 'Product Experience Designer',
    department: 'Design',
    company: 'NeST Digital',
    location: 'Remote',
    type: 'Full-time',
    experience: '2-4 Years',
    postedAt: '2 days ago',
    description: 'Craft intuitive and beautiful user experiences for our enterprise suite. Focus on usability, accessibility, and modern design systems.',
    skills: ['Figma', 'UX Research', 'Design Systems', 'Prototyping'],
    salary: '₹12-20 LPA',
    matchScore: 82
  },
  {
    id: 'job-5',
    title: 'DevOps & SRE Specialist',
    department: 'Cloud Operations',
    company: 'NeST IT Solutions',
    location: 'Kochi, Kerala (On-site)',
    type: 'Full-time',
    experience: '4-7 Years',
    postedAt: '3 days ago',
    description: 'Ensure the reliability and performance of our global infrastructure. Master of CI/CD, monitoring, and infrastructure as code.',
    skills: ['Terraform', 'AWS', 'Prometheus', 'Jenkins'],
    salary: '₹18-28 LPA',
    matchScore: 68
  },
  {
    id: 'job-6',
    title: 'Cybersecurity Analyst',
    department: 'Security Ops',
    company: 'NeST Digital',
    location: 'Trivandrum, Kerala (Hybrid)',
    type: 'Full-time',
    experience: '3-6 Years',
    postedAt: '4 days ago',
    description: 'Monitor, detect, and respond to security threats. Implement security best practices across our cloud and edge infrastructure.',
    skills: ['SIEM', 'Penetration Testing', 'Security Audits', 'ISO 27001'],
    salary: '₹14-22 LPA',
    matchScore: 91
  }
];

const JobListings: React.FC = () => {
  const [jobs] = useState<Job[]>(MOCK_JOBS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await jobsApi.getAllJobs();
        if (res.success && res.data && (res.data as any).jobs) {
          // Merge API jobs or use them if they match the UI quality
          // setJobs((res.data as any).jobs);
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Auto-scrolling logic for the featured slider (5s interval)
  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const container = sliderRef.current;
        const scrollAmount = 850 + 32; // card width + gap
        
        // If we've scrolled near the end, loop back to the start
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleSaveJob = (id: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(id)) newSaved.delete(id);
    else newSaved.add(id);
    setSavedJobs(newSaved);
  };

  const handleApply = (id: string) => {
    const newApplied = new Set(appliedJobs);
    newApplied.add(id);
    setAppliedJobs(newApplied);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'All' || job.type === filterType;

    return matchesSearch && matchesType;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem', padding: '0 1rem' }}>

      {/* Wide Cinematic Slider Featured Career Section */}
      <div style={{ marginBottom: '4.5rem', marginTop: '2rem', position: 'relative' }}>
        <div 
          ref={sliderRef}
          style={{ display: 'flex', gap: '2rem', overflowX: 'auto', padding: '1rem 0', scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
        >
          {[
            { title: 'Global Opportunities', subtitle: 'Work with the world\'s leading tech giants.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80', color: '#0F172A' },
            { title: 'Career Growth', subtitle: 'Personalized pathways for every alumnus.', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80', color: '#d32f2f' },
            { title: 'Remote Work', subtitle: 'Freedom to innovate from anywhere.', img: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=1600&q=80', color: '#10B981' }
          ].map((addon, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: idx * 0.2 + 0.2, ease: [0.16, 1, 0.3, 1] }}
              whileHover="hover"
              style={{ 
                flex: '0 0 850px',
                height: '450px',
                borderRadius: '40px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                background: addon.color,
                scrollSnapAlign: 'start'
              }}
            >
              <motion.img 
                variants={{ hover: { scale: 1.05, opacity: 0.8 } }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                src={addon.img} 
                alt={addon.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
              />
              <motion.div 
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0) 60%)',
                  padding: '4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <motion.h2 
                  variants={{ hover: { y: -5, textShadow: '0 10px 30px rgba(0,0,0,0.8)' } }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ color: '#ffffff', fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.04em' }}
                >
                  {addon.title}
                </motion.h2>
                <motion.p 
                  variants={{ hover: { y: -3, color: 'rgba(255,255,255,0.95)' } }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
                  style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.4rem', maxWidth: '500px', lineHeight: '1.4' }}
                >
                  {addon.subtitle}
                </motion.p>
                <motion.button 
                  variants={{ hover: { scale: 1.04, y: -2, boxShadow: '0 15px 30px rgba(0,0,0,0.4)' } }}
                  transition={{ duration: 0.3 }}
                  style={{ 
                    marginTop: '2.5rem', 
                    width: 'fit-content', 
                    padding: '1rem 2rem', 
                    borderRadius: '16px', 
                    background: 'white', 
                    color: '#0F172A', 
                    border: 'none', 
                    fontWeight: 800, 
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Explore Roles <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        {/* Navigation Dots */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '6px', borderRadius: '3px', background: '#d32f2f' }}></div>
          <div style={{ width: '12px', height: '6px', borderRadius: '3px', background: '#E2E8F0' }}></div>
          <div style={{ width: '12px', height: '6px', borderRadius: '3px', background: '#E2E8F0' }}></div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={20} />
            <input
              type="text"
              placeholder="Search by title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem 0.8rem 3rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d32f2f'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Full-time', 'Contract', 'Hybrid', 'Remote'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '0.7rem 1.2rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  background: filterType === type ? '#d32f2f' : '#ffffff',
                  color: filterType === type ? 'white' : '#64748B',
                  border: `1px solid ${filterType === type ? '#d32f2f' : '#E2E8F0'}`
                }}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '0.7rem',
              borderRadius: '10px',
              background: '#F1F5F9',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {/* Advanced filter groups could go here */}
                <div className="luxury-card" style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.8rem', color: '#0F172A' }}>Experience Level</p>
                  <select style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <option>Any Experience</option>
                    <option>Entry Level</option>
                    <option>Associate</option>
                    <option>Senior</option>
                    <option>Director</option>
                  </select>
                </div>
                <div className="luxury-card" style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.8rem', color: '#0F172A' }}>Salary Range</p>
                  <select style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <option>Any Salary</option>
                    <option>₹5-10 LPA</option>
                    <option>₹10-20 LPA</option>
                    <option>₹20+ LPA</option>
                  </select>
                </div>
                <div className="luxury-card" style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.8rem', color: '#0F172A' }}>Location</p>
                  <select style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <option>All Locations</option>
                    <option>Kochi</option>
                    <option>Trivandrum</option>
                    <option>Bangalore</option>
                    <option>Remote</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Listings Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '2rem' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1 / -1' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block' }}
            >
              <TrendingUp size={40} color="#d32f2f" />
            </motion.div>
            <p style={{ marginTop: '1rem', color: '#64748B' }}>Fetching career opportunities...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
            <React.Fragment key={job.id}>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
                }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
                className="luxury-card"
                style={{
                  padding: '2rem',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  transition: 'box-shadow 0.3s ease',
                  overflow: 'hidden'
                }}
              >
                {/* Urgent Ribbon */}
              {job.isUrgent && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '80px',
                  height: '80px',
                  pointerEvents: 'none',
                  overflow: 'hidden',
                  zIndex: 2
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '18px',
                    right: '-22px',
                    background: '#d32f2f',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '4px 25px',
                    transform: 'rotate(45deg)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Urgent
                  </div>
                </div>
              )}

              {/* Bookmark Icon */}
              <button
                onClick={() => toggleSaveJob(job.id)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: job.isUrgent ? '3.5rem' : '1.5rem',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: savedJobs.has(job.id) ? '#d32f2f' : '#94A3B8',
                  zIndex: 1
                }}
                className="btn-premium"
              >
                {savedJobs.has(job.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>

              {/* Top Info */}
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#d32f2f', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{job.department}</span>
                {job.isNew && (
                  <span style={{
                    marginLeft: '1rem',
                    background: '#f0fdf4',
                    color: '#15803d',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #dcfce7',
                    textTransform: 'uppercase'
                  }}>New</span>
                )}
              </div>

              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{job.title}</h3>

              <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '0.5rem', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {job.description}
              </p>

              {/* Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                margin: '0.5rem 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#475569', fontSize: '0.9rem' }}>
                  <MapPin size={16} color="#d32f2f" /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#475569', fontSize: '0.9rem' }}>
                  <Briefcase size={16} color="#d32f2f" /> {job.experience}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#475569', fontSize: '0.9rem' }}>
                  <Clock size={16} color="#d32f2f" /> {job.type}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748B', fontSize: '0.9rem' }}>
                  <Calendar size={16} /> {job.postedAt}
                </div>
              </div>

              {/* Skill Capsules */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {job.skills.slice(0, 4).map(skill => (
                  <span
                    key={skill}
                    style={{
                      background: '#F8FAFC',
                      color: '#64748B',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Match Score (Small integrated) */}
              <div style={{
                position: 'absolute',
                top: '5.5rem',
                right: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: `3px solid ${job.matchScore && job.matchScore > 80 ? '#10B981' : '#F59E0B'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  background: 'white'
                }}>
                  {job.matchScore}%
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Match</span>
              </div>

              <div style={{ height: '1px', background: '#F1F5F9', margin: '0.5rem 0' }}></div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <Link
                  to={`/jobs/${job.id}`}
                  style={{
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                  className="link-hover"
                >
                  View Details <ChevronRight size={16} />
                </Link>

                <button
                  onClick={() => handleApply(job.id)}
                  disabled={appliedJobs.has(job.id)}
                  className="btn-premium"
                  style={{
                    padding: '0.6rem 1.8rem',
                    background: appliedJobs.has(job.id) ? '#f0fdf4' : '#d32f2f',
                    color: appliedJobs.has(job.id) ? '#15803d' : 'white',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: appliedJobs.has(job.id) ? '1px solid #bbf7d0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: appliedJobs.has(job.id) ? 'default' : 'pointer'
                  }}
                >
                  {appliedJobs.has(job.id) ? (
                    <>
                      <Check size={18} /> Applied
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </button>
              </div>
            </motion.div>

            {/* In-Between Add-on Banner for Jobs */}
            {index === 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ 
                  gridColumn: '1 / -1', 
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
                  borderRadius: '2rem', 
                  padding: '3rem 4rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  boxShadow: '0 20px 40px rgba(15,23,42,0.15)',
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', right: '-10%', top: '-50%', opacity: 0.1 }}>
                  <Briefcase size={400} color="white" />
                </div>
                <motion.div 
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
                  }}
                  style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}
                >
                  <motion.span 
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                    style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    NeST Premium Placement
                  </motion.span>
                  <motion.h2 
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                    style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900, marginTop: '1rem', marginBottom: '1rem', lineHeight: '1.2' }}
                  >
                    Stand out to top recruiters automatically.
                  </motion.h2>
                  <motion.p 
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                    style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2rem' }}
                  >
                    Get your resume highlighted at the top of partner employer queues.
                  </motion.p>
                  <motion.button 
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                    whileHover={{ scale: 1.05 }}
                    style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '1rem', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Boost Profile <ChevronRight size={18} />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
            </React.Fragment>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#F8FAFC', borderRadius: '30px', border: '2px dashed #E2E8F0', gridColumn: '1 / -1' }}>
            <Info size={48} color="#94A3B8" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '0.5rem' }}>No jobs found matching your criteria</h3>
            <p style={{ color: '#64748B' }}>Try adjusting your search terms or filters to see more results.</p>
            <button
              onClick={() => { setSearchTerm(''); setFilterType('All'); }}
              style={{ marginTop: '1.5rem', color: '#d32f2f', fontWeight: 700, textDecoration: 'underline' }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </motion.div>

      {/* Global CSS for the Luxury Look */}
      <style>{`
        .luxury-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .luxury-card:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
          border-color: rgba(226, 232, 240, 1);
        }
        .btn-premium {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: pointer;
          border: none;
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          filter: brightness(1.1);
        }
        .btn-premium:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default JobListings;

