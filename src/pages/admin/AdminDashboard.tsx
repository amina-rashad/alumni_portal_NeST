import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Briefcase, FileText,
  Plus, Activity, Shield, ChevronRight
} from 'lucide-react';

import { adminApi } from '../../services/api';

const nestNavy = '#1a2652';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState({
    total_users: 0,
    interns: 0,
    active_jobs: 0,
    applications: 0,
    total_managers: 0,
    distribution: {} as Record<string, number>
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        if (res.success && res.data) {
          setStatsData((res.data as any).stats);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Users', value: statsData.total_users.toLocaleString(), trend: '+4.2%', icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Managers', value: statsData.total_managers.toLocaleString(), trend: 'Active', icon: Shield, color: '#c8102e', bg: '#fef2f2' },
    { title: 'Active Interns', value: statsData.interns.toLocaleString(), trend: '+12%', icon: UserCheck, color: '#06b6d4', bg: '#ecfeff' },
    { title: 'Open Roles', value: statsData.active_jobs.toLocaleString(), trend: '+2', icon: Briefcase, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Applications', value: statsData.applications.toLocaleString(), trend: '+8', icon: FileText, color: '#f59e0b', bg: '#fffbeb' },
  ];

  const recentActivity = [
    { user: 'Admin', action: 'accessed dashboard', time: 'Just now', avatar: 'AD' },
    { user: 'System', action: 'refreshed live data', time: 'Recently', avatar: 'SY' },
  ];

  const dist = statsData.distribution || {};
  const totalInDist = Object.values(dist).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Platform Insights</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => navigate('/admin/users')}
            style={{ 
              padding: '12px 24px', 
              background: '#fff', 
              color: '#1e293b', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              fontWeight: 700, 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
            Manage Users
          </button>
        </div>
      </div>

      {/* Stats - Compact Grid (Updated to 5 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: '#fff', padding: '20px', borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '160px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ background: stat.bg, width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={22} color={stat.color} />
              </div>
              <div style={{ 
                padding: '4px 10px', 
                background: '#ecfdf5', 
                color: '#10b981', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: 800 
              }}>
                {stat.trend}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>{stat.title}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Row: Pie Graph & Bar Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* PIE GRAPH: Platform Overview */}
        <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Platform Distribution</h3>
          <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.svg
              initial={{ scale: 0.8, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "backOut" }}
              width="180" height="180" viewBox="0 0 100 100">
              <motion.circle
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{ strokeDasharray: `${(dist['Alumni'] || 0) / totalInDist * 251.2} 251.2` }}
                transition={{ duration: 1.5, delay: 0.2 }}
                cx="50" cy="50" r="40" fill="transparent" stroke={nestNavy} strokeWidth="20" transform="rotate(-90 50 50)" />
              <motion.circle
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{ strokeDasharray: `${(dist['IV Students'] || 0) / totalInDist * 251.2} 251.2` }}
                transition={{ duration: 1.5, delay: 0.4 }}
                cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="20" transform={`rotate(${(dist['Alumni'] || 0) / totalInDist * 360 - 90} 50 50)`} />
              <motion.circle
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{ strokeDasharray: `${(dist['Interns'] || 0) / totalInDist * 251.2} 251.2` }}
                transition={{ duration: 1.5, delay: 0.6 }}
                cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="20" transform={`rotate(${((dist['Alumni'] || 0) + (dist['IV Students'] || 0)) / totalInDist * 360 - 90} 50 50)`} />
              <motion.circle
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{ strokeDasharray: `${(dist['Staff'] || 0) / totalInDist * 251.2} 251.2` }}
                transition={{ duration: 1.5, delay: 0.8 }}
                cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="20" transform={`rotate(${((dist['Alumni'] || 0) + (dist['IV Students'] || 0) + (dist['Interns'] || 0)) / totalInDist * 360 - 90} 50 50)`} />
              <circle cx="50" cy="50" r="28" fill="#fff" />
            </motion.svg>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
              style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>TOTAL</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>{statsData.total_users}</div>
            </motion.div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: nestNavy }}></div> Alumni ({dist['Alumni'] || 0})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }}></div> IV Students ({dist['IV Students'] || 0})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }}></div> Interns ({dist['Interns'] || 0})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }}></div> Staff ({dist['Staff'] || 0})
            </div>
          </div>
        </section>

        {/* BAR GRAPH: Growth Analytics */}
        <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Enrollment Growth</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Monthly user acquisition trends</p>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: nestNavy }}></div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Peak Month</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(26, 38, 82, 0.15)' }}></div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Average</span>
               </div>
            </div>
          </div>

          <div style={{ position: 'relative', height: '240px', padding: '0 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {/* Grid Lines */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', padding: '0 0 40px 0' }}>
               {[1, 2, 3, 4].map(i => (
                 <div key={i} style={{ width: '100%', height: '1px', background: '#f1f5f9' }}></div>
               ))}
            </div>

            {[60, 40, 85, 30, 95, 70, 50, 110, 80, 130, 90, 105].map((h, i) => {
              const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1, position: 'relative' }}>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    style={{ 
                      position: 'absolute', top: '-30px', 
                      background: '#1e293b', color: '#fff', 
                      padding: '4px 8px', borderRadius: '6px', 
                      fontSize: '10px', fontWeight: 800,
                      opacity: 0, pointerEvents: 'none'
                    }}
                  >
                    {h * 2}+
                  </motion.div>
                  <div style={{ position: 'relative', width: '24px', height: '160px', display: 'flex', alignItems: 'flex-end' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}px` }}
                      whileHover={{ scaleX: 1.1, filter: 'brightness(1.1)' }}
                      transition={{ delay: i * 0.05, duration: 0.8, type: 'spring', stiffness: 100 }}
                      style={{ 
                        width: '100%', 
                        background: i === 9 ? nestNavy : 'rgba(26, 38, 82, 0.15)', 
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    ></motion.div>
                  </div>
                  <span style={{ fontSize: '10px', color: i === 9 ? nestNavy : '#94a3b8', fontWeight: 800 }}>{month}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Content Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '32px' }}>

        {/* Recent Activity Section */}
        <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.08)', color: nestNavy }}><Activity size={18} /></div> Recent Activities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {recentActivity.map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ padding: '20px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: nestNavy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                  {act.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{act.user}</div>
                  <div style={{ fontSize: '12px', color: '#475569', margin: '4px 0', fontWeight: 500 }}>{act.action}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{act.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Global Actions */}
        <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: `2px solid ${nestNavy}15`, boxShadow: '0 10px 30px rgba(26, 38, 82, 0.04)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => navigate('/admin/add-courses')}
              style={{ width: '100%', padding: '14px', borderRadius: '16px', border: 'none', background: nestNavy, color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' }}
            >
              <Plus size={16} /> Add Course
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
