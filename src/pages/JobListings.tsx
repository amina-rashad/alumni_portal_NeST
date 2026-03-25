import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Briefcase, Clock, Filter, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock Job Data
const JOB_LISTINGS = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'Kochi, Kerala (Hybrid)',
    type: 'Full-time',
    experience: '5-8 Years',
    postedAt: '2 days ago',
    description: 'We are looking for an experienced Full Stack Developer to lead our core engineering team and architect high-performance web applications.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    urgent: true
  },
  {
    id: '2',
    title: 'Lead UX/UI Designer',
    department: 'Design',
    location: 'Trivandrum, Kerala (On-site)',
    type: 'Full-time',
    experience: '4-6 Years',
    postedAt: '1 week ago',
    description: 'Join our design team to craft intuitive and beautiful user experiences for our enterprise products and client platforms.',
    skills: ['Figma', 'Prototyping', 'Design Systems', 'User Testing'],
    urgent: false
  },
  {
    id: '3',
    title: 'Cloud Infrastructure Architect',
    department: 'IT Infrastructure',
    location: 'Remote',
    type: 'Contract',
    experience: '8+ Years',
    postedAt: '3 days ago',
    description: 'Seeking a Cloud Architect to design and implement scalable cloud solutions for our global clients, ensuring security and high availability.',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
    urgent: true
  },
  {
    id: '4',
    title: 'Product Manager',
    department: 'Product',
    location: 'Dubai, UAE (On-site)',
    type: 'Full-time',
    experience: '5+ Years',
    postedAt: 'Just now',
    description: 'Drive the product vision and strategy for our next-generation digital platforms, working closely with engineering and design teams.',
    skills: ['Agile', 'Roadmapping', 'Jira', 'Strategy'],
    urgent: false
  },
  {
    id: '5',
    title: 'Frontend React Developer',
    department: 'Engineering',
    location: 'Kochi, Kerala (Hybrid)',
    type: 'Full-time',
    experience: '2-4 Years',
    postedAt: '5 days ago',
    description: 'Exciting opportunity to build responsive and interactive web interfaces using React and modern frontend tooling.',
    skills: ['React', 'TypeScript', 'Tailwind', 'Redux'],
    urgent: false
  },
  {
    id: '6',
    title: 'Data Scientist',
    department: 'Data & Analytics',
    location: 'Remote',
    type: 'Full-time',
    experience: '3-5 Years',
    postedAt: '2 weeks ago',
    description: 'Leverage machine learning and predictive modeling to extract actionable insights from complex datasets for our clients.',
    skills: ['Python', 'TensorFlow', 'SQL', 'Data Visualization'],
    urgent: false
  }
];

const CATEGORIES = ['All', 'Engineering', 'Design', 'Product', 'Data & Analytics', 'IT Infrastructure'];

const JobListings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeJobType, setActiveJobType] = useState('All');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Filter logic
  const filteredJobs = JOB_LISTINGS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || job.department === activeCategory;
    const matchesType = activeJobType === 'All' || job.type === activeJobType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const toggleSaveJob = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = new Set(savedJobs);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedJobs(newSaved);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '4rem 2rem', background: '#ffffff', color: '#1a1a1a' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '3rem' }}
        >
          <Link 
            to="/" 
            style={{ display: 'inline-flex', alignItems: 'center', color: '#666666', marginBottom: '1.5rem', fontSize: '0.9rem', transition: 'color 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#666666'; }}
          >
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#1a1a1a' }}>Explore <span style={{ color: 'var(--primary)' }}>Opportunities</span></h1>
          <p style={{ fontSize: '1.1rem', color: '#4a4a4a', maxWidth: '600px' }}>
            Discover exclusive career opportunities at NeST Digital. Leverage your alumni network to take the next step in your professional journey.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ 
            background: '#f8f9fa', 
            border: '1px solid #e9ecef',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '3rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
              <input 
                type="text" 
                placeholder="Search by role, skill, or keyword..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '8px',
                  border: '1px solid #ced4da',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
              />
            </div>
            <select 
              value={activeJobType}
              onChange={(e) => setActiveJobType(e.target.value)}
              style={{
                flex: '0 0 auto',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                background: '#ffffff',
                color: '#1a1a1a',
                fontSize: '1rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            <button style={{
              padding: '1rem 2rem',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.3s',
            }}>
              <Filter size={18} /> Filter
            </button>
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: '20px',
                  background: activeCategory === category ? 'var(--primary)' : '#ffffff',
                  border: `1px solid ${activeCategory === category ? 'var(--primary)' : '#ced4da'}`,
                  color: activeCategory === category ? 'white' : '#4a4a4a',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Info */}
        <div style={{ marginBottom: '1.5rem', color: '#6c757d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'result' : 'results'}</span>
        </div>

        {/* Job Listings Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}
        >
          <AnimatePresence>
            {filteredJobs.length > 0 ? filteredJobs.map(job => (
              <motion.div
                key={job.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e9ecef',
                  borderRadius: '16px',
                  padding: '1.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
                whileHover={{ translateY: -5, boxShadow: '0 12px 30px rgba(0,0,0,0.08)', borderColor: 'rgba(200, 16, 46, 0.3)' }}
              >
                {/* Urgent Badge */}
                {job.urgent && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '-2rem',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.2rem 2.5rem',
                    transform: 'rotate(45deg)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    URGENT
                  </div>
                )}

                {/* Save Job Button */}
                <motion.button 
                  onClick={(e: React.MouseEvent) => toggleSaveJob(e, job.id)}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: job.urgent ? '3rem' : '1.5rem',
                    color: savedJobs.has(job.id) ? '#ffd700' : '#adb5bd',
                    background: '#f8f9fa',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.3s, background 0.3s',
                    zIndex: 2,
                    border: '1px solid #e9ecef',
                    cursor: 'pointer'
                  }}
                  whileHover={{ scale: 1.1, backgroundColor: '#e9ecef' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Star size={18} fill={savedJobs.has(job.id) ? '#ffd700' : 'none'} />
                </motion.button>

                {/* Card Content */}
                <div style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
                  <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{job.department}</span>
                  <h3 style={{ fontSize: '1.4rem', margin: '0.5rem 0 1rem 0', color: '#1a1a1a' }}>{job.title}</h3>
                  <p style={{ color: '#4a4a4a', fontSize: '0.95rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </p>
                </div>

                {/* Meta details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d', fontSize: '0.9rem' }}>
                    <MapPin size={16} color="var(--primary)" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d', fontSize: '0.9rem' }}>
                    <Briefcase size={16} color="var(--primary)" />
                    <span>{job.experience}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d', fontSize: '0.9rem' }}>
                    <Clock size={16} color="var(--primary)" />
                    <span>{job.type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d', fontSize: '0.9rem' }}>
                    <span style={{ fontSize: '0.8rem', background: '#f8f9fa', border: '1px solid #e9ecef', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      {job.postedAt}
                    </span>
                  </div>
                </div>

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', marginTop: 'auto' }}>
                  {job.skills.map((skill, index) => (
                    <span key={index} style={{ fontSize: '0.8rem', background: '#f8f9fa', color: '#4a4a4a', border: '1px solid #e9ecef', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link 
                    to={`/jobs/${job.id}`} 
                    style={{ 
                      color: '#1a1a1a', 
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}
                  >
                    View Details <ChevronRight size={16} />
                  </Link>
                  <Link 
                    to={`/jobs/${job.id}/apply`}
                    style={{ 
                      background: 'var(--primary)', 
                      color: 'white', 
                      padding: '0.6rem 1.5rem', 
                      borderRadius: '8px', 
                      fontWeight: 600,
                      transition: 'background 0.3s, transform 0.2s',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Apply Now
                  </Link>
                </div>
              </motion.div>
            )) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
              >
                <div style={{ background: '#f8f9fa', display: 'inline-block', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
                  <Search size={40} color="#adb5bd" />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>No jobs found</h3>
                <p style={{ color: '#6c757d' }}>Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setActiveCategory('All'); setActiveJobType('All'); }}
                  style={{ marginTop: '1.5rem', background: '#ffffff', color: '#1a1a1a', border: '1px solid #ced4da', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
};

export default JobListings;
