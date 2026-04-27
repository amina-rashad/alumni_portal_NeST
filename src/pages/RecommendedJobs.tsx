import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, MapPin, Briefcase, Clock, ChevronRight, Star, TrendingUp, Zap, Target, BookOpen, Building, ExternalLink, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecommendedJob {
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
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  matchReason: string;
  salary?: string;
  urgent?: boolean;
}

const RECOMMENDED_JOBS: RecommendedJob[] = [
  {
    id: 'rec-1',
    title: 'Senior React Developer',
    department: 'Engineering',
    company: 'NeST Digital',
    location: 'Kochi, Kerala (Hybrid)',
    type: 'Full-time',
    experience: '4-6 Years',
    postedAt: '1 day ago',
    description: 'Build and maintain scalable web applications using React, TypeScript, and modern frontend tooling. Lead a team of junior developers and drive best practices.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    matchedSkills: ['React', 'TypeScript', 'Node.js'],
    missingSkills: ['GraphQL', 'AWS'],
    matchScore: 92,
    matchReason: 'Based on your engineering background and React expertise',
    salary: '₹18-25 LPA',
    urgent: true
  },
  {
    id: 'rec-2',
    title: 'Technical Project Manager',
    department: 'Product',
    company: 'NeST Digital',
    location: 'Trivandrum, Kerala (On-site)',
    type: 'Full-time',
    experience: '5-8 Years',
    postedAt: '3 days ago',
    description: 'Oversee the delivery of complex software projects, coordinating between engineering, design, and stakeholder teams to ensure timely and high-quality releases.',
    skills: ['Agile', 'Scrum', 'JIRA', 'Stakeholder Management', 'Risk Assessment'],
    matchedSkills: ['Agile', 'Scrum', 'JIRA'],
    missingSkills: ['Risk Assessment'],
    matchScore: 87,
    matchReason: 'Your leadership skills and Agile experience are a strong fit',
    salary: '₹20-30 LPA'
  },
  {
    id: 'rec-3',
    title: 'Full Stack Engineer',
    department: 'Engineering',
    company: 'NeST Digital',
    location: 'Remote',
    type: 'Full-time',
    experience: '3-5 Years',
    postedAt: '5 days ago',
    description: 'Work across the entire stack — from designing REST APIs to crafting responsive UIs. Join a fast-paced team shipping features weekly.',
    skills: ['React', 'Python', 'PostgreSQL', 'Docker', 'REST APIs'],
    matchedSkills: ['React', 'Python', 'PostgreSQL'],
    missingSkills: ['Docker'],
    matchScore: 85,
    matchReason: 'Matches your full-stack development experience',
    salary: '₹14-20 LPA'
  },
  {
    id: 'rec-4',
    title: 'DevOps Engineer',
    department: 'IT Infrastructure',
    company: 'NeST Digital',
    location: 'Kochi, Kerala (Hybrid)',
    type: 'Contract',
    experience: '4-7 Years',
    postedAt: '1 week ago',
    description: 'Design and manage CI/CD pipelines, container orchestration, and cloud infrastructure to support rapid development and deployment cycles.',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux'],
    matchedSkills: ['AWS', 'Linux'],
    missingSkills: ['Kubernetes', 'Terraform', 'Jenkins'],
    matchScore: 68,
    matchReason: 'Your cloud experience aligns with this role',
    salary: '₹16-22 LPA'
  },
  {
    id: 'rec-5',
    title: 'UI/UX Designer',
    department: 'Design',
    company: 'NeST Digital',
    location: 'Trivandrum, Kerala (On-site)',
    type: 'Full-time',
    experience: '2-4 Years',
    postedAt: '2 weeks ago',
    description: 'Create elegant, user-centric designs for enterprise-grade applications. Conduct user research and translate insights into beautiful interfaces.',
    skills: ['Figma', 'Prototyping', 'Design Systems', 'User Research', 'Wireframing'],
    matchedSkills: ['Figma'],
    missingSkills: ['Prototyping', 'Design Systems', 'User Research'],
    matchScore: 55,
    matchReason: 'Exploring a career in design based on your interest profile',
    salary: '₹8-14 LPA'
  },
  {
    id: 'rec-6',
    title: 'Data Analyst',
    department: 'Data & Analytics',
    company: 'NeST Digital',
    location: 'Remote',
    type: 'Full-time',
    experience: '2-4 Years',
    postedAt: '4 days ago',
    description: 'Analyze large datasets to uncover trends and deliver actionable insights. Build dashboards and reports that drive strategic business decisions.',
    skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'],
    matchedSkills: ['Python', 'SQL'],
    missingSkills: ['Tableau', 'Statistics'],
    matchScore: 72,
    matchReason: 'Your Python and SQL skills are directly applicable',
    salary: '₹10-16 LPA'
  }
];

const getMatchColor = (score: number) => {
  if (score >= 85) return { color: '#2b8a3e', bg: '#ebfbee', border: '#69db7c', glow: 'rgba(43,138,62,0.1)' };
  if (score >= 70) return { color: '#1971c2', bg: '#e7f5ff', border: '#74c0fc', glow: 'rgba(25,113,194,0.1)' };
  if (score >= 50) return { color: '#e67700', bg: '#fff9db', border: '#ffd43b', glow: 'rgba(230,119,0,0.1)' };
  return { color: '#868e96', bg: '#f8f9fa', border: '#dee2e6', glow: 'rgba(0,0,0,0.03)' };
};

const getMatchLabel = (score: number) => {
  if (score >= 85) return 'Excellent Match';
  if (score >= 70) return 'Strong Match';
  if (score >= 50) return 'Good Match';
  return 'Moderate Match';
};

const RecommendedJobs: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'match' | 'recent'>('match');

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

  const handleApply = (id: string) => {
    const newApplied = new Set(appliedJobs);
    newApplied.add(id);
    setAppliedJobs(newApplied);
  };

  const sortedJobs = [...RECOMMENDED_JOBS].sort((a, b) => {
    if (sortBy === 'match') return b.matchScore - a.matchScore;
    return 0; // keep original order for recency (already sorted)
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: 'transparent', color: '#1a1a1a', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '2.5rem' }}
        >

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '2.8rem', color: '#1a1a1a', margin: 0 }}>
              Recommended <span style={{ color: 'var(--primary)' }}>For You</span>
            </h1>
          </div>
        </motion.div>

        {/* Profile Match Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #fff8f8 0%, #f8f9fa 50%, #f0f4ff 100%)',
            border: '1px solid #e9ecef',
            borderRadius: '16px',
            padding: '1.8rem 2rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'center'
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Target size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1rem' }}>Your Profile Strengths</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Agile', 'Scrum', 'JIRA', 'AWS', 'Linux', 'Figma'].map(skill => (
                <span
                  key={skill}
                  style={{
                    fontSize: '0.78rem',
                    background: '#ffffff',
                    color: '#4a4a4a',
                    border: '1px solid #dee2e6',
                    padding: '0.25rem 0.7rem',
                    borderRadius: '14px',
                    fontWeight: 500
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '0 0 0.1rem 0' }}>{RECOMMENDED_JOBS.length}</p>
              <p style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 500, margin: 0 }}>Jobs Matched</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#2b8a3e', margin: '0 0 0.1rem 0' }}>{RECOMMENDED_JOBS.filter(j => j.matchScore >= 85).length}</p>
              <p style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 500, margin: 0 }}>Excellent Fits</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1971c2', margin: '0 0 0.1rem 0' }}>{RECOMMENDED_JOBS.filter(j => j.matchScore >= 70 && j.matchScore < 85).length}</p>
              <p style={{ fontSize: '0.8rem', color: '#6c757d', fontWeight: 500, margin: 0 }}>Strong Fits</p>
            </div>
          </div>
        </motion.div>

        {/* Sort Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}
        >
          <span style={{ color: '#6c757d', fontSize: '0.95rem' }}>
            Showing <strong style={{ color: '#1a1a1a' }}>{sortedJobs.length}</strong> personalized recommendations
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>Sort by:</span>
            <button
              onClick={() => setSortBy('match')}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 500,
                border: `1px solid ${sortBy === 'match' ? 'var(--primary)' : '#ced4da'}`,
                background: sortBy === 'match' ? 'var(--primary)' : '#ffffff',
                color: sortBy === 'match' ? 'white' : '#4a4a4a',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <TrendingUp size={14} /> Best Match
            </button>
            <button
              onClick={() => setSortBy('recent')}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 500,
                border: `1px solid ${sortBy === 'recent' ? 'var(--primary)' : '#ced4da'}`,
                background: sortBy === 'recent' ? 'var(--primary)' : '#ffffff',
                color: sortBy === 'recent' ? 'white' : '#4a4a4a',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Clock size={14} /> Most Recent
            </button>
          </div>
        </motion.div>

        {/* Job Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {sortedJobs.map((job) => {
            const matchColor = getMatchColor(job.matchScore);
            const matchLabel = getMatchLabel(job.matchScore);

            return (
              <motion.div
                key={job.id}
                variants={itemVariants}
                layout
                style={{
                  background: '#ffffff',
                  border: '1px solid #e9ecef',
                  borderRadius: '16px',
                  padding: '1.8rem 2rem',
                  marginBottom: '1.2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
                whileHover={{
                  boxShadow: `0 8px 24px ${matchColor.glow}`,
                  borderColor: matchColor.border,
                  y: -2
                }}
              >
                {/* Urgent ribbon */}
                {job.urgent && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '-32px',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.2rem 2.5rem',
                    transform: 'rotate(45deg)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    URGENT
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {/* Match Score Circle */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: matchColor.bg,
                      border: `3px solid ${matchColor.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: matchColor.color, lineHeight: 1 }}>{job.matchScore}</span>
                      <span style={{ fontSize: '0.55rem', fontWeight: 600, color: matchColor.color, opacity: 0.8 }}>%</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: matchColor.color, marginTop: '0.4rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {matchLabel}
                    </span>
                  </div>

                  {/* Job Details */}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{job.department}</span>
                      <span style={{ color: '#dee2e6' }}>•</span>
                      <span style={{ color: '#6c757d', fontSize: '0.78rem' }}>{job.type}</span>
                      {job.salary && (
                        <>
                          <span style={{ color: '#dee2e6' }}>•</span>
                          <span style={{ color: '#2b8a3e', fontSize: '0.78rem', fontWeight: 600 }}>{job.salary}</span>
                        </>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.3rem 0' }}>{job.title}</h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6c757d', fontSize: '0.85rem' }}>
                        <Building size={14} color="#6c757d" /> {job.company}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6c757d', fontSize: '0.85rem' }}>
                        <MapPin size={14} color="var(--primary)" /> {job.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6c757d', fontSize: '0.85rem' }}>
                        <Briefcase size={14} color="var(--primary)" /> {job.experience}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6c757d', fontSize: '0.85rem' }}>
                        <Clock size={14} color="#6c757d" /> {job.postedAt}
                      </span>
                    </div>

                    <p style={{ color: '#4a4a4a', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </p>

                    {/* AI Match Reason */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', padding: '0.4rem 0.8rem', background: '#f8f9fa', borderRadius: '6px', width: 'fit-content' }}>
                      <Zap size={13} color="var(--primary)" />
                      <span style={{ fontSize: '0.8rem', color: '#4a4a4a', fontStyle: 'italic' }}>{job.matchReason}</span>
                    </div>

                    {/* Skills Match */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
                      {job.matchedSkills.map(skill => (
                        <span key={skill} style={{
                          fontSize: '0.78rem',
                          background: '#ebfbee',
                          color: '#2b8a3e',
                          border: '1px solid #b2f2bb',
                          padding: '0.25rem 0.7rem',
                          borderRadius: '14px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          ✓ {skill}
                        </span>
                      ))}
                      {job.missingSkills.map(skill => (
                        <span key={skill} style={{
                          fontSize: '0.78rem',
                          background: '#fff9db',
                          color: '#e67700',
                          border: '1px solid #ffe066',
                          padding: '0.25rem 0.7rem',
                          borderRadius: '14px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <BookOpen size={11} /> {skill}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Link
                        to={`/jobs/${job.id}`}
                        style={{
                          background: '#ffffff',
                          color: '#1a1a1a',
                          border: '1px solid #ced4da',
                          padding: '0.55rem 1.2rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ced4da'; e.currentTarget.style.color = '#1a1a1a'; }}
                      >
                        View Details <ChevronRight size={15} />
                      </Link>
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={appliedJobs.has(job.id)}
                        style={{
                          background: appliedJobs.has(job.id) ? '#ebfbee' : 'var(--primary)',
                          color: appliedJobs.has(job.id) ? '#2b8a3e' : 'white',
                          padding: '0.55rem 1.5rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          border: appliedJobs.has(job.id) ? '1px solid #b2f2bb' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: appliedJobs.has(job.id) ? 'default' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { 
                          if (!appliedJobs.has(job.id)) {
                            e.currentTarget.style.background = 'var(--primary-hover)'; 
                            e.currentTarget.style.transform = 'translateY(-1px)'; 
                          }
                        }}
                        onMouseLeave={(e) => { 
                          if (!appliedJobs.has(job.id)) {
                            e.currentTarget.style.background = 'var(--primary)'; 
                            e.currentTarget.style.transform = 'translateY(0)'; 
                          }
                        }}
                      >
                        {appliedJobs.has(job.id) ? (
                          <>
                            <Check size={16} /> Applied
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                      <motion.button
                        onClick={(e) => toggleSaveJob(e, job.id)}
                        style={{
                          background: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          padding: '0.5rem',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: savedJobs.has(job.id) ? '#ffd700' : '#adb5bd',
                          transition: 'all 0.2s'
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Star size={18} fill={savedJobs.has(job.id) ? '#ffd700' : 'none'} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>


      </div>
    </div>
  );
};

export default RecommendedJobs;
