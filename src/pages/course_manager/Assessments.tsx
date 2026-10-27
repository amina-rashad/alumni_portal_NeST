/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Github, Video, 
  FileText, ExternalLink, Clock, User, 
  BookOpen, Filter, Search, Loader2, 
  AlertCircle, ChevronRight, Activity,
  CheckCircle2, AlertTriangle, ArrowRight,
  Plus, Edit3, Trash2, HelpCircle, Award,
  Sparkles, Layers, ListChecks, ChevronDown,
  X, RefreshCw, Send, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { courseManagerAPI, coursesApi } from '../../services/api';
import toast from 'react-hot-toast';

interface MCQQuestion {
  id: string;
  text: string;
  options: string[];
  correct_answer: number;
  points?: number;
  explanation?: string;
}

interface CourseAssessment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimitMins: number;
  maxAttempts?: number;
  stage: number;
  questionsCount: number;
  questions: MCQQuestion[];
  createdAt: string;
}

interface SubmittedAnswer {
  question_id: string;
  question_text: string;
  options: string[];
  selected_option: number;
  correct_answer: number;
  is_correct: boolean;
  points?: number;
}

interface Submission {
  id: string;
  submissionId?: string;
  attemptId?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  profile_picture?: string;
  courseId?: string;
  course: string;
  courseName?: string;
  assessmentId?: string;
  assessmentTitle: string;
  assessmentType: string;
  stage: number;
  score: number;
  correct_count: number;
  total_questions: number;
  passing_score: number;
  passed: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  feedback?: string;
  reviewed_by?: string;
  answers: SubmittedAnswer[];
  submittedAt: string;
  content?: {
    type: string;
    url?: string;
    text?: string;
  };
}

const CM_Assessments: React.FC = () => {
  const brandPrimary = '#233167';
  const brandRed = '#c8102e';

  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState<'submissions' | 'assessments'>('submissions');
  
  // Data State
  const [courses, setCourses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<CourseAssessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Reviewed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Evaluation Modal State
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<Submission | null>(null);
  const [evalFeedback, setEvalFeedback] = useState('');
  const [evalScoreOverride, setEvalScoreOverride] = useState<number | null>(null);
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  // MCQ Assessment Creator Modal State
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [assessmentForm, setAssessmentForm] = useState({
    course_id: '',
    title: '',
    description: '',
    passing_score: 75,
    time_limit_mins: 20,
    max_attempts: 3,
    questions: [
      {
        id: `q_1_${Date.now()}`,
        text: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        points: 1,
        explanation: ''
      }
    ]
  });
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);

  // Initial Fetch
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, assessmentsRes, subsRes] = await Promise.all([
        coursesApi.getAllCourses(1, 100),
        courseManagerAPI.fetchCourseAssessments(),
        courseManagerAPI.fetchSubmissions()
      ]);

      if (coursesRes && coursesRes.data) {
        const fetchedCourses = (coursesRes.data as any).courses || [];
        setCourses(fetchedCourses);
        if (fetchedCourses.length > 0 && !assessmentForm.course_id) {
          setAssessmentForm(prev => ({ ...prev, course_id: fetchedCourses[0]._id || fetchedCourses[0].id }));
        }
      }

      if (assessmentsRes && assessmentsRes.data) {
        setAssessments((assessmentsRes.data as any).assessments || []);
      }

      if (subsRes && subsRes.data) {
        const rawSubs = (subsRes.data as any).submissions || (subsRes.data as any).pending_assessments || [];
        setSubmissions(rawSubs);
      }
    } catch (err) {
      console.error('Failed to load assessment data:', err);
      toast.error('Failed to sync assessment data with server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Submissions
  const filteredSubmissions = submissions.filter(sub => {
    // Course filter
    if (selectedCourseId !== 'all') {
      const matchCourse = sub.courseId === selectedCourseId || 
        sub.course?.toLowerCase() === courses.find(c => (c._id || c.id) === selectedCourseId)?.title?.toLowerCase();
      if (!matchCourse) return false;
    }

    // Status filter
    if (statusFilter === 'Pending' && sub.status !== 'Pending') return false;
    if (statusFilter === 'Reviewed' && sub.status === 'Pending') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = sub.studentName?.toLowerCase().includes(q);
      const emailMatch = sub.studentEmail?.toLowerCase().includes(q);
      const courseMatch = sub.course?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !courseMatch) return false;
    }

    return true;
  });

  // Filter Assessments
  const filteredAssessments = assessments.filter(assess => {
    if (selectedCourseId !== 'all') {
      return assess.courseId === selectedCourseId;
    }
    return true;
  });

  // Open Evaluation Modal
  const handleOpenEvaluation = (sub: Submission) => {
    setEvaluatingSubmission(sub);
    setEvalFeedback(sub.feedback || '');
    setEvalScoreOverride(sub.score || 0);
  };

  // Submit Evaluation
  const handlePerformEvaluation = async (action: 'Approved' | 'Rejected') => {
    if (!evaluatingSubmission) return;

    const loadingToast = toast.loading(`${action === 'Approved' ? 'Validating' : 'Rejecting'} submission...`);
    setIsSubmittingEval(true);

    try {
      const finalScore = evalScoreOverride !== null ? evalScoreOverride : evaluatingSubmission.score;
      await courseManagerAPI.evaluateSubmission(evaluatingSubmission.id, {
        action,
        score: finalScore,
        feedback: evalFeedback,
        stage: evaluatingSubmission.stage || 1
      });

      toast.success(
        action === 'Approved' 
          ? `Submission verified & approved! Learner notified & credential updated.` 
          : `Assessment set to revision required. Feedback delivered to learner.`, 
        { id: loadingToast }
      );

      // Update local state
      setSubmissions(prev => 
        prev.map(s => s.id === evaluatingSubmission.id ? {
          ...s,
          status: action,
          score: finalScore,
          feedback: evalFeedback,
          reviewed_by: 'Course Manager'
        } : s)
      );
      setEvaluatingSubmission(null);
      loadData();
    } catch (err) {
      console.error('Evaluation error:', err);
      toast.error('Failed to submit evaluation.', { id: loadingToast });
    } finally {
      setIsSubmittingEval(false);
    }
  };

  const handleResetAttempts = async (sub: Submission) => {
    const studentId = sub.studentId;
    const courseId = sub.courseId;
    if (!studentId || !courseId) {
      toast.error('Student or Course ID missing.');
      return;
    }
    if (!window.confirm(`Reset assessment attempts for ${sub.studentName} in "${sub.course}"? The student will be granted full retry attempts.`)) {
      return;
    }
    const tId = toast.loading(`Resetting attempts for ${sub.studentName}...`);
    try {
      const res = await courseManagerAPI.resetStudentAttempts(studentId, courseId);
      if (res && (res as any).success !== false) {
        toast.success(`Attempts successfully reset for ${sub.studentName}!`, { id: tId });
        loadData();
      } else {
        toast.error((res as any)?.message || 'Failed to reset attempts', { id: tId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error resetting attempts', { id: tId });
    }
  };

  // Assessment Builder Handlers
  const handleOpenCreateAssessment = () => {
    if (courses.length === 0) {
      toast.error('No academic courses available. Please add a course first before creating assessments.');
      return;
    }
    setEditingAssessmentId(null);
    setAssessmentForm({
      course_id: courses[0]?._id || courses[0]?.id || '',
      title: '',
      description: '',
      passing_score: 75,
      time_limit_mins: 20,
      max_attempts: 3,
      questions: [
        {
          id: `q_1_${Date.now()}`,
          text: '',
          options: ['', '', '', ''],
          correct_answer: 0,
          points: 1,
          explanation: ''
        }
      ]
    });
    setIsAssessmentModalOpen(true);
  };

  const handleOpenEditAssessment = (assess: CourseAssessment) => {
    setEditingAssessmentId(assess.id);
    setAssessmentForm({
      course_id: assess.courseId,
      title: assess.title,
      description: assess.description,
      passing_score: assess.passingScore,
      time_limit_mins: assess.timeLimitMins,
      max_attempts: assess.maxAttempts || 3,
      questions: assess.questions.map(q => ({
        id: q.id,
        text: q.text,
        options: [...q.options],
        correct_answer: q.correct_answer,
        points: q.points || 1,
        explanation: q.explanation || ''
      }))
    });
    setIsAssessmentModalOpen(true);
  };

  const handleAddQuestion = () => {
    setAssessmentForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `q_${prev.questions.length + 1}_${Date.now()}`,
          text: '',
          options: ['', '', '', ''],
          correct_answer: 0,
          points: 1,
          explanation: ''
        }
      ]
    }));
  };

  const handleRemoveQuestion = (idx: number) => {
    if (assessmentForm.questions.length <= 1) {
      toast.error('At least one question is required for an assessment.');
      return;
    }
    setAssessmentForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setAssessmentForm(prev => {
      const updated = [...prev.questions];
      updated[idx].text = text;
      return { ...prev, questions: updated };
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setAssessmentForm(prev => {
      const updated = [...prev.questions];
      const opts = [...updated[qIdx].options];
      opts[optIdx] = val;
      updated[qIdx].options = opts;
      return { ...prev, questions: updated };
    });
  };

  const handleCorrectAnswerSelect = (qIdx: number, optIdx: number) => {
    setAssessmentForm(prev => {
      const updated = [...prev.questions];
      updated[qIdx].correct_answer = optIdx;
      return { ...prev, questions: updated };
    });
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentForm.course_id) {
      toast.error('Please select an academic course.');
      return;
    }
    if (!assessmentForm.title.trim()) {
      toast.error('Assessment title is required.');
      return;
    }

    // Validate questions
    for (let i = 0; i < assessmentForm.questions.length; i++) {
      const q = assessmentForm.questions[i];
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1} prompt cannot be empty.`);
        return;
      }
      const filledOpts = q.options.filter(o => o.trim().length > 0);
      if (filledOpts.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 valid options.`);
        return;
      }
    }

    setIsSavingAssessment(true);
    const toastId = toast.loading('Saving course assessment & answer key...');

    try {
      const payload: any = {
        ...assessmentForm,
        id: editingAssessmentId || undefined
      };

      const res = await courseManagerAPI.saveCourseAssessment(payload);
      if (res && (res as any).success !== false) {
        toast.success(editingAssessmentId ? 'Assessment updated successfully!' : 'Course MCQ assessment published!', { id: toastId });
        setIsAssessmentModalOpen(false);
        // Refresh
        const freshAssessments = await courseManagerAPI.fetchCourseAssessments();
        if (freshAssessments && freshAssessments.data) {
          setAssessments((freshAssessments.data as any).assessments || []);
        }
      } else {
        toast.error((res as any)?.message || 'Failed to save assessment', { id: toastId });
      }
    } catch (err: any) {
      console.error('Error saving assessment:', err);
      toast.error(err?.message || 'Failed to save assessment', { id: toastId });
    } finally {
      setIsSavingAssessment(false);
    }
  };

  const handleDeleteAssessment = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await courseManagerAPI.deleteCourseAssessment(id);
      toast.success('Assessment removed successfully.');
      setAssessments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      toast.error('Failed to delete assessment.');
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'Pending').length;
  const approvedCount = submissions.filter(s => s.status === 'Approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'Rejected').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
      
      {/* ── TOP HEADER & ACTIONS ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ 
              padding: '4px 10px', borderRadius: '8px', 
              background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary, 
              fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' 
            }}>
              Academic Evaluation Engine
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Assessments & Evaluation Hub
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
            Configure MCQs for each course, track learner test attendance, and execute answers-based evaluations.
          </p>
        </div>

        {/* Primary View Switch & Add Assessment Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#fff', padding: '5px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <button
              onClick={() => setActiveTab('submissions')}
              style={{
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'submissions' ? brandPrimary : 'transparent',
                color: activeTab === 'submissions' ? '#fff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Activity size={15} /> Learner Submissions & Evaluation
              <span style={{ 
                padding: '2px 7px', borderRadius: '10px', 
                background: activeTab === 'submissions' ? 'rgba(255,255,255,0.25)' : '#f1f5f9', 
                color: activeTab === 'submissions' ? '#fff' : '#475569', 
                fontSize: '11px', fontWeight: 800 
              }}>
                {submissions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              style={{
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'assessments' ? brandPrimary : 'transparent',
                color: activeTab === 'assessments' ? '#fff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <ListChecks size={15} /> Course Assessments & MCQs
              <span style={{ 
                padding: '2px 7px', borderRadius: '10px', 
                background: activeTab === 'assessments' ? 'rgba(255,255,255,0.25)' : '#f1f5f9', 
                color: activeTab === 'assessments' ? '#fff' : '#475569', 
                fontSize: '11px', fontWeight: 800 
              }}>
                {assessments.length}
              </span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateAssessment}
            style={{
              padding: '11px 20px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${brandPrimary} 0%, #172147 100%)`,
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 16px rgba(35, 49, 103, 0.25)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={16} /> + Create Course Assessment
          </button>
        </div>
      </div>

      {/* ── COURSE SELECTOR & FILTER BAR ── */}
      <div style={{ 
        background: '#fff', padding: '18px 24px', borderRadius: '20px', 
        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        {/* Respected Course Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '320px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: brandPrimary, fontWeight: 800, fontSize: '13px' }}>
            <BookOpen size={18} /> Course:
          </div>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              fontSize: '13px',
              fontWeight: 700,
              color: '#1e293b',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">🌐 All Academic Courses ({courses.length})</option>
            {courses.map(c => {
              const cid = c._id || c.id;
              return (
                <option key={cid} value={cid}>
                  {c.title}
                </option>
              );
            })}
          </select>
        </div>

        {/* Tab-Specific Filters */}
        {activeTab === 'submissions' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search learner name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1e293b',
                  outline: 'none'
                }}
              />
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
              {(['All', 'Pending', 'Reviewed'] as const).map(s => {
                const count = s === 'All' ? submissions.length : s === 'Pending' ? pendingCount : (approvedCount + rejectedCount);
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: statusFilter === s ? '#fff' : 'transparent',
                      color: statusFilter === s ? brandPrimary : '#64748b',
                      boxShadow: statusFilter === s ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    {s} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── METRIC STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Evaluation</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{pendingCount}</div>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>Awaiting manager action</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Passed & Certified</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{approvedCount}</div>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>Met competency standards</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(200, 16, 46, 0.1)', color: brandRed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Revision Required</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{rejectedCount}</div>
            <div style={{ fontSize: '11px', color: brandRed, fontWeight: 700 }}>Feedback shared for retake</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Course MCQs Configured</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{assessments.length}</div>
            <div style={{ fontSize: '11px', color: brandPrimary, fontWeight: 700 }}>Active question banks</div>
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === 'submissions' ? (
        /* ========================================================================= */
        /* TAB 1: LEARNER SUBMISSIONS & EVALUATION QUEUE                            */
        /* ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} style={{ height: '180px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }} className="skeleton-pulse"></div>
            ))
          ) : filteredSubmissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 20px', background: '#fff', borderRadius: '28px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#94a3b8' }}>
                <CheckCircle2 size={36} color="#10b981" />
              </div>
              <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontWeight: 800, fontSize: '18px' }}>
                {courses.length === 0 ? 'No Academic Courses Available' : 'No Assessment Submissions Found'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '440px', margin: '0 auto' }}>
                {courses.length === 0 
                  ? 'There are currently no courses in the database. When courses are added and learners submit assessments, attempts will appear here for evaluation.'
                  : 'No learner attempts match the selected course filter and status. When learners attend assessments, their test answers will appear here for evaluation.'}
              </p>
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const isPending = sub.status === 'Pending';
              const isPassed = sub.status === 'Approved' || (sub.score >= (sub.passing_score || 75));

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: '#fff',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    boxShadow: isPending ? '0 8px 24px rgba(200, 16, 46, 0.04)' : 'none',
                    borderLeft: isPending ? `5px solid ${brandRed}` : (sub.status === 'Approved' ? '5px solid #10b981' : '5px solid #f59e0b')
                  }}
                >
                  {/* Left Column: Student Identity & Course Info */}
                  <div style={{ width: '320px', minWidth: '280px', padding: '28px', background: '#fcfdfe', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ 
                        width: '46px', height: '46px', borderRadius: '14px', background: brandPrimary, 
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontWeight: 800, fontSize: '16px'
                      }}>
                        {sub.studentName?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{sub.studentName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{sub.studentEmail || 'Learner Candidate'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                          Respected Academic Track
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '13px' }}>
                          <BookOpen size={15} color={brandPrimary} /> {sub.course}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                          Assessment Component
                        </label>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', background: 'rgba(35, 49, 103, 0.06)', color: brandPrimary, fontSize: '12px', fontWeight: 700 }}>
                          <FileText size={13} /> {sub.assessmentTitle || sub.assessmentType}
                        </div>
                      </div>

                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                        Attempted: {sub.submittedAt}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Auto-Score & Answers Metrics */}
                  <div style={{ flex: 1, minWidth: '300px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '18px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Evaluation Result
                          </span>
                          <span style={{
                            padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                            background: sub.status === 'Approved' ? '#ecfdf5' : (sub.status === 'Rejected' ? '#fef2f2' : '#fffbeb'),
                            color: sub.status === 'Approved' ? '#10b981' : (sub.status === 'Rejected' ? '#ef4444' : '#d97706'),
                            border: `1px solid ${sub.status === 'Approved' ? '#a7f3d0' : (sub.status === 'Rejected' ? '#fecaca' : '#fde68a')}`
                          }}>
                            {sub.status === 'Approved' ? 'PASSED & APPROVED' : (sub.status === 'Rejected' ? 'REVISION REQUIRED' : 'EVALUATION PENDING')}
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                          Passing Target: {sub.passing_score || 75}%
                        </div>
                      </div>

                      {/* Performance Bar */}
                      <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '26px', fontWeight: 900, color: isPassed ? '#10b981' : (isPending ? brandPrimary : '#ef4444') }}>
                            {sub.score}%
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                            {sub.answers?.length > 0 ? (
                              <span>{sub.correct_count} of {sub.total_questions} Questions Answered Correctly</span>
                            ) : (
                              <span>Score verified against answer key</span>
                            )}
                          </div>
                        </div>

                        {sub.answers && sub.answers.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {sub.answers.map((ans, idx) => (
                              <div
                                key={idx}
                                title={`Q${idx + 1}: ${ans.is_correct ? 'Correct' : 'Incorrect'}`}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  background: ans.is_correct ? '#dcfce7' : '#fee2e2',
                                  color: ans.is_correct ? '#166534' : '#991b1b',
                                  border: `1px solid ${ans.is_correct ? '#86efac' : '#fca5a5'}`
                                }}
                              >
                                {idx + 1}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {sub.feedback && (
                        <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '12px', background: '#f8fafc', borderLeft: `3px solid ${brandPrimary}`, fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                          <strong>Manager Feedback:</strong> "{sub.feedback}"
                        </div>
                      )}
                    </div>

                    {/* Action Area */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: 'auto', paddingTop: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleResetAttempts(sub)}
                        title="Reset attempt counter for this learner so they can retry"
                        style={{
                          padding: '11px 16px',
                          borderRadius: '12px',
                          background: '#fff',
                          color: '#d97706',
                          border: '1px solid #fde68a',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <RefreshCw size={14} />
                        Reset Attempts
                      </button>
                      <button
                        onClick={() => handleOpenEvaluation(sub)}
                        style={{
                          padding: '11px 22px',
                          borderRadius: '12px',
                          background: isPending ? brandPrimary : '#fff',
                          color: isPending ? '#fff' : brandPrimary,
                          border: isPending ? 'none' : `1px solid ${brandPrimary}`,
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: isPending ? '0 4px 12px rgba(35, 49, 103, 0.2)' : 'none'
                        }}
                      >
                        <ListChecks size={16} /> 
                        {isPending ? 'Evaluate & Grade Attempt' : 'View Evaluation Breakdown'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* TAB 2: COURSE ASSESSMENT & MCQ BUILDER VIEW                              */
        /* ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
              Configured Course Assessments ({filteredAssessments.length})
            </h3>
            <button
              onClick={handleOpenCreateAssessment}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                background: brandPrimary,
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={15} /> Add New Assessment
            </button>
          </div>

          {filteredAssessments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 20px', background: '#fff', borderRadius: '28px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#94a3b8' }}>
                <Layers size={32} color="#94a3b8" />
              </div>
              <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontWeight: 800, fontSize: '18px' }}>
                {courses.length === 0 ? 'No Academic Courses Available' : 'No Course Assessments Configured'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '440px', margin: '0 auto' }}>
                {courses.length === 0 
                  ? 'There are currently no active courses in the database. Add courses in Course Management to begin creating assessments.' 
                  : 'No assessments found for the selected course filter. Click "+ Create Course Assessment" above to define multiple-choice questions.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {filteredAssessments.map((assess) => (
              <motion.div
                key={assess.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: '#fff',
                  borderRadius: '22px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '18px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '8px', background: 'rgba(35, 49, 103, 0.08)', 
                      color: brandPrimary, fontSize: '11px', fontWeight: 800 
                    }}>
                      {assess.courseTitle}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '8px', background: '#ecfdf5', 
                        color: '#059669', fontSize: '11px', fontWeight: 800 
                      }}>
                        Pass: {assess.passingScore}%
                      </span>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '8px', background: '#fef3c7', 
                        color: '#b45309', fontSize: '11px', fontWeight: 800 
                      }}>
                        Max: {assess.maxAttempts || 3} Attempts
                      </span>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                    {assess.title}
                  </h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {assess.description || 'Comprehensive assessment configured for learners in this track.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                      <HelpCircle size={15} color={brandPrimary} /> {assess.questionsCount} MCQs
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                      <Clock size={15} color="#d97706" /> {assess.timeLimitMins} Mins
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <button
                    onClick={() => handleOpenEditAssessment(assess)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      color: '#1e293b',
                      border: '1px solid #e2e8f0',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Edit3 size={14} /> Edit Questions & Key
                  </button>
                  <button
                    onClick={() => handleDeleteAssessment(assess.id, assess.title)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '10px',
                      background: '#fff',
                      color: '#ef4444',
                      border: '1px solid #fee2e2',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete assessment"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVALUATION MODAL: ANSWERS BREAKDOWN & MANAGER ACTION                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {evaluatingSubmission && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                background: '#fff',
                width: '100%',
                maxWidth: '850px',
                maxHeight: '90vh',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '24px 30px', borderBottom: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', background: brandPrimary,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '16px'
                  }}>
                    {evaluatingSubmission.studentName?.charAt(0) || 'L'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                      Assessment Evaluation: {evaluatingSubmission.studentName}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                      Course: <strong>{evaluatingSubmission.course}</strong> • {evaluatingSubmission.assessmentTitle}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEvaluatingSubmission(null)}
                  style={{
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: '#64748b'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body: Scrollable evaluation content */}
              <div style={{ padding: '26px 30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Score summary banner */}
                <div style={{
                  background: evaluatingSubmission.score >= (evaluatingSubmission.passing_score || 75) ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${evaluatingSubmission.score >= (evaluatingSubmission.passing_score || 75) ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '16px',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: evaluatingSubmission.score >= (evaluatingSubmission.passing_score || 75) ? '#10b981' : '#ef4444',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {evaluatingSubmission.score >= (evaluatingSubmission.passing_score || 75) ? <Check size={26} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: evaluatingSubmission.score >= (evaluatingSubmission.passing_score || 75) ? '#166534' : '#991b1b' }}>
                        Evaluated Score Against Designated Answer Key
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b' }}>
                        {evaluatingSubmission.score}% ({evaluatingSubmission.correct_count} of {evaluatingSubmission.total_questions} Correct)
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Required Passing Threshold</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{evaluatingSubmission.passing_score || 75}%</div>
                  </div>
                </div>

                {/* Question-by-Question Comparison Breakdown */}
                <div>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Detailed Answers Analysis
                  </h4>

                  {evaluatingSubmission.answers && evaluatingSubmission.answers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {evaluatingSubmission.answers.map((item, idx) => {
                        const isMatch = item.is_correct;
                        return (
                          <div
                            key={idx}
                            style={{
                              borderRadius: '16px',
                              border: `1.5px solid ${isMatch ? '#86efac' : '#fca5a5'}`,
                              background: isMatch ? '#fafffc' : '#fffbfa',
                              padding: '18px 22px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  width: '24px', height: '24px', borderRadius: '50%',
                                  background: isMatch ? '#10b981' : '#ef4444', color: '#fff',
                                  fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  {idx + 1}
                                </span>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>
                                  {item.question_text}
                                </span>
                              </div>

                              <span style={{
                                padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800,
                                background: isMatch ? '#dcfce7' : '#fee2e2',
                                color: isMatch ? '#166534' : '#991b1b',
                                display: 'flex', alignItems: 'center', gap: '4px'
                              }}>
                                {isMatch ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                {isMatch ? '+1 Point (Correct)' : '0 Points (Incorrect)'}
                              </span>
                            </div>

                            {/* Option list with Learner vs Correct indicators */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px', marginTop: '12px' }}>
                              {item.options?.map((opt, optIdx) => {
                                const isLearnerSelected = item.selected_option === optIdx;
                                const isCorrectAnswer = item.correct_answer === optIdx;

                                let optBg = '#fff';
                                let optBorder = '#e2e8f0';
                                let optColor = '#475569';

                                if (isCorrectAnswer) {
                                  optBg = '#ecfdf5';
                                  optBorder = '#10b981';
                                  optColor = '#065f46';
                                }
                                if (isLearnerSelected && !isCorrectAnswer) {
                                  optBg = '#fef2f2';
                                  optBorder = '#ef4444';
                                  optColor = '#991b1b';
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '10px',
                                      background: optBg,
                                      border: `1.5px solid ${optBorder}`,
                                      color: optColor,
                                      fontSize: '12px',
                                      fontWeight: (isLearnerSelected || isCorrectAnswer) ? 700 : 500,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontWeight: 800, color: '#94a3b8' }}>
                                        {String.fromCharCode(65 + optIdx)}.
                                      </span>
                                      <span>{opt}</span>
                                    </div>

                                    <div>
                                      {isCorrectAnswer && (
                                        <span style={{ fontSize: '10px', background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                          CORRECT KEY
                                        </span>
                                      )}
                                      {isLearnerSelected && !isCorrectAnswer && (
                                        <span style={{ fontSize: '10px', background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                          LEARNER CHOICE
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                      Payload: {evaluatingSubmission.content?.text || 'Standard assessment submission payload.'}
                      {evaluatingSubmission.content?.url && (
                        <div style={{ marginTop: '8px' }}>
                          <a href={evaluatingSubmission.content.url} target="_blank" rel="noreferrer" style={{ color: brandPrimary, fontWeight: 700, textDecoration: 'none' }}>
                            View Attached Asset ({evaluatingSubmission.content.url}) →
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Score adjustment & Manager Feedback input */}
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                      Official Evaluator Feedback & Guidance
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700 }}>
                      <span>Score Adjust (%):</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={evalScoreOverride ?? evaluatingSubmission.score}
                        onChange={e => setEvalScoreOverride(Number(e.target.value))}
                        style={{ width: '65px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800, textAlign: 'center' }}
                      />
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Enter strategic evaluation feedback for this learner (e.g. Excellent grasp of cryptographic layers, consider reviewing firewall policies)..."
                    value={evalFeedback}
                    onChange={e => setEvalFeedback(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#1e293b',
                      outline: 'none',
                      fontFamily: 'inherit',
                      lineHeight: 1.5
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer: Action Buttons */}
              <div style={{
                padding: '20px 30px', borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'flex-end', gap: '12px',
                background: '#fff'
              }}>
                <button
                  type="button"
                  disabled={isSubmittingEval}
                  onClick={() => handlePerformEvaluation('Rejected')}
                  style={{
                    padding: '12px 22px', borderRadius: '12px',
                    background: '#fff', color: '#ef4444',
                    border: '1.5px solid #fee2e2',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <XCircle size={16} /> Request Refinement / Retake
                </button>

                <button
                  type="button"
                  disabled={isSubmittingEval}
                  onClick={() => handlePerformEvaluation('Approved')}
                  style={{
                    padding: '12px 26px', borderRadius: '12px',
                    background: '#10b981', color: '#fff',
                    border: 'none', fontWeight: 800, fontSize: '13px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {isSubmittingEval ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Validate & Approve Assessment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MCQ ASSESSMENT CREATOR / EDITOR MODAL                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAssessmentModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                background: '#fff',
                width: '100%',
                maxWidth: '850px',
                maxHeight: '90vh',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '24px 30px', borderBottom: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                    {editingAssessmentId ? 'Edit Course MCQ Assessment' : 'Create Course Assessment & Answer Key'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Define multiple-choice questions, set designated correct answers, and configure passing thresholds.
                  </p>
                </div>
                <button
                  onClick={() => setIsAssessmentModalOpen(false)}
                  style={{
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: '#64748b'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveAssessment} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ padding: '26px 30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  
                  {/* Course Selector & Title */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Target Course *
                      </label>
                      <select
                        value={assessmentForm.course_id}
                        onChange={e => setAssessmentForm(prev => ({ ...prev, course_id: e.target.value }))}
                        required
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '12px',
                          border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700,
                          color: '#1e293b', background: '#f8fafc', outline: 'none'
                        }}
                      >
                        {courses.map(c => {
                          const cid = c._id || c.id;
                          return (
                            <option key={cid} value={cid}>
                              {c.title}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Assessment Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Module 1: Core Principles MCQ Assessment"
                        value={assessmentForm.title}
                        onChange={e => setAssessmentForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '12px',
                          border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600,
                          color: '#1e293b', outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Description & Criteria */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Instructions / Description
                      </label>
                      <input
                        type="text"
                        placeholder="Instructions for the learner..."
                        value={assessmentForm.description}
                        onChange={e => setAssessmentForm(prev => ({ ...prev, description: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '12px',
                          border: '1px solid #cbd5e1', fontSize: '13px', color: '#1e293b', outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={assessmentForm.passing_score}
                        onChange={e => setAssessmentForm(prev => ({ ...prev, passing_score: Number(e.target.value) }))}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '12px',
                          border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, color: '#1e293b', outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Time Limit (Mins)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={assessmentForm.time_limit_mins}
                        onChange={e => setAssessmentForm(prev => ({ ...prev, time_limit_mins: Number(e.target.value) }))}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '12px',
                          border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, color: '#1e293b', outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Max Attempts Limit
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={assessmentForm.max_attempts}
                        onChange={e => setAssessmentForm(prev => ({ ...prev, max_attempts: Math.max(1, Number(e.target.value) || 1) }))}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '12px',
                          border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, color: '#1e293b', outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* ── QUESTIONS LIST ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Questions & Designated Correct Answer Keys ({assessmentForm.questions.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        style={{
                          padding: '6px 12px', borderRadius: '8px',
                          background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary,
                          border: 'none', fontWeight: 800, fontSize: '12px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <Plus size={14} /> Add Another Question
                      </button>
                    </div>

                    {assessmentForm.questions.map((q, qIdx) => (
                      <div
                        key={q.id || qIdx}
                        style={{
                          background: '#f8fafc',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: brandPrimary }}>
                            Question {qIdx + 1}
                          </span>
                          {assessmentForm.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder="Type question prompt here..."
                          value={q.text}
                          onChange={e => handleQuestionTextChange(qIdx, e.target.value)}
                          required
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: '10px',
                            border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600,
                            color: '#1e293b', background: '#fff', outline: 'none'
                          }}
                        />

                        {/* Options A-D with correct answer selector */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                            Options (Select the radio button for the correct answer):
                          </span>

                          {q.options.map((opt, optIdx) => {
                            const isSelected = q.correct_answer === optIdx;
                            return (
                              <div
                                key={optIdx}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '10px',
                                  background: isSelected ? '#ecfdf5' : '#fff',
                                  padding: '8px 12px', borderRadius: '10px',
                                  border: `1.5px solid ${isSelected ? '#10b981' : '#e2e8f0'}`
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`correct_q_${qIdx}`}
                                  checked={isSelected}
                                  onChange={() => handleCorrectAnswerSelect(qIdx, optIdx)}
                                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                                <span style={{ fontWeight: 800, fontSize: '12px', color: isSelected ? '#10b981' : '#94a3b8' }}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <input
                                  type="text"
                                  placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                                  value={opt}
                                  onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                                  required
                                  style={{
                                    flex: 1, border: 'none', background: 'transparent',
                                    fontSize: '13px', color: '#1e293b', outline: 'none', fontWeight: isSelected ? 700 : 500
                                  }}
                                />
                                {isSelected && (
                                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', background: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>
                                    CORRECT KEY
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{
                  padding: '20px 30px', borderTop: '1px solid #e2e8f0',
                  display: 'flex', justifyContent: 'flex-end', gap: '12px',
                  background: '#fff'
                }}>
                  <button
                    type="button"
                    onClick={() => setIsAssessmentModalOpen(false)}
                    style={{
                      padding: '11px 20px', borderRadius: '12px',
                      background: '#fff', color: '#64748b', border: '1px solid #cbd5e1',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingAssessment}
                    style={{
                      padding: '11px 24px', borderRadius: '12px',
                      background: brandPrimary, color: '#fff',
                      border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 14px rgba(35, 49, 103, 0.25)'
                    }}
                  >
                    {isSavingAssessment ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {editingAssessmentId ? 'Update Assessment & Key' : 'Save & Publish Assessment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .skeleton-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
};

export default CM_Assessments;
