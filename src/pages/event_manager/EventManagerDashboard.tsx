import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, MousePointer2, TrendingUp, 
  BarChart3, Clock, MapPin, ChevronRight, FileText, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { eventManagerApi } from '../../services/api';

const StatCard: React.FC<{
  title: string;
  value: string;
  change?: string;
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
      {change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', fontWeight: 700 }}>
          <TrendingUp size={14} /> {change}
        </div>
      )}
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

const isEventOver = (dateStr: string, timeStr?: string) => {
  if (!dateStr) return false;
  try {
    let timePart = timeStr || "00:00";
    timePart = timePart.trim();
    const match = timePart.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    let hours = 0;
    let minutes = 0;
    if (match) {
      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
      const ampm = match[3];
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) {
          hours += 12;
        } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
      }
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);
    return eventDate < new Date();
  } catch (e) {
    const todayStr = new Date().toISOString().split('T')[0];
    return dateStr < todayStr;
  }
};

const EventManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const brandPrimary = '#233167';
  const [stats, setStats] = useState<any>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentCertificates, setRecentCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes, certRes] = await Promise.all([
          eventManagerApi.getStats(),
          eventManagerApi.getUpcomingEvents(),
          eventManagerApi.getRecentCertificates()
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data.stats);
          setDistribution(statsRes.data.distribution);
        }

        if (eventsRes.success && eventsRes.data) {
          const rawEvents = eventsRes.data.events || [];
          const mappedEvents = rawEvents.map((e: any) => {
            let status = e.status || 'Active';
            if (e.status === 'Active' && isEventOver(e.date, e.time)) {
              status = 'Past';
            }
            return { ...e, status };
          });
          // Filter out past events so only actual upcoming ones are shown in this list!
          const upcomingOnly = mappedEvents.filter((e: any) => e.status === 'Active');
          const sortedEvents = upcomingOnly.sort((a: any, b: any) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setUpcomingEvents(sortedEvents);
        }

        if (certRes.success && certRes.data) {
          setRecentCertificates(certRes.data.certificates || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalParticipants = distribution.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  const buildConicGradient = () => {
    if (totalParticipants === 0) return 'none';
    let acc = 0;
    const parts: string[] = [];
    distribution.forEach((item) => {
      const val = Number(item.value) || 0;
      if (val > 0) {
        const startDeg = (acc / totalParticipants) * 360;
        acc += val;
        const endDeg = (acc / totalParticipants) * 360;
        parts.push(`${item.color || '#3b82f6'} ${startDeg}deg ${endDeg}deg`);
      }
    });
    return parts.length > 0 ? `conic-gradient(${parts.join(', ')})` : 'none';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Event Governance Portal</h1>
        <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Global event oversight and participant engagement analytics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Events" value={stats?.total_events !== undefined ? String(stats.total_events) : "0"} icon={<Calendar size={24} />} color="#233167" loading={isLoading} />
        <StatCard title="Active Participants" value={stats?.active_participants !== undefined ? stats.active_participants.toLocaleString() : "0"} icon={<Users size={24} />} color="#10b981" loading={isLoading} />
        <StatCard title="Engagement Rate" value={stats?.engagement_rate || "0%"} icon={<TrendingUp size={24} />} color="#ec4899" loading={isLoading} />
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
               {recentCertificates.length > 0 ? recentCertificates.map((cert, idx) => (
                 <div key={cert.id || idx} style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < recentCertificates.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                       <div style={{ padding: '10px', background: 'rgba(35, 49, 103, 0.05)', color: brandPrimary, borderRadius: '12px' }}>
                         <FileText size={20} />
                       </div>
                       <div>
                         <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{cert.user_name} - Certificate</div>
                         <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{cert.event_name} • {cert.date}</div>
                       </div>
                    </div>
                    <div style={{ padding: '4px 12px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 800 }}>
                       ISSUED
                    </div>
                 </div>
               )) : (
                 <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No certificates issued recently.</div>
               )}
            </div>
          </section>
        </div>

        {/* Quick Analytics / Dynamic Donut Chart */}
        <section style={{ background: brandDark, borderRadius: '32px', color: '#fff', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800 }}>Participant Status</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Distribution of participants across user types</p>
          </div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '190px' }}>
            <div style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: totalParticipants > 0 ? buildConicGradient() : 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: totalParticipants > 0 ? '0 8px 24px rgba(0,0,0,0.25)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              {/* Inner Circle Cutout for Donut */}
              <div style={{
                width: '144px',
                height: '144px',
                borderRadius: '50%',
                background: brandDark,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                  {totalParticipants}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {totalParticipants === 1 ? 'Participant' : 'Participants'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} style={{ height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} className="skeleton-pulse" />)
            ) : distribution.length > 0 ? (
              distribution.map((item) => {
                const count = Number(item.value) || 0;
                const pct = totalParticipants > 0 ? Math.round((count / totalParticipants) * 100) : 0;
                return (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: item.color || '#fff' }}></div>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>
                      {count} <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>({pct}%)</span>
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>No distribution data</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const brandDark = '#233167';

export default EventManagerDashboard;
