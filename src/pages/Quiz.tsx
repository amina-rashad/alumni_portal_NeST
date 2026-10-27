import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, HelpCircle, 
  CheckCircle2, ChevronRight, Play,
  Star, Zap, ShieldCheck, Award, Loader2, BookOpen,
  Lock, RotateCcw, AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { coursesApi, usersApi } from '../services/api';
import { generateCourseCertificate } from '../utils/CertificateGenerator';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Assessment {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  timeLimit: number;
  questionsCount: number;
  points: number;
  description: string;
}



const MOCK_QUESTIONS: Question[] = [
  { id: 'q1', text: 'Which hook should be used for expensive calculations to prevent unnecessary re-renders?', options: ['useEffect', 'useMemo', 'useCallback', 'useReducer'], correctAnswer: 1 },
  { id: 'q2', text: 'What is the primary benefit of React.memo in functional components?', options: ['Managing side effects', 'Reducing bundle size', 'Preventing props-based re-renders', 'Automating API calls'], correctAnswer: 2 },
  { id: 'q3', text: 'How do you perform code splitting in a React application using the standard library?', options: ['React.lazy and Suspense', 'Webpack SplitChunks', 'Dynamic Import only', 'Higher Order Components'], correctAnswer: 0 },
];

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState<'lobby' | 'active'>('lobby');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [user, setUserState] = useState<any>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const [coursesRes, profileRes] = await Promise.all([
          coursesApi.getMyCourses(),
          usersApi.getProfile()
        ]);

        if (coursesRes.success && coursesRes.data) {
          setAssessments(coursesRes.data.courses);
        }
        if (profileRes.success && profileRes.data) {
          setUserState((profileRes.data as any).user);
        }
      } catch (err) {
        console.error('Failed to fetch assessments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  useEffect(() => {
    if (activeScreen === 'active' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [activeScreen, timeLeft]);

  const handleStartQuiz = (course: any) => {
    // If it's a 5-stage assessment, navigate to AssessmentCenter
    // Otherwise if it's just a simple quiz, handle it here (mocked for now)
    navigate(`/assessment/${course.id}`, { state: { from: '/assessments/quiz' } });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem' }}>
        <Loader2 size={48} className="animate-spin" color="#d32f2f" />
        <p style={{ fontWeight: 600, color: '#64748B' }}>Loading Assessment Center...</p>
      </div>
    );
  }

  // Calculate stats based on assessment completion and passing status
  const completedCount = assessments.filter(a => a.assessment_info?.has_passed || a.enrollment_info?.status === 'Completed').length;
  const inProgressCount = assessments.filter(a => !(a.assessment_info?.has_passed || a.enrollment_info?.status === 'Completed')).length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      <AnimatePresence mode="wait">
        {activeScreen === 'lobby' ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Cinematic Hero Section */}
            <section style={{ 
              position: 'relative', 
              width: '100vw', 
              left: '50%', 
              right: '50%', 
              marginLeft: '-50vw', 
              marginRight: '-50vw', 
              background: '#0a0f1e',
              height: '420px',
              overflow: 'hidden',
              marginBottom: '4rem',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '0 0 4rem 0'
            }}>
              {/* Premium Background Image */}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                zIndex: 0,
                overflow: 'hidden'
              }}>
                <motion.img 
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  src="/images/assessment/hero_background.png" 
                  alt="" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
                {/* Advanced Atmospheric Overlays */}
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'linear-gradient(to right, #0a0f1e 0%, rgba(10, 15, 30, 0.4) 50%, rgba(10, 15, 30, 0.2) 100%)',
                  zIndex: 1 
                }} />
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(10, 15, 30, 0.9) 100%)',
                  zIndex: 2 
                }} />
              </div>

              {/* Background Glows */}
              <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(211,47,47,0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1 }} />
              
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10, width: '100%' }}>
                <div style={{ maxWidth: '650px', textAlign: 'left' }}>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <span style={{ 
                      display: 'inline-block', 
                      background: 'rgba(255,255,255,0.08)', 
                      backdropFilter: 'blur(10px)', 
                      padding: '8px 18px', 
                      borderRadius: '50px', 
                      color: '#cbd5e1', 
                      fontSize: '11px', 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      letterSpacing: '1.2px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      marginBottom: '1.5rem',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                      Assessments & Evaluations
                    </span>
                    <h1 style={{ fontSize: '3.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
                      Assessment<br />
                      <span style={{ color: '#d32f2f' }}>Center</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', marginTop: '1.2rem', lineHeight: 1.6, maxWidth: '440px', fontWeight: 400 }}>
                      Manage and complete assessments for your enrolled courses and professional certifications.
                    </p>
                    
                    <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '40px' }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      style={{ 
                        height: '3px', 
                        background: '#d32f2f', 
                        marginTop: '1.5rem',
                        borderRadius: '2px'
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Overlapping Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem', 
              marginBottom: '5rem',
              position: 'relative',
              zIndex: 20,
              marginTop: '-5.5rem'
            }}>
              {[
                { label: 'Completed', count: completedCount, subtext: 'Assessments finished', icon: CheckCircle2, color: '#10B981' },
                { label: 'In Progress', count: inProgressCount, subtext: 'Assessments in progress', icon: Clock, color: '#6366F1' },
                { label: 'Total Enrolled', count: assessments.length, subtext: 'Active academic tracks', icon: BookOpen, color: '#F59E0B' },
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1), duration: 0.6 }}
                  className="glass-stat-card" 
                  style={{ 
                    padding: '2rem 1.8rem', 
                    background: '#ffffff', 
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.25rem',
                    border: '1px solid rgba(255,255,255,1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '18px', 
                    background: `${stat.color}08`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <stat.icon size={28} color={stat.color} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{stat.label}</span>
                    <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.02em' }}>{stat.count}</span>
                    <span style={{ display: 'block', color: '#64748B', fontSize: '0.85rem', marginTop: '6px', fontWeight: 500 }}>{stat.subtext}</span>
                  </div>
                  
                  {/* Subtle Wave Graphic in background */}
                  <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '120px', height: '60px', opacity: 0.08 }}>
                    <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 40C20 40 30 0 50 0C70 0 80 40 100 40" stroke={stat.color} strokeWidth="20" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Your Course Assessments</h2>
              <div style={{ width: '40px', height: '4px', background: '#d32f2f', marginTop: '0.75rem', borderRadius: '2px' }} />
            </div>
            
            {assessments.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #E2E8F0' }}>
                <ShieldCheck size={48} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: '#0F172A', fontWeight: 700 }}>No Enrolled Courses Found</h3>
                <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>Enroll in courses to see their assessments here.</p>
                <Link to="/courses" style={{ background: '#0F172A', color: 'white', padding: '0.8rem 2rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>Explore Catalog</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '1.5rem' }}>
                {assessments.map((course) => {
                  const assessInfo = course.assessment_info || {};
                  const hasAttended = Boolean(assessInfo.has_attended);
                  const hasPassed = Boolean(assessInfo.has_passed);
                  const userScore = assessInfo.score;
                  const passingScore = assessInfo.passing_score ?? 70;
                  const canDownload = Boolean(assessInfo.can_download_certificate ?? hasPassed);
                  const attemptsCount = assessInfo.attempts_count ?? (hasAttended ? 1 : 0);
                  const maxAttempts = assessInfo.max_attempts ?? 3;
                  const attemptsLeft = assessInfo.attempts_left !== undefined 
                    ? assessInfo.attempts_left 
                    : Math.max(0, maxAttempts - attemptsCount);
                  const canRetake = assessInfo.can_retake !== undefined 
                    ? assessInfo.can_retake 
                    : (attemptsLeft > 0);
                  const isLocked = !hasPassed && hasAttended && !canRetake;

                  // Status badge styling & text
                  let badgeText = 'Assessment Pending';
                  let badgeBg = '#fffbeb';
                  let badgeColor = '#b45309';
                  let badgeBorder = '1px solid #fde68a';

                  if (hasPassed) {
                    badgeText = `Passed (${userScore}%)`;
                    badgeBg = '#f0fdf4';
                    badgeColor = '#16a34a';
                    badgeBorder = '1px solid #bbf7d0';
                  } else if (isLocked) {
                    badgeText = `Attempts Exhausted (${attemptsCount}/${maxAttempts})`;
                    badgeBg = '#fef2f2';
                    badgeColor = '#991b1b';
                    badgeBorder = '1px solid #fecaca';
                  } else if (hasAttended) {
                    badgeText = `Failed (${userScore}%)`;
                    badgeBg = '#fef2f2';
                    badgeColor = '#dc2626';
                    badgeBorder = '1px solid #fecaca';
                  }

                  return (
                    <motion.div
                      key={course.id}
                      className="luxury-card"
                      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid #E2E8F0', borderRadius: '20px', background: '#ffffff' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ color: '#d32f2f', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{course.level || 'Standard'}</span>
                          <h3 style={{ margin: '0.5rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>{course.title}</h3>
                        </div>
                        <div style={{ 
                          background: badgeBg,
                          color: badgeColor,
                          border: badgeBorder,
                          padding: '0.4rem 1rem', 
                          borderRadius: '8px', 
                          fontSize: '0.8rem', 
                          fontWeight: 700 
                        }}>
                          {badgeText}
                        </div>
                      </div>
                      
                      <p style={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        {course.description || "Continue your assessment for this course to earn your official NeST Digital certification."}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.9rem' }}>
                          <Clock size={16} /> {course.duration || 'Flexible'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.9rem' }}>
                          <BookOpen size={16} /> {course.level || 'Professional Track'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isLocked ? '#dc2626' : '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>
                          <RotateCcw size={16} /> Attempts: {attemptsCount} / {maxAttempts}
                        </div>
                        {hasPassed ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.9rem', fontWeight: 700 }}>
                            <CheckCircle2 size={16} /> Certified (Score: {userScore}%)
                          </div>
                        ) : hasAttended ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.9rem', fontWeight: 600 }}>
                            <AlertCircle size={16} /> Min Pass Required: {passingScore}%
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>
                            <Award size={16} /> Pass Required: {passingScore}%
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleStartQuiz(course)}
                          style={{ 
                            flex: 1,
                            background: hasPassed ? '#F8FAFC' : (isLocked ? '#fef2f2' : '#0F172A'), 
                            color: hasPassed ? '#0F172A' : (isLocked ? '#991b1b' : 'white'), 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            border: hasPassed ? '1px solid #E2E8F0' : (isLocked ? '1px solid #fecaca' : 'none'), 
                            fontWeight: 700, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {hasPassed ? (
                            <><CheckCircle2 size={18} /> Review Assessment</>
                          ) : isLocked ? (
                            <><Lock size={18} /> View Results (Limit Reached)</>
                          ) : hasAttended ? (
                            <><RotateCcw size={18} /> Retake Assessment ({attemptsLeft} left)</>
                          ) : (
                            <><Play size={18} fill="currentColor" /> Attend Assessment</>
                          )}
                        </button>
                        
                        {/* Certificate Download Button: strictly locked until assessment attended & passed >= passingScore */}
                        {canDownload ? (
                          <button 
                            onClick={() => {
                              if (!user) return alert("Profile loading...");
                              const compDate = assessInfo.completed_at || course.completed_at || course.enrollment_info?.completed_at || new Date().toISOString();
                              generateCourseCertificate(
                                user.full_name || 'NeST Member',
                                course.title,
                                compDate
                              );
                            }}
                            style={{ 
                              background: '#d32f2f', 
                              color: 'white', 
                              padding: '1rem 1.5rem', 
                              borderRadius: '12px', 
                              border: 'none', 
                              fontWeight: 700, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem',
                              cursor: 'pointer',
                              boxShadow: '0 4px 14px rgba(211, 47, 47, 0.3)',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                          >
                            <Award size={18} /> Download
                          </button>
                        ) : (
                          <button 
                            disabled
                            title={
                              hasAttended 
                                ? `Certificate Blocked: You scored ${userScore}%. A minimum passing score of ${passingScore}% set by the course manager is required.` 
                                : `Certificate Blocked: You must attend the assessment and score at least ${passingScore}% to unlock this certificate.`
                            }
                            style={{ 
                              background: '#F1F5F9', 
                              color: '#94A3B8', 
                              padding: '1rem 1.25rem', 
                              borderRadius: '12px', 
                              border: '1.5px dashed #CBD5E1', 
                              fontWeight: 700, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem',
                              cursor: 'not-allowed',
                              opacity: 0.85
                            }}
                          >
                            <Lock size={16} />
                            {hasAttended ? `Locked (${userScore}% / ${passingScore}%)` : `Locked (${passingScore}% Req.)`}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="quiz-active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{ maxWidth: '800px', margin: '0 auto' }}
          >
            {/* Quiz Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <button 
                onClick={() => setActiveScreen('lobby')}
                style={{ background: 'transparent', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
              >
                <ArrowLeft size={18} /> Exit
              </button>
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#94A3B8', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Time Remaining</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: timeLeft < 60 ? '#EF4444' : '#0F172A' }}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div style={{ width: '80px' }} />
            </div>

            {/* Progress Bar */}
            <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '10px', marginBottom: '3rem', position: 'relative' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIdx + 1) / MOCK_QUESTIONS.length) * 100}%` }}
                style={{ height: '100%', background: '#d32f2f', borderRadius: '10px' }} 
              />
              <span style={{ position: 'absolute', right: 0, top: '-1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>
                {currentQuestionIdx + 1} / {MOCK_QUESTIONS.length}
              </span>
            </div>

            {/* Question Card */}
            <div className="luxury-card" style={{ padding: '3rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 50px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.4, marginBottom: '2.5rem' }}>
                {MOCK_QUESTIONS[currentQuestionIdx].text}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {MOCK_QUESTIONS[currentQuestionIdx].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    style={{ 
                      padding: '1.25rem 1.5rem', 
                      borderRadius: '16px', 
                      textAlign: 'left',
                      fontSize: '1.1rem',
                      fontWeight: selectedOption === idx ? 700 : 500,
                      background: selectedOption === idx ? '#fff1f1' : 'white',
                      border: `2px solid ${selectedOption === idx ? '#d32f2f' : '#E2E8F0'}`,
                      color: selectedOption === idx ? '#0F172A' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        border: `2px solid ${selectedOption === idx ? '#d32f2f' : '#CBD5E1'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: selectedOption === idx ? '#d32f2f' : '#CBD5E1',
                        fontSize: '0.9rem',
                        fontWeight: 800
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                <button
                  disabled={selectedOption === null}
                  onClick={() => {
                    if (currentQuestionIdx < MOCK_QUESTIONS.length - 1) {
                      setCurrentQuestionIdx(currentQuestionIdx + 1);
                      setSelectedOption(null);
                    } else {
                      navigate('/assessments/quiz/result');
                    }
                  }}
                  style={{ 
                    padding: '1rem 2.5rem', 
                    background: selectedOption === null ? '#E2E8F0' : '#0F172A',
                    color: selectedOption === null ? '#94A3B8' : 'white',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: selectedOption === null ? 'not-allowed' : 'pointer'
                  }}
                >
                  {currentQuestionIdx === MOCK_QUESTIONS.length - 1 ? 'Finish Assessment' : 'Next Question'} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .luxury-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>
    </div>
  );
};

export default Quiz;
