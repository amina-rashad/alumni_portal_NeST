import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, Briefcase, FileText, 
  Plus, Upload, Send, BarChart
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { title: 'Total Users', value: '5,280', trend: '+12.5%', icon: <Users size={24} color="#3b82f6" />, bg: '#eff6ff' },
    { title: 'Interns', value: '350', trend: '+8.6%', icon: <UserCheck size={24} color="#06b6d4" />, bg: '#ecfeff' },
    { title: 'Active Jobs', value: '28', trend: '+4.5%', icon: <Briefcase size={24} color="#6366f1" />, bg: '#eef2ff' },
    { title: 'Applications', value: '1,575', trend: '+15.8%', icon: <FileText size={24} color="#f59e0b" />, bg: '#fffbeb' },
  ];

  const recentActivity = [
    { user: 'Rahul Nair', action: 'added as Intern', time: '2 hours ago', avatar: 'RN' },
    { user: 'Alan Mathew', action: 'applied for Java Developer', time: '4 hours ago', avatar: 'AM' },
    { user: 'HR', action: 'updated a new job Data Analyst', time: '6 hours ago', avatar: 'HR' },
    { user: 'Maya Prasad', action: 'registered as Alumni', time: 'Yesterday', avatar: 'MP' },
    { user: 'Excel file', action: 'import IV Students List', time: '2 days ago', avatar: 'EF', isFile: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Welcome back, Admin!</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px' }}>Here is what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
              background: '#fff', 
              padding: '24px', 
              borderRadius: '20px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div style={{ background: stat.bg, padding: '16px', borderRadius: '16px', display: 'flex' }}>
              {stat.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{stat.title}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center' }}>
                  {stat.trend}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', minHeight: '340px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Overview</h3>
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {/* Ring Chart Placeholder */}
                 <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                   <svg width="180" height="180" viewBox="0 0 180 180">
                      <circle cx="90" cy="90" r="70" fill="none" stroke="#f1f5f9" strokeWidth="20" />
                      <circle cx="90" cy="90" r="70" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="320 440" strokeLinecap="round" transform="rotate(-90 90 90)" />
                   </svg>
                   <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>32%</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Conversion</div>
                   </div>
                 </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }}></div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Interns</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#38bdf8' }}></div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Employees</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9' }}>
               <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Yearly Internship Records</h3>
               <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '0 10px' }}>
                  {[40, 70, 55, 90, 110, 80].map((h, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '28px', height: `${h}px`, background: i === 4 ? '#3b82f6' : '#93c5fd', borderRadius: '6px' }}></div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{2019 + i}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Bottom Chart */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9' }}>
             <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>College-wise Student Count</h3>
             <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', padding: '0 20px' }}>
                {[60, 45, 85, 30, 95, 70, 50, 110].map((h, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ width: '32px', height: `${h}px`, background: '#3b82f6', opacity: 0.2 + (h/150), borderRadius: '8px' }}></div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', transform: 'rotate(-45deg)', marginTop: '10px', whiteSpace: 'nowrap' }}>College {i+1}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Activities and Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           {/* Recent Activities */}
           <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>Recent Activities</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {recentActivity.map((act, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      background: act.isFile ? '#f0fdf4' : '#f1f5f9', 
                      color: act.isFile ? '#22c55e' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {act.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '14px', color: '#1e293b' }}>
                         <span style={{ fontWeight: 700 }}>{act.user}</span> {act.action}
                       </div>
                       <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           {/* Quick Actions */}
           <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button style={{ padding: '14px', borderRadius: '14px', border: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Plus size={18} color="#3b82f6" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Add Intern</span>
                </button>
                <button style={{ padding: '14px', borderRadius: '14px', border: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Upload size={18} color="#22c55e" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Upload Excel</span>
                </button>
                <button style={{ padding: '14px', borderRadius: '14px', border: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Send size={18} color="#6366f1" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Post Job</span>
                </button>
                <button style={{ padding: '14px', borderRadius: '14px', border: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <BarChart size={18} color="#f59e0b" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>View Reports</span>
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
