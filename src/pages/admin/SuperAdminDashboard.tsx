import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Activity, Server, Database, 
  AlertTriangle, CheckCircle, Clock, Settings, Lock,
  Search, X, UserPlus, ChevronRight, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { adminApi } from '../../services/api';

const nestNavy = '#1a2652';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    api: 'Optimal',
    db: 'Encrypted & Connected',
    lastBackup: '45 mins ago',
    activeSessions: 142,
    securityThreats: 0
  });

  const [recentLogs, setRecentLogs] = useState([
    { id: 1, action: 'Role Hierarchy Update', user: 'superadmin@nest.com', target: 'Global System', time: '5 mins ago', type: 'security' },
    { id: 2, action: 'Admin Account Created', user: 'superadmin@nest.com', target: 'New Recruiter', time: '22 mins ago', type: 'user' },
    { id: 3, action: 'Bulk Certificate Export', user: 'admin_12', target: 'Oct 2024 Batch', time: '1 hour ago', type: 'data' },
    { id: 4, action: 'Database Index Optimization', user: 'System Auto', target: 'Users Collection', time: '3 hours ago', type: 'system' },
  ]);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Dynamic Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '2px', background: nestNavy, borderRadius: '2px' }} />
            <span style={{ fontSize: '13px', fontWeight: 800, color: nestNavy, textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Governance</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Console <span style={{ color: nestNavy }}>Overview</span></h1>
        </motion.div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
           <button style={actionButtonStyle}>
              <TrendingUp size={16} /> Reports
           </button>
           <button style={{ ...actionButtonStyle, background: nestNavy, color: '#fff' }}>
              <Settings size={16} /> System Config
           </button>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {isLoading ? (
          [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatusCard title="API Latency" value={systemStatus.api} icon={<Server size={22} />} color={nestNavy} trend="+0.2ms" />
            <StatusCard title="Database" value={systemStatus.db} icon={<Database size={22} />} color="#8b5cf6" trend="Optimal" />
            <StatusCard title="Security Pulse" value={systemStatus.securityThreats.toString()} icon={<ShieldCheck size={22} />} color="#ef4444" isAlert={systemStatus.securityThreats > 0} trend="Protected" />
            <StatusCard title="Active Traffic" value={systemStatus.activeSessions.toString()} icon={<Activity size={22} />} color="#10b981" trend="+12% today" />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
        
        {/* Modern Activity Pipeline */}
        <section style={cardStyle}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>System Audit Pipeline</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Real-time stream of high-privilege operations.</p>
              </div>
              <button style={{ background: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                View All Logs
              </button>
           </div>
           
           {isLoading ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3].map(i => <SkeletonListItem key={i} />)}
             </div>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentLogs.map((log, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={log.id} 
                    style={logItemStyle}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '48px', height: '48px', borderRadius: '14px', 
                        background: log.type === 'security' ? '#fef2f2' : '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: log.type === 'security' ? '#ef4444' : nestNavy,
                        border: '1px solid rgba(0,0,0,0.03)'
                      }}>
                        {log.type === 'security' ? <Lock size={20} /> : <Activity size={20} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{log.action}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.user}</span> • {log.target}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>{log.time}</div>
                    </div>
                  </motion.div>
                ))}
             </div>
           )}
        </section>

        {/* Quick Operations Panel */}
        <section style={{ ...cardStyle, background: '#fff', display: 'flex', flexDirection: 'column', gap: '32px' }}>
           <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Privileged Actions</h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Restricted high-impact operations.</p>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AdminActionBtn 
                onClick={() => navigate('/admin/add-manager')}
                icon={<UserPlus size={20} />} 
                label="Initialize Staff" 
                desc="Create new manager accounts" 
                color={nestNavy} 
              />
              <AdminActionBtn icon={<ShieldCheck size={20} />} label="Security Policy" desc="Update system firewall & auth" color="#ef4444" />
              <AdminActionBtn icon={<Database size={20} />} label="Cloud Backup" desc="Manual database snapshot" color="#8b5cf6" />
              <AdminActionBtn icon={<Server size={20} />} label="Environment" desc="Modify system variables" color="#10b981" />
           </div>

           <div style={{ marginTop: 'auto', padding: '24px', background: '#f8fafc', borderRadius: '24px', border: '1.5px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `${nestNavy}05`, borderRadius: '0 0 0 100%', transform: 'scale(1.5)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', position: 'relative' }}>
                 <div style={{ padding: '8px', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                   <Clock size={18} color={nestNavy} />
                 </div>
                 <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>Last Backup Sync</span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', position: 'relative' }}>
                 Automatic system backup completed at <strong>14:30 PM</strong>. Status: <span style={{ color: '#10b981', fontWeight: 700 }}>Verified</span>.
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

// --- Sub Components ---

const StatusCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string, isAlert?: boolean, trend?: string }> = ({ title, value, icon, color, isAlert, trend }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = parseInt(value);
  
  useEffect(() => {
    if (!isNaN(numericValue)) {
      let start = 0;
      const duration = 1000;
      const increment = numericValue / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [numericValue]);

  return (
    <motion.div 
      whileHover={{ y: -6, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
      style={{ 
        background: '#fff', padding: '28px', borderRadius: '28px', 
        border: '1px solid #f1f5f9',
        display: 'flex', flexDirection: 'column', gap: '20px',
        position: 'relative', overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ padding: '14px', borderRadius: '16px', background: `${color}08`, color: color }}>
          {icon}
        </div>
        <div style={{ padding: '6px 12px', borderRadius: '10px', background: '#f8fafc', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
          {trend}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{title}</div>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {!isNaN(numericValue) ? displayValue : value}
        </div>
      </div>
      {isAlert && <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', top: 0, right: 0, width: '4px', bottom: 0, background: '#ef4444' }} />}
    </motion.div>
  );
};

const AdminActionBtn: React.FC<{ icon: React.ReactNode, label: string, desc: string, color: string, onClick?: () => void }> = ({ icon, label, desc, color, onClick }) => (
  <motion.button 
    whileHover={{ scale: 1.01, x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', borderRadius: '22px',
      border: '1px solid #f1f5f9', background: '#fff', cursor: 'pointer', transition: 'all 0.2s',
      textAlign: 'left', width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}
  >
    <div style={{ padding: '12px', borderRadius: '14px', background: `${color}08`, color: color }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{label}</div>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{desc}</div>
    </div>
    <ChevronRight size={18} color="#cbd5e1" />
  </motion.button>
);

const SkeletonCard = () => (
  <div style={{ height: '180px', background: '#fff', borderRadius: '28px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid #f1f5f9' }}>
    <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#f1f5f9' }} className="skeleton-pulse" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ width: '60%', height: '14px', borderRadius: '4px', background: '#f1f5f9' }} className="skeleton-pulse" />
      <div style={{ width: '40%', height: '24px', borderRadius: '4px', background: '#f1f5f9' }} className="skeleton-pulse" />
    </div>
  </div>
);

const SkeletonListItem = () => (
  <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #f1f5f9', borderRadius: '20px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f1f5f9' }} className="skeleton-pulse" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ width: '30%', height: '14px', borderRadius: '4px', background: '#f1f5f9' }} className="skeleton-pulse" />
      <div style={{ width: '50%', height: '12px', borderRadius: '4px', background: '#f1f5f9' }} className="skeleton-pulse" />
    </div>
  </div>
);

// --- Styles ---

const cardStyle: React.CSSProperties = {
  background: '#fff', 
  borderRadius: '32px', 
  padding: '40px', 
  border: '1px solid #f1f5f9', 
  boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
};

const logItemStyle: React.CSSProperties = {
  padding: '20px', 
  background: '#fff', 
  borderRadius: '20px', 
  border: '1px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const actionButtonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', 
  borderRadius: '14px', border: '1.5px solid #e2e8f0', background: '#fff', 
  fontSize: '14px', fontWeight: 700, color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s'
};

export default SuperAdminDashboard;
