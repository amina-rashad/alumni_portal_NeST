import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, 
  Clock, Send, Code, Video, Link as LinkIcon, 
  ChevronRight, Lock, BookOpen, Star, RefreshCcw
} from 'lucide-react';
import { assessmentsApi, coursesApi } from '../services/api';

const AssessmentCenter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeStage, setActiveStage] = useState(1);
  
  // Form states for different stages
  const [scenarioText, setScenarioText] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const [debugExplanation, setDebugExplanation] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [courseRes, assessRes] = await Promise.all([
        coursesApi.getCourseById(id),
        assessmentsApi.getAssessmentStatus(id)
      ]);
      
      if (courseRes.success) setCourse((courseRes.data as any).course);
      if (assessRes.success) setAttempt((assessRes.data as any).attempt);
      
    } catch (err) {
      console.error('Error fetching assessment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (attempt) {
      setActiveStage(attempt.current_stage);
    }
  }, [attempt]);

  const handleSubmit = async (stage: number, payload: any) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await assessmentsApi.submitStage(id, stage, payload);
      if (res.success) {
        alert(res.message);
        fetchData(); // Refresh status
      } else {
        alert(res.message || 'Submission failed.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '1.5rem' }} />
        <h2>Assessment NOT Found</h2>
        <p>Please ensure you are enrolled and have finished the course modules.</p>
        <Link to="/courses/my-courses">Back to My Courses</Link>
      </div>
    );
  }

  const stageStatus = attempt.stages[activeStage.toString()]?.status;

  const renderStageContent = () => {
    if (stageStatus === 'pending' && activeStage < 5) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
            <CheckCircle2 size={40} color="#16a34a" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Stage {activeStage} Submitted!</h3>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto', marginBottom: '2rem' }}>
            Expert review is pending, but you can continue to the next stage immediately.
          </p>
          <button 
            onClick={() => {
              const required = attempt.required_assessments || [1, 2, 3, 4, 5];
              const nextStages = required.filter((s: number) => s > activeStage);
              if(nextStages.length > 0) setActiveStage(Math.min(...nextStages));
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--primary)', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Go to Next Stage <ChevronRight size={18} />
          </button>
        </div>
      );
    }

    if (stageStatus === 'pending' && activeStage === 5) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
            <Clock size={40} color="#f97316" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Review in Progress</h3>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            Your submission for Stage {activeStage} is currently being reviewed by our expert panel. 
            Estimated time: 24-48 hours. Check back soon!
          </p>
        </div>
      );
    }

    if (stageStatus === 'rejected') {
        const feedback = attempt.stages[activeStage.toString()]?.feedback;
        return (
            <div style={{ padding: '3rem', backgroundColor: '#fef2f2', borderRadius: '1.5rem', border: '1px solid #fee2e2' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#dc2626' }}>
                    <AlertCircle size={24} />
                    <h3 style={{ margin: 0, fontWeight: 800 }}>Revision Required</h3>
                 </div>
                 <p style={{ color: '#991b1b', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
                    <strong>Admin Feedback:</strong> {feedback || "Please review your submission and try again."}
                 </p>
                 <button 
                  onClick={() => {
                    // Logic to reset status from rejected back to not_started if needed, 
                    // but for now we just show the form again in the next renders
                  }}
                  style={{ backgroundColor: '#dc2626', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700 }}
                 >
                    Retry Submission
                 </button>
            </div>
        );
    }

    switch (activeStage) {
      case 1:
        return (
          <div style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Stage 1: Automated Quiz</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Test your fundamental knowledge gained from the course modules.</p>
            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '1rem', border: '1px dashed #e2e8f0' }}>
                 <p style={{ fontWeight: 600, color: '#0f172a' }}>Quiz Ready</p>
                 <p style={{ fontSize: '0.9rem', color: '#64748b' }}>This quiz consists of 15 multiple-choice questions. Passing score: 80%.</p>
                 <button 
                    onClick={() => handleSubmit(1, { score: 100 })} // Mocking pass for demonstration
                    style={{ background: '#0d2046', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700, marginTop: '1.5rem' }}
                >
                    Start Quiz Now
                </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Stage 2: Scenario Analysis</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Provide a strategic solution to the problem statement provided below.</p>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
                 <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: 800, margin: 0, color: '#0d2046' }}>Problem Statement</p>
                    <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '0.5rem' }}>
                        "A legacy system is experiencing intermittent downtime during peak hours due to a database locking issue. 
                        Outline a migration strategy to a serverless architecture while maintaining zero downtime."
                    </p>
                 </div>
                 <textarea 
                    placeholder="Type your strategic response here..."
                    value={scenarioText}
                    onChange={(e) => setScenarioText(e.target.value)}
                    style={{ width: '100%', minHeight: '300px', padding: '1.5rem', border: 'none', outline: 'none', fontSize: '1.05rem', lineHeight: 1.6 }}
                 />
                 <div style={{ padding: '1.5rem', textAlign: 'right', backgroundColor: '#f9fafb' }}>
                    <button 
                        disabled={scenarioText.length < 50 || submitting}
                        onClick={() => handleSubmit(2, { response: scenarioText })}
                        style={{ background: '#0d2046', color: 'white', padding: '0.8rem 2rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700, opacity: (scenarioText.length < 50 || submitting) ? 0.6 : 1 }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Analysis'}
                    </button>
                 </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Stage 3: Debugging Round</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <p style={{ fontWeight: 700, marginBottom: '1rem' }}>Broken Implementation</p>
                    <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', fontSize: '0.85rem', overflowX: 'auto' }}>
{`function calculateAverage(nums) {
  let total = 0;
  for (let i = 0; i <= nums.length; i++) {
    total += nums[i];
  }
  return total / nums.length;
}`}
                    </pre>
                </div>
                <div>
                    <p style={{ fontWeight: 700, marginBottom: '1rem' }}>Your Fixed Code</p>
                    <textarea 
                        value={debugCode}
                        onChange={(e) => setDebugCode(e.target.value)}
                        placeholder="// Paste fixed code here..."
                        style={{ width: '100%', height: '140px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1rem', fontFamily: 'monospace' }}
                    />
                    <p style={{ fontWeight: 700, margin: '1.5rem 0 0.5rem 0' }}>Explanation</p>
                    <textarea 
                        value={debugExplanation}
                        onChange={(e) => setDebugExplanation(e.target.value)}
                        placeholder="Explain why the fix works..."
                        style={{ width: '100%', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1rem' }}
                    />
                    <button 
                        disabled={!debugCode || submitting}
                        onClick={() => handleSubmit(3, { code: debugCode, explanation: debugExplanation })}
                        style={{ width: '100%', marginTop: '1.5rem', background: '#0d2046', color: 'white', padding: '1rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700 }}
                    >
                        Submit Corrected Code
                    </button>
                </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
                <LinkIcon size={40} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Stage 4: Industry Project</h3>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                Apply your skills to build a production-ready application. 
                Host your source code on GitHub and provide the repository link for evaluation.
            </p>
            <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>GitHub Repository URL</label>
                <input 
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    style={{ width: '100%', padding: '1.25rem', borderRadius: '0.75rem', border: '2px solid #e2e8f0', marginBottom: '2rem', fontSize: '1rem', outline: 'none' }}
                />
                <button 
                    disabled={!projectUrl.includes('github.com') || submitting}
                    onClick={() => handleSubmit(4, { repo_url: projectUrl })}
                    style={{ width: '100%', background: '#0d2046', color: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                >
                    <Send size={18} /> Submit Project for Review
                </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
                <Video size={40} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Stage 5: High-Level Review</h3>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                The final phase! Submit a recorded video demonstration of your project. 
                Explain your architecture, challenges, and core features.
            </p>
            <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem' }}>Link to Video Demo</label>
                <input 
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="YouTube, Vimeo, or Drive Link"
                    style={{ width: '100%', padding: '1.25rem', borderRadius: '0.75rem', border: '2px solid #e2e8f0', marginBottom: '2rem', fontSize: '1rem', outline: 'none' }}
                />
                <button 
                    disabled={!videoUrl || submitting}
                    onClick={() => handleSubmit(5, { video_url: videoUrl })}
                    style={{ width: '100%', background: '#d32f2f', color: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: 'none', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(211,47,47,0.2)' }}
                >
                    Complete Final Review
                </button>
            </div>
          </div>
        );
      default:
        return <p>Unknown assessment stage.</p>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '4rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Navigation & Header */}
        <div style={{ marginBottom: '3rem' }}>
          <Link to="/courses/my-courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to My Courses
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0d2046', margin: 0 }}>
                Course <span style={{ color: 'var(--primary)' }}>Assessment</span>
              </h1>
              <p style={{ color: '#475569', fontSize: '1.1rem', marginTop: '0.5rem' }}>{course?.title || 'Loading Course...'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ backgroundColor: '#ffffff', padding: '0.5rem 1.5rem', borderRadius: '2rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <Star size={16} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>Stage {activeStage} of {(attempt.required_assessments || [1, 2, 3, 4, 5]).length}</span>
               </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          
          {/* Progress Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(attempt.required_assessments || [1, 2, 3, 4, 5]).map((s: number) => {
              const isActive = s === activeStage;
              const isPast = (attempt?.stages[s.toString()]?.status === 'passed' || attempt?.stages[s.toString()]?.status === 'pending');
              const isFuture = s > (attempt?.current_stage || 1);
              const isSelectable = !isFuture;
              
              return (
                <div 
                  key={s} 
                  onClick={() => isSelectable && setActiveStage(s)}
                  style={{ 
                    padding: '1.25rem', 
                    borderRadius: '1rem', 
                    background: isActive ? 'white' : 'transparent',
                    border: isActive ? '1px solid #e2e8f0' : '1px solid transparent',
                    boxShadow: isActive ? '0 10px 15px -3px rgba(0,0,0,0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    opacity: isSelectable ? 1 : 0.5,
                    cursor: isSelectable ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: isPast ? '#10B981' : isActive ? 'var(--primary)' : '#e2e8f0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.8rem'
                  }}>
                    {isPast ? <CheckCircle2 size={16} /> : s}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: isSelectable ? '#0d2046' : '#64748b', fontSize: '0.9rem' }}>
                      {s === 1 ? 'Automated Quiz' : s === 2 ? 'Scenario Analysis' : s === 3 ? 'Debugging Round' : s === 4 ? 'Industry Project' : 'High-Level Review'}
                    </p>
                    {isActive && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>Active View</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Assessment Area */}
          <div style={{ 
            background: 'white', 
            borderRadius: '2rem', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.04)', 
            border: '1px solid #f1f5f9',
            overflow: 'hidden'
          }}>
             <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage + stageStatus}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                    {renderStageContent()}
                </motion.div>
             </AnimatePresence>
          </div>

        </div>

      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AssessmentCenter;
