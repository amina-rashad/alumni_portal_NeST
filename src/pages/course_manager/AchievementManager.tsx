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
import { achievementService } from '../../services/achievementService';
import type { Achievement, IssuedAchievement } from '../../types/course-manager';
import { Loader2 } from 'lucide-react';

/* ─────────────────────────── Types ─────────────────────────── */
// Types moved to global types file

/* ─────────────────────────── Components ─────────────────────────── */
const AchievementManager: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [history, setHistory] = useState<IssuedAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'Active' | 'History'>('Active');

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'Badge' | 'XP' | 'Celebration'>('Badge');
  const [trigger, setTrigger] = useState('Course Completion (100%)');
  const [rewardValue, setRewardValue] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [achData, histData] = await Promise.all([
        achievementService.getAllAchievements(),
        achievementService.getIssuedHistory()
      ]);
      setAchievements(achData);
      setHistory(histData);
    } catch (err) {
      toast.error('Failed to load achievement data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rewardValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    const loadingToast = toast.loading('Creating achievement...');
    try {
      await achievementService.createAchievement({
        name,
        type,
        trigger,
        rewardValue,
        status: 'Active'
      });
      toast.success('Achievement Configured Successfully!', { id: loadingToast });
      setIsModalOpen(false);
      setName('');
      setRewardValue('');
      loadData();
    } catch (err) {
      toast.error('Failed to create achievement', { id: loadingToast });
    }
  };

  return (
    <div className="cm-animate-fade-up" style={{ maxWidth: "1350px", margin: "0 auto", padding: "0 32px 48px 32px", display: "flex", flexDirection: "column", gap: "32px", fontFamily: "\"Inter\", sans-serif" }}>
      {/* Header */}
      <div className="cm-page-header">
        <div>
          <h1 className="cm-title">Achievement Manager</h1>
          <p className="cm-subtitle">Configure gamification triggers, rewards, and student celebrations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="cm-btn cm-btn-primary"
        >
          <Plus size={20} /> Create Achievement
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cm-card flex items-center gap-6">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
            <Trophy size={32} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Badges</div>
            <div className="text-3xl font-black text-[#1e293b]">14</div>
          </div>
        </div>
        <div className="cm-card flex items-center gap-6">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Zap size={32} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">XP Triggered</div>
            <div className="text-3xl font-black text-[#1e293b]">128k</div>
          </div>
        </div>
        <div className="cm-card flex items-center gap-6">
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
      <div className="cm-table-container">
        <div className="overflow-x-auto">
          {view === 'Active' ? (
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Achievement</th>
                  <th>Trigger Type</th>
                  <th>Reward Value</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((ach) => (
                  <tr key={ach.id}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                          ach.type === 'Badge' ? 'bg-orange-500 text-white shadow-orange-900/10' :
                          ach.type === 'XP' ? 'bg-blue-500 text-white shadow-blue-900/10' :
                          'bg-indigo-500 text-white shadow-indigo-900/10'
                        }`}>
                          {ach.type === 'Badge' ? <Award size={20} /> :
                           ach.type === 'XP' ? <Zap size={20} /> :
                           <Star size={20} />}
                        </div>
                        <div>
                          <div className="font-black text-[#1e293b] text-sm">{ach.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{ach.type} Achievement</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest">
                        <Target size={12} className="text-slate-400" />
                        {ach.trigger}
                      </div>
                    </td>
                    <td className="text-xs font-black text-slate-700">
                      {ach.rewardValue}
                    </td>
                    <td>
                      <span className={`cm-badge ${ach.status === 'Active' ? 'cm-badge-success' : 'cm-badge-info opacity-50'}`}>
                        {ach.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="cm-btn cm-btn-secondary cm-btn-icon h-9 w-9">
                        <Settings size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Reward Issued</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th className="text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {history.map((hist) => (
                  <tr key={hist.id}>
                    <td className="font-bold text-slate-700 text-sm">{hist.studentName}</td>
                    <td className="font-black text-slate-900 text-sm">{hist.achievementName}</td>
                    <td>
                      <span className="cm-badge cm-badge-info">{hist.rewardType}</span>
                    </td>
                    <td className="text-xs text-slate-400 font-bold">{hist.issuedAt}</td>
                    <td className="text-right">
                      <button className="text-[#c8102e] hover:underline font-black text-[10px] uppercase tracking-widest">View Proof</button>
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
              className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 p-12"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c8102e] mb-2 block">Enterprise Rewards</span>
                  <h2 className="text-3xl font-black text-[#1e293b]">Configure Achievement</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="cm-btn cm-btn-secondary cm-btn-icon h-10 w-10">
                  <XCircle size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="cm-input-group col-span-2">
                  <label className="cm-label">Achievement Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Speed Demon, Quiz Master..."
                    className="cm-input"
                  />
                </div>

                <div className="cm-input-group">
                  <label className="cm-label">Reward Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Badge' | 'XP' | 'Celebration')}
                    className="cm-input cm-select"
                  >
                    <option value="Badge">Badge (Asset Reward)</option>
                    <option value="XP">XP (Gamification Points)</option>
                    <option value="Celebration">Celebration (Popup Only)</option>
                  </select>
                </div>

                <div className="cm-input-group">
                  <label className="cm-label">Trigger Condition</label>
                  <select 
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    className="cm-input cm-select"
                  >
                    <option>Course Completion (100%)</option>
                    <option>Quiz Performance (100% Score)</option>
                    <option>Consistent Attendance (7 Days)</option>
                    <option>First Enrollment</option>
                  </select>
                </div>

                <div className="cm-input-group">
                  <label className="cm-label">Reward Value (XP or ID)</label>
                  <input 
                    type="text" 
                    required
                    value={rewardValue}
                    onChange={(e) => setRewardValue(e.target.value)}
                    placeholder="e.g. 500 XP / BADGE_GOLD"
                    className="cm-input"
                  />
                </div>

                <div className="col-span-2 flex gap-4 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="cm-btn cm-btn-secondary flex-1 py-5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="cm-btn cm-btn-primary flex-[2] py-5"
                  >
                    Save Configuration <ChevronRight size={18} />
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

export default AchievementManager;
