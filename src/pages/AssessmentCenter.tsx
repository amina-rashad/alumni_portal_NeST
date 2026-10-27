import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, 
  Clock, Check, X, RotateCcw, Award,
  HelpCircle, MessageSquare, ClipboardCheck,
  ChevronRight, Sparkles, BookOpen, Lock
} from 'lucide-react';
import { assessmentsApi, coursesApi, usersApi } from '../services/api';
import { generateCourseCertificate } from '../utils/CertificateGenerator';

const AssessmentCenter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [latestSubmission, setLatestSubmission] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [courseRes, assessRes, profileRes] = await Promise.all([
        coursesApi.getCourseById(id),
        assessmentsApi.getAssessmentStatus(id),
        usersApi.getProfile()
      ]);
      
      if (courseRes.success) setCourse((courseRes.data as any).course);
      if (assessRes.success) {
        const d = (assessRes.data as any);
        setAttempt(d.attempt);
        if (d.assessment) {
          setAssessmentData(d.assessment);
        }
        if (d.latest_submission) {
          setLatestSubmission(d.latest_submission);
          // If already submitted, default to showing evaluation results
          setIsTakingQuiz(false);
        } else {
          // No submission yet, default to quiz taking mode
          setIsTakingQuiz(true);
        }
      }
      if (profileRes.success) setUserProfile((profileRes.data as any).user);
      
    } catch (err) {
      console.error('Error fetching assessment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Optional countdown timer during quiz mode
  useEffect(() => {
    if (isTakingQuiz && assessmentData?.time_limit_mins && timeLeft === null) {
      setTimeLeft(assessmentData.time_limit_mins * 60);
    }
    if (!isTakingQuiz) {
      setTimeLeft(null);
    }
  }, [isTakingQuiz, assessmentData]);

  useEffect(() => {
    if (!isTakingQuiz || timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTakingQuiz, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const questions = assessmentData?.questions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const passingScore = assessmentData?.passing_score ?? 75;

  const maxAttempts = latestSubmission?.max_attempts ?? assessmentData?.max_attempts ?? 3;
  const attemptsCount = latestSubmission?.attempts_count ?? latestSubmission?.attempt_number ?? (latestSubmission ? 1 : 0);
  const attemptsLeft = latestSubmission?.attempts_left !== undefined 
    ? latestSubmission.attempts_left 
    : (assessmentData?.attempts_left !== undefined 
        ? assessmentData.attempts_left 
        : Math.max(0, maxAttempts - attemptsCount));
  const canRetake = latestSubmission ? (attemptsLeft > 0 || latestSubmission.can_retake === true) : true;

  const handleStartRetake = () => {
    if (latestSubmission && !latestSubmission.passed && !canRetake) {
      alert(`You have reached the maximum attempt limit (${maxAttempts} attempts). Please contact your Course Manager to reset your attempts.`);
      return;
    }
    setSelectedAnswers({});
    if (assessmentData?.time_limit_mins) {
      setTimeLeft(assessmentData.time_limit_mins * 60);
    }
    setIsTakingQuiz(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitQuiz = async () => {
    if (!id || !assessmentData?.questions) return;
    setSubmitting(true);
    try {
      const answersPayload = Object.entries(selectedAnswers).map(([qid, opt]) => ({
        question_id: qid,
        selected_option: opt
      }));

      const res = await assessmentsApi.submitStage(id, 1, { answers: answersPayload });
      if (res.success) {
        await fetchData();
        setIsTakingQuiz(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(res.message || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'An error occurred while submitting your assessment.';
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTop: '4px solid #0d2046', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>Loading course assessment...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2.5rem 1rem 5rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Top Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            onClick={() => {
              if (location.state && (location.state as any).from) {
                navigate((location.state as any).from);
              } else if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/assessments/quiz');
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              borderRadius: '12px',
              padding: '9px 18px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} /> Back to Assessments
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {latestSubmission && (
              <span style={{
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800
              }}>
                Attempt {attemptsCount} of {maxAttempts}
              </span>
            )}
            {latestSubmission && (
              <span style={{
                background: latestSubmission.passed ? '#ecfdf5' : '#fef2f2',
                color: latestSubmission.passed ? '#15803d' : '#b91c1c',
                border: `1px solid ${latestSubmission.passed ? '#bbf7d0' : '#fecaca'}`,
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {latestSubmission.passed ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {latestSubmission.passed ? 'Assessment Passed' : 'Revision Required'}
              </span>
            )}
            <span style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #dbeafe',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800
            }}>
              MCQ Assessment
            </span>
          </div>
        </div>

        {/* Page Title & Course Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0d2046 0%, #1e3a8a 100%)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          color: 'white',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px rgba(13, 32, 70, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              backdropFilter: 'blur(8px)'
            }}>
              NeST Course Evaluation
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
              {course?.title || assessmentData?.title || 'Course Assessment'}
            </h1>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '1rem', maxWidth: '650px', lineHeight: 1.5 }}>
              {assessmentData?.description || 'Course Multiple Choice Assessment configured by Course Management.'}
            </p>
          </div>

          <div style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Guard: If no questions configured by course manager */}
        {totalQuestions === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '1.5rem',
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <BookOpen size={48} color="#94a3b8" style={{ margin: '0 auto 1.5rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              No Questions Configured Yet
            </h3>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
              The Course Manager has not yet uploaded multiple choice questions for this course. Please check back soon.
            </p>
            <Link
              to="/courses/my-courses"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0d2046',
                color: 'white',
                padding: '0.8rem 1.8rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              Return to My Courses
            </Link>
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* VIEW A: EVALUATION PROCESSES & RESULTS (When already submitted) */}
            {/* ============================================================== */}
            {latestSubmission && !isTakingQuiz ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
              >
                {/* 1. Evaluation Summary Hero */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '1.5rem',
                  border: `2px solid ${latestSubmission.passed ? '#bbf7d0' : '#fecaca'}`,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
                }}>
                  <div style={{
                    padding: '2rem 2.5rem',
                    background: latestSubmission.passed 
                      ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' 
                      : 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)',
                    borderBottom: '1px solid #f1f5f9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          backgroundColor: latestSubmission.passed ? '#dcfce7' : '#fee2e2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {latestSubmission.passed ? (
                            <CheckCircle2 size={36} color="#16a34a" />
                          ) : (
                            <AlertCircle size={36} color="#dc2626" />
                          )}
                        </div>
                        <div>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: latestSubmission.passed ? '#15803d' : '#b91c1c'
                          }}>
                            Evaluation Process Complete
                          </span>
                          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                            {latestSubmission.passed ? 'Assessment Passed & Approved' : 'Assessment Revision Required'}
                          </h2>
                          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                            {latestSubmission.passed
                              ? 'Congratulations! You have satisfied the academic standard set by the Course Manager.'
                              : (!canRetake
                                ? `Score did not achieve the ${latestSubmission.passing_score ?? passingScore}% required passing standard. You have used all ${maxAttempts} of ${maxAttempts} allowed attempts. Please contact your Course Manager to request an attempt reset.`
                                : `Score did not achieve the ${latestSubmission.passing_score ?? passingScore}% required passing standard. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`)}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {latestSubmission.passed && (
                          <button
                            onClick={() => {
                              const studentName = userProfile?.full_name || 'NeST Member';
                              const courseTitle = course?.title || assessmentData?.title || 'Course';
                              const compDate = latestSubmission?.submitted_at || assessmentData?.completed_at || new Date().toISOString();
                              generateCourseCertificate(studentName, courseTitle, compDate);
                            }}
                            style={{
                              background: '#d32f2f',
                              color: 'white',
                              border: 'none',
                              padding: '12px 22px',
                              borderRadius: '12px',
                              fontWeight: 800,
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: '0 6px 16px rgba(211, 47, 47, 0.25)',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                          >
                            <Award size={18} /> Download Certificate
                          </button>
                        )}

                        {canRetake ? (
                          <button
                            onClick={handleStartRetake}
                            style={{
                              background: '#ffffff',
                              color: '#0d2046',
                              border: '1.5px solid #cbd5e1',
                              padding: '11px 20px',
                              borderRadius: '12px',
                              fontWeight: 700,
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#0d2046';
                              e.currentTarget.style.background = '#f8fafc';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.background = '#ffffff';
                            }}
                          >
                            <RotateCcw size={16} /> Retake Assessment ({attemptsLeft} left)
                          </button>
                        ) : !latestSubmission.passed ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            background: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            fontSize: '13px',
                            fontWeight: 700
                          }}>
                            <Lock size={15} color="#dc2626" />
                            <span>Attempts Exhausted ({attemptsCount}/{maxAttempts})</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* KPI Stat Cards Grid */}
                  <div style={{
                    padding: '1.75rem 2.5rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1.25rem',
                    backgroundColor: '#ffffff'
                  }}>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Final Score</span>
                      <p style={{
                        margin: '6px 0 0 0',
                        fontSize: '1.8rem',
                        fontWeight: 900,
                        color: latestSubmission.passed ? '#15803d' : '#dc2626'
                      }}>
                        {latestSubmission.score ?? 0}%
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Passing Target</span>
                      <p style={{ margin: '6px 0 0 0', fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
                        {latestSubmission.passing_score ?? passingScore}%
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Accuracy</span>
                      <p style={{ margin: '6px 0 0 0', fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
                        {latestSubmission.correct_count ?? 0} / {latestSubmission.total_questions ?? totalQuestions}
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attempts Taken</span>
                      <p style={{ margin: '6px 0 0 0', fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
                        {attemptsCount} / {maxAttempts}
                      </p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Evaluation Status</span>
                      <p style={{
                        margin: '6px 0 0 0',
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        color: latestSubmission.passed ? '#15803d' : '#b91c1c'
                      }}>
                        {latestSubmission.status || (latestSubmission.passed ? 'Approved' : 'Rejected')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Course Manager Evaluation Feedback Card */}
                {latestSubmission.feedback && (
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '1.25rem',
                    border: '1px solid #e2e8f0',
                    padding: '1.75rem 2rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                          Course Manager Evaluation Feedback
                        </h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          Official assessment evaluation remarks
                        </span>
                      </div>
                    </div>
                    <div style={{
                      background: '#f8fafc',
                      padding: '1.25rem 1.5rem',
                      borderRadius: '12px',
                      borderLeft: '4px solid #0d2046',
                      color: '#334155',
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      fontWeight: 500
                    }}>
                      "{latestSubmission.feedback}"
                    </div>
                  </div>
                )}

                {/* 3. Detailed Question-by-Question Evaluation Breakdown ("MCQ Evaluation Breakdown") */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '1.5rem',
                  border: '1px solid #e2e8f0',
                  padding: '2.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d2046', marginBottom: '4px' }}>
                      <ClipboardCheck size={20} />
                      <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>
                        MCQ Evaluation Breakdown
                      </h3>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                      Review your submitted responses alongside verified correct answers.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                    {(latestSubmission.answers && latestSubmission.answers.length > 0 
                      ? latestSubmission.answers 
                      : questions
                    ).map((q: any, idx: number) => {
                      const questionText = q.question_text || q.text;
                      const opts = q.options || [];
                      const selectedOpt = q.selected_option !== undefined ? q.selected_option : null;
                      const correctOpt = q.correct_answer !== undefined ? q.correct_answer : null;
                      const isCorrect = q.is_correct !== undefined 
                        ? q.is_correct 
                        : (selectedOpt !== null && correctOpt !== null && selectedOpt === correctOpt);

                      return (
                        <div
                          key={q.question_id || q.id || idx}
                          style={{
                            background: '#ffffff',
                            borderRadius: '1.25rem',
                            border: `1.5px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
                            padding: '1.75rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                          }}
                        >
                          {/* Question header row */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                background: '#0d2046',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 800,
                                letterSpacing: '0.04em'
                              }}>
                                QUESTION {idx + 1}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                                {q.points ?? 1} Point
                              </span>
                            </div>

                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 800,
                              background: isCorrect ? '#ecfdf5' : '#fef2f2',
                              color: isCorrect ? '#15803d' : '#b91c1c',
                              border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`
                            }}>
                              {isCorrect ? <Check size={14} /> : <X size={14} />}
                              {isCorrect ? `Correct (+${q.points ?? 1} pt)` : 'Incorrect (0 pts)'}
                            </span>
                          </div>

                          {/* Question text */}
                          <h4 style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: '0 0 1.25rem 0',
                            lineHeight: 1.5
                          }}>
                            {questionText}
                          </h4>

                          {/* Options breakdown */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {opts.map((opt: string, optIdx: number) => {
                              const isLearnerPick = selectedOpt === optIdx;
                              const isCorrectPick = correctOpt === optIdx;

                              let optBorder = '#e2e8f0';
                              let optBg = '#f8fafc';
                              let optTextColor = '#334155';

                              if (isLearnerPick && isCorrectPick) {
                                optBorder = '#22c55e';
                                optBg = '#f0fdf4';
                                optTextColor = '#15803d';
                              } else if (isLearnerPick && !isCorrectPick) {
                                optBorder = '#ef4444';
                                optBg = '#fef2f2';
                                optTextColor = '#b91c1c';
                              } else if (!isLearnerPick && isCorrectPick) {
                                optBorder = '#86efac';
                                optBg = '#f0fdf4';
                                optTextColor = '#15803d';
                              }

                              return (
                                <div
                                  key={optIdx}
                                  style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: `1.5px solid ${optBorder}`,
                                    background: optBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      border: `1.5px solid ${isLearnerPick || isCorrectPick ? optBorder : '#cbd5e1'}`,
                                      background: isLearnerPick ? (isCorrectPick ? '#16a34a' : '#dc2626') : (isCorrectPick ? '#16a34a' : 'transparent'),
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      flexShrink: 0
                                    }}>
                                      {isLearnerPick ? (
                                        isCorrectPick ? <Check size={14} /> : <X size={14} />
                                      ) : isCorrectPick ? (
                                        <Check size={14} />
                                      ) : (
                                        String.fromCharCode(65 + optIdx)
                                      )}
                                    </div>

                                    <span style={{ fontSize: '14px', fontWeight: isLearnerPick || isCorrectPick ? 700 : 500, color: optTextColor }}>
                                      {opt}
                                    </span>
                                  </div>

                                  {/* Badges for answer state */}
                                  <div>
                                    {isLearnerPick && isCorrectPick && (
                                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
                                        Your Choice (Correct) ✓
                                      </span>
                                    )}
                                    {isLearnerPick && !isCorrectPick && (
                                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#b91c1c', background: '#fee2e2', padding: '3px 10px', borderRadius: '12px' }}>
                                        Your Choice (Incorrect) ✗
                                      </span>
                                    )}
                                    {!isLearnerPick && isCorrectPick && (
                                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
                                        Correct Answer ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation if available */}
                          {q.explanation && (
                            <div style={{
                              marginTop: '1rem',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              background: '#eff6ff',
                              border: '1px solid #dbeafe',
                              fontSize: '13px',
                              color: '#1e40af',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px'
                            }}>
                              <HelpCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                <strong>Explanation:</strong> {q.explanation}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Actions inside evaluation */}
                  <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                    {canRetake ? (
                      <button
                        onClick={handleStartRetake}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          color: '#0d2046',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <RotateCcw size={16} /> Retake Assessment ({attemptsLeft} left)
                      </button>
                    ) : !latestSubmission.passed ? (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        background: '#fef2f2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        fontSize: '13px',
                        fontWeight: 700
                      }}>
                        <Lock size={16} color="#dc2626" />
                        Attempts Exhausted ({attemptsCount}/{maxAttempts}) — Contact Manager to Reset
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {latestSubmission.passed && (
                        <button
                          onClick={() => {
                            const studentName = userProfile?.full_name || 'NeST Member';
                            const courseTitle = course?.title || assessmentData?.title || 'Course';
                            const compDate = latestSubmission?.submitted_at || assessmentData?.completed_at || new Date().toISOString();
                            generateCourseCertificate(studentName, courseTitle, compDate);
                          }}
                          style={{
                            background: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 6px 16px rgba(211, 47, 47, 0.25)'
                          }}
                        >
                          <Award size={18} /> Download Certificate
                        </button>
                      )}

                      <Link
                        to="/courses/my-courses"
                        style={{
                          background: '#0d2046',
                          color: 'white',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        Back to My Courses <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : (
              /* ============================================================== */
              /* VIEW B: TAKING THE MCQ QUESTIONS (Clean, focused test view)    */
              /* ============================================================== */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
              >
                {/* Test Overview & Active Progress Bar */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '1.5rem',
                  border: '1px solid #e2e8f0',
                  padding: '2rem 2.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
                        {assessmentData?.title || 'Multiple Choice Assessment'}
                      </h2>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                        Please answer all {totalQuestions} questions carefully. Evaluation is conducted automatically upon submission.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {timeLeft !== null && (
                        <div style={{
                          background: timeLeft < 300 ? '#fef2f2' : '#f8fafc',
                          color: timeLeft < 300 ? '#dc2626' : '#0d2046',
                          border: `1.5px solid ${timeLeft < 300 ? '#fca5a5' : '#e2e8f0'}`,
                          padding: '8px 16px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: 800,
                          fontSize: '14px'
                        }}>
                          <Clock size={16} /> Time Left: {formatTimer(timeLeft)}
                        </div>
                      )}

                      {latestSubmission && (
                        <button
                          onClick={() => setIsTakingQuiz(false)}
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            border: 'none',
                            padding: '9px 16px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel Retake
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Criteria stats strip */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '1rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Questions</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>{totalQuestions}</p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Passing Target</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '1.3rem', fontWeight: 900, color: '#16a34a' }}>{passingScore}%</p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Time Limit</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>{assessmentData?.time_limit_mins || 20} Mins</p>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Answered</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '1.3rem', fontWeight: 900, color: answeredCount === totalQuestions ? '#16a34a' : '#d97706' }}>
                        {answeredCount} of {totalQuestions}
                      </p>
                    </div>
                  </div>

                  {/* Progress line */}
                  <div style={{ marginTop: '1.25rem', width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%`,
                      height: '100%',
                      background: answeredCount === totalQuestions ? '#16a34a' : '#0d2046',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* The MCQ Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  {questions.map((q: any, qIdx: number) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;

                    return (
                      <div
                        key={q.id || qIdx}
                        style={{
                          background: '#ffffff',
                          borderRadius: '1.5rem',
                          border: `1.5px solid ${isAnswered ? '#cbd5e1' : '#e2e8f0'}`,
                          padding: '2rem',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                          transition: 'border-color 0.2s ease'
                        }}
                      >
                        {/* Question Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <span style={{
                            background: isAnswered ? '#0d2046' : '#64748b',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.04em'
                          }}>
                            QUESTION {qIdx + 1} OF {totalQuestions}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                            {q.points || 1} Point
                          </span>
                        </div>

                        {/* Question Text */}
                        <h3 style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: '0 0 1.5rem 0',
                          lineHeight: 1.5
                        }}>
                          {q.text}
                        </h3>

                        {/* Options Choices */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {q.options?.map((opt: string, optIdx: number) => {
                            const isSelected = selectedAnswers[q.id] === optIdx;

                            return (
                              <div
                                key={optIdx}
                                onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                style={{
                                  padding: '14px 18px',
                                  borderRadius: '14px',
                                  border: `2px solid ${isSelected ? '#0d2046' : '#e2e8f0'}`,
                                  background: isSelected ? 'rgba(13, 32, 70, 0.04)' : '#f8fafc',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '14px',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => {
                                  if (!isSelected) {
                                    e.currentTarget.style.borderColor = '#94a3b8';
                                    e.currentTarget.style.background = '#ffffff';
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (!isSelected) {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.background = '#f8fafc';
                                  }
                                }}
                              >
                                <div style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  border: `2px solid ${isSelected ? '#0d2046' : '#cbd5e1'}`,
                                  background: isSelected ? '#0d2046' : 'white',
                                  color: isSelected ? 'white' : '#64748b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  flexShrink: 0
                                }}>
                                  {String.fromCharCode(65 + optIdx)}
                                </div>

                                <span style={{
                                  fontSize: '14.5px',
                                  fontWeight: isSelected ? 700 : 500,
                                  color: isSelected ? '#0d2046' : '#334155',
                                  lineHeight: 1.4
                                }}>
                                  {opt}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Submit Actions Bar */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '1.25rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem 2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
                  position: 'sticky',
                  bottom: '1.5rem',
                  zIndex: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: answeredCount === totalQuestions ? '#16a34a' : '#f59e0b'
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: answeredCount === totalQuestions ? '#16a34a' : '#64748b' }}>
                      {answeredCount === totalQuestions 
                        ? '✓ All questions answered. Ready for evaluation.' 
                        : `${totalQuestions - answeredCount} question(s) remaining`}
                    </span>
                  </div>

                  <button
                    disabled={submitting || answeredCount === 0}
                    onClick={handleSubmitQuiz}
                    style={{
                      background: '#0d2046',
                      color: 'white',
                      padding: '14px 32px',
                      borderRadius: '12px',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '15px',
                      cursor: (submitting || answeredCount === 0) ? 'not-allowed' : 'pointer',
                      opacity: (submitting || answeredCount === 0) ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 8px 20px rgba(13, 32, 70, 0.2)'
                    }}
                  >
                    {submitting ? (
                      <>Evaluating answers...</>
                    ) : (
                      <>
                        <Sparkles size={18} /> Submit Assessment ({answeredCount}/{totalQuestions})
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}

      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AssessmentCenter;
