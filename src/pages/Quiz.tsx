import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, HelpCircle, 
  CheckCircle2, ChevronRight, Play,
  Star, Zap, ShieldCheck, Award, Loader2
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

const MOCK_ASSESSMENTS: Assessment[] = [
  { id: '1', title: 'React Performance Mastery', category: 'Frontend', difficulty: 'Expert', timeLimit: 20, questionsCount: 15, points: 500, description: 'Deep dive into specialized hooks, virtualization, and rendering optimizations in React 18.' },
  { id: '2', title: 'Go Backend Architecture', category: 'Backend', difficulty: 'Intermediate', timeLimit: 15, questionsCount: 10, points: 300, description: 'Evaluate your knowledge of Go concurrency patterns, middleware design, and gRPC implementations.' },
  { id: '3', title: 'Cybersecurity Fundamentals', category: 'Security', difficulty: 'Beginner', timeLimit: 10, questionsCount: 10, points: 200, description: 'Essential security principles including OWASP Top 10, encryption, and safe coding practices.' },
  { id: '4', title: 'AI & Machine Learning Ops', category: 'AI/ML', difficulty: 'Intermediate', timeLimit: 25, questionsCount: 20, points: 400, description: 'MLOps best practices, model monitoring, and deployment strategies using the NeST AI stack.' },
];

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
    navigate(`/assessment/${course.id}`);
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

  // Calculate stats
  const completedCount = assessments.filter(a => a.enrollment_info?.status === 'Completed').length;
  const inProgressCount = assessments.filter(a => a.enrollment_info?.status === 'In Progress').length;
  const avgProgress = assessments.length > 0 
    ? Math.round(assessments.reduce((acc, curr) => acc + (curr.enrollment_info?.progress || 0), 0) / assessments.length)
    : 0;

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
            {/* Lobby Header */}
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                  Assessment <span style={{ color: '#d32f2f' }}>Center</span>
                </h1>
                <p style={{ color: '#64748B', marginTop: '0.5rem' }}>Manage and complete assessments for your enrolled courses.</p>
              </div>
              <Link to="/courses/my-courses" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d32f2f', fontWeight: 700, textDecoration: 'none' }}>
                <ArrowLeft size={18} /> Back to Academy
              </Link>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {[
                { label: 'Completed', count: completedCount, icon: CheckCircle2, color: '#10B981' },
                { label: 'In Progress', count: inProgressCount, icon: Clock, color: '#6366F1' },
                { label: 'Avg. Progress', count: `${avgProgress}%`, icon: Zap, color: '#F59E0B' },
              ].map((stat, i) => (
                <div key={i} className="luxury-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={24} color={stat.color} />
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>{stat.count}</span>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem' }}>Your Course Assessments</h2>
            
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
                  const isCompleted = course.enrollment_info?.status === 'Completed';
                  const currentStage = course.assessment_info?.current_stage || 1;
                  const progress = course.enrollment_info?.progress || 0;
                  
                  return (
                    <motion.div
                      key={course.id}
                      className="luxury-card"
                      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid #E2E8F0' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ color: '#d32f2f', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{course.level || 'Standard'}</span>
                          <h3 style={{ margin: '0.5rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>{course.title}</h3>
                        </div>
                        <div style={{ 
                          background: isCompleted ? '#f0fdf4' : '#fffbeb',
                          color: isCompleted ? '#16a34a' : '#92400E',
                          padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 
                        }}>
                          {isCompleted ? 'Completed' : `Stage ${currentStage}`}
                        </div>
                      </div>
                      
                      <p style={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        {course.description || "Continue your assessment for this course to earn your official NeST Digital certification."}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.9rem' }}>
                          <Clock size={16} /> {course.duration || 'Flexible'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.9rem' }}>
                          <ShieldCheck size={16} /> Progress: {progress}%
                        </div>
                        {isCompleted && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontSize: '0.9rem', fontWeight: 700 }}>
                            <Award size={16} /> Certified
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                        <button 
                          onClick={() => handleStartQuiz(course)}
                          style={{ 
                            flex: 1,
                            background: isCompleted ? '#F8FAFC' : '#0F172A', 
                            color: isCompleted ? '#0F172A' : 'white', 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            border: isCompleted ? '1px solid #E2E8F0' : 'none', 
                            fontWeight: 700, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem',
                            cursor: 'pointer'
                          }}
                        >
                          {isCompleted ? <><CheckCircle2 size={18} /> Review Assessment</> : <><Play size={18} fill="currentColor" /> Resume Assessment</>}
                        </button>
                        
                        {isCompleted && (
                          <button 
                            onClick={() => {
                              if (!user) return alert("Profile loading...");
                              generateCourseCertificate(
                                user.full_name || 'NeST Member',
                                course.title,
                                new Date().toLocaleDateString()
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
                              cursor: 'pointer'
                            }}
                          >
                            <Award size={18} /> Download
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
