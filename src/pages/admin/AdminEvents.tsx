import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, MoreVertical, 
  MapPin, Users, Clock
} from 'lucide-react';

const AdminEvents: React.FC = () => {
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      name: 'Annual Alumni Meetup 2026',
      location: 'Grand Hall, Main Campus',
      date: 'March 15, 2026',
      time: '10:00 AM - 04:00 PM',
      status: 'Active',
      registrations: 124,
      image: 'https://images.unsplash.com/photo-1540575861501-7ad05823c28b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 2,
      name: 'Tech Career Fair',
      location: 'Virtual Event',
      date: 'April 05, 2026',
      time: '02:00 PM - 06:00 PM',
      status: 'Pending',
      registrations: 86,
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 3,
      name: 'Leadership Workshop',
      location: 'Conference Room B',
      date: 'April 22, 2026',
      time: '09:00 AM - 12:00 PM',
      status: 'Closed',
      registrations: 45,
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Event Management</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Manage and schedule upcoming events for the community.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/events/add')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)'
          }}
        >
          <Plus size={18} />
          Create Event
        </button>
      </div>

      {/* Search and Filter */}
      <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input 
            type="text" 
            placeholder="Search events..." 
            style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }} 
          />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Events List */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Event Details</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date & Time</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Registrations</th>
              <th style={{ padding: '16px 24px' }}></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={event.image} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{event.name}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {event.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{event.date}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {event.time}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '20px', 
                    background: event.status === 'Active' ? '#dcfce7' : event.status === 'Pending' ? '#fef9c3' : '#f1f5f9', 
                    color: event.status === 'Active' ? '#16a34a' : event.status === 'Pending' ? '#a16207' : '#64748b', 
                    fontSize: '12px', fontWeight: 600 
                  }}>
                    {event.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="#64748b" />
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>{event.registrations} Attending</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEvents;
