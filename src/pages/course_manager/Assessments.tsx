import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Github, Video, 
  FileText, ExternalLink, Clock, User, 
  BookOpen, Filter, Search, Loader2, 
  AlertCircle, ChevronRight, Activity,
  CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { courseManagerAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Submission {
  id: string;
  studentName: string;
  course: string;
  assessmentType: string;
  submittedAt: string;
  content: {
    type: 'github' | 'video' | 'text';
    url?: string;
    text?: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
}

const CM_Assessments: React.FC = () => {
  const brandPrimary = '#c8102e';
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Reviewed'>('Pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setIsLoading(true);
        const response = await courseManagerAPI.fetchSubmissions();
        setSubmissions(response.data || []);
      } catch (err) {
        setError('Failed to load submissions.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSubmissions();
  }, []);

  const handleAction = async (id: string, action: 'Approved' | 'Rejected') => {
    const loadingToast = toast.loading(`${action === 'Approved' ? 'Approving' : 'Rejecting'} submission...`);
    try {
      setProcessingId(id);
      await courseManagerAPI.updateSubmissionStatus(id, action);
      setSubmissions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, status: action } : sub)
      );
      toast.success(`Submission ${action.toLowerCase()} successfully!`, { id: loadingToast });
    } catch (err) {
      toast.error(`Failed to update status.`, { id: loadingToast });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return sub.status === 'Pending';
    if (filter === 'Reviewed') return sub.status !== 'Pending';
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'github': return <Github size={18} />;
      case 'video': return <Video size={18} />;
      case 'text': return <FileText size={18} />;
      default: return <ExternalLink size={18} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Assessment Queue</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Validate learner competency through strategic submission review.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '6px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          {(['Pending', 'Reviewed', 'All'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: filter === f ? brandPrimary : 'transparent',
                color: filter === f ? '#fff' : '#64748b',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {f}
              {f === 'Pending' && submissions.some(s => s.status === 'Pending') && (
                <span style={{ padding: '2px 6px', borderRadius: '6px', background: filter === f ? 'rgba(255,255,255,0.2)' : 'rgba(200, 16, 46, 0.1)', color: filter === f ? '#fff' : brandPrimary, fontSize: '10px' }}>
                  {submissions.filter(s => s.status === 'Pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Mini Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
         <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><Clock size={20} /></div>
            <div>
               <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Awaiting Review</div>
               <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{submissions.filter(s => s.status === 'Pending').length}</div>
            </div>
         </div>
         <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><CheckCircle2 size={20} /></div>
            <div>
               <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Validated Today</div>
               <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>14</div>
            </div>
         </div>
      </div>

      {/* Submissions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} style={{ height: '200px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }} className="skeleton-pulse"></div>
          ))
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
             <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '16px' }} />
             <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 800 }}>Queue Fully Optimized</h3>
             <p style={{ color: '#64748b', fontSize: '14px' }}>All submissions have been processed for the current filters.</p>
          </div>
        ) : filteredSubmissions.map((sub) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fff',
              borderRadius: '28px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row',
              boxShadow: sub.status === 'Pending' ? '0 10px 30px rgba(200, 16, 46, 0.05)' : 'none'
            }}
          >
            {/* Left Info Panel */}
            <div style={{ width: '300px', padding: '32px', background: '#fcfdfe', borderRight: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '44px', height: '44px', borderRadius: '12px', background: brandPrimary, 
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 
                  }}>
                    {sub.studentName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{sub.studentName}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>SUBMITTED {sub.submittedAt.toUpperCase()}</div>
                  </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Academic Track</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600, fontSize: '13px' }}>
                      <BookOpen size={14} color={brandPrimary} /> {sub.course}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Component</label>
                    <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '8px', background: 'rgba(200, 16, 46, 0.05)', color: brandPrimary, fontSize: '12px', fontWeight: 700 }}>
                      {sub.assessmentType}
                    </div>
                  </div>
               </div>
            </div>

            {/* Right Content Panel */}
            <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submission Payload</h4>
                  {sub.status !== 'Pending' && (
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800,
                      background: sub.status === 'Approved' ? '#ecfdf5' : '#fff1f1',
                      color: sub.status === 'Approved' ? '#10b981' : '#ef4444'
                    }}>
                      {sub.status === 'Approved' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {sub.status.toUpperCase()}
                    </div>
                  )}
               </div>

               <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                  {sub.content.type === 'text' ? (
                    <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6, fontStyle: 'italic' }}>"{sub.content.text}"</p>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                            {getIconForType(sub.content.type)}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{sub.content.type === 'github' ? 'Version Control Repository' : 'Video Demonstration'}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.content.url}</div>
                          </div>
                       </div>
                       <a 
                         href={sub.content.url} target="_blank" rel="noreferrer"
                         style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
                       >
                         View Asset <ExternalLink size={14} />
                       </a>
                    </div>
                  )}
               </div>

               {sub.status === 'Pending' && (
                 <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    <button 
                      onClick={() => handleAction(sub.id, 'Approved')}
                      style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)' }}
                    >
                      {processingId === sub.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Approve Submission
                    </button>
                    <button 
                      onClick={() => handleAction(sub.id, 'Rejected')}
                      style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#fff', color: '#ef4444', border: '1px solid #fee2e2', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {processingId === sub.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />} Request Refinement
                    </button>
                 </div>
               )}
            </div>
          </motion.div>
        ))}
      </div>
      <style>{`
        .skeleton-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
};

export default CM_Assessments;
