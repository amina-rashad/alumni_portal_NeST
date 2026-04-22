import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, Star, 
  Award, PlayCircle, CheckCircle2, 
  ChevronRight, Calendar, User, Globe
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
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const res = await coursesApi.getMyCourses();
        if (res.success && res.data) {
          const enrolled = res.data.courses.some((c: any) => c.id === id);
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error('Error checking enrollment:', err);
      }
    };
    if (id) checkEnrollment();
  }, [id]);

  const handleEnroll = async () => {
    if (!id) return;
    setEnrolling(true);
    try {
      const res = await (coursesApi as any).enroll(id);
      if (res.success) {
        setIsEnrolled(true);
        setModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Successfully Enrolled!',
          message: 'You have been successfully enrolled in this course. You can now start learning!'
        });
      } else {
        setModalConfig({
          isOpen: true,
          type: 'error',
          title: 'Enrollment Failed',
          message: res.message || 'Enrollment failed. Please try again later.'
        });
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred during enrollment. Please check your connection.'
      });
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        const res = await coursesApi.getCourseById(id);
        const data = res.data as any;
        if (res.success && data && data.course) {
          setCourse(data.course);
        }
      } catch (err) {
        console.error('Failed to fetch course details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: '#f8fafc', height: '100vh' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0d2046', marginBottom: '1.5rem' }}>Course not found</h2>
        <Link to="/courses" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>Back to catalog</Link>
      </div>
    );
  }

  const curriculum = (course.modules && course.modules.length > 0) ? course.modules : [
    { title: 'Introduction to Core Concepts', duration: '45m' },
    { title: 'Foundational Principles & Theory', duration: '1h 20m' },
    { title: 'Hands-on Implementation Part I', duration: '2h 15m' },
    { title: 'Advanced Scalability & Architecture', duration: '3h 10m' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '5rem', overflowX: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      {/* Dynamic Header / Hero Area */}
      <div style={{ backgroundColor: '#0d2046', color: 'white', padding: '4rem 1rem 6rem 1rem', position: 'relative' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: 700 }}>
               <ArrowLeft size={18} /> Back to Catalog
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
               <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                     <span style={{ backgroundColor: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>{course.level}</span>
                     <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={14} fill="var(--primary)" color="var(--primary)" /> 4.9 (240 Ratings)
                     </span>
                  </div>
                  <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-0.02em' }}>{course.title}</h1>
                   <div style={{ background: 'rgba(255,255,255,0.06)', padding: '1.5rem 2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2.5rem', maxWidth: '850px', backdropFilter: 'blur(10px)' }}>
                      <p style={{ fontSize: '1.1rem', color: '#e2e8f0', lineHeight: '1.7', margin: 0 }}>
                         {course.description || "Master industry-standard engineering practices and lead with expertise through this professional track."}
                      </p>
                   </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                      Access: {course.access_level || 'Open'}
                    </span>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                      Track: {course.category || 'Professional'}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1.5rem',
                    marginTop: '1.5rem',
                    padding: '1.25rem 2rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    width: '100%',
                    flexWrap: 'nowrap',
                    overflowX: 'auto'
                  }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <div style={{ background: 'rgba(200,16,46,0.2)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                           <Clock size={16} color="#f87171" />
                        </div>
                        <div style={{ whiteSpace: 'nowrap' }}>
                           <p style={{ fontSize: '0.6rem', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Duration</p>
                           <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                              {course.duration ? (course.duration.toLowerCase().includes('h') ? course.duration : `${course.duration} Hours`) : "24 Hours"}
                           </p>
                        </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <div style={{ background: 'rgba(200,16,46,0.2)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                           <Calendar size={16} color="#f87171" />
                        </div>
                        <div style={{ whiteSpace: 'nowrap' }}>
                           <p style={{ fontSize: '0.6rem', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Start Date</p>
                           <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{course.start_date || "On Demand"}</p>
                        </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <div style={{ background: 'rgba(200,16,46,0.2)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                           <Globe size={16} color="#f87171" />
                        </div>
                        <div style={{ whiteSpace: 'nowrap' }}>
                           <p style={{ fontSize: '0.6rem', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Enrolled</p>
                           <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{course.enrolled_count || 0} Students</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative' }}>
                  <div style={{ background: 'linear-gradient(135deg, rgba(200,16,46,0.3) 0%, rgba(255,255,255,0.1) 100%)', borderRadius: '2rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                     <div style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden' }}>
                        <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop" alt={course.title} style={{ width: '100%', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,32,70,0.4)', cursor: 'pointer' }}>
                           <PlayCircle size={80} color="white" />
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto 0 auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
         {/* Left Side: Learning and Info */}
         <div style={{ gridColumn: 'span 2' }}>
            <div style={{ background: 'white', padding: '3rem', borderRadius: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginBottom: '3rem' }}>
               <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0d2046', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Core Knowledge Areas</h4>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
                  <div>
                     <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0d2046', marginBottom: '1.25rem' }}>What You'll Learn</h4>
                     <ul style={{ listStyle: 'none', padding: 0 }}>
                        {['Deep dive foundations', 'Advanced techniques', 'Industry best practices', 'Portfolio projects'].map(item => (
                           <li key={item} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>
                              <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0 }} /> {item}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0d2046', marginBottom: '1.5rem' }}>Curriculum Schedule</h3>
                {curriculum.map((item: any, idx: number) => (
                   <div 
                      key={idx} 
                      onClick={() => isEnrolled && navigate(`/courses/${id}/play`)}
                      style={{ 
                        background: 'white', 
                        padding: '1.5rem 2rem', 
                        borderRadius: '1.25rem', 
                        border: '1px solid #f1f5f9', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: isEnrolled ? 'pointer' : 'default',
                        transition: 'all 0.2s'
                      }}
                   >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                         <span style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.875rem' }}>{idx + 1}</span>
                         <div>
                            <h5 style={{ fontWeight: 800, color: '#334155' }}>{item.title}</h5>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Lesson {idx + 1} • {item.duration}</p>
                         </div>
                      </div>
                      <ChevronRight size={20} color={isEnrolled ? 'var(--primary)' : "#cbd5e1"} />
                   </div>
                ))}
         </div>

         {/* Right Side: Instructor and Action */}
         <div>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', position: 'sticky', top: '2rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '1rem', backgroundColor: '#0d2046', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.5rem' }}>
                     {course.instructor ? course.instructor.charAt(0) : 'I'}
                  </div>
                  <div>
                     <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Expert Instructor</p>
                     <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0d2046' }}>{course.instructor || "NeST Expert"}</h4>
                  </div>
               </div>

               <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                     <span style={{ fontWeight: 800, color: '#1e293b' }}>Course Price</span>
                     <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>Free for Alumni</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Exclusively available to verified NeST graduates.</p>
               </div>

               <button 
                  onClick={isEnrolled ? () => navigate(`/courses/${id}/play`) : handleEnroll}
                  disabled={enrolling}
                  style={{ 
                    width: '100%', 
                    padding: '1.25rem', 
                    backgroundColor: 'var(--primary)', 
                    color: 'white', 
                    fontWeight: 900, 
                    borderRadius: '1rem', 
                    marginBottom: '1.5rem', 
                    fontSize: '1.1rem', 
                    boxShadow: '0 10px 20px rgba(200,16,46,0.2)', 
                    cursor: enrolling ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: enrolling ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(200,16,46,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(200,16,46,0.2)'; }}
               >
                  {enrolling ? 'Enrolling...' : isEnrolled ? 'Start Learning' : 'Enroll This Course'}
               </button>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
                     <Award size={18} color="var(--primary)" /> {course.certification || 'Professional Certificate'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
                     <User size={18} color="var(--primary)" /> One-on-one Mentorship
                  </div>
               </div>
            </div>
         </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
       <StatusModal 
         isOpen={modalConfig.isOpen}
         onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
         type={modalConfig.type}
         title={modalConfig.title}
         message={modalConfig.message}
         confirmText="Okay"
       />
    </div>
  );
};

export default CourseDetails;
