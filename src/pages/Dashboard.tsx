import React, { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import { 
  Briefcase, Calendar, Users, Star, 
  Activity, Image as ImageIcon, MapPin, 
  Clock, MessageSquare, ThumbsUp, Share2,
  Bookmark, Award, ChevronRight,
  MoreHorizontal, Video, FileText, ArrowRight,
  BrainCircuit, ExternalLink, PlayCircle, Trophy, BookOpen
} from 'lucide-react';
import { getUser, coursesApi, jobsApi, type AuthUser } from '../services/api';

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
    <div className="font-sans" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '3rem 1.5rem', fontFamily: '"Inter", -apple-system, sans-serif' }}>
      
      {/* GLOBAL CSS OVERRIDES */}
      <style>{`
        /* Force professional sans-serif fonts */
        .font-sans, .font-sans h1, .font-sans h2, .font-sans h3, .font-sans h4, .font-sans h5, .font-sans h6, .font-sans p, .font-sans span, .font-sans button, .font-sans input {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif !important;
          letter-spacing: -0.015em;
        }

        /* Premium Card Styling */
        .luxury-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.4s;
          overflow: hidden;
        }
        .luxury-card:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
          border-color: rgba(226, 232, 240, 1);
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
      `}</style>

      {/* 
        MAIN CENTRALISED LAYOUT (ONE BY ONE)
        A constrained width makes horizontal reading comfortable and focuses the user beautifully.
      */}
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* WELCOME BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: '-1rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <p style={{ margin: '0 0 0.25rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>Dashboard Overview</p>
            {user && <span style={{ padding: '2px 8px', background: '#e2e8f0', color: '#475569', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>{user.user_type}</span>}
          </div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
            Welcome back{user ? `, ${user.full_name.split(' ')[0]}` : ''}.
          </h1>
        </motion.div>

        {/* 1. CREATION & POSTS AREA (ACTIVITY FEED OVERVIEW) */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Activity size={24} color="#0F172A" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>Activity Feed</h2>
          </div>

          <motion.div variants={itemVariants} className="luxury-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img 
                src={user?.profile_picture || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=0F172A&color=fff`} 
                alt={user?.full_name || 'You'} 
                style={{ width: '56px', height: '56px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
              />
              <button 
                className="btn-premium"
                style={{ flex: 1, textAlign: 'left', background: '#F1F5F9', border: '1px solid transparent', padding: '1.25rem 1.5rem', borderRadius: '999px', color: '#64748B', fontWeight: 500, fontSize: '1rem' }}
              >
                Share an update, milestone, or ask a question...
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-premium btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 600 }}>
                <ImageIcon size={18} color="#3B82F6" /> Add Media
              </button>
              <button className="btn-premium btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 600 }}>
                <Calendar size={18} color="#10B981" /> Host Event
              </button>
              <button className="btn-premium btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 600 }}>
                <FileText size={18} color="#F59E0B" /> Write Article
              </button>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {feed.map((post) => (
              <motion.div key={post.id} variants={itemVariants} className="luxury-card">
                <div style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={post.author.avatar} alt={post.author.name} style={{ width: '56px', height: '56px', borderRadius: post.isOfficial ? '12px' : '50%', border: '1px solid #E2E8F0' }} />
                      <div>
                        <h4 className="link-hover" style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {post.author.name}
                          {post.isOfficial && <span style={{ background: '#0F172A', color: 'white', padding: '2px 8px', borderRadius: '999px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official</span>}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{post.author.title}</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {post.time}</p>
                      </div>
                    </div>
                    <button className="btn-premium btn-outline" style={{ padding: '8px', borderRadius: '50%', display: 'flex' }}><MoreHorizontal size={20} color="#64748B" /></button>
                  </div>
                  
                  <p style={{ margin: '0 0 1.5rem', color: '#334155', lineHeight: 1.7, fontSize: '1.05rem' }}>{post.content}</p>
                </div>
                
                {post.image && (
                  <div style={{ borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                    <img src={post.image} alt="Post Attachment" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
                
                <div style={{ padding: '1rem 2rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex' }}>
                        <div style={{ background: '#2563EB', borderRadius: '50%', padding: '4px', border: '2px solid white', zIndex: 2 }}><ThumbsUp size={12} color="white" /></div>
                        <div style={{ background: '#0F172A', borderRadius: '50%', padding: '4px', border: '2px solid white', marginLeft: '-8px', zIndex: 1 }}><Star size={12} color="white" fill="white"/></div>
                      </div>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{post.likes}</span> interactions
                    </div>
                    <span className="link-hover" style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>{post.comments} comments</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[{ icon: ThumbsUp, label: 'Like' }, { icon: MessageSquare, label: 'Comment' }, { icon: Share2, label: 'Share' }].map((action, i) => (
                      <button key={i} className="btn-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: '#F8FAFC', border: 'none', color: '#475569', fontWeight: 600, padding: '1rem', borderRadius: '12px', fontSize: '0.95rem' }}>
                        <action.icon size={18} /> <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 2. SUGGESTION OF PEOPLE YOU MAY KNOW */}
        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={24} color="#0F172A" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>People You May Know</h2>
             </div>
             <button className="link-hover" style={{ background: 'transparent', border: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                See All <ChevronRight size={16} />
             </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
             {recommendations.map((user, i) => (
                <motion.div key={i} variants={itemVariants} className="luxury-card btn-premium" style={{ cursor: 'default', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                   <img src={user.avatar} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem', border: '4px solid #F1F5F9' }} />
                   <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>{user.name}</h4>
                   <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.4, flex: 1 }}>{user.title}</p>
                   <p style={{ margin: '0 0 1.5rem', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>{user.mutual} mutual connections</p>
                   <button className="btn-premium btn-outline" style={{ width: '100%', padding: '0.75rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 700, color: '#2563EB', borderColor: '#2563EB' }}>
                      Connect
                   </button>
                </motion.div>
             ))}
          </div>
        </motion.section>

        {/* 3. RECOMMENDED JOBS / LISTINGS OVERVIEW */}
        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Briefcase size={24} color="#0F172A" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>Recommended Jobs</h2>
             </div>
             <button className="link-hover" style={{ background: 'transparent', border: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View Job Board <ArrowRight size={16} />
             </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {jobs.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Fetching recommended jobs...</p>
            ) : jobs.map((job, i) => (
               <motion.div key={job.id || i} variants={itemVariants} className="luxury-card btn-premium" style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '12px', flexShrink: 0 }}>
                     {job.logo ? (
                       <img src={job.logo} alt={job.company} style={{ width: '48px', height: '48px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${job.company || 'C'}&background=random`; }} />
                     ) : (
                       <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '20px' }}>
                          {(job.company || job.title || 'J').charAt(0).toUpperCase()}
                       </div>
                     )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                     <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title || 'Career Opportunity'}</h4>
                     <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.company || 'Confidential Company'}</p>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12}/> {job.location || 'Remote eligible'}</span>
                        {job.salary && <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>{job.salary}</span>}
                     </div>
                  </div>
               </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. UPCOMING EVENTS OVERVIEW */}
        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
             <Calendar size={24} color="#0F172A" />
             <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>Upcoming Events</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {events.map((event, i) => (
                <motion.div key={i} variants={itemVariants} className="luxury-card btn-premium" style={{ cursor: 'pointer', display: 'flex', alignItems: 'stretch' }}>
                   <div style={{ width: '120px', background: event.color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '1.5rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{event.date.split(' ')[0]}</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{event.date.split(' ')[1]}</span>
                   </div>
                   <div style={{ padding: '2rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                         <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>{event.title}</h4>
                         <div style={{ display: 'flex', gap: '1.5rem', color: '#64748B', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> {event.time}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} /> {event.attendees} Attending</span>
                         </div>
                      </div>
                      <button className="btn-premium" style={{ background: '#0F172A', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '999px', fontSize: '0.95rem', fontWeight: 600 }}>
                         Register
                      </button>
                   </div>
                </motion.div>
             ))}
          </div>
        </motion.section>

        {/* 5. COURSES & QUIZZES (GRID SPLIT) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', marginTop: '1rem' }}>
           
           {/* Courses */}
           <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Award size={24} color="#0F172A" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>Resume Courses</h2>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {courses.length === 0 ? (
                  <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Fetching newest courses...</p>
                ) : courses.map((course, i) => (
                   <motion.div key={course.id || i} variants={itemVariants} className="luxury-card btn-premium" style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', gap: '1.5rem' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'linear-gradient(135deg, #0f172a, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                         <BookOpen size={32} opacity={0.8} />
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                           <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>{course.title}</h4>
                           <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#f1f5f9', color: '#64748B', borderRadius: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{course.level || 'Standard'}</span>
                         </div>
                         <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#64748B' }}>Instructor: <span style={{ color: '#0f172a', fontWeight: 500 }}>{course.instructor}</span></p>
                         <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                            <Clock size={14} /> {course.duration || 'Self-paced'}
                         </div>
                      </div>
                   </motion.div>
                ))}
             </div>
           </motion.section>

           {/* Quizzes */}
           <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <BrainCircuit size={24} color="#0F172A" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>Assessments & Quizzes</h2>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {quizzes.map((quiz, i) => (
                   <motion.div key={i} variants={itemVariants} className="luxury-card btn-premium" style={{ padding: '1.5rem', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                         <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', maxWidth: '70%' }}>{quiz.title}</h4>
                         <span style={{ padding: '4px 12px', background: `${quiz.color}15`, color: quiz.color, borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{quiz.difficulty}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                         <span style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={16}/> {quiz.questions} Qs
                         </span>
                         <span style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16}/> {quiz.time}
                         </span>
                         <button className="btn-premium" style={{ border: 'none', background: 'transparent', color: '#2563EB', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Start <ArrowRight size={16}/>
                         </button>
                      </div>
                   </motion.div>
                ))}
             </div>
           </motion.section>
        </div>

        <div style={{ paddingBottom: '4rem' }} />

      </div>
    </div>
  );
};

export default Dashboard;
