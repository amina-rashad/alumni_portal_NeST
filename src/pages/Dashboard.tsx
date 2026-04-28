import React, { useEffect, useState } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Calendar, Users, Star, 
  Activity, Image as ImageIcon, MapPin, 
  Clock, MessageSquare, ThumbsUp, Share2,
  Award, ChevronRight, ChevronLeft,
  MoreHorizontal, FileText, ArrowRight,
  BrainCircuit, BookOpen, Heart, ShieldCheck, Sparkles, X
} from 'lucide-react';
import { getUser, coursesApi, jobsApi, type AuthUser, studentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Premium Job Backgrounds
import architectBg from '../assets/jobs/software_architect.png';
import aiBg from '../assets/jobs/ai_engineer.png';
import cyberBg from '../assets/jobs/cybersecurity.png';
import designerBg from '../assets/jobs/designer.png';
import devopsBg from '../assets/jobs/devops_sre.png';
import bannerImg from '../assets/dashboard_banner.png';

// --- MOCK DATA ---
const dummyJobs = [
  { id: 'd1', title: 'Principal Software Architect', company: 'NeST Digital', location: 'Trivandrum, KL', salary: '₹35L - ₹50L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Full-time', tags: ['Engineering', 'Leadership'], backgroundImage: architectBg },
  { id: 'd2', title: 'Senior AI Research Engineer', company: 'NeST AI Labs', location: 'Kochi, KL', salary: '₹30L - ₹45L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Hybrid', tags: ['AI/ML', 'Research'], backgroundImage: aiBg },
  { id: 'd3', title: 'Infrastructure Security Lead', company: 'NeST CyberSec', location: 'Bangalore, KA', salary: '₹32L - ₹48L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Full-time', tags: ['Security', 'Cloud'], backgroundImage: cyberBg },
  { id: 'd4', title: 'Product Experience Designer', company: 'NeST Digital', location: 'Remote', salary: '₹25L - ₹38L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Remote', tags: ['UI/UX', 'Design'], backgroundImage: designerBg },
  { id: 'd5', title: 'DevOps & Site Reliability Engineer', company: 'NeST Digital', location: 'Trivandrum, KL', salary: '₹28L - ₹42L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Full-time', tags: ['DevOps', 'Cloud'], backgroundImage: devopsBg }
];

const feed = [
  { 
    id: 1, 
    author: { name: 'NeST Alumni Association', title: 'Official Network Portal', avatar: 'https://ui-avatars.com/api/?name=NeST+Alumni&background=0F172A&color=fff' }, 
    time: '2h ago', 
    content: 'We are thrilled to announce the upcoming Global Alumni Meet 2026. Join us in celebrating a decade of engineering excellence! 🎉 Register now in the Events tab to secure your spot. #NeSTAlumni #TechLeadership', 
    likes: 342, 
    comments: 45,
    isOfficial: true
  },
  { 
    id: 2, 
    author: { name: 'Dr. Sarah Jenkins', title: 'Data Science Director at TechCorp | Batch of 2018', avatar: 'https://i.pravatar.cc/150?img=5' }, 
    time: '5h ago', 
    content: 'Excited to share that my team has successfully launched our new AI analytics platform! The foundational engineering principles I learned during my time at NeST were instrumental to this success. Let\'s connect! 🤖💡', 
    likes: 128, 
    comments: 24, 
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop' 
  }
];

const recommendations = [
  { name: 'Priya Sharma', title: 'Product Manager @ Google', avatar: 'https://i.pravatar.cc/150?img=9', mutual: 12 },
  { name: 'Michael Chen', title: 'Senior DevOps Engineer', avatar: 'https://i.pravatar.cc/150?img=12', mutual: 8 },
  { name: 'Emily Davis', title: 'UX Research Lead @ Meta', avatar: 'https://i.pravatar.cc/150?img=1', mutual: 24 }
];

const events = [
  { id: 1, title: 'Annual Alumni Tech Summit', date: 'Oct 15', time: '09:00 AM PST', attendees: 450, color: '#0F172A' },
  { id: 2, title: 'AI & Machine Learning Workshop', date: 'Nov 02', time: '01:00 PM PST', attendees: 128, color: '#3B82F6' }
];

const quizzes = [
  { id: 1, title: 'React Performance Masterclass', questions: 15, difficulty: 'Advanced', time: '20 mins', color: '#10B981' },
  { id: 2, title: 'Cloud Architecture Essentials', questions: 10, difficulty: 'Intermediate', time: '15 mins', color: '#8B5CF6' }
];

// --- ANIMATION VARIANTS ---
const smoothSpring = { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 };

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { ...smoothSpring, staggerChildren: 0.15, delayChildren: 0.1 } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: smoothSpring
  }
};

const Dashboard: React.FC = () => {
  const [user, setUserData] = useState<AuthUser | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  useEffect(() => {
    // Load the authenticated user from local storage
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) {
      setUserData(currentUser);
    }
    
    // Fetch all dashboard data
    const fetchAllData = async () => {
      try {
        const [courseRes, jobRes, insightRes, pathwayRes, queryRes] = await Promise.all([
          coursesApi.getAllCourses(),
          jobsApi.getAllJobs(),
          studentAPI.fetchPersonalInsights(),
          studentAPI.fetchRecommendedPathways(),
          studentAPI.fetchMyQueries()
        ]);

        if (courseRes.success) setCourses(courseRes.data.courses);
        if (jobRes.success) setJobs(jobRes.data.jobs);
        if (insightRes.success) setInsights(insightRes.data);
        if (pathwayRes.success) setPathways(pathwayRes.data);
        if (queryRes.success) setQueries(queryRes.data);
      } catch (err) {
        console.error("Dashboard data load error", err);
      } finally {
        setIsLoadingExtras(false);
      }
    };
    
    // Fetch live jobs and filter by user profile + NeST focus
    const fetchJobs = async () => {
      try {
        const res = await jobsApi.getAllJobs();
        const data = res.data as any;
        let filteredJobs = [];
        
        if (res.success && data && data.jobs && data.jobs.length > 0) {
          filteredJobs = data.jobs.filter((j: any) => 
            j.company.toLowerCase().includes('nest') || 
            (user && j.title.toLowerCase().includes(user.full_name.split(' ')[0].toLowerCase())) // Mock profile matching
          );
        }
        
        if (filteredJobs.length === 0) {
           // Fallback to elite NeST dummy jobs that match typical alumni profiles
           setJobs(dummyJobs);
        } else {
           setJobs(filteredJobs);
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
        setJobs(dummyJobs);
      }
    };
    fetchJobs();
  }, []);

  const handleLike = (id: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const marqueeRef = React.useRef<HTMLDivElement>(null);

  // Removed Marquee Motion logic for static morphological layout
  useEffect(() => {
    return () => {};
  }, [jobs, isHovered]);

  return (
    <div className="font-sans" style={{ 
      backgroundColor: '#f6f9fc', 
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(211, 47, 47, 0.05) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(45, 34, 84, 0.05) 0px, transparent 50%),
        radial-gradient(at 50% 100%, rgba(59, 130, 246, 0.05) 0px, transparent 50%)
      `,
      minHeight: '100vh', 
      padding: '3rem 1.5rem', 
      fontFamily: '"Montserrat", sans-serif' 
    }}>
      
      {/* GLOBAL CSS OVERRIDES */}
      <style>{`
        /* Force professional sans-serif fonts */
        .font-sans, .font-sans h1, .font-sans h2, .font-sans h3, .font-sans h4, .font-sans h5, .font-sans h6, .font-sans p, .font-sans span, .font-sans button, .font-sans input {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif !important;
          letter-spacing: -0.015em;
        }

        /* Ultra-Luxury Card Styling */
        .luxury-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
          position: relative;
        }

         .job-marquee-container {
            width: 100%;
            overflow: hidden; 
            padding: 2rem 0 4rem;
            position: relative;
            cursor: grab;
         }
         .job-marquee-container:active {
            cursor: grabbing;
         }
         .marquee-track {
            display: flex;
            gap: 2.5rem;
            width: max-content;
         }
         .job-splash-card {
            min-width: 320px;
            height: 280px;
            background: #0f172a;
            border-radius: 32px;
            padding: 1.75rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
            position: relative;
            overflow: hidden;
            color: white;
            z-index: 1;
        }
        .job-card-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 50%, rgba(15, 23, 42, 0.9) 100%);
            z-index: 2;
            transition: opacity 0.5s;
        }
        .job-splash-card:hover .job-card-overlay {
            opacity: 0.85;
        }
        .job-bg-image {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
            transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .job-splash-card:hover .job-bg-image {
            transform: scale(1.1);
        }
        .job-card-content {
            position: relative;
            z-index: 3;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .job-splash-card::after {
           content: "";
           position: absolute;
           top: -2px; left: -2px; right: -2px; bottom: -2px;
           background: linear-gradient(45deg, #d32f2f, #3b82f6, #9a0007, #d32f2f);
           background-size: 400%;
           z-index: -1;
           filter: blur(15px);
           opacity: 0;
           transition: opacity 0.5s;
           border-radius: 36px;
           animation: glow-rotate 20s linear infinite;
        }
        .job-splash-card:hover::after {
           opacity: 0.4;
        }

        /* High-End Animated Noise */
        @keyframes jitter {
          0% { transform: translate(0,0) }
          10% { transform: translate(-1%,-1%) }
          20% { transform: translate(1%,1%) }
          30% { transform: translate(-2%,1%) }
          40% { transform: translate(2%,-1%) }
          50% { transform: translate(-1%,2%) }
          60% { transform: translate(1%,-2%) }
          70% { transform: translate(-2%,-2%) }
          80% { transform: translate(2%,2%) }
          90% { transform: translate(-1%,1%) }
          100% { transform: translate(0,0) }
        }

        .noise-container {
          position: absolute;
          inset: -200%;
          width: 400%;
          height: 400%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.04;
          pointer-events: none;
          animation: jitter 0.2s steps(4) infinite;
          z-index: 0;
        }

        .premium-banner-wrapper {
          position: relative;
          padding: 0;
          background: #fff9f6; /* Subtle cream background to match reference */
          border-radius: 32px;
          border: 1px solid rgba(15, 23, 42, 0.05);
          overflow: hidden;
          margin-bottom: 2rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: stretch;
          min-height: 220px;
        }

        .banner-content {
          flex: 1;
          padding: 2rem 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          z-index: 2;
        }

        .banner-image-container {
          width: 45%;
          position: relative;
          overflow: hidden;
          background: #fff;
        }

        .banner-image-container::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(to right, #fff9f6 0%, transparent 10%, transparent 90%, #fff 100%);
          z-index: 1;
        }

        .banner-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .luxury-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 1;
          opacity: 0.15;
          pointer-events: none;
        }

        /* High-End Button Hovers */
        .btn-premium {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .btn-premium::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255,255,255,0.1);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .btn-premium:hover::after {
          opacity: 1;
        }
        .btn-outline {
          border: 1px solid #E2E8F0;
          background: white;
          color: #0F172A;
        }
        .btn-outline:hover {
          border-color: #0F172A;
        }

        /* Utilities */
        .link-hover:hover {
          color: #2563EB !important;
          text-decoration: underline;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes shimmerEffect {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .premium-heading-welcome {
          background: linear-gradient(110deg, #0F172A 0%, #0F172A 45%, #ffffff 50%, #0F172A 55%, #0F172A 100%);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: sweepTextBanner 6s infinite ease-in-out;
          display: inline;
          position: relative;
          overflow: hidden;
        }

        @keyframes sweepTextBanner {
          0% { background-position: -125% 0; }
          25% { background-position: 125% 0; }
          100% { background-position: 125% 0; }
        }

        .premium-heading-name {
          background: linear-gradient(135deg, #d32f2f 0%, #ff4d4d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline;
          text-transform: capitalize;
          position: relative;
          font-weight: 800;
          filter: drop-shadow(0 2px 4px rgba(211, 47, 47, 0.1));
        }

        .premium-heading-name::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 4px;
          width: 100%;
          height: 8px;
          background: rgba(211, 47, 47, 0.08);
          z-index: -1;
          border-radius: 4px;
        }

        /* Subtle Shimmer Overlay */
        .premium-heading-welcome::after, .premium-heading-name::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            transparent 40%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 60%,
            transparent 100%
          );
          background-attachment: fixed;
          background-size: 200% 100%;
          pointer-events: none;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientFlow 4s linear infinite;
          z-index: 10;
        }
      `}</style>

      {/* 
        MAIN CENTRALISED LAYOUT (ONE BY ONE)
        A constrained width makes horizontal reading comfortable and focuses the user beautifully.
      */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* WELCOME BANNER WITH NOISE & GRADIENT */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="premium-banner-wrapper"
        >
          <div className="banner-content">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}
            >
              <p style={{ margin: 0, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15rem', fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}>Dashboard Overview</p>
              {user && (
                <span style={{ 
                  padding: '4px 14px', 
                  background: '#2D2254', 
                  color: '#fff', 
                  borderRadius: '999px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  boxShadow: '0 4px 12px rgba(45, 34, 84, 0.2)',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {user.user_type === 'alumni' ? 'Alumni' : user.user_type}
                </span>
              )}
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12, mass: 1.2, delay: 0.2 }}
              style={{ 
                margin: 0, 
                fontSize: '4.25rem', 
                fontWeight: 900, 
                letterSpacing: '-0.04em', 
                lineHeight: 1, 
                color: '#1e293b',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Welcome back, <span className="premium-heading-name">{user ? user.full_name : 'noble'}</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: 'easeOut', duration: 1.2, delay: 0.5 }}
              style={{ 
                margin: '1.25rem 0 0', 
                color: '#64748B', 
                fontSize: '1.5rem', 
                fontWeight: 500, 
                maxWidth: '650px', 
                lineHeight: 1.4,
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '-0.01em'
              }}
            >
              Your alumni network is growing. Check out the latest updates and opportunities from classmates.
            </motion.p>
          </div>
          
          <div className="banner-image-container">
             <img src={bannerImg} alt="Alumni Group" className="banner-image" />
          </div>
        </motion.div>
        
        {/* NEW: LEARNING HEALTH SECTION */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="luxury-card p-8 bg-gradient-to-br from-[#1a2652] to-[#0f172a] text-white overflow-hidden relative group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-orange-400 mb-6">
                <Flame size={20} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Active Streak</span>
              </div>
              <div className="text-4xl font-black mb-1 tracking-tight">{insights?.streak || 0} Days</div>
              <p className="text-indigo-200 text-xs font-medium italic">"You're on fire! Keep it up."</p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Flame size={160} fill="currentColor" />
            </div>
          </div>

          <div className="luxury-card p-8 bg-white border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Experience</div>
                <div className="text-3xl font-black text-[#1e293b] tracking-tight">{insights?.xp || 0} XP</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Zap size={20} fill="currentColor" />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-slate-400">Next Level</span>
                <span className="text-blue-600">{insights?.nextMilestone}</span>
              </div>
              <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '82%' }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="luxury-card p-8 bg-white border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recent Badges</div>
              <div className="flex -space-x-3">
                {insights?.badges.map((b: any, i: number) => (
                  <div key={i} title={b.name} className="w-12 h-12 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg" style={{ backgroundColor: b.color }}>
                    <Award size={20} className="text-white" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                  +4
                </div>
              </div>
            </div>
            <button className="mt-6 text-[#d32f2f] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
              View All Achievements <ArrowRight size={14} />
            </button>
          </div>
        </motion.section>

        {/* 1. RECOMMENDED JOBS (MARQUEE SPLASH CARDS) */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
          style={{ marginBottom: '4rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#d32f2f', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                  <Briefcase size={22} color="white" />
                </div>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.03em', fontFamily: 'Montserrat, sans-serif' }}>Recommended For You</h2>
             </div>
             <button onClick={() => navigate('/jobs')} className="btn-premium" style={{ border: 'none', background: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f', fontWeight: 800, padding: '12px 30px', borderRadius: '999px', fontSize: '0.95rem', fontFamily: 'Montserrat, sans-serif' }}>
                Explore All
             </button>
          </div>

          <div 
            className="job-marquee-container" 
            style={{ overflow: 'hidden', position: 'relative' }}
          >
             <div style={{ padding: '1rem 0' }}>
               <div style={{ 
                 display: 'grid', 
                 gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', 
                 gap: '2.5rem',
                 width: '100%'
               }}>
                {jobs.map((job, i) => (
                  <motion.div 
                    layoutId={`card-${job.id}`}
                    key={job.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    className="job-splash-card"
                    style={{ minWidth: 'auto', width: '100%', cursor: 'pointer', height: '280px' }}
                    onClick={() => setSelectedJob(job)}
                  >
                    <img 
                      src={job.backgroundImage || architectBg} 
                      className="job-bg-image" 
                      alt="Job Background"
                    />
                    <div className="job-card-overlay" />
                    
                    <div className="job-card-content" style={{ position: 'relative', zIndex: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ 
                            background: 'rgba(255, 255, 255, 0.15)', 
                            color: '#fff', 
                            padding: '8px 18px', 
                            borderRadius: '99px', 
                            fontSize: '0.75rem', 
                            fontWeight: 900, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.08em',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}>
                            NeST Internal
                          </span>
                      </div>
  
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                          {job.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1rem', color: '#E2E8F0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Users size={16} color="#d32f2f" /> {job.company}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: '#CBD5E1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <MapPin size={16} color="#d32f2f" /> {job.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FULL SECTION MORPHING OVERLAY (🔥 ELITE UI) */}
            <AnimatePresence>
              {selectedJob && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    background: 'rgba(5, 10, 25, 0.4)',
                    backdropFilter: 'blur(30px)'
                  }}
                  onClick={() => setSelectedJob(null)}
                >
                  <motion.div 
                    layoutId={`card-${selectedJob.id}`}
                    style={{
                      width: '100%',
                      maxWidth: '1300px',
                      height: '85vh',
                      background: '#0f172a',
                      borderRadius: '48px',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img 
                      src={selectedJob.backgroundImage || architectBg} 
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
                      alt="Job detail"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f172a 30%, transparent 100%)' }} />
                    
                    <div style={{ position: 'relative', zIndex: 10, padding: '5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1, background: '#d32f2f' }}
                        style={{ position: 'absolute', top: '3rem', right: '3rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}
                        onClick={() => setSelectedJob(null)}
                      >
                        <X size={24} />
                      </motion.button>

                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring", damping: 20 }}>
                        <span style={{ background: 'linear-gradient(90deg, #d32f2f, #9a0007)', color: '#fff', padding: '10px 28px', borderRadius: '99px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', boxShadow: '0 10px 20px rgba(211,47,47,0.3)' }}>Elite Career Track</span>
                        <h2 style={{ fontSize: '5rem', fontWeight: 950, color: '#fff', margin: '1.5rem 0 1rem', letterSpacing: '-0.05em', lineHeight: 0.95 }}>{selectedJob.title}</h2>
                        <div style={{ display: 'flex', gap: '4rem', fontSize: '1.3rem', color: '#E2E8F0', fontWeight: 700, marginBottom: '2.5rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Users size={24} color="#d32f2f" /> {selectedJob.company}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><MapPin size={24} color="#d32f2f" /> {selectedJob.location}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Briefcase size={24} color="#d32f2f" /> Leadership Track</span>
                        </div>
                        <p style={{ fontSize: '1.5rem', color: '#CBD5E1', lineHeight: 1.5, maxWidth: '900px', opacity: 0.85, fontWeight: 500 }}>Join NeST Digital's top-tier engineering taskforce. We are looking for visionaries to lead our next generation of distributed systems and industrial automation frameworks.</p>
                        <div style={{ marginTop: '4rem', display: 'flex', gap: '2rem' }}>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/jobs/${selectedJob.id}`)} style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '1.5rem 4rem', borderRadius: '24px', fontWeight: 800, fontSize: '1.2rem', cursor: 'pointer' }}>Apply for Opportunity</motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedJob(null)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '1.5rem 2.5rem', borderRadius: '24px', fontWeight: 700, fontSize: '1.2rem', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>Close Detail</motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* 2. UPCOMING EVENTS */}
        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
             <div style={{ background: '#2D2254', padding: '10px', borderRadius: '14px', display: 'flex' }}>
               <Calendar size={22} color="white" />
             </div>
             <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Featured Network Events</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
             {events.map((event, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants} 
                  className="luxury-card" 
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                   <div style={{ background: `linear-gradient(90deg, ${event.color}, transparent)`, width: '100%', height: '6px' }} />
                   <div style={{ padding: '2rem', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                         <div style={{ background: '#f8fafc', padding: '12px 20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#d32f2f', textTransform: 'uppercase' }}>{event.date.split(' ')[0]}</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>{event.date.split(' ')[1]}</p>
                         </div>
                         <button className="btn-premium" style={{ background: 'transparent', color: '#64748B', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
                           Network Only
                         </button>
                      </div>
                      <h4 style={{ margin: '0 0 1rem', fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>{event.title}</h4>
                      <div style={{ display: 'flex', gap: '1.5rem', color: '#64748B', fontSize: '0.95rem', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> {event.time}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} /> {event.attendees}+ Joined</span>
                      </div>
                   </div>
                   <div style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', marginLeft: '8px' }}>
                        {[1,2,3].map(n => <img key={n} src={`https://i.pravatar.cc/150?img=${n+10}`} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', marginLeft: '-8px' }} alt="attendee" />)}
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', border: '2px solid white', marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>+12</div>
                      </div>
                      <button className="btn-premium" style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}>Secure Spot</button>
                   </div>
                </motion.div>
             ))}
          </div>
        </motion.section>

        {/* 3. COURSES */}
        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#3B82F6', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                  <Award size={22} color="white" />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Advanced Learning</h2>
              </div>
              <button onClick={() => navigate('/learning')} className="link-hover" style={{ background: 'transparent', border: 'none', color: '#64748B', fontWeight: 700 }}>Browse Catalogue</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {courses.length === 0 ? (
                <p style={{ color: '#64748B', fontSize: '1rem' }}>Curating elite masterclasses...</p>
              ) : courses.map((course, i) => (
                  <motion.div key={course.id || i} variants={itemVariants} className="luxury-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/learning/course/${course.id}`)}>
                    <div style={{ height: '180px', background: 'linear-gradient(135deg, #0F172A, #334155)', position: 'relative', overflow: 'hidden' }}>
                      <div className="noise-container" style={{ opacity: 0.1 }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={64} color="white" style={{ opacity: 0.2 }} />
                      </div>
                      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '999px', color: 'white', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {course.level || 'Mastery'}
                      </div>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        <h4 style={{ margin: '0 0 0.75rem', fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>{course.title}</h4>
                        <p style={{ margin: '0 0 1.5rem', fontSize: '0.95rem', color: '#64748B', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                          <span style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color="#d32f2f" /> {course.duration || 'Flexible'}</span>
                          <span style={{ color: '#d32f2f', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Resume <ArrowRight size={16} /></span>
                        </div>
                    </div>
                  </motion.div>
              ))}
          </div>
        </motion.section>
        
        {/* CURATED SENIOR INSIGHTS (ALUMNI STORIES OVERVIEW) */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#FF9500', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                <Activity size={22} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', fontFamily: 'Montserrat, sans-serif' }}>Alumni Stories</h2>
            </div>
            <button onClick={() => navigate('/feed')} className="link-hover" style={{ background: 'transparent', border: 'none', color: '#64748B', fontWeight: 700 }}>View Stories</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {feed.map((post) => (
              <motion.div key={post.id} variants={itemVariants} className="luxury-card" style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '24px', overflow: 'hidden' }}>
                <div style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img 
                        src={post.author.avatar.replace('background=0F172A', 'background=d32f2f')} 
                        alt={post.author.name} 
                        style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} 
                      />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{post.author.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>{post.author.title} • {post.time}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p style={{ margin: '0 0 1.5rem', color: '#334155', lineHeight: 1.6, fontSize: '1.05rem', fontWeight: 450 }}>{post.content}</p>
                  
                  {post.image && (
                    <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', maxHeight: '400px' }}>
                      <img src={post.image} alt="Insight" style={{ width: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* READ-ONLY INTERACTION BAR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                        <ShieldCheck size={14} color="#10B981" /> Verified Archive
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Sparkles size={14} color="#F59E0B" /> Alumni Story
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLike(post.id)}
                      style={{ 
                        background: likedPosts.has(post.id) ? 'rgba(211, 47, 47, 0.05)' : 'transparent',
                        border: '1px solid',
                        borderColor: likedPosts.has(post.id) ? 'rgba(211, 47, 47, 0.2)' : '#E2E8F0',
                        padding: '8px 20px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <motion.div animate={{ scale: likedPosts.has(post.id) ? [1, 1.4, 1] : 1 }}>
                        <Heart size={18} color={likedPosts.has(post.id) ? '#d32f2f' : '#64748B'} fill={likedPosts.has(post.id) ? '#d32f2f' : 'transparent'} />
                      </motion.div>
                      <span style={{ fontWeight: 800, color: likedPosts.has(post.id) ? '#d32f2f' : '#1e293b', fontSize: '0.9rem' }}>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div style={{ paddingBottom: '6rem' }} />
      </div>
    </div>
  );
};

export default Dashboard;
