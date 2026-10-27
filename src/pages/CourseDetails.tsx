import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, Star, 
  Award, PlayCircle, CheckCircle2, 
  ChevronRight, Calendar, User, Globe,
  BookOpen
} from 'lucide-react';
import { coursesApi } from '../services/api';
import StatusModal from '../components/StatusModal';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Status Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    title: '',
    message: '',
    confirmText: 'Okay',
    showConfirmOnly: true,
    onConfirm: undefined as (() => void) | undefined
  });

  useEffect(() => {
    const fetchCourseAndStatus = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Fetch course details
        const res = await coursesApi.getCourseById(id);
        if (res.success && res.data && res.data.course) {
          setCourse(res.data.course);
        }

        // Fetch user's courses to check enrollment status
        const myCoursesRes = await coursesApi.getMyCourses();
        if (myCoursesRes.success && myCoursesRes.data && myCoursesRes.data.courses) {
          const enrolled = myCoursesRes.data.courses.some((c: any) => c.id === id);
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error('Failed to fetch course details or status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndStatus();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Loading Course Details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <BookOpen size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Course not found</h2>
        <Link to="/courses" className="text-indigo-600 font-bold hover:underline">Back to catalog</Link>
      </div>
    );
  }



  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '5rem', overflowX: 'hidden', fontFamily: '"Inter", sans-serif', margin: '-28px -32px 0 -32px' }}>
      {/* Hero Section */}
      <div style={{ backgroundColor: '#0d2046', color: 'white', padding: '4rem 2rem 6rem 2rem', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative Glow */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(200, 16, 46, 0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              borderRadius: '12px',
              padding: '8px 16px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '2rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <ArrowLeft size={16} /> Back to Courses
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }}>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <span style={{ backgroundColor: '#1e293b', padding: '0.4rem 1rem', borderRadius: '0.6rem', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(255,255,255,0.1)' }}>{course.level || 'Beginner Friendly'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#eab308' }}>
                  <Star size={16} fill="currentColor" />
                  <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 800 }}>4.9 <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>(2,840)</span></span>
                </div>
              </div>
              <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-0.03em' }}>{course.title}</h1>
              <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '600px', fontWeight: 500 }}>{course.description || "Master industry-standard engineering practices and lead with expertise."}</p>
              
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative' }}>
              {/* Enrollment & Quick Info (Moved here to free space above card) */}
              <div style={{ marginBottom: '2.5rem' }}>
                <button 
                  onClick={async () => {
                    if (!id || enrolling) return;
                    if (isEnrolled) {
                      if (course?.links && course.links.length > 0 && course.links[0]) {
                        let targetLink = course.links[0];
                        if (!targetLink.startsWith('http://') && !targetLink.startsWith('https://')) {
                          targetLink = 'https://' + targetLink;
                        }
                        window.open(targetLink, '_blank');
                      } else {
                        navigate(`/courses/${id}/play`);
                      }
                      return;
                    }

                    setEnrolling(true);
                    try {
                      const res = await coursesApi.enrollCourse(id);
                      if (res.success) {
                        setIsEnrolled(true);
                        setModalConfig({
                          isOpen: true,
                          type: 'success',
                          title: 'Enrollment Successful!',
                          message: `You have successfully enrolled in "${course?.title || 'this course'}". You can now start learning immediately!`,
                          confirmText: 'Start Learning',
                          showConfirmOnly: true,
                          onConfirm: () => {
                            setModalConfig(prev => ({ ...prev, isOpen: false }));
                            if (course?.links && course.links.length > 0 && course.links[0]) {
                              let targetLink = course.links[0];
                              if (!targetLink.startsWith('http://') && !targetLink.startsWith('https://')) {
                                targetLink = 'https://' + targetLink;
                              }
                              window.open(targetLink, '_blank');
                            } else {
                              navigate(`/courses/${id}/play`);
                            }
                          }
                        });
                      } else {
                        setModalConfig({
                          isOpen: true,
                          type: 'error',
                          title: 'Enrollment Failed',
                          message: res.message || 'Unable to enroll in this course. Please try again later.',
                          confirmText: 'OK',
                          showConfirmOnly: true,
                          onConfirm: undefined
                        });
                      }
                    } catch (err: any) {
                      setModalConfig({
                        isOpen: true,
                        type: 'error',
                        title: 'Enrollment Error',
                        message: err.message || 'An unexpected error occurred while enrolling.',
                        confirmText: 'OK',
                        showConfirmOnly: true,
                        onConfirm: undefined
                      });
                    } finally {
                      setEnrolling(false);
                    }
                  }}
                  disabled={enrolling}
                  style={{ 
                    padding: '1.2rem 3.5rem', borderRadius: '3rem', 
                    background: isEnrolled ? '#10b981' : '#3b82f6', 
                    color: 'white', border: 'none', fontWeight: 900, fontSize: '1.2rem', 
                    cursor: enrolling ? 'wait' : 'pointer',
                    boxShadow: isEnrolled ? '0 20px 40px rgba(16, 185, 129, 0.2)' : '0 20px 40px rgba(59, 130, 246, 0.3)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'all 0.3s ease',
                    marginBottom: '2rem'
                  }}
                >
                  {enrolling ? 'Enrolling...' : isEnrolled ? 'Enrolled • View Course' : 'Enroll Now'} <ChevronRight size={24} />
                </button>

                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={22} color="#c8102e" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', margin: 0, letterSpacing: '0.1em' }}>Duration</p>
                      <p style={{ fontWeight: 800, margin: 0, fontSize: '1rem', color: 'white' }}>{course.duration || "12 Weeks"}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={22} color="#c8102e" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', margin: 0, letterSpacing: '0.1em' }}>Instructor</p>
                      <p style={{ fontWeight: 800, margin: 0, fontSize: '1rem', color: 'white' }}>{course.instructor || "Lead NeST Expert"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '2.5rem', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ position: 'relative', borderRadius: '1.8rem', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
                  {course.cover_image ? (
                    <img src={course.cover_image} alt={course.title} style={{ width: '100%', display: 'block' }} />
                  ) : (
                    <img src="/placeholder.jpg" alt={course.title} style={{ width: '100%', display: 'block' }} />
                  )}
                  <div 
                    onClick={() => {
                      if (course.links && course.links.length > 0 && course.links[0]) {
                        let targetLink = course.links[0];
                        if (!targetLink.startsWith('http://') && !targetLink.startsWith('https://')) {
                          targetLink = 'https://' + targetLink;
                        }
                        window.open(targetLink, '_blank');
                      } else {
                        navigate(`/courses/${id}/play`);
                      }
                    }}
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,32,70,0.3)', cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                       <PlayCircle size={80} color="white" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '-4rem auto 0 auto', padding: '0 2rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          {course.outcomes && course.outcomes.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', marginTop: '3rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d2046', marginBottom: '1.5rem' }}>Learning Outcomes</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {course.outcomes.map((item: string) => (
                    <div key={item} style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#1e293b', fontSize: '1rem', fontWeight: 600 }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={16} color="#c8102e" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '2rem', border: '1px solid #f1f5f9' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Award size={24} color="#c8102e" />
                    <span style={{ fontWeight: 800, color: '#0d2046', fontSize: '1rem' }}>Certified Program</span>
                 </div>
                 <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                    Earn a verifiable digital credential upon successful completion, recognized across the global NeST Digital network.
                 </p>
              </div>
            </div>
          )}
        </div>

        {course.curriculum && Array.isArray(course.curriculum) && course.curriculum.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0d2046', margin: 0, letterSpacing: '-0.02em' }}>Curriculum Schedule</h3>
               <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700 }}>{course.curriculum.length} Detailed Lessons</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {course.curriculum.map((item: any, idx: number) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ x: 10, backgroundColor: '#fff' }}
                  style={{ background: '#fff', padding: '1.8rem 2.5rem', borderRadius: '1.8rem', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <span style={{ width: '48px', height: '48px', backgroundColor: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: '#0d2046', border: '1px solid #f1f5f9' }}>{idx + 1}</span>
                    <div>
                      <h5 style={{ fontWeight: 800, color: '#334155', margin: '0 0 4px 0', fontSize: '1.1rem' }}>{item.title}</h5>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Lesson {idx + 1}</span>
                         <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                         <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{item.duration || '45m'}</span>
                         {item.type && (
                           <>
                             <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                             <span style={{ fontSize: '0.75rem', color: '#c8102e', fontWeight: 800, textTransform: 'uppercase' }}>{item.type}</span>
                           </>
                         )}
                      </div>
                    </div>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                     <ChevronRight size={20} />
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <StatusModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        showConfirmOnly={modalConfig.showConfirmOnly}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
};

export default CourseDetails;
