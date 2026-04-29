import React, { useEffect, useState } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Calendar, Users, Star, 
  Activity, Image as ImageIcon, MapPin, 
  Clock, MessageSquare, ThumbsUp, Share2,
  Award, ChevronRight, ChevronLeft,
  MoreHorizontal, FileText, ArrowRight,
  BrainCircuit, BookOpen, Heart, ShieldCheck, Sparkles, X, Play
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
import alumniStoriesBg from '../assets/alumni_stories_bg.png';

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
  },
  { 
    id: 4, 
    author: { name: 'Alex Rivera', title: 'Tech Lead @ Google | Batch of 2015', avatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=0F172A&color=fff' }, 
    content: 'Mentoring NeST interns has been the most rewarding part of my year. The talent emerging from this portal is world-class. #Mentorship #NextGen', 
    likes: 89, 
    comments: 12 
  },
  { 
    id: 5, 
    author: { name: 'Priya Sharma', title: 'Senior Architect @ Amazon | Batch of 2017', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=EF4444&color=fff' }, 
    content: 'Just published my first book on Cloud Infrastructure! The solid foundation I built during my years at NeST made this possible. Proud to be an alum.', 
    likes: 215, 
    comments: 34 
  },
  { 
    id: 6, 
    author: { name: 'Marcus Chen', title: 'Product Manager @ Tesla | Batch of 2019', avatar: 'https://ui-avatars.com/api/?name=Marcus+Chen&background=10B981&color=fff' }, 
    content: 'Excited to be back on campus for the upcoming hackathon. Can\'t wait to see what the next generation is building! See you all there.', 
    likes: 167, 
    comments: 19 
  },
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
  const [isPlaying, setIsPlaying] = useState(false);

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
    return (
    <div className="font-sans light-dashboard" style={{ 
      minHeight: '100vh', 
      fontFamily: '"Montserrat", sans-serif',
      color: '#0F172A'
    }}>
      
      {/* GLOBAL CSS OVERRIDES */}
      <style>{`
        .font-sans, .font-sans h1, .font-sans h2, .font-sans h3, .font-sans h4, .font-sans h5, .font-sans h6, .font-sans p, .font-sans span, .font-sans button, .font-sans input {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif !important;
          letter-spacing: -0.015em;
        }

        .luxury-card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.3);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
          position: relative;
        }

        .btn-premium {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        .pulse-blob {
          animation: pulse-slow 8s infinite alternate ease-in-out;
        }
        @keyframes pulse-slow {
          0% { transform: scale(1) translate(0, 0); opacity: 0.3; }
          100% { transform: scale(1.1) translate(20px, -20px); opacity: 0.5; }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0F1523; 
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1); 
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2); 
        }
      `}</style>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0', 
        width: '100%',
        background: '#fff' 
      }}>
        
        {/* NEW TOP LAYOUT - FULL WIDTH BORDERLESS */}
        <div style={{
          background: '#FFF8F6',
          borderRadius: '0',
          display: 'flex',
          overflow: 'hidden',
          minHeight: '520px',
          boxShadow: 'none',
          borderBottom: 'none',
          width: '100%',
          marginBottom: '0'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex' }}>
            <div style={{ padding: '5rem 2rem', flex: '1.1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <span style={{ fontWeight: 800, color: '#334155', letterSpacing: '0.12em', fontSize: '0.85rem', textTransform: 'uppercase' }}>Dashboard Overview</span>
                <span style={{ background: '#1E1B4B', color: '#fff', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em' }}>Alumni</span>
              </div>
              <h1 style={{ fontSize: '4.8rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                Welcome back,<br/>
                <span style={{ color: '#EF4444' }}>{user ? user.full_name.split(' ')[0] : 'Amina'}</span>
              </h1>
              <p style={{ fontSize: '1.35rem', color: '#64748B', lineHeight: 1.6, maxWidth: '500px', fontWeight: 500, margin: 0 }}>
                Your alumni network is growing. Check out the latest updates and opportunities from classmates.
              </p>
            </div>
            <div style={{ flex: '1', position: 'relative' }}>
               <img src={bannerImg} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '200px', background: 'linear-gradient(to right, #FFF8F6, transparent)' }} />
            </div>
          </div>
        </div>

        {/* REDESIGNED SPLIT VIDEO SECTION */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          style={{ 
            width: '100%',
            background: '#fff',
            padding: '6rem 0 2rem',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 3rem', display: 'flex', gap: '5rem', alignItems: 'center' }}>
            
            {/* Left: Video Side */}
            <div style={{ flex: '1.4', position: 'relative' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/10',
                borderRadius: '24px',
                overflow: 'hidden',
                background: '#000',
              }}>
                {!isPlaying ? (
                  <div 
                    onClick={() => setIsPlaying(true)}
                    style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                      alt="Professional Growth" 
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{ 
                          width: '90px', 
                          height: '90px', 
                          borderRadius: '50%', 
                          background: 'rgba(255,255,255,0.2)', 
                          backdropFilter: 'blur(10px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255,255,255,0.4)',
                          boxShadow: '0 0 40px rgba(0,0,0,0.2)'
                        }}
                      >
                        <Play fill="#fff" color="#fff" size={32} style={{ marginLeft: '4px' }} />
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/Z4ZXIklXP8M?autoplay=1" 
                    title="Corporate Video" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    style={{ border: 'none' }}
                  ></iframe>
                )}
              </div>
            </div>

            {/* Right: Text Content */}
            <div style={{ flex: '1', paddingRight: '2rem' }}>
              <h2 style={{ fontSize: '2.75rem', fontWeight: 450, color: '#1E293B', lineHeight: 1.2, marginBottom: '1.2rem', letterSpacing: '-0.01em' }}>
                We invest in your <br/>professional growth
              </h2>
              <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem', fontWeight: 400 }}>
                An entrepreneurial spirit infuses everything we do, bringing curiosity and asking better questions to help solve clients' most complex problems with confidence.
              </p>
              <motion.button
                whileHover={{ x: 5 }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0F172A',
                  fontSize: '1.1rem',
                  fontWeight: 750,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Discover how to personalize your career
                <ArrowRight size={18} color="#0F172A" />
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* DIVERSITY AND INCLUSION SECTION - FLIPPED LAYOUT */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          style={{ 
            width: '100%',
            background: '#fff',
            padding: '2rem 0 6rem',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 3rem', display: 'flex', gap: '5rem', alignItems: 'center' }}>
            
            {/* Left: Text Content */}
            <div style={{ flex: '1', paddingLeft: '2rem' }}>
              <h2 style={{ fontSize: '2.75rem', fontWeight: 450, color: '#1E293B', lineHeight: 1.2, marginBottom: '1.2rem', letterSpacing: '-0.01em' }}>
                We bring diverse ideas, <br/>backgrounds and minds together
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.7, marginBottom: '2rem', fontWeight: 400 }}>
                At NeST, we bring together diverse ideas, perspectives, and experiences to create an inclusive culture where all voices are valued. This sense of belonging fuels innovation, encourages collaboration and helps empower you to form lasting connections while challenging and inspiring each other to shape a better future.
              </p>
              <motion.button
                whileHover={{ x: 5 }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0F172A',
                  fontSize: '1.1rem',
                  fontWeight: 750,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Explore our inclusive environment
                <ArrowRight size={18} color="#0F172A" />
              </motion.button>
            </div>

            {/* Right: Image Side */}
            <div style={{ flex: '1.4', position: 'relative' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/10',
                borderRadius: '24px',
                overflow: 'hidden',
                background: '#f1f5f9',
              }}>
                <img 
                  src="/diverse_inclusion.png" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Inclusive Environment" 
                />
              </div>
            </div>
          </div>
        </motion.section>




        {/* CONTAINER FOR STANDARD SECTIONS */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', gap: '5rem' }}>
          
          {/* FEATURED NETWORK EVENTS */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
          style={{ marginBottom: '1rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
             <div style={{ background: '#1E1B4B', padding: '12px', borderRadius: '14px', display: 'flex', color: '#fff' }}>
                <Calendar size={24} />
             </div>
             <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>Featured Network Events</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
             {events.slice(0, 2).map((event, i) => (
                <motion.div 
                   key={i}
                   variants={itemVariants}
                   style={{ 
                     background: '#ffffff', 
                     borderRadius: '24px', 
                     padding: '2.5rem', 
                     display: 'flex', 
                     flexDirection: 'column', 
                     justifyContent: 'space-between', 
                     boxShadow: '0 10px 40px rgba(0,0,0,0.03)', 
                     border: '1px solid rgba(0,0,0,0.04)',
                     borderTop: `4px solid ${event.color}`,
                     position: 'relative'
                   }}
                >
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                      <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '12px 18px', borderRadius: '16px' }}>
                         <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', marginBottom: '2px' }}>{event.date.split(' ')[0]}</div>
                         <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{event.date.split(' ')[1]}</div>
                      </div>
                      <span style={{ border: '1px solid #E2E8F0', color: '#64748B', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700 }}>
                        Network Only
                      </span>
                   </div>
                   
                   <div style={{ marginBottom: '2.5rem' }}>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem', color: '#0F172A', lineHeight: 1.3 }}>{event.title}</h3>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color="#94A3B8" /> {event.time}</span>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} color="#94A3B8" /> {event.attendees}+ Joined</span>
                      </div>
                   </div>
                   
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex' }}>
                         {[1,2,3].map(n => <img key={n} src={`https://i.pravatar.cc/150?img=${n+15}`} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #ffffff', marginLeft: n!==1 ? '-10px' : 0 }} alt="usr" />)}
                         <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: '2px solid #ffffff', marginLeft: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#3B82F6' }}>+12</div>
                      </div>
                      <button style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)' }}>
                        Secure Spot
                      </button>
                   </div>
                </motion.div>
             ))}
          </div>
        </motion.section>

        {/* REST OF SECTIONS (Jobs, Courses) */}        
        {/* 1. RECOMMENDED JOBS */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                  <Briefcase size={22} color="#ef4444" />
                </div>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>Job Recommendations</h2>
             </div>
             <button onClick={() => navigate('/jobs')} className="btn-premium" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#0F172A', fontWeight: 700, padding: '10px 24px', borderRadius: '999px', fontSize: '0.95rem' }}>
                Explore All
             </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {jobs.slice(0, 6).map((job, i) => (
                <motion.div 
                   key={i}
                   variants={itemVariants}
                   whileHover="hover"
                   onClick={() => setSelectedJob(job)}
                   className="luxury-card btn-premium"
                   style={{ 
                     height: '230px', 
                     padding: '1.5rem', 
                     cursor: 'pointer', 
                     display: 'flex', 
                     flexDirection: 'column', 
                     justifyContent: 'space-between', 
                     borderRadius: '24px', 
                     overflow: 'hidden',
                     position: 'relative',
                     background: '#0F172A',
                     border: '1px solid rgba(255,255,255,0.04)'
                   }}
                >
                   {/* UNIQUE STUNNING TRANSITION OVERLAYS */}
                   <motion.div 
                     variants={{
                        hover: { scale: 1.08 }
                     }}
                     transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                     style={{ position: 'absolute', inset: 0, zIndex: 0 }}
                   >
                      <img src={job.backgroundImage || architectBg} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} alt="" />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.4) 100%)' }} />
                   </motion.div>

                   {/* Sweeping Shine Effect */}
                   <motion.div 
                     variants={{
                        hover: { left: '150%', transition: { duration: 0.8, ease: "easeInOut" } }
                     }}
                     style={{
                        position: 'absolute',
                        top: 0,
                        left: '-150%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
                        zIndex: 2,
                        pointerEvents: 'none'
                      }}
                   />

                   {/* Border Glow Effect */}
                   <motion.div 
                     variants={{
                        hover: { opacity: 1 }
                     }}
                     initial={{ opacity: 0 }}
                     style={{
                        position: 'absolute',
                        inset: 0,
                        border: '2px solid #EF4444',
                        borderRadius: '24px',
                        zIndex: 3,
                        pointerEvents: 'none',
                        boxShadow: 'inset 0 0 15px rgba(239, 68, 68, 0.2)'
                     }}
                   />
                   
                   <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ 
                        background: 'rgba(239, 68, 68, 0.12)', 
                        color: '#EF4444', 
                        padding: '4px 12px', 
                        borderRadius: '8px', 
                        fontSize: '0.65rem', 
                        fontWeight: 900, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                      }}>
                        NeST Internal
                      </span>
                   </div>

                   
                   <div style={{ position: 'relative', zIndex: 4 }}>
                      <h4 style={{ margin: '0 0 0.6rem', fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{job.title}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users size={16} color="#ef4444" /> {job.company}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={16} color="#ef4444" /> {job.location}
                        </span>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </motion.section>

        {/* 2. COMMUNITY INSIGHTS PREVIEW - GLASSMORPHIC MARQUEE */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
          style={{ 
            marginBottom: '4rem',
            position: 'relative',
            padding: '8rem 0',
            background: 'radial-gradient(at 10% 20%, rgba(239, 68, 68, 0.06) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(59, 130, 246, 0.06) 0px, transparent 50%), #fff',
            borderRadius: '0',
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            marginBottom: '4rem',
            overflow: 'hidden',
            borderTop: '1px solid rgba(0,0,0,0.03)',
            borderBottom: '1px solid rgba(0,0,0,0.03)'
          }}
        >
           {/* Floating Ambient Blobs for Blur visibility */}
           <div style={{ position: 'absolute', top: '10%', left: '15%', width: '300px', height: '300px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }} />
           <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }} />

           <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', padding: '0 3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                   <Activity size={22} color="#10b981" />
                 </div>
                 <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>Community Insights</h2>
              </div>
              <button onClick={() => navigate('/dashboard/activity')} className="btn-premium" style={{ border: '1px solid rgba(0,0,0,0.05)', background: '#fff', color: '#0F172A', fontWeight: 700, padding: '12px 28px', borderRadius: '999px', fontSize: '0.95rem', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                 Explore Feed
              </button>
           </div>

           {/* MARQUEE CONTAINER */}
           <div 
             className="hide-scroll"
             style={{ 
               overflowX: 'auto', 
               paddingBottom: '1rem',
               position: 'relative',
               zIndex: 1
             }}
           >
             <motion.div 
               animate={{ x: [0, -1500] }}
               transition={{ 
                 duration: 35, 
                 repeat: Infinity, 
                 ease: "linear",
                 repeatType: "loop"
               }}
               whileHover={{ animationPlayState: 'paused' }}
               style={{ display: 'flex', gap: '2.5rem', width: 'fit-content', padding: '0 3rem' }}
             >
                {[...feed, ...feed, ...feed].map((post, i) => (
                  <motion.div 
                     key={i}
                     whileHover={{ y: -12, boxShadow: '0 30px 60px rgba(0,0,0,0.1)', transition: { duration: 0.4 } }}
                     onClick={() => navigate('/dashboard/activity')}
                     className="luxury-card btn-premium"
                     style={{ 
                       background: 'rgba(255, 255, 255, 0.45)', 
                       backdropFilter: 'blur(40px)',
                       WebkitBackdropFilter: 'blur(40px)',
                       padding: '2.75rem', 
                       borderRadius: '40px', 
                       border: '1px solid rgba(255, 255, 255, 0.6)', 
                       boxShadow: '0 15px 45px rgba(15, 23, 42, 0.05)', 
                       cursor: 'pointer', 
                       position: 'relative', 
                       overflow: 'hidden',
                       width: '480px',
                       flexShrink: 0
                     }}
                  >
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                        <img src={post.author.avatar} style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.8)' }} alt="" />
                        <div>
                           <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>{post.author.name}</h4>
                           <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>{post.author.title}</p>
                        </div>
                     </div>
                     <p style={{ color: '#334155', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '2.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: 500 }}>
                        {post.content}
                     </p>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1.75rem', color: '#94A3B8', fontSize: '0.95rem', fontWeight: 700 }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><ThumbsUp size={18} /> {post.likes}</span>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><MessageSquare size={18} /> {post.comments}</span>
                        </div>
                        <span style={{ color: '#3B82F6', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          View Insight <ChevronRight size={18} />
                        </span>
                     </div>
                     {post.isOfficial && (
                       <div style={{ position: 'absolute', top: '1.75rem', right: '1.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px 16px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                          OFFICIAL
                       </div>
                     )}
                  </motion.div>
                ))}
             </motion.div>
           </div>
        </motion.section>

        {/* 3. ADVANCED LEARNING */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                  <Award size={22} color="#3b82f6" />
                </div>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>Advanced Learning</h2>
              </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {courses.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '1rem' }}>Curating elite masterclasses...</p>
              ) : courses.slice(0, 3).map((course, i) => (
                  <motion.div key={course.id || i} variants={itemVariants} className="luxury-card btn-premium" style={{ cursor: 'pointer' }} onClick={() => navigate(`/learning/course/${course.id}`)}>
                    <div style={{ height: '140px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 21, 35, 0.8))', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={48} color="white" style={{ opacity: 0.1 }} />
                      </div>
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '999px', color: 'white', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {course.level || 'Mastery'}
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>{course.title}</h4>
                        <p style={{ margin: '0 0 1.2rem', fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.2rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} color="#3b82f6" /> {course.duration || 'Flexible'}</span>
                          <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>Start <ArrowRight size={14} /></span>
                        </div>
                    </div>
                  </motion.div>
              ))}
          </div>
        </motion.section>



      {/* MODAL OVERLAY FOR JOBS */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(5, 10, 25, 0.8)', backdropFilter: 'blur(20px)' }}
            onClick={() => setSelectedJob(null)}
          >
            <motion.div 
              style={{ width: '100%', maxWidth: '1200px', height: '80vh', background: '#0F1523', borderRadius: '32px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedJob.backgroundImage || architectBg} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, mixBlendMode: 'luminosity' }} alt="" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 21, 35, 1) 40%, transparent 100%)' }} />
              
              <div style={{ position: 'relative', zIndex: 10, padding: '4rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <motion.button 
                  whileHover={{ scale: 1.1, background: '#ef4444', borderColor: '#ef4444' }}
                  style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.05)', color: '#0F172A', border: '1px solid rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}
                  onClick={() => setSelectedJob(null)}
                >
                  <X size={20} />
                </motion.button>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                   <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 20px', borderRadius: '99px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>Elite Network</span>
                </div>
                
                <h2 style={{ fontSize: '4rem', fontWeight: 900, color: '#0F172A', margin: '0 0 1.5rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{selectedJob.title}</h2>
                
                <div style={{ display: 'flex', gap: '3rem', fontSize: '1.1rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '2rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Users size={20} color="#ef4444" /> {selectedJob.company}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><MapPin size={20} color="#ef4444" /> {selectedJob.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Briefcase size={20} color="#ef4444" /> Leadership Track</span>
                </div>
                
                <p style={{ fontSize: '1.2rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '800px', fontWeight: 500, margin: '0 0 3rem' }}>Join NeST Digital's top-tier engineering taskforce. We are looking for visionaries to lead our next generation of distributed systems and industrial automation frameworks.</p>
                
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/jobs/${selectedJob.id}`)} style={{ background: '#ef4444', color: '#0F172A', border: 'none', padding: '1.2rem 3rem', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)' }}>Apply for Opportunity</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedJob(null)} style={{ background: 'rgba(255,255,255,0.05)', color: '#0F172A', border: '1px solid rgba(255,255,255,0.2)', padding: '1.2rem 2rem', borderRadius: '16px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>Close Detail</motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  </div>
);
};

export default Dashboard;
