import React, { useEffect, useState } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Calendar, Users, Star,
  Activity, Image as ImageIcon, MapPin,
  Clock, ThumbsUp, Share2,
  Award, ChevronRight, ChevronLeft,
  MoreHorizontal, FileText, ArrowRight,
  BrainCircuit, BookOpen, Heart, ShieldCheck, Sparkles, X, Play, CheckCircle2
} from 'lucide-react';
import { getUser, coursesApi, jobsApi, eventsApi, type AuthUser, studentAPI, socialApi, isDirectApplicant } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { formatDateOnly, formatTimeAgo } from '../utils/dateUtils';

// Premium Job Backgrounds
import architectBg from '../assets/jobs/software_architect.png';
import aiBg from '../assets/jobs/ai_engineer.png';
import cyberBg from '../assets/jobs/cybersecurity.png';
import designerBg from '../assets/jobs/designer.png';
import devopsBg from '../assets/jobs/devops_sre.png';
import dataEngineerBg from '../assets/jobs/data_engineer.png';
import bannerImg from '../assets/dashboard_banner.png';
import alumniStoriesBg from '../assets/alumni_stories_bg.png';



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
  const effectiveUser = user || (getUser() as unknown as AuthUser);
  const isDirect = isDirectApplicant(effectiveUser);
  const [courses, setCourses] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null);
  const [feedPosts, setFeedPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await socialApi.getFeed(1, 10, isDirect ? true : undefined);
        if (res.success && res.data) {
          const rawPosts = (res.data as any).posts || [];
          const filtered = isDirect
            ? rawPosts.filter((p: any) => {
                const role = String(p.author_role || '').toLowerCase();
                const type = String(p.author_type || '').toLowerCase();
                return p.is_official === true || 
                  ['admin', 'super_admin', 'recruiter', 'job_recruiter'].includes(role) || 
                  ['staff', 'admin', 'recruiter'].includes(type);
              })
            : rawPosts;
          setFeedPosts(filtered);
        }
      } catch (err) {
        console.error('Dashboard Feed Error:', err);
      }
    };
    fetchFeed();
  }, [isDirect]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (feedPosts.length === 0 || isCarouselPaused) return;
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % feedPosts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [feedPosts.length, isCarouselPaused]);
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
          eventsApi.getAllEvents(1, 4, true),
          studentAPI.fetchPersonalInsights(),
          studentAPI.fetchRecommendedPathways(),
          studentAPI.fetchMyQueries()
        ]);

        if (courseRes.success && courseRes.data?.courses) {
          setCourses(courseRes.data.courses);
        } else {
          setCourses([]);
        }

        if (jobRes.success && jobRes.data?.jobs) {
          setJobs(jobRes.data.jobs.filter((j: any) => j.is_active !== false));
        } else {
          setJobs([]);
        }

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
                displayDate = formatDateOnly(e.date, e.date);
              }

              return {
                ...e,
                date: displayDate,
                color: colors[idx % colors.length],
                attendees_count: e.attendees_count || 0,
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
        setCourses([]);
        setJobs([]);
      } finally {
        setIsLoadingExtras(false);
      }
    };

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
          minHeight: '440px',
          boxShadow: 'none',
          borderBottom: 'none',
          width: '100%',
          marginBottom: '0'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex' }}>
            <div style={{ padding: '4rem 2rem', flex: '1.1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 800, color: '#334155', letterSpacing: '0.12em', fontSize: '0.8rem', textTransform: 'uppercase' }}>Dashboard Overview</span>
              </div>
              <h1 style={{ fontSize: '3.8rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1, marginBottom: '1.2rem', letterSpacing: '-0.02em' }}>
                Welcome,<br />
                <span style={{ color: '#EF4444' }}>{user ? user.full_name.split(' ')[0] : 'Amina'}</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#64748B', lineHeight: 1.6, maxWidth: '480px', fontWeight: 500, margin: 0 }}>
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
                      src="/placeholder.jpg"
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
          {!isDirect && (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div 
                  onClick={() => navigate('/events')}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                >
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
                <button 
                  onClick={() => navigate('/events')} 
                  className="btn-premium" 
                  style={{ 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    background: 'rgba(255,255,255,0.08)', 
                    color: '#FFFFFF', 
                    fontWeight: 700, 
                    padding: '10px 24px', 
                    borderRadius: '999px', 
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Browse All
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                {events.length > 0 ? (
                  events.slice(0, 4).map((event, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      onClick={() => navigate('/events')}
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
                            src={event.cover_image || '/placeholder.jpg'} 
                            alt={event.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          
                          {/* Date Badge */}
                          <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#fff', borderRadius: '12px', padding: '6px 12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '9px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase' }}>{event.date?.split(' ')[0] || 'TBD'}</div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>{event.date?.split(' ')[1] || ''}</div>
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
                          </div>

                          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {event.is_registered ? (
                              <div style={{ 
                                padding: '8px 18px', 
                                borderRadius: '12px', 
                                background: '#10b981', 
                                color: '#fff', 
                                fontWeight: 800, 
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
                              }}>
                                <CheckCircle2 size={16} /> Registered
                              </div>
                            ) : (event.is_active === false || event.is_over || (event.max_attendees > 0 && event.attendees_count >= event.max_attendees)) ? (
                              <div style={{ 
                                padding: '8px 18px', 
                                borderRadius: '12px', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#ef4444', 
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                fontWeight: 800, 
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                Inactive
                              </div>
                            ) : (
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
                            )}
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
          )}

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
              <div 
                onClick={() => navigate('/jobs')}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
              >
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
              <button onClick={() => navigate('/jobs')} className="btn-premium" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#0F172A', fontWeight: 700, padding: '10px 24px', borderRadius: '999px', fontSize: '0.95rem', cursor: 'pointer' }}>
                Explore All
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {jobs.length > 0 ? (
                jobs.slice(0, 6).map((job, i) => (
                  <motion.div
                    key={job.id || job._id || i}
                    variants={itemVariants}
                    whileHover="hover"
                    onClick={() => navigate(`/jobs/${job.id || job._id}`)}
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
                          {job.type || 'Full-time'}
                        </span>
                      </div>

                      <div style={{ position: 'relative', zIndex: 4 }}>
                        <h4 style={{ margin: '0 0 0.6rem', fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{job.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={16} color="#ef4444" /> {job.company || 'NeST Digital'}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} color="#ef4444" /> {job.location || 'Remote'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '3.5rem', background: '#0F172A', borderRadius: '24px', border: '2px dashed rgba(255,255,255,0.1)' }}>
                  <Briefcase size={44} color="#94a3b8" style={{ marginBottom: '1rem', opacity: 0.6 }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>No Active Job Openings</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, maxWidth: '340px', margin: '0 auto', fontSize: '0.9rem' }}>New opportunities posted by recruiters will appear live here.</p>
                </div>
              )}
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
                {!isDirect && (
                  <button onClick={() => navigate('/dashboard/activity')} style={{ border: '1px solid #e2e8f0', background: '#ffffff', color: '#0d2046', fontWeight: 800, padding: '12px 32px', borderRadius: '999px', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    Career Timelines
                  </button>
                )}
              </div>

              {/* HORIZONTAL CARDS CONTAINER */}
              <div
                className="hide-scroll"
                style={{
                  width: '100%',
                  overflow: 'hidden',
                  paddingBottom: '2rem'
                }}
              >
                {feedPosts.length > 0 ? (
                  <motion.div
                    animate={{ x: `-${insightIndex * (400 + 40)}px` }}
                    transition={{
                      duration: 0.8,
                      ease: [0.32, 0.72, 0, 1], // Premium smooth transition
                    }}
                    style={{
                      display: 'flex',
                      gap: '2.5rem',
                      width: 'fit-content',
                    }}
                  >
                    {feedPosts.map((post, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -10, transition: { duration: 0.4 } }}
                        onClick={() => {
                          if (isDirect) {
                            setSelectedInsight(post);
                          } else {
                            navigate('/dashboard/activity');
                          }
                        }}
                        onMouseEnter={() => setIsCarouselPaused(true)}
                        onMouseLeave={() => setIsCarouselPaused(false)}
                        style={{
                          background: '#0d2046',
                          padding: '1.5rem',
                          borderRadius: '40px',
                          cursor: 'pointer',
                          position: 'relative',
                          width: '400px',
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.5rem'
                        }}
                      >
                        {/* Top Image Container */}
                        <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', height: '180px' }}>
                          <img 
                            src={post.image_url || '/placeholder.jpg'} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            alt="" 
                          />
                          {(post.author_type === 'Admin' || post.author_role === 'Admin' || post.author_role === 'Recruiter' || post.is_official) && (
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
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isDirect) {
                                setSelectedInsight(post);
                              } else {
                                navigate('/dashboard/activity');
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}
                          >
                            Read More <ChevronRight size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div style={{ color: '#64748b', padding: '4rem', textAlign: 'center', width: '100%', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>No insights shared yet. Be the first!</div>
                )}
              </div>

              {/* Indicators */}
              {feedPosts.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}>
                  {feedPosts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInsightIndex(idx)}
                      style={{
                        width: insightIndex === idx ? '24px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        background: insightIndex === idx ? '#3b82f6' : '#e2e8f0',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
                        padding: 0
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          {/* 3. ADVANCED LEARNING */}
          {!isDirect && (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div 
                onClick={() => navigate('/courses')}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
              >
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
              <button onClick={() => navigate('/courses')} className="btn-premium" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#0F172A', fontWeight: 700, padding: '10px 24px', borderRadius: '999px', fontSize: '0.95rem', cursor: 'pointer' }}>
                Browse All
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {courses.length > 0 ? (
                courses.slice(0, 4).map((course, i) => {
                  const courseId = course.id || course._id;
                  const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'];
                  const color = colors[i % colors.length];
                  return (
                    <motion.div
                      key={courseId || i}
                      variants={itemVariants}
                      whileHover={{
                        y: -10,
                        scale: 1.02,
                        boxShadow: '0px 16px 32px rgba(15, 23, 42, 0.08)',
                        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
                      }}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.015), 0px 4px 8px rgba(15, 23, 42, 0.02), 0px 8px 16px rgba(15, 23, 42, 0.025), 0px 16px 24px rgba(15, 23, 42, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
                      }}
                      onClick={() => navigate(courseId ? `/courses/${courseId}` : '/courses')}
                    >
                      {/* Image Header */}
                      <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={course.thumbnail || course.image || '/placeholder.jpg'}
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
                          {course.level || 'Intermediate'}
                        </div>

                        {/* Rating overlay */}
                        <div style={{
                          position: 'absolute', bottom: '12px', left: '14px',
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={12} fill="#FBBF24" color="#FBBF24" />
                            ))}
                          </div>
                          <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>{course.rating || 4.9}</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                          {course.title}
                        </h4>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                          {course.description || course.desc || 'Explore practical modular curricula and domain mastery.'}
                        </p>

                        {/* Instructor */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 900 }}>
                            {(course.instructor || 'NeST Expert').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>{course.instructor || 'NeST Expert'}</span>
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={13} color={color} /> {course.duration || 'Flexible'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(courseId ? `/courses/${courseId}` : '/courses');
                            }}
                            style={{
                              fontSize: '0.75rem', fontWeight: 800, color: '#fff',
                              background: '#0F172A',
                              padding: '6px 16px', borderRadius: '99px',
                              display: 'flex', alignItems: 'center', gap: '5px',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Explore <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '3.5rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                  <Award size={44} color="#94a3b8" style={{ marginBottom: '1rem', opacity: 0.6 }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>No Courses Available</h3>
                  <p style={{ color: '#64748b', fontWeight: 600, maxWidth: '340px', margin: '0 auto', fontSize: '0.9rem' }}>Curriculum and tracks created by Course Managers will appear live here.</p>
                </div>
              )}
            </div>
          </motion.section>
          )}





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

          {/* Direct Applicant Insight Full View Modal */}
          <AnimatePresence>
            {selectedInsight && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 9999,
                  background: 'rgba(5, 13, 30, 0.7)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem'
                }}
                onClick={() => setSelectedInsight(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, y: 20, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  style={{
                    background: '#ffffff',
                    width: '100%',
                    maxWidth: '640px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                    position: 'relative',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedInsight(null)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 20,
                      color: '#0f172a'
                    }}
                  >
                    <X size={18} />
                  </button>

                  {/* Header Image if available */}
                  {selectedInsight.image_url && (
                    <div style={{ height: '220px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={selectedInsight.image_url}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {(selectedInsight.is_official || selectedInsight.author_role === 'Admin' || selectedInsight.author_role === 'Recruiter' || selectedInsight.author_type === 'Admin') && (
                        <span style={{ position: 'absolute', bottom: '16px', left: '20px', background: '#c8102e', color: '#ffffff', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          Official Announcement
                        </span>
                      )}
                    </div>
                  )}

                  {/* Content Body */}
                  <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
                    {/* Author Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                      <img
                        src={selectedInsight.author_picture || `https://ui-avatars.com/api/?name=${selectedInsight.author_name}&background=random`}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #e2e8f0' }}
                        alt=""
                      />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{selectedInsight.author_name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#c8102e' }}>
                            {selectedInsight.author_role || selectedInsight.author_type || 'Official'}
                          </span>
                          {selectedInsight.created_at && (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              • {formatTimeAgo(selectedInsight.created_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Post Text */}
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-line' }}>
                      {selectedInsight.content}
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                      <ThumbsUp size={16} /> {selectedInsight.likes_count || 0} Likes
                    </div>
                    <button
                      onClick={() => setSelectedInsight(null)}
                      style={{
                        padding: '8px 20px',
                        background: '#1a2652',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
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
