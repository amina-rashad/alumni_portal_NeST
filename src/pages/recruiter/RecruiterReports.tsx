import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, Briefcase, CheckCircle2, 
  ArrowUpRight, Target, Zap, Lightbulb, TrendingUp
} from 'lucide-react';
import { recruiterApi } from '../../services/api';

const RecruiterReports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  const fetchStats = async () => {
    try {
      const res = await recruiterApi.getStats();
      if (res.success && res.data) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch recruiter stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Continuous automatic background sync every 8 seconds
    const interval = setInterval(fetchStats, 8000);

    // Auto-sync whenever user focuses the browser window or returns to the tab
    const handleFocus = () => fetchStats();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const totalJobs = stats?.active_jobs ?? stats?.total_jobs ?? 0;
  const totalApps = stats?.total_applications || 0;
  const shortlistedCount = stats?.shortlisted || 0;
  const pendingCount = stats?.pending || 0;
  const hiredCount = stats?.hired || 0;
  const reviewedCount = stats?.reviewed || 0;
  const conversionRate = totalApps > 0 ? Math.round((shortlistedCount / totalApps) * 100) : 0;

  const reportCards = [
    { 
      label: 'Active Openings', 
      value: totalJobs, 
      trend: 'Live openings', 
      badge: 'Live',
      icon: <Briefcase size={20} />, 
      color: '#3b82f6' 
    },
    { 
      label: 'Total Applicants', 
      value: totalApps, 
      trend: 'Total submitted', 
      badge: 'All time',
      icon: <Users size={20} />, 
      color: '#8b5cf6' 
    },
    { 
      label: 'Shortlisted', 
      value: shortlistedCount, 
      trend: 'Shortlisted pool', 
      badge: totalApps > 0 ? `${conversionRate}% rate` : 'Shortlisted',
      icon: <CheckCircle2 size={20} />, 
      color: '#10b981' 
    },
    { 
      label: 'Pending Review', 
      value: pendingCount, 
      trend: 'Needs action', 
      badge: pendingCount > 0 ? `${pendingCount} urgent` : 'Up to date',
      icon: <Zap size={20} />, 
      color: nestRed 
    },
  ];

  // Trends calculation
  const weeklyLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const monthlyLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const currentTrends = timeframe === 'weekly'
    ? (stats?.weekly_trends || [0, 0, 0, 0, 0, 0, 0])
    : (stats?.monthly_trends || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  const currentLabels = timeframe === 'weekly' ? weeklyLabels : monthlyLabels;
  const maxTrend = Math.max(...currentTrends, 1);
  const totalPeriodApps = currentTrends.reduce((a: number, b: number) => a + b, 0);

  // Hiring targets synchronized with live database counts
  const hiringTargets = [
    { 
      label: 'Hiring Goal', 
      current: hiredCount, 
      target: totalJobs, 
      color: nestRed, 
      unit: `${hiredCount} of ${totalJobs} positions filled`,
      percentage: totalJobs > 0 ? Math.min(100, Math.round((hiredCount / totalJobs) * 100)) : 0
    },
    { 
      label: 'Pipeline Quality', 
      current: shortlistedCount, 
      target: totalApps, 
      color: '#10b981', 
      unit: `${shortlistedCount} of ${totalApps} candidates shortlisted`,
      percentage: totalApps > 0 ? Math.min(100, Math.round((shortlistedCount / totalApps) * 100)) : 0
    },
    { 
      label: 'Review Progress', 
      current: reviewedCount, 
      target: totalApps, 
      color: '#3b82f6', 
      unit: `${reviewedCount} of ${totalApps} applications reviewed`,
      percentage: totalApps > 0 ? Math.min(100, Math.round((reviewedCount / totalApps) * 100)) : 0
    }
  ];

  // Live insights directly from database
  const liveInsights = stats?.insights || [];

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
      </header>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {reportCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ 
              background: '#fff', padding: '24px', borderRadius: '24px', 
              border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${card.color}10`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '11px', 
                fontWeight: 700, 
                color: card.color,
                background: `${card.color}12`,
                padding: '4px 10px',
                borderRadius: '8px'
              }}>
                <ArrowUpRight size={13} /> {card.badge}
              </div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>{card.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#111827' }}>
              {loading ? '...' : card.value}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', fontWeight: 500 }}>{card.trend}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Targets Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Application Trends Chart with Interactive Weekly/Monthly Toggle */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>Application Trends</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                {timeframe === 'weekly' ? 'Daily candidate application activity (Mon - Sun)' : 'Monthly candidate application activity (Jan - Dec)'}
              </p>
            </div>
            
            {/* Interactive Toggle Pill */}
            <div style={{ 
              display: 'flex', 
              background: '#f1f5f9', 
              padding: '3px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0' 
            }}>
              <button
                type="button"
                onClick={() => setTimeframe('weekly')}
                style={{
                  border: 'none',
                  background: timeframe === 'weekly' ? nestNavy : 'transparent',
                  color: timeframe === 'weekly' ? '#fff' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: timeframe === 'weekly' ? '0 2px 6px rgba(26, 38, 82, 0.25)' : 'none'
                }}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('monthly')}
                style={{
                  border: 'none',
                  background: timeframe === 'monthly' ? nestNavy : 'transparent',
                  color: timeframe === 'monthly' ? '#fff' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: timeframe === 'monthly' ? '0 2px 6px rgba(26, 38, 82, 0.25)' : 'none'
                }}
              >
                Monthly
              </button>
            </div>
          </div>
          
          {/* Chart Canvas */}
          <div style={{ 
            height: '280px', 
            width: '100%', 
            position: 'relative', 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between', 
            padding: '0 12px 10px 12px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={timeframe}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'flex-end', justifyContent: 'space-between' }}
              >
                {currentTrends.map((val: number, i: number) => {
                  const hasData = val > 0;
                  const pct = hasData ? Math.max(14, Math.round((val / maxTrend) * 82)) : 6;
                  const barWidth = timeframe === 'weekly' ? '36px' : '20px';

                  return (
                    <div 
                      key={i} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '8px', 
                        zIndex: 2, 
                        height: '100%', 
                        justifyContent: 'flex-end',
                        flex: 1,
                        maxWidth: timeframe === 'weekly' ? '60px' : '36px'
                      }}
                    >
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 800, 
                        color: hasData ? nestNavy : '#cbd5e1',
                        transition: 'color 0.2s ease'
                      }}>
                        {val}
                      </span>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.03, ease: 'easeOut' }}
                        style={{ 
                          width: barWidth, 
                          height: `${pct}%`, 
                          background: hasData 
                            ? `linear-gradient(to top, ${nestNavy}, #334e9e)`
                            : '#f1f5f9', 
                          borderRadius: '8px 8px 4px 4px',
                          boxShadow: hasData ? '0 4px 10px rgba(26, 38, 82, 0.15)' : 'none'
                        }}
                      />
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Grid Lines */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.06 }}>
              {[1, 2, 3, 4].map(l => <div key={l} style={{ borderTop: '1px solid #000', width: '100%' }} />)}
            </div>
          </div>

          {/* Bottom Labels */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '16px', 
            color: '#94a3b8', 
            fontSize: timeframe === 'weekly' ? '12px' : '10px', 
            fontWeight: 700, 
            padding: '0 12px' 
          }}>
            {currentLabels.map((lbl, i) => (
              <span key={i} style={{ flex: 1, textAlign: 'center', letterSpacing: '0.5px' }}>{lbl}</span>
            ))}
          </div>

          {/* Bottom Meta */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '20px', 
            paddingTop: '16px', 
            borderTop: '1px solid #f8fafc',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <span>Total applications logged in this view: <strong style={{ color: nestNavy }}>{totalPeriodApps}</strong></span>
            {stats?.best_day && timeframe === 'weekly' && (
              <span style={{ color: '#10b981', fontWeight: 600 }}>Highest activity day: {stats.best_day}</span>
            )}
          </div>
        </div>

        {/* Hiring Targets Section */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>Hiring Targets</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Live fulfillment and conversion benchmarks</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {hiringTargets.map((target, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#334155' }}>{target.label}</span>
                  <span style={{ fontWeight: 800, color: nestNavy }}>{target.percentage}%</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${target.percentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ height: '100%', background: target.color, borderRadius: '10px' }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
                  {target.unit}
                </div>
              </div>
            ))}
          </div>

          {/* Synchronized Dynamic Quick Insights */}
          <div style={{ 
            marginTop: 'auto', 
            padding: '20px', 
            background: 'linear-gradient(135deg, rgba(26, 38, 82, 0.03) 0%, rgba(26, 38, 82, 0.07) 100%)', 
            borderRadius: '20px', 
            border: '1px solid rgba(26, 38, 82, 0.08)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: nestNavy, fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
              <Lightbulb size={16} color={nestNavy} /> Quick Insight
            </div>
            
            {liveInsights.length > 0 ? (
              liveInsights.slice(0, 2).map((ins: any, idx: number) => (
                <div key={idx} style={{ marginBottom: idx < Math.min(liveInsights.length, 2) - 1 ? '10px' : 0 }}>
                  {ins.title && (
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>
                      {ins.title}
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                    {ins.message}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                Analyzing live recruitment pipeline activity...
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default RecruiterReports;

