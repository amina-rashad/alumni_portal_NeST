import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, 
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
  const brandPrimary = '#c8102e';
  
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState('All Levels');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const response = await courseManagerAPI.fetchCourses();
        setCourses(response.data || []);
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
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = activeLevel === 'All Levels' || course.level === activeLevel;
    return matchesSearch && matchesLevel;
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      // API call would go here
      setCourses(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Course Portfolio</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Strategic oversight of all academic programs and curriculum.</p>
        </div>
        <button 
          onClick={() => navigate('/course-manager/courses/create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '14px',
            background: brandPrimary,
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(200, 16, 46, 0.2)'
          }}
        >
          <Plus size={18} /> Create Program
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search programs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '12px 16px 12px 48px', 
              borderRadius: '14px', 
              border: '1px solid #e2e8f0', 
              background: '#f8fafc', 
              fontSize: '14px', 
              width: '100%', 
              outline: 'none',
              fontWeight: 600
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '180px' }}>
             <GlassSelect 
               label="Difficulty Level" 
               options={['All Levels', 'Beginner', 'Intermediate', 'Advanced']} 
               value={activeLevel} 
               onChange={setActiveLevel} 
             />
          </div>
          <button style={{ padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ height: '300px', background: '#fff', borderRadius: '28px', border: '1px solid #e2e8f0', padding: '24px' }} className="skeleton-pulse">
                <div style={{ height: '40px', width: '40px', borderRadius: '12px', background: '#f1f5f9', marginBottom: '20px' }}></div>
                <div style={{ height: '24px', width: '70%', background: '#f1f5f9', marginBottom: '12px' }}></div>
                <div style={{ height: '16px', width: '40%', background: '#f1f5f9' }}></div>
              </div>
            ))
          ) : filteredCourses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
               <BookOpen size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
               <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 800 }}>No programs found</h3>
               <p style={{ color: '#64748b', fontSize: '14px' }}>Try adjusting your filters or search query.</p>
            </div>
          ) : filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              style={{
                background: '#fff',
                borderRadius: '28px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '16px', 
                  background: 'rgba(200, 16, 46, 0.05)', 
                  color: brandPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOpen size={24} />
                </div>
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setMenuOpenId(menuOpenId === course.id ? null : course.id)}
                    style={{ padding: '8px', borderRadius: '10px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <MoreVertical size={20} />
                  </button>
                  <AnimatePresence>
                    {menuOpenId === course.id && (
                      <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '6px', zIndex: 10, width: '160px' }}
                      >
                        <button onClick={() => navigate(`/course-manager/courses/edit/${course.id}`)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'none', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Edit3 size={14} /> Edit Program
                        </button>
                        <button onClick={() => handleDelete(course.id)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'none', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    padding: '4px 10px', 
                    borderRadius: '8px', 
                    background: course.level === 'Advanced' ? '#fff1f1' : course.level === 'Intermediate' ? '#eff6ff' : '#ecfdf5',
                    color: course.level === 'Advanced' ? '#c8102e' : course.level === 'Intermediate' ? '#3b82f6' : '#10b981'
                  }}>
                    {course.level}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>{course.duration}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>{course.title}</h3>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '20px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                    <Users size={16} /> {course.students?.toLocaleString() || 0} Learners
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: brandPrimary }}>
                    Active
                  </div>
                </div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '65%', background: brandPrimary, borderRadius: '3px' }}></div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/course-manager/courses/${course.id}`)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#1e293b',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = brandPrimary;
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = brandPrimary;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#1e293b';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                Manage Track <ArrowUpRight size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CM_Courses;
