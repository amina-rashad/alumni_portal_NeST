import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, Briefcase, CheckCircle2, 
  ArrowUpRight, Download, Filter, Target, Zap
} from 'lucide-react';
import { recruiterApi } from '../../services/api';

const RecruiterReports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await recruiterApi.getStats();
        if (res.success && res.data) {
          setStats(res.data.stats);
        } else {
            // Dummy data for visual presentation if API fails or is empty
            setStats({
                total_jobs: 12,
                total_applications: 48,
                shortlisted: 18,
                hired: 5,
                pending: 25
            });
        }
      } catch (err) {
        console.error("Failed to fetch recruiter stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const reportCards = [
    { label: 'Active Openings', value: stats?.total_jobs || 0, trend: '+2 this month', icon: <Briefcase size={20} />, color: '#3b82f6' },
    { label: 'Total Applicants', value: stats?.total_applications || 0, trend: '+15% vs last week', icon: <Users size={20} />, color: '#8b5cf6' },
    { label: 'Shortlisted', value: stats?.shortlisted || 0, trend: 'High quality ratio', icon: <CheckCircle2 size={20} />, color: '#10b981' },
    { label: 'Hiring Velocity', value: '14 days', trend: 'Efficient', icon: <Zap size={20} />, color: nestRed },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header Section */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
        marginBottom: '40px', background: 'linear-gradient(135deg, #1a2652 0%, #0d1430 100%)', 
        padding: '32px 40px', borderRadius: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(13, 20, 48, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', opacity: 0.8 }}>
            <BarChart3 size={18} color="#fff" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Performance Analytics</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Hiring Insights</h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.7, fontSize: '15px' }}>Track your recruitment pipeline and candidate engagement metrics.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', 
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '12px', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', backdropFilter: 'blur(10px)' 
            }}>
                <Filter size={16} /> Filter Date
            </button>
            <button style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
                background: '#fff', border: 'none', borderRadius: '12px', color: nestNavy, 
                fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' 
            }}>
                <Download size={16} /> Export Report
            </button>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {reportCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
                background: '#fff', padding: '24px', borderRadius: '24px', 
                border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${card.color}10`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>
                 <ArrowUpRight size={14} /> {card.trend.split(' ')[0]}
              </div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>{card.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#111827' }}>{card.value}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', fontWeight: 500 }}>{card.trend}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section Placeholder */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>Application Trends</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: nestNavy, background: 'rgba(26, 38, 82, 0.05)', padding: '4px 10px', borderRadius: '20px' }}>Weekly</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', padding: '4px 10px' }}>Monthly</span>
                  </div>
              </div>
              
              <div style={{ height: '300px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px' }}>
                  {/* Decorative chart lines */}
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        style={{ width: '32px', background: `linear-gradient(to top, ${nestNavy}, ${nestNavy}cc)`, borderRadius: '8px 8px 4px 4px' }}
                      />
                  ))}
                  {/* Grid Lines */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.05 }}>
                      {[1,2,3,4].map(l => <div key={l} style={{ borderTop: '1px solid #000', width: '100%' }} />)}
                  </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', color: '#94a3b8', fontSize: '11px', fontWeight: 700, padding: '0 10px' }}>
                  <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
              </div>
          </div>

          <div style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>Hiring Targets</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                      { label: 'Q2 Hiring Goal', current: 5, target: 12, color: nestRed },
                      { label: 'Pipeline Quality', current: 18, target: 20, color: '#10b981' },
                      { label: 'Time to Fill', current: 14, target: 20, color: '#3b82f6' }
                  ].map((target, idx) => (
                      <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 700, color: '#334155' }}>{target.label}</span>
                              <span style={{ fontWeight: 800, color: nestNavy }}>{Math.round((target.current / target.target) * 100)}%</span>
                          </div>
                          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(target.current / target.target) * 100}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{ height: '100%', background: target.color, borderRadius: '10px' }}
                              />
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>{target.current} of {target.target} completed</div>
                      </div>
                  ))}
              </div>

              <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(26, 38, 82, 0.03)', borderRadius: '20px', border: '1px solid rgba(26, 38, 82, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: nestNavy, fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
                      <Target size={14} /> Quick Insight
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                      Candidate response rates are 12% higher on Tuesdays. Consider posting new roles early in the week.
                  </p>
              </div>
          </div>
      </div>

    </div>
  );
};

export default RecruiterReports;
