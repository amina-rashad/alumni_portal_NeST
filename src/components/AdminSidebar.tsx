import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Shield, Users, UserPlus, GraduationCap, School,
  Award, Briefcase, FileText, Activity, Megaphone, Calendar, BookOpen,
  LogOut, Menu, X
} from 'lucide-react';
import nestMainLogo from '../assets/nest_logo.png';

export interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole?: string;
  currentPath: string;
  onLogout: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const allAdminMenuItems = [
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

export const isItemActive = (itemPath: string, currentPath: string): boolean => {
  if (itemPath === '/recruiter/applications') {
    return currentPath.startsWith('/recruiter/applications') || currentPath.startsWith('/recruiter/mail');
  }
  if (itemPath === '/recruiter/overview' || itemPath === '/recruiter/dashboard') {
    return currentPath.startsWith('/recruiter') && !currentPath.startsWith('/recruiter/applications') && !currentPath.startsWith('/recruiter/mail');
  }
  if (itemPath === '/event-manager/dashboard') {
    return currentPath.startsWith('/event-manager');
  }
  if (itemPath === '/course-manager/dashboard') {
    return currentPath.startsWith('/course-manager');
  }
  return currentPath.startsWith(itemPath);
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onToggle,
  userRole = 'admin',
  currentPath,
  onLogout,
  isMobile = false,
  onCloseMobile
}) => {
  const nestNavy = '#1a2652';
  const menuItems = allAdminMenuItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <motion.div
      initial={false}
      animate={
        isMobile
          ? { x: isOpen ? 0 : -290, width: 280 }
          : { x: 0, width: isOpen ? 260 : 80 }
      }
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        background: nestNavy,
        display: 'flex',
        flexDirection: 'column',
        zIndex: isMobile ? 1000 : 100,
        color: '#e2e8f0',
        boxShadow: isMobile && isOpen ? '0 10px 40px rgba(0,0,0,0.3)' : '4px 0 10px rgba(0,0,0,0.05)',
        height: '100vh',
        flexShrink: 0,
        fontFamily: "'Inter', sans-serif",
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        bottom: 0,
      }}
    >
      {/* Sidebar Top: Logo & Toggle Button */}
      <div style={{
        padding: '20px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        {isOpen ? (
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
              onClick={onToggle}
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
              title="Collapse sidebar"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
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
            title="Expand sidebar"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* Sidebar Menu Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }} className="admin-sidebar-scroll">
        {menuItems.map((item, index) => {
          const active = isItemActive(item.path, currentPath);
          return (
            <Link
              key={index}
              to={item.path}
              onClick={() => {
                if (isMobile && onCloseMobile) {
                  onCloseMobile();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: isOpen ? '12px 24px' : '12px 0',
                textDecoration: 'none',
                color: active ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                background: active ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                margin: isOpen ? '2px 12px' : '2px 8px',
                borderRadius: '12px',
                justifyContent: isOpen ? 'flex-start' : 'center',
                position: 'relative'
              }}
            >
              <span style={{
                marginRight: isOpen ? '16px' : '0',
                color: active ? '#fff' : 'inherit',
                display: 'flex',
                transition: 'all 0.3s',
                flexShrink: 0
              }}>{item.icon}</span>
              {isOpen && (
                <>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: active ? 700 : 400, 
                    flex: 1, 
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.name}
                  </span>
                  {active && (
                    <motion.div layoutId="globalAdminSidebarDot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.5)', flexShrink: 0 }} />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Bottom: Logout */}
      <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'rgba(255, 255, 255, 0.65)',
            background: 'none',
            border: 'none',
            padding: '10px 0',
            cursor: 'pointer',
            justifyContent: isOpen ? 'flex-start' : 'center',
            width: '100%',
            gap: '16px'
          }}
        >
          <LogOut size={20} />
          {isOpen && <span style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>Logout</span>}
        </button>
      </div>

      <style>{`
        .admin-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </motion.div>
  );
};

export default AdminSidebar;
