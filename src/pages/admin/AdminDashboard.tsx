import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, Briefcase, FileText, 
  Plus, Calendar, BookOpen, Clock, 
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const stats = [
    { title: 'Total Users', value: '5,280', trend: '+12%', icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Active Courses', value: '48', trend: '+4', icon: BookOpen, color: '#8b5cf6', bg: '#f5f3ff' },
    { title: 'Upcoming Events', value: '12', trend: '+2', icon: Calendar, color: '#f43f5e', bg: '#fff1f2' },
    { title: 'Interns', value: '350', trend: '+8%', icon: UserCheck, color: '#06b6d4', bg: '#ecfeff' },
    { title: 'Active Jobs', value: '28', trend: '+5%', icon: Briefcase, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Applications', value: '1,575', trend: '+15%', icon: FileText, color: '#f59e0b', bg: '#fffbeb' },
  ];

  const upcomingEvents = [
    { title: 'Strategic NeST Tech Summit 2026', date: 'Oct 15, 2026', time: '10:00 AM', loc: 'Executive Auditorium', type: 'Technology' },
    { title: 'Alumni Professional Mixer', date: 'Oct 22, 2026', time: '06:00 PM', loc: 'Grand Innovation Hall', type: 'Networking' },
    { title: 'Cloud Infrastructure Workshop', date: 'Oct 28, 2026', time: '02:00 PM', loc: 'Virtual Session A', type: 'Career' },
  ];

  const recentActivity = [
    { user: 'Rahul Nair', action: 'completed AWS Course', time: '15m ago', avatar: 'RN', detail: 'Scored 94% in final assessment' },
    { user: 'Alan Mathew', action: 'applied for Senior Dev', time: '42m ago', avatar: 'AM', detail: 'NeST Alumni Tier 2' },
    { user: 'HR Department', action: 'posted Python Lead', time: '1h ago', avatar: 'HR', detail: 'Urgent Requirement' },
    { user: 'Maya Prasad', action: 'registered as Alumni', time: '3h ago', avatar: 'MP', detail: 'Class of 2022' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* HEADER REMOVED AS REQUESTED - STARTING WITH STATS */}

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
               <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{stat.title}</div>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                 <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{stat.value}</span>
                 <span style={{ fontSize: '10px', fontWeight: 700, color: '#22c55e' }}>{stat.trend}</span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Row: Pie Graph & Bar Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
         {/* PIE GRAPH: Platform Overview */}
         <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 30px rgba(0,0,0,0.02)' }}>
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
                    cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="20" transform="rotate(-90 50 50)" />
                  <motion.circle 
                    initial={{ strokeDasharray: "0 251.2" }}
                    animate={{ strokeDasharray: "50 251.2" }}
                    transition={{ duration: 1.5, delay: 0.4 }}
                    cx="50" cy="50" r="40" fill="transparent" stroke="#06b6d4" strokeWidth="20" transform="rotate(135 50 50)" />
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
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>TOTAL</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>5.2K</div>
               </motion.div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }}></div> Alumni
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#06b6d4' }}></div> IV Students
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }}></div> Interns
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }}></div> Staff
               </div>
            </div>
         </section>

         {/* BAR GRAPH: Growth Analytics */}
         <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
               <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Enrollment & Engagement Growth</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', padding: '0 10px' }}>
               {[60, 40, 85, 30, 95, 70, 50, 110, 80, 130, 90, 105].map((h, i) => (
                 <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                   <div style={{ position: 'relative', width: '20px', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ width: '100%', height: `${h}px`, background: i === 9 ? '#3b82f6' : '#bfdbfe', borderRadius: '6px' }}></div>
                   </div>
                   <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                 </div>
               ))}
            </div>
         </section>
      </div>

      {/* Bottom Content Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
        
        {/* Recent Activity Grid */}
        <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ padding: '8px', borderRadius: '10px', background: '#8b5cf610', color: '#8b5cf6' }}><Activity size={18} /></div> Recent Activities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             {recentActivity.map((act, i) => (
               <div key={i} style={{ padding: '20px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>
                    {act.avatar}
                  </div>
                  <div>
                     <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{act.user}</div>
                     <div style={{ fontSize: '12px', color: '#475569', margin: '2px 0' }}>{act.action}</div>
                     <div style={{ fontSize: '10px', color: '#94a3b8' }}>{act.time}</div>
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* Dynamic Sidebar: Events & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
           
           {/* Upcoming Events Module */}
           <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Calendar size={18} color="#f43f5e" /> Upcoming Events
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {upcomingEvents.map((ev, i) => (
                  <div key={i} style={{ padding: '16px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                     <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>{ev.title}</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}><Clock size={12} /> {ev.date}</div>
                  </div>
                ))}
              </div>
           </section>

           {/* Global Actions */}
           <section style={{ background: '#fff', borderRadius: '32px', padding: '32px', border: '2px solid #3b82f615' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <button 
                  onClick={() => navigate('/admin/events/add')}
                  style={{ width: '100%', padding: '14px', borderRadius: '16px', border: 'none', background: '#f43f5e', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                 >
                   <Plus size={16} /> Host Event
                 </button>
                 <button 
                  onClick={() => navigate('/admin/add-courses')}
                  style={{ width: '100%', padding: '14px', borderRadius: '16px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
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
