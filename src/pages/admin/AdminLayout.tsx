/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, School, Briefcase,
  FileText, BarChart3, Settings, LogOut, Bell, Menu, X, ChevronDown, BookOpen, Calendar, Award, Shield, UserPlus,
  Activity, Check, Trash2, Clock, Megaphone
} from 'lucide-react';
import nestMainLogo from '../../assets/nest_logo.png';
import { getUser, authApi, notificationsApi, type AuthUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../../components/UserAvatar';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) {
      setAdminUser(currentUser);
      fetchNotifications();
    }
  }, [location.pathname]);

  useEffect(() => {
    // Poll notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationsApi.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return 'Just now';
    const date = new Date(iso);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y ago`;
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'System Admin';
      case 'job_recruiter': return 'Job Recruiter';
      case 'event_manager': return 'Event Manager';
      case 'course_manager': return 'Course Manager';
      default: return 'Administrator';
    }
  };

  const allMenuItems = [
    { name: 'Platform Insights', path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Super Admin', path: '/admin/super-dashboard', icon: <Shield size={20} />, roles: ['super_admin'] },
    { name: 'User Management', path: '/admin/users', icon: <Users size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Add New Manager', path: '/admin/add-manager', icon: <UserPlus size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Active Managers', path: '/admin/view-managers', icon: <Users size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Intern Management', path: '/admin/interns', icon: <GraduationCap size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'IV Students', path: '/admin/iv-students', icon: <School size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Certification', path: '/admin/certification', icon: <Award size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Job Management', path: '/recruiter/dashboard', icon: <Briefcase size={20} />, roles: ['super_admin', 'admin', 'job_recruiter'] },
    { name: 'Applications', path: '/recruiter/applications', icon: <FileText size={20} />, roles: ['super_admin', 'admin', 'job_recruiter'] },
    { name: 'Career Timelines', path: '/admin/activity', icon: <Activity size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Broadcast Post', path: '/admin/posts', icon: <Megaphone size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Event Management', path: '/event-manager/dashboard', icon: <Calendar size={20} />, roles: ['super_admin', 'admin', 'event_manager'] },
    { name: 'Course Management', path: '/course-manager/dashboard', icon: <BookOpen size={20} />, roles: ['super_admin', 'admin', 'course_manager'] },
    { name: 'System Roles', path: '/admin/roles', icon: <Shield size={20} />, roles: ['super_admin'] },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} />, roles: ['super_admin', 'admin'] },
  ];

  const menuItems = allMenuItems.filter(item =>
    item.roles.includes(adminUser?.role || '')
  );

  /* EXACT NeST LOGO NAVY BLUE: #1A2652 (Approx based on visual matching) */
  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar - MATCHING LOGO NAVY */}
      <motion.div
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          background: nestNavy, /* EXACT LOGO NAVY MATCH */
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          color: '#e2e8f0',
          boxShadow: '4px 0 10px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          {sidebarOpen ? (
            <>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                flex: 1
              }}>
                <img src={nestMainLogo} alt="NeST DIGITAL" style={{ height: '28px' }} />
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '12px',
                  display: 'flex',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className="sidebar-toggle-btn"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                color: '#fff',
                padding: '12px',
                borderRadius: '14px',
                display: 'flex',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="sidebar-toggle-btn-closed"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }} className="admin-sidebar-scroll">
          {menuItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
          <Link
            key={index}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: sidebarOpen ? '12px 24px' : '12px 0',
              textDecoration: 'none',
              color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
              background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              margin: sidebarOpen ? '2px 12px' : '2px 8px',
              borderRadius: '12px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              position: 'relative'
            }}
          >
            <span style={{
              marginRight: sidebarOpen ? '16px' : '0',
              color: isActive ? '#fff' : 'inherit',
              display: 'flex',
              transition: 'all 0.3s'
            }}>{item.icon}</span>
            {sidebarOpen && (
              <>
                <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 400, flex: 1, letterSpacing: '0.01em' }}>{item.name}</span>
                {isActive && (
                  <motion.div layoutId="activeInd" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
                )}
              </>
            )}
          </Link>
        )
      })}
    </div>

    <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'rgba(255, 255, 255, 0.65)',
          background: 'none',
          border: 'none',
          padding: '10px 0',
          cursor: 'pointer',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          width: '100%',
          gap: '16px'
        }}
      >
        <LogOut size={20} />
        {sidebarOpen && <span style={{ fontSize: '14px', fontWeight: 500 }}>Logout</span>}
      </button>
    </div>
  </motion.div>

  {/* Main Content Area */}
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    {/* Header */}
    <header style={{ height: '72px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 90 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#1e293b',
          margin: 0,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '-0.01em'
        }}>
          NeST Admin Portal
        </h2>
      </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }}>
              <div 
                style={{ position: 'relative', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '10px', transition: 'background 0.2s', background: isNotificationsOpen ? '#f1f5f9' : 'transparent' }} 
                className="hover-highlight"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell size={22} color="#64748b" />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '6px', right: '8px', background: '#ef4444', height: '10px', width: '10px', borderRadius: '50%', border: '2px solid #fff' }}></span>
                )}
              </div>

              {/* Dropdown Panel */}
              {isNotificationsOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 95 }}
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: '-20px', width: '380px',
                    background: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0', zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    maxHeight: '480px'
                  }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          style={{ background: 'none', border: 'none', color: nestNavy, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                          <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>No notifications yet</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>You're all caught up!</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {notifications.map((notif: any) => (
                            <div 
                              key={notif.id || notif._id} 
                              style={{ 
                                padding: '16px 20px', 
                                borderBottom: '1px solid #f1f5f9',
                                background: notif.is_read ? '#fff' : '#f0f9ff',
                                display: 'flex',
                                gap: '12px',
                                transition: 'background 0.2s',
                                position: 'relative'
                              }}
                            >
                              <div style={{ 
                                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                                background: notif.type === 'job' ? '#eef2ff' : notif.type === 'event' ? '#fff1f2' : notif.type === 'social' ? '#f0fdf4' : '#eff6ff',
                                color: notif.type === 'job' ? '#6366f1' : notif.type === 'event' ? '#f43f5e' : notif.type === 'social' ? '#22c55e' : '#3b82f6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                {notif.type === 'job' ? <Briefcase size={18} /> : notif.type === 'event' ? <Calendar size={18} /> : notif.type === 'social' ? <Users size={18} /> : <Bell size={18} />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{notif.title}</h4>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    {!notif.is_read && (
                                      <button 
                                        onClick={(e) => handleMarkAsRead(e, notif.id || notif._id)}
                                        title="Mark as read"
                                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                      ><Check size={14} /></button>
                                    )}
                                    <button 
                                      onClick={(e) => handleDeleteNotification(e, notif.id || notif._id)}
                                      title="Delete"
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', opacity: 0.5 }}
                                    ><Trash2 size={14} /></button>
                                  </div>
                                </div>
                                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{notif.message}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                                  <Clock size={12} /> {formatTime(notif.created_at)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px', borderRadius: '12px' }}>
              <UserAvatar
                src={adminUser?.profile_picture}
                name={adminUser?.full_name}
                status={(adminUser as any)?.status}
                size={42}
                bgColor={nestNavy}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{adminUser ? adminUser.full_name : 'Administrator'}</span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{getRoleLabel(adminUser?.role)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#f8fafc' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
