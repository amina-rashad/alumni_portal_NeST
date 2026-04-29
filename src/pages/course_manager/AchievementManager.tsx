import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  Settings, 
  Star, 
  Zap, 
  MessageSquare, 
  History, 
  MoreVertical,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Flame,
  Award,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { achievementAPI } from '../../services/api';

/* ─────────────────────────── Types ─────────────────────────── */
interface Achievement {
  id: string;
  name: string;
  type: 'Badge' | 'XP' | 'Celebration';
  trigger: string;
  rewardValue: string;
  status: 'Active' | 'Draft';
  createdAt: string;
}

interface IssuedReward {
  id: string;
  studentName: string;
  achievementName: string;
  rewardType: string;
  issuedAt: string;
}

/* ─────────────────────────── Components ─────────────────────────── */
const AchievementManager: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [history, setHistory] = useState<IssuedReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'Active' | 'History'>('Active');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [achResp, histResp] = await Promise.all([
        achievementAPI.fetchAchievements(),
        achievementAPI.fetchIssuedHistory()
      ]);
      setAchievements(achResp.data);
      setHistory(histResp.data);
    } catch (err) {
      toast.error('Failed to load achievement data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Achievement Manager</h1>
          <p className="text-slate-500 font-medium mt-1">Configure gamification triggers, rewards, and student celebrations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-[#c8102e] text-white rounded-2xl font-black text-sm shadow-xl shadow-red-900/20 hover:bg-[#a00d25] transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} /> Create Achievement
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
            <Trophy size={32} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Badges</div>
            <div className="text-3xl font-black text-[#1e293b]">14</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Zap size={32} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">XP Triggered</div>
            <div className="text-3xl font-black text-[#1e293b]">128k</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Flame size={32} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reward Rate</div>
            <div className="text-3xl font-black text-[#1e293b]">84%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-100">
        <button 
          onClick={() => setView('Active')}
          className={`pb-4 px-2 text-sm font-black transition-all relative ${
            view === 'Active' ? 'text-[#c8102e]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Active Achievements
          {view === 'Active' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#c8102e] rounded-t-full" />}
        </button>
        <button 
          onClick={() => setView('History')}
          className={`pb-4 px-2 text-sm font-black transition-all relative ${
            view === 'History' ? 'text-[#c8102e]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Issued History
          {view === 'History' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#c8102e] rounded-t-full" />}
        </button>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          {view === 'Active' ? (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievement</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trigger Type</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward Value</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {achievements.map((ach) => (
                  <tr key={ach.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                          ach.type === 'Badge' ? 'bg-orange-500 text-white shadow-orange-900/20' :
                          ach.type === 'XP' ? 'bg-blue-500 text-white shadow-blue-900/20' :
                          'bg-indigo-500 text-white shadow-indigo-900/20'
                        }`}>
                          {ach.type === 'Badge' ? <Award size={24} /> :
                           ach.type === 'XP' ? <Zap size={24} /> :
                           <Star size={24} />}
                        </div>
                        <div>
                          <div className="font-black text-[#1e293b] text-base">{ach.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{ach.type} Achievement</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 w-fit px-4 py-2 rounded-xl border border-slate-100">
                        <Target size={14} className="text-slate-400" />
                        {ach.trigger}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-sm font-black text-[#1e293b]">
                      {ach.rewardValue}
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        ach.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {ach.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="p-2.5 text-slate-300 hover:text-[#1e293b] hover:bg-slate-100 rounded-xl transition-all">
                        <Settings size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward Issued</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((hist) => (
                  <tr key={hist.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-10 py-8 font-bold text-[#1e293b]">{hist.studentName}</td>
                    <td className="px-10 py-8 font-black text-slate-600">{hist.achievementName}</td>
                    <td className="px-10 py-8">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{hist.rewardType}</span>
                    </td>
                    <td className="px-10 py-8 text-sm text-slate-400 font-medium">{hist.issuedAt}</td>
                    <td className="px-10 py-8 text-right">
                      <button className="text-[#c8102e] hover:underline font-black text-xs">View Proof</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Achievement Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#0f172a]/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-12">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c8102e] mb-2 block">Enterprise Rewards</span>
                    <h2 className="text-3xl font-black text-[#1e293b]">Configure Achievement</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors">
                    <XCircle size={24} className="text-slate-400" />
                  </button>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Achievement Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Speed Demon, Quiz Master..."
                      className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all font-bold text-[#1e293b]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reward Type</label>
                    <select className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-bold text-[#1e293b]">
                      <option>Select Type</option>
                      <option>Badge (Asset Reward)</option>
                      <option>XP (Gamification Points)</option>
                      <option>Celebration (Popup Only)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trigger Condition</label>
                    <select className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-bold text-[#1e293b]">
                      <option>Select Trigger</option>
                      <option>Course Completion (100%)</option>
                      <option>Quiz Performance (100% Score)</option>
                      <option>Consistent Attendance (7 Days)</option>
                      <option>First Enrollment</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reward Value (XP or ID)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 500 XP / BADGE_GOLD"
                      className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-bold text-[#1e293b]"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Celebration Message (Popup Editor)</label>
                    <textarea 
                      rows={3}
                      placeholder="Enter the congratulatory message students will see..."
                      className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-medium text-[#1e293b]"
                    />
                  </div>

                  <div className="col-span-2 flex gap-4 mt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={() => { toast.success('Achievement Configured Successfully!'); setIsModalOpen(false); }}
                      className="flex-[2] py-5 bg-[#c8102e] text-white rounded-2xl font-black text-sm shadow-2xl shadow-red-900/30 hover:bg-[#a00d25] transition-all flex items-center justify-center gap-2 group"
                    >
                      Save Configuration <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
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

export default AchievementManager;
