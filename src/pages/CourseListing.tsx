import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Clock, 
  Star, 
  ChevronRight, 
  Filter,
  ArrowUpRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '../services/api';

const CourseListing: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const res = await coursesApi.getAllCourses();
        if (res.success && res.data && res.data.courses) {
          setCourses(res.data.courses);
          setFilteredCourses(res.data.courses);
        }
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || c.level === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredCourses(filtered);
  }, [searchTerm, selectedCategory, courses]);

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem', fontFamily: '"Montserrat", sans-serif' }}
    >
      {/* Featured Addons Section (Udemy Style) */}
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 950, color: '#0d2046', marginBottom: '1.5rem', letterSpacing: '-0.04em', lineHeight: '1.1' }}>
            Master <i style={{ color: 'var(--primary)', fontStyle: 'italic' }}>future-ready</i> skills and shape your path
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', fontWeight: 500 }}>
            Elevate your professional journey with expert-led courses designed to help you stay ahead in today's dynamic landscape.
          </p>
        </div>

        <div style={{ flex: '2 1 600px', display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory' }}>
          {[
            { title: 'Generative AI', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80' },
            { title: 'IT Certifications', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80' },
            { title: 'Data Science', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' }
          ].map((addon, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: idx * 0.15 + 0.3, ease: [0.16, 1, 0.3, 1] }}
              whileHover="hover"
              style={{ 
                flex: '0 0 320px',
                height: '420px',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                scrollSnapAlign: 'start',
                backgroundColor: '#f8fafc'
              }}
            >
              <motion.div
                variants={{ hover: { scale: 1.05 } }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', height: '100%' }}
              >
                <img src={addon.img} alt={addon.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </motion.div>
              
              <motion.div 
                variants={{ hover: { y: -8, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' } }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ 
                  position: 'absolute', 
                  bottom: '1.5rem', 
                  left: '1.5rem', 
                  right: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <span style={{ fontWeight: 800, color: '#0d2046', fontSize: '1.1rem' }}>{addon.title}</span>
                <ChevronRight size={20} color="#0d2046" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '4rem' }}>
        <div style={{ width: '40px', height: '8px', borderRadius: '4px', background: '#c8102e' }}></div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e2e8f0' }}></div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e2e8f0' }}></div>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e2e8f0' }}></div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        {/* Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl p-4 rounded-[32px] border border-white shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row gap-4 items-center mb-16"
        >
          <div className="relative flex-1 group w-full">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a2652] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title, instructor or technology..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 py-4 pl-14 pr-6 rounded-[20px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all text-[#1e293b] placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {levels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedCategory(level)}
                className={`px-6 py-4 rounded-[20px] text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedCategory === level 
                    ? 'bg-[#1a2652] text-white shadow-lg shadow-indigo-900/20' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </motion.div>

      {/* Course Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
           <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2.5rem' 
        }}>
          {filteredCourses.map((course, index) => (
            <React.Fragment key={course.id}>
              <motion.div 
                whileHover={{ y: -10 }}
                style={{ 
                  background: '#ffffff', 
                  borderRadius: '1.5rem', 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
                  border: '1px solid #f1f5f9', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                {/* Card Image Wrapper */}
                <div style={{ position: 'relative', height: '180px', backgroundColor: '#0d2046', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(200,16,46,0.2) 0%, rgba(13,32,70,0.4) 100%)', zIndex: 1 }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                     <BookOpen size={100} color="white" />
                  </div>
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 2 }}>
                     <span style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.65rem', fontWeight: 800, color: '#0d2046', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {course.level}
                     </span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                     <Star size={14} fill="currentColor" />
                     <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>4.9 (240 reviews)</span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d2046', marginBottom: '0.75rem', lineHeight: '1.3' }}>
                    {course.title}
                  </h3>
                  
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || "Master the latest technologies with our comprehensive professional certification course."}
                  </p>

                  <div style={{ borderTop: '1px solid #f8fafc', marginTop: 'auto', paddingTop: '1rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d2046', fontWeight: 700, fontSize: '0.75rem' }}>
                              {course.instructor ? course.instructor.charAt(0) : 'I'}
                           </div>
                           <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{course.instructor || "Expert"}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                           <Clock size={14} />
                           <span>{course.duration || '24h'}</span>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  backgroundColor: '#fafafa', 
                  color: '#0d2046', 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  borderTop: '1px solid #f1f5f9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  View Course <ChevronRight size={16} />
                </div>
              </motion.div>

              {/* In-Between Add-on Banner */}
              {index === 2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{ 
                    gridColumn: '1 / -1', 
                    background: 'linear-gradient(135deg, #0d2046 0%, #1a365d 100%)', 
                    borderRadius: '2rem', 
                    padding: '3rem 4rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    boxShadow: '0 20px 40px rgba(13,32,70,0.15)',
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ position: 'absolute', right: '-10%', top: '-50%', opacity: 0.1 }}>
                    <BookOpen size={400} color="white" />
                  </div>
                  <motion.div 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.15 } }
                    }}
                    style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}
                  >
                    <motion.span 
                      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                      style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      NeST Pro Learning
                    </motion.span>
                    <motion.h2 
                      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                      style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900, marginTop: '1rem', marginBottom: '1rem', lineHeight: '1.2' }}
                    >
                      Unlock unlimited access to 500+ masterclasses.
                    </motion.h2>
                    <motion.p 
                      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                      style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2rem' }}
                    >
                      Upgrade to a premium subscription to accelerate your career.
                    </motion.p>
                    <motion.button 
                      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
                      whileHover={{ scale: 1.05 }}
                      style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '1rem', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      Upgrade Now <ChevronRight size={18} />
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 0', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '2px dashed #e2e8f0' }}>
           <BookOpen className="mx-auto mb-4" style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} size={48} />
           <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d2046' }}>No courses found</h3>
           <p style={{ color: '#64748b' }}>Try adjusting your search or category filters.</p>
        </div>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      </div>
    </motion.div>
  );
};

export default CourseListing;
