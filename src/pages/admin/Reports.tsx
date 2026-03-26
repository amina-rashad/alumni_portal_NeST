import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Briefcase, GraduationCap, Trophy,
  MessageSquare, Calendar, Download, Filter,
  TrendingUp, ArrowUpRight, ArrowDownRight,
  Shield, Globe, Sparkles, Search, ChevronDown,
  Info, ExternalLink, Activity, PieChart
} from 'lucide-react';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  // Enterprise-grade Data Structure
  const platformStats = [
    { label: 'Network Integrity', value: '98.4%', target: '99%', trend: '+0.2%', isPositive: true },
    { label: 'Hiring Efficiency', value: '74.2 days', target: '60 days', trend: '-5.1d', isPositive: true },
    { label: 'Learning Retention', value: '82.1%', target: '80%', trend: '+2.4%', isPositive: true },
    { label: 'Active Participation', value: '62.5%', target: '70%', trend: '-1.2%', isPositive: false }
  ];

  const recruitmentMetrics = [
    { category: 'Alumni Hired', current: 312, target: 400, color: '#3b82f6' },
    { category: 'Applications', current: 1248, target: 1500, color: '#10b981' },
    { category: 'Job Openings', current: 48, target: 100, color: '#8b5cf6' }
  ];

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', color: '#1e293b', paddingBottom: '100px' }}>
      {/* Executive Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', background: '#fff', padding: '24px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.2px' }}>Platform Governance Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Data Sync: Real-time (Active)</span>
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
                  color: activeTab === t ? '#1e293b' : '#64748b',
                  fontWeight: 700,
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
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <Download size={16} /> Export Executive Summary
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Refined) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {platformStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
              <div style={{ color: stat.isPositive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.trend}
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>{stat.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '4px', background: '#f1f5f9', borderRadius: '4px' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(parseInt(stat.value) / 100) * 100}%` }}
                  style={{ height: '100%', background: stat.isPositive ? '#3b82f6' : '#ef4444', borderRadius: '4px' }}
                />
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>TGT: {stat.target}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytical Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '40px' }}>
        {/* Performance & Growth Hub */}
        <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0' }}>Strategic Performance Roadmap</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Quarterly variance analysis of platform-wide user-side activity.</p>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>PLATFORM HEALTH</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>OPTIMAL</div>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', height: '320px', width: '100%', paddingBottom: '40px' }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid */}
              {[0, 1, 2, 3].map(i => <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#f1f5f9" strokeWidth="1" />)}

              {/* Smooth Curve */}
              <path
                d="M 0 250 C 100 240, 200 200, 300 210 S 500 150, 600 160 S 800 100, 1000 80"
                fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"
              />
              <path
                d="M 0 250 C 100 240, 200 200, 300 210 S 500 150, 600 160 S 800 100, 1000 80 L 1000 300 L 0 300 Z"
                fill="url(#chartFill)"
              />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', color: '#94a3b8', fontSize: '11px', fontWeight: 700 }}>
              <span>Q1 ANALYSIS</span>
              <span>Q2 ANALYSIS</span>
              <span>Q3 ANALYSIS</span>
              <span>Q4 ANALYSIS</span>
            </div>
          </div>
        </div>

        {/* Actionable Insights Panel */}
        <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#3b82f6" /> Executive Insights
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { title: 'Community Growth', desc: 'Average alumni activity has increased by 15% following the Q1 Networking Event.', icon: <TrendingUp size={16} /> },
              { title: 'Placement Lag', desc: 'Job-to-Placement ratio shows a minor delay in Engineering department roles.', icon: <Activity size={16} /> },
              { title: 'Skill Convergence', desc: 'Strong correlation identified between React proficiency and higher hiring success.', icon: <PieChart size={16} /> }
            ].map((insight, idx) => (
              <div key={idx} style={{ padding: '20px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                  {insight.icon} {insight.title}
                </div>
                <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#64748b', margin: 0 }}>{insight.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '16px', background: '#3b82f610', border: '1px solid #3b82f620', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>AI ANALYTICS ENGINE: ENABLED</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
        {/* Recruitment Governance Table (Professional) */}
        <div style={{ background: '#fff', borderRadius: '28px', border: '1px solid #e2e8f0', gridColumn: 'span 2', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Departmental Placement Analysis</h3>
            <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>VIEW ALL DATA</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px 32px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase' }}>Department</th>
                <th style={{ padding: '16px 32px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase' }}>Efficiency %</th>
                <th style={{ padding: '16px 32px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase' }}>Alumni Hired</th>
                <th style={{ padding: '16px 32px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textAlign: 'right', textTransform: 'uppercase' }}>Variance</th>
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
                  <td style={{ padding: '16px 32px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{row.name}</td>
                  <td style={{ padding: '16px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                      <div style={{ flex: 1, width: '80px', height: '6px', background: '#f1f5f9', borderRadius: '4px' }}>
                        <div style={{ width: `${row.rate}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
                      </div>
                      {row.rate}%
                    </div>
                  </td>
                  <td style={{ padding: '16px 32px', fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{row.count}</td>
                  <td style={{ padding: '16px 32px', fontSize: '14px', fontWeight: 800, color: row.variance.startsWith('+') ? '#10b981' : '#ef4444', textAlign: 'right' }}>{row.variance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System & Security Report */}
        <div style={{ background: '#1e293b', padding: '32px', borderRadius: '32px', color: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>System Governance</h3>
            <Shield size={20} color="#3b82f6" />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>DATABASE REDUNDANCY</div>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>Enabled (L3)</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>USER ACCESS LOGS</div>
              <div style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.5 }}>All administrative operations are encrypted and logged for auditing purposes.</div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>SECURITY SCORE</span>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>A+ GRADE</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
              <div style={{ width: '98%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
