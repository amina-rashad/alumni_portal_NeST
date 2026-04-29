import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Github, 
  Video, 
  FileText, 
  ExternalLink,
  Clock,
  User,
  BookOpen,
  Filter,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { courseManagerAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Submission {
  id: string;
  studentName: string;
  course: string;
  assessmentType: string; // Changed to string for flexibility with API data
  submittedAt: string;
  content: {
    type: 'github' | 'video' | 'text';
    url?: string;
    text?: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
}

const CM_Assessments: React.FC = () => {
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
        setSubmissions(response.data as Submission[]);
      } catch (err) {
        setError('Failed to load submissions. Please try again later.');
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
      console.error('Failed to update status', err);
      toast.error(`Failed to ${action.toLowerCase()} submission.`, { id: loadingToast });
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
      case 'github': return <Github size={18} className="text-slate-700" />;
      case 'video': return <Video size={18} className="text-purple-600" />;
      case 'text': return <FileText size={18} className="text-emerald-600" />;
      default: return <ExternalLink size={18} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assessment Reviews</h1>
          <p className="text-slate-500 font-medium mt-1">Review and grade student submissions to unblock their progress.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          {(['Pending', 'Reviewed', 'All'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${
                filter === f 
                  ? 'bg-white text-[#1a2652] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
              {f === 'Pending' && (
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-md text-[10px]">
                  {submissions.filter(s => s.status === 'Pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 font-bold flex items-center gap-2 rounded-2xl border border-red-100 shadow-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Submissions List */}
      <div className="grid grid-cols-1 gap-6 relative min-h-[300px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm z-10 rounded-3xl border border-slate-200">
            <Loader2 size={32} className="animate-spin text-indigo-500 mb-2" />
            <span className="text-slate-500 font-bold text-sm">Loading submissions...</span>
          </div>
        ) : filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((sub) => (
            <div 
              key={sub.id} 
              className={`bg-white rounded-[32px] border ${
                sub.status === 'Pending' ? 'border-orange-200 shadow-md shadow-orange-100/50' : 'border-slate-200 shadow-sm opacity-70 hover:opacity-100 transition-opacity'
              } overflow-hidden flex flex-col md:flex-row`}
            >
              {/* Info Column */}
              <div className="p-8 md:w-1/3 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#1a2652] flex items-center justify-center text-white font-black text-sm">
                      {sub.studentName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{sub.studentName}</h3>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mt-1">
                        <Clock size={12} /> Submitted {sub.submittedAt}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Course</div>
                      <div className="flex items-start gap-2">
                        <BookOpen size={14} className="text-indigo-500 mt-1 shrink-0" />
                        <span className="text-sm font-bold text-slate-700">{sub.course}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Assessment Type</div>
                      <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600">
                        {sub.assessmentType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content & Action Column */}
              <div className="p-8 md:w-2/3 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Submission Content</h4>
                    {sub.status !== 'Pending' && (
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                        sub.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sub.status === 'Approved' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                        {sub.status}
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                    {sub.content.type === 'text' ? (
                      <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                        "{sub.content.text}"
                      </p>
                    ) : (
                      <a 
                        href={sub.content.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-all group"
                      >
                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                          {getIconForType(sub.content.type)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            View {sub.content.type === 'github' ? 'Repository' : 'Video Recording'}
                          </div>
                          <div className="text-xs font-medium text-slate-400 truncate mt-0.5">
                            {sub.content.url}
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {sub.status === 'Pending' && (
                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => handleAction(sub.id, 'Approved')}
                      disabled={processingId === sub.id}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {processingId === sub.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} Approve
                    </button>
                    <button 
                      onClick={() => handleAction(sub.id, 'Rejected')}
                      disabled={processingId === sub.id}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-100 hover:border-red-500 text-red-600 hover:bg-red-50 rounded-xl font-black transition-all active:scale-95 disabled:opacity-50"
                    >
                      {processingId === sub.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />} Request Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[32px] border border-slate-200 p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">All Caught Up!</h3>
            <p className="text-slate-500 font-medium">There are no {filter.toLowerCase()} submissions to review right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CM_Assessments;
