import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, Pause, SkipForward, SkipBack, 
  List, MessageSquare, FileText, Settings, 
  Maximize, Volume2, VolumeX, CheckCircle2, Lock, 
  ChevronRight, ChevronDown, Download, Star,
  Info, Clock, Award, Loader2
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
  const [downloadingResource, setDownloadingResource] = useState<string | null>(null);

  // Video playback state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleDownloadResource = (resourceName: string) => {
    setDownloadingResource(resourceName);
    setTimeout(() => {
      setDownloadingResource(null);
    }, 2000);
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;


      try {
        const res = await coursesApi.getCourseById(id);
        if (res.success && res.data && (res.data as any).course) {

          setCourse((res.data as any).course);
        } else {

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

  // Real curriculum from course
  const modules = (course?.curriculum && course.curriculum.length > 0)
    ? course.curriculum.map((item: any, idx: number) => ({
        title: item.title || `Module ${idx + 1}`,
        lessons: item.lessons && item.lessons.length > 0
          ? item.lessons.map((les: any, lIdx: number) => ({
              id: les.id || `l-${idx}-${lIdx}`,
              title: les.title || `Lesson ${lIdx + 1}`,
              duration: les.duration || "15:00",
              completed: les.completed || false,
              videoUrl: les.video_url || les.videoUrl
            }))
          : [
              {
                id: `l-${idx}-1`,
                title: item.title || `Module ${idx + 1} Overview`,
                duration: item.duration || "20:00",
                completed: false,
                videoUrl: item.video_url || item.videoUrl
              }
            ]
      }))
    : [];

  const currentModule = modules[currentModuleIdx] || modules[0];
  const currentLesson = (currentModule && currentModule.lessons) ? (currentModule.lessons[currentLessonIdx] || currentModule.lessons[0]) : { title: 'No lesson available', duration: '0:00' };

  const currentVideoSrc = (currentLesson as any)?.videoUrl || 
                          (currentLesson as any)?.video_url || 
                          course?.video_url || 
                          course?.videoUrl || 
                          "https://nestdigital.com/wp-content/uploads/2026/04/videoplayback.mp4";

  // When lesson changes, autoplay in muted state
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      setIsMuted(true);
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, [currentModuleIdx, currentLessonIdx]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.paused) {
      video.play().catch(() => {});
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSkip = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration || 1000, video.currentTime + delta));
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      video.requestFullscreen().catch(() => {});
    }
  };

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
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white',
      fontFamily: '"Inter", sans-serif'
    }}>
      <style>{`
        @media (max-width: 992px) {
          .course-player-sidebar {
            position: fixed !important;
            top: 64px !important;
            left: 0 !important;
            bottom: 0 !important;
            z-index: 999 !important;
            box-shadow: 10px 0 30px rgba(0,0,0,0.6) !important;
            max-width: 85vw !important;
          }
        }
      `}</style>
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
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/courses/my-courses')}
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
          <button 
            onClick={() => navigate(`/assessment/${id || course.id || course._id}`)}
            style={{ 
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
            }}
          >
            <Award size={16} /> Course Assessment
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        {/* Sidebar: Course Content */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside 
              className="course-player-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ 
                backgroundColor: '#0f172a', 
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Course Content</h2>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)} Lessons</span>
              </div>

              <div style={{ flex: 1, padding: '1rem' }}>
                {modules.map((module: any, mIdx: number) => (
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
                      {module.lessons.map((lesson: any, lIdx: number) => {
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
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
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
            <video
              ref={videoRef}
              src={currentVideoSrc}
              autoPlay
              muted
              playsInline
              loop
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onVolumeChange={() => {
                if (videoRef.current) setIsMuted(videoRef.current.muted || videoRef.current.volume === 0);
              }}
              onClick={togglePlay}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                cursor: 'pointer'
              }}
            />

            {/* Floating Unmute Button */}
            {isMuted && (
              <button
                type="button"
                onClick={toggleSound}
                title="Click to unmute"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '100px',
                  backgroundColor: 'rgba(200, 16, 46, 0.9)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                  transition: 'transform 0.2s'
                }}
              >
                <VolumeX size={16} />
                <span>Click to Unmute</span>
              </button>
            )}

            {/* Custom Video Controls Area */}
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              padding: '1.5rem', 
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              zIndex: 5
            }}>
              {/* Progress Bar */}
              <div 
                onClick={handleSeek}
                style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '3px', position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%', backgroundColor: '#c8102e', borderRadius: '3px' }} />
                <div style={{ position: 'absolute', left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%', top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <button onClick={() => handleSkip(-10)} title="Skip back 10s" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><SkipBack size={20} /></button>
                  <button 
                    onClick={togglePlay}
                    style={{ 
                      background: 'white', 
                      border: 'none', 
                      color: '#0f172a', 
                      width: '40px', 
                      height: '40px', 
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
                    {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: '2px' }} />}
                  </button>
                  <button onClick={() => handleSkip(10)} title="Skip forward 10s" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><SkipForward size={20} /></button>
                  
                  {/* Sound icon with mute/unmute toggle */}
                  <button 
                    onClick={toggleSound}
                    title={isMuted ? 'Unmute' : 'Mute'}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
                  >
                    {isMuted ? <VolumeX size={20} color="#f87171" /> : <Volume2 size={20} />}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isMuted ? '#f87171' : '#cbd5e1' }}>
                      {isMuted ? 'Muted' : 'Sound On'}
                    </span>
                  </button>
                  
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginLeft: '0.5rem' }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <button onClick={handleFullscreen} title="Fullscreen" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Maximize size={20} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs & Details Section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>
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

            <div style={{ flex: 1, padding: '2.5rem' }}>
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
