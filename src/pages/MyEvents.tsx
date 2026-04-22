import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, MapPin, Clock, 
  Ticket, Share2, 
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../services/api';

const MyEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        const res = await eventsApi.getAllEvents();
        const data = res.data as any;
        if (res.success && data && data.events) {
          // Filter only registered events
          setEvents(data.events.filter((e: any) => e.is_registered));
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegisteredEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const isPast = eventDate < today;
    if (activeTab === 'upcoming') return !isPast;
    return isPast;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: '3rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            to="/dashboard" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                My <span style={{ color: '#d32f2f' }}>Events</span>
              </h1>
              <p style={{ color: '#64748B', fontSize: '1.1rem' }}>Manage your registrations and view your event history.</p>
            </div>
            
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.4rem', borderRadius: '14px', gap: '0.25rem' }}>
              <button 
                onClick={() => setActiveTab('upcoming')}
                style={{ 
                  padding: '0.6rem 1.25rem', 
                  borderRadius: '10px', 
                  border: 'none',
                  background: activeTab === 'upcoming' ? '#fff' : 'transparent',
                  color: activeTab === 'upcoming' ? '#0F172A' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'upcoming' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                style={{ 
                  padding: '0.6rem 1.25rem', 
                  borderRadius: '10px', 
                  border: 'none',
                  background: activeTab === 'past' ? '#fff' : 'transparent',
                  color: activeTab === 'past' ? '#0F172A' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'past' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Past Events
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Events Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
           <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #d32f2f', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', background: '#F8FAFC', borderRadius: '24px' }}>
          <p style={{ color: '#64748B', fontSize: '1.1rem', fontWeight: 600 }}>No events found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, index) => (
              <motion.div
              layout
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="luxury-card"
              style={{ overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
            >
              {/* Thumbnail with Overlay */}
              <div style={{ position: 'relative', height: '180px' }}>
                <img src={event.cover_image || 'https://images.unsplash.com/photo-1540575861501-7ad05823c95b?auto=format&fit=crop&q=80&w=400'} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.9)', 
                    backdropFilter: 'blur(4px)', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '8px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    color: '#0F172A',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {(event.location?.toLowerCase().includes('virtual') || event.location?.toLowerCase().includes('zoom')) ? 'Online' : 'In-Person'}
                  </div>
                </div>
                {(() => {
                  const eventDate = new Date(event.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diffTime = eventDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  if (diffDays >= 0) {
                    return (
                      <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                        <div style={{ 
                          background: '#d32f2f', 
                          color: 'white', 
                          padding: '0.4rem 0.8rem', 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: 800,
                          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
                        }}>
                          {diffDays === 0 ? 'Happening Today' : `${diffDays} Days to go`}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.4 }}>{event.title}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748B', fontSize: '0.9rem' }}>
                    <Calendar size={16} /> {event.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748B', fontSize: '0.9rem' }}>
                    <Clock size={16} /> {event.time}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748B', fontSize: '0.9rem' }}>
                    <MapPin size={16} /> {event.location}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                   {activeTab === 'upcoming' ? (
                    <>
                      <button style={{ width: '44px', height: '44px', background: '#F1F5F9', borderRadius: '10px', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Share2 size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => alert('Certificate download initiated.')}
                        style={{ flex: 1, background: '#F1F5F9', color: '#0F172A', padding: '0.75rem', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <Download size={18} /> Certificate
                      </button>
                      <button 
                        onClick={() => alert('Opening recording player...')}
                        style={{ flex: 1, background: 'transparent', border: '1.5px solid #E2E8F0', color: '#64748B', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        Watch Recording
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}

      {/* Ticket Modal (Mockup) Removed */}

      <style>{`
        .luxury-card {
          background: #ffffff;
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>
    </div>
  );
};

export default MyEvents;
