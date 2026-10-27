import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, CheckCircle2, AlertCircle, 
  BookOpen, ChevronRight, ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { coursesApi } from '../services/api';
import { generateCourseCertificate } from '../utils/CertificateGenerator';

interface AssessmentRecord {
  id: string;
  course_id: string;
  course_title: string;
  assessment_title: string;
  score: number;
  passing_score: number;
  passed: boolean;
  status: string;
  feedback: string;
  correct_count: number;
  total_questions: number;
  date: string;
}

interface PerformanceData {
  level: string;
  grade: string;
  title: string;
  description: string;
  badge_color: string;
  average_score: number;
  assessments_taken: number;
  assessments_passed: number;
  pass_rate: string;
  courses_enrolled: number;
  courses_completed: number;
  completion_rate: string;
}

const PerformanceAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Learner');
  const [performance, setPerformance] = useState<PerformanceData>({
    level: 'Not Evaluated',
    grade: '—',
    title: 'Getting Started',
    description: 'No assessments completed yet.',
    badge_color: '#64748b',
    average_score: 0,
    assessments_taken: 0,
    assessments_passed: 0,
    pass_rate: '0%',
    courses_enrolled: 0,
    courses_completed: 0,
    completion_rate: '0%'
  });
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await coursesApi.getPerformanceAnalytics();

        if (res.success && res.data) {
          const d = res.data as any;
          if (!isMounted) return;

          if (d.user && d.user.name) {
            setUserName(d.user.name);
          }
          if (d.performance) {
            setPerformance(d.performance);
          }
          if (Array.isArray(d.assessments)) {
            setAssessments(d.assessments);
          }
        }
      } catch (err) {
        console.error('Failed to load performance data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <div style={{ width: '44px', height: '44px', border: '4px solid #e2e8f0', borderTop: '4px solid #0d2046', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>Loading performance records...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1rem 5rem', fontFamily: '"Inter", "Montserrat", sans-serif' }}>
      
      {/* ── Top Navigation / Back ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/assessments/quiz')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            borderRadius: '12px',
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={16} /> Back to Quizzes & Assessments
        </button>

        <span style={{
          background: '#f1f5f9',
          color: '#475569',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700
        }}>
          Learner: {userName}
        </span>
      </div>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0d2046', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
          Performance <span style={{ color: '#d32f2f' }}>Level</span>
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '1.05rem', lineHeight: 1.5 }}>
          Official overview of your academic evaluation standing, assessment competency, and course achievements.
        </p>
      </div>

      {/* ── Main Performance Level Hero Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, #0d2046 0%, #1e3a8a 100%)',
          borderRadius: '1.75rem',
          padding: '2.5rem',
          color: 'white',
          marginBottom: '2.5rem',
          boxShadow: '0 12px 30px rgba(13, 32, 70, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 2 }}>
          
          <div style={{ maxWidth: '580px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '6px 14px', borderRadius: '20px', marginBottom: '1rem', backdropFilter: 'blur(8px)' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: performance.badge_color || '#10b981',
                boxShadow: `0 0 8px ${performance.badge_color || '#10b981'}`
              }} />
              <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Performance Level: {performance.level}
              </span>
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.75rem 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
              {performance.title}
            </h2>

            <p style={{ margin: 0, fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              {performance.description}
            </p>
          </div>

          {/* Performance Grade Circle */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#93c5fd', marginBottom: '2px' }}>
              GRADE
            </span>
            <span style={{ fontSize: '3.2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
              {performance.grade}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', marginTop: '4px' }}>
              {performance.average_score}% Avg
            </span>
          </div>

        </div>

        {/* Ambient background accent */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          bottom: '-50px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
      </motion.div>

      {/* ── Key Performance Metrics Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem'
      }}>
        
        {/* Metric 1: Average Score */}
        <div style={{
          background: '#ffffff',
          padding: '1.75rem',
          borderRadius: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Average Assessment Score
          </span>
          <p style={{
            margin: '8px 0 4px 0',
            fontSize: '2.2rem',
            fontWeight: 900,
            color: performance.average_score >= 75 ? '#16a34a' : (performance.average_score > 0 ? '#0d2046' : '#64748b')
          }}>
            {performance.average_score}%
          </p>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            {performance.assessments_taken > 0 ? 'Across evaluated assessments' : 'No assessments taken yet'}
          </span>
        </div>

        {/* Metric 2: Assessments Passed */}
        <div style={{
          background: '#ffffff',
          padding: '1.75rem',
          borderRadius: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Assessments Passed
          </span>
          <p style={{ margin: '8px 0 4px 0', fontSize: '2.2rem', fontWeight: 900, color: '#0d2046' }}>
            {performance.assessments_passed} / {performance.assessments_taken}
          </p>
          <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 700 }}>
            {performance.pass_rate} Pass Rate
          </span>
        </div>

        {/* Metric 3: Completed Courses */}
        <div style={{
          background: '#ffffff',
          padding: '1.75rem',
          borderRadius: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Completed Courses
          </span>
          <p style={{ margin: '8px 0 4px 0', fontSize: '2.2rem', fontWeight: 900, color: '#0d2046' }}>
            {performance.courses_completed} / {performance.courses_enrolled}
          </p>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Completed of total enrolled courses
          </span>
        </div>

        {/* Metric 4: Academic Standing */}
        <div style={{
          background: '#ffffff',
          padding: '1.75rem',
          borderRadius: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Academic Standing
          </span>
          <p style={{
            margin: '8px 0 4px 0',
            fontSize: '1.5rem',
            fontWeight: 900,
            color: performance.assessments_passed > 0 ? '#16a34a' : '#64748b'
          }}>
            {performance.assessments_passed > 0 ? 'Verified & Approved' : 'In Progress'}
          </p>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            NeST Module Evaluation
          </span>
        </div>

      </div>

      {/* ── Evaluated Assessments List ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '1.5rem',
        border: '1px solid #e2e8f0',
        padding: '2.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
      }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Evaluated Course Assessments
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Your assessment results, scores, and feedback recorded by Course Management.
          </p>
        </div>

        {assessments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {assessments.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1.75rem',
                  borderRadius: '1.25rem',
                  border: `1.5px solid ${item.passed ? '#bbf7d0' : '#fecaca'}`,
                  background: item.passed ? '#f0fdf4' : '#fef2f2',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: item.passed ? '#dcfce7' : '#fee2e2',
                      color: item.passed ? '#16a34a' : '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.passed ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 3px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                        {item.course_title}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                        Multiple Choice Assessment • Evaluated on {item.date}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '1.6rem',
                        fontWeight: 900,
                        color: item.passed ? '#15803d' : '#dc2626'
                      }}>
                        {item.score}%
                      </span>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                        Passing: {item.passing_score}%
                      </div>
                    </div>

                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      background: item.passed ? '#dcfce7' : '#fee2e2',
                      color: item.passed ? '#15803d' : '#b91c1c'
                    }}>
                      {item.status || (item.passed ? 'Approved' : 'Rejected')}
                    </span>
                  </div>

                </div>

                {/* Course Manager Feedback */}
                {item.feedback && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.06)',
                    fontSize: '14px',
                    color: '#334155',
                    lineHeight: 1.5
                  }}>
                    <strong>Course Manager Feedback:</strong> {item.feedback}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                  {item.passed && (
                    <button
                      onClick={() => generateCourseCertificate(userName, item.course_title, item.date)}
                      style={{
                        background: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Award size={16} /> Certificate
                    </button>
                  )}

                  <Link
                    to={`/assessment/${item.course_id}`}
                    style={{
                      background: '#0d2046',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '9px 18px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '13px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    View Evaluation Breakdown <ChevronRight size={14} />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
            <BookOpen size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              No Assessments Completed Yet
            </h4>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
              Enroll in a course and complete the multiple choice evaluation to establish your performance record.
            </p>
            <Link
              to="/courses"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0d2046',
                color: 'white',
                padding: '10px 22px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              Explore Course Catalog
            </Link>
          </div>
        )}

      </div>

    </div>
  );
};

export default PerformanceAnalysis;
