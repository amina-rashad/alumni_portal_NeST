import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, HelpCircle, 
  CheckCircle2, Play, Star, Zap, ShieldCheck, 
  ExternalLink, GraduationCap,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { coursesApi } from '../services/api';

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await coursesApi.getMyCourses() as any;
      if (response.success && response.data) {
        // Filter for completed courses (100% progress)
        const courses = response.data.courses || response.data || [];
        const completed = Array.isArray(courses) 
          ? courses.filter((e: any) => (e.enrollment_info?.progress === 100 || e.progress === 100))
          : [];
        setEnrollments(completed);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '5rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.9rem', marginBottom: '1rem' }}>
            <Link to="/dashboard" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                Assessment <span style={{ color: 'var(--primary)' }}>Center</span>
                </h1>
                <p style={{ color: '#64748B', fontSize: '1.1rem', maxWidth: '600px' }}>
                    Showcase your expertise. Only courses you've completed 100% are eligible for the 5-stage certification process.
                </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Eligible Courses</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{enrollments.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
             <div style={{ textAlign: 'center', padding: '5rem' }}>
                <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
                <p style={{ color: '#64748b', fontWeight: 600 }}>Loading eligible assessments...</p>
             </div>
        ) : enrollments.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                    background: '#ffffff', padding: '5rem 2rem', borderRadius: '2rem', textAlign: 'center',
                    border: '1px dashed #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
                }}
            >
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
                    <GraduationCap size={48} color="#94a3b8" />
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>No Eligible Assessments Found</h3>
                <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                    Complete 100% of your enrolled courses to unlock their specialized 5-stage assessments here.
                </p>
                <Link to="/courses" style={{ background: '#0f172a', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    Browse Courses <ExternalLink size={18} />
                </Link>
            </motion.div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                {enrollments.map((enrollment) => (
                    <motion.div
                        key={enrollment.id}
                        whileHover={{ y: -6, boxShadow: '0 30px 60px -12px rgba(0,0,0,0.12)' }}
                        style={{ 
                            background: 'white', borderRadius: '2rem', padding: '2.5rem', 
                            border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, transparent 70%, rgba(200, 16, 46, 0.05) 70%)' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                             <div style={{ background: '#fef2f2', padding: '0.5rem 1rem', borderRadius: '0.75rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                Advanced Academy
                             </div>
                             <div title="Course Completed" style={{ color: '#10b981' }}>
                                <CheckCircle2 size={24} />
                             </div>
                        </div>

                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.3 }}>
                            {enrollment.title}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
                            Validate your expertise through our 5-stage rigorous evaluation including Quiz, Coding, and Scenario rounds.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                             <div style={{ flex: 1, background: '#f8fafc', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>ROUNDS</span>
                                <span style={{ fontWeight: 900, color: '#0f172a' }}>5 Stages</span>
                             </div>
                             <div style={{ flex: 1, background: '#f8fafc', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>AWARD</span>
                                <span style={{ fontWeight: 900, color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    <Sparkles size={14} /> Badge
                                </span>
                             </div>
                        </div>

                        <button
                            onClick={() => navigate(`/assessment/${enrollment.id}`)}
                            style={{ 
                                background: '#0F172A', color: 'white', padding: '1.25rem', 
                                borderRadius: '1rem', border: 'none', fontWeight: 800,
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s'
                            }}
                        >
                            <Play size={18} fill="currentColor" /> Start 5-Stage Assessment
                        </button>
                    </motion.div>
                ))}
            </div>
        )}
      </motion.div>

      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Quiz;
