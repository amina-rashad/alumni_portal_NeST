import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Check, Trash2, ArrowLeft, 
  MessageSquare, UserPlus, Heart, 
  Briefcase, Calendar, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- MOCK NOTIFICATIONS ---
const mockNotifications = [
  {
    id: 1,
    type: 'mention',
    title: 'New Mention',
    content: 'Dr. Sarah Jenkins mentioned you in a comment on "AI Analytics Platform".',
    time: '5 mins ago',
    isRead: false,
    icon: <MessageSquare size={18} color="#2563EB" />,
    color: '#2563EB'
  },
  {
    id: 2,
    type: 'connection',
    title: 'Connection Request',
    content: 'Michael Chen sent you a connection request. He is a Senior DevOps Engineer at NeST Digital.',
    time: '1h ago',
    isRead: false,
    icon: <UserPlus size={18} color="#10B981" />,
    color: '#10B981'
  },
  {
    id: 3,
    type: 'social',
    title: 'New Like',
    content: 'Priya Sharma and 12 others liked your recent post about Cloud Architecture.',
    time: '3h ago',
    isRead: true,
    icon: <Heart size={18} color="#EF4444" />,
    color: '#EF4444'
  },
  {
    id: 4,
    type: 'job',
    title: 'Job Recommendation',
    content: 'A new Staff Software Engineer position at NeST Digital matches your profile.',
    time: '5h ago',
    isRead: true,
    icon: <Briefcase size={18} color="#8B5CF6" />,
    color: '#8B5CF6'
  },
  {
    id: 5,
    type: 'event',
    title: 'Event Reminder',
    content: 'The "Annual Alumni Tech Summit" is starting tomorrow at 09:00 AM PST.',
    time: '1d ago',
    isRead: true,
    icon: <Calendar size={18} color="#F59E0B" />,
    color: '#F59E0B'
  },
  {
    id: 6,
    type: 'system',
    title: 'Security Alert',
    content: 'Your account was successfully logged in from a new device (Chrome on Windows).',
    time: '2d ago',
    isRead: true,
    icon: <Shield size={18} color="#0F172A" />,
    color: '#0F172A'
  }
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const toggleRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: !n.isRead } : n
    ));
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
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`notification-card ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => toggleRead(notif.id)}
                >
                  {!notif.isRead && <div className="unread-dot" />}
                  <div style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: `${notif.color}10`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {notif.icon}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>{notif.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>{notif.time}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748B', lineHeight: 1.5, maxWidth: '90%' }}>
                        {notif.content}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                         <button 
                           onClick={(e) => { e.stopPropagation(); toggleRead(notif.id); }}
                           style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', fontWeight: 700, padding: 0, cursor: 'pointer' }}
                         >
                           {notif.isRead ? 'Mark as unread' : 'Mark as read'}
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
              ))
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

