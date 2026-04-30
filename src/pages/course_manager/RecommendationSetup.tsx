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
import { recommendationService } from '../../services/recommendationService';
import { courseService } from '../../services/courseService';
import type { RecommendationRule, Course } from '../../types/course-manager';
import { Loader2 } from 'lucide-react';

/* ─────────────────────────── Types ─────────────────────────── */
// Types moved to global types file

/* ─────────────────────────── Components ─────────────────────────── */
const RecommendationSetup: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationRule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [trigger, setTrigger] = useState('Course Completion');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rules, allCourses] = await Promise.all([
        recommendationService.getRules(),
        courseService.getAllCourses()
      ]);
      setRecommendations(rules);
      setCourses(allCourses);
    } catch (err) {
      toast.error('Failed to load recommendation data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this recommendation mapping?')) return;
    const loadingToast = toast.loading('Removing mapping...');
    try {
      await recommendationService.deleteRule(id);
      setRecommendations(prev => prev.filter(r => r.id !== id));
      toast.success('Mapping removed', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to remove mapping', { id: loadingToast });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId) {
      toast.error('Please select both source and target courses');
      return;
    }

    const sourceCourse = courses.find(c => c.id.toString() === sourceId.toString());
    const targetCourse = courses.find(c => c.id.toString() === targetId.toString());

    if (!sourceCourse || !targetCourse) return;

    const loadingToast = toast.loading('Establishing mapping...');
    try {
      await recommendationService.saveRule({
        sourceCourseId: sourceId,
        sourceCourseName: sourceCourse.title,
        targetCourseId: targetId,
        targetCourseName: targetCourse.title,
        trigger,
        status: 'Active'
      });
      toast.success('Mapping established!', { id: loadingToast });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to establish mapping', { id: loadingToast });
    }
  };

  return (
    <div className="cm-animate-fade-up" style={{ maxWidth: "1350px", margin: "0 auto", padding: "0 32px 48px 32px", display: "flex", flexDirection: "column", gap: "32px", fontFamily: "\"Inter\", sans-serif" }}>
      {/* Header */}
      <div className="cm-page-header">
        <div>
          <h1 className="cm-title">Learning Pathways</h1>
          <p className="cm-subtitle">Map course pathways to guide student learning journeys effectively.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="cm-btn cm-btn-primary"
        >
          <Plus size={18} /> Create Mapping
        </button>
      </div>

      {/* Grid of Mapping Cards */}
      <div className="cm-grid-3">
        <AnimatePresence mode="popLayout">
          {recommendations.map((rec) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={rec.id}
              className="cm-card p-10 group relative overflow-hidden flex flex-col justify-between h-[340px]"
            >
              {/* Badge & Actions Row */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f0fdf4] border border-[#dcfce7] rounded-xl">
                  <TrendingUp size={12} className="text-[#16a34a]" />
                  <span className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest">{rec.conversionRate || '24%'} Conversion</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-slate-300 hover:text-[#1a2652] transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(rec.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Pathway Flow */}
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Completed Course</div>
                  <div className="h-24 p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-center">
                    <span className="text-xs font-black text-[#1e293b] line-clamp-2 leading-relaxed">{rec.sourceCourseName}</span>
                  </div>
                </div>

                <div className="flex-shrink-0 mt-6">
                  <div className="w-10 h-10 rounded-full bg-[#c8102e] text-white flex items-center justify-center shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform">
                    <ArrowRight size={18} strokeWidth={3} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Recommended Next</div>
                  <div className="h-24 p-6 bg-[#1a2652] border border-indigo-900/10 rounded-2xl flex items-center justify-center text-center shadow-lg shadow-indigo-950/20">
                    <span className="text-xs font-black text-white line-clamp-2 leading-relaxed">{rec.targetCourseName}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Analytics Row */}
              <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Users size={12} /> {rec.enrolledStudents || '156'} Students Path
                </div>
                <button className="text-[10px] font-black text-[#1a2652] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                  View Analytics <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Performance Table Section */}
      <div className="cm-table-container">
        <div className="border-b border-slate-100 flex items-center justify-between bg-white" style={{ padding: '40px 64px' }}>
          <div>
            <h3 className="text-2xl font-black text-[#1e293b] mb-1">Pathway Performance</h3>
            <p className="text-sm font-medium text-slate-400 italic">Strategic conversion metrics and completion velocity</p>
          </div>
          <div className="relative w-80 group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c8102e] transition-colors" />
            <input 
              type="text" 
              placeholder="Search pathways..." 
              className="cm-input bg-slate-50/50 border-transparent focus:bg-white focus:border-slate-100 h-14 rounded-full"
              style={{ paddingLeft: '64px' }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="cm-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '64px' }}>Pathway</th>
                <th>Engagement</th>
                <th>Avg. Completion</th>
                <th>Status</th>
                <th className="text-right" style={{ paddingRight: '64px' }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-8" style={{ paddingLeft: '64px' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-[#c8102e] flex items-center justify-center font-black text-xs shadow-sm">P{i}</div>
                      <div className="text-sm font-black text-[#1e293b]">Elite Developer Track #{i}</div>
                    </div>
                  </td>
                  <td>
                    <div className="w-40 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#c8102e] h-full rounded-full shadow-[0_0_8px_rgba(200,16,46,0.3)]" style={{ width: `${40 + i*15}%` }} />
                    </div>
                  </td>
                  <td className="text-sm font-black text-slate-600">{65 + i*8}%</td>
                  <td>
                    <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Optimized
                    </span>
                  </td>
                  <td className="text-right" style={{ paddingRight: '64px' }}>
                    <span className="text-emerald-500 font-black text-sm tracking-tight">+12.4%</span>
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
              className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 p-12"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c8102e] mb-2 block">AI Learning Paths</span>
                  <h2 className="text-3xl font-black text-[#1e293b]">Course Recommendation</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="cm-btn cm-btn-secondary cm-btn-icon h-10 w-10">
                  <XCircle size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="cm-input-group">
                  <label className="cm-label">After completing this course...</label>
                  <select 
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    required
                    className="cm-input cm-select"
                  >
                    <option value="">Select Source Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <div className="flex items-center justify-center py-2">
                  <div className="h-px bg-slate-100 flex-1" />
                  <div className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Recommend this next</div>
                  <div className="h-px bg-slate-100 flex-1" />
                </div>

                <div className="cm-input-group">
                  <label className="cm-label">Target Course</label>
                  <select 
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    required
                    className="cm-input cm-select"
                  >
                    <option value="">Select Recommended Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <div className="cm-input-group">
                  <label className="cm-label">AI Recommendation Trigger</label>
                  <select 
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    className="cm-input cm-select"
                  >
                    <option>Course Completion</option>
                    <option>Module Mastery</option>
                    <option>High Quiz Score</option>
                    <option>Instructor Recommendation</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="cm-btn cm-btn-secondary flex-1 py-4"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="cm-btn cm-btn-primary flex-[2] py-4"
                  >
                    Establish Mapping <ChevronRight size={18} />
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

export default RecommendationSetup;
