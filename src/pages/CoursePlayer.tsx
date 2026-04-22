import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, PlayCircle, CheckCircle2, 
  ChevronRight, BookOpen, Clock, 
  Menu, X, Award, ChevronLeft
} from 'lucide-react';
import { coursesApi } from '../services/api';

const CoursePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        console.error('Failed to fetch course:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleProgressUpdate = async (newIndex: number) => {
    setActiveModuleIndex(newIndex);
    if (id && course?.modules?.length > 0) {
      const progress = Math.round(((newIndex + 1) / course.modules.length) * 100);
      try {
        await coursesApi.updateProgress(id, progress);
      } catch (err) {
        console.error('Failed to sync progress:', err);
      }
    }
  };

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

  const modules = course.modules || [];
  const activeModule = modules[activeModuleIndex] || { title: 'No modules available', content: 'This course has no content yet.' };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Sidebar: Module Navigation */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '350px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            style={{ 
              backgroundColor: 'white', 
              borderRight: '1px solid #e2e8f0', 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '4px 0 15px rgba(0,0,0,0.02)',
              zIndex: 10
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0d2046', marginBottom: '0.25rem' }}>Course Content</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{modules.length} Modules Total</p>
               </div>
               <button onClick={() => setSidebarOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={20} />
               </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
               {modules.map((m: any, idx: number) => (
                  <div 
                    key={idx}
                    onClick={() => handleProgressUpdate(idx)}
                    style={{ 
                      padding: '1.25rem', 
                      borderRadius: '1rem', 
                      marginBottom: '0.75rem',
                      cursor: 'pointer',
                      backgroundColor: activeModuleIndex === idx ? '#f1f5f9' : 'transparent',
                      border: activeModuleIndex === idx ? '1px solid #e2e8f0' : '1px solid transparent',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: '1rem'
                    }}
                  >
                     <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: activeModuleIndex === idx ? 'var(--primary)' : '#f1f5f9',
                        color: activeModuleIndex === idx ? 'white' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        flexShrink: 0
                     }}>
                        {activeModuleIndex > idx ? <CheckCircle2 size={16} /> : idx + 1}
                     </div>
                     <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: activeModuleIndex === idx ? '#0d2046' : '#64748b', marginBottom: '0.25rem' }}>{m.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                           <Clock size={12} /> {m.duration || '30m'}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
            
            <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <button 
                  onClick={() => navigate('/assessments/quiz')}
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    backgroundColor: '#0d2046', 
                    color: 'white', 
                    borderRadius: '0.75rem', 
                    border: 'none', 
                    fontWeight: 800, 
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Go to Assessment Center <ChevronRight size={16} />
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Player Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
          
          {/* Top Bar */}
          <div style={{ 
            padding: '1rem 2rem', 
            backgroundColor: 'white', 
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            zIndex: 5
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {!sidebarOpen && (
                  <button onClick={() => setSidebarOpen(true)} style={{ border: 'none', background: '#f1f5f9', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', color: '#0d2046' }}>
                     <Menu size={20} />
                  </button>
                )}
                <Link to={`/courses/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700 }}>
                   <ArrowLeft size={18} /> Back to Course Page
                </Link>
             </div>
             
             <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0d2046', margin: 0 }}>{course.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                   <span>{Math.round(((activeModuleIndex + 1) / modules.length) * 100)}% Completed</span>
                   <div style={{ width: '100px', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${((activeModuleIndex + 1) / modules.length) * 100}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Module Content Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4rem 2rem' }}>
             <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <motion.div
                  key={activeModuleIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                      <BookOpen size={16} /> Module {activeModuleIndex + 1}
                   </div>
                   
                   <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0d2046', marginBottom: '2rem', lineHeight: '1.2' }}>
                      {activeModule.title}
                   </h1>

                   <div style={{ 
                      background: 'white', 
                      padding: '3rem', 
                      borderRadius: '2rem', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.02)', 
                      border: '1px solid #f1f5f9',
                      minHeight: '400px'
                   }}>
                      <div style={{ fontSize: '1.2rem', color: '#334155', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                        {activeModule.content}
                      </div>

                      <div style={{ marginTop: '4rem', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#0d2046', marginBottom: '1rem' }}>
                            <Award size={24} />
                            <h3 style={{ margin: 0, fontWeight: 900 }}>Key Summary</h3>
                         </div>
                         <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                            By the end of this module, you should understand the core principles of {activeModule.title.toLowerCase()} and be ready to apply them in a real-world scenario.
                         </p>
                      </div>
                   </div>

                   {/* Footer Navigation */}
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3rem' }}>
                      <button 
                        disabled={activeModuleIndex === 0}
                        onClick={() => handleProgressUpdate(activeModuleIndex - 1)}
                        style={{ 
                           padding: '0.8rem 1.5rem', 
                           borderRadius: '0.75rem', 
                           border: '1px solid #e2e8f0', 
                           backgroundColor: 'white', 
                           color: '#0d2046', 
                           fontWeight: 800,
                           display: 'flex',
                           alignItems: 'center',
                           gap: '0.5rem',
                           cursor: activeModuleIndex === 0 ? 'default' : 'pointer',
                           opacity: activeModuleIndex === 0 ? 0.3 : 1
                        }}
                      >
                         <ChevronLeft size={20} /> Previous Module
                      </button>

                      <button 
                        onClick={async () => {
                          if (activeModuleIndex < modules.length - 1) {
                            await handleProgressUpdate(activeModuleIndex + 1);
                          } else {
                            await handleProgressUpdate(activeModuleIndex); // Ensure 100%
                            alert('Congratulations! You have completed the course lessons. Redirecting to Assessment Center.');
                            navigate('/assessments/quiz');
                          }
                        }}
                        style={{ 
                           padding: '0.8rem 2rem', 
                           borderRadius: '0.75rem', 
                           border: 'none', 
                           backgroundColor: 'var(--primary)', 
                           color: 'white', 
                           fontWeight: 900,
                           display: 'flex',
                           alignItems: 'center',
                           gap: '0.5rem',
                           cursor: 'pointer',
                           boxShadow: '0 10px 15px rgba(200,16,46,0.15)'
                        }}
                      >
                         {activeModuleIndex < modules.length - 1 ? 'Next Module' : 'Complete Course'} <ChevronRight size={20} />
                      </button>
                   </div>
                </motion.div>
             </div>
          </div>
      </div>
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default CoursePlayer;
