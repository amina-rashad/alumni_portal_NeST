import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Check, Trash2, 
  MessageSquare, UserPlus, Heart, 
  Briefcase, Calendar, Shield,
  Loader2
} from 'lucide-react';
import { notificationsApi } from '../services/api';

const getNotifConfig = (type: string) => {
  switch (type) {
    case 'mention':
    case 'social':
      return { icon: <MessageSquare size={18} color="#2563EB" />, color: '#2563EB' };
    case 'connection':
      return { icon: <UserPlus size={18} color="#10B981" />, color: '#10B981' };
    case 'job':
      return { icon: <Briefcase size={18} color="#8B5CF6" />, color: '#8B5CF6' };
    case 'event':
      return { icon: <Calendar size={18} color="#F59E0B" />, color: '#F59E0B' };
    case 'system':
    default:
      return { icon: <Shield size={18} color="#0F172A" />, color: '#0F172A' };
  }
};

const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (seconds < 30) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return date.toLocaleDateString();
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsApi.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const markAllAsRead = async () => {
    try {
        const response = await notificationsApi.markAllAsRead();
        if (response.success) {
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        }
    } catch (err) {
        console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
        const response = await notificationsApi.deleteNotification(id);
        if (response.success) {
            setNotifications(notifications.filter(n => n.id !== id));
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
        const response = await notificationsApi.markAsRead(id);
        if (response.success) {
            setNotifications(notifications.map(n => 
              n.id === id ? { ...n, is_read: true } : n
            ));
        }
    } catch (err) {
        console.error(err);
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    try {
        const response = await notificationsApi.deleteAllNotifications(); 
        if (response.success) {
            setNotifications([]);
        }
    } catch (err) {
        console.error(err);
    }
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
          flex-shrink: 0;
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
              onClick={clearAllNotifications}
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
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
              <Loader2 className="animate-spin" size={40} color="#0F172A" />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif, i) => {
                  const config = getNotifConfig(notif.type);
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className={`notification-card ${!notif.is_read ? 'unread' : ''}`}
                    >
                      <div style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '12px', 
                          background: `${config.color}10`, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {config.icon}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', flex: 1, marginRight: '1rem' }}>{notif.title}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              {!notif.is_read && <div className="unread-dot" />}
                              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>{formatTime(notif.created_at)}</span>
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748B', lineHeight: 1.5, maxWidth: '90%' }}>
                            {notif.message}
                          </p>
                          
                          <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                             {!notif.is_read && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                                 style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', fontWeight: 700, padding: 0, cursor: 'pointer' }}
                               >
                                 Mark as read
                               </button>
                             )}
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
          )}
        </div>
      </div>
      
      <div style={{ paddingBottom: '5rem' }} />
    </div>
  );
};

export default Notifications;

