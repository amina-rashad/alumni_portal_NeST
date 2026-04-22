import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Calendar, Clock, MapPin, Users,
  Globe, Edit3, MoreVertical, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';

interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  attendees_count: number;
  max_attendees: number;
  status?: 'Upcoming' | 'Completed' | 'Cancelled';
  thumbnail?: string;
}

const AdminEvents: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // NeST NAVY BLUE
  const nestNavy = '#1a2652';

  const fetchEvents = async () => {
    try {
      const res = await adminApi.getEvents();
      if (res.success && res.data?.events) {
        setEvents(res.data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return { bg: 'rgba(26, 38, 82, 0.08)', color: nestNavy }; 
      case 'Completed': return { bg: '#dcfce7', color: '#16a34a' };
      case 'Cancelled': return { bg: '#fee2e2', color: '#dc2626' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Event Governance</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>Plan and manage platform-wide alumni and professional events.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/events/add')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: nestNavy, border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.25)' }}
        >
          <Plus size={20} /> Create Event
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '10px 20px', maxWidth: '450px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Search size={20} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Search for events..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', color: '#1e293b', background: 'transparent', fontWeight: 500 }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', width: '100%', color: nestNavy }}>Loading events...</div>
        ) : filteredEvents.map((event, i) => {
          const statusStyle = getStatusColor(event.status || 'Upcoming');
          return (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(26, 38, 82, 0.04)', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '24px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `linear-gradient(135deg, ${nestNavy} 0%, #0f172a 100%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>
                    {event.thumbnail || event.title.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '6px', borderRadius: '10px', border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}><Edit3 size={18} /></button>
                    <button style={{ padding: '6px', borderRadius: '10px', border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                  </div>
                </div>

                <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '8px', background: 'rgba(26, 38, 82, 0.05)', color: nestNavy, fontSize: '11px', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.05em' }}>
                  {event.category.toUpperCase()}
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 16px 0', lineHeight: 1.3 }}>{event.title}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                    <Calendar size={16} color={nestNavy} />
                    {event.date} at {event.time}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                    <MapPin size={16} color={nestNavy} />
                    {event.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                    <Users size={16} color={nestNavy} />
                    <span style={{ fontWeight: 800, color: '#1e293b' }}>{(event.attendees_count || 0).toLocaleString()}</span>
                    <span style={{ color: '#94a3b8' }}> / {event.max_attendees > 0 ? event.max_attendees : '∞'} Seats Taken</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#fcfdfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color }}>
                   {event.status || 'Upcoming'}
                </span>
                <button style={{ color: nestNavy, background: 'transparent', border: 'none', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   View Details <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminEvents;
