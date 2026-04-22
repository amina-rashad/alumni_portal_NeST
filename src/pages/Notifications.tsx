import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Check, Trash2, ArrowLeft, 
  MessageSquare, UserPlus, Heart, 
  Briefcase, Calendar, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../services/api';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      const data = res.data as any;
      if (res.success && data?.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const markAllAsRead = async () => {
    try {
      const res = await notificationsApi.markAllAsRead();
      if (res.success) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await notificationsApi.deleteNotification(id);
      if (res.success) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRead = async (id: string, currentRead: boolean) => {
    // Only support marking as read via API for now, or toggle locally if needed
    if (!currentRead) {
      try {
        const res = await notificationsApi.markAsRead(id);
        if (res.success) {
          setNotifications(notifications.map(n => 
            n.id === id ? { ...n, is_read: true } : n
          ));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'mention': return { icon: <MessageSquare size={18} color="#2563EB" />, color: '#2563EB' };
      case 'job': return { icon: <Briefcase size={18} color="#8B5CF6" />, color: '#8B5CF6' };
      case 'event': return { icon: <Calendar size={18} color="#F59E0B" />, color: '#F59E0B' };
      case 'system': return { icon: <Shield size={18} color="#0F172A" />, color: '#0F172A' };
      case 'social': return { icon: <Heart size={18} color="#EF4444" />, color: '#EF4444' };
      default: return { icon: <Bell size={18} color="#64748B" />, color: '#64748B' };
    }
  };

  // Humanize time or use created_at
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="font-sans" style={{ minHeight: '100vh', background: '#F8FAFC', padding: '3rem 1.5rem' }}>
      <style>{`
        .notification-card {
          background: white;
          border-radius: 16px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .notification-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
          border-color: #E2E8F0;
        }
        .notification-card.unread {
          background: #F8FAFF;
          border-left: 4px solid #2563EB;
        }
        .filter-btn {
          padding: 0.6rem 1.25rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
          border: 1px solid #E2E8F0;
          background: white;
          color: #64748B;
        }
        .filter-btn.active {
          background: #0F172A;
          color: white;
          border-color: #0F172A;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
        }
        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563EB;
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
        }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }} className="link-hover">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Notifications
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', gap: '12px' }}
          >
            <button 
              onClick={markAllAsRead}
              className="filter-btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={16} /> Mark all read
            </button>
            <button 
              onClick={() => setNotifications([])}
              className="filter-btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Trash2 size={16} /> Clear all
            </button>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: '10px', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '10px' }}
        >
          {[
            { id: 'all', label: 'All', icon: <Bell size={14} /> },
            { id: 'mention', label: 'Mentions', icon: <MessageSquare size={14} /> },
            { id: 'job', label: 'Jobs', icon: <Briefcase size={14} /> },
            { id: 'event', label: 'Events', icon: <Calendar size={14} /> },
            { id: 'system', label: 'System', icon: <Shield size={14} /> }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`filter-btn ${filter === f.id ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </motion.div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence mode="popLayout">
            {loading ? (
               <div style={{ textAlign: 'center', padding: '5rem 0' }}>Loading...</div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif, i) => {
                const brand = getIcon(notif.type);
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`notification-card ${!notif.is_read ? 'unread' : ''}`}
                    onClick={() => toggleRead(notif.id, notif.is_read)}
                  >
                    {!notif.is_read && <div className="unread-dot" />}
                    <div style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px', 
                        background: `${brand.color}10`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {brand.icon}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>{notif.title}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>{formatTime(notif.created_at)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748B', lineHeight: 1.5, maxWidth: '90%' }}>
                          {notif.message}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                           <button 
                             onClick={(e) => { e.stopPropagation(); toggleRead(notif.id, notif.is_read); }}
                             style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', fontWeight: 700, padding: 0, cursor: 'pointer' }}
                           >
                             {!notif.is_read ? 'Mark as read' : ''}
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                             style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.8rem', fontWeight: 700, padding: 0, cursor: 'pointer' }}
                           >
                             Delete
                           </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '5rem 0', color: '#94A3B8' }}
              >
                <Bell size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No notifications found in this category.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div style={{ paddingBottom: '5rem' }} />
    </div>
  );
};

export default Notifications;

