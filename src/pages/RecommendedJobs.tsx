import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, MapPin, Briefcase, Clock, ChevronRight, Star, TrendingUp, Zap, Target, BookOpen, Building, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobsApi, applicationsApi, usersApi, getUser } from '../services/api';

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
  matchedTechStacks: string[];
  matchedPositions: string[];
  matchScore: number;
  matchReason: string;
  salary?: string;
  urgent?: boolean;
}

const getMatchColor = (score: number) => {
  if (score >= 85) return { color: '#2b8a3e', bg: '#ebfbee', border: '#69db7c', glow: 'rgba(43,138,62,0.1)' };
  if (score >= 70) return { color: '#1971c2', bg: '#e7f5ff', border: '#74c0fc', glow: 'rgba(25,113,194,0.1)' };
  if (score >= 50) return { color: '#e67700', bg: '#fff9db', border: '#ffd43b', glow: 'rgba(230,119,0,0.1)' };
  if (score > 0) return { color: '#495057', bg: '#f8f9fa', border: '#dee2e6', glow: 'rgba(0,0,0,0.03)' };
  return { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', glow: 'rgba(0,0,0,0.02)' };
};

const getMatchLabel = (score: number) => {
  if (score >= 85) return 'Excellent Match';
  if (score >= 70) return 'Strong Match';
  if (score >= 50) return 'Good Match';
  if (score > 0) return 'Moderate Match';
  return 'No Match';
};

const timeAgo = (dateStr: string | undefined) => {
  if (!dateStr) return 'Recently';
  let cleanStr = String(dateStr).trim();
  if (!cleanStr.endsWith('Z') && !/[+-]\d{2}(:?\d{2})?$/.test(cleanStr)) {
    cleanStr += 'Z';
  }
  const parsedTime = new Date(cleanStr).getTime();
  if (isNaN(parsedTime)) return 'Recently';

  const diffInSeconds = Math.floor((Date.now() - parsedTime) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return new Date(cleanStr).toLocaleDateString();
};

// Helper: Check if a job matches a selected Tech Stack
const checkTechStackMatch = (stack: string, jobTitle: string, jobDept: string, jobDesc: string, jobSkills: string[]): boolean => {
  const text = `${jobTitle} ${jobDept} ${jobDesc} ${jobSkills.join(' ')}`.toLowerCase();
  const s = stack.toLowerCase().trim();

  if (text.includes(s)) return true;

  switch (s) {
    case 'software engineering':
      return text.includes('software') || text.includes('developer') || text.includes('engineer') || text.includes('backend') || text.includes('frontend') || text.includes('fullstack') || text.includes('web') || text.includes('programming');
    case 'architecture':
      return text.includes('architect') || text.includes('architecture') || text.includes('system design') || text.includes('solution');
    case 'quality engineering':
      return text.includes('quality') || text.includes('qa') || text.includes('test') || text.includes('tester') || text.includes('sdet') || text.includes('automation') || text.includes('load test');
    case 'cybersecurity':
      return text.includes('security') || text.includes('cyber') || text.includes('infosec') || text.includes('penetration') || text.includes('soc') || text.includes('vulnerability');
    case 'embedded systems':
      return text.includes('embedded') || text.includes('firmware') || text.includes('rtos') || text.includes('microcontroller') || text.includes('c++') || text.includes('hardware') || text.includes('iot');
    case 'iot':
      return text.includes('iot') || text.includes('internet of things') || text.includes('connected') || text.includes('sensors') || text.includes('mqtt');
    case 'data and analytics':
      return text.includes('data') || text.includes('analytics') || text.includes('bi') || text.includes('sql') || text.includes('machine learning') || text.includes('ai') || text.includes('etl') || text.includes('database');
    case 'finance':
      return text.includes('finance') || text.includes('financial') || text.includes('accounting') || text.includes('analyst') || text.includes('audit');
    case 'project management':
      return text.includes('project') || text.includes('program') || text.includes('scrum') || text.includes('agile') || text.includes('pmp') || text.includes('delivery');
    default:
      return false;
  }
};

// Helper: Check if a job matches a selected Target Position
const checkPositionMatch = (pos: string, jobTitle: string): boolean => {
  const normPos = pos.toLowerCase().trim();
  const normTitle = jobTitle.toLowerCase().trim();

  // 1. Direct substring match
  if (normTitle.includes(normPos) || normPos.includes(normTitle)) return true;

  // 2. Token overlap analysis
  const stopWords = new Set(['in', 'and', 'the', 'of', 'for', 'with', 'at', 'to', 'a', '&', 'c++', 'qt']);
  const posWords = normPos.split(/[\s,–—\-_/]+/).filter(w => w.length > 2 && !stopWords.has(w));
  const titleWords = normTitle.split(/[\s,–—\-_/]+/).filter(w => w.length > 2 && !stopWords.has(w));

  const commonWords = posWords.filter(w => titleWords.includes(w));
  
  if (commonWords.length >= 2) return true;
  if (commonWords.length === 1 && (commonWords[0] === 'architect' || commonWords[0] === 'tester' || commonWords[0] === 'embedded')) {
    return true;
  }

  return false;
};

const RecommendedJobs: React.FC = () => {
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userTechStacks, setUserTechStacks] = useState<string[]>([]);
  const [userInterestedPositions, setUserInterestedPositions] = useState<string[]>([]);
  const [userSpecialization, setUserSpecialization] = useState<string>('');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'match' | 'recent'>('match');
  const [filterPreference, setFilterPreference] = useState<'all' | 'positions' | 'tech_stacks'>('all');
  const [isUpdatingSkills, setIsUpdatingSkills] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const JOBS_PER_PAGE = 5;
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Get Real User Skills, Tech Stacks & Interested Positions from Profile
      let skills: string[] = [];
      let techStacks: string[] = [];
      let interestedPositions: string[] = [];
      let specialization = '';

      try {
        const profileRes = await usersApi.getProfile();
        if (profileRes.success && profileRes.data?.user) {
          const u = profileRes.data.user;
          skills = Array.isArray(u.skills) 
            ? u.skills 
            : (typeof u.skills === 'string' ? u.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
          techStacks = Array.isArray(u.tech_stacks) ? u.tech_stacks : [];
          interestedPositions = Array.isArray(u.interested_positions) ? u.interested_positions : [];
          specialization = u.specialization || '';
        } else {
          const localUser = getUser() as any;
          skills = (localUser?.skills as string[]) || [];
          techStacks = (localUser?.tech_stacks as string[]) || [];
          interestedPositions = (localUser?.interested_positions as string[]) || [];
          specialization = localUser?.specialization || '';
        }
      } catch (err) {
        const localUser = getUser() as any;
        skills = (localUser?.skills as string[]) || [];
        techStacks = (localUser?.tech_stacks as string[]) || [];
        interestedPositions = (localUser?.interested_positions as string[]) || [];
        specialization = localUser?.specialization || '';
      }
      
      setUserSkills(skills);
      setUserTechStacks(techStacks);
      setUserInterestedPositions(interestedPositions);
      setUserSpecialization(specialization);

      // 2. Get All Jobs & Applications (fetch up to 100 to evaluate all portal jobs)
      const jobsRes = await jobsApi.getAllJobs(1, 100);
      const appsRes = await applicationsApi.getMyApplications();
      
      if (jobsRes.success && jobsRes.data) {
        const allJobsRaw = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data as any).jobs || [];
        const allJobs = allJobsRaw.filter((j: any) => j.is_active !== false);
        const myApps = appsRes.success && appsRes.data ? (appsRes.data as any).applications || [] : [];
        const appliedIds = new Set<string>(
          myApps
            .filter((a: any) => a.status !== 'Withdrawn' && a.status !== 'withdrawn')
            .map((a: any) => String(a.job_id))
        );
        setAppliedJobs(appliedIds);

        // 3. Multi-Factor Recommendation Engine: Skills + Tech Stacks + Interested Positions
        const recommendations: RecommendedJob[] = allJobs.map((job: any) => {
          const jobSkills = job.skills_required || [];
          const normalizedJobSkills = Array.isArray(jobSkills) 
            ? jobSkills 
            : typeof jobSkills === 'string' 
              ? jobSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
              : [];

          const matchedSkills = normalizedJobSkills.filter((s: string) => 
            skills.some(us => us.toLowerCase() === s.toLowerCase())
          );
          const missingSkills = normalizedJobSkills.filter((s: string) => 
            !skills.some(us => us.toLowerCase() === s.toLowerCase())
          );

          // Evaluate Match for Tech Stacks
          const matchedTechStacks = techStacks.filter((stack: string) => 
            checkTechStackMatch(stack, job.title || '', job.category || job.department || '', job.description || '', normalizedJobSkills)
          );

          // Evaluate Match for Interested Target Positions
          const matchedPositions = interestedPositions.filter((pos: string) => 
            checkPositionMatch(pos, job.title || '')
          );

          // Check if any criteria actually matched
          const hasAnyMatch = matchedSkills.length > 0 || matchedPositions.length > 0 || matchedTechStacks.length > 0;
          const isProfileEmpty = skills.length === 0 && techStacks.length === 0 && interestedPositions.length === 0;

          let totalScore = 0;

          if (hasAnyMatch) {
            // Weighted Scoring Calculation:
            // A. Skill Match: up to 40 points
            let skillPoints = 0;
            if (normalizedJobSkills.length > 0 && skills.length > 0) {
              skillPoints = (matchedSkills.length / normalizedJobSkills.length) * 40;
            } else if (skills.length > 0 && normalizedJobSkills.length === 0) {
              skillPoints = 20;
            }

            // B. Target Position Preference Match: up to 35 points
            let positionPoints = 0;
            if (matchedPositions.length > 0) {
              const isDirectMatch = matchedPositions.some((p: string) => 
                job.title.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(job.title.toLowerCase())
              );
              positionPoints = isDirectMatch ? 35 : 25;
            }

            // C. Tech Stack Preference Match: up to 25 points
            let techStackPoints = 0;
            if (matchedTechStacks.length > 0) {
              techStackPoints = Math.min(25, 15 + (matchedTechStacks.length - 1) * 5);
            }

            // D. Bonuses (Urgency, Full Skill Mastery, Specialization alignment): up to 10 points
            let bonusPoints = 0;
            if (specialization && (job.title.toLowerCase().includes(specialization.toLowerCase()) || (job.category && job.category.toLowerCase().includes(specialization.toLowerCase())))) {
              bonusPoints += 4;
            }
            if (job.is_urgent) {
              bonusPoints += 3;
            }
            if (matchedSkills.length > 0 && matchedSkills.length === normalizedJobSkills.length) {
              bonusPoints += 5;
            }

            totalScore = Math.round(skillPoints + positionPoints + techStackPoints + bonusPoints);
            totalScore = Math.min(100, Math.max(10, totalScore));

            if (matchedPositions.length > 0 && matchedTechStacks.length > 0 && matchedSkills.length >= 2) {
              totalScore = 100;
            }
          } else {
            // User matches 0 skills, 0 positions, and 0 tech stacks for this role
            totalScore = 0;
          }

          // Formulate Personalized, Human-Readable AI Match Reason
          let matchReason = '';
          if (matchedPositions.length > 0 && matchedTechStacks.length > 0) {
            matchReason = `Direct match for target position "${matchedPositions[0]}" in ${matchedTechStacks[0]}`;
          } else if (matchedPositions.length > 0) {
            matchReason = `Matches your selected target position: "${matchedPositions[0]}"`;
          } else if (matchedTechStacks.length > 0 && matchedSkills.length > 0) {
            matchReason = `Aligned with your ${matchedTechStacks[0]} focus & skills in ${matchedSkills.slice(0, 2).join(' & ')}`;
          } else if (matchedTechStacks.length > 0) {
            matchReason = `Fits your interested Tech Stack in ${matchedTechStacks.slice(0, 2).join(' & ')}`;
          } else if (matchedSkills.length > 0) {
            matchReason = `Matches your core expertise in ${matchedSkills.slice(0, 3).join(', ')}`;
          } else if (isProfileEmpty) {
            matchReason = 'Add your skills, tech stacks, or target roles in Edit Profile to calculate match';
          } else {
            matchReason = 'No matching skills or target roles found on your profile for this job';
          }

          return {
            id: job.id || job._id,
            title: job.title,
            department: job.category || job.department || 'Engineering',
            company: job.company || 'NeST Digital',
            location: job.location,
            type: job.type || 'Full-time',
            experience: job.experience_level || 'Not Specified',
            postedAt: timeAgo(job.createdAt),
            description: job.description,
            skills: normalizedJobSkills,
            matchedSkills: matchedSkills,
            missingSkills: missingSkills,
            matchedTechStacks: matchedTechStacks,
            matchedPositions: matchedPositions,
            matchScore: totalScore,
            matchReason: matchReason,
            salary: job.salary_range || job.salary,
            urgent: job.is_urgent || false
          };
        });

        setJobs(recommendations);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, userSkills, filterPreference]);

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

  const handleApply = async (id: string) => {
    try {
      const res = await applicationsApi.applyForJob({ job_id: id });
      if (res.success) {
        const newApplied = new Set(appliedJobs);
        newApplied.add(id);
        setAppliedJobs(newApplied);
        showToast('Application submitted successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to apply for job.');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while applying.');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filterPreference === 'positions') {
      return job.matchedPositions.length > 0;
    }
    if (filterPreference === 'tech_stacks') {
      return job.matchedTechStacks.length > 0;
    }
    return true;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'match') return b.matchScore - a.matchScore;
    if (sortBy === 'recent') {
      return b.id.localeCompare(a.id);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

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

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1.5px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`,
              borderRadius: '16px',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              minWidth: '320px',
              maxWidth: '500px',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {toast.type === 'success'
                ? <Check size={16} color="#16a34a" />
                : <AlertCircle size={16} color="#dc2626" />}
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: toast.type === 'success' ? '#15803d' : '#dc2626', flex: 1 }}>
              {toast.message}
            </span>
            <button
              onClick={() => setToast(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px', display: 'flex', flexShrink: 0 }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '2.5rem' }}
        >

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
              <span style={{ color: '#1e1b4b' }}>Recommended</span> <span style={{ color: '#ef4444' }}>For You</span>
            </h1>
          </div>
        </motion.div>

        {/* Career Category Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{ marginBottom: '4rem' }}
        >
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 400, 
            color: '#0F172A', 
            marginBottom: '2.5rem', 
            letterSpacing: '0.02em', 
            textAlign: 'left',
            fontFamily: '"Outfit", sans-serif'
          }}>
            Are you ready to shape your future with confidence?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { title: 'Experienced professionals', img: '/experienced_pro_career.png' },
              { title: 'Early careers', img: '/early_career_talents.png' },
              { title: 'Contract opportunities', img: '/contract_opportunities.png' }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ 
                  borderRadius: '20px', 
                  overflow: 'hidden', 
                  aspectRatio: '16/10', 
                  marginBottom: '1.2rem',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  color: '#ef4444', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  letterSpacing: '0.02em',
                  fontFamily: '"Outfit", sans-serif'
                }}>
                  {card.title}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Profile Match Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={20} color="#c8102e" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Your Recommendation Profile</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Jobs are dynamically matched against your selected Tech Stacks, Target Positions, and Core Skills.</p>
              </div>
            </div>

            <Link
              to="/profile/edit"
              state={{ from: '/jobs/recommended' }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                color: '#1a2652',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.2s'
              }}
            >
              Edit Stacks & Positions →
            </Link>
          </div>

          {/* Preferences Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            {/* Target Positions */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎯 Target Positions ({userInterestedPositions.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {userInterestedPositions.length > 0 ? (
                  userInterestedPositions.map(pos => (
                    <span key={pos} style={{ fontSize: '0.8rem', background: '#f5f3ff', color: '#5b21b6', border: '1px solid #ddd6fe', padding: '0.25rem 0.65rem', borderRadius: '12px', fontWeight: 600 }}>
                      {pos}
                    </span>
                  ))
                ) : (
                  <Link to="/profile/edit" state={{ from: '/jobs/recommended' }} style={{ fontSize: '0.82rem', color: '#8b5cf6', textDecoration: 'underline' }}>
                    + Select interested positions in profile
                  </Link>
                )}
              </div>
            </div>

            {/* Tech Stacks */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💻 Interested Tech Stacks ({userTechStacks.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {userTechStacks.length > 0 ? (
                  userTechStacks.map(stack => (
                    <span key={stack} style={{ fontSize: '0.8rem', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '0.25rem 0.65rem', borderRadius: '12px', fontWeight: 600 }}>
                      {stack}
                    </span>
                  ))
                ) : (
                  <Link to="/profile/edit" state={{ from: '/jobs/recommended' }} style={{ fontSize: '0.82rem', color: '#0284c7', textDecoration: 'underline' }}>
                    + Select interested tech stacks in profile
                  </Link>
                )}
              </div>
            </div>

            {/* Core Skills */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🛠️ Core Skills ({userSkills.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {userSkills.length > 0 ? (
                  userSkills.slice(0, 6).map(skill => (
                    <span key={skill} style={{ fontSize: '0.8rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.25rem 0.65rem', borderRadius: '12px', fontWeight: 600 }}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <Link to="/profile/edit" state={{ from: '/jobs/recommended' }} style={{ fontSize: '0.82rem', color: '#16a34a', textDecoration: 'underline' }}>
                    + Add skills in profile
                  </Link>
                )}
                {userSkills.length > 6 && (
                  <span style={{ fontSize: '0.78rem', color: '#64748b', alignSelf: 'center', fontWeight: 600 }}>+{userSkills.length - 6} more</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'space-around', background: '#f8fafc', padding: '1rem', borderRadius: '14px', flexWrap: 'wrap', border: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c8102e', margin: 0 }}>{jobs.length}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>Opportunities Evaluated</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b8a3e', margin: 0 }}>{jobs.filter(j => j.matchScore >= 85).length}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>Excellent Fits (85%+)</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1971c2', margin: 0 }}>{jobs.filter(j => j.matchScore >= 70 && j.matchScore < 85).length}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>Strong Fits (70–84%)</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c3aed', margin: 0 }}>{jobs.filter(j => j.matchedPositions.length > 0 || j.matchedTechStacks.length > 0).length}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>Target Stack & Role Fits</p>
            </div>
          </div>
        </motion.div>

        {/* Filter & Sort Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}
        >
          {/* Quick Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterPreference('all')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: filterPreference === 'all' ? '1px solid #1a2652' : '1px solid #e2e8f0',
                background: filterPreference === 'all' ? '#1a2652' : '#ffffff',
                color: filterPreference === 'all' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              All Matches ({jobs.length})
            </button>
            <button
              onClick={() => setFilterPreference('positions')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: filterPreference === 'positions' ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                background: filterPreference === 'positions' ? '#7c3aed' : '#ffffff',
                color: filterPreference === 'positions' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              🎯 Target Roles ({jobs.filter(j => j.matchedPositions.length > 0).length})
            </button>
            <button
              onClick={() => setFilterPreference('tech_stacks')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: filterPreference === 'tech_stacks' ? '1px solid #0284c7' : '1px solid #e2e8f0',
                background: filterPreference === 'tech_stacks' ? '#0284c7' : '#ffffff',
                color: filterPreference === 'tech_stacks' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              💻 Tech Stacks ({jobs.filter(j => j.matchedTechStacks.length > 0).length})
            </button>
          </div>

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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
              <Zap size={40} color="var(--primary)" />
            </motion.div>
            <p style={{ marginTop: '1rem', color: '#64748B' }}>Analyzing your profile and matching jobs...</p>
          </div>
        ) : paginatedJobs.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {paginatedJobs.map((job) => {
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

                      {/* AI Match Reason Banner */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.8rem',
                        padding: '0.45rem 0.9rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        width: 'fit-content',
                        border: '1px solid #e2e8f0'
                      }}>
                        <Zap size={14} color={job.matchScore > 0 ? 'var(--primary)' : '#94a3b8'} />
                        <span style={{ fontSize: '0.82rem', color: job.matchScore > 0 ? '#334155' : '#64748b', fontWeight: 600 }}>
                          {job.matchReason}
                        </span>
                        {job.matchScore === 0 && userSkills.length === 0 && (
                          <Link
                            to="/profile/edit"
                            state={{ from: '/jobs/recommended' }}
                            style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, marginLeft: '4px', textDecoration: 'underline' }}
                          >
                            Edit Profile →
                          </Link>
                        )}
                      </div>

                      {/* Preference Match Badges (Positions & Tech Stacks) */}
                      {(job.matchedPositions.length > 0 || job.matchedTechStacks.length > 0) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.8rem' }}>
                          {job.matchedPositions.map(pos => (
                            <span key={pos} style={{
                              fontSize: '0.78rem',
                              background: '#f5f3ff',
                              color: '#6d28d9',
                              border: '1px solid #ddd6fe',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}>
                              🎯 Target Position: {pos}
                            </span>
                          ))}
                          {job.matchedTechStacks.map(stack => (
                            <span key={stack} style={{
                              fontSize: '0.78rem',
                              background: '#f0f9ff',
                              color: '#0369a1',
                              border: '1px solid #bae6fd',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}>
                              💻 Tech Stack: {stack}
                            </span>
                          ))}
                        </div>
                      )}

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
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#f8f9fa', borderRadius: '16px', border: '1px solid #e9ecef' }}>
            <AlertCircle size={40} color="#adb5bd" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>No perfect matches found yet</h3>
            <p style={{ color: '#6c757d' }}>Update your profile skills to get better recommendations!</p>
          </div>
        )}

        {/* Premium Pagination */}
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
              padding: '1.5rem',
              borderRadius: '24px',
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

        {!loading && sortedJobs.length > 0 && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>
            Showing {(currentPage - 1) * JOBS_PER_PAGE + 1} to {Math.min(currentPage * JOBS_PER_PAGE, sortedJobs.length)} of {sortedJobs.length} recommendations
          </p>
        )}
      </div>
    </div>
  );
};

export default RecommendedJobs;
