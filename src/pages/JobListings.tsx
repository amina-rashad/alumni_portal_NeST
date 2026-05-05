import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Briefcase, Clock,
  TrendingUp, Zap,
  Building, SlidersHorizontal,
  Bookmark, BookmarkCheck,
  Plus, Info, AlertCircle,
  Calendar, ChevronRight, Check,
  Users, Star, Wifi, Target
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
  requirements?: string[];
  createdAt?: string;
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const listingsRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const timeAgo = (dateStr: string | undefined) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const scrollToJobs = () => {
    listingsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await jobsApi.getAllJobs();
        if (res.success && res.data && (res.data as any).jobs) {
          const apiJobs = (res.data as any).jobs.map((j: any) => ({
            id: j.id,
            title: j.title,
            company: j.company || 'NeST Digital',
            location: j.location || 'Kochi, Kerala',
            type: j.type || 'Full-time',
            department: j.department || 'Technology',
            experience: j.experience_level || 'Entry Level',
            description: j.description || '',
            skills: j.skills_required || j.skills || [],
            salary: j.salary,
            postedAt: timeAgo(j.createdAt),
            createdAt: j.createdAt,
            isNew: true, // Mark all fresh from DB as new for now
            isUrgent: false
          }));
          
          if (apiJobs.length > 0) {
            setJobs(apiJobs);
          }
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const toggleSaveJob = (id: string) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(id)) newSaved.delete(id);
    else newSaved.add(id);
    setSavedJobs(newSaved);
  };

  const handleApply = (id: string, title: string) => {
    const newApplied = new Set(appliedJobs);
    newApplied.add(id);
    setAppliedJobs(newApplied);
    showNotification(`Successfully applied for ${title}!`);
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

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '6rem', padding: '0 2rem' }}>
      
      {/* Cinematic Header */}
      <div style={{ marginTop: '3rem', marginBottom: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '4.2rem', fontWeight: 900, marginBottom: '2.5rem', letterSpacing: '-0.05em', lineHeight: 0.95, cursor: 'default' }}
        >
          <span style={{ background: 'linear-gradient(135deg, #d32f2f 0%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Careers at</span>
          <span style={{ color: '#0F172A' }}> NeST</span>
          <span style={{ color: '#ef4444' }}>.</span>
        </motion.h1>
      </div>

      {/* Future Ready Section - Full Width Blue Glassmorph */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.12) 0%, rgba(30, 64, 175, 0.08) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          padding: '4rem 0',
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          marginBottom: '3.5rem',
          borderBottom: '1px solid rgba(30, 64, 175, 0.1)',
          borderTop: '1px solid rgba(30, 64, 175, 0.1)',
          boxShadow: '0 20px 50px rgba(30, 64, 175, 0.05)',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '0 3.5rem' }}>
          <h2 style={{ fontSize: '2.6rem', fontWeight: 900, color: '#0F172A', marginBottom: '3rem', letterSpacing: '-0.03em', textAlign: 'left' }}>
            Are you ready to shape your future with confidence?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            {[
              { title: 'Experienced professionals', img: '/experienced_pro_career.png' },
              { title: 'Early careers', img: '/early_career_talents.png' },
              { title: 'Contract opportunities', img: '/contract_opportunities.png' }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -12 }}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ 
                  borderRadius: '20px', 
                  overflow: 'hidden', 
                  aspectRatio: '16/10', 
                  marginBottom: '1.5rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 900, 
                  color: '#ef4444', 
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}>
                  {card.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Floating Glass Expanding Search Bar */}
      <div ref={listingsRef} style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'flex-start', position: 'relative' }}>
        <motion.div 
          animate={{ 
            maxWidth: isSearchFocused ? '850px' : '420px',
            boxShadow: isSearchFocused ? '0 15px 40px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.03)',
            borderColor: isSearchFocused ? 'rgba(211, 47, 47, 0.3)' : 'rgba(0, 0, 0, 0.08)'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '14px',
            padding: '6px 6px 6px 1.25rem',
            border: '0.5px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            zIndex: 10
          }}
        >
          <Search size={18} color={isSearchFocused ? '#ef4444' : '#64748B'} strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search roles or skills..."
            value={searchTerm}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '1rem',
              fontWeight: 500,
              color: '#0F172A',
              letterSpacing: '-0.01em'
            }}
          />
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: showFilters ? '#0F172A' : 'rgba(0,0,0,0.03)',
              color: showFilters ? '#ffffff' : '#0F172A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              fontSize: '0.8rem',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </motion.div>

        {/* Floating Filter Options Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                left: 0,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '18px',
                padding: '1.25rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.04)',
                zIndex: 100,
                width: '320px'
              }}
            >
              <p style={{ margin: '0 0 1rem', fontSize: '0.7rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Job Type</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['All', 'Full-time', 'Remote'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: filterType === type ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
                      background: filterType === type ? '#0F172A' : 'transparent',
                      color: filterType === type ? '#ffffff' : '#64748B',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {type}
                  </button>
                ))}
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
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1 / -1' }}>
             <TrendingUp size={40} color="#d32f2f" style={{ animation: 'spin 2s linear infinite' }} />
            <p style={{ marginTop: '1rem', color: '#64748B' }}>Fetching premium opportunities...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => {
            const bgs = [
              'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', 
              'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', 
              'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80', 
              'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', 
              'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', 
              'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
            ];
            const bgImage = bgs[index % bgs.length];

            return (
            <React.Fragment key={job.id}>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                }}
                whileHover="hover"
                className="sexy-card"
                onClick={() => document.getElementById(`link-${job.id}`)?.click()}
                style={{
                  background: '#0F172A',
                  borderRadius: '24px',
                  padding: '1.2rem',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                  aspectRatio: '16 / 9',
                  cursor: 'pointer'
                }}
              >
                {/* Full Bleed Background Image */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                   <motion.img 
                      variants={{ hover: { scale: 1.1, opacity: 0.7 } }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      src={bgImage} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
                      alt="" 
                   />
                   <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 10%, rgba(15, 23, 42, 0.3) 100%)' }} />
                   
                   {/* Colored Accent Glow */}
                   <motion.div 
                      variants={{ hover: { opacity: 0.8 } }}
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(211,47,47,0.15) 0%, rgba(211,47,47,0) 70%)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                      }}
                   />
                </div>

                {/* Top Info row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '8px 16px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {job.department}
                    </span>
                    {job.isNew && (
                      <span style={{ background: 'rgba(211, 47, 47, 0.8)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '8px 16px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: savedJobs.has(job.id) ? '#d32f2f' : 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: savedJobs.has(job.id) ? '0 8px 20px rgba(211,47,47,0.4)' : 'none'
                    }}
                  >
                    {savedJobs.has(job.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                  </button>
                </div>

                <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{job.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building size={14} color="#ef4444" /> {job.company}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#ef4444" /> {job.location.split(',')[0]}
                    </span>
                  </div>

                  {/* Skills array */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {job.skills.slice(0, 3).map(skill => (
                      <span
                        key={skill}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span style={{ padding: '6px 10px', fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8' }}>+{job.skills.length - 3}</span>
                    )}
                  </div>

                  {/* Footer details & Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                       <Clock size={14} /> {job.type} <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span> <span style={{ color: '#10B981', fontWeight: 700 }}>{job.salary || 'Competitive'}</span>
                     </div>
                     
                     {/* Hidden link for full container click */}
                     <Link id={`link-${job.id}`} to={`/jobs/${job.id}`} style={{ display: 'none' }} />

                     <motion.button
                       variants={{ hover: { scale: 1.05, boxShadow: '0 8px 16px rgba(211,47,47,0.3)' } }}
                       onClick={(e) => { e.stopPropagation(); handleApply(job.id, job.title); }}
                       disabled={appliedJobs.has(job.id)}
                       style={{
                         padding: '0.6rem 1.5rem',
                         background: appliedJobs.has(job.id) ? '#10B981' : '#d32f2f',
                         color: 'white',
                         borderRadius: '999px',
                         fontWeight: 800,
                         fontSize: '0.85rem',
                         border: 'none',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '6px',
                         cursor: appliedJobs.has(job.id) ? 'default' : 'pointer',
                         transition: 'background 0.3s'
                       }}
                     >
                       {appliedJobs.has(job.id) ? <><Check size={16} /> Applied</> : 'Apply'}
                     </motion.button>
                  </div>
                </div>
              </motion.div>

            </React.Fragment>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#F8FAFC', borderRadius: '40px', border: '2px dashed #E2E8F0', gridColumn: '1 / -1' }}>
            <Info size={48} color="#94A3B8" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.8rem', color: '#0F172A', marginBottom: '0.5rem', fontWeight: 800 }}>No jobs found matching your criteria</h3>
            <p style={{ color: '#64748B', fontSize: '1.1rem' }}>Try adjusting your search terms or filters to see more results.</p>
            <button
              onClick={() => { setSearchTerm(''); setFilterType('All'); }}
              style={{ marginTop: '2rem', color: '#d32f2f', fontWeight: 800, fontSize: '1.1rem', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </motion.div>

      {/* Global CSS for the Luxury Look */}
      <style>{`
        .sexy-card {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }
        .sexy-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.08);
          border-color: rgba(15, 23, 42, 0.1) !important;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: toast.type === 'success' ? '#10B981' : '#3B82F6',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            zIndex: 9999
          }}
        >
          {toast.type === 'success' ? <Check size={20} /> : <Info size={20} />}
          {toast.message}
        </motion.div>
      )}
    </div>
  );
};

export default JobListings;
