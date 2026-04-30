import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Clock, 
  Star, 
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '../services/api';

const CourseListing: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        console.error('Failed to load courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (c.instructor && c.instructor.toLowerCase().includes(searchTerm.toLowerCase()));
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
      style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem', fontFamily: '"Inter", sans-serif' }}
    >
      {/* Featured Header */}
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0d2046', marginBottom: '1.5rem', letterSpacing: '-0.04em', lineHeight: '1.1' }}>
            Learn <span style={{ color: '#c8102e', fontStyle: 'italic' }}>essential</span> career skills
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', fontWeight: 500 }}>
            NeST Academy helps you build in-demand skills fast and advance your career.
          </p>
        </div>

        <div style={{ flex: '2 1 600px', display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {[
            { title: 'Generative AI', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80' },
            { title: 'IT Certifications', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80' },
            { title: 'Data Science', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' }
          ].map((addon, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{ 
                flex: '0 0 320px',
                height: '420px',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                cursor: 'pointer'
              }}
            >
              <img src={addon.img} alt={addon.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ 
                position: 'absolute', 
                bottom: '1.5rem', 
                left: '1.5rem', 
                right: '1.5rem',
                background: 'white',
                padding: '1.25rem',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 800, color: '#0d2046' }}>{addon.title}</span>
                <ChevronRight size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {levels.map(level => (
            <button
              key={level}
              onClick={() => setSelectedCategory(level)}
              style={{ 
                padding: '0.75rem 1.5rem', 
                borderRadius: '1rem', 
                border: 'none',
                background: selectedCategory === level ? '#0d2046' : '#f1f5f9',
                color: selectedCategory === level ? 'white' : '#64748b',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTop: '3px solid #c8102e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {filteredCourses.map((course, index) => (
            <React.Fragment key={course.id}>
              <motion.div 
                whileHover={{ y: -10 }}
                style={{ 
                  background: 'white', 
                  borderRadius: '1.5rem', 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
                  border: '1px solid #f1f5f9', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div style={{ height: '180px', background: '#0d2046', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                    <BookOpen size={100} color="white" />
                  </div>
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                    <span style={{ background: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.65rem', fontWeight: 800, color: '#0d2046' }}>{course.level}</span>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#eab308' }}>
                    <Star size={14} fill="currentColor" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>4.9 (240)</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0d2046', marginBottom: '0.75rem' }}>{course.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>{course.description || "Master these skills with our professional certification."}</p>
                </div>

                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>{course.instructor || "Expert"}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <Clock size={14} />
                    <span>{course.duration || '24h'}</span>
                  </div>
                </div>
              </motion.div>

              {index === 2 && (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  background: 'linear-gradient(135deg, #0d2046 0%, #1e293b 100%)', 
                  borderRadius: '2rem', 
                  padding: '3rem', 
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '1rem 0'
                }}>
                  <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>NeST Pro Learning</h2>
                    <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>Unlock unlimited access to all masterclasses.</p>
                    <button style={{ background: '#c8102e', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>Upgrade Now</button>
                  </div>
                  <BookOpen size={120} style={{ opacity: 0.1 }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

export default CourseListing;
