import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, MoreVertical, 
  BookOpen, Users, Clock, Edit3, Trash2,
  ChevronDown, ExternalLink, Star, TrendingUp,
  AlertCircle, Loader2, Info, ArrowUpRight, Power,
  X, CheckCircle2, Link as LinkIcon, Award, UserCheck, Layers,
  Calendar, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { courseManagerAPI } from '../../services/api';
import UserAvatar from '../../components/UserAvatar';
import { formatDateTime } from '../../utils/dateUtils';

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

const formatDuration = (d: any) => {
  if (!d) return 'Flexible';
  const s = String(d).trim();
  if (/^\d+$/.test(s)) return `${s} Weeks`;
  return s;
};

const formatParticipantDateTime = (val?: string | null) => {
  if (!val) return 'Active';
  if (val === 'Today' || val === 'Yesterday' || val === 'Just now' || val === 'Recently') {
    return formatDateTime(new Date());
  }
  return formatDateTime(val);
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
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any | null>(null);
  const [selectedCourseForParticipants, setSelectedCourseForParticipants] = useState<any | null>(null);
  const [courseParticipants, setCourseParticipants] = useState<any[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
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

  const handleToggleCourseActive = async (course: any) => {
    const isCurrentlyActive = course.is_active !== false && course.status?.toLowerCase() !== 'inactive';
    const newActiveState = !isCurrentlyActive;
    try {
      await courseManagerAPI.updateCourse(course.id, {
        is_active: newActiveState,
        status: newActiveState ? 'active' : 'inactive'
      });
      setCourses(prev => prev.map(c => c.id === course.id ? { 
        ...c, 
        is_active: newActiveState, 
        status: newActiveState ? 'active' : 'inactive' 
      } : c));
      setMenuOpenId(null);
    } catch (err) {
      alert('Failed to update course status');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this course? This action is permanent and cannot be undone.')) {
      try {
        const res = await courseManagerAPI.deleteCourse(id);
        if (res.success) {
          setCourses(prev => prev.filter(c => (c.id ?? c._id)?.toString() !== id.toString()));
          setMenuOpenId(null);
        } else {
          alert(res.message || 'Failed to delete course');
        }
      } catch (err) {
        alert('Failed to delete course');
      }
    }
  };

  const handleOpenParticipants = async (course: any) => {
    setSelectedCourseForParticipants(course);
    setParticipantSearch('');
    setIsLoadingParticipants(true);
    try {
      const courseId = course.id ?? course._id;
      const res = await courseManagerAPI.getCourseParticipants(courseId);
      if (res.data?.participants) {
        setCourseParticipants(res.data.participants);
      } else {
        const allRes = await courseManagerAPI.fetchStudents();
        const filtered = (allRes.data?.students || []).filter(
          (s: any) => (s.course || '').toLowerCase() === (course.title || '').toLowerCase()
        );
        setCourseParticipants(filtered);
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
      try {
        const allRes = await courseManagerAPI.fetchStudents();
        const filtered = (allRes.data?.students || []).filter(
          (s: any) => (s.course || '').toLowerCase() === (course.title || '').toLowerCase()
        );
        setCourseParticipants(filtered);
      } catch {
        setCourseParticipants([]);
      }
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontFamily: "'Inter', sans-serif" }}>
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
          ) : filteredCourses.map((course) => {
            const isActive = course.is_active !== false && course.status?.toLowerCase() !== 'inactive';
            return (
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
                <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    padding: '6px 12px', 
                    borderRadius: '10px', 
                    background: isActive ? '#ecfdf5' : '#fef2f2',
                    border: `1px solid ${isActive ? '#a7f3d0' : '#fecaca'}`,
                    color: isActive ? '#059669' : '#dc2626',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {isActive ? '● ACTIVE' : '○ INACTIVE'}
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
                        style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', padding: '8px', zIndex: 10, width: '220px', marginTop: '8px' }}
                      >
                        <button 
                          onClick={() => {
                            setMenuOpenId(null);
                            handleOpenParticipants(course);
                          }} 
                          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'none', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: brandPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                          <Users size={16} color={brandPrimary} /> View Participants & Progress
                        </button>
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
                      <Clock size={14} /> {formatDuration(course.duration)}
                    </div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenParticipants(course);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', color: brandPrimary, fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s ease' }}
                      title="Click to view enrolled participants & progress"
                      className="learners-chip"
                    >
                      <Users size={14} color={brandPrimary} /> {course.enrolled_count?.toLocaleString() || 0} Learners
                    </div>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>{course.title}</h3>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                </div>

                {(() => {
                  const healthPercent = !isActive 
                    ? 0 
                    : (course.health_percent !== undefined 
                        ? course.health_percent 
                        : (course.avg_progress !== undefined 
                            ? course.avg_progress 
                            : (course.enrolled_count > 0 ? 50 : 0)));
                  return (
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '20px', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: brandPrimary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Course Health</span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: !isActive ? '#dc2626' : (healthPercent > 0 ? '#10b981' : '#94a3b8') }}>
                          {!isActive ? 'Inactive' : `${healthPercent}% Active`}
                        </span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${healthPercent}%`, background: !isActive ? '#cbd5e1' : brandPrimary, borderRadius: '3px', transition: 'width 0.4s ease' }}></div>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleOpenParticipants(course)}
                    className="view-participants-btn"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: '1px solid #c7d2fe',
                      background: '#eff6ff',
                      color: brandPrimary,
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 8px rgba(35, 49, 103, 0.05)'
                    }}
                  >
                    <Users size={16} color={brandPrimary} />
                    View Enrolled Participants ({course.enrolled_count?.toLocaleString() || 0})
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleToggleCourseActive(course)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '16px',
                        border: `1px solid ${isActive ? '#fecaca' : '#a7f3d0'}`,
                        background: isActive ? '#fff5f5' : '#f0fdf4',
                        color: isActive ? '#dc2626' : '#16a34a',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Power size={16} /> {isActive ? 'Turn Inactive' : 'Turn Active'}
                    </button>
                    <button 
                      onClick={() => setSelectedCourseDetails(course)}
                      style={{
                        flex: 1.2,
                        padding: '12px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        color: brandPrimary,
                        fontWeight: 800,
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
                        e.currentTarget.style.color = brandPrimary;
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      Details <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
          })}
        </AnimatePresence>
      </div>

      {/* Interactive Course Details Modal */}
      <AnimatePresence>
        {selectedCourseDetails && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(6px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
            onClick={() => setSelectedCourseDetails(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '32px',
                width: '100%',
                maxWidth: '780px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#0d2046', color: '#fff' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                      {selectedCourseDetails.level || 'Standard Track'}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      background: selectedCourseDetails.is_active !== false && selectedCourseDetails.status?.toLowerCase() !== 'inactive' ? '#059669' : '#dc2626', 
                      color: '#fff' 
                    }}>
                      {selectedCourseDetails.is_active !== false && selectedCourseDetails.status?.toLowerCase() !== 'inactive' ? 'Active' : 'Inactive'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {selectedCourseDetails.duration || 'Flexible'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} />
                      {selectedCourseDetails.enrolled_count || 0} Learners
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#fff', lineHeight: 1.3 }}>
                    {selectedCourseDetails.title}
                  </h2>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
                    Complete course overview, instructor specifications, resources & curriculum
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCourseDetails(null)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '28px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Course Banner Cover if exists */}
                {selectedCourseDetails.cover_image && (
                  <div style={{ width: '100%', height: '180px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                    <img 
                      src={selectedCourseDetails.cover_image} 
                      alt={selectedCourseDetails.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                )}

                {/* Course Description */}
                <div style={{ background: '#f8fafc', padding: '18px 22px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14} color="#64748b" /> Course Description & Overview
                  </div>
                  <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, fontWeight: 500, whiteSpace: 'pre-line' }}>
                    {selectedCourseDetails.description || 'No description entered for this course.'}
                  </div>
                </div>

                {/* Course Specification Cards */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: '0 0 12px 0' }}>Course Specifications</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Duration</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color={brandPrimary} />
                        {formatDuration(selectedCourseDetails.duration)}
                      </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Skill Level</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={16} color={brandPrimary} />
                        {selectedCourseDetails.level || 'Beginner Friendly'}
                      </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Instructor / Lead</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={16} color={brandPrimary} />
                        {selectedCourseDetails.instructor || 'Lead Technical Trainer'}
                      </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Certification Track</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={16} color="#059669" />
                        {selectedCourseDetails.certification || 'Verified NeST Certificate'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Reference Links (Added when course was created) */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LinkIcon size={16} color={brandPrimary} /> Reference Links & Resources
                  </h4>
                  {Array.isArray(selectedCourseDetails.links) && selectedCourseDetails.links.filter(Boolean).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedCourseDetails.links.filter(Boolean).map((linkUrl: string, idx: number) => (
                        <a
                          key={idx}
                          href={linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            textDecoration: 'none',
                            color: brandPrimary,
                            fontWeight: 700,
                            fontSize: '13px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#eff6ff';
                            e.currentTarget.style.borderColor = '#bfdbfe';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>
                            {linkUrl}
                          </span>
                          <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
                      No reference links were provided during course creation.
                    </div>
                  )}
                </div>

                {/* Curriculum Modules & Lessons */}
                {(() => {
                  const lessons = Array.isArray(selectedCourseDetails.curriculum) && selectedCourseDetails.curriculum.length > 0
                    ? selectedCourseDetails.curriculum
                    : (Array.isArray(selectedCourseDetails.modules) && selectedCourseDetails.modules.length > 0
                        ? selectedCourseDetails.modules
                        : []);

                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Curriculum & Syllabus Modules</h4>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                          {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
                        </span>
                      </div>

                      {lessons.length === 0 ? (
                        <div style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
                          No curriculum modules configured for this course.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {lessons.map((lesson: any, idx: number) => (
                            <div 
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 18px',
                                background: '#fff',
                                borderRadius: '14px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', color: '#0d2046', border: '1px solid #e2e8f0' }}>
                                  {idx + 1}
                                </span>
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                                    {lesson.title || lesson.name || `Lesson ${idx + 1}`}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                                    <span>Lesson {idx + 1}</span>
                                    {lesson.duration && (
                                      <>
                                        <span>•</span>
                                        <span>{lesson.duration}</span>
                                      </>
                                    )}
                                    {lesson.type && (
                                      <>
                                        <span>•</span>
                                        <span style={{ color: '#c8102e', fontWeight: 800 }}>{lesson.type}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Key Learning Outcomes if available */}
                {selectedCourseDetails.outcomes && selectedCourseDetails.outcomes.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: '0 0 12px 0' }}>Core Learning Outcomes</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                      {selectedCourseDetails.outcomes.map((item: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                          <CheckCircle2 size={16} color="#10b981" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '18px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedCourseDetails(null)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      const id = selectedCourseDetails.id;
                      setSelectedCourseDetails(null);
                      navigate(`/course-manager/courses/edit/${id}`);
                    }}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      color: '#1e293b',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Edit3 size={15} /> Edit Course
                  </button>
                  <button
                    onClick={() => {
                      const id = selectedCourseDetails.id;
                      setSelectedCourseDetails(null);
                      navigate(`/course-manager/courses/${id}`);
                    }}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '14px',
                      border: 'none',
                      background: brandPrimary,
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(35, 49, 103, 0.25)'
                    }}
                  >
                    Open Full Page <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ── Course Participants & Progress Modal ── */}
      <AnimatePresence>
        {selectedCourseForParticipants && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(6px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
            onClick={() => setSelectedCourseForParticipants(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '32px',
                width: '100%',
                maxWidth: '740px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '24px 32px',
                background: 'linear-gradient(135deg, #233167 0%, #1e4bb8 100%)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '14px', display: 'flex' }}>
                    <Users size={24} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Enrolled Participants</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                      Course: {selectedCourseForParticipants.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCourseForParticipants(null)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: '12px',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  <X size={18} />
                </button>
              </div>

              {/* KPI Strip */}
              <div style={{
                padding: '16px 32px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Enrolled Learners</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>
                    {courseParticipants.length}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Completed Learners</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                    {courseParticipants.filter(p => p.status === 'Completed' || p.progress >= 100).length}
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div style={{ padding: '16px 32px 8px 32px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Search enrolled participants by name or email..."
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 40px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none',
                      color: '#1e293b',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Participants List */}
              <div style={{ padding: '16px 32px 24px 32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isLoadingParticipants ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} style={{ height: '70px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }} className="skeleton-pulse"></div>
                  ))
                ) : courseParticipants.filter(p => {
                  if (!participantSearch.trim()) return true;
                  const q = participantSearch.toLowerCase();
                  return (p.name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
                }).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid #e2e8f0' }}>
                      <Users size={28} color="#94a3b8" />
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
                      {participantSearch ? 'No matching participants found' : 'No Participants Enrolled Yet'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                      {participantSearch ? 'Try a different search term.' : 'Learners enrolled in this course will appear here.'}
                    </p>
                  </div>
                ) : (
                  courseParticipants
                    .filter(p => {
                      if (!participantSearch.trim()) return true;
                      const q = participantSearch.toLowerCase();
                      return (p.name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
                    })
                    .map((p) => (
                      <div
                        key={p.id || p.studentId}
                        style={{
                          background: '#fff',
                          borderRadius: '18px',
                          border: '1px solid #e2e8f0',
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Learner Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                          <UserAvatar
                            src={p.profile_picture}
                            name={p.name}
                            status={p.role !== 'admin' ? 'open_to_work' : undefined}
                            size={42}
                            bgColor="#c8102e"
                          />
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {p.name}
                              <span style={{ fontSize: '9px', color: '#16a34a', fontWeight: 900, background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.3px' }}>ENROLLED</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{p.email}</div>
                          </div>
                        </div>

                        {/* Phase & Date and Time */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', minWidth: '180px', textAlign: 'right' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', 
                            background: p.status === 'Completed' ? '#ecfdf5' : p.status === 'Assessment' ? '#fff7ed' : '#eff6ff',
                            color: p.status === 'Completed' ? '#10b981' : p.status === 'Assessment' ? '#f59e0b' : '#3b82f6',
                            border: `1px solid ${p.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : p.status === 'Assessment' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                          }}>
                            {p.status}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={13} color="#94a3b8" /> {formatParticipantDateTime(p.completedDate || p.completed_at || p.lastActive || p.enrolledDate || p.enrolled_at)}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 32px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    const title = selectedCourseForParticipants.title;
                    setSelectedCourseForParticipants(null);
                    navigate(`/course-manager/students?course=${encodeURIComponent(title)}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: brandPrimary,
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowUpRight size={15} /> Open in Learner Directory
                </button>

                <button
                  onClick={() => setSelectedCourseForParticipants(null)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: brandPrimary,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .view-participants-btn:hover {
          background: #dbeafe !important;
          border-color: #93c5fd !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(35, 49, 103, 0.12) !important;
        }
        .learners-chip:hover {
          text-decoration: underline;
          transform: scale(1.05);
        }
        .skeleton-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
};

export default CM_Courses;

