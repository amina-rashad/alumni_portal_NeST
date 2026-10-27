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
import { getUser, authApi, notificationsApi, usersApi, type AuthUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../../components/UserAvatar';
import AdminSidebar from '../../components/AdminSidebar';
import { formatTimeAgo } from '../../utils/dateUtils';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

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
    // Synchronize latest role and profile data from server
    usersApi.getProfile().then((res) => {
      if (res.success && res.data) {
        const u = (res.data as any).user || (res.data as any).profile || res.data;
        if (u) {
          const merged = { ...(currentUser || {}), ...u };
          setAdminUser(merged);
          try {
            localStorage.setItem('user', JSON.stringify(merged));
          } catch (e) {
            // ignore
          }
        }
      }
    }).catch(() => {});
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

  const formatTime = (iso: string) => formatTimeAgo(iso, 'Just now');

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'System Admin';
      case 'job_recruiter': return 'Recruiter';
      case 'event_manager': return 'Event Manager';
      case 'course_manager': return 'Course Manager';
      default: return 'Administrator';
    }
  };

  const allMenuItems = [
    { name: 'Platform Insights', path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Super Admin', path: '/admin/super-dashboard', icon: <Shield size={20} />, roles: ['super_admin'] },
    { name: 'User Management', path: '/admin/users', icon: <Users size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Active Managers', path: '/admin/view-managers', icon: <Users size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Intern Management', path: '/admin/interns', icon: <GraduationCap size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'IV Students', path: '/admin/iv-students', icon: <School size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Certification', path: '/admin/certification', icon: <Award size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Broadcast Post', path: '/admin/posts', icon: <Megaphone size={20} />, roles: ['super_admin', 'admin'] },
    { name: 'Job Management', path: '/recruiter/overview', icon: <Briefcase size={20} />, roles: ['super_admin', 'admin', 'job_recruiter'] },
    { name: 'Event Management', path: '/event-manager/dashboard', icon: <Calendar size={20} />, roles: ['super_admin', 'admin', 'event_manager'] },
    { name: 'Course Management', path: '/course-manager/dashboard', icon: <BookOpen size={20} />, roles: ['super_admin', 'admin', 'course_manager'] },
  ];

  const menuItems = allMenuItems.filter(item =>
    item.roles.includes(adminUser?.role || '')
  );

  /* EXACT NeST LOGO NAVY BLUE: #1A2652 (Approx based on visual matching) */
  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 13, 30, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
      )}

      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userRole={adminUser?.role}
        currentPath={location.pathname}
        onLogout={handleLogout}
        isMobile={isMobile}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <header className="admin-header" style={{ height: '72px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 90, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              className="admin-mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: 'none',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                padding: '8px',
                cursor: 'pointer',
                color: '#1e293b',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>
            <h2 className="admin-header-title" style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#1e293b',
              margin: 0,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              NeST Admin Portal
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
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
                    position: 'absolute', top: 'calc(100% + 10px)', right: '-20px', width: 'min(380px, calc(100vw - 32px))',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px', borderRadius: '12px' }}>
              <UserAvatar
                src={adminUser?.profile_picture}
                name={adminUser?.full_name}
                status={(adminUser as any)?.status}
                size={38}
                bgColor={nestNavy}
              />
              <div className="admin-user-info" style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>{adminUser ? adminUser.full_name : 'Admin'}</span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>{getRoleLabel(adminUser?.role)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-main" style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#f8fafc', minWidth: 0 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .admin-mobile-toggle { display: flex !important; }
          .admin-header { padding: 0 16px !important; height: 60px !important; }
          .admin-main { padding: 16px !important; }
          .admin-header-title { font-size: 17px !important; }
        }
        @media (max-width: 640px) {
          .admin-user-info { display: none !important; }
          .admin-main { padding: 12px 10px !important; }
          .admin-header { padding: 0 12px !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
