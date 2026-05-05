import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Flame, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight, 
  ArrowUpRight,
  Search,
  Calendar,
  Activity,
  UserX
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { insightsAPI } from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const CompletionInsights: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const resp = await insightsAPI.fetchSummary();
      setData(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Active Users',
        data: data?.dailyActiveUsers || [30, 45, 38, 52, 48, 60, 75],
        borderColor: '#c8102e',
        backgroundColor: 'rgba(200, 16, 46, 0.05)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#c8102e',
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      }
    },
    scales: {
      y: { display: false, grid: { display: false } },
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' as const }, color: '#94a3b8' } }
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-red-50 text-[#c8102e] text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100">
              Engagement Intelligence
            </span>
          </div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight flex items-center gap-4">
            <BarChart3 className="text-[#c8102e]" size={36} /> Completion Insights
          </h1>
          <p className="text-slate-500 font-medium mt-1">Monitor learning velocity, student streaks, and retention metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm">
            <Calendar size={18} /> Last 30 Days
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg. Velocity', value: '84%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Daily Active', value: data?.dailyActiveUsers?.[6], icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Active Streaks', value: '124', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Risk Students', value: data?.inactiveLearners?.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={24} />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-3xl font-black text-[#1e293b]">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-black text-[#1e293b]">Daily Active Learners</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">User activity trend for current week</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">
              <TrendingUp size={12} /> +14.2% Increase
            </div>
          </div>
          <div className="h-[300px] relative z-10">
            <Line data={lineChartData} options={chartOptions} />
          </div>
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a2652 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        {/* Streak Leaderboard */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-[#1e293b] mb-6 flex items-center gap-2">
            <Flame className="text-orange-500" size={20} /> Login Streaks
          </h3>
          <div className="space-y-4 flex-1">
            {data?.streaks?.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-orange-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-sm text-[#1e293b]">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#1e293b]">{s.student}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Current Milestone</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl font-black text-xs">
                  <Flame size={14} /> {s.days} Days
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
            View All Streaks <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Completion Progress */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-[#1e293b] mb-8">Course-wise Completion</h3>
          <div className="space-y-8">
            {data?.completionRates?.map((c: any, i: number) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="font-black text-sm text-slate-700">{c.course}</div>
                  <div className="text-xs font-black text-[#c8102e]">{c.percentage}% Complete</div>
                </div>
                <div className="h-3 bg-slate-50 rounded-full border border-slate-100 overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full shadow-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive Learners */}
        <div className="bg-[#1a2652] p-10 rounded-[40px] shadow-2xl shadow-indigo-900/40 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2 flex items-center gap-3">
              <UserX className="text-red-400" size={24} /> At-Risk Learners
            </h3>
            <p className="text-indigo-200 text-sm font-medium mb-8">Students inactive for more than 3 days. Reach out recommended.</p>
            
            <div className="space-y-4">
              {data?.inactiveLearners?.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-900/50 flex items-center justify-center font-black text-sm text-indigo-300">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-base font-black">{s.name}</div>
                      <div className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                        <Clock size={12} /> Last active {s.lastActive}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    s.risk === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {s.risk} Risk
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-8 w-full py-5 bg-white text-[#1a2652] rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
              Send Mass Reminder <ArrowUpRight size={18} />
            </button>
          </div>

          {/* Abstract pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default CompletionInsights;
