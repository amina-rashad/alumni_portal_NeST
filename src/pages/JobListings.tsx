import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Briefcase, Clock, 
  TrendingUp, Zap, 
  Building, SlidersHorizontal, 
  Bookmark, BookmarkCheck,
  Plus, Info, AlertCircle,
  Calendar, ChevronRight
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
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await jobsApi.getAllJobs();
        if (res.success && res.data && (res.data as any).jobs) {
          const apiJobs = (res.data as any).jobs.map((j: any) => {
            // Extract category and clean description if formatted as "[Category] [Type] description"
            let desc = j.description || '';
            let dept = 'Engineering';
            const deptMatch = desc.match(/^\[(.*?)\]/);
            if (deptMatch) {
              dept = deptMatch[1];
              desc = desc.replace(/^\[.*?\]\s*/, ''); // Remove category
              desc = desc.replace(/^\[.*?\]\s*/, ''); // Remove type if present
            }

            return {
              id: j.id,
              title: j.title || 'Untitled Role',
              department: dept,
              company: j.company || 'NeST Digital',
              location: j.location || 'Remote',
              type: j.type || 'Full-time',
              experience: j.experience_level || 'Not Specified',
              postedAt: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'Just now',
              description: desc,
              skills: j.skills_required || [],
              salary: j.salary,
              isNew: true,
              isUrgent: j.is_urgent === true,
              matchScore: Math.floor(Math.random() * 20) + 75 // Random high match for alumni
            };
          });
          setJobs([...apiJobs, ...MOCK_JOBS]);
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
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header & Stats Section */}
      <div style={{ marginBottom: '3rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}
        >
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Career <span style={{ color: '#d32f2f' }}>Opportunities</span>
            </h1>
            <p style={{ color: '#64748B', fontSize: '1.1rem', maxWidth: '600px' }}>
              Discover your next career milestone within the exclusive NeST alumni network and global ecosystem.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              to="/jobs/recommended" 
              className="btn-premium"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                padding: '0.8rem 1.5rem', 
                background: '#fff1f1', 
                color: '#d32f2f', 
                borderRadius: '12px', 
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              <Zap size={18} /> Recommended For You
            </Link>
            <button 
              className="btn-premium"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  padding: '0.8rem 1.5rem', 
                  background: '#0F172A', 
                  color: 'white', 
                  borderRadius: '12px', 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
            >
              <Plus size={18} /> Post a Job
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Active Listings', count: jobs.length, icon: Briefcase, color: '#3B82F6' },
            { label: 'New Today', count: jobs.filter(j => j.isNew).length, icon: Clock, color: '#10B981' },
            { label: 'Urgent Roles', count: jobs.filter(j => j.isUrgent).length, icon: AlertCircle, color: '#F59E0B' },
            { label: 'Partner Companies', count: 12, icon: Building, color: '#6366F1' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="luxury-card"
              style={{ flex: '1 1 200px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={22} color={stat.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>{stat.count}</p>
              </div>
            </motion.div>
          ))}
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
          filteredJobs.map((job) => (
            <motion.div 
              key={job.id} 
              variants={itemVariants}
              className="luxury-card"
              style={{ 
                padding: '2rem', 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1.25rem',
                transition: 'all 0.3s ease',
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
                
                <Link 
                  to={`/jobs/${job.id}/apply`}
                  className="btn-premium"
                  style={{ 
                    padding: '0.6rem 1.8rem', 
                    background: '#d32f2f', 
                    color: 'white', 
                    borderRadius: '8px', 
                    fontWeight: 700, 
                    fontSize: '0.9rem' 
                  }}
                >
                  Apply Now
                </Link>
              </div>
            </motion.div>
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

