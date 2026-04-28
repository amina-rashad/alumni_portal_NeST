import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, School, Briefcase,
  FileText, BarChart3, Settings, LogOut, Bell, Menu, X, ChevronDown, BookOpen, Calendar, Award
} from 'lucide-react';
import nestMainLogo from '../../assets/nest_logo.png';
import { getUser, authApi, type AuthUser } from '../../services/api';
import '../../App.css';

/* ─────────────────────────── types ─────────────────────────── */
interface NavItem { name: string; path: string; icon: React.ReactNode }
interface NavGroup { section: string; icon: React.ReactNode; items: NavItem[] }

/* ─────────────────────────── data ─────────────────────────── */
const adminMenuGroups: NavGroup[] = [
  {
    section: 'Overview', icon: <LayoutDashboard size={17} />,
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={15} /> },
      { name: 'Reports',   path: '/admin/reports',   icon: <BarChart3 size={15} /> },
    ]
  },
  {
    section: 'Users', icon: <Users size={17} />,
    items: [
      { name: 'User Management',   path: '/admin/users',       icon: <Users size={15} /> },
      { name: 'Intern Management', path: '/admin/interns',     icon: <GraduationCap size={15} /> },
      { name: 'IV Students',       path: '/admin/iv-students', icon: <School size={15} /> },
    ]
  },
  {
    section: 'Content', icon: <Briefcase size={17} />,
    items: [
      { name: 'Job Management',   path: '/admin/jobs',         icon: <Briefcase size={15} /> },
      { name: 'Applications',     path: '/admin/applications', icon: <FileText size={15} /> },
      { name: 'Event Management', path: '/admin/events',       icon: <Calendar size={15} /> },
      { name: 'Add Courses',      path: '/admin/add-courses',  icon: <BookOpen size={15} /> },
    ]
  },
  {
    section: 'Tools', icon: <Settings size={17} />,
    items: [
      { name: 'Certification', path: '/admin/certification', icon: <Award size={15} /> },
      { name: 'Settings',      path: '/admin/settings',      icon: <Settings size={15} /> },
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
  const navigate = useNavigate();
  const hasActive = group.items.some(i => activePath.startsWith(i.path));
  const ref = useRef<HTMLButtonElement>(null);
  const isSingle = group.items.length === 1;

  const nestNavy = '#1a2652';

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
        background: isOpen ? 'rgba(26, 38, 82, 0.05)' : hasActive ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
        color: hasActive || isOpen ? nestNavy : '#334155',
        fontWeight: hasActive || isOpen ? 700 : 500,
        fontSize: '13.5px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span style={{ color: hasActive || isOpen ? nestNavy : '#64748b' }}>{group.icon}</span>
      {group.section}
      {!isSingle && (
        <ChevronDown 
          size={13} 
          style={{ 
            marginLeft: '2px', 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: '0.2s',
            opacity: 0.6
          }} 
        />
      )}
    </button>
  );
};

/* ─────────────────────────── AdminLayout ─────────────────────────── */
const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [openGroup, setOpenGroup] = useState<NavGroup | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) {
      if (currentUser.role === 'recruiter') {
        navigate('/recruiter');
        return;
      }
      setAdminUser(currentUser);
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
    navigate('/login');
  };

  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP NAV FOR ADMIN ── */}
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
        <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
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
          <span style={{ marginLeft: '12px', fontSize: '18px', fontWeight: 800, color: nestNavy, letterSpacing: '-0.01em' }}>Admin</span>
        </Link>

        {/* Spacer to push nav to right */}
        <div style={{ flex: 1 }} />

        {/* Desktop Admin Nav (Scrolling) */}
        <nav 
          ref={navRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {adminMenuGroups.map(group => (
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
          <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '10px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <Bell size={20} color={nestNavy} />
            <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', height: '8px', width: '8px', borderRadius: '50%', border: '2px solid #fff' }}></span>
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
                 {adminUser ? (
                    adminUser.profile_picture ? (
                       <img src={adminUser.profile_picture} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
                    ) : (
                       <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: nestNavy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}> {adminUser.full_name.charAt(0)} </div>
                    )
                 ) : null}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, userSelect: 'none' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{adminUser ? adminUser.full_name : 'Admin'}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>System Admin</span>
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
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px' }}> <Users size={16} /> View Profile </Link>
                  <Link to="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: '#334155', fontSize: '14px' }}> <Settings size={16} /> Admin Settings </Link>
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
                  {adminMenuGroups.map(group => (
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
               <button onClick={handleLogout} style={{ marginTop: '20px', padding: '12px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                  <LogOut size={18} /> Logout
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: flex !important; }
          .desktop-logout-text { display: none; }
          nav { display: none !important; }
        }
        nav::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default AdminLayout;
