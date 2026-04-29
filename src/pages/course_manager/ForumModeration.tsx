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
import { forumAPI } from '../../services/api';

/* ─────────────────────────── Types ─────────────────────────── */
interface Discussion {
  id: string;
  courseName: string;
  studentName: string;
  title: string;
  content: string;
  status: 'Unresolved' | 'Resolved';
  createdAt: string;
  repliesCount: number;
}

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
      const response = await forumAPI.fetchDiscussions();
      setDiscussions(response.data);
    } catch (err) {
      toast.error('Failed to load discussions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await forumAPI.resolveDiscussion(id);
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
      await forumAPI.deleteDiscussion(id);
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
      await forumAPI.postReply(selectedDiscussion.id, replyText);
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Forum Moderation</h1>
          <p className="text-slate-500 font-medium mt-1">Manage course discussions, resolve student doubts and moderate content.</p>
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
            className="w-full bg-white border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 shadow-sm transition-all font-bold text-[#1e293b] placeholder:text-slate-400"
          />
        </div>
        <button 
          onClick={loadDiscussions}
          className="px-6 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
        >
          <Clock size={18} /> Refresh
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discussion Topic</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Posted By</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stats</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-10 py-20 text-center text-slate-400 font-bold">Loading discussions...</td></tr>
                ) : filteredDiscussions.length > 0 ? (
                  filteredDiscussions.map((d) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={d.id} 
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-10 py-8">
                        <div className="max-w-[400px]">
                          <div className="font-black text-[#1e293b] text-base mb-1 line-clamp-1">{d.title}</div>
                          <div className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{d.content}</div>
                        </div>
                      </td>
                      
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            <User size={14} />
                          </div>
                          <div className="text-sm font-bold text-slate-600">{d.studentName}</div>
                        </div>
                      </td>

                      <td className="px-10 py-8">
                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                          {d.courseName}
                        </span>
                      </td>

                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4 text-slate-400">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <MessageCircle size={14} /> {d.repliesCount}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Clock size={14} /> {d.createdAt}
                          </div>
                        </div>
                      </td>

                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedDiscussion(d)}
                            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-[#1a2652] hover:text-white transition-all shadow-sm"
                          >
                            <Reply size={18} />
                          </button>
                          {activeTab === 'Unresolved' && (
                            <button 
                              onClick={() => handleResolve(d.id)}
                              className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(d.id)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                          <MessageSquare size={32} />
                        </div>
                        <p className="text-slate-400 font-bold">No {activeTab.toLowerCase()} discussions found.</p>
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
              className="bg-white w-full max-w-2xl rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c8102e] mb-2 block">Moderator Reply</span>
                    <h2 className="text-2xl font-black text-[#1e293b]">Post Response</h2>
                  </div>
                  <button onClick={() => setSelectedDiscussion(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <XCircle size={24} className="text-slate-300" />
                  </button>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[8px] font-bold text-slate-400 border border-slate-100">
                      <User size={10} />
                    </div>
                    <span className="text-xs font-bold text-[#1e293b]">{selectedDiscussion.studentName} asks:</span>
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm mb-2">{selectedDiscussion.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed italic">"{selectedDiscussion.content}"</p>
                </div>

                <form onSubmit={handleReplySubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Response</label>
                    <textarea 
                      required
                      rows={6}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Provide a detailed and helpful response to resolve this query..."
                      className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all font-medium text-[#1e293b] placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setSelectedDiscussion(null)}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isReplying}
                      className="flex-[2] py-4 bg-[#c8102e] text-white rounded-2xl font-black text-sm shadow-lg shadow-red-900/20 hover:bg-[#a00d25] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                      {isReplying ? 'Posting...' : <>Post Reply <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForumModeration;
