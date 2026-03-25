import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, GraduationCap, School, Briefcase, 
  FileText, BarChart3, Settings, LogOut, Bell, Search, Menu, X, ChevronDown
} from 'lucide-react';
import nestMainLogo from '../../assets/nest_logo.png';
import { getUser, authApi, type AuthUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) {
      setAdminUser(currentUser);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'User Management', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Intern Management', path: '/admin/interns', icon: <GraduationCap size={20} /> },
    { name: 'IV Students', path: '/admin/iv-students', icon: <School size={20} /> },
    { name: 'Job Management', path: '/admin/jobs', icon: <Briefcase size={20} />, hasSubmenu: true },
    { name: 'Applications', path: '/admin/applications', icon: <FileText size={20} /> },
    { name: 'Reports', path: '/admin/reports', icon: <BarChart3 size={20} />, hasSubmenu: true },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <motion.div 
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ 
          background: '#1e293b', 
          display: 'flex', 
          flexDirection: 'column',
          zIndex: 100,
          color: '#e2e8f0',
          boxShadow: '4px 0 10px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {sidebarOpen ? (
            <div style={{ 
              background: '#fff', 
              borderRadius: '12px', 
              padding: '6px 12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              width: '100%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={nestMainLogo} alt="NeST DIGITAL" style={{ height: '28px' }} />
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '10px', padding: '6px' }}>
              <img src={nestMainLogo} alt="NeST" style={{ height: '20px' }} />
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }} className="admin-sidebar-scroll">
          {menuItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={index} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 24px',
                  textDecoration: 'none',
                  color: isActive ? '#fff' : '#94a3b8',
                  background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '2px',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center'
                }}
              >
                <span style={{ marginRight: sidebarOpen ? '16px' : '0', color: isActive ? '#3b82f6' : 'inherit', display: 'flex' }}>{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400, flex: 1 }}>{item.name}</span>
                    {item.hasSubmenu && <ChevronDown size={14} style={{ opacity: 0.5 }} />}
                  </>
                )}
              </Link>
            )
          })}
        </div>
        
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#94a3b8', 
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
             <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '10px', display: 'flex' }}
             >
               {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
             </button>
             <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Dashboard</h2>
           </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 16px' }}>
                <Search size={18} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  style={{ 
                    padding: '10px 12px', 
                    border: 'none', 
                    fontSize: '14px',
                    width: '240px',
                    outline: 'none',
                    background: 'transparent'
                  }}
                />
              </div>

              <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '10px', transition: 'background 0.2s' }} className="hover-highlight">
                <Bell size={22} color="#64748b" />
                <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', height: '10px', width: '10px', borderRadius: '50%', border: '2px solid #fff' }}></span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px', borderRadius: '12px' }}>
                <div style={{ position: 'relative' }}>
                  {adminUser?.profile_picture ? (
                    <img src={adminUser.profile_picture} alt={adminUser.full_name} style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#d32f2f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                      {adminUser ? adminUser.full_name.substring(0, 2).toUpperCase() : 'AD'}
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', border: '2px solid #fff' }}></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{adminUser ? adminUser.full_name : 'Administrator'}</span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>System Admin</span>
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

export default AdminLayout;
