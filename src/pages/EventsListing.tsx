import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { eventsApi } from '../services/api';
import nestIcon from '../assets/nest_icon.png';

const EventsListing: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [selectedEventForModal, setSelectedEventForModal] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
        setShowSuccessModal(true);
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

  const filteredEvents = (selectedCategory === 'All' 
    ? events 
    : events.filter(e => e.category === selectedCategory))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
           <p style={{ color: '#64748b', fontSize: '1.15rem', maxWidth: '600px', lineHeight: '1.6' }}>
             Expand your horizons through networking mixers, technical workshops, and global alumni summits.
           </p>
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
                 <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                   {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : ''}
                 </span>
                 <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>
                   {event.date ? new Date(event.date).getDate() : ''}
                 </span>
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
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <Users size={16} style={{ color: 'var(--primary)' }} /> 
                         {event.max_attendees > 0 
                           ? `${event.max_attendees - event.attendees_count} Seats Available`
                           : `${event.attendees_count} Registered`}
                       </span>
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
                    ) : (event.max_attendees > 0 && event.attendees_count >= event.max_attendees) ? (
                      <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#fef2f2', color: '#b91c1c', fontWeight: 800, borderRadius: '1rem', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <AlertCircle size={18} /> Sold Out
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSelectedEventForModal(event)}
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

      {/* Confirmation & Success Modals */}
      <AnimatePresence>
        {(selectedEventForModal || showSuccessModal) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!registering) {
                setSelectedEventForModal(null);
                setShowSuccessModal(false);
              }
            }}
            style={{ 
              position: 'fixed', inset: 0, 
              background: 'rgba(15, 23, 42, 0.7)', 
              backdropFilter: 'blur(8px)', 
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: 'white', borderRadius: '2.5rem', width: '100%', maxWidth: '420px', 
                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)', 
                textAlign: 'center', overflow: 'hidden', padding: '3.5rem 2rem'
              }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <img src={nestIcon} alt="NeST" style={{ height: '80px', width: 'auto', margin: '0 auto' }} />
              </div>

              {showSuccessModal ? (
                <>
                  <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0d2046', marginBottom: '1.5rem', fontFamily: 'serif' }}>Registration Success!</h2>
                  <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: '1.6' }}>
                    You have successfully registered for the event. We look forward to seeing you!
                  </p>
                  <button 
                    onClick={() => setShowSuccessModal(false)}
                    style={{ 
                      width: '100%', padding: '1.25rem', borderRadius: '1.25rem', 
                      background: '#C8102E', color: '#ffffff', fontWeight: 800, 
                      border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                      boxShadow: '0 10px 20px rgba(200, 16, 46, 0.2)', transition: 'all 0.2s'
                    }}
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0d2046', marginBottom: '1.5rem', fontFamily: 'serif' }}>Confirm Registration</h2>
                  <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: '1.6' }}>
                    Are you sure you want to register for <br/><strong style={{ color: '#0d2046' }}>{selectedEventForModal.title}</strong>?
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => setSelectedEventForModal(null)}
                      style={{ flex: 1, padding: '1.25rem', borderRadius: '1.25rem', background: '#f1f5f9', color: '#475569', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        handleRegister(selectedEventForModal.id);
                        setSelectedEventForModal(null);
                      }}
                      disabled={registering !== null}
                      style={{ 
                        flex: 1, padding: '1.25rem', borderRadius: '1.25rem', 
                        background: '#C8102E', color: '#ffffff', fontWeight: 800, 
                        border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                        boxShadow: '0 10px 20px rgba(200, 16, 46, 0.2)'
                      }}
                    >
                      {registering ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default EventsListing;

