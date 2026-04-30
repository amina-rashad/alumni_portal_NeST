import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Send, 
  Clock, 
  Users, 
  MoreVertical,
  Info,
  UserX,
  GraduationCap,
  Loader2,
  AlertCircle,
  Mail,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { reminderService } from '../../services/reminderService';
import type { AcademicAlert } from '../../types/course-manager';

/* ── Grid column definition (STRICT GRID) ── */
const GRID = '2fr 1.5fr 2.5fr 1fr 1.2fr';

const ReminderCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<AcademicAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await reminderService.getAlerts();
      setAlerts(data);
    } catch (err) {
      toast.error('Failed to load academic reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async (alert: AcademicAlert) => {
    setSendingId(alert.id);
    const loadingToast = toast.loading(`Sending reminder to ${alert.studentName}...`);
    try {
      await reminderService.sendReminder(alert.id);
      setAlerts(prev => prev.map(a => 
        a.id === alert.id ? { ...a, status: 'Sent' } : a
      ));
      toast.success(`Reminder dispatched to ${alert.studentEmail}`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to send reminder', { id: loadingToast });
    } finally {
      setSendingId(null);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || a.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getInitials = (name: string) =>
    (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const severityStyle = (severity: string): React.CSSProperties => {
    switch (severity) {
      case 'High':   return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' };
      case 'Medium': return { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' };
      case 'Low':    return { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' };
      default:       return { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Low Attendance': return <Users size={14} />;
      case 'Upcoming Assessment': return <GraduationCap size={14} />;
      case 'Inactive Student': return <UserX size={14} />;
      default: return <Info size={14} />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'Low Attendance': return 'text-red-500 bg-red-50';
      case 'Upcoming Assessment': return 'text-blue-500 bg-blue-50';
      case 'Inactive Student': return 'text-orange-500 bg-orange-50';
      default: return 'text-indigo-500 bg-indigo-50';
    }
  };

  const summaryCards = [
    { label: "Attendance Alerts", value: "12", icon: Users, color: "#ef4444", bg: "#fef2f2", desc: "Students currently below the 75% mandatory threshold." },
    { label: "Upcoming Exams", value: "24", icon: GraduationCap, color: "#3b82f6", bg: "#eff6ff", desc: "Assessments due in the next 48 hours requiring prep." },
    { label: "Inactive Users", value: "8", icon: UserX, color: "#f97316", bg: "#fff7ed", desc: "Students who haven't logged in for over 7 consecutive days." },
    { label: "Course Lags", value: "15", icon: Info, color: "#6366f1", bg: "#eef2ff", desc: "Enrolled students lagging behind their assigned schedule." },
  ];

  return (
    <div className="cm-animate-fade-up" style={{ maxWidth: "1350px", margin: "0 auto", padding: "0 32px 48px 32px", display: "flex", flexDirection: "column", gap: "32px", fontFamily: "\"Inter\", sans-serif" }}>
      
      {/* ── Top Section ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.03em' }}>
            Reminder Center
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
            Monitor academic triggers and automate student outreach.
          </p>
        </div>

        {/* Stats card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: '#ffffff', borderRadius: '16px', padding: '14px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
          flexShrink: 0,
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bell size={18} style={{ color: '#c8102e' }} />
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Total Alerts
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', marginTop: '2px' }}>
              {alerts.length}
            </div>
          </div>
        </div>
      </div>

      {/* ── Alert Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {summaryCards.map((card, i) => (
          <div 
            key={i}
            style={{
              background: '#ffffff', borderRadius: '20px', padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
              display: 'flex', flexDirection: 'column', gap: '14px',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => { (e.currentTarget.style.transform = 'translateY(-4px)'); (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'); }}
            onMouseLeave={e => { (e.currentTarget.style.transform = 'translateY(0)'); (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)'); }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', marginTop: '4px' }}>{card.value}</div>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, lineHeight: '1.5', marginTop: '8px', margin: '0' }}>{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter Section (Matched to Reference Image) ── */}
      <div style={{
        background: '#ffffff', 
        borderRadius: '28px', 
        padding: '20px 24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
        border: '1px solid #f1f5f9',
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px',
      }}>
        {/* Search Section */}
        <div style={{ 
          flex: '1 1 45%', 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center',
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '4px 12px',
        }}>
          <Search size={18} style={{ color: '#94a3b8', marginLeft: '8px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search students, alerts or specific courses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', 
              height: '44px', 
              border: 'none', 
              paddingLeft: '12px', 
              paddingRight: '12px',
              fontSize: '14px', 
              fontWeight: 500,
              color: '#1e293b', 
              fontFamily: 'inherit',
              background: 'transparent', 
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#f8fafc', 
          padding: '6px', 
          borderRadius: '18px',
          gap: '4px'
        }}>
          {['All', 'Low Attendance', 'Upcoming Assessment', 'Inactive Student', 'Pending Completion'].map(type => {
            const isActive = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '10px 20px', 
                  borderRadius: '14px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  fontWeight: 800,
                  fontFamily: 'inherit', 
                  transition: 'all 0.2s', 
                  whiteSpace: 'nowrap',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#1e2d5e' : '#94a3b8',
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table Section ── */}
      <div style={{
        background: '#ffffff', borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: GRID,
          background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
          padding: '0 8px',
        }}>
          {['Student Info', 'Alert Category', 'Incident Details', 'Severity', 'Action'].map((col, i) => (
            <div key={col} style={{
              padding: '14px 16px',
              fontSize: '10px', fontWeight: 800, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              textAlign: i === 4 ? 'center' : 'left',
            }}>
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ position: 'relative', minHeight: '300px' }}>
          {isLoading ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <Loader2 size={28} style={{ color: '#c8102e', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Loading alerts...</span>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
              No academic alerts detected.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredAlerts.map((alert, idx) => {
                const isSent = alert.status === 'Sent';
                const isSending = sendingId === alert.id;

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'grid', gridTemplateColumns: GRID,
                      borderBottom: idx < filteredAlerts.length - 1 ? '1px solid #f8fafc' : 'none',
                      padding: '0 8px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Student Info */}
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: '#1a2652', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '12px', color: '#fff',
                        flexShrink: 0, marginRight: '14px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }}>
                        {getInitials(alert.studentName)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {alert.studentName}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {alert.studentEmail}
                        </div>
                      </div>
                    </div>

                    {/* Alert Category */}
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center' }}>
                      <div className={`p-1.5 rounded-lg mr-3 ${getAlertColor(alert.type)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <span style={{ fontSize: '12px', color: '#334155', fontWeight: 700 }}>
                        {alert.type}
                      </span>
                    </div>

                    {/* Incident Details */}
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {alert.details}
                      </span>
                    </div>

                    {/* Severity */}
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        ...severityStyle(alert.severity),
                        padding: '4px 12px', borderRadius: '999px',
                        fontSize: '9px', fontWeight: 900,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}>
                        {alert.severity}
                      </span>
                    </div>

                    {/* Action */}
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <button
                        onClick={() => handleSendReminder(alert)}
                        disabled={isSending || isSent}
                        style={{
                          height: '38px', padding: '0 18px', borderRadius: '10px', border: 'none',
                          fontSize: '11px', fontWeight: 800, 
                          background: isSent ? '#f1f5f9' : '#c8102e',
                          color: isSent ? '#94a3b8' : '#fff',
                          cursor: (isSending || isSent) ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          transition: 'all 0.2s',
                          boxShadow: isSent ? 'none' : '0 4px 12px rgba(200, 16, 46, 0.15)',
                        }}
                        onMouseEnter={e => { if(!isSent && !isSending) (e.currentTarget.style.background = '#b00e28'); }}
                        onMouseLeave={e => { if(!isSent && !isSending) (e.currentTarget.style.background = '#c8102e'); }}
                      >
                        {isSending ? (
                          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : isSent ? (
                          <>Sent</>
                        ) : (
                          <>Send Reminder <Send size={12} /></>
                        )}
                      </button>
                      <button
                        style={{
                          width: '38px', height: '38px', borderRadius: '10px', border: '1.5px solid #f1f5f9',
                          background: 'none', color: '#94a3b8', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { (e.currentTarget.style.background = '#f8fafc'); (e.currentTarget.style.color = '#334155'); }}
                        onMouseLeave={e => { (e.currentTarget.style.background = 'none'); (e.currentTarget.style.color = '#94a3b8'); }}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; borderRadius: 10px; }
      `}</style>
    </div>
  );
};

export default ReminderCenter;
