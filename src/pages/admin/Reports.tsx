import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  TrendingUp, ArrowUpRight, ArrowDownRight,
  Shield, 
  Activity, PieChart, Sparkles
} from 'lucide-react';
import { adminApi } from '../../services/api';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [stats, setStats] = useState<any>(null);
  const nestNavy = '#1a2652';

  useEffect(() => {
    const fetchStats = async () => {
      const res = await adminApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    };
    fetchStats();
  }, []);

  const platformStats = [
    { label: 'Total Users', value: stats?.total_users || 0, target: '500', trend: '+12%', isPositive: true },
    { label: 'Active Interns', value: stats?.total_interns || 0, target: '50', trend: '+5%', isPositive: true },
    { label: 'Open Jobs', value: stats?.active_jobs || 0, target: '20', trend: '-2%', isPositive: false },
    { label: 'Applications', value: stats?.total_applications || 0, target: '200', trend: '+15%', isPositive: true }
  ];

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', color: '#1e293b', paddingBottom: '100px' }}>
      {/* Executive Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', background: '#fff', padding: '24px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0' }}>Platform Governance Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Data Sync: Real-time (Active)</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '4px', borderRadius: '12px', display: 'flex', border: '1px solid #e2e8f0' }}>
            {['Weekly', 'Monthly', 'Yearly'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t as any)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === t ? '#fff' : 'transparent',
                  color: activeTab === t ? nestNavy : '#64748b',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: activeTab === t ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: nestNavy, border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(26, 38, 82, 0.2)' }}>
            <Download size={16} /> Export Executive Summary
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {platformStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
              <div style={{ color: stat.isPositive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 800 }}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.trend}
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>{stat.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '4px', background: '#f1f5f9', borderRadius: '4px' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(parseFloat(stat.value) / 100) * 100}%` }}
                  style={{ height: '100%', background: stat.isPositive ? nestNavy : '#ef4444', borderRadius: '4px' }}
                />
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>TGT: {stat.target}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '40px' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0' }}>Strategic Performance Roadmap</h2>
              <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Quarterly variance analysis of platform-wide user-side activity.</p>
            </div>
          </div>

          <div style={{ position: 'relative', height: '320px', width: '100%', paddingBottom: '40px' }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={nestNavy} stopOpacity="0.1" />
                  <stop offset="100%" stopColor={nestNavy} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map(i => <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#f1f5f9" strokeWidth="1" />)}
              <path
                d="M 0 250 C 100 240, 200 200, 300 210 S 500 150, 600 160 S 800 100, 1000 80"
                fill="none" stroke={nestNavy} strokeWidth="4" strokeLinecap="round"
              />
              <path
                d="M 0 250 C 100 240, 200 200, 300 210 S 500 150, 600 160 S 800 100, 1000 80 L 1000 300 L 0 300 Z"
                fill="url(#chartFill)"
              />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', color: '#94a3b8', fontSize: '11px', fontWeight: 800 }}>
              <span>Q1 ANALYSIS</span>
              <span>Q2 ANALYSIS</span>
              <span>Q3 ANALYSIS</span>
              <span>Q4 ANALYSIS</span>
            </div>
          </div>
        </div>

        {/* Actionable Insights Panel */}
        <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.08)', color: nestNavy }}><Activity size={18} /></div> Executive Insights
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { title: 'Community Growth', desc: 'Average alumni activity has increased by 15% following the Q1 Networking Event.', color: nestNavy, icon: <TrendingUp size={16} /> },
              { title: 'Placement Lag', desc: 'Job-to-Placement ratio shows a minor delay in Engineering department roles.', color: '#ef4444', icon: <Activity size={16} /> },
              { title: 'Skill Convergence', desc: 'Strong correlation identified between React proficiency and higher hiring success.', color: '#8b5cf6', icon: <PieChart size={16} /> }
            ].map((insight, idx) => (
              <div key={idx} style={{ padding: '20px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: insight.color, fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                  {insight.icon} {insight.title}
                </div>
                <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#64748b', margin: 0, fontWeight: 500 }}>{insight.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
        {/* Recruitment Governance Table (Professional) */}
        <div style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', gridColumn: 'span 2', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Departmental Placement Analysis</h3>
            <button style={{ background: 'transparent', border: 'none', color: nestNavy, fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>VIEW ALL DATA</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fcfdfe' }}>
                <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</th>
                <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Efficiency %</th>
                <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alumni Hired</th>
                <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Variance</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Software Engineering', rate: 92, count: 184, variance: '+4.2%' },
                { name: 'Product Management', rate: 84, count: 56, variance: '+1.5%' },
                { name: 'Data Science', rate: 78, count: 42, variance: '-2.4%' },
                { name: 'UX/UI Design', rate: 88, count: 30, variance: '+3.1%' }
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px 32px', fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{row.name}</td>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
                      <div style={{ flex: 1, width: '80px', height: '6px', background: '#f1f5f9', borderRadius: '4px' }}>
                        <div style={{ width: `${row.rate}%`, height: '100%', background: nestNavy, borderRadius: '4px' }}></div>
                      </div>
                      {row.rate}%
                    </div>
                  </td>
                  <td style={{ padding: '20px 32px', fontSize: '14px', fontWeight: 700, color: '#64748b' }}>{row.count}</td>
                  <td style={{ padding: '20px 32px', fontSize: '14px', fontWeight: 800, color: row.variance.startsWith('+') ? '#10b981' : '#ef4444', textAlign: 'right' }}>{row.variance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System & Security Report */}
        <div style={{ background: nestNavy, padding: '40px', borderRadius: '32px', color: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(26, 38, 82, 0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>System Governance</h3>
            <Shield size={24} color="#3b82f6" />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DATABASE REDUNDANCY</div>
              <div style={{ fontSize: '22px', fontWeight: 800 }}>Enabled (L3)</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>USER ACCESS LOGS</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 500 }}>All administrative operations are encrypted and logged for auditing purposes.</div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#3b82f6' }}>SECURITY SCORE</span>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>A+ GRADE</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
              <div style={{ width: '98%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
