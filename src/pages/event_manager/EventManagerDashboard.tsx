import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, MousePointer2, TrendingUp, 
  ArrowUpRight, Clock, MapPin, ChevronRight
} from 'lucide-react';

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, icon, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    style={{
      background: '#fff',
      padding: '24px',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ padding: '12px', borderRadius: '16px', background: `${color}10`, color }}>
        {icon}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', fontWeight: 700 }}>
        <TrendingUp size={14} /> {change}
      </div>
    </div>
    <div>
      <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{value}</div>
    </div>
  </motion.div>
);

const EventManagerDashboard: React.FC = () => {
  const brandPrimary = '#4f46e5';

  const upcomingEvents = [
    { id: 1, title: 'Global Tech Summit 2026', date: 'Oct 24, 2026', time: '10:00 AM', location: 'Virtual', registrations: 450, status: 'Active' },
    { id: 2, title: 'Alumni Networking Night', date: 'Nov 12, 2026', time: '06:30 PM', location: 'Grand Plaza', registrations: 120, status: 'Draft' },
    { id: 3, title: 'Leadership Workshop', date: 'Dec 05, 2026', time: '02:00 PM', location: 'NeST HQ', registrations: 85, status: 'Active' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Welcome back, Event Manager</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Here's what's happening with your events today.</p>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          borderRadius: '14px',
          background: brandPrimary,
          color: '#fff',
          border: 'none',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)'
        }}>
          Create New Event <ArrowUpRight size={18} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Events" value="12" change="+2" icon={<Calendar size={24} />} color="#4f46e5" />
        <StatCard title="Active Registrations" value="1,280" change="+15%" icon={<Users size={24} />} color="#10b981" />
        <StatCard title="Page Views" value="45.2K" change="+24%" icon={<MousePointer2 size={24} />} color="#f59e0b" />
        <StatCard title="Engagement Rate" value="68%" change="+5%" icon={<TrendingUp size={24} />} color="#ec4899" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '32px' }}>
        {/* Upcoming Events List */}
        <section style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Upcoming Managed Events</h3>
            <button style={{ background: 'none', border: 'none', color: brandPrimary, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div style={{ padding: '16px' }}>
            {upcomingEvents.map((event) => (
              <div key={event.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                padding: '16px 24px',
                borderRadius: '20px',
                transition: 'background 0.2s',
                cursor: 'pointer'
              }} className="hover-highlight">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px' }}>{event.title}</div>
                  <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {event.date} at {event.time}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {event.location}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{event.registrations}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Registrations</div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: event.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                    color: event.status === 'Active' ? '#16a34a' : '#64748b',
                    border: `1px solid ${event.status === 'Active' ? '#dcfce7' : '#e2e8f0'}`
                  }}>
                    {event.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Analytics / Pie Chart Placeholder */}
        <section style={{ background: brandDark, borderRadius: '32px', color: '#fff', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800 }}>Registration Status</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Distribution of attendees across user types</p>
          </div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', border: '12px solid rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>84%</div>
              <div style={{ position: 'absolute', top: '-12px', left: '-12px', right: '-12px', bottom: '-12px', border: '12px solid #4f46e5', borderRadius: '50%', clipPath: 'polygon(50% 50%, -20% -20%, 120% -20%, 120% 120%)', transform: 'rotate(20deg)' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Alumni', value: '650', color: '#4f46e5' },
              { label: 'Interns', value: '420', color: '#10b981' },
              { label: 'Others', value: '210', color: '#f59e0b' }
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: item.color }}></div>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const brandDark = '#312e81';

export default EventManagerDashboard;
