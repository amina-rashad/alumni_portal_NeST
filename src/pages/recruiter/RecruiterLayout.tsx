import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, FileText, Settings, LogOut, Bell, Menu, X, ChevronDown, UserCheck, UserPlus, BarChart3, HelpCircle, Send, ArrowLeft, Mail
} from 'lucide-react';
import nestMainLogo from '../../assets/nest_logo.png';
import { getUser, authApi, notificationsApi, type AuthUser } from '../../services/api';
import '../../App.css';

/* ─────────────────────────── types ─────────────────────────── */
interface NavItem { name: string; path: string; icon: React.ReactNode }
interface NavGroup { section: string; icon: React.ReactNode; items: NavItem[] }

/* ─────────────────────────── data ─────────────────────────── */
const recruiterMenuGroups: NavGroup[] = [
  {
    section: 'Overview', icon: <LayoutDashboard size={17} />,
    items: [
      { name: 'Dashboard', path: '/recruiter/dashboard', icon: <LayoutDashboard size={15} /> },
      { name: 'Hiring Insights', path: '/recruiter/reports', icon: <BarChart3 size={15} /> },
    ]
  },
  {
    section: 'Jobs', icon: <Briefcase size={17} />,
    items: [
      { name: 'Post New Job', path: '/recruiter/jobs/post', icon: <UserPlus size={15} /> },
      { name: 'Manage Jobs', path: '/recruiter/jobs', icon: <Briefcase size={15} /> },
    ]
  },
  {
    section: 'Applications', icon: <FileText size={17} />,
    items: [
      { name: 'Review All', path: '/recruiter/applications', icon: <FileText size={15} /> },
    ]
  },
  {
    section: 'Broadcast', icon: <Send size={17} />,
    items: [
      { name: 'Create Post', path: '/recruiter/post', icon: <Send size={15} /> },
      { name: 'Talent Mail', path: '/recruiter/mail', icon: <Mail size={15} /> },
    ]
  },
  {
    section: 'Settings', icon: <Settings size={17} />,
    items: [
      { name: 'Settings', path: '/recruiter/settings', icon: <Settings size={15} /> },
    ]
  },
];

/* ─────────────────────────── Dropdown ─────────────────────────── */
interface DropdownProps {
  group: NavGroup;
  activePath: string;
  onClose: () => void;
  style?: React.CSSProperties;
}

const Dropdown: React.FC<DropdownProps> = ({ group, activePath, onClose, style }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.96 }}
    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
    style={{
      position: 'absolute',
      minWidth: '220px',
      background: '#ffffff',
      borderRadius: '14px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
      border: '1px solid #f1f5f9',
      padding: '6px',
      zIndex: 10001,
      ...style,
    }}
  >
    <div style={{
      padding: '8px 12px 6px',
      fontSize: '10px',
      fontWeight: 800,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
    }}>
      {group.section}
    </div>

    {group.items.map((item, i) => {
      const isActive = activePath.startsWith(item.path);
      return (
        <Link
          key={i}
          to={item.path}
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '10px',
            textDecoration: 'none',
            color: isActive ? '#1a2652' : '#334155',
            background: isActive ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
            fontWeight: isActive ? 700 : 500,
            fontSize: '14px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f8fafc';
          }}
          onMouseLeave={e => {
            if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <span style={{ color: isActive ? '#1a2652' : '#64748b', flexShrink: 0 }}>{item.icon}</span>
          {item.name}
        </Link>
      );
    })}
  </motion.div>
);

/* ─────────────────────────── NavButton ─────────────────────────── */
interface NavButtonProps {
  group: NavGroup;
  activePath: string;
  isOpen: boolean;
  onClick: (rect: DOMRect) => void;
}

const NavButton: React.FC<NavButtonProps> = ({ group, activePath, isOpen, onClick }) => {
  const hasActive = group.items.some(i => activePath.startsWith(i.path));
  const ref = useRef<HTMLButtonElement>(null);
  const nestNavy = '#1a2652';

  return (
    <button
      ref={ref}
      onClick={() => {
        if (ref.current) {
          onClick(ref.current.getBoundingClientRect());
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '12px',
        border: 'none',
        background: isOpen || hasActive ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
        color: hasActive || isOpen ? '#1a2652' : '#334155',
        fontWeight: hasActive || isOpen ? 700 : 500,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span style={{ color: hasActive || isOpen ? '#1a2652' : '#64748b' }}>{group.icon}</span>
      <span style={{ marginBottom: '-1px' }}>{group.section}</span>
      <ChevronDown 
        size={13} 
        style={{ 
          marginLeft: '2px', 
          transform: isOpen ? 'rotate(180deg)' : 'none', 
          transition: '0.2s',
          opacity: hasActive || isOpen ? 1 : 0.6
        }} 
      />
    </button>
  );
};

/* ─────────────────────────── RecruiterLayout ─────────────────────────── */
const RecruiterLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recruiterUser, setRecruiterUser] = useState<AuthUser | null>(null);
  const [openGroup, setOpenGroup] = useState<NavGroup | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success && res.data) {
        setNotifications((res.data as any).notifications || []);
        setUnreadCount((res.data as any).unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) {
      const allowedRoles = ['recruiter', 'job_recruiter', 'admin', 'super_admin'];
      if (!allowedRoles.includes(currentUser.role)) {
        navigate('/dashboard');
        return;
      }
      setRecruiterUser(currentUser);
    } else {
      navigate('/login');
    }
  }, [location.pathname]);

  // Close everything on click outside or scroll
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (openGroup && !(e.target as HTMLElement).closest('.dropdown-portal')) {
        setOpenGroup(null);
      }
      if (profileDropdownOpen && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleScroll = () => {
      if (openGroup) setOpenGroup(null);
    };

    document.addEventListener('mousedown', handle);
    if (navRef.current) navRef.current.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handle);
      if (navRef.current) navRef.current.removeEventListener('scroll', handleScroll);
    };
  }, [openGroup, profileDropdownOpen, notifOpen]);

  useEffect(() => {
    setOpenGroup(null);
    setProfileDropdownOpen(false);
    setNotifOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f4f7f9', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP NAV FOR RECRUITER ── */}
      <header style={{
        height: '66px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '16px',
        zIndex: 1000,
        flexShrink: 0,
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        position: 'relative',
      }}>

        {/* Logo Container */}
        <Link to="/recruiter/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            background: 'rgba(26, 38, 82, 0.05)',
            borderRadius: '8px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(26, 38, 82, 0.1)'
          }}>
            <img src={nestMainLogo} alt="NeST Digital" style={{ height: '24px', objectFit: 'contain' }} />
          </div>
          <span style={{ marginLeft: '12px', fontSize: '18px', fontWeight: 800, color: nestNavy, letterSpacing: '-0.01em' }}>Recruiter</span>
        </Link>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: '#e2e8f0', flexShrink: 0, margin: '0 4px' }} />

        {/* Desktop Nav */}
        <nav 
          ref={navRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flex: 1,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {recruiterMenuGroups.map((group, idx) => {
            const isDropdown = group.items.length > 1;
            
            if (!isDropdown) {
              const item = group.items[0];
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={idx}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
                    color: isActive ? '#1a2652' : '#334155',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ color: isActive ? '#1a2652' : '#64748b' }}>{group.icon}</span>
                  {group.section}
                </Link>
              );
            }

            return (
              <NavButton
                key={idx}
                group={group}
                activePath={location.pathname}
                isOpen={openGroup?.section === group.section}
                onClick={(rect) => {
                  if (openGroup?.section === group.section) {
                    setOpenGroup(null);
                  } else {
                    setDropdownRect(rect);
                    setOpenGroup(group);
                    setProfileDropdownOpen(false);
                  }
                }}
              />
            );
          })}
        </nav>

        {/* Dropdown Portal */}
        <AnimatePresence>
          {openGroup && dropdownRect && (
            <div className="dropdown-portal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: 0, zIndex: 10001 }}>
              <Dropdown
                group={openGroup}
                activePath={location.pathname}
                onClose={() => setOpenGroup(null)}
                style={{
                  top: `${dropdownRect.bottom + 8}px`,
                  left: `${dropdownRect.left}px`,
                }}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Right Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, marginLeft: '12px' }}>
          {(recruiterUser?.role === 'admin' || recruiterUser?.role === 'super_admin') && (
             <button 
               onClick={() => navigate('/admin/dashboard')}
               style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px',
                 padding: '8px 14px',
                 borderRadius: '10px',
                 border: '1px solid rgba(26, 38, 82, 0.2)',
                 background: '#fff',
                 color: nestNavy,
                 fontSize: '13px',
                 fontWeight: 700,
                 cursor: 'pointer',
                 transition: 'all 0.2s'
               }}
               onMouseEnter={e => e.currentTarget.style.background = 'rgba(26, 38, 82, 0.02)'}
               onMouseLeave={e => e.currentTarget.style.background = '#fff'}
             >
               <ArrowLeft size={16} /> <span className="desktop-nav-text">Back to Admin</span>
             </button>
          )}

          <div ref={notifRef} style={{ position: 'relative' }}>
             <div 
               onClick={() => {
                 setOpenGroup(null);
                 setProfileDropdownOpen(false);
                 setNotifOpen(!notifOpen);
                 if (!notifOpen) fetchNotifications();
               }}
               style={{ position: 'relative', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '10px', transition: 'background 0.2s', background: notifOpen ? '#f1f5f9' : 'transparent' }} 
               onMouseEnter={e => { if(!notifOpen) e.currentTarget.style.background = '#f8fafc' }} 
               onMouseLeave={e => { if(!notifOpen) e.currentTarget.style.background = 'transparent' }}
             >
               <Bell size={20} color={nestNavy} />
               {unreadCount > 0 && (
                 <span style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', height: '18px', minWidth: '18px', borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', padding: '0 3px' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
               )}
             </div>

             <AnimatePresence>
               {notifOpen && (
                 <motion.div
                   initial={{ opacity: 0, y: -8, scale: 0.97 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: -8, scale: 0.97 }}
                   style={{
                     position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '340px',
                     background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                     border: '1px solid #f1f5f9', padding: '12px', zIndex: 9999,
                   }}
                 >
                   <div style={{ padding: '4px 8px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '15px' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span 
                          onClick={async () => {
                            await notificationsApi.markAllAsRead();
                            fetchNotifications();
                          }}
                          style={{ fontSize: '12px', color: nestNavy, fontWeight: 700, cursor: 'pointer' }}
                        >Mark all read</span>
                      )}
                   </div>
                   <div style={{ maxHeight: '320px', overflowY: 'auto', marginTop: '8px' }}>
                      {notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                          <Bell size={24} style={{ marginBottom: '8px', opacity: 0.4 }} />
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n: any) => (
                          <div 
                            key={n.id} 
                            onClick={async () => {
                              if (!n.is_read) {
                                await notificationsApi.markAsRead(n.id);
                                fetchNotifications();
                              }
                              if (n.link) {
                                navigate(n.link);
                                setNotifOpen(false);
                              }
                            }}
                            style={{ 
                              padding: '12px', borderRadius: '10px', marginBottom: '4px', cursor: 'pointer', 
                              background: n.is_read ? 'transparent' : 'rgba(26, 38, 82, 0.03)',
                              transition: 'background 0.15s'
                            }} 
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} 
                            onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(26, 38, 82, 0.03)'}
                          >
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '13px', fontWeight: n.is_read ? 600 : 700, color: '#334155' }}>{n.title}</span>
                                <span style={{ fontSize: '10px', color: '#94a3b8', flexShrink: 0, marginLeft: '8px' }}>
                                  {n.created_at ? new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                </span>
                             </div>
                             <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{n.message}</p>
                             {!n.is_read && <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', marginTop: '6px' }} />}
                          </div>
                        ))
                      )}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div ref={profileRef} style={{ position: 'relative' }}>
            <div
              onClick={() => {
                setOpenGroup(null);
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px 12px', borderRadius: '12px', transition: 'all 0.2s', background: profileDropdownOpen ? '#f8fafc' : 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => { if(!profileDropdownOpen) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ position: 'relative' }}>
                 {recruiterUser ? (
                    recruiterUser.profile_picture ? (
                       <img src={recruiterUser.profile_picture} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
                    ) : (
                       <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: nestNavy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}> {recruiterUser.full_name.charAt(0)} </div>
                    )
                 ) : null}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, userSelect: 'none' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{recruiterUser ? recruiterUser.full_name : 'Recruiter'}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Hiring Manager</span>
              </div>
              <ChevronDown size={14} color="#64748b" style={{ transform: profileDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </div>

            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: '200px',
                    background: '#ffffff', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid #f1f5f9', padding: '6px', zIndex: 9999,
                  }}
                >
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px' }}> <LayoutDashboard size={16} /> View Profile </Link>
                  <Link to="/recruiter/settings" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px' }}> <Settings size={16} /> Recruiter Settings </Link>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 8px' }} />
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', width: '100%', textAlign: 'left', color: '#ef4444', fontSize: '14px', fontWeight: 600 }}> <LogOut size={16} /> Logout </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setMobileOpen(true)} className="mobile-menu-btn" style={{ display: 'none', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: '6px', borderRadius: '8px' }}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'relative', width: '280px', background: '#fff', height: '100%', boxShadow: '4px 0 32px rgba(0,0,0,0.15)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <img src={nestMainLogo} alt="NeST" style={{ height: '32px' }} />
                  <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
               </div>
               <div style={{ flex: 1, overflowY: 'auto' }}>
                  {recruiterMenuGroups.map(group => (
                    <div key={group.section} style={{ marginBottom: '16px' }}>
                       <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{group.section}</div>
                       {group.items.map(item => (
                         <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', color: location.pathname.startsWith(item.path) ? nestNavy : '#334155', textDecoration: 'none', fontWeight: location.pathname.startsWith(item.path) ? 700 : 500, fontSize: '14px' }}>
                            <span style={{ color: location.pathname.startsWith(item.path) ? nestNavy : '#64748b' }}>{item.icon}</span>
                            {item.name}
                         </Link>
                       ))}
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main style={{ flex: 1, overflowY: 'auto', background: '#f4f7f9' }}>
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: flex !important; }
          nav { display: none !important; }
        }
        nav::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default RecruiterLayout;
