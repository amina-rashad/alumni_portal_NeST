import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { eventsApi } from '../services/api';

const EventsListing: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Webinar', 'Meetup', 'Workshop', 'Conference'];

  const fetchEvents = async () => {
    try {
      const res = await eventsApi.getAllEvents();
      const data = res.data as any;
      if (res.success && data && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    setMessage({ type: '', text: '' });
    try {
      const res = await eventsApi.registerForEvent(eventId);
      if (res.success) {
        setMessage({ type: 'success', text: 'Successfully registered!' });
        fetchEvents();
      } else {
        setMessage({ type: 'error', text: res.message || 'Registration failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setRegistering(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', fontFamily: '"Inter", sans-serif' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        <div>
           <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#0d2046', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
             Professional <span style={{ color: 'var(--primary)' }}>Events</span>
           </h1>

        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ 
                padding: '0.6rem 1.25rem', 
                borderRadius: '1rem', 
                fontSize: '0.875rem', 
                fontWeight: 800, 
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                backgroundColor: selectedCategory === cat ? 'var(--primary)' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                boxShadow: selectedCategory === cat ? '0 4px 12px rgba(200,16,46,0.2)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginBottom: '2rem', 
            padding: '1rem 1.5rem', 
            borderRadius: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            fontWeight: 700, 
            fontSize: '0.875rem',
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#15803d' : '#b91c1c',
            border: message.type === 'success' ? '1px solid #dcfce7' : '1px solid #fee2e2'
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
          {message.text}
        </motion.div>
      )}

      {/* Events Grid/List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
           <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredEvents.map((event) => (
            <motion.div 
              key={event.id}
              whileHover={{ x: 10 }}
              style={{ 
                background: '#ffffff', 
                borderRadius: '1.5rem', 
                overflow: 'hidden', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
                border: '1px solid #f1f5f9', 
                display: 'flex', 
                flexDirection: 'row', 
                transition: 'all 0.3s'
              }}
            >
              <div style={{ backgroundColor: '#0d2046', width: '180px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textAlign: 'center' }}>
                 <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{event.date.split(' ')[0]}</span>
                 <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>{event.date.split(' ')[1]}</span>
                 <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{event.category}</span>
                 </div>
              </div>

              <div style={{ padding: '2rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
                 <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0d2046', marginBottom: '0.75rem' }}>{event.title}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} style={{ color: 'var(--primary)' }} /> {event.time}</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} style={{ color: 'var(--primary)' }} /> {event.location}</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} style={{ color: 'var(--primary)' }} /> {event.attendees_count} Registered</span>
                    </div>
                    <p style={{ marginTop: '1rem', color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '600px' }}>
                       {event.description || "Join us for an insightful session featuring industry veterans and networking opportunities tailored for the NeST community."}
                    </p>
                 </div>

                 <div style={{ flexShrink: 0 }}>
                    {event.is_registered ? (
                      <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f0fdf4', color: '#15803d', fontWeight: 800, borderRadius: '1rem', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <CheckCircle2 size={18} /> Registered
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleRegister(event.id)}
                        disabled={registering === event.id}
                        style={{ 
                          padding: '1rem 1.5rem', 
                          backgroundColor: '#0d2046', 
                          color: '#ffffff', 
                          fontWeight: 800, 
                          borderRadius: '1rem', 
                          boxShadow: '0 4px 12px rgba(13,32,70,0.2)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9rem'
                        }}
                      >
                         {registering === event.id ? 'Registering...' : 'Register Now'} <ChevronRight size={18} />
                      </button>
                    )}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '6rem 0', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '2px dashed #f1f5f9' }}>
           <Calendar style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} size={64} />
           <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d2046' }}>No events scheduled</h3>
           <p style={{ color: '#64748b' }}>Check back later for new opportunities.</p>
        </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default EventsListing;

