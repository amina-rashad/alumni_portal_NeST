import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Filter, 
  Send, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  MoreVertical,
  ChevronRight,
  Info,
  UserX,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { reminderAPI } from '../../services/api';

/* ─────────────────────────── Types ─────────────────────────── */
interface ReminderAlert {
  id: string;
  studentName: string;
  studentEmail: string;
  type: 'Low Attendance' | 'Upcoming Assessment' | 'Inactive Student' | 'Pending Completion';
  details: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Reminded';
  lastRemindedAt?: string;
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: any;
  color: string;
  description: string;
}

/* ─────────────────────────── Components ─────────────────────────── */
const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon: Icon, color, description }) => (
  <motion.div 
    whileHover={{ translateY: -5 }}
    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">{label}</h3>
        <div className="text-2xl font-black text-[#1e293b]">{value}</div>
      </div>
    </div>
    <p className="text-xs font-medium text-slate-500 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

const ReminderCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<ReminderAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await reminderAPI.fetchAlerts();
      setAlerts(response.data);
    } catch (err) {
      toast.error('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async (alert: ReminderAlert) => {
    setSendingId(alert.id);
    const loadingToast = toast.loading(`Sending reminder to ${alert.studentName}...`);
    try {
      await reminderAPI.sendReminder(alert.id);
      setAlerts(prev => prev.map(a => 
        a.id === alert.id ? { ...a, status: 'Reminded', lastRemindedAt: 'Just now' } : a
      ));
      toast.success(`Reminder dispatched to ${alert.studentEmail}`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to send reminder', { id: loadingToast });
    } finally {
      setSendingId(null);
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Low': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || a.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 font-['Inter',sans-serif]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Reminder Center</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor academic triggers and automate student outreach.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadAlerts}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Clock size={20} />
          </button>
          <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-2 bg-red-50 rounded-lg text-[#c8102e]">
              <Bell size={18} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Alerts</div>
              <div className="text-lg font-black text-[#1e293b] leading-tight">{alerts.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          label="Attendance Alerts" 
          value="12" 
          icon={Users} 
          color="bg-red-500" 
          description="Students currently below the 75% mandatory threshold."
        />
        <SummaryCard 
          label="Upcoming Exams" 
          value="24" 
          icon={GraduationCap} 
          color="bg-blue-500" 
          description="Assessments due in the next 48 hours requiring prep."
        />
        <SummaryCard 
          label="Inactive Users" 
          value="8" 
          icon={UserX} 
          color="bg-orange-500" 
          description="Students who haven't logged in for over 7 consecutive days."
        />
        <SummaryCard 
          label="Course Lags" 
          value="15" 
          icon={Info} 
          color="bg-indigo-500" 
          description="Enrolled students lagging behind their assigned schedule."
        />
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c8102e] transition-colors" />
          <input 
            type="text" 
            placeholder="Search students, alerts or specific courses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all font-bold text-[#1e293b] placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full lg:w-auto overflow-x-auto no-scrollbar">
          {['All', 'Low Attendance', 'Upcoming Assessment', 'Inactive Student', 'Pending Completion'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                filterType === type 
                  ? 'bg-white text-[#1a2652] shadow-md border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600 border border-transparent'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alert Category</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Details</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity</th>
                <th className="px-10 py-6 text-[10px) font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={alert.id} 
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#1a2652] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-900/20">
                            {alert.studentName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-black text-[#1e293b] text-base">{alert.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">{alert.studentEmail}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            alert.type === 'Low Attendance' ? 'bg-red-50 text-red-500' :
                            alert.type === 'Upcoming Assessment' ? 'bg-blue-50 text-blue-500' :
                            alert.type === 'Inactive Student' ? 'bg-orange-50 text-orange-500' :
                            'bg-indigo-50 text-indigo-500'
                          }`}>
                            {alert.type === 'Low Attendance' ? <Users size={14} /> :
                             alert.type === 'Upcoming Assessment' ? <GraduationCap size={14} /> :
                             alert.type === 'Inactive Student' ? <UserX size={14} /> :
                             <Info size={14} />}
                          </div>
                          <span className="text-sm font-bold text-[#1e293b]">{alert.type}</span>
                        </div>
                      </td>

                      <td className="px-10 py-8">
                        <div className="max-w-[280px]">
                          <div className="text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed">
                            {alert.details}
                          </div>
                          {alert.lastRemindedAt && (
                            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
                              <CheckCircle2 size={12} /> Last Reminded: {alert.lastRemindedAt}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-10 py-8">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${getSeverityStyles(alert.severity)}`}>
                          <AlertTriangle size={12} strokeWidth={3} />
                          {alert.severity}
                        </span>
                      </td>

                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleSendReminder(alert)}
                            disabled={sendingId === alert.id || alert.status === 'Reminded'}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg ${
                              alert.status === 'Reminded'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none'
                              : 'bg-[#c8102e] text-white hover:bg-[#a00d25] shadow-red-900/10'
                            }`}
                          >
                            {sendingId === alert.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : alert.status === 'Reminded' ? (
                              <>Sent <CheckCircle2 size={14} /></>
                            ) : (
                              <>Send Reminder <Send size={14} /></>
                            )}
                          </button>
                          <button className="p-2.5 text-slate-300 hover:text-[#1e293b] hover:bg-slate-100 rounded-xl transition-all">
                            <MoreVertical size={20} />
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
                          <Bell size={32} />
                        </div>
                        <p className="text-slate-400 font-bold">No academic alerts detected at this time.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ size, className }: { size: number, className: string }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className={className}
  >
    <Clock size={size} />
  </motion.div>
);

export default ReminderCenter;
