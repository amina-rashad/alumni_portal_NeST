import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, Briefcase, FileText, 
  Plus, Calendar, BookOpen, Clock, 
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';

const nestNavy = '#1a2652';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    total_users: 0,
    interns: 0,
    active_jobs: 0,
    applications: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await adminApi.getStats();
      if (res.success && res.data) {
        setStatsData(res.data.stats);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Users', value: statsData.total_users.toLocaleString(), trend: '+0%', icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Interns', value: statsData.interns.toLocaleString(), trend: '+0%', icon: UserCheck, color: '#06b6d4', bg: '#ecfeff' },
    { title: 'Active Jobs', value: statsData.active_jobs.toLocaleString(), trend: '+0%', icon: Briefcase, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Applications', value: statsData.applications.toLocaleString(), trend: '+0%', icon: FileText, color: '#f59e0b', bg: '#fffbeb' },
  ];

  const recentActivity = [
    { user: 'Admin', action: 'accessed dashboard', time: 'Just now', avatar: 'AD' },
    { user: 'System', action: 'refreshed live data', time: 'Recently', avatar: 'SY' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Stats - Compact Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ 
              background: '#fff', padding: '20px', borderRadius: '24px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}
          >
            <div style={{ background: stat.bg, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <div>
               <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.title}</div>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                 <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{stat.value}</span>
                 <span style={{ fontSize: '10px', fontWeight: 800, color: '#22c55e' }}>{stat.trend}</span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Row: Pie Graph & Bar Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
         {/* PIE GRAPH: Platform Overview */}
         <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Platform Distribution</h3>
            <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <motion.svg 
                  initial={{ scale: 0.8, rotate: -90, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "backOut" }}
                  width="180" height="180" viewBox="0 0 100 100">
                  <motion.circle 
                    initial={{ strokeDasharray: "0 251.2" }}
                    animate={{ strokeDasharray: "157 251.2" }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    cx="50" cy="50" r="40" fill="transparent" stroke={nestNavy} strokeWidth="20" transform="rotate(-90 50 50)" />
                  <motion.circle 
                    initial={{ strokeDasharray: "0 251.2" }}
                    animate={{ strokeDasharray: "50 251.2" }}
                    transition={{ duration: 1.5, delay: 0.4 }}
                    cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="20" transform="rotate(135 50 50)" />
                  <motion.circle 
                    initial={{ strokeDasharray: "0 251.2" }}
                    animate={{ strokeDasharray: "25 251.2" }}
                    transition={{ duration: 1.5, delay: 0.6 }}
                    cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="20" transform="rotate(207 50 50)" />
                  <motion.circle 
                    initial={{ strokeDasharray: "0 251.2" }}
                    animate={{ strokeDasharray: "18 251.2" }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="20" transform="rotate(243 50 50)" />
                  <circle cx="50" cy="50" r="28" fill="#fff" />
               </motion.svg>
               <motion.div 
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 1.5 }}
                 style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>TOTAL</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>5.2K</div>
               </motion.div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: nestNavy }}></div> Alumni
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }}></div> IV Students
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }}></div> Interns
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }}></div> Staff
               </div>
            </div>
         </section>

         {/* BAR GRAPH: Growth Analytics */}
         <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
               <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Enrollment & Engagement Growth</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', padding: '0 10px' }}>
               {[60, 40, 85, 30, 95, 70, 50, 110, 80, 130, 90, 105].map((h, i) => (
                 <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                   <div style={{ position: 'relative', width: '20px', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ width: '100%', height: `${h}px`, background: i === 9 ? nestNavy : 'rgba(26, 38, 82, 0.15)', borderRadius: '6px' }}></div>
                   </div>
                   <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                 </div>
               ))}
            </div>
         </section>
      </div>

      {/* Bottom Content Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
        
        {/* Recent Activity Grid */}
        <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.08)', color: nestNavy }}><Activity size={18} /></div> Recent Activities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             {recentActivity.map((act, i) => (
               <div key={i} style={{ padding: '20px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: '16px', transition: 'transform 0.2s' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: nestNavy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                    {act.avatar}
                  </div>
                  <div>
                     <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{act.user}</div>
                     <div style={{ fontSize: '12px', color: '#475569', margin: '4px 0', fontWeight: 500 }}>{act.action}</div>
                     <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{act.time}</div>
                  </div>
               </div>
             ))}
          </div>
        </section>

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
                      background: '#f1f5f9', 
                      color: '#64748b',
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

           {/* Global Actions */}
           <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: `2px solid ${nestNavy}15`, boxShadow: '0 10px 30px rgba(26, 38, 82, 0.04)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <button 
                  onClick={() => navigate('/admin/events/add')}
                  style={{ width: '100%', padding: '14px', borderRadius: '16px', border: 'none', background: '#f43f5e', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)' }}
                 >
                   <Plus size={16} /> Host Event
                 </button>
                 <button 
                  onClick={() => navigate('/admin/add-courses')}
                  style={{ width: '100%', padding: '14px', borderRadius: '16px', border: 'none', background: nestNavy, color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' }}
                 >
                   <Plus size={16} /> Add Course
                 </button>
              </div>
           </section>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
