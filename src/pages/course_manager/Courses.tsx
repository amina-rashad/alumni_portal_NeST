import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, MoreVertical, 
  BookOpen, Users, Clock, Edit3, Trash2,
  ChevronDown, ExternalLink, Star, TrendingUp,
  AlertCircle, Loader2, Info, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { courseManagerAPI } from '../../services/api';

const GlassSelect: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const brandPrimary = '#c8102e';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }} ref={dropdownRef}>
      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          padding: '12px 16px', 
          borderRadius: '14px', 
          border: '1px solid #e2e8f0', 
          background: '#fff', 
          fontSize: '14px', 
          width: '100%', 
          color: '#1e293b', 
          fontWeight: 700, 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}
      >
        {value}
        <ChevronDown size={14} color="#94a3b8" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '105%', 
          left: 0, 
          right: 0, 
          zIndex: 100, 
          background: '#fff', 
          borderRadius: '14px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          padding: '6px'
        }}>
          {options.map((opt) => (
            <div 
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{ 
                padding: '10px 14px', 
                fontSize: '13px', 
                fontWeight: 600, 
                color: value === opt ? brandPrimary : '#475569',
                background: value === opt ? 'rgba(200, 16, 46, 0.05)' : 'transparent',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CM_Courses: React.FC = () => {
  const navigate = useNavigate();
  const brandPrimary = '#233167';
  
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState('All Levels');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const response = await courseManagerAPI.fetchCourses();
        setCourses(response.data?.courses || []);
      } catch (err) {
        setError('Failed to load courses.');
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCourses = courses.filter(course => {
    const title = course.title || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = activeLevel === 'All Levels' || 
                       (course.level && course.level.toLowerCase().includes(activeLevel.split(' ')[0].toLowerCase()));
    return matchesSearch && matchesLevel;
  });

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseManagerAPI.deleteCourse(id);
        setCourses(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert('Failed to delete course');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Academic Portfolio</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Strategic oversight and design for all academic courses.</p>
        </div>
        <button 
          onClick={() => navigate('/course-manager/courses/create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 28px',
            borderRadius: '16px',
            background: brandPrimary,
            color: '#fff',
            border: 'none',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(35, 49, 103, 0.2)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={20} /> Create Course
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(35, 49, 103, 0.03)' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '14px 16px 14px 48px', 
              borderRadius: '16px', 
              border: '1px solid #f1f5f9', 
              background: '#f8fafc', 
              fontSize: '14px', 
              width: '100%', 
              outline: 'none',
              fontWeight: 700,
              color: '#1e293b'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '200px' }}>
             <GlassSelect 
               label="Expertise Level" 
               options={['All Levels', 'Beginner Friendly', 'Intermediate Professional', 'Advanced Strategic']} 
               value={activeLevel} 
               onChange={setActiveLevel} 
             />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ height: '400px', background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '24px' }} className="skeleton-pulse">
                <div style={{ height: '200px', width: '100%', borderRadius: '20px', background: '#f1f5f9', marginBottom: '20px' }}></div>
                <div style={{ height: '24px', width: '70%', background: '#f1f5f9', marginBottom: '12px' }}></div>
                <div style={{ height: '16px', width: '40%', background: '#f1f5f9' }}></div>
              </div>
            ))
          ) : filteredCourses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', background: '#f8fafc', borderRadius: '40px', border: '2px dashed #e2e8f0' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid #e2e8f0' }}>
                 <BookOpen size={32} color="#cbd5e1" />
               </div>
               <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px', fontWeight: 800 }}>No Courses Discovered</h3>
               <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 500, maxWidth: '300px', margin: '0 auto' }}>Adjust your filters or initiate a new course creation.</p>
            </div>
          ) : filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }}
              style={{
                background: '#fff',
                borderRadius: '32px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(35, 49, 103, 0.04)'
              }}
            >
              {/* Card Image Header */}
              <div style={{ height: '200px', width: '100%', position: 'relative', background: '#1e1b4b' }}>
                {course.cover_image ? (
                  <img src={course.cover_image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #233167 0%, #1e1b4b 100%)' }}>
                    <BookOpen size={48} color="rgba(255,255,255,0.2)" />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    padding: '6px 12px', 
                    borderRadius: '10px', 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    color: brandPrimary,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {course.level || 'Standard'}
                  </span>
                </div>
                
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === course.id ? null : course.id);
                    }}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.95)', border: 'none', color: brandPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  >
                    <MoreVertical size={18} />
                  </button>
                  <AnimatePresence>
                    {menuOpenId === course.id && (
                      <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', padding: '8px', zIndex: 10, width: '180px', marginTop: '8px' }}
                      >
                        <button onClick={() => navigate(`/course-manager/courses/edit/${course.id}`)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'none', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Edit3 size={16} /> Edit Course
                        </button>
                        <button onClick={() => handleDelete(course.id)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'none', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Trash2 size={16} /> Delete Course
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', fontWeight: 700 }}>
                      <Clock size={14} /> {course.duration}
                    </div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', fontWeight: 700 }}>
                      <Users size={14} /> {course.enrolled_count?.toLocaleString() || 0} Learners
                    </div>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>{course.title}</h3>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '20px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: brandPrimary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Course Health</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>94% Active</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '94%', background: brandPrimary, borderRadius: '3px' }}></div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/course-manager/courses/${course.id}`)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: brandPrimary,
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = brandPrimary;
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = brandPrimary;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = brandPrimary;
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  Manage Curriculum <ArrowUpRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CM_Courses;

