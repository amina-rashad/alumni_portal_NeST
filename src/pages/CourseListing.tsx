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
import CorporateBackground from '../components/CorporateBackground';
import weightlessVelvet from '../assets/weightless_velvet.png';
 
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
      style={{ maxWidth: '100%', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}
    >
      {/* Featured Header - "Weightless Velvet Flow" Luxury Background */}
      <div style={{
        position: 'relative',
        width: '100%',
        marginBottom: '4rem',
        minHeight: '650px',
        display: 'flex',
        alignItems: 'center',
        background: '#020307',
        marginTop: 0,
        overflow: 'hidden'
      }}>
        {/* Weightless Velvet Animation Layer */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 1, -1, 0],
            x: [0, 10, -10, 0],
            y: [0, -10, 10, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            inset: '-10%',
            backgroundImage: `url(${weightlessVelvet})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7) saturate(1.2)',
            zIndex: 1
          }}
        />

        {/* Liquid Lighting Overlays */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 30% 30%, rgba(30, 79, 160, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(200, 16, 46, 0.05) 0%, transparent 50%)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />
        
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to bottom, rgba(2, 3, 7, 0.4) 0%, rgba(2, 3, 7, 0.8) 100%)',
          zIndex: 3 
        }} />
       
        {/* Overlay content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', textAlign: 'center' }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{ fontSize: '4.5rem', fontWeight: 300, color: '#ffffff', marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: '1.1', fontFamily: '"Inter", sans-serif' }}
          >
            Accelerate Your <span style={{ fontWeight: 600, color: '#1E4FA0', textShadow: '0 0 30px rgba(30, 79, 160, 0.4)' }}>Professional</span> Growth
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ color: '#cbd5e1', fontSize: '1.35rem', lineHeight: '1.6', fontWeight: 400, maxWidth: '700px' }}
          >
            NeST Academy helps you build in-demand skills fast and advance your career with premium immersive learning.
          </motion.p>
        </div>
      </div>
 
      {/* Main Content Container */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 4rem' }}>
     
        {/* Featured Paths Cards removed for a cleaner catalog view */}
 
        {/* Section Heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'rgba(30, 79, 160, 0.1)', border: '1px solid rgba(30, 79, 160, 0.2)', padding: '10px', borderRadius: '14px', display: 'flex' }}>
            <BookOpen size={22} color="#1E4FA0" />
          </div>
          <h2 style={{ 
            margin: 0, 
            fontSize: '2.4rem', 
            fontWeight: 400, 
            color: '#0d2046', 
            letterSpacing: '0.02em', 
            fontFamily: '"Outfit", sans-serif' 
          }}>
            Featured Categories
          </h2>
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
 
              {/* NeST Pro Learning banner removed */}
            </React.Fragment>
          ))}
        </div>
      )}
 
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      </div>
    </motion.div>
  );
};
 
export default CourseListing;
 
 