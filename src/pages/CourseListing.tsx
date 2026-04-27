import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Clock, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '../services/api';

const CourseListing: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await coursesApi.getAllCourses();
        const data = res.data as any;
        if (res.success && data && data.courses) {
          setCourses(data.courses);
          setFilteredCourses(data.courses);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
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
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', fontFamily: '"Montserrat", sans-serif' }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: '3rem', textAlign: 'left' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#0d2046', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Upgrade Your <span style={{ color: 'var(--primary)' }}>Future</span>
        </h1>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ 
        background: '#ffffff', 
        padding: '1rem', 
        borderRadius: '1.5rem', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
        border: '1px solid #f1f5f9', 
        marginBottom: '3rem', 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
            <input 
              type="text"
              placeholder="Search courses, instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '1rem 1rem 1rem 3.5rem', 
                backgroundColor: '#f8fafc', 
                border: 'none', 
                borderRadius: '1rem', 
                fontSize: '1rem',
                outline: 'none',
                color: '#1e293b'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {levels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedCategory(level)}
                style={{ 
                  padding: '0.6rem 1.25rem', 
                  borderRadius: '0.75rem', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  backgroundColor: selectedCategory === level ? '#0d2046' : '#ffffff',
                  color: selectedCategory === level ? '#ffffff' : '#64748b',
                  border: selectedCategory === level ? '1px solid #0d2046' : '1px solid #e2e8f0'
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

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
          {filteredCourses.map((course) => (
            <motion.div 
              key={course.id}
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default CourseListing;

