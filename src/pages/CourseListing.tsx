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
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const coursesPerPage = 6;

  const navigate = useNavigate();
 
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await coursesApi.getAllCourses(currentPage, coursesPerPage);
      if (res.success && res.data && res.data.courses) {
        setCourses(res.data.courses);
        setTotalPages(res.data.total_pages || 1);
        setTotalCourses(res.data.total_courses || 0);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage]);
 
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (c.instructor && c.instructor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || 
                           (c.level && c.level.toLowerCase().includes(selectedCategory.split(' ')[0].toLowerCase()));
    return matchesSearch && matchesCategory;
  });
 
  const levels = ['All', 'Beginner Friendly', 'Intermediate Professional', 'Advanced Strategic'];
 
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
                <div style={{ height: '220px', backgroundColor: '#0d2046', position: 'relative', overflow: 'hidden' }}>
                  {course.cover_image ? (
                    <img src={course.cover_image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={120} color="white" />
                    </div>
                  )}
                  {/* Overlay Badges */}
                  <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
                    <span style={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      backdropFilter: 'blur(10px)', 
                      padding: '0.6rem 1.2rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.7rem', 
                      fontWeight: 900, 
                      color: 'white', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em',
                      border: '1px solid rgba(255,255,255,0.2)' 
                    }}>
                      {course.level || 'Standard'}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#eab308' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4].map(i => <Star key={i} size={14} fill="currentColor" />)}
                      <Star size={14} />
                    </div>
                    <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 800 }}>4.9 <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>({course.enrolled_count || 0})</span></span>
                  </div>
                </div>
 
                <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0d2046', margin: 0, lineHeight: 1.2 }}>{course.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || "Master these professional skills with our industry-standard certification program."}
                  </p>

                  {/* Instructor Section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', 
                      fontWeight: 800, fontSize: '0.7rem' 
                    }}>
                      {course.instructor ? course.instructor.split(' ').map((n: any) => n[0]).join('') : 'NE'}
                    </div>
                    <span style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 700 }}>{course.instructor || "NeST Expert"}</span>
                  </div>
                </div>
 
                <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfdfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>
                    <Clock size={16} color="#3b82f6" />
                    <span>{course.duration || '12 Weeks'}</span>
                  </div>
                  <button 
                    style={{ 
                      background: '#3b82f6', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.7rem 1.4rem', 
                      borderRadius: '1rem', 
                      fontWeight: 800, 
                      fontSize: '0.85rem', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
 
              {/* NeST Pro Learning banner removed */}
            </React.Fragment>
          ))}
        </div>
      )}
 
      {!isLoading && totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginTop: '5rem', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1rem',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '24px',
            border: '1px solid rgba(0, 0, 0, 0.03)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            maxWidth: 'fit-content',
            margin: '5rem auto 0'
          }}
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '14px',
              border: '1px solid rgba(0,0,0,0.05)',
              background: currentPage === 1 ? 'transparent' : 'white',
              color: currentPage === 1 ? '#CBD5E1' : '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: currentPage === 1 ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <motion.button
                key={pageNum}
                whileHover={currentPage !== pageNum ? { y: -2 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '14px',
                  background: currentPage === pageNum ? '#0F172A' : 'white',
                  color: currentPage === pageNum ? 'white' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: currentPage === pageNum ? '0 10px 20px rgba(15, 23, 42, 0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
                  border: currentPage === pageNum ? 'none' : '1px solid rgba(0,0,0,0.05)'
                }}
              >
                {pageNum}
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '14px',
              border: '1px solid rgba(0,0,0,0.05)',
              background: currentPage === totalPages ? 'transparent' : 'white',
              color: currentPage === totalPages ? '#CBD5E1' : '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: currentPage === totalPages ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </motion.div>
      )}

      {!isLoading && totalCourses > 0 && (
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>
          Showing {(currentPage - 1) * coursesPerPage + 1} to {Math.min(currentPage * coursesPerPage, totalCourses)} of {totalCourses} courses
        </p>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      </div>
    </motion.div>
  );
};
 
export default CourseListing;
 
 