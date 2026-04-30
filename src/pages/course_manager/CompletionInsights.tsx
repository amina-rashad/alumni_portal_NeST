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
import { insightService } from '../../services/insightService';
import type { InsightSummary } from '../../types/course-manager';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const CompletionInsights: React.FC = () => {
  const [data, setData] = useState<InsightSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const summary = await insightService.getSummary();
      setData(summary);
    } catch (err) {
      console.error('Insights load error:', err);
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
    <div className="cm-page-container cm-animate-fade-up">
      {/* Header */}
      <div className="cm-page-header">
        <div>
          <span className="inline-block px-3 py-1 bg-red-50 text-[#c8102e] text-[9px] font-black uppercase tracking-[0.2em] mb-4 rounded-lg">Engagement Intelligence</span>
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-[#c8102e] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/20">
                <BarChart3 size={28} strokeWidth={2.5} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">Completion Insights</h1>
                <p className="text-slate-400 font-medium text-sm mt-0.5">Monitor learning velocity, student streaks, and retention metrics.</p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-12 px-6 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1e293b]">Last 30 Days</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="cm-grid-4">
        {[
          { label: 'Avg. Velocity', value: '84%', icon: TrendingUp, color: 'text-emerald-600', trend: 'bg-emerald-50' },
          { label: 'Daily Active', value: '72', icon: Activity, color: 'text-[#c8102e]', trend: 'bg-red-50' },
          { label: 'Active Streaks', value: '124', icon: Flame, color: 'text-orange-600', trend: 'bg-orange-50' },
          { label: 'Risk Students', value: '3', icon: AlertTriangle, color: 'text-amber-600', trend: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="cm-card p-8 flex flex-col justify-between min-h-[160px] hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-2xl ${stat.trend} flex items-center justify-center`}>
                <stat.icon size={22} className={stat.color} strokeWidth={2.5} />
              </div>
              <div className="w-8 h-5 bg-slate-50 rounded-lg flex items-center justify-center">
                 <TrendingUp size={12} className="text-slate-300" />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-[#1e293b] tracking-tight">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Engagement Chart */}
        <div className="xl:col-span-2 cm-card p-10 relative">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-[#1e293b] mb-1">Daily Active Learners</h3>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em]">USER ACTIVITY TREND FOR CURRENT WEEK</p>
            </div>
            <div className="px-3 py-1.5 bg-[#f0fdf4] text-[#16a34a] rounded-full text-[9px] font-black flex items-center gap-1.5">
              <TrendingUp size={10} /> +14.2% Increase
            </div>
          </div>
          <div className="h-[300px]">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Streak Leaderboard */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          border: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          transition: 'box-shadow 0.3s ease',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Flame size={22} strokeWidth={2.5} style={{ color: '#f97316', flexShrink: 0 }} />
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>
              Login Streaks
            </h3>
          </div>

          {/* User sub-cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {[
              { name: 'Alex Johnson',  days: 12, rank: 1 },
              { name: 'Maria Garcia',  days: 8,  rank: 2 },
              { name: 'David Chen',    days: 7,  rank: 3 },
              { name: 'Sneha Joseph',  days: 5,  rank: 4 },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)';
                  (e.currentTarget as HTMLElement).style.background = '#ffffff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                  (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                }}
              >
                {/* Left: Rank badge + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Rank badge */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#eef2f7',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '13px',
                    color: '#475569',
                    flexShrink: 0,
                  }}>
                    {s.rank}
                  </div>
                  {/* Name + meta */}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '4px' }}>
                      Current Milestone
                    </div>
                  </div>
                </div>

                {/* Right: Streak pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontWeight: 900,
                  fontSize: '11px',
                  color: '#ea580c',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  <Flame size={12} strokeWidth={3} style={{ color: '#f97316' }} />
                  {s.days} Days
                </div>
              </div>
            ))}
          </div>

          {/* Footer button */}
          <button
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '14px',
              background: '#f1f5f9',
              color: '#475569',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e2e8f0'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
          >
            View All Streaks
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Bottom Row: Course Completion + At-Risk ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left: Course-wise Completion ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9',
          transition: 'box-shadow 0.3s ease',
        }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)')}
        >
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', marginBottom: '28px', letterSpacing: '-0.02em' }}>
            Course-wise Completion
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { course: 'Full Stack Dev', percentage: 78 },
              { course: 'Cloud Arch',     percentage: 42 },
              { course: 'UX Design',      percentage: 91 },
              { course: 'Data Science',   percentage: 56 },
            ].map((c, i) => (
              <div key={i}>
                {/* Label row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{c.course}</span>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#c8102e', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                    {c.percentage}% Complete
                  </span>
                </div>
                {/* Progress track */}
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percentage}%` }}
                    transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.12 }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #e53e5a 0%, #c8102e 100%)',
                      borderRadius: '999px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: At-Risk Learners ── */}
        <div style={{
          background: 'linear-gradient(145deg, #1e2d5e 0%, #162247 100%)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(30,45,94,0.40)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'box-shadow 0.3s ease',
        }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 16px 48px rgba(30,45,94,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(30,45,94,0.40)')}
        >
          {/* Header */}
          <div style={{ padding: '28px 28px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <UserX size={20} strokeWidth={2.5} style={{ color: '#f87171', flexShrink: 0 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0 }}>At-Risk Learners</h3>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
              Students inactive for more than 3 days. Reach out recommended.
            </p>
          </div>

          {/* Student rows */}
          <div style={{ padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {[
              { name: 'John Doe',    lastActive: '5 days ago', risk: 'HIGH RISK',   avatarBg: '#3b82f6', badgeBg: '#dc2626' },
              { name: 'Sarah Smith', lastActive: '3 days ago', risk: 'MEDIUM RISK', avatarBg: '#14b8a6', badgeBg: '#d97706' },
              { name: 'Kiran Kumar', lastActive: '4 days ago', risk: 'HIGH RISK',   avatarBg: '#8b5cf6', badgeBg: '#dc2626' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: s.avatarBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '15px', color: '#fff',
                  flexShrink: 0,
                }}>
                  {s.name.charAt(0)}
                </div>

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                    {s.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Clock size={10} style={{ color: '#64748b', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                      Last active {s.lastActive}
                    </span>
                  </div>
                </div>

                {/* Risk badge */}
                <div style={{
                  background: s.badgeBg,
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}>
                  {s.risk}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div style={{ padding: '8px 20px 24px' }}>
            <button style={{
              width: '100%',
              padding: '14px',
              background: '#ffffff',
              color: '#1e2d5e',
              borderRadius: '999px',
              border: 'none',
              fontWeight: 900,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'background 0.2s ease, transform 0.2s ease',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.01)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#ffffff';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              Send Mass Reminder
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompletionInsights;
