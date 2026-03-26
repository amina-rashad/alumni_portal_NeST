import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Calendar, Clock, MapPin, Users,
  CheckCircle2, X, Globe, Edit3, MoreVertical, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  category: 'Networking' | 'Workshop' | 'Seminar' | 'Social';
  date: string;
  time: string;
  location: string;
  attendees: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  thumbnail: string;
}

const AdminEvents: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy Event Data
  const [events] = useState<Event[]>([
    { id: '1', title: 'Annual Alumni Homecoming 2026', category: 'Social', date: '2026-05-15', time: '18:00', location: 'Grand Ballroom, NeST Tech Park', attendees: 450, status: 'Upcoming', thumbnail: 'AH' },
    { id: '2', title: 'Advanced AI & Machine Learning Workshop', category: 'Workshop', date: '2026-04-10', time: '10:00', location: 'Virtual Zoom Session', attendees: 128, status: 'Upcoming', thumbnail: 'AI' },
    { id: '3', title: 'Global Career Opportunities Seminar', category: 'Seminar', date: '2026-03-20', time: '14:30', location: 'Auditorium A, Engineering Block', attendees: 312, status: 'Completed', thumbnail: 'GC' },
    { id: '4', title: 'Startup Pitch & Networking Mixer', category: 'Networking', date: '2026-04-25', time: '17:00', location: 'Innovation Hub Lounge', attendees: 85, status: 'Upcoming', thumbnail: 'SN' },
    { id: '5', title: 'Corporate Leadership Mentorship', category: 'Workshop', date: '2026-02-28', time: '11:00', location: 'Board Room 4, Corporate Plaza', attendees: 45, status: 'Completed', thumbnail: 'LM' }
  ]);

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return { bg: '#e0e7ff', color: '#1e3a8a' }; /* Navy blue text */
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
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: '#1e3a8a', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)' }}
        >
          <Plus size={20} /> Create Event
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '10px 20px', maxWidth: '450px' }}>
        <Search size={20} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Search for events..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', color: '#1e293b', background: 'transparent' }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {filteredEvents.map((event, i) => {
          const statusStyle = getStatusColor(event.status);
          return (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '24px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800 }}>
                    {event.thumbnail}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '4px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}><Edit3 size={18} /></button>
                    <button style={{ padding: '4px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                  </div>
                </div>

                <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '8px', background: '#f8fafc', color: '#64748b', fontSize: '12px', fontWeight: 700, marginBottom: '12px', letterSpacing: '0.05em' }}>
                  {event.category.toUpperCase()}
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 16px 0', lineHeight: 1.3 }}>{event.title}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                    <Calendar size={16} color="#1e3a8a" />
                    {event.date} at {event.time}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                    <MapPin size={16} color="#1e3a8a" />
                    {event.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                    <Users size={16} color="#1e3a8a" />
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{event.attendees.toLocaleString()}</span> Registered
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#fcfdfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color }}>
                  {event.status}
                </span>
                <span style={{ color: '#1e3a8a', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   View Details <ChevronRight size={14} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminEvents;
