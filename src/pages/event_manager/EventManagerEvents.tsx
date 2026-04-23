import React, { useState } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, 
  Calendar, MapPin, Users, Edit2, Trash2, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EventManagerEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const brandPrimary = '#4f46e5';

  const events = [
    { id: 1, title: 'Global Tech Summit 2026', category: 'Technology', date: '2026-10-24', location: 'Virtual', registrations: 450, capacity: 500, status: 'Active', image: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&auto=format&fit=crop&q=60' },
    { id: 2, title: 'Alumni Networking Night', category: 'Networking', date: '2026-11-12', location: 'Grand Plaza Hotel', registrations: 120, capacity: 200, status: 'Draft', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60' },
    { id: 3, title: 'Leadership & Strategy Workshop', category: 'Professional Development', date: '2026-12-05', location: 'NeST Innovation Hub', registrations: 85, capacity: 100, status: 'Active', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60' },
    { id: 4, title: 'Annual Charity Gala', category: 'Social', date: '2026-12-20', location: 'Seafront Pavilion', registrations: 310, capacity: 400, status: 'Active', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60' },
  ];

  const filteredEvents = activeTab === 'All' ? events : events.filter(e => e.status === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Manage Events</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Create, monitor and maintain your event portfolio.</p>
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
          <Plus size={18} /> Create Event
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Active', 'Draft', 'Past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab ? brandPrimary : 'transparent',
                color: activeTab === tab ? '#fff' : '#64748b',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search events..." 
              style={{ padding: '12px 16px 12px 48px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', width: '260px', outline: 'none' }}
            />
          </div>
          <button style={{ padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
        <AnimatePresence>
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }}
              style={{
                background: '#fff',
                borderRadius: '28px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: '200px' }}>
                <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: event.status === 'Active' ? '#16a34a' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: event.status === 'Active' ? '#16a34a' : '#64748b' }}></div>
                    {event.status}
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: brandPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    {event.category}
                  </div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>{event.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                      <Calendar size={16} /> {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                      <MapPin size={16} /> {event.location}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '14px' }}>
                      <Users size={16} /> {event.registrations} Registrations
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
                      {Math.round((event.registrations / event.capacity) * 100)}% Full
                    </div>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(event.registrations / event.capacity) * 100}%`, background: brandPrimary, borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Users size={16} /> Attendees
                  </button>
                  <button style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', cursor: 'pointer' }}>
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventManagerEvents;
