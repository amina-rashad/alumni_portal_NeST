import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, ClipboardCheck, Award,
  Bell, Menu, X, ChevronDown, LogOut, Settings, User, Clock, MessageSquare, Trophy, TrendingUp, BookOpen as GitMerge
} from 'lucide-react';
import nestMainLogo from '../../assets/nest_logo.png';
import { getUser, authApi, type AuthUser } from '../../services/api';
import '../../App.css';

/* ─────────────────────────── types ─────────────────────────── */
interface NavItem { name: string; path: string; icon: React.ReactNode }
interface NavGroup { section: string; icon: React.ReactNode; items: NavItem[]; isDirectLink?: boolean; path?: string }

/* ─────────────────────────── data ─────────────────────────── */
const cmMenuGroups: NavGroup[] = [
  {
    section: 'Overview', 
    icon: <LayoutDashboard size={17} />,
    isDirectLink: true,
    path: '/course-manager/dashboard',
    items: []
  },
  {
    section: 'Courses', icon: <BookOpen size={17} />,
    items: [
      { name: 'Course Management', path: '/course-manager/courses', icon: <BookOpen size={15} /> },
      { name: 'Create Course',     path: '/course-manager/courses/create', icon: <BookOpen size={15} /> },
      { name: 'Recommendation Setup', path: '/course-manager/recommendations', icon: <GitMerge size={15} /> },
      { name: 'Completion Insights', path: '/course-manager/insights', icon: <TrendingUp size={15} /> },
    ]
  },
  {
    section: 'Management', icon: <Users size={17} />,
    items: [
      { name: 'Student Directory', path: '/course-manager/students',    icon: <Users size={15} /> },
      { name: 'Assessments',       path: '/course-manager/assessments', icon: <ClipboardCheck size={15} /> },
      { name: 'Certificates',      path: '/course-manager/certificates',icon: <Award size={15} /> },
      { name: 'Reminder Center',   path: '/course-manager/reminders',   icon: <Bell size={15} /> },
      { name: 'Discussion Forum',   path: '/course-manager/forum',   icon: <MessageSquare size={15} /> },
      { name: 'Achievement Manager', path: '/course-manager/achievements', icon: <Trophy size={15} /> },
    ]
  },
  {
    section: 'Attendance', 
    icon: <Clock size={17} />,
    isDirectLink: true,
    path: '/course-manager/attendance',
    items: []
  }
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
      const isActive = activePath === item.path;
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
            color: isActive ? '#c8102e' : '#334155',
            background: isActive ? '#fff1f1' : 'transparent',
            fontWeight: isActive ? 600 : 400,
            fontSize: '14px',
            transition: 'all 0.15s',
            outline: 'none',
          }}
          onMouseEnter={e => {
            if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f8fafc';
          }}
          onMouseLeave={e => {
            if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <span style={{ color: isActive ? '#c8102e' : '#64748b', flexShrink: 0 }}>{item.icon}</span>
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
  const hasActive = group.isDirectLink 
    ? activePath === group.path 
    : group.items.some(i => activePath === i.path);
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  if (group.isDirectLink && group.path) {
    return (
      <Link
        to={group.path}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '12px',
          textDecoration: 'none',
          background: hasActive ? '#fff1f1' : 'transparent',
          color: hasActive ? '#c8102e' : '#334155',
          fontWeight: hasActive ? 700 : 500,
          fontSize: '13.5px',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          outline: 'none',
        }}
      >
        <span style={{ color: hasActive ? '#c8102e' : '#64748b' }}>{group.icon}</span>
        {group.section}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={() => {
        if (ref.current) {
          onClick((ref.current as HTMLElement).getBoundingClientRect());
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '12px',
        border: 'none',
        background: isOpen ? '#fff1f1' : hasActive ? '#fff1f1' : 'transparent',
        color: hasActive || isOpen ? '#c8102e' : '#334155',
        fontWeight: hasActive || isOpen ? 700 : 500,
        fontSize: '13.5px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        outline: 'none',
      }}
    >
      <span style={{ color: hasActive || isOpen ? '#c8102e' : '#64748b' }}>{group.icon}</span>
      {group.section}
      <ChevronDown 
        size={13} 
        style={{ 
          marginLeft: '2px', 
          transform: isOpen ? 'rotate(180deg)' : 'none', 
          transition: '0.2s',
          opacity: 0.6
        }} 
      />
    </button>
  );
};

/* ─────────────────────────── CourseManagerLayout ─────────────────────────── */
const CourseManagerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cmUser, setCmUser] = useState<AuthUser | null>(null);
  const [openGroup, setOpenGroup] = useState<NavGroup | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) setCmUser(currentUser);
  }, []);

  // Close everything on click outside or scroll
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (openGroup && !(e.target as HTMLElement).closest('.dropdown-portal')) {
        setOpenGroup(null);
      }
      if (profileDropdownOpen && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
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
  }, [openGroup, profileDropdownOpen]);

  useEffect(() => {
    setOpenGroup(null);
    setProfileDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authApi.logout();
    navigate('/course-manager/login');
  };

  const initials = cmUser ? cmUser.full_name?.charAt(0).toUpperCase() : 'CM';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f4f6f8', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP NAVBAR ── */}
      <header style={{
        height: '66px',
        background: '#ffffff',
        borderBottom: '1px solid #eaeaea',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '12px',
        zIndex: 1000,
        flexShrink: 0,
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        position: 'relative',
      }}>

        {/* Logo */}
        <Link to="/course-manager/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
           <div style={{
            background: 'rgba(200, 16, 46, 0.05)',
            borderRadius: '8px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(200, 16, 46, 0.1)'
          }}>
            <img src={nestMainLogo} alt="NeST Digital" style={{ height: '24px', objectFit: 'contain' }} />
          </div>
          <span style={{ marginLeft: '12px', fontSize: '16px', fontWeight: 800, color: '#c8102e', letterSpacing: '-0.01em' }}>Manager</span>
        </Link>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: '#e2e8f0', flexShrink: 0, margin: '0 4px' }} />

        {/* Sidewise Scrolling Nav */}
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
            padding: '0 4px',
          }}
        >
          {cmMenuGroups.map(group => (
            <NavButton
              key={group.section}
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
          ))}
        </nav>

        {/* Global Dropdown Portal */}
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
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8102e', display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '10px', transition: '0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <Bell size={20} />
          </button>

          {/* User Profile Dropdown */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <div
              onClick={() => {
                setOpenGroup(null);
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px 12px', borderRadius: '12px', transition: '0.15s', background: profileDropdownOpen ? '#f8fafc' : 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => { if(!profileDropdownOpen) e.currentTarget.style.background = 'transparent' }}
            >
              {cmUser?.profile_picture ? (
                <img src={cmUser.profile_picture} alt={cmUser.full_name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f1f5f9' }} />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #c8102e 0%, #9b0a22 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', border: '2px solid #fee2e2' }}>
                  {initials}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, userSelect: 'none' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{cmUser?.full_name || 'Admin User'}</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Course Manager</span>
              </div>
              <ChevronDown size={14} color="#94a3b8" style={{ transform: profileDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </div>

            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: '200px',
                    background: '#ffffff',
                    borderRadius: '14px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid #f1f5f9',
                    padding: '6px',
                    zIndex: 9999,
                  }}
                >
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', transition: '0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <User size={16} /> View Profile
                  </Link>
                  <Link to="/course-manager/settings" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', transition: '0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Settings size={16} /> Management Settings
                  </Link>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 8px' }} />
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', width: '100%', textAlign: 'left', color: '#ef4444', fontSize: '14px', fontWeight: 600, transition: '0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#fff1f1')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#334155',
              padding: '8px',
              borderRadius: '10px',
            }}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
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
                  {cmMenuGroups.map(group => (
                    <div key={group.section} style={{ marginBottom: '16px' }}>
                       <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{group.section}</div>
                       {group.isDirectLink && group.path ? (
                         <Link to={group.path} onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', color: location.pathname === group.path ? '#c8102e' : '#334155', textDecoration: 'none', fontWeight: location.pathname === group.path ? 700 : 500, fontSize: '14px' }}>
                            <span style={{ color: location.pathname === group.path ? '#c8102e' : '#64748b' }}>{group.icon}</span>
                            {group.section}
                         </Link>
                       ) : (
                         group.items.map(item => (
                           <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', color: location.pathname === item.path ? '#c8102e' : '#334155', textDecoration: 'none', fontWeight: location.pathname === item.path ? 700 : 500, fontSize: '14px' }}>
                              <span style={{ color: location.pathname === item.path ? '#c8102e' : '#64748b' }}>{item.icon}</span>
                              {item.name}
                           </Link>
                         ))
                       )}
                    </div>
                  ))}
               </div>
               <button onClick={handleLogout} style={{ marginTop: '20px', padding: '12px', background: '#fff1f1', color: '#ef4444', border: 'none', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                  <LogOut size={18} /> Logout
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Page content ── */}
      <div
        id="main-content-scroll"
        style={{ flex: 1, overflowY: 'auto', position: 'relative', scrollBehavior: 'smooth' }}
      >
        <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

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

export default CourseManagerLayout;


