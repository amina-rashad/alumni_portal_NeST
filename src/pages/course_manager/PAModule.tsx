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
  Calendar,
  Activity,
  UserX,
  Target,
  Award,
  Zap,
  Activity as VelocityIcon
} from 'lucide-react';
import { insightsAPI } from '../../services/api';

const PerformanceAnalysis: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const brandPrimary = '#c8102e';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const resp = await insightsAPI.fetchSummary();
      if (resp.success) {
        setData(resp.data);
      }
    } catch (err) {
      console.error("Performance Analysis Load Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #f1f5f9', borderTopColor: brandPrimary, borderRadius: '50%' }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: 'rgba(200, 16, 46, 0.05)', color: brandPrimary, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '100px', border: '1px solid rgba(200, 16, 46, 0.1)', padding: '4px 12px' }}>
              Governance Analytics
            </span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.02em' }}>
            Performance <span style={{ color: brandPrimary }}>Analysis</span>
          </h1>
          <p style={{ color: '#64748b', fontWeight: 500, marginTop: '4px' }}>Real-time oversight of academic velocity and student engagement.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '16px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            <Calendar size={18} /> Last 30 Days
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {[
          { label: 'Avg. Completion', value: '84%', icon: Target, color: '#10b981', bg: 'rgba(16, 185, 129, 0.05)' },
          { label: 'Daily Active', value: data?.dailyActiveUsers?.[6] || '72', icon: Activity, color: brandPrimary, bg: 'rgba(200, 16, 46, 0.05)' },
          { label: 'Active Streaks', value: '124', icon: Flame, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)' },
          { label: 'Risk Students', value: data?.inactiveLearners?.length || '0', icon: AlertTriangle, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.05)' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
          >
            <div style={{ width: '48px', height: '48px', background: stat.bg, color: stat.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <stat.icon size={24} />
            </div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{stat.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b' }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Engagement Chart (Custom SVG implementation for reliability) */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Daily Active Learners</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User activity trend for current week</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', fontSize: '11px', fontWeight: 800, borderRadius: '100px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
              <TrendingUp size={14} /> +14.2% Velocity
            </div>
          </div>
          
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '20px', paddingBottom: '40px', position: 'relative' }}>
             {/* Grid Lines */}
             {[0, 25, 50, 75, 100].map(p => (
               <div key={p} style={{ position: 'absolute', left: 0, right: 0, bottom: `${p}%`, height: '1px', background: '#f1f5f9', zIndex: 0 }} />
             ))}
             
             {/* Bars */}
             {(data?.dailyActiveUsers || [30, 45, 38, 52, 48, 60, 75]).map((val: number, i: number) => (
               <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                 <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: `${(val / 100) * 200}px` }}
                   transition={{ duration: 1, delay: i * 0.1 }}
                   style={{ width: '100%', background: i === 6 ? brandPrimary : '#e2e8f0', borderRadius: '8px 8px 0 0', position: 'relative' }}
                 >
                   {i === 6 && <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>{val} Users</div>}
                 </motion.div>
                 <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Streak Leaderboard */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame color="#f59e0b" size={20} /> Login Streaks
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {data?.streaks?.map((s: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#1e293b', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{s.student}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Elite Learner</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b', padding: '6px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 800 }}>
                  <Flame size={14} /> {s.days}
                </div>
              </div>
            )) || (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '14px' }}>No streaks recorded yet.</div>
            )}
          </div>
          <button style={{ marginTop: '24px', width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            View Full Board <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Course Completion Progress */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px' }}>Curriculum Velocity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {data?.completionRates?.map((c: any, i: number) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>{c.course}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: brandPrimary }}>{c.percentage}%</div>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${brandPrimary}, #ef4444)`, borderRadius: '4px' }}
                  />
                </div>
              </div>
            )) || (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '14px' }}>No curriculum data available.</div>
            )}
          </div>
        </div>

        {/* Inactive Learners */}
        <div style={{ background: '#1a2652', padding: '32px', borderRadius: '32px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserX color="#f87171" size={22} /> Risk Interventions
            </h3>
            <p style={{ margin: '0 0 32px 0', fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Students inactive for {'>'}3 days. Immediate outreach recommended.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data?.inactiveLearners?.map((s: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Last active {s.lastActive}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                    background: s.risk === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: s.risk === 'High' ? '#f87171' : '#fbbf24',
                    border: '1px solid currentColor'
                  }}>
                    {s.risk} RISK
                  </div>
                </div>
              )) || (
                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>All students are active.</div>
              )}
            </div>

            <button style={{ marginTop: '32px', width: '100%', padding: '16px', background: '#fff', color: '#1a2652', borderRadius: '16px', border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s' }}>
              Dispatch Mass Reminder <ArrowUpRight size={18} />
            </button>
          </div>
          
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: 'rgba(200, 16, 46, 0.05)', borderRadius: '50%', filter: 'blur(30px)' }} />
        </div>
      </div>
      
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PerformanceAnalysis;
