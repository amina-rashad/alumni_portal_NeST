import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, Pause, SkipForward, SkipBack, 
  List, MessageSquare, FileText, Settings, 
  Maximize, Volume2, CheckCircle2, Lock, 
  ChevronRight, ChevronDown, Download, Star,
  Info, Clock
} from 'lucide-react';
import { coursesApi } from '../services/api';

const CoursePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'overview' | 'resources' | 'discussion'>('content');
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      console.log("[CoursePlayer] useEffect triggered with id:", id);
      if (!id) return;

      const MOCK_DATA = [
        { id: '1', title: 'Advanced Cloud Architecture & DevOps', instructor: 'Dr. Rajesh Nair', level: 'Advanced', duration: '36 Hours' },
        { id: '2', title: 'Full Stack Development with React & Node', instructor: 'Priya Sharma', level: 'Intermediate', duration: '48 Hours' },
        { id: '3', title: 'Data Science & Machine Learning Essentials', instructor: 'Dr. Arun Menon', level: 'Beginner', duration: '30 Hours' },
        { id: '4', title: 'Cybersecurity Fundamentals & Ethical Hacking', instructor: 'Karthik Iyer', level: 'Intermediate', duration: '42 Hours' },
        { id: '5', title: 'AI-Powered Product Management', instructor: 'Sneha George', level: 'Advanced', duration: '28 Hours' },
        { id: '6', title: 'System Design & Scalable Architecture', instructor: 'Dr. Vikram Das', level: 'Advanced', duration: '40 Hours' }
      ];

      const match = MOCK_DATA.find(c => String(c.id) === String(id));
      if (match) {
        console.log("[CoursePlayer] Found mock match:", match);
        setCourse(match);
        setLoading(false);
        return;
      }

      console.log("[CoursePlayer] No mock match, calling API...");
      try {
        const res = await coursesApi.getCourseById(id);
        if (res.success && res.data && (res.data as any).course) {
          console.log("[CoursePlayer] API Success:", (res.data as any).course);
          setCourse((res.data as any).course);
        } else {
          console.log("[CoursePlayer] API returned no data");
        }
      } catch (err) {
        console.error("[CoursePlayer] API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        backgroundColor: '#0f172a',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid rgba(255,255,255,0.1)', 
          borderTop: '4px solid #c8102e', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem'
        }}></div>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.6 }}>Loading your learning experience...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: '#f8fafc', height: '100vh' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0d2046', marginBottom: '1.5rem' }}>Course not found</h2>
        <Link to="/courses/my-courses" style={{ color: '#c8102e', fontWeight: 700, textDecoration: 'none' }}>Back to My Courses</Link>
      </div>
    );
  }

  // Mock Curriculum if not provided by API
  const modules = [
    {
      title: "Module 1: Introduction & Foundations",
      lessons: [
        { id: "l1", title: "Course Overview & Learning Objectives", duration: "12:45", completed: true },
        { id: "l2", title: "Setting Up Your Development Environment", duration: "18:20", completed: true },
        { id: "l3", title: "Core Principles and Industry Standards", duration: "24:10", completed: false },
      ]
    },
    {
      title: "Module 2: Advanced Implementation",
      lessons: [
        { id: "l4", title: "Deep Dive into System Architecture", duration: "32:15", completed: false },
        { id: "l5", title: "Real-world Case Studies & Analysis", duration: "45:00", completed: false },
        { id: "l6", title: "Optimizing Performance and Scalability", duration: "28:30", completed: false },
      ]
    },
    {
      title: "Module 3: Project & Certification",
      lessons: [
        { id: "l7", title: "Final Project Overview", duration: "15:20", completed: false },
        { id: "l8", title: "Certification Exam Preparation", duration: "22:10", completed: false },
      ]
    }
  ];

  const currentModule = modules[currentModuleIdx] || modules[0];
  const currentLesson = (currentModule && currentModule.lessons) ? (currentModule.lessons[currentLessonIdx] || currentModule.lessons[0]) : { title: 'Loading...', duration: '0:00' };

  const handleLessonSelect = (modIdx: number, lesIdx: number) => {
    if (modules[modIdx] && modules[modIdx].lessons[lesIdx]) {
      setCurrentModuleIdx(modIdx);
      setCurrentLessonIdx(lesIdx);
      setIsPlaying(true);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white',
      fontFamily: '"Inter", sans-serif',
      overflow: 'hidden'
    }}>
      {/* Top Header Bar */}
      <header style={{ 
        height: '64px', 
        backgroundColor: '#1e293b', 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/courses/my-courses')}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              color: 'white', 
              padding: '0.5rem', 
              borderRadius: '0.75rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>{course.title}</h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>{currentModule.title} • {currentLesson.title}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '120px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', backgroundColor: '#c8102e', borderRadius: '3px' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>45% Complete</span>
          </div>
          <button style={{ 
            backgroundColor: '#c8102e', 
            color: 'white', 
            border: 'none', 
            padding: '0.6rem 1.25rem', 
            borderRadius: '0.75rem', 
            fontWeight: 800, 
            fontSize: '0.875rem', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Award size={16} /> Claim Certificate
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar: Course Content */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ 
                backgroundColor: '#0f172a', 
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Course Content</h2>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="custom-scrollbar">
                {modules.map((module, mIdx) => (
                  <div key={mIdx} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 800, 
                      color: '#64748b', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      marginBottom: '0.75rem',
                      padding: '0 0.5rem'
                    }}>
                      {module.title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {module.lessons.map((lesson, lIdx) => {
                        const isActive = currentModuleIdx === mIdx && currentLessonIdx === lIdx;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonSelect(mIdx, lIdx)}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'flex-start', 
                              gap: '1rem', 
                              padding: '1rem', 
                              borderRadius: '1rem', 
                              border: 'none',
                              backgroundColor: isActive ? 'rgba(200, 16, 46, 0.1)' : 'transparent',
                              color: isActive ? '#fff' : '#94a3b8',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
                            onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <div style={{ marginTop: '2px' }}>
                              {lesson.completed ? (
                                <CheckCircle2 size={18} color="#22c55e" />
                              ) : isActive ? (
                                <Play size={18} color="#c8102e" fill="#c8102e" />
                              ) : (
                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500, marginBottom: '0.25rem' }}>{lesson.title}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, opacity: 0.6 }}>
                                <Clock size={12} /> {lesson.duration}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Video Player & Tabs Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          
          {/* Toggle Sidebar Button (Overlayed) */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ 
              position: 'absolute', 
              left: 0, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              zIndex: 100,
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderLeft: 'none',
              color: 'white',
              padding: '1rem 0.5rem',
              borderRadius: '0 1rem 1rem 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '4px 0 15px rgba(0,0,0,0.2)'
            }}
          >
            {sidebarOpen ? <ArrowLeft size={16} /> : <List size={16} />}
          </button>

          {/* Video Player Section */}
          <div style={{ 
            width: '100%', 
            aspectRatio: '16/9', 
            backgroundColor: '#000', 
            position: 'relative',
            overflow: 'hidden',
            maxHeight: '65vh'
          }}>
            {/* Mock Video Placeholder */}
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
            }}>
               <motion.div 
                 animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                 transition={{ duration: 2, repeat: Infinity }}
                 style={{ color: '#c8102e', opacity: 0.8 }}
               >
                 <PlayCircleIcon size={120} />
               </motion.div>
               <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>{currentLesson.title}</h3>
                  <p style={{ color: '#94a3b8', fontWeight: 600 }}>Lesson {currentLessonIdx + 1} of {currentModule.lessons.length}</p>
               </div>
            </div>

            {/* Custom Video Controls Area */}
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              padding: '2rem', 
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Progress Bar */}
              <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '35%', backgroundColor: '#c8102e', borderRadius: '2px' }} />
                <div style={{ position: 'absolute', left: '35%', top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><SkipBack size={20} /></button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{ 
                      background: 'white', 
                      border: 'none', 
                      color: '#0f172a', 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '3px' }} />}
                  </button>
                  <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><SkipForward size={20} /></button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
                    <Volume2 size={20} />
                    <div style={{ width: '80px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                      <div style={{ width: '70%', height: '100%', backgroundColor: 'white', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginLeft: '0.5rem' }}>14:20 / 32:45</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Settings size={20} /></button>
                  <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Maximize size={20} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs & Details Section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', overflow: 'hidden' }}>
            <div style={{ 
              display: 'flex', 
              padding: '0 2rem', 
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              backgroundColor: '#1e293b'
            }}>
              {[
                { id: 'content', label: 'Overview', icon: <Info size={16} /> },
                { id: 'resources', label: 'Resources', icon: <FileText size={16} /> },
                { id: 'discussion', label: 'Discussion', icon: <MessageSquare size={16} /> },
                { id: 'notes', label: 'My Notes', icon: <FileText size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{ 
                    padding: '1.25rem 1.5rem', 
                    border: 'none',
                    background: 'none',
                    color: activeTab === tab.id ? '#fff' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    transition: 'color 0.2s'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: '#c8102e', borderRadius: '3px 3px 0 0' }} 
                    />
                  )}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }} className="custom-scrollbar">
               <AnimatePresence mode="wait">
                 {activeTab === 'content' && (
                   <motion.div 
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                   >
                     <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>About this lesson</h2>
                     <p style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '1rem', marginBottom: '2rem' }}>
                       In this lesson, we will explore the core foundations of {currentLesson.title}. 
                       You will learn how to effectively implement industry-standard patterns and avoid common pitfalls. 
                       By the end of this module, you'll be comfortable with the theoretical framework and ready for hands-on application.
                     </p>

                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                           <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c8102e', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Level</h4>
                           <p style={{ fontWeight: 700, margin: 0 }}>{course.level}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                           <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c8102e', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Duration</h4>
                           <p style={{ fontWeight: 700, margin: 0 }}>{currentLesson.duration}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                           <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c8102e', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Instructor</h4>
                           <p style={{ fontWeight: 700, margin: 0 }}>{course.instructor || "Sarah Jenkins"}</p>
                        </div>
                     </div>
                   </motion.div>
                 )}

                 {activeTab === 'resources' && (
                   <motion.div 
                    key="resources"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                   >
                     {[
                       { name: 'Course Syllabus PDF', size: '2.4 MB', type: 'pdf' },
                       { name: 'Lesson Source Code', size: '15.8 MB', type: 'zip' },
                       { name: 'Cheat Sheet: Industry Standards', size: '800 KB', type: 'pdf' }
                     ].map((res, i) => (
                       <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                           <div style={{ backgroundColor: 'rgba(200,16,46,0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: '#c8102e' }}>
                             <FileText size={20} />
                           </div>
                           <div>
                             <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{res.name}</h4>
                             <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, fontWeight: 600 }}>{res.type.toUpperCase()} • {res.size}</p>
                           </div>
                         </div>
                         <button style={{ background: 'none', border: 'none', color: '#c8102e', cursor: 'pointer', padding: '0.5rem' }}>
                           <Download size={20} />
                         </button>
                       </div>
                     ))}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// Internal component for the big play icon
const PlayCircleIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 8L16 12L10 16V8Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default CoursePlayer;
