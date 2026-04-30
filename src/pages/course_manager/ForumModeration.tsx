import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Reply, 
  MoreVertical,
  Clock,
  User,
  MessageCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { forumService } from '../../services/forumService';
import type { Discussion } from '../../types/course-manager';

/* ─────────────────────────── Types ─────────────────────────── */
// Type moved to global types file

/* ─────────────────────────── Components ─────────────────────────── */
const ForumModeration: React.FC = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Unresolved' | 'Resolved'>('Unresolved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    loadDiscussions();
  }, []);

  const loadDiscussions = async () => {
    setIsLoading(true);
    try {
      const data = await forumService.getDiscussions();
      setDiscussions(data);
    } catch (err) {
      toast.error('Failed to load discussions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await forumService.resolveDiscussion(id);
      setDiscussions(prev => prev.map(d => 
        d.id === id ? { ...d, status: 'Resolved' } : d
      ));
      toast.success('Discussion marked as resolved');
    } catch (err) {
      toast.error('Failed to update discussion status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) return;
    try {
      await forumService.deleteDiscussion(id);
      setDiscussions(prev => prev.filter(d => d.id !== id));
      toast.success('Discussion deleted');
    } catch (err) {
      toast.error('Failed to delete discussion');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscussion || !replyText.trim()) return;
    
    setIsReplying(true);
    try {
      await forumService.postReply(selectedDiscussion.id, replyText);
      setDiscussions(prev => prev.map(d => 
        d.id === selectedDiscussion.id ? { ...d, repliesCount: d.repliesCount + 1 } : d
      ));
      toast.success('Reply posted successfully');
      setReplyText('');
      setSelectedDiscussion(null);
    } catch (err) {
      toast.error('Failed to post reply');
    } finally {
      setIsReplying(false);
    }
  };

  const filteredDiscussions = discussions.filter(d => {
    const matchesTab = d.status === activeTab;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="cm-animate-fade-up" style={{ maxWidth: "1350px", margin: "0 auto", padding: "0 32px 48px 32px", display: "flex", flexDirection: "column", gap: "32px", fontFamily: "\"Inter\", sans-serif" }}>
      {/* Header */}
      <div className="cm-page-header">
        <div>
          <h1 className="cm-title">Forum Moderation</h1>
          <p className="cm-subtitle">Manage course discussions, resolve student doubts and moderate content.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          {(['Unresolved', 'Resolved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab 
                  ? 'bg-[#1a2652] text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab} ({discussions.filter(d => d.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c8102e] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by topic, content or student..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cm-input pl-12"
          />
        </div>
        <button 
          onClick={loadDiscussions}
          className="cm-btn cm-btn-secondary h-[56px] px-8"
        >
          <Clock size={18} /> Refresh
        </button>
      </div>

      {/* Content */}
      <div className="cm-table-container">
        <div className="overflow-x-auto">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Discussion Topic</th>
                <th>Posted By</th>
                <th>Course</th>
                <th>Stats</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold">Loading discussions...</td></tr>
                ) : filteredDiscussions.length > 0 ? (
                  filteredDiscussions.map((d) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={d.id} 
                      className="group"
                    >
                      <td>
                        <div className="max-w-[400px]">
                          <div className="font-black text-[#1e293b] text-sm mb-1 line-clamp-1">{d.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{d.content}</div>
                        </div>
                      </td>
                      
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            <User size={14} />
                          </div>
                          <div className="text-xs font-bold text-slate-600">{d.studentName}</div>
                        </div>
                      </td>

                      <td>
                        <span className="cm-badge cm-badge-info">
                          {d.courseName}
                        </span>
                      </td>

                      <td>
                        <div className="flex items-center gap-4 text-slate-400">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                            <MessageCircle size={12} /> {d.repliesCount}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={12} /> {d.createdAt}
                          </div>
                        </div>
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedDiscussion(d)}
                            className="cm-btn cm-btn-secondary cm-btn-icon h-9 w-9"
                            title="Reply"
                          >
                            <Reply size={18} />
                          </button>
                          {activeTab === 'Unresolved' && (
                            <button 
                              onClick={() => handleResolve(d.id)}
                              className="cm-btn cm-btn-secondary cm-btn-icon h-9 w-9 hover:text-emerald-600"
                              title="Resolve"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(d.id)}
                            className="cm-btn cm-btn-secondary cm-btn-icon h-9 w-9 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-24">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                          <MessageSquare size={32} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No {activeTab.toLowerCase()} discussions found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {selectedDiscussion && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#0f172a]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden p-10"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c8102e] mb-2 block">Moderator Reply</span>
                  <h2 className="text-2xl font-black text-[#1e293b]">Post Response</h2>
                </div>
                <button onClick={() => setSelectedDiscussion(null)} className="cm-btn cm-btn-secondary cm-btn-icon h-10 w-10">
                  <XCircle size={20} className="text-slate-300" />
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[8px] font-bold text-slate-400 border border-slate-100">
                    <User size={10} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1e293b]">{selectedDiscussion.studentName} asks:</span>
                </div>
                <h4 className="font-bold text-slate-700 text-sm mb-2">{selectedDiscussion.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed italic">"{selectedDiscussion.content}"</p>
              </div>

              <form onSubmit={handleReplySubmit} className="space-y-6">
                <div className="cm-input-group">
                  <label className="cm-label">Your Response</label>
                  <textarea 
                    required
                    rows={6}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Provide a detailed and helpful response to resolve this query..."
                    className="cm-input min-h-[150px] py-4"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setSelectedDiscussion(null)}
                    className="cm-btn cm-btn-secondary flex-1 py-4"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isReplying}
                    className="cm-btn cm-btn-primary flex-[2] py-4"
                  >
                    {isReplying ? 'Posting...' : <>Post Reply <ChevronRight size={18} /></>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForumModeration;
