import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home, Activity, Bell, User, Users, Briefcase,
  BookOpen, Edit3, Award, Calendar, MessageSquare,
  Settings, LogOut, ChevronDown, Menu, X
} from 'lucide-react';
import nestMainLogo from '../assets/nest_logo.png';
import { getUser, authApi, type AuthUser } from '../services/api';
import '../App.css';

/* ─────────────────────────── types ─────────────────────────── */
interface NavItem { name: string; path: string; icon: React.ReactNode }
interface NavGroup { section: string; icon: React.ReactNode; items: NavItem[] }

/* ─────────────────────────── data ─────────────────────────── */
const menuGroups: NavGroup[] = [
  {
    section: 'Insights', icon: <Home size={17} />,
    items: [
      { name: 'Insights Overview', path: '/dashboard',          icon: <Home size={15} /> },
      { name: 'Activity Feed', path: '/dashboard/activity', icon: <Activity size={15} /> },
      { name: 'Notifications', path: '/notifications',      icon: <Bell size={15} /> },
    ]
  },
  {
    section: 'Jobs', icon: <Briefcase size={17} />,
    items: [
      { name: 'Job Listings',      path: '/jobs',              icon: <Briefcase size={15} /> },
      { name: 'My Applications',   path: '/jobs/applications', icon: <Briefcase size={15} /> },
      { name: 'Recommended Jobs',  path: '/jobs/recommended',  icon: <Briefcase size={15} /> },
    ]
  },
  {
    section: 'Learning', icon: <BookOpen size={17} />,
    items: [
      { name: 'Courses',    path: '/courses',           icon: <BookOpen size={15} /> },
      { name: 'My Courses', path: '/courses/my-courses',icon: <BookOpen size={15} /> },
      { name: 'Quizzes',   path: '/assessments/quiz',      icon: <Edit3 size={15} /> },
      { name: 'Analytics', path: '/assessments/analytics', icon: <Activity size={15} /> },
      { name: 'Points Overview', path: '/gamification',            icon: <Award size={15} /> },
      { name: 'Leaderboard',     path: '/gamification/leaderboard',icon: <Award size={15} /> },
    ]
  },
  {
    section: 'Events', icon: <Calendar size={17} />,
    items: [
      { name: 'Events Listing', path: '/events',           icon: <Calendar size={15} /> },
      { name: 'My Events',      path: '/events/my-events', icon: <Calendar size={15} /> },
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
        const isExact = activePath === item.path;
        const isSubPath = activePath.startsWith(item.path + '/') || activePath.startsWith(item.path + '?');
        
        // In the Jobs group, /jobs matches /jobs/1, /jobs/apply, etc.
        // But /jobs/applications and /jobs/recommended are separate items.
        // So we only count it as active if it's an exact match OR it's a subpath AND no other item in the group is an exact/subpath match.
        const otherMatches = group.items.filter(other => 
          other.path !== item.path && 
          (activePath === other.path || activePath.startsWith(other.path + '/') || activePath.startsWith(other.path + '?'))
        );
        
        const isActive = isExact || (isSubPath && otherMatches.length === 0);
        
        return (
          <Link
            key={i}
            to={item.path}
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
            }}
          onMouseEnter={e => {
            if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f8fafc';
          }}
          onMouseLeave={e => {
            if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
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
  const navigate = useNavigate();
  const hasActive = group.items.some(item => {
    const isExact = activePath === item.path;
    const isSubPath = activePath.startsWith(item.path + '/') || activePath.startsWith(item.path + '?');
    return isExact || isSubPath;
  });
  const ref = useRef<HTMLButtonElement>(null);
  const isSingle = group.items.length === 1;

  return (
    <button
      ref={ref}
      onClick={() => {
        if (isSingle) {
          navigate(group.items[0].path);
        } else if (ref.current) {
          onClick(ref.current.getBoundingClientRect());
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
        color: hasActive || isOpen ? '#c8102e' : '#000000',
        fontWeight: hasActive || isOpen ? 700 : 500,
        fontSize: '13.5px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {group.section}
    </button>
  );
};

/* ─────────────────────────── MobileMenu ─────────────────────────── */
interface MobileMenuProps {
  activePath: string;
  onClose: () => void;
  onLogout: () => void;
  user: AuthUser | null;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ activePath, onClose, onLogout, user }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: '-100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-100%' }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex' }}
    >
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', width: '280px', background: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 30px rgba(0,0,0,0.12)', overflowY: 'auto' }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
          <img src={nestMainLogo} alt="NeST Digital" style={{ height: '32px' }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
        </div>
        {user && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#c8102e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{user.full_name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{user.user_type}</div>
            </div>
          </div>
        )}
        <div style={{ flex: 1, padding: '12px 0' }}>
          {menuGroups.map((group, gi) => {
            const hasActive = group.items.some(i => activePath === i.path);
            const isExp = expanded === group.section;
            return (
              <div key={gi}>
                <button
                  onClick={() => {
                    if (group.items.length === 1) {
                      navigate(group.items[0].path);
                      onClose();
                    } else {
                      setExpanded(isExp ? null : group.section);
                    }
                  }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', background: 'none', border: 'none', cursor: 'pointer', color: hasActive ? '#c8102e' : '#334155', fontWeight: hasActive ? 700 : 500, fontSize: '14px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {group.section}
                  </div>

                </button>
                <AnimatePresence>
                  {isExp && group.items.length > 1 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      {group.items.map((item, ii) => {
                        const isExact = activePath === item.path;
                        const isSubPath = activePath.startsWith(item.path + '/') || activePath.startsWith(item.path + '?');
                        const otherMatches = group.items.filter(other => 
                          other.path !== item.path && 
                          (activePath === other.path || activePath.startsWith(other.path + '/') || activePath.startsWith(other.path + '?'))
                        );
                        const isActive = isExact || (isSubPath && otherMatches.length === 0);
                        
                        return (
                          <Link key={ii} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 20px 9px 44px', textDecoration: 'none', color: isActive ? '#c8102e' : '#475569', background: isActive ? '#fff1f1' : 'transparent', fontWeight: isActive ? 600 : 400, fontSize: '13.5px' }}>
                            {item.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={() => { onClose(); onLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 600, fontSize: '14px' }}>
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
};
const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUserData] = useState<AuthUser | null>(null);
  const [openGroup, setOpenGroup] = useState<NavGroup | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) setUserData(currentUser);
  }, []);

  // Close everything on path change
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
    setProfileDropdownOpen(false);
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
    };
    const handleScroll = () => {
      if (openGroup) setOpenGroup(null);
    };

    document.addEventListener('mousedown', handle);
    if (navRef.current) navRef.current.addEventListener('scroll', handleScroll);
    document.getElementById('main-content-scroll')?.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handle);
      if (navRef.current) navRef.current.removeEventListener('scroll', handleScroll);
      document.getElementById('main-content-scroll')?.removeEventListener('scroll', handleScroll);
    };
  }, [openGroup, profileDropdownOpen]);

  useEffect(() => {
    setOpenGroup(null);
    setProfileDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const initials = user ? user.full_name?.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f4f6f8', overflow: 'hidden', fontFamily: "'Montserrat', sans-serif" }}>

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
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <img src={nestMainLogo} alt="NeST Digital" style={{ height: '32px', objectFit: 'contain' }} />
        </Link>

        {/* Spacer to push nav to right */}
        <div style={{ flex: 1 }} />

        {/* Sidewise Scrolling Nav */}
        <nav 
          ref={navRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: '0 4px',
          }}
        >
          {menuGroups.map(group => (
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

        {/* Global Dropdown Portal (Non-clipped) */}
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

        {/* Right: Bell + User avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, marginLeft: '12px' }}>
          <button
            onClick={() => navigate('/notifications')}
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
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt={user.full_name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f1f5f9' }} />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #c8102e 0%, #9b0a22 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', border: '2px solid #fee2e2' }}>
                  {initials}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{user?.full_name || 'Guest'}</span>
                  {user?.status === 'open_to_work' && (
                    <span style={{ 
                      fontSize: '9px', 
                      background: '#ebfbee', 
                      color: '#2b8a3e', 
                      padding: '2px 6px', 
                      borderRadius: '10px', 
                      fontWeight: 700,
                      border: '1px solid #d3f9d8',
                      letterSpacing: '0.2px'
                    }}>
                      OPEN TO WORK
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{user?.user_type || 'User'}</span>
              </div>

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
                    View Profile
                  </Link>
                  <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px', transition: '0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    Account Settings
                  </Link>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 8px' }} />
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', width: '100%', textAlign: 'left', color: '#ef4444', fontSize: '14px', fontWeight: 600, transition: '0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#fff1f1')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger (mobile) */}
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
          <MobileMenu
            activePath={location.pathname}
            onClose={() => setMobileOpen(false)}
            onLogout={handleLogout}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* ── Page content ── */}
      <div
        id="main-content-scroll"
        className="custom-scrollbar"
        style={{ flex: 1, overflowY: 'auto', position: 'relative', scrollBehavior: 'smooth' }}
      >
        <div style={{ 
          padding: location.pathname === '/dashboard' ? '0' : '28px 32px', 
          maxWidth: location.pathname === '/dashboard' ? 'none' : '1400px', 
          margin: '0 auto' 
        }}>
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

export default MainLayout;
