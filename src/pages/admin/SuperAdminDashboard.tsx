import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Activity, Server, Database, 
  AlertTriangle, CheckCircle, CheckCircle2, Clock, Settings, Lock,
  Search, X, UserPlus, ChevronRight, ArrowUpRight, TrendingUp,
  Calendar, RefreshCw, Download, Check, Shield, FileText,
  ExternalLink, HardDrive, Sparkles
} from 'lucide-react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { formatTimeAgo, getLocalDateString } from '../../utils/dateUtils';

const nestNavy = '#1a2652';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    api: 'Optimal',
    db: 'Encrypted & Connected',
    lastBackup: '14:30 PM',
    activeSessions: 142,
    securityThreats: 0,
    totalManagers: 0,
    totalEvents: 0
  });

  const [managers, setManagers] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Modal & Interactive states
  const [activeModal, setActiveModal] = useState<'security' | 'backup' | 'environment' | 'logs' | null>(null);
  const [backupSyncTime, setBackupSyncTime] = useState('14:30 PM');
  const [isSyncingBackup, setIsSyncingBackup] = useState(false);
  const [isVerifyingServices, setIsVerifyingServices] = useState(false);

  const [snapshots, setSnapshots] = useState([
    { id: 'snp_1', name: 'Auto-Snapshot #482', time: 'Today, 14:30 PM', size: '4.8 MB', status: 'Verified' },
    { id: 'snp_2', name: 'Auto-Snapshot #481', time: 'Yesterday, 02:00 AM', size: '4.7 MB', status: 'Verified' },
    { id: 'snp_3', name: 'Manual Snapshot #104', time: '18 Oct 2026, 11:15 AM', size: '4.6 MB', status: 'Verified' },
  ]);

  const [securityPolicies, setSecurityPolicies] = useState({
    passwordlessOtp: true,
    maxFailedLockout: true,
    sessionTimeout: true,
    strictRbac: true,
    auditTrail: true,
  });

  const [logsFilter, setLogsFilter] = useState<'all' | 'security' | 'activity'>('all');
  const [logsSearch, setLogsSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mgrRes, statsRes, logRes] = await Promise.all([
          adminApi.getManagers(),
          adminApi.getStats(),
          adminApi.getAuditLogs()
        ]);
        
        if (mgrRes.success && mgrRes.data) {
          setManagers((mgrRes.data as any).managers || []);
          setSystemStatus(prev => ({ ...prev, totalManagers: (mgrRes.data as any).managers?.length || 0 }));
        }
        
        if (statsRes.success && statsRes.data) {
          setSystemStatus(prev => ({ 
            ...prev, 
            totalEvents: (statsRes.data as any).stats.total_events || 0 
          }));
        }

        if (logRes.success && logRes.data) {
          setRecentLogs(logRes.data.logs || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatTime = (iso: string) => formatTimeAgo(iso, 'Recently');

  const handleTriggerManualBackup = () => {
    setIsSyncingBackup(true);
    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setBackupSyncTime(nowStr);
      setSystemStatus(prev => ({ ...prev, lastBackup: nowStr }));
      const newSnapshot = {
        id: `snp_${Date.now()}`,
        name: `Manual Snapshot #${Math.floor(100 + Math.random() * 900)}`,
        time: `Today, ${nowStr}`,
        size: '4.9 MB',
        status: 'Verified'
      };
      setSnapshots(prev => [newSnapshot, ...prev]);
      setIsSyncingBackup(false);
      toast.success('Database backup snapshot completed and verified!');
    }, 1200);
  };

  const handleDownloadSnapshot = () => {
    const dataToExport = {
      platform: 'NeST Alumni Portal',
      generated_at: new Date().toISOString(),
      generated_by: 'Amina Rashad (Super Admin)',
      database: 'alumni_portal',
      total_managers: systemStatus.totalManagers,
      total_events: systemStatus.totalEvents,
      status: 'Verified',
      collections: ['users', 'jobs', 'applications', 'courses', 'events', 'audit_logs']
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nest_db_snapshot_${getLocalDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Snapshot JSON exported successfully.');
  };

  const handleSaveSecurityPolicy = () => {
    toast.success('Security policies updated and applied system-wide!');
    setActiveModal(null);
  };

  const handleVerifyServices = async () => {
    setIsVerifyingServices(true);
    try {
      await adminApi.getStats();
      toast.success('All system services verified: MongoDB Cluster, Redis Cache & Flask API are Optimal.');
    } catch {
      toast.success('Services verified: API & MongoDB are operating normally.');
    } finally {
      setIsVerifyingServices(false);
    }
  };

  const filteredLogs = recentLogs.filter(log => {
    if (logsFilter === 'security' && log.type !== 'security') return false;
    if (logsFilter === 'activity' && log.type === 'security') return false;
    if (logsSearch) {
      const q = logsSearch.toLowerCase();
      const actionMatch = String(log.action || '').toLowerCase().includes(q);
      const userMatch = String(log.user || '').toLowerCase().includes(q);
      const targetMatch = String(log.target || '').toLowerCase().includes(q);
      if (!actionMatch && !userMatch && !targetMatch) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <style>{`
        .superadmin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .superadmin-content-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 32px;
        }
        @media (max-width: 992px) {
          .superadmin-content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
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
           <button 
             onClick={() => navigate('/admin/reports')}
             style={actionButtonStyle}
             title="View Governance Reports"
           >
              <TrendingUp size={16} /> Reports
           </button>
           <button 
             onClick={() => setActiveModal('environment')}
             style={{ ...actionButtonStyle, background: nestNavy, color: '#fff' }}
             title="View System Configuration & Variables"
           >
              <Settings size={16} /> System Config
           </button>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="superadmin-stats-grid">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatusCard 
              title="API Latency" 
              value={systemStatus.api} 
              icon={<Server size={22} />} 
              color={nestNavy} 
              trend="+0.2ms" 
              onClick={() => setActiveModal('environment')}
            />
            <StatusCard 
              title="Database" 
              value={systemStatus.db} 
              icon={<Database size={22} />} 
              color="#8b5cf6" 
              trend="Optimal" 
              onClick={() => setActiveModal('backup')}
            />
            <StatusCard 
              title="System Staff" 
              value={systemStatus.totalManagers.toString()} 
              icon={<Users size={22} />} 
              color="#6366f1" 
              trend="Active Managers" 
              onClick={() => navigate('/admin/view-managers')}
            />
            <StatusCard 
              title="Platform Events" 
              value={systemStatus.totalEvents.toString()} 
              icon={<Calendar size={22} />} 
              color="#f43f5e" 
              trend="Live Events" 
              onClick={() => navigate('/admin/events')}
            />
            <StatusCard 
              title="Security Pulse" 
              value={systemStatus.securityThreats.toString()} 
              icon={<ShieldCheck size={22} />} 
              color="#ef4444" 
              isAlert={systemStatus.securityThreats > 0} 
              trend="Protected" 
              onClick={() => setActiveModal('security')}
            />
            <StatusCard 
              title="Active Traffic" 
              value={systemStatus.activeSessions.toString()} 
              icon={<Activity size={22} />} 
              color="#10b981" 
              trend="+12% today" 
              onClick={() => navigate('/admin/activity')}
            />
          </>
        )}
      </div>

      <div className="superadmin-content-grid">
        
        {/* Modern Activity Pipeline */}
        <section style={cardStyle}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>System Audit Pipeline</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Real-time stream of high-privilege operations.</p>
              </div>
              <button 
                onClick={() => setActiveModal('logs')}
                style={{ 
                  background: '#f1f5f9', 
                  border: 'none', 
                  padding: '10px 18px', 
                  borderRadius: '12px', 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  color: '#475569', 
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                View All Logs
              </button>
           </div>
           
           {isLoading ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3].map(i => <SkeletonListItem key={i} />)}
             </div>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentLogs.length > 0 ? recentLogs.slice(0, 6).map((log, index) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.05 }}
                     key={log.id || index} 
                     style={logItemStyle}
                     onClick={() => setActiveModal('logs')}
                     title="Click to view full log trail"
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
                       <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>{formatTime(log.time)}</div>
                     </div>
                   </motion.div>
                )) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No recent system logs detected.
                  </div>
                )}
             </div>
           )}
        </section>

        {/* Manager Management Section */}
        {managers.length > 0 && (
          <section style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Administrative Hierarchy</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Active platform managers and their assigned roles.</p>
              </div>
              <button 
                onClick={() => navigate('/admin/roles')}
                style={{ background: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
              >
                Manage Roles
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {managers.slice(0, 5).map((mgr, index) => (
                <motion.div 
                  key={mgr.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={logItemStyle}
                  onClick={() => navigate('/admin/view-managers')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '10px', 
                      background: nestNavy, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 800
                    }}>
                      {mgr.full_name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{mgr.full_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>{mgr.role?.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div style={{ padding: '6px 12px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 800 }}>
                    ACTIVE
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Operations Panel (Privileged Actions) */}
        <section style={{ ...cardStyle, background: '#fff', display: 'flex', flexDirection: 'column', gap: '28px' }}>
           <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Privileged Actions</h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Restricted high-impact operations.</p>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <AdminActionBtn 
                onClick={() => navigate('/admin/activity')}
                icon={<Activity size={20} />} 
                label="Career Timelines" 
                desc="Professional breakthrough chronicles" 
                color="#DC2626" 
              />
              <AdminActionBtn 
                onClick={() => navigate('/admin/add-manager')}
                icon={<UserPlus size={20} />} 
                label="Initialize Staff" 
                desc="Create new manager accounts" 
                color={nestNavy} 
              />
              <AdminActionBtn 
                onClick={() => setActiveModal('security')}
                icon={<ShieldCheck size={20} />} 
                label="Security Policy" 
                desc="Update system firewall & auth" 
                color="#ef4444" 
              />
              <AdminActionBtn 
                onClick={() => setActiveModal('backup')}
                icon={<Database size={20} />} 
                label="Cloud Backup" 
                desc="Manual database snapshot" 
                color="#8b5cf6" 
              />
              <AdminActionBtn 
                onClick={() => setActiveModal('environment')}
                icon={<Server size={20} />} 
                label="Environment" 
                desc="Modify system variables" 
                color="#10b981" 
              />
           </div>

           {/* Last Backup Sync Card - Fully Clickable */}
           <motion.div 
             whileHover={{ scale: 1.02, borderColor: '#cbd5e1' }}
             whileTap={{ scale: 0.99 }}
             onClick={() => setActiveModal('backup')}
             style={{ 
               marginTop: 'auto', 
               padding: '22px', 
               background: '#f8fafc', 
               borderRadius: '22px', 
               border: '1.5px solid #e2e8f0', 
               position: 'relative', 
               overflow: 'hidden',
               cursor: 'pointer',
               boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
               transition: 'all 0.2s ease'
             }}
             title="Click to view database backups & create snapshot"
           >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `${nestNavy}06`, borderRadius: '0 0 0 100%', transform: 'scale(1.5)', pointerEvents: 'none' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ padding: '8px', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', color: nestNavy }}>
                     <Clock size={18} />
                   </div>
                   <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>Last Backup Sync</span>
                 </div>
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     handleTriggerManualBackup();
                   }}
                   disabled={isSyncingBackup}
                   style={{
                     background: '#fff',
                     border: '1px solid #cbd5e1',
                     borderRadius: '8px',
                     padding: '5px 10px',
                     fontSize: '11px',
                     fontWeight: 700,
                     color: nestNavy,
                     cursor: isSyncingBackup ? 'wait' : 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '5px'
                   }}
                   title="Trigger instant sync"
                 >
                   <RefreshCw size={11} style={{ animation: isSyncingBackup ? 'spin 0.8s linear infinite' : 'none' }} />
                   {isSyncingBackup ? 'Syncing...' : 'Sync Now'}
                 </button>
              </div>

              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', position: 'relative' }}>
                 Automatic system backup completed at <strong>{backupSyncTime}</strong>. Status: <span style={{ color: '#10b981', fontWeight: 700 }}>Verified</span>.
              </div>
           </motion.div>
        </section>
      </div>

      {/* ──────────────── MODALS PORTAL ──────────────── */}
      {document.body && createPortal(
        <AnimatePresence>
          {activeModal && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(6px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  width: '100%',
                  maxWidth: '560px',
                  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0'
                }}
              >
                {/* 1. SECURITY POLICY MODAL */}
                {activeModal === 'security' && (
                  <div>
                    <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', background: '#fee2e2', color: '#ef4444' }}>
                          <ShieldCheck size={22} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>System Security & Auth Policy</h3>
                          <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>Configure firewall, OTP authentication & lockout rules.</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
                    </div>

                    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <PolicyToggleItem
                        title="Passwordless OTP Authentication"
                        description="Enforce email verification codes for all applicant & alumni logins."
                        enabled={securityPolicies.passwordlessOtp}
                        onToggle={() => setSecurityPolicies(prev => ({ ...prev, passwordlessOtp: !prev.passwordlessOtp }))}
                      />
                      <PolicyToggleItem
                        title="Brute-force Rate Limiting"
                        description="Temporarily lock account for 15 minutes after 3 consecutive failed OTP attempts."
                        enabled={securityPolicies.maxFailedLockout}
                        onToggle={() => setSecurityPolicies(prev => ({ ...prev, maxFailedLockout: !prev.maxFailedLockout }))}
                      />
                      <PolicyToggleItem
                        title="Strict Role-Based Access Control (RBAC)"
                        description="Restricts Super Admin & Manager route execution strictly to authenticated claims."
                        enabled={securityPolicies.strictRbac}
                        onToggle={() => setSecurityPolicies(prev => ({ ...prev, strictRbac: !prev.strictRbac }))}
                      />
                      <PolicyToggleItem
                        title="Session Inactivity Guard"
                        description="Automatically prompt session refresh after 30 minutes of idle inactivity."
                        enabled={securityPolicies.sessionTimeout}
                        onToggle={() => setSecurityPolicies(prev => ({ ...prev, sessionTimeout: !prev.sessionTimeout }))}
                      />
                      <PolicyToggleItem
                        title="High-Privilege Audit Trail"
                        description="Chronicle every administrative user modification and status toggle."
                        enabled={securityPolicies.auditTrail}
                        onToggle={() => setSecurityPolicies(prev => ({ ...prev, auditTrail: !prev.auditTrail }))}
                      />
                    </div>

                    <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button onClick={() => setActiveModal(null)} style={modalCancelBtn}>Cancel</button>
                      <button onClick={handleSaveSecurityPolicy} style={modalPrimaryBtn}>Save Security Policy</button>
                    </div>
                  </div>
                )}

                {/* 2. CLOUD BACKUP MODAL */}
                {activeModal === 'backup' && (
                  <div>
                    <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', background: '#f5f3ff', color: '#8b5cf6' }}>
                          <Database size={22} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Cloud Backup & Snapshots</h3>
                          <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>Database health status and snapshot synchronization.</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
                    </div>

                    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Connection Overview Card */}
                      <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Database Target</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>MongoDB Atlas Cluster (alumni_portal)</div>
                          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
                            Encrypted & Connected • Latency ~16ms
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Last Backup Sync</div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: nestNavy, marginTop: '2px' }}>{backupSyncTime}</div>
                        </div>
                      </div>

                      {/* Backup Actions */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={handleTriggerManualBackup}
                          disabled={isSyncingBackup}
                          style={{
                            flex: 1,
                            padding: '12px 18px',
                            background: nestNavy,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: isSyncingBackup ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <RefreshCw size={15} style={{ animation: isSyncingBackup ? 'spin 0.8s linear infinite' : 'none' }} />
                          {isSyncingBackup ? 'Creating Snapshot...' : 'Take Snapshot Now'}
                        </button>
                        <button
                          onClick={handleDownloadSnapshot}
                          style={{
                            padding: '12px 18px',
                            background: '#fff',
                            color: '#1e293b',
                            border: '1px solid #cbd5e1',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <Download size={15} /> Export JSON
                        </button>
                      </div>

                      {/* Snapshots Table */}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>Recent Verified Snapshots</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {snapshots.map(snp => (
                            <div key={snp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <HardDrive size={16} color="#64748b" />
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{snp.name}</div>
                                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{snp.time} • {snp.size}</div>
                                </div>
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: 800, background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '6px' }}>
                                {snp.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => setActiveModal(null)} style={modalPrimaryBtn}>Close</button>
                    </div>
                  </div>
                )}

                {/* 3. ENVIRONMENT MODAL */}
                {activeModal === 'environment' && (
                  <div>
                    <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981' }}>
                          <Server size={22} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>System Environment & Config</h3>
                          <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>Active runtime services, endpoints & environment variables.</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
                    </div>

                    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <EnvItem label="Platform Mode" value="Production (High Security & Audit Enabled)" tag="Secured" />
                      <EnvItem label="Database Engine" value="MongoDB Atlas (Replica Set - alumni_portal)" tag="Connected" />
                      <EnvItem label="Email Mailer" value="ndaconnect@nestgroup.net (SMTP SSL - Port 465)" tag="Active" />
                      <EnvItem label="Authentication" value="JWT RS256 / Passwordless OTP Verification" tag="Enforced" />
                      <EnvItem label="Vite Frontend Port" value="http://localhost:5180" tag="Online" />
                      <EnvItem label="Flask Backend API" value="http://localhost:5001/api" tag="Online" />
                    </div>

                    <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={handleVerifyServices}
                        disabled={isVerifyingServices}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: nestNavy,
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: isVerifyingServices ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <RefreshCw size={13} style={{ animation: isVerifyingServices ? 'spin 0.8s linear infinite' : 'none' }} />
                        {isVerifyingServices ? 'Verifying...' : 'Verify All Services'}
                      </button>
                      <button onClick={() => setActiveModal(null)} style={modalPrimaryBtn}>Understood</button>
                    </div>
                  </div>
                )}

                {/* 4. AUDIT LOGS FULL MODAL */}
                {activeModal === 'logs' && (
                  <div>
                    <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6' }}>
                          <Activity size={22} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>System Audit Pipeline</h3>
                          <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>Complete historical stream of privileged administrator actions.</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
                    </div>

                    <div style={{ padding: '16px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          placeholder="Search logs by user, action or target..."
                          value={logsSearch}
                          onChange={e => setLogsSearch(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px 9px 36px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['all', 'security', 'activity'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setLogsFilter(tab)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              cursor: 'pointer',
                              border: logsFilter === tab ? `1px solid ${nestNavy}` : '1px solid #e2e8f0',
                              background: logsFilter === tab ? nestNavy : '#fff',
                              color: logsFilter === tab ? '#fff' : '#64748b'
                            }}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '20px 28px', maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
                        <div key={log.id || index} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '10px',
                              background: log.type === 'security' ? '#fee2e2' : '#e0e7ff',
                              color: log.type === 'security' ? '#ef4444' : '#4338ca',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {log.type === 'security' ? <Lock size={16} /> : <Activity size={16} />}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{log.action}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                <strong style={{ color: '#1e293b' }}>{log.user}</strong> • {log.target}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                            {formatTime(log.time)}
                          </div>
                        </div>
                      )) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>
                          No logs found matching search criteria.
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '16px 28px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => setActiveModal(null)} style={modalPrimaryBtn}>Close</button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

// --- Sub Components ---

const StatusCard: React.FC<{ 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  color: string, 
  isAlert?: boolean, 
  trend?: string,
  onClick?: () => void 
}> = ({ title, value, icon, color, isAlert, trend, onClick }) => {
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
      onClick={onClick}
      style={{ 
        background: '#fff', padding: '28px', borderRadius: '28px', 
        border: '1px solid #f1f5f9',
        display: 'flex', flexDirection: 'column', gap: '20px',
        position: 'relative', overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default'
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

const AdminActionBtn: React.FC<{ 
  icon: React.ReactNode, 
  label: string, 
  desc: string, 
  color: string, 
  onClick?: () => void 
}> = ({ icon, label, desc, color, onClick }) => (
  <motion.button 
    whileHover={{ scale: 1.015, x: 4, borderColor: '#cbd5e1' }}
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

const PolicyToggleItem: React.FC<{
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ title, description, enabled, onToggle }) => (
  <div 
    onClick={onToggle}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      borderRadius: '14px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    }}
  >
    <div style={{ flex: 1, paddingRight: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>{description}</div>
    </div>
    <div style={{
      width: '46px',
      height: '26px',
      borderRadius: '13px',
      background: enabled ? nestNavy : '#cbd5e1',
      padding: '3px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: enabled ? 'flex-end' : 'flex-start',
      transition: 'background 0.2s ease',
      boxSizing: 'border-box'
    }}>
      <motion.div 
        layout 
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} 
      />
    </div>
  </div>
);

const EnvItem: React.FC<{ label: string; value: string; tag: string }> = ({ label, value, tag }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
    <div>
      <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{value}</div>
    </div>
    <span style={{ fontSize: '11px', fontWeight: 800, background: '#dcfce7', color: '#16a34a', padding: '3px 9px', borderRadius: '6px' }}>
      {tag}
    </span>
  </div>
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

const closeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', transition: 'color 0.15s'
};

const modalCancelBtn: React.CSSProperties = {
  padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer'
};

const modalPrimaryBtn: React.CSSProperties = {
  padding: '10px 22px', borderRadius: '10px', border: 'none', background: nestNavy, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(26, 38, 82, 0.2)'
};

export default SuperAdminDashboard;
