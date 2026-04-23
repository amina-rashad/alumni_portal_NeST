import React, { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Briefcase, Calendar, Users, Star, 
  Activity, Image as ImageIcon, MapPin, 
  Clock, MessageSquare, ThumbsUp, Share2,
  Award, ChevronRight,
  MoreHorizontal, FileText, ArrowRight,
  BrainCircuit, BookOpen
} from 'lucide-react';
import { getUser, coursesApi, jobsApi, type AuthUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA ---
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
import bannerImg from '../assets/dashboard_banner.png';

const recommendations = [
  { name: 'Priya Sharma', title: 'Product Manager @ Google', avatar: 'https://i.pravatar.cc/150?img=9', mutual: 12 },
  { name: 'Michael Chen', title: 'Senior DevOps Engineer', avatar: 'https://i.pravatar.cc/150?img=12', mutual: 8 },
  { name: 'Emily Davis', title: 'UX Research Lead @ Meta', avatar: 'https://i.pravatar.cc/150?img=1', mutual: 24 }
];

// Global dummy jobs removed - fetching from database!

// Global dummy courses removed - fetching from database!

const events = [
  { id: 1, title: 'Annual Alumni Tech Summit', date: 'Oct 15', time: '09:00 AM PST', attendees: 450, color: '#0F172A' },
  { id: 2, title: 'AI & Machine Learning Workshop', date: 'Nov 02', time: '01:00 PM PST', attendees: 128, color: '#3B82F6' }
];

const quizzes = [
  { id: 1, title: 'React Performance Masterclass', questions: 15, difficulty: 'Advanced', time: '20 mins', color: '#10B981' },
  { id: 2, title: 'Cloud Architecture Essentials', questions: 10, difficulty: 'Intermediate', time: '15 mins', color: '#8B5CF6' }
];

// --- ANIMATION VARIANTS ---
// Premium sophisticated spring
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
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load the authenticated user from local storage
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) {
      setUserData(currentUser);
    }
    
    // Fetch live courses
    const fetchCourses = async () => {
      try {
        const res = await coursesApi.getAllCourses();
        const data = res.data as any;
        if (res.success && data && data.courses) {
          setCourses(data.courses);
        }
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    };
    fetchCourses();
    
    // Fetch live jobs
    const fetchJobs = async () => {
      try {
        const res = await jobsApi.getAllJobs();
        const data = res.data as any;
        if (res.success && data && data.jobs) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
      }
    };
    fetchJobs();
  }, []);

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
        .luxury-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%);
          pointer-events: none;
        }
        .luxury-card:hover {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          transform: translateY(-8px) scale(1.01);
          border-color: rgba(211, 47, 47, 0.1);
        }

        /* Job Flash Card Marquee */
        .job-marquee-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 2rem 0;
          cursor: grab;
        }
        .job-marquee-container:active {
          cursor: grabbing;
        }
        .job-flash-card {
          min-width: 420px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(24px);
          border-radius: 28px;
          padding: 2.5rem;
          margin-right: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 12px 40px -10px rgba(0, 0, 0, 0.08);
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .job-flash-card:hover {
          transform: scale(1.03) translateY(-10px);
          box-shadow: 0 30px 60px -12px rgba(211, 47, 47, 0.15);
          border-color: rgba(211, 47, 47, 0.3);
          background: #fff;
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

        {/* 1. RECOMMENDED JOBS (AUTO-MOVING FLASH CARDS) */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
          className="section-margin"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#d32f2f', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                  <Briefcase size={22} color="white" />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Recommended Jobs</h2>
             </div>
             <button onClick={() => navigate('/jobs')} className="btn-premium" style={{ border: 'none', background: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f', fontWeight: 700, padding: '10px 24px', borderRadius: '999px', fontSize: '0.9rem' }}>
                Explore All
             </button>
          </div>

          <div className="job-marquee-container">
            <motion.div 
              drag="x"
              dragConstraints={{ left: -3000, right: 0 }}
              animate={{ x: [-1500, 0] }}
              transition={{ 
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 5,
                  ease: "linear",
                },
              }}
              whileHover={{ animationPlayState: 'paused' }}
              style={{ display: 'flex', width: 'max-content' }}
            >
              {/* Multiplying jobs for infinite effect */}
              {[...jobs, ...jobs, ...jobs, ...jobs].map((job, i) => (
                  <div 
                    key={i} 
                    className="job-flash-card"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.05)', padding: '0.75rem', borderRadius: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                          {job.logo ? (
                            <img src={job.logo} alt={job.company} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                          ) : (
                            <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #2D2254, #1a2652)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '20px' }}>
                              {(job.company || 'J').charAt(0).toUpperCase()}
                            </div>
                          )}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', background: '#f8fafc', padding: '6px 14px', borderRadius: '999px', border: '1px solid #f1f5f9' }}>
                        {i % 2 === 0 ? 'Urgent' : 'New'}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>{job.title}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users size={18} color="#d32f2f" /> {job.company}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <span style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={18}/> {job.location}
                          </span>
                          {job.salary && <span style={{ fontSize: '0.95rem', color: '#10B981', fontWeight: 800 }}>{job.salary}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1,2,3].map(n => <div key={n} style={{ width: '20px', height: '4px', borderRadius: '2px', background: n===1 ? '#d32f2f' : '#e2e8f0' }} />)}
                        </div>
                        <span style={{ color: '#d32f2f', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          Apply Now <ArrowRight size={18} />
                        </span>
                    </div>
                  </div>
              ))}
            </motion.div>
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
                   <div style={{ h: '8px', background: `linear-gradient(90deg, ${event.color}, transparent)`, width: '100%', height: '6px' }} />
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

        {/* 4. ACTIVITY FEED (USER POSTS) */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#FF9500', padding: '10px', borderRadius: '14px', display: 'flex' }}>
              <Activity size={22} color="white" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Nexus Feed</h2>
          </div>

          <motion.div variants={itemVariants} className="luxury-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img 
                src={user?.profile_picture || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=d32f2f&color=fff`} 
                alt={user?.full_name || 'You'} 
                style={{ width: '64px', height: '64px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
              />
              <button 
                className="btn-premium"
                style={{ flex: 1, textAlign: 'left', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.25rem 2rem', borderRadius: '16px', color: '#94a3b8', fontWeight: 500, fontSize: '1.1rem' }}
              >
                Spark a conversation or share a milestone...
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[{ icon: ImageIcon, text: 'Media', color: '#3B82F6' }, { icon: Calendar, text: 'Event', color: '#10B981' }, { icon: FileText, text: 'Article', color: '#F59E0B' }].map((item, i) => (
                <button key={i} className="btn-premium luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '12px 24px', borderRadius: '16px', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                  <item.icon size={20} color={item.color} /> {item.text}
                </button>
              ))}
            </div>
          </motion.div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {feed.map((post) => (
              <motion.div key={post.id} variants={itemVariants} className="luxury-card">
                <div style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <img src={post.author.avatar.replace('background=0F172A', 'background=d32f2f')} alt={post.author.name} style={{ width: '60px', height: '60px', borderRadius: post.isOfficial ? '16px' : '50%', border: '2px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                      <div>
                        <h4 className="link-hover" style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {post.author.name}
                          {post.isOfficial && <span style={{ background: '#d32f2f', color: 'white', padding: '3px 10px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official</span>}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>{post.author.title}</p>
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {post.time}</p>
                      </div>
                    </div>
                    <button className="btn-premium" style={{ padding: '10px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}><MoreHorizontal size={22} color="#64748B" /></button>
                  </div>
                  
                  <p style={{ margin: '0 0 2rem', color: '#1e293b', lineHeight: 1.8, fontSize: '1.1rem', fontWeight: 450 }}>{post.content}</p>
                </div>
                
                {post.image && (
                  <div style={{ maxHeight: '500px', overflow: 'hidden' }}>
                    <img src={post.image} alt="Feed" style={{ width: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                
                <div style={{ padding: '1.5rem 2.5rem 2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex' }}>
                        {[...Array(2)].map((_, i) => <div key={i} style={{ background: i===0 ? '#d32f2f' : '#2D2254', borderRadius: '50%', padding: '6px', border: '3px solid white', marginLeft: i===0 ? 0 : '-10px', zIndex: 2-i }}><ThumbsUp size={12} color="white" /></div>)}
                      </div>
                      <span style={{ color: '#1e293b', fontWeight: 800 }}>{post.likes}</span> Elite Recognitions
                    </div>
                    <span className="link-hover" style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>{post.comments} thoughts shared</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {[{ icon: ThumbsUp, text: 'Recognize' }, { icon: MessageSquare, text: 'Contribute' }, { icon: Share2, text: 'Amplify' }].map((action, i) => (
                      <button key={i} className="btn-premium luxury-card" style={{ background: 'rgba(248, 250, 252, 0.5)', border: 'none', padding: '1rem', borderRadius: '16px', color: '#64748B', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        <action.icon size={20} /> {action.text}
                      </button>
                    ))}
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
