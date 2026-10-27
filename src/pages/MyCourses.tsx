import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Award, PlayCircle, CheckCircle2, Search, Filter, BarChart3, Calendar, Star, ChevronRight, Loader2, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usersApi, coursesApi, getUser } from '../services/api';
import { generateCourseCertificate } from '../utils/CertificateGenerator';
import CertificateProgressButton from '../components/CertificateProgressButton';

type CourseStatus = 'In Progress' | 'Completed';

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
  passingScore?: number;
}

const STATUS_CONFIG: Record<CourseStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'In Progress': { color: '#1971c2', bg: '#e7f5ff', border: '#74c0fc', icon: <PlayCircle size={16} /> },
  'Completed': { color: '#2b8a3e', bg: '#ebfbee', border: '#69db7c', icon: <CheckCircle2 size={16} /> }
};

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  'Beginner': { color: '#2b8a3e', bg: '#ebfbee' },
  'Intermediate': { color: '#e67700', bg: '#fff9db' },
  'Advanced': { color: '#c92a2a', bg: '#fff5f5' }
};

const ALL_STATUSES: CourseStatus[] = ['In Progress', 'Completed'];

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCourses(true);
        // Fetch Profile
        const profileRes = await usersApi.getProfile();
        if (profileRes.success && profileRes.data) {
          setUserProfile((profileRes.data as any).user);
        }

        // Fetch Real Enrolled Courses
        const coursesRes = await coursesApi.getMyCourses();
        if (coursesRes.success && coursesRes.data && coursesRes.data.courses) {
          const realCourses: EnrolledCourse[] = coursesRes.data.courses.map((c: any) => {
            const totalLessons = Array.isArray(c.curriculum) ? c.curriculum.length : 0;
            const progressVal = c.enrollment_info?.progress || 0;
            const completedLessons = totalLessons > 0 ? Math.round((progressVal / 100) * totalLessons) : 0;
            const nextLesson = (Array.isArray(c.curriculum) && c.curriculum.length > 0) ? c.curriculum[0]?.title : undefined;
            const formattedDuration = c.duration 
              ? (isNaN(Number(c.duration)) ? c.duration : `${c.duration} Hours`) 
              : 'Flexible';
            const hasPassed = Boolean(c.assessment_info?.has_passed);

            return {
              id: `real-${c.id}`,
              courseId: c.id,
              title: c.title,
              instructor: c.instructor || 'Lead Expert',
              level: c.level || 'Standard',
              duration: formattedDuration,
              progress: progressVal,
              status: (hasPassed ? 'Completed' : 'In Progress') as CourseStatus,
              enrolledDate: c.enrollment_info?.enrolled_at || new Date().toISOString(),
              lastAccessed: new Date().toISOString(),
              totalLessons: totalLessons,
              completedLessons: completedLessons,
              nextLesson: nextLesson,
              certificateAvailable: hasPassed,
              completedDate: c.assessment_info?.completed_at || c.enrollment_info?.completed_at || c.completed_at || new Date().toISOString(),
              passingScore: c.assessment_info?.passing_score || 50
            };
          });
          
          // Sort by enrollment date (latest first)
          const sortedCourses = realCourses.sort((a, b) => 
            new Date(b.enrolledDate).getTime() - new Date(a.enrolledDate).getTime()
          );
          
          setCourses(sortedCourses);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Failed to fetch academy data:", err);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesStatus = filterStatus === 'All' || course.status === filterStatus;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = courses.reduce((acc, course) => {
    acc[course.status] = (acc[course.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalProgress = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
    : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Recently';
    let cleanStr = String(dateStr).trim();
    if (!cleanStr.endsWith('Z') && !/[+-]\d{2}(:?\d{2})?$/.test(cleanStr)) {
      cleanStr += 'Z';
    }
    const parsedTime = new Date(cleanStr).getTime();
    if (isNaN(parsedTime)) return 'Recently';

    const diff = Date.now() - parsedTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
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
            background: 'url("/placeholder.jpg")',
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
              const config = STATUS_CONFIG[course.status] || STATUS_CONFIG['In Progress'];
              const levelConfig = LEVEL_COLORS[course.level] || { color: '#6c757d', bg: '#f8f9fa' };

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  layout
                  onClick={() => {
                    if (course.status === 'Completed') {
                      navigate(`/courses/${course.courseId}`);
                    } else {
                      navigate(`/courses/${course.courseId}/play`);
                    }
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e9ecef',
                    borderRadius: '16px',
                    padding: '1.6rem 2rem',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#dee2e6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                    e.currentTarget.style.borderColor = '#e9ecef';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Main Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                    <div style={{ flex: '1 1 320px' }}>
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
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>{course.title}</h3>
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
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

                      {/* Primary Continue / Review Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (course.status === 'Completed') {
                            navigate(`/courses/${course.courseId}`);
                          } else {
                            navigate(`/courses/${course.courseId}/play`);
                          }
                        }}
                        style={{
                          padding: '0.55rem 1.3rem',
                          borderRadius: '10px',
                          background: course.status === 'Completed' ? '#f8f9fa' : 'var(--primary)',
                          border: `1px solid ${course.status === 'Completed' ? '#ced4da' : 'var(--primary)'}`,
                          color: course.status === 'Completed' ? '#1a1a1a' : '#ffffff',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.2s',
                          boxShadow: course.status === 'Completed' ? 'none' : '0 4px 12px rgba(200, 16, 46, 0.25)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                      >
                        {course.status === 'Completed' ? <BookOpen size={15} /> : <PlayCircle size={15} />}
                        {course.status === 'Completed' ? 'Review' : 'Continue'}
                      </button>

                      {/* Take Assessment Button if not yet completed */}
                      {course.status !== 'Completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assessment/${course.courseId}`);
                          }}
                          style={{
                            padding: '0.55rem 1.15rem',
                            borderRadius: '10px',
                            background: '#0F172A',
                            border: '1px solid #0F172A',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                          title={`Attend assessment (Passing score: ${course.passingScore || 50}%) to complete course`}
                        >
                          <Award size={15} />
                          Take Assessment
                        </button>
                      )}

                      {/* Certificate Download Button if course assessment passed */}
                      {course.certificateAvailable ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <CertificateProgressButton 
                            onGenerate={() => {
                              const participantName = userProfile?.full_name || userProfile?.name || getUser()?.full_name || 'NeST Member';
                              generateCourseCertificate(
                                participantName,
                                course.title,
                                course.completedDate || new Date().toISOString()
                              );
                            }}
                          />
                        </div>
                      ) : (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assessment/${course.courseId}`);
                          }}
                          title={`Certificate locked: Score >= ${course.passingScore || 50}% in assessment to unlock & complete course`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.55rem 0.9rem',
                            borderRadius: '10px',
                            background: '#F1F5F9',
                            color: '#94A3B8',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            border: '1px dashed #CBD5E1',
                            cursor: 'pointer'
                          }}
                        >
                          <Lock size={13} /> Certificate Locked
                        </div>
                      )}
                    </div>
                  </div>
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
