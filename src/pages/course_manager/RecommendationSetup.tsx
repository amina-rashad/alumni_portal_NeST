import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen as GitMerge, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Clock,
  XCircle,
  MoreVertical,
  CheckCircle2,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recommendationAPI, courseManagerAPI } from '../../services/api';

/* ─────────────────────────── Types ─────────────────────────── */
interface Recommendation {
  id: string;
  sourceCourseId: string;
  sourceCourseName: string;
  targetCourseId: string;
  targetCourseName: string;
  conversionRate: string;
  enrolledStudents: number;
}

interface Course {
  id: string;
  title: string;
}

/* ─────────────────────────── Components ─────────────────────────── */
const RecommendationSetup: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recResp, courseResp] = await Promise.all([
        recommendationAPI.fetchRecommendations(),
        courseManagerAPI.fetchCourses()
      ]);
      
      if (recResp && recResp.data) {
        setRecommendations(recResp.data);
      }
      
      if (courseResp && courseResp.data) {
        setCourses(courseResp.data.map((c: any) => ({ 
          id: c.id?.toString() || Math.random().toString(), 
          title: c.title || 'Untitled Course' 
        })));
      }
    } catch (err) {
      console.error('Recommendation data load error:', err);
      toast.error('Failed to load recommendation data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this recommendation mapping?')) return;
    try {
      await recommendationAPI.deleteRecommendation(id);
      setRecommendations(prev => prev.filter(r => r.id !== id));
      toast.success('Mapping removed');
    } catch (err) {
      toast.error('Failed to remove mapping');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight flex items-center gap-4">
            <GitMerge className="text-[#c8102e]" size={36} /> Recommendation Setup
          </h1>
          <p className="text-slate-500 font-medium mt-1">Map course pathways to guide student learning journeys effectively.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-[#1a2652] text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/20 hover:bg-[#2a3a70] transition-all"
        >
          <Plus size={20} /> Create Mapping
        </button>
      </div>

      {/* Grid of Mapping Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {recommendations.map((rec) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={rec.id}
              className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-1.5">
                  <TrendingUp size={12} /> {rec.conversionRate} Conversion
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-slate-300 hover:text-[#1a2652] transition-colors"><Edit3 size={18} /></button>
                  <button onClick={() => handleDelete(rec.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="flex-1 w-full">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Completed Course</div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-[#1e293b] text-sm">
                    {rec.sourceCourseName}
                  </div>
                </div>
                <div className="p-3 bg-[#c8102e] text-white rounded-full shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform">
                  <ArrowRight size={20} />
                </div>
                <div className="flex-1 w-full">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recommended Next</div>
                  <div className="p-4 bg-[#1a2652] rounded-2xl border border-indigo-900/10 font-bold text-white text-sm">
                    {rec.targetCourseName}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <Users size={14} className="text-slate-300" /> {rec.enrolledStudents} Students Path
                  </div>
                </div>
                <button className="text-xs font-black text-[#1a2652] flex items-center gap-1 group/btn">
                  View Analytics <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Performance Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden mt-10">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-[#1e293b]">Pathway Performance</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search pathways..." 
                className="bg-slate-50 border border-slate-100 py-2 pl-10 pr-4 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
            <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600"><Filter size={18} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pathway</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Completion</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-[#c8102e] flex items-center justify-center font-black text-[10px]">P{i}</div>
                      <div className="text-sm font-bold text-[#1e293b]">Elite Developer Track #{i}</div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#c8102e] h-full rounded-full" style={{ width: `${40 + i*15}%` }} />
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm font-bold text-slate-600">{65 + i*8}%</td>
                  <td className="px-10 py-6">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      <CheckCircle2 size={12} /> Optimized
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-emerald-500 font-black text-xs">+12.4%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#0f172a]/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-12">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c8102e] mb-2 block">AI Learning Paths</span>
                    <h2 className="text-3xl font-black text-[#1e293b]">Course Recommendation</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors">
                    <XCircle size={24} className="text-slate-400" />
                  </button>
                </div>

                <form className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">After completing this course...</label>
                    <select className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-bold text-[#1e293b] focus:outline-none focus:ring-4 focus:ring-red-500/5 transition-all">
                      <option>Select Source Course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <div className="h-px bg-slate-100 flex-1" />
                    <div className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Recommend this next</div>
                    <div className="h-px bg-slate-100 flex-1" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Course</label>
                    <select className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-bold text-[#1e293b] focus:outline-none focus:ring-4 focus:ring-red-500/5 transition-all">
                      <option>Select Recommended Course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Rank</label>
                      <input type="number" placeholder="1" className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AI Boost (%)</label>
                      <input type="number" placeholder="15" className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-bold" />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={() => { toast.success('Mapping established!'); setIsModalOpen(false); }}
                      className="flex-[2] py-5 bg-[#c8102e] text-white rounded-2xl font-black text-sm shadow-2xl shadow-red-900/30 hover:bg-[#a00d25] transition-all flex items-center justify-center gap-2"
                    >
                      Establish Mapping <ChevronRight size={18} />
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

export default RecommendationSetup;
