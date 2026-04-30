import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, MousePointer2, TrendingUp, 
  BarChart3, Clock, MapPin, ChevronRight, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { eventManagerApi } from '../../services/api';

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}> = ({ title, value, change, icon, color, loading }) => (
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
      {loading ? (
        <div style={{ height: '34px', width: '80px', background: '#f1f5f9', borderRadius: '8px' }} className="skeleton-pulse" />
      ) : (
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{value}</div>
      )}
    </div>
  </motion.div>
);

const EventManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const brandPrimary = '#233167';
  const [stats, setStats] = useState<any>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          eventManagerApi.getStats(),
          eventManagerApi.getUpcomingEvents()
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data.stats);
          setDistribution(statsRes.data.distribution);
        }

        if (eventsRes.success && eventsRes.data) {
          setUpcomingEvents(eventsRes.data.events);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Event Governance Portal</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Global event oversight and participant engagement analytics.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Events" value={stats?.total_events || "0"} change="+2" icon={<Calendar size={24} />} color="#233167" loading={isLoading} />
        <StatCard title="Active Participants" value={stats?.active_participants?.toLocaleString() || "0"} change="+15%" icon={<Users size={24} />} color="#10b981" loading={isLoading} />
        <StatCard title="Page Views" value={stats?.page_views || "45.2K"} change="+24%" icon={<MousePointer2 size={24} />} color="#f59e0b" loading={isLoading} />
        <StatCard title="Engagement Rate" value={stats?.engagement_rate || "68%"} change="+5%" icon={<TrendingUp size={24} />} color="#ec4899" loading={isLoading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Upcoming Events List */}
          <section style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Upcoming Managed Events</h3>
              <button 
                onClick={() => navigate('/event-manager/events')}
                style={{ background: 'none', border: 'none', color: brandPrimary, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div style={{ padding: '16px' }}>
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} style={{ height: '70px', margin: '10px', background: '#f8fafc', borderRadius: '16px' }} className="skeleton-pulse" />)
              ) : upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
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
              )) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No upcoming events found.</div>
              )}
            </div>
          </section>

          {/* Generated Documents Section */}
          <section style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Recent Reports & Documents</h3>
              <button 
                onClick={() => navigate('/event-manager/reports')}
                style={{ background: 'none', border: 'none', color: brandPrimary, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View Analytics <BarChart3 size={16} />
              </button>
            </div>
            <div style={{ padding: '16px' }}>
               {[
                 { name: 'Annual Alumni Meet Final Report', date: 'March 20, 2024', size: '2.4 MB' },
                 { name: 'Technical Workshop Registration List', date: 'March 18, 2024', size: '1.1 MB' },
               ].map((file, idx) => (
                 <div key={idx} style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx === 0 ? '1px solid #f8fafc' : 'none' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ padding: '10px', background: 'rgba(35, 49, 103, 0.05)', color: brandPrimary, borderRadius: '12px' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{file.name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{file.date} • {file.size}</div>
                      </div>
                   </div>
                   <button style={{ padding: '8px 16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                      Download
                   </button>
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* Quick Analytics / Pie Chart Placeholder */}
        <section style={{ background: brandDark, borderRadius: '32px', color: '#fff', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800 }}>Participant Status</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Distribution of participants across user types</p>
          </div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', border: '12px solid rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>84%</div>
              <div style={{ position: 'absolute', top: '-12px', left: '-12px', right: '-12px', bottom: '-12px', border: '12px solid #0ea5e9', borderRadius: '50%', clipPath: 'polygon(50% 50%, -20% -20%, 120% -20%, 120% 120%)', transform: 'rotate(20deg)' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} style={{ height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} className="skeleton-pulse" />)
            ) : distribution.map((item) => (
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

const brandDark = '#233167';

export default EventManagerDashboard;
