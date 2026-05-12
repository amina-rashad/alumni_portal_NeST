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
import { getUser, coursesApi, jobsApi, eventsApi, type AuthUser, studentAPI, socialApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Premium Job Backgrounds
import architectBg from '../assets/jobs/software_architect.png';
import aiBg from '../assets/jobs/ai_engineer.png';
import cyberBg from '../assets/jobs/cybersecurity.png';
import designerBg from '../assets/jobs/designer.png';
import devopsBg from '../assets/jobs/devops_sre.png';
import dataEngineerBg from '../assets/jobs/data_engineer.png';
import bannerImg from '../assets/dashboard_banner.png';
import alumniStoriesBg from '../assets/alumni_stories_bg.png';

// --- MOCK DATA ---
const dummyJobs = [
  { id: 'd1', title: 'Principal Software Architect', company: 'NeST Digital', location: 'Trivandrum, KL', salary: '₹35L - ₹50L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Full-time', tags: ['Engineering', 'Leadership'], backgroundImage: architectBg },
  { id: 'd2', title: 'Senior AI Research Engineer', company: 'NeST AI Labs', location: 'Kochi, KL', salary: '₹30L - ₹45L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Hybrid', tags: ['AI/ML', 'Research'], backgroundImage: aiBg },
  { id: 'd3', title: 'Infrastructure Security Lead', company: 'NeST CyberSec', location: 'Bangalore, KA', salary: '₹32L - ₹48L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Full-time', tags: ['Security', 'Cloud'], backgroundImage: cyberBg },
  { id: 'd4', title: 'Product Experience Designer', company: 'NeST Digital', location: 'Remote', salary: '₹25L - ₹38L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Remote', tags: ['UI/UX', 'Design'], backgroundImage: designerBg },
  { id: 'd5', title: 'DevOps & Site Reliability Engineer', company: 'NeST Digital', location: 'Trivandrum, KL', salary: '₹28L - ₹42L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Full-time', tags: ['DevOps', 'Cloud'], backgroundImage: devopsBg },
  { id: 'd6', title: 'Data Platform Engineer', company: 'NeST DataOps', location: 'Chennai, TN', salary: '₹26L - ₹40L', logo: 'https://nestdigital.io/wp-content/uploads/2022/04/nest-digital-logo.png', type: 'Hybrid', tags: ['Big Data', 'Analytics'], backgroundImage: dataEngineerBg }
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

const dummyEvents = [
  { id: 'd1', title: '.Net Development Workshop', date: 'Apr 29', time: '10:30 AM IST', attendees_count: 24, color: '#0F172A', category: 'Workshop' },
  { id: 'd2', title: 'Career Fair: NeST Job Connect', date: 'Sep 20', time: '10:00 AM IST', attendees_count: 156, color: '#3B82F6', category: 'Career Fair' },
  { id: 'd3', title: 'Annual Alumni Tech Summit 2026', date: 'Oct 15', time: '09:00 AM IST', attendees_count: 450, color: '#10B981', category: 'Summit' },
  { id: 'd4', title: 'AI & Machine Learning Masterclass', date: 'Nov 02', time: '01:00 PM IST', attendees_count: 128, color: '#F59E0B', category: 'Masterclass' }
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
  const [events, setEvents] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [feedPosts, setFeedPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await socialApi.getFeed(1, 5);
        if (res.success && res.data) {
          setFeedPosts((res.data as any).posts || []);
        }
      } catch (err) {
        console.error('Dashboard Feed Error:', err);
      }
    };
    fetchFeed();
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [pathways, setPathways] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [isLoadingExtras, setIsLoadingExtras] = useState(true);

  useEffect(() => {
    // Load the authenticated user from local storage
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) {
      setUserData(currentUser);
    }

    // Fetch all dashboard data
    const fetchAllData = async () => {
      try {
        const [courseRes, jobRes, eventRes, insightRes, pathwayRes, queryRes] = await Promise.all([
          coursesApi.getAllCourses(),
          jobsApi.getAllJobs(),
          eventsApi.getAllEvents(1, 4),
          studentAPI.fetchPersonalInsights(),
          studentAPI.fetchRecommendedPathways(),
          studentAPI.fetchMyQueries()
        ]);

        if (courseRes.success) setCourses(courseRes.data.courses);
        if (jobRes.success) setJobs(jobRes.data.jobs);

        if (eventRes.success && eventRes.data && (eventRes.data as any).events) {
          const rawEvents = (eventRes.data as any).events;
          const liveEvents = rawEvents
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort chronological
            .map((e: any, idx: number) => {
              // Add theme colors if not present
              const colors = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

              // Format date if it's ISO or YYYY-MM-DD
              let displayDate = e.date;
              if (e.date && (e.date.includes('-') || e.date.includes('/'))) {
                try {
                  const dateObj = new Date(e.date);
                  if (!isNaN(dateObj.getTime())) {
                    displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }
                } catch (err) {
                  displayDate = e.date;
                }
              }

              return {
                ...e,
                date: displayDate,
                color: colors[idx % colors.length],
                attendees_count: e.attendees?.length || 0,
                location: e.location || 'Remote',
                category: e.category || 'Event'
              };
            });
          setEvents(liveEvents);
        } else {
          setEvents([]);
        }

        if (insightRes.success) setInsights(insightRes.data);
        if (pathwayRes.success) setPathways(pathwayRes.data);
        if (queryRes.success) setQueries(queryRes.data);
      } catch (err) {
        console.error("Dashboard data load error", err);
        setEvents([]);
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
          setJobs([]);
        } else {
          setJobs(filteredJobs);
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
        setJobs([]);
      }
    };
    fetchJobs();
    fetchAllData();
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
              </div>
              <h1 style={{ fontSize: '4.8rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                Welcome back,<br />
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
                We invest in your <br />professional growth
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
                United by Diversity, <br />Shaping a Better Future.
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
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* FEATURED NETWORK EVENTS */}
          <motion.section
            className="glowing-event-section"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            style={{ 
              marginBottom: '2rem',
              background: '#0d2046',
              padding: '4rem 0',
              borderRadius: '0',
              position: 'relative',
              width: '100vw',
              marginLeft: 'calc(-50vw + 50%)',
              marginRight: 'calc(-50vw + 50%)',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(13, 32, 70, 0.2)'
            }}
          >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
              {/* Header inside the dark section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <div style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', display: 'flex', color: '#fff' }}>
                  <Calendar size={22} />
                </div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '2.4rem', 
                  fontWeight: 400, 
                  color: '#FFFFFF', 
                  letterSpacing: '0.02em',
                  fontFamily: '"Outfit", "Inter", sans-serif' 
                }}>
                  Featured Network Events
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                {events.length > 0 ? (
                  events.slice(0, 4).map((event, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      onClick={() => navigate(event.id ? `/events/${event.id}` : '/events')}
                      className="premium-border-card"
                      style={{
                        borderRadius: '28px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      {/* Inner Content Container to allow border visibility */}
                      <div className="premium-card-inner" style={{
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        width: '100%',
                        borderRadius: '26px',
                        background: '#ffffff',
                        position: 'relative',
                        zIndex: 2
                      }}>
                        {/* Image Header with Badge and Tag */}
                        <div style={{ height: '180px', position: 'relative', borderRadius: '20px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                          <img 
                            src={event.cover_image || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&auto=format&fit=crop&q=60'} 
                            alt={event.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          
                          {/* Date Badge */}
                          <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#fff', borderRadius: '12px', padding: '6px 12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '9px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase' }}>{event.date?.split(' ')[0] || 'TBD'}</div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>{event.date?.split(' ')[1] || ''}</div>
                          </div>

                          {/* Network Tag */}
                          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 800, color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                            Network Only
                          </div>
                        </div>

                        {/* Content */}
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0d2046', margin: '0 0 1rem 0', lineHeight: 1.3, height: '3.2rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {event.title}
                          </h3>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Clock size={14} color="#94a3b8" /> {event.time || 'TBD'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Users size={14} color="#94a3b8" /> {event.attendees_count || 0}+ Joined
                            </div>
                          </div>

                          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex' }}>
                              {[1, 2, 3].map(n => <img key={n} src={`https://i.pravatar.cc/150?img=${n + 20}`} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #ffffff', marginLeft: n !== 1 ? '-10px' : 0 }} alt="u" />)}
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', border: '2px solid #ffffff', marginLeft: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#3B82F6' }}>+12</div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/events');
                              }}
                              style={{ 
                                padding: '8px 18px', 
                                borderRadius: '12px', 
                                background: '#ef4444', 
                                border: 'none', 
                                color: '#fff', 
                                fontWeight: 800, 
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                              }}
                            >
                              Secure Spot
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))

                ) : !isLoadingExtras ? (
                  <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.1)' }}>
                    <Calendar size={48} color="#fff" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>No Upcoming Events</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, maxWidth: '300px', margin: '0 auto' }}>Stay tuned! New network events will appear here soon.</p>
                  </div>
                ) : (
                  <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '4rem' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          <style>{`
            @keyframes border-flow {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }

            .glowing-event-section::before {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 150vw;
              height: 150vw;
              background: conic-gradient(
                from 0deg,
                transparent 0%,
                rgba(59, 130, 246, 0.15) 15%,
                rgba(239, 68, 68, 0.15) 30%,
                rgba(245, 158, 11, 0.15) 45%,
                transparent 60%,
                transparent 100%
              );
              animation: border-flow 12s linear infinite;
              z-index: 0;
              filter: blur(120px);
              opacity: 0.8;
            }

            .glowing-event-section::after {
              content: '';
              position: absolute;
              inset: 0;
              background: radial-gradient(circle at center, rgba(13, 32, 70, 0.8) 0%, #050b18 100%);
              z-index: 1;
            }

            /* Premium Infinite Border Flow for Cards */
            .premium-border-card {
              position: relative;
              background: transparent !important;
              padding: 1.5px !important; /* Slightly thinner for more elegance */
              z-index: 1;
              transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              overflow: hidden;
            }

            .premium-border-card::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: conic-gradient(
                from 0deg,
                transparent 0deg,
                transparent 80deg,
                #3b82f6 100deg,
                #60a5fa 120deg,
                #3b82f6 140deg,
                transparent 160deg,
                transparent 360deg
              );
              animation: border-rotate 4s linear infinite;
              z-index: -1;
              filter: blur(4px);
            }

            /* Second light for gaming hardware feel */
            .premium-border-card::after {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: conic-gradient(
                from 180deg,
                transparent 0deg,
                transparent 80deg,
                #ef4444 100deg,
                #f59e0b 120deg,
                #ef4444 140deg,
                transparent 160deg,
                transparent 360deg
              );
              animation: border-rotate 4s linear infinite;
              z-index: -1;
              opacity: 0.7;
              filter: blur(4px);
            }

            @keyframes border-rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            .premium-card-inner {
              transition: all 0.3s ease;
            }

            .premium-border-card:hover .premium-card-inner {
              background: #fafafa !important;
              transform: scale(0.995);
            }

            .premium-border-card.dark:hover .premium-card-inner {
              background: #111827 !important;
            }
          `}</style>



          {/* REST OF SECTIONS (Jobs, Courses) */}
          {/* 1. RECOMMENDED JOBS */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            style={{ marginBottom: '0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                  <Briefcase size={22} color="#ef4444" />
                </div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '2rem', 
                  fontWeight: 400, 
                  color: '#0F172A', 
                  letterSpacing: '0.02em',
                  fontFamily: '"Outfit", "Inter", sans-serif' 
                }}>
                  Job Recommendations
                </h2>
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
                  className="premium-border-card dark"
                  style={{
                    height: '230px',
                    cursor: 'pointer',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div className="premium-card-inner" style={{
                    height: '100%',
                    width: '100%',
                    padding: '1.5rem',
                    background: '#0F172A',
                    borderRadius: '22px',
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
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
                </div>
              </motion.div>
              ))}
            </div>
          </motion.section>

          {/* 2. COMMUNITY INSIGHTS PRE */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            style={{
              position: 'relative',
              padding: '4rem 0',
              background: '#ffffff',
              marginBottom: '2rem'
            }}
          >
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '16px', display: 'flex', color: '#0d2046' }}>
                    <Activity size={24} />
                  </div>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: '2.4rem', 
                    fontWeight: 400, 
                    color: '#0d2046', 
                    letterSpacing: '0.02em',
                    fontFamily: '"Outfit", "Inter", sans-serif' 
                  }}>
                    Community Insights
                  </h2>
                </div>
                <button onClick={() => navigate('/dashboard/activity')} style={{ border: '1px solid #e2e8f0', background: '#ffffff', color: '#0d2046', fontWeight: 800, padding: '12px 32px', borderRadius: '999px', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                  Explore Feed
                </button>
              </div>

              {/* HORIZONTAL CARDS CONTAINER */}
              <div
                className="hide-scroll"
                style={{
                  display: 'flex',
                  gap: '2.5rem',
                  overflowX: 'auto',
                  paddingBottom: '2rem'
                }}
              >
                {feedPosts.length > 0 ? feedPosts.map((post, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10, transition: { duration: 0.4 } }}
                    onClick={() => navigate('/dashboard/activity')}
                    style={{
                      background: '#0d2046',
                      padding: '1.5rem',
                      borderRadius: '40px',
                      cursor: 'pointer',
                      position: 'relative',
                      minWidth: '400px',
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem'
                    }}
                  >
                    {/* Top Image Container */}
                    <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', height: '180px' }}>
                      <img 
                        src={post.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        alt="" 
                      />
                      {post.author_type === 'Admin' && (
                        <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#fff', color: '#ef4444', padding: '6px 16px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          OFFICIAL
                        </div>
                      )}
                    </div>

                    {/* Author Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={post.author_picture || `https://ui-avatars.com/api/?name=${post.author_name}&background=random`}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }}
                        alt=""
                      />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>{post.author_name}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{post.author_role || 'Network Contributor'}</p>
                      </div>
                    </div>

                    {/* Overview Section */}
                    <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                      <div style={{ width: '2px', background: '#3b82f6', borderRadius: '4px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OVERVIEW</span>
                        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {post.content}
                        </p>
                      </div>
                    </div>

                    {/* Footer Stats */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.9rem', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ThumbsUp size={16} /> {post.likes_count}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={16} /> {post.comments_count}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/dashboard/activity');
                        }}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}
                      >
                        Read More <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )) : (
                  <div style={{ color: '#64748b', padding: '4rem', textAlign: 'center', width: '100%', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>No insights shared yet. Be the first!</div>
                )}
              </div>
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
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '2rem', 
                  fontWeight: 400, 
                  color: '#0F172A', 
                  letterSpacing: '0.02em',
                  fontFamily: '"Outfit", "Inter", sans-serif' 
                }}>
                  Advanced Learning
                </h2>
              </div>
              <button onClick={() => navigate('/learning')} className="btn-premium" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#0F172A', fontWeight: 700, padding: '10px 24px', borderRadius: '999px', fontSize: '0.95rem' }}>
                Browse All
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {[
                {
                  id: 'c1',
                  title: 'React & Next.js Masterclass',
                  desc: 'Build production-grade applications with server components, streaming SSR, and advanced patterns.',
                  image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
                  level: 'Advanced',
                  duration: '12 Weeks',
                  rating: 4.9,
                  students: 2840,
                  progress: 65,
                  color: '#3B82F6',
                  instructor: 'Dr. Sarah Chen'
                },
                {
                  id: 'c2',
                  title: 'AI & Deep Learning with Python',
                  desc: 'Master neural networks, transformers, and generative AI using PyTorch and TensorFlow.',
                  image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
                  level: 'Expert',
                  duration: '16 Weeks',
                  rating: 4.8,
                  students: 3560,
                  progress: 0,
                  color: '#8B5CF6',
                  instructor: 'Prof. James Liu'
                },
                {
                  id: 'c3',
                  title: 'Cloud Architecture on AWS',
                  desc: 'Design resilient, scalable cloud infrastructure with hands-on labs and real-world case studies.',
                  image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
                  level: 'Intermediate',
                  duration: '10 Weeks',
                  rating: 4.7,
                  students: 1920,
                  progress: 30,
                  color: '#F59E0B',
                  instructor: 'Ananya Patel'
                },
                {
                  id: 'c4',
                  title: 'Cybersecurity & Ethical Hacking',
                  desc: 'Learn penetration testing, threat modeling, and zero-trust security frameworks from industry experts.',
                  image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
                  level: 'Advanced',
                  duration: '14 Weeks',
                  rating: 4.9,
                  students: 2150,
                  progress: 0,
                  color: '#10B981',
                  instructor: 'Marcus Rivera'
                }
              ].map((course, i) => (
                <motion.div
                  key={course.id}
                  variants={itemVariants}
                  whileHover={{
                    rotateY: 4,
                    rotateX: -2,
                    scale: 1.02,
                    boxShadow: '8px 16px 40px rgba(0,0,0,0.15), -2px -2px 20px rgba(255,255,255,0.5)',
                    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
                  }}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.04)',
                    perspective: '800px',
                    transformStyle: 'preserve-3d',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => navigate(`/learning/course/${course.id}`)}
                >
                  {/* Image Header */}
                  <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={course.image}
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.1) 50%, transparent 100%)' }} />

                    {/* Level Badge */}
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                      padding: '5px 14px', borderRadius: '99px',
                      color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      {course.level}
                    </div>

                    {/* Rating overlay */}
                    <div style={{
                      position: 'absolute', bottom: '12px', left: '14px',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={12} fill={s <= Math.floor(course.rating) ? '#FBBF24' : 'transparent'} color="#FBBF24" />
                        ))}
                      </div>
                      <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>{course.rating}</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600 }}>({course.students.toLocaleString()})</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                      {course.title}
                    </h4>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                      {course.desc}
                    </p>

                    {/* Instructor */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `linear-gradient(135deg, ${course.color}, ${course.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 900 }}>
                        {course.instructor.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>{course.instructor}</span>
                    </div>

                    {/* Progress Bar (if enrolled) */}
                    {course.progress > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>Progress</span>
                          <span style={{ fontSize: '0.7rem', color: course.color, fontWeight: 800 }}>{course.progress}%</span>
                        </div>
                        <div style={{ height: '4px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${course.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.1 }}
                            style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${course.color}, ${course.color}CC)` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color={course.color} /> {course.duration}
                      </span>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 800, color: '#fff',
                        background: course.progress > 0 ? course.color : '#0F172A',
                        padding: '6px 16px', borderRadius: '99px',
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}>
                        {course.progress > 0 ? 'Continue' : 'Enroll'} <ArrowRight size={12} />
                      </span>
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
