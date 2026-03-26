import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download, ArrowUpRight, ArrowDownRight,
  TrendingUp, Activity, PieChart, Sparkles
} from 'lucide-react';
import { adminApi } from '../../services/api';

const Reports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', background: '#fff', padding: '24px 32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0' }}>Platform Governance Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Data Sync: Real-time (Active)</span>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          <Download size={16} /> Export Executive Summary
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {platformStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{stat.label}</span>
              <div style={{ color: stat.isPositive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.trend}
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>{stat.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '4px', background: '#f1f5f9', borderRadius: '4px' }}>
                <div style={{ width: '70%', height: '100%', background: stat.isPositive ? '#3b82f6' : '#ef4444', borderRadius: '4px' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>TGT: {stat.target}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '40px' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '48px' }}>Strategic Growth Roadmap</h2>
          <div style={{ position: 'relative', height: '300px', width: '100%' }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <path d="M 0 250 C 100 240, 200 200, 300 210 S 500 150, 600 160 S 800 100, 1000 80" fill="none" stroke="#3b82f6" strokeWidth="4" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', color: '#94a3b8', fontSize: '11px', fontWeight: 700 }}>
              <span>JAN</span><span>APR</span><span>JUL</span><span>OCT</span><span>DEC</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#3b82f6" /> Strategic Insights
          </h3>
          {[
            { title: 'Community Growth', desc: 'User activity is up 15% after the recent network update.', icon: <TrendingUp size={16} /> },
            { title: 'Placement Status', desc: 'Job-to-Placement ratio is healthy at 74%.', icon: <Activity size={16} /> },
            { title: 'Skills Hotspot', desc: 'React and Node.js are the most sought-after skills.', icon: <PieChart size={16} /> }
          ].map((insight, idx) => (
            <div key={idx} style={{ padding: '20px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                {insight.icon} {insight.title}
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{insight.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
