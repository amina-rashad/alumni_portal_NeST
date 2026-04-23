import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, BarChart3, Settings, 
  LogOut, Bell, Menu, X, ChevronDown, PlusCircle, UserCheck, ArrowLeft
} from 'lucide-react';
import nestMainLogo from '../../assets/nest_logo.png';
import { getUser, authApi, type AuthUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const EventManagerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [managerUser, setManagerUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) {
      setManagerUser(currentUser);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/event-manager/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Events', path: '/event-manager/events', icon: <Calendar size={20} /> },
    { name: 'Create Event', path: '/event-manager/events/add', icon: <PlusCircle size={20} /> },
    { name: 'Attendees', path: '/event-manager/attendees', icon: <UserCheck size={20} /> },
    { name: 'Registrations', path: '/event-manager/registrations', icon: <Users size={20} /> },
    { name: 'Reports', path: '/event-manager/reports', icon: <BarChart3 size={20} /> },
    { name: 'Settings', path: '/event-manager/settings', icon: <Settings size={20} /> },
  ];

  if (managerUser?.role === 'admin') {
    menuItems.unshift({ name: 'Back to Admin', path: '/admin/dashboard', icon: <ArrowLeft size={20} /> });
  }

  /* EVENT MANAGER THEME: Deep Indigo / Violet */
  const brandPrimary = '#4f46e5'; // Indigo-600
  const brandDark = '#312e81';    // Indigo-900

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <motion.div
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          background: brandDark,
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
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '12px',
                  display: 'flex'
                }}
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                color: '#fff',
                padding: '12px',
                borderRadius: '14px',
                display: 'flex'
              }}
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={index}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: sidebarOpen ? '14px 24px' : '14px 0',
                  textDecoration: 'none',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  transition: 'all 0.2s',
                  marginBottom: '2px',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  position: 'relative'
                }}
              >
                <span style={{
                  marginRight: sidebarOpen ? '16px' : '0',
                  color: isActive ? '#fff' : 'inherit',
                  display: 'flex'
                }}>{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 400, flex: 1 }}>{item.name}</span>
                    {isActive && (
                      <motion.div layoutId="activeInd" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#fff' }} />
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
              fontWeight: 700,
              color: '#1e293b',
              margin: 0,
              fontFamily: "'Playfair Display', serif"
            }}>
              Event&nbsp;Manager&nbsp;Portal
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '10px' }}>
              <Bell size={22} color="#64748b" />
              <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#4f46e5', height: '10px', width: '10px', borderRadius: '50%', border: '2px solid #fff' }}></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                {managerUser?.profile_picture ? (
                  <img src={managerUser.profile_picture} alt={managerUser.full_name} style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: brandPrimary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                    {managerUser ? managerUser.full_name.substring(0, 2).toUpperCase() : 'EM'}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{managerUser ? managerUser.full_name : 'Event Manager'}</span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Manager</span>
              </div>
              <ChevronDown size={14} color="#64748b" />
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

export default EventManagerLayout;
