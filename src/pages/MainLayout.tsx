import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, Activity, Bell, User, Users, Briefcase, 
  BookOpen, Edit3, Award, Calendar, MessageSquare, Settings, Menu, X, LogOut
} from 'lucide-react';
import nestMainLogo from '../assets/nest_logo.png';
import { getUser, authApi, type AuthUser } from '../services/api';
import '../App.css'; // Just re-using default CSS, we will add layout styles below inline or in App.css

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUserData] = useState<AuthUser | null>(null);

  useEffect(() => {
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) {
      setUserData(currentUser);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const menuItems = [
    { section: 'Dashboard', items: [
      { name: 'Overview', path: '/dashboard', icon: <Home size={18} /> },
      { name: 'Activity Feed', path: '/dashboard/activity', icon: <Activity size={18} /> },
      { name: 'Notifications', path: '/notifications', icon: <Bell size={18} /> },
    ]},
    { section: 'Profile', items: [
      { name: 'View Profile', path: '/profile', icon: <User size={18} /> },
      { name: 'Edit Profile', path: '/profile/edit', icon: <Edit3 size={18} /> },
    ]},
    { section: 'Networking', items: [
      { name: 'Directory', path: '/networking', icon: <Users size={18} /> },
      { name: 'Connections', path: '/networking/connections', icon: <Users size={18} /> },
    ]},
    { section: 'Jobs', items: [
      { name: 'Job Listings', path: '/jobs', icon: <Briefcase size={18} /> },
      { name: 'My Applications', path: '/jobs/applications', icon: <Briefcase size={18} /> },
      { name: 'Recommended Jobs', path: '/jobs/recommended', icon: <Briefcase size={18} /> },
    ]},
    { section: 'Learning', items: [
      { name: 'Courses', path: '/courses', icon: <BookOpen size={18} /> },
      { name: 'My Courses', path: '/courses/my-courses', icon: <BookOpen size={18} /> },
    ]},
    { section: 'Assessments', items: [
      { name: 'Assessment Center', path: '/assessments/quiz', icon: <Award size={18} /> },
      { name: 'Analytics', path: '/assessments/analytics', icon: <Activity size={18} /> },
    ]},
    { section: 'Gamification', items: [
      { name: 'Points Overview', path: '/gamification', icon: <Award size={18} /> },
      { name: 'Leaderboard', path: '/gamification/leaderboard', icon: <Award size={18} /> },
    ]},
    { section: 'Events', items: [
      { name: 'Events Listing', path: '/events', icon: <Calendar size={18} /> },
      { name: 'My Events', path: '/events/my-events', icon: <Calendar size={18} /> },
    ]},
    { section: 'Social', items: [
      { name: 'Feed', path: '/social/feed', icon: <MessageSquare size={18} /> },
    ]},
    { section: 'Settings', items: [
      { name: 'Account Settings', path: '/settings', icon: <Settings size={18} /> },
    ]}
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f4f6f8', overflow: 'hidden' }}>
      {/* Sidebar */}
      <motion.div 
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3 }}
        style={{ 
          background: '#ffffff', 
          borderRight: '1px solid #eaeaea', 
          display: 'flex', 
          flexDirection: 'column',
          zIndex: 100
        }}
        className="sidebar"
      >
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid #eaeaea' }}>
          {sidebarOpen && (
             <img src={nestMainLogo} alt="NeST Digital" style={{ height: '32px' }} />
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333' }}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }} className="custom-scrollbar">
          {menuItems.map((group, i) => (
             <div key={i} style={{ marginBottom: '15px' }}>
               {sidebarOpen && <div style={{ padding: '0 20px', fontSize: '11px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>{group.section}</div>}
               {group.items.map((item, j) => {
                 const isActive = location.pathname === item.path;
                 return (
                   <Link 
                     key={j} 
                     to={item.path}
                     style={{
                       display: 'flex',
                       alignItems: 'center',
                       padding: '10px 20px',
                       textDecoration: 'none',
                       color: isActive ? '#d32f2f' : '#333',
                       background: isActive ? '#fff1f1' : 'transparent',
                       borderRight: isActive ? '3px solid #d32f2f' : '3px solid transparent',
                       transition: 'all 0.2s'
                     }}
                   >
                     <span style={{ marginRight: sidebarOpen ? '15px' : '0', color: isActive ? '#d32f2f' : '#666' }}>{item.icon}</span>
                     {sidebarOpen && <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400 }}>{item.name}</span>}
                   </Link>
                 )
               })}
             </div>
          ))}
        </div>
        
        <div style={{ padding: '20px', borderTop: '1px solid #eaeaea' }}>
          <button 
            onClick={handleLogout} 
            style={{ display: 'flex', alignItems: 'center', color: '#666', background: 'none', border: 'none', padding: 0, cursor: 'pointer', justifyContent: sidebarOpen ? 'flex-start' : 'center', width: '100%', fontSize: '16px' }}
          >
            <LogOut size={20} style={{ marginRight: sidebarOpen ? '10px' : '0' }} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: '70px', background: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
           <h2 style={{ fontSize: '18px', margin: 0, color: '#333' }}>NeST Portal</h2>
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Bell size={20} color="#666" style={{ cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.full_name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#d32f2f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {user ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{user ? user.full_name : 'Guest'}</span>
                  <span style={{ fontSize: '12px', color: '#888' }}>{user ? user.user_type : 'User'}</span>
                </div>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div id="main-content-scroll" className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '30px', position: 'relative', scrollBehavior: 'smooth' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
