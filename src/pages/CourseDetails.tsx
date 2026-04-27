import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, Star, 
  Award, PlayCircle, CheckCircle2, 
  ChevronRight, Calendar, User, Globe
} from 'lucide-react';
import { coursesApi } from '../services/api';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      console.log('Fetching course with ID:', id);

      const MOCK_DATA = [
        { id: '1', title: 'Advanced Cloud Architecture & DevOps', instructor: 'Dr. Rajesh Nair', level: 'Advanced', duration: '36 Hours', description: 'Master industry-standard cloud engineering and DevOps practices.' },
        { id: '2', title: 'Full Stack Development with React & Node', instructor: 'Priya Sharma', level: 'Intermediate', duration: '48 Hours', description: 'Build modern, scalable web applications from scratch.' },
        { id: '3', title: 'Data Science & Machine Learning Essentials', instructor: 'Dr. Arun Menon', level: 'Beginner', duration: '30 Hours', description: 'Begin your journey into data analysis and machine learning.' },
        { id: '4', title: 'Cybersecurity Fundamentals & Ethical Hacking', instructor: 'Karthik Iyer', level: 'Intermediate', duration: '42 Hours', description: 'Learn to protect systems and understand ethical hacking.' },
        { id: '5', title: 'AI-Powered Product Management', instructor: 'Sneha George', level: 'Advanced', duration: '28 Hours', description: 'Leverage AI to build and manage world-class products.' },
        { id: '6', title: 'System Design & Scalable Architecture', instructor: 'Dr. Vikram Das', level: 'Advanced', duration: '40 Hours', description: 'Design complex, distributed systems that scale to millions.' }
      ];

      const mockMatch = MOCK_DATA.find(c => c.id === String(id));
      if (mockMatch) {
        console.log('Found mock match:', mockMatch);
        setCourse(mockMatch);
        setLoading(false);
        return;
      }

      try {
        const res = await coursesApi.getCourseById(id);
        const data = res.data as any;
        if (res.success && data && data.course) {
          setCourse(data.course);
        }
      } catch (err) {
        console.error('Failed to fetch course details from API:', err);
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

  const curriculum = [
    { title: 'Introduction to Core Concepts', duration: '45m' },
    { title: 'Foundational Principles & Theory', duration: '1h 20m' },
    { title: 'Hands-on Implementation Part I', duration: '2h 15m' },
    { title: 'Advanced Scalability & Architecture', duration: '3h 10m' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '5rem', overflowX: 'hidden', fontFamily: '"Inter", sans-serif', margin: '-28px -32px 0 -32px' }}>
      {/* Dynamic Header / Hero Area */}
      <div style={{ backgroundColor: '#0d2046', color: 'white', padding: '4rem 2rem 6rem 2rem', position: 'relative' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>


            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
               <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                     <span style={{ backgroundColor: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>{course.level}</span>
                     <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={14} fill="var(--primary)" color="var(--primary)" /> 4.9 (240 Ratings)
                     </span>
                  </div>
                  <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-0.02em' }}>{course.title}</h1>
                  <p style={{ fontSize: '1.25rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '600px' }}>{course.description || "Master industry-standard engineering practices and lead with expertise."}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Clock size={20} color="var(--primary)" />
                        <div>
                           <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Duration</p>
                           <p style={{ fontWeight: 800 }}>{course.duration || "24 Hours"}</p>
                        </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calendar size={20} color="var(--primary)" />
                        <div>
                           <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Start Date</p>
                           <p style={{ fontWeight: 800 }}>On Demand</p>
                        </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Globe size={20} color="var(--primary)" />
                        <div>
                           <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Enrolled</p>
                           <p style={{ fontWeight: 800 }}>2.4k Students</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative' }}>
                  <div style={{ background: 'linear-gradient(135deg, rgba(200,16,46,0.3) 0%, rgba(255,255,255,0.1) 100%)', borderRadius: '2rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                     <div style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden' }}>
                        <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop" alt={course.title} style={{ width: '100%', display: 'block' }} />
                        <Link to={`/courses/${id}/play`} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,32,70,0.4)', cursor: 'pointer' }}>
                           <PlayCircle size={80} color="white" />
                        </Link>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ maxWidth: '1200px', margin: '-4rem auto 0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '3rem' }}>
         {/* Left Side: Learning and Info */}
         <div>
            <div style={{ background: 'white', padding: '3rem', borderRadius: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', marginBottom: '3rem', position: 'relative', zIndex: 2 }}>
               <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0d2046', marginBottom: '1.5rem' }}>Course Overview</h3>
               <p style={{ color: '#1e293b', lineHeight: '1.8', fontSize: '1.05rem' }}>
                  This comprehensive course is designed for professionals looking to master the intricacies of {course.title}. 
                  Our industry-expert instructors provide a blend of theoretical foundation and hands-on practical exercises.
               </p>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
                  <div>
                     <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0d2046', marginBottom: '1.25rem' }}>What You'll Learn</h4>
                     <ul style={{ listStyle: 'none', padding: 0 }}>
                        {['Deep dive foundations', 'Advanced techniques', 'Industry best practices', 'Portfolio projects'].map(item => (
                           <li key={item} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', color: '#1e293b', fontSize: '0.95rem', fontWeight: 600 }}>
                              <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0 }} /> {item}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0d2046', marginBottom: '1.5rem' }}>Curriculum Schedule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {curriculum.map((item, idx) => (
                  <div key={idx} style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.875rem', color: '#0d2046' }}>{idx + 1}</span>
                        <div>
                           <h5 style={{ fontWeight: 800, color: '#334155' }}>{item.title}</h5>
                           <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Lesson {idx + 1} • {item.duration}</p>
                        </div>
                     </div>
                     <ChevronRight size={20} color="#cbd5e1" />
                  </div>
               ))}
            </div>
         </div>

         {/* Right Side: Instructor and Action */}
         <div>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '2.4rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', border: '1px solid #f1f5f9', position: 'sticky', top: '2rem', zIndex: 10 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '1.2rem', backgroundColor: '#0d2046', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.75rem', boxShadow: '0 10px 15px -3px rgba(13, 32, 70, 0.3)' }}>
                     {course.instructor ? course.instructor.charAt(0) : 'I'}
                  </div>
                  <div>
                     <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c8102e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Expert Instructor</p>
                     <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0d2046', margin: 0 }}>{course.instructor || "Sarah Jenkins"}</h4>
                  </div>
               </div>

               <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'baseline' }}>
                     <span style={{ fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>Course Price</span>
                     <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#c8102e', display: 'block', lineHeight: 1 }}>Free</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c8102e', opacity: 0.8 }}>for Alumni</span>
                     </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>Exclusively available to verified NeST graduates as part of our lifelong learning commitment.</p>
               </div>

               <button 
                  onClick={() => navigate(`/courses/${id}/play`)}
                  style={{ 
                    width: '100%', 
                    padding: '1.4rem', 
                    backgroundColor: '#c8102e', 
                    color: 'white', 
                    fontWeight: 900, 
                    borderRadius: '1.2rem', 
                    marginBottom: '2rem', 
                    fontSize: '1.15rem', 
                    boxShadow: '0 15px 25px -5px rgba(200, 16, 46, 0.4)', 
                    cursor: 'pointer', 
                    border: 'none',
                    transition: 'transform 0.2s, background-color 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#a00d25'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#c8102e'; e.currentTarget.style.transform = 'translateY(0)'; }}
               >
                  Enroll This Course
               </button>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>
                     <div style={{ color: '#c8102e' }}><Award size={20} /></div> Professional Certificate
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>
                     <div style={{ color: '#c8102e' }}><User size={20} /></div> One-on-one Mentorship
                  </div>
               </div>
            </div>
         </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CourseDetails;
