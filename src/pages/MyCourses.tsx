import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Award, PlayCircle, CheckCircle2, ChevronDown, Search, Filter, BarChart3, Calendar, Star, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

type CourseStatus = 'In Progress' | 'Completed' | 'Not Started';

interface EnrolledCourse {
  id: string;
  courseId: string;
  title: string;
  instructor: string;
  level: string;
  duration: string;
  progress: number;
  status: CourseStatus;
  enrolledDate: string;
  lastAccessed: string;
  completedDate?: string;
  totalLessons: number;
  completedLessons: number;
  nextLesson?: string;
  certificateAvailable?: boolean;
}

const MOCK_COURSES: EnrolledCourse[] = [
  {
    id: 'ec-1',
    courseId: '1',
    title: 'Advanced Cloud Architecture & DevOps',
    instructor: 'Dr. Rajesh Nair',
    level: 'Advanced',
    duration: '36 Hours',
    progress: 72,
    status: 'In Progress',
    enrolledDate: '2026-02-10',
    lastAccessed: '2026-03-25',
    totalLessons: 18,
    completedLessons: 13,
    nextLesson: 'Kubernetes Orchestration at Scale'
  },
  {
    id: 'ec-2',
    courseId: '2',
    title: 'Full Stack Development with React & Node',
    instructor: 'Priya Sharma',
    level: 'Intermediate',
    duration: '48 Hours',
    progress: 100,
    status: 'Completed',
    enrolledDate: '2025-12-01',
    lastAccessed: '2026-02-28',
    completedDate: '2026-02-28',
    totalLessons: 24,
    completedLessons: 24,
    certificateAvailable: true
  },
  {
    id: 'ec-3',
    courseId: '3',
    title: 'Data Science & Machine Learning Essentials',
    instructor: 'Dr. Arun Menon',
    level: 'Beginner',
    duration: '30 Hours',
    progress: 35,
    status: 'In Progress',
    enrolledDate: '2026-03-05',
    lastAccessed: '2026-03-24',
    totalLessons: 15,
    completedLessons: 5,
    nextLesson: 'Feature Engineering Techniques'
  },
  {
    id: 'ec-4',
    courseId: '4',
    title: 'Cybersecurity Fundamentals & Ethical Hacking',
    instructor: 'Karthik Iyer',
    level: 'Intermediate',
    duration: '42 Hours',
    progress: 100,
    status: 'Completed',
    enrolledDate: '2025-10-15',
    lastAccessed: '2026-01-10',
    completedDate: '2026-01-10',
    totalLessons: 21,
    completedLessons: 21,
    certificateAvailable: true
  },
  {
    id: 'ec-5',
    courseId: '5',
    title: 'AI-Powered Product Management',
    instructor: 'Sneha George',
    level: 'Advanced',
    duration: '28 Hours',
    progress: 0,
    status: 'Not Started',
    enrolledDate: '2026-03-20',
    lastAccessed: '2026-03-20',
    totalLessons: 14,
    completedLessons: 0,
    nextLesson: 'Introduction to AI Product Lifecycle'
  },
  {
    id: 'ec-6',
    courseId: '6',
    title: 'System Design & Scalable Architecture',
    instructor: 'Dr. Vikram Das',
    level: 'Advanced',
    duration: '40 Hours',
    progress: 55,
    status: 'In Progress',
    enrolledDate: '2026-01-15',
    lastAccessed: '2026-03-22',
    totalLessons: 20,
    completedLessons: 11,
    nextLesson: 'Distributed Caching Strategies'
  }
];

const STATUS_CONFIG: Record<CourseStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'In Progress': { color: '#1971c2', bg: '#e7f5ff', border: '#74c0fc', icon: <PlayCircle size={16} /> },
  'Completed': { color: '#2b8a3e', bg: '#ebfbee', border: '#69db7c', icon: <CheckCircle2 size={16} /> },
  'Not Started': { color: '#868e96', bg: '#f8f9fa', border: '#dee2e6', icon: <Clock size={16} /> }
};

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  'Beginner': { color: '#2b8a3e', bg: '#ebfbee' },
  'Intermediate': { color: '#e67700', bg: '#fff9db' },
  'Advanced': { color: '#c92a2a', bg: '#fff5f5' }
};

const ALL_STATUSES: CourseStatus[] = ['In Progress', 'Completed', 'Not Started'];

const MyCourses: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredCourses = MOCK_COURSES.filter(course => {
    const matchesStatus = filterStatus === 'All' || course.status === filterStatus;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = MOCK_COURSES.reduce((acc, course) => {
    acc[course.status] = (acc[course.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalProgress = MOCK_COURSES.length > 0
    ? Math.round(MOCK_COURSES.reduce((sum, c) => sum + c.progress, 0) / MOCK_COURSES.length)
    : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div style={{ minHeight: '100vh', padding: '0', background: 'transparent', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* CINEMATIC BANNER SECTION - Full Width */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            position: 'relative',
            width: '100vw',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            padding: '5.5rem 0',
            marginBottom: '3.5rem',
            background: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            color: 'white'
          }}
        >
           {/* Sophisticated Dark Gradient Overlay */}
           <div style={{ 
             position: 'absolute', 
             inset: 0, 
             background: 'linear-gradient(to right, rgba(11, 15, 26, 0.98) 0%, rgba(11, 15, 26, 0.8) 35%, transparent 100%)',
             zIndex: 1 
           }} />
           
           {/* Film Grain Texture Overlay */}
           <div style={{ 
             position: 'absolute', inset: 0, zIndex: 2, opacity: 0.08, pointerEvents: 'none',
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
             backgroundRepeat: 'repeat', backgroundSize: '128px',
             mixBlendMode: 'overlay'
           }} />

          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
            >
              <h1 style={{ margin: 0, fontSize: '4.5rem', fontWeight: 950, color: '#FFFFFF', letterSpacing: '-0.05em', lineHeight: 1.05, marginBottom: '1.25rem', textShadow: '0 12px 36px rgba(0,0,0,0.6)' }}>
                My <span style={{ color: '#E31E24' }}>Academy</span>
              </h1>
              
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', fontWeight: 500, maxWidth: '600px', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
                Master your craft with bespoke engineering curricula. Track your path from fundamentals to world-class architectural mastery.
              </p>

              <div style={{ marginTop: '3rem', display: 'flex', gap: '1.25rem' }}>
                 <button 
                  onClick={() => navigate('/courses')}
                  className="btn-premium" 
                  style={{ 
                    background: '#E31E24', 
                    color: '#FFFFFF', 
                    border: 'none', 
                    padding: '16px 40px', 
                    borderRadius: '12px', 
                    fontWeight: 800, 
                    fontSize: '1rem', 
                    cursor: 'pointer',
                    boxShadow: '0 15px 35px rgba(227, 30, 36, 0.25), 0 0 20px rgba(227, 30, 36, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                 >
                   Explore Catalog
                 </button>
                 <button className="btn-premium" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 40px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', backdropFilter: 'blur(12px)', cursor: 'pointer' }}>Achievement Dashboard</button>
              </div>
            </motion.div>
          </div>

          {/* Red Ambient Glow Blob */}
          <div style={{ position: 'absolute', right: '-10%', bottom: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(227, 30, 36, 0.1) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 1 }} />
        </motion.div>



        {/* Filter & Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '14px',
            padding: '1.2rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center'
          }}
        >
          <div style={{ flex: '1 1 250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                background: '#ffffff',
                color: '#1a1a1a',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={16} color="#6c757d" />
            {['All', ...ALL_STATUSES].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  border: `1px solid ${filterStatus === status ? 'var(--primary)' : '#ced4da'}`,
                  background: filterStatus === status ? 'var(--primary)' : '#ffffff',
                  color: filterStatus === status ? 'white' : '#4a4a4a',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Course Cards */}
        <AnimatePresence mode="popLayout">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => {
              const config = STATUS_CONFIG[course.status];
              const levelConfig = LEVEL_COLORS[course.level] || { color: '#6c757d', bg: '#f8f9fa' };
              const isExpanded = expandedId === course.id;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  layout
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${isExpanded ? config.border : '#e9ecef'}`,
                    borderRadius: '16px',
                    padding: '1.5rem 1.8rem',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isExpanded ? `0 8px 24px ${config.bg}` : '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : course.id)}
                  onMouseEnter={(e) => { if (!isExpanded) { e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#dee2e6'; } }}
                  onMouseLeave={(e) => { if (!isExpanded) { e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#e9ecef'; } }}
                >
                  {/* Main Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: levelConfig.bg,
                          color: levelConfig.color,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {course.level}
                        </span>
                        <span style={{ color: '#dee2e6' }}>•</span>
                        <span style={{ color: '#6c757d', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} /> {course.duration}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>{course.title}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6c757d', fontSize: '0.85rem' }}>
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#0d2046',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.6rem'
                          }}>
                            {course.instructor.charAt(0)}
                          </div>
                          {course.instructor}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6c757d', fontSize: '0.82rem' }}>
                          <Calendar size={13} color="var(--primary)" /> Enrolled {formatDate(course.enrolledDate)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4a4a4a' }}>
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: course.progress === 100 ? '#2b8a3e' : 'var(--primary)' }}>
                            {course.progress}%
                          </span>
                        </div>
                        <div style={{
                          width: '100%', height: '6px', backgroundColor: '#f1f3f5',
                          borderRadius: '10px', overflow: 'hidden'
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              borderRadius: '10px',
                              background: course.progress === 100
                                ? 'linear-gradient(90deg, #2b8a3e, #40c057)'
                                : 'linear-gradient(90deg, var(--primary), #e8536c)'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Status Badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 1rem',
                        borderRadius: '20px',
                        background: config.bg,
                        border: `1px solid ${config.border}`,
                        color: config.color,
                        fontWeight: 600,
                        fontSize: '0.82rem'
                      }}>
                        {config.icon}
                        {course.status}
                      </div>

                      {/* Expand Toggle */}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: '#adb5bd', display: 'flex' }}
                      >
                        <ChevronDown size={20} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ borderTop: '1px solid #e9ecef', marginTop: '1.5rem', paddingTop: '1.5rem' }}>

                          {/* Course Details Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Last Accessed</p>
                              <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '0.95rem' }}>{getTimeAgo(course.lastAccessed)}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Enrolled On</p>
                              <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '0.95rem' }}>{formatDate(course.enrolledDate)}</p>
                            </div>
                            {course.completedDate && (
                              <div>
                                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Completed On</p>
                                <p style={{ color: '#2b8a3e', fontWeight: 600, fontSize: '0.95rem' }}>{formatDate(course.completedDate)}</p>
                              </div>
                            )}
                            <div>
                              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>Total Duration</p>
                              <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '0.95rem' }}>{course.duration}</p>
                            </div>
                          </div>

                          {/* Next Lesson Info */}
                          {course.nextLesson && course.status !== 'Completed' && (
                            <div style={{
                              background: config.bg,
                              border: `1px solid ${config.border}`,
                              borderRadius: '10px',
                              padding: '1rem 1.2rem',
                              marginBottom: '1.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '0.5rem'
                            }}>
                              <div>
                                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: config.color, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {course.status === 'Not Started' ? 'First Lesson' : 'Next Up'}
                                </p>
                                <p style={{ color: '#4a4a4a', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                                  {course.nextLesson}
                                </p>
                              </div>
                              <ChevronRight size={18} color={config.color} />
                            </div>
                          )}

                          {/* Certificate Info */}
                          {course.certificateAvailable && (
                            <div style={{
                              background: 'linear-gradient(135deg, #ebfbee 0%, #e7f5ff 100%)',
                              border: '1px solid #69db7c',
                              borderRadius: '10px',
                              padding: '1rem 1.2rem',
                              marginBottom: '1.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem'
                            }}>
                              <Award size={22} color="#2b8a3e" />
                              <div>
                                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2b8a3e', margin: '0 0 0.15rem 0' }}>Certificate Earned!</p>
                                <p style={{ color: '#4a4a4a', fontSize: '0.85rem', margin: 0 }}>Your professional certificate for this course is ready to download.</p>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {course.status === 'Completed' ? (
                              <>
                                <button
                                  onClick={() => navigate(`/courses/${course.courseId}`)}
                                  style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    background: '#ffffff',
                                    border: '1px solid #ced4da',
                                    color: '#4a4a4a',
                                    fontSize: '0.88rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#ced4da'; e.currentTarget.style.color = '#4a4a4a'; }}
                                >
                                  <BookOpen size={15} /> Review Course
                                </button>
                                {course.certificateAvailable && (
                                  <button
                                    style={{
                                      padding: '0.6rem 1.2rem',
                                      borderRadius: '8px',
                                      background: 'var(--primary)',
                                      border: '1px solid var(--primary)',
                                      color: 'white',
                                      fontSize: '0.88rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                                  >
                                    <Award size={15} /> Download Certificate
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => navigate(`/courses/${course.courseId}/play`)}
                                  style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    background: 'var(--primary)',
                                    border: '1px solid var(--primary)',
                                    color: 'white',
                                    fontSize: '0.88rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                                >
                                  <PlayCircle size={15} /> {course.status === 'Not Started' ? 'Start Course' : 'Continue Learning'}
                                </button>
                                <button
                                  onClick={() => navigate(`/courses/${course.courseId}`)}
                                  style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    background: '#ffffff',
                                    border: '1px solid #ced4da',
                                    color: '#4a4a4a',
                                    fontSize: '0.88rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#ced4da'; e.currentTarget.style.color = '#4a4a4a'; }}
                                >
                                  <BookOpen size={15} /> View Details
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ background: '#f8f9fa', display: 'inline-block', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <BookOpen size={40} color="#adb5bd" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>No courses found</h3>
              <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                {filterStatus !== 'All' || searchTerm
                  ? 'Try changing your filters to see more results.'
                  : "You haven't enrolled in any courses yet. Explore our catalog and start learning!"}
              </p>
              {filterStatus !== 'All' || searchTerm ? (
                <button
                  onClick={() => { setFilterStatus('All'); setSearchTerm(''); }}
                  style={{ background: '#ffffff', color: '#1a1a1a', border: '1px solid #ced4da', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/courses"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.8rem 2rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'background 0.3s'
                  }}
                >
                  Browse Course Catalog
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyCourses;
