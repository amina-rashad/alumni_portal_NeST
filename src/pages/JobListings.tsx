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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 6;
  const [currentBannerImage, setCurrentBannerImage] = useState(0);
  const bannerImages = [
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerImage((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  const scrollToTop = () => {
    const scrollContainer = document.getElementById('main-content-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToJobs = () => {
    listingsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Ensure top of page on mount
  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await jobsApi.getAllJobs(currentPage, jobsPerPage);
        if (res.success && res.data) {
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
            isNew: true, 
            isUrgent: false
          }));
          
          setJobs(apiJobs);
          setTotalPages((res.data as any).pages || 1);
          setTotalJobs((res.data as any).total || 0);
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
    
    // Only scroll to jobs if not first mount (pagination)
    if (currentPage > 1) {
      scrollToJobs();
    }
  }, [currentPage]);

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
    <div style={{ width: '100%', maxWidth: '100vw', margin: '0', padding: '0', paddingBottom: '6rem' }}>
      
      {/* Cinematic Hero Banner */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        overflow: 'hidden',
        marginBottom: '4rem',
        marginTop: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A'
      }}>
        {/* Animated Background Image */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80" 
            alt="Careers at NeST" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
          zIndex: 1
        }} />

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ 
              fontSize: '5.2rem', 
              fontWeight: 900, 
              letterSpacing: '-0.04em', 
              lineHeight: 1, 
              color: '#ffffff',
              fontFamily: "'Montserrat', sans-serif"
            }}
          >
            <span style={{ color: '#ef4444' }}>Careers</span> at NeST<span style={{ color: '#ef4444' }}>.</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ 
              width: '80px', 
              height: '4px', 
              background: '#ef4444', 
              margin: '1.5rem auto 0',
              borderRadius: '2px'
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Shape Our Future Video Section */}
      <div style={{ display: 'flex', gap: '5rem', alignItems: 'center', marginBottom: '8rem', flexWrap: 'wrap', padding: '2rem 0' }}>
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{ flex: '1 1 500px' }}
        >
          <h2 style={{ 
            fontSize: '3.2rem', 
            fontWeight: 500, 
            color: '#2D3E61', 
            marginBottom: '1.5rem', 
            letterSpacing: '-0.01em', 
            lineHeight: 1.1,
            fontFamily: '"Outfit", sans-serif'
          }}>
            Shape Our Future <br />
            Together!
          </h2>
          <p style={{ 
            color: '#64748b', 
            fontSize: '0.98rem', 
            lineHeight: '1.8', 
            fontWeight: 400, 
            marginBottom: '2.5rem',
            maxWidth: '600px'
          }}>
            At NeST Digital, we strive to create opportunities for our professionals to learn, grow, lead, and innovate. We are a company that takes pride in our people and provides an ecosystem of support, challenge, and inspiration to push the boundaries of personal and career growth.
          </p>
          <motion.button 
            onClick={() => {
              setCurrentBannerImage(1);
              scrollToJobs();
            }}
            whileHover={{ scale: 1.05, opacity: 0.95 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              background: 'linear-gradient(90deg, #1e1b4b 0%, #b91c1c 100%)', 
              color: 'white', 
              border: 'none', 
              padding: '14px 40px', 
              borderRadius: '100px', 
              fontWeight: 800, 
              fontSize: '0.9rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.8rem', 
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            EXPLORE NOW <ChevronRight size={18} />
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            flex: '1 1 600px', 
            position: 'relative', 
            borderRadius: '32px', 
            overflow: 'hidden', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.05)',
            background: '#000'
          }}
        >
          <video 
            controls 
            autoPlay 
            muted 
            loop 
            style={{ width: '100%', display: 'block' }}
          >
            <source src="https://nestdigital.com/wp-content/uploads/2026/04/videoplayback.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)', 
            pointerEvents: 'none' 
          }} />
        </motion.div>
          </div> {/* Close 1400px container for Shape Our Future section */}

      {/* Future-proof Career Section (Diagonal Swipe + Glow + Full Width Breakout) */}
      <div 
        id="career-banner-section"
        style={{ 
          display: 'flex', 
        width: '100vw', 
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        minHeight: '520px', 
        marginBottom: '6rem',
        overflow: 'hidden',
        background: '#1e1b4b'
      }}>
        {/* Left Side: Luxury Luminous Image Slider */}
        <div style={{ flex: 1, position: 'relative', background: '#1e1b4b', overflow: 'hidden' }}>
          <AnimatePresence>
            <motion.div
              key={currentBannerImage}
              initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(5px)' }}
              transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <img 
                src={bannerImages[currentBannerImage]} 
                alt="Careers at NeST" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              
              {/* Luminous Glow Overlay */}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
                zIndex: 2 
              }} />
            </motion.div>
          </AnimatePresence>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(30, 27, 75, 0.3))', zIndex: 3 }} />
        </div>

        {/* Right Side: NeST Blue Content */}
        <div style={{ 
          flex: 1, 
          background: '#1e1b4b', 
          padding: '5rem 4rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ 
              fontSize: '2.8rem', 
              fontWeight: 700, 
              marginBottom: '1.5rem', 
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1.2
            }}
          >
            Future-proof your career with NeST Digital
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ 
              fontSize: '1.1rem', 
              lineHeight: 1.7, 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '2.5rem',
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 400
            }}
          >
            At NeST Digital, we believe in a future where seamless collaboration between engineering excellence and human creativity achieves extraordinary outcomes. This includes empowering NeST people to create their own exceptional career experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              to="/jobs" 
              style={{ 
                color: '#ffffff', 
                textDecoration: 'none', 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem',
                borderBottom: '2px solid #ffffff',
                paddingBottom: '4px',
                width: 'fit-content',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.gap = '1.2rem'}
              onMouseLeave={(e) => e.currentTarget.style.gap = '0.8rem'}
            >
              Explore Technology & Careers <ChevronRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
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
                  borderRadius: '28px',
                  padding: '1.5rem',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  minHeight: '340px',
                  cursor: 'pointer',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
              >
                {/* Full Bleed Background Image */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                   <motion.img 
                      variants={{ hover: { scale: 1.1, opacity: 0.6 } }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      src={bgImage} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} 
                      alt="" 
                   />
                   <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.4) 100%)' }} />
                </div>

                {/* Top Info row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <div>
                    {job.isNew && (
                      <span style={{ background: 'rgba(211, 47, 47, 0.9)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '5px 12px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New</span>
                    )}
                  </div>
                </div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, paddingTop: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.6rem', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{job.title}</h3>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.2rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building size={14} color="#ef4444" /> {job.company}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#ef4444" /> {job.location.split(',')[0]}
                    </span>
                  </div>

                  {/* Skills array - Simplified Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {job.skills.slice(0, 3).map(skill => (
                      <span
                        key={skill}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', alignSelf: 'center' }}>+{job.skills.length - 3}</span>
                    )}
                  </div>

                  {/* Flex Spacer to push footer to bottom */}
                  <div style={{ flex: 1 }} />

                  {/* Footer details & Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>{job.type}</span>
                         <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                         <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '3px' }}>
                           <Clock size={12} /> {job.postedAt}
                         </span>
                       </div>
                       <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.85rem' }}>{job.salary || 'Competitive'}</span>
                     </div>
                     
                     <Link id={`link-${job.id}`} to={`/jobs/${job.id}`} style={{ display: 'none' }} />

                     <motion.button
                       variants={{ hover: { scale: 1.05 } }}
                       onClick={(e) => { e.stopPropagation(); handleApply(job.id, job.title); }}
                       disabled={appliedJobs.has(job.id)}
                       style={{
                         padding: '0.6rem 1.4rem',
                         background: appliedJobs.has(job.id) ? '#10B981' : '#d32f2f',
                         color: 'white',
                         borderRadius: '12px',
                         fontWeight: 700,
                         fontSize: '0.85rem',
                         border: 'none',
                         cursor: appliedJobs.has(job.id) ? 'default' : 'pointer',
                       }}
                     >
                       {appliedJobs.has(job.id) ? 'Applied' : 'Apply Now'}
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
      
      {/* Premium Pagination Component */}
      {!loading && totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginTop: '5rem', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1rem',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '24px',
            border: '1px solid rgba(0, 0, 0, 0.03)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            maxWidth: 'fit-content',
            margin: '5rem auto 0'
          }}
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '14px',
              border: '1px solid rgba(0,0,0,0.05)',
              background: currentPage === 1 ? 'transparent' : 'white',
              color: currentPage === 1 ? '#CBD5E1' : '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: currentPage === 1 ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <motion.button
                key={pageNum}
                whileHover={currentPage !== pageNum ? { y: -2 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '14px',
                  background: currentPage === pageNum ? '#0F172A' : 'white',
                  color: currentPage === pageNum ? 'white' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: currentPage === pageNum ? '0 10px 20px rgba(15, 23, 42, 0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
                  border: currentPage === pageNum ? 'none' : '1px solid rgba(0,0,0,0.05)'
                }}
              >
                {pageNum}
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '14px',
              border: '1px solid rgba(0,0,0,0.05)',
              background: currentPage === totalPages ? 'transparent' : 'white',
              color: currentPage === totalPages ? '#CBD5E1' : '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: currentPage === totalPages ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </motion.div>
      )}

      {/* Results Summary */}
      {!loading && totalJobs > 0 && (
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>
          Showing {(currentPage - 1) * jobsPerPage + 1} to {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs} opportunities
        </p>
      )}

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
      </div>
    </div>
  );
};

export default JobListings;
