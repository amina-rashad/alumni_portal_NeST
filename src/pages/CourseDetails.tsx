import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, Star, 
  Award, PlayCircle, CheckCircle2, 
  ChevronRight, Calendar, User, Globe,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';
import { coursesApi } from '../services/api';
import toast from 'react-hot-toast';

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
        setLoading(true);
        const res = await coursesApi.getCourseById(id);
        if (res.success && res.data && res.data.course) {
          setCourse(res.data.course);
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
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Retrieving Curriculum...</p>
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

  const curriculum = [
    { title: 'Architectural Foundations & Theory', duration: '45m', type: 'Theory' },
    { title: 'Industry Best Practices at NeST', duration: '1h 20m', type: 'Standards' },
    { title: 'Real-world Implementation Lab', duration: '2h 15m', type: 'Practical' },
    { title: 'Scalability & Performance Tuning', duration: '3h 10m', type: 'Advanced' },
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
                </div>
                <div className="absolute top-8 right-8 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Preview Video
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
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Earn an industry-recognized certification verified on the NeST Blockchain network upon successful completion of all assessments.
                  </p>
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
                    </div>
                    <ChevronRight size={20} className="text-slate-200 group-hover:text-[#1a2652] transition-colors" />
                  </motion.div>
                ))}
              </div>
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
      </div>
    </div>
  );
};

export default CourseDetails;
