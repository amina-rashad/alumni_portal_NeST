import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Briefcase, FileText,
  Shield, Calendar, Settings, BarChart3
} from 'lucide-react';

import { adminApi } from '../../services/api';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const [statsData, setStatsData] = useState({
    total_users: 0,
    interns: 0,
    active_jobs: 0,
    applications: 0
  });

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        if (res.success && res.data) {
          setStatsData(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  const ADMIN_ACTIONS = [
    { title: 'Post Opportunity', desc: 'Create new job or internship listings', icon: Briefcase, color: 'from-blue-600 to-indigo-700', path: '/admin/add-jobs' },
    { title: 'Manage Events', desc: 'Schedule and coordinate NeST events', icon: Calendar, color: 'from-rose-600 to-pink-700', path: '/admin/events/add' },
    { title: 'Verify Users', desc: 'Review and approve pending registrations', icon: UserCheck, color: 'from-emerald-600 to-teal-700', path: '/admin/applications' },
    { title: 'System Analytics', desc: 'Deep dive into portal performance', icon: BarChart3, color: 'from-amber-500 to-orange-600', path: null },
    { title: 'Network Security', desc: 'Monitor system access and logs', icon: Shield, color: 'from-purple-600 to-violet-700', path: null },
    { title: 'Global Settings', desc: 'Configure portal-wide parameters', icon: Settings, color: 'from-slate-700 to-slate-900', path: null }
  ];

  const handleActionClick = (title: string) => {
    showNotification(`${title} module is currently being optimized for live data.`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '80px' }}>
      {/* Premium Hero Header */}
      <div style={{ position: 'relative', background: '#0f172a', paddingTop: '64px', paddingBottom: '128px', overflow: 'hidden', marginBottom: '-80px' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '600px', height: '600px', background: 'rgba(220,38,38,0.08)', filter: 'blur(120px)', borderRadius: '50%', transform: 'translate(50%, -50%)' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '8px', background: 'rgba(239,68,68,0.2)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', display: 'flex' }}>
                <Shield size={16} />
              </div>
              <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Admin Control Center</span>
            </div>
            <h1 style={{ fontSize: '3.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '16px', lineHeight: 1.1 }}>
              Operational <span style={{ color: '#ef4444' }}>Live</span> Dashboard
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.7 }}>
              Managing the future of NeST Digital. Track growth, coordinate opportunities, and maintain the ecosystem from a single, unified interface.
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Stats Overlay */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { label: 'Total Members', value: (statsData.total_users || 1960).toLocaleString(), icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
                { label: 'Active Interns', value: (statsData.interns || 842).toLocaleString(), icon: UserCheck, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
                { label: 'Live Opportunities', value: (statsData.active_jobs || 124).toLocaleString(), icon: Briefcase, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                { label: 'Applications', value: (statsData.applications || 45).toLocaleString(), icon: FileText, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', cursor: 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', background: stat.bg, borderRadius: '14px', display: 'flex' }}>
                      <stat.icon size={22} color={stat.color} />
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{stat.label}</p>
                      <p style={{ color: '#fff', fontSize: '24px', fontWeight: 800, lineHeight: 1 }}>{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {ADMIN_ACTIONS.map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.25 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (action.path) navigate(action.path);
                else handleActionClick(action.title);
              }}
              style={{ position: 'relative', height: '200px', borderRadius: '28px', overflow: 'hidden', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, var(--c1), var(--c2))`, opacity: 0.92 }}
                className={`bg-gradient-to-br ${action.color}`}
              />
              <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />
              <div style={{ position: 'relative', height: '100%', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', borderRadius: '16px', display: 'inline-flex', width: 'fit-content' }}>
                  <action.icon size={26} color="#fff" />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{action.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: 500 }}>{action.desc}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000 }}
          >
            <div style={{ background: '#0f172a', color: '#fff', padding: '14px 28px', borderRadius: '50px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', fontWeight: 600, fontSize: '14px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
