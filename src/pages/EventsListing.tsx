import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { eventsApi } from '../services/api';
import nestIcon from '../assets/nest_icon.png';
import StatusModal from '../components/StatusModal';

const EventsListing: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    title: '',
    message: '',
    confirmText: 'Okay',
    showConfirmOnly: true,
    onConfirm: undefined as (() => void) | undefined
  });

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

  const handleRegister = (event: any) => {
    setModalConfig({
      isOpen: true,
      type: 'info',
      title: 'Confirm Registration',
      message: `Are you sure you want to register for ${event.title}?`,
      confirmText: 'Confirm Registration',
      showConfirmOnly: false,
      onConfirm: () => handleConfirmRegistration(event.id)
    });
  };

  const handleConfirmRegistration = async (eventId: string) => {
    setRegistering(eventId);
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    try {
      const res = await eventsApi.registerForEvent(eventId);
      if (res.success) {
        setModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Registration Successful!',
          message: 'You have successfully registered for the event. We look forward to seeing you!',
          confirmText: 'Great',
          showConfirmOnly: true,
          onConfirm: undefined
        });
        fetchEvents();
      } else {
        setModalConfig({
          isOpen: true,
          type: 'error',
          title: 'Registration Failed',
          message: res.message || 'There was an issue processing your registration. Please try again.',
          confirmText: 'Okay',
          showConfirmOnly: true,
          onConfirm: undefined
        });
      }
    } catch (err) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Network Error',
        message: 'A connection error occurred. Please check your internet and try again.',
        confirmText: 'Okay',
        showConfirmOnly: true,
        onConfirm: undefined
      });
    } finally {
      setRegistering(null);
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
      style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem', fontFamily: '"Inter", sans-serif' }}
    >
      {/* Staggered Mosaic Featured Events Section */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 950, color: '#0d2046', letterSpacing: '-0.04em', lineHeight: '1' }}>
              Elite <span style={{ color: 'var(--primary)' }}>Gatherings</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.2rem', marginTop: '1rem' }}>Where innovation meets community.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', height: '500px' }}>
          {/* Main Hero Event Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            whileHover="hover"
            style={{ 
              flex: '2', 
              borderRadius: '40px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              background: '#0d2046'
            }}
          >
            <motion.img 
              variants={{ hover: { scale: 1.05 } }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80" 
              alt="Technical Summits" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <motion.div 
              variants={{ hover: { bottom: '3.5rem' } }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,32,70,0.9), transparent)' }} 
            />
            <motion.div 
              variants={{ hover: { y: -10 } }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'absolute', bottom: '3rem', left: '3rem' }}
            >
              <span style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', display: 'inline-block' }}>Featured</span>
              <h2 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900 }}>Technical Summits 2024</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>The future of engineering, decoded.</p>
            </motion.div>
          </motion.div>

          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Side Card 1 */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              whileHover="hover"
              style={{ 
                flex: '1', 
                borderRadius: '32px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                background: '#0d2046'
              }}
            >
              <motion.img 
                variants={{ hover: { scale: 1.1 } }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                src="https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=800&q=80" 
                alt="Networking Events" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,32,70,0.6)' }} />
              <motion.div 
                variants={{ hover: { scale: 1.05 } }}
                transition={{ duration: 0.4 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}
              >
                <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>Global Networking</h3>
              </motion.div>
            </motion.div>

            {/* Side Card 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover="hover"
              style={{ 
                flex: '1', 
                borderRadius: '32px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                background: '#0d2046'
              }}
            >
              <motion.img 
                variants={{ hover: { scale: 1.1 } }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80" 
                alt="Cultural Meets" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,32,70,0.6)' }} />
              <motion.div 
                variants={{ hover: { scale: 1.05 } }}
                transition={{ duration: 0.4 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}
              >
                <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>Cultural Meets</h3>
              </motion.div>
            </motion.div>
          </div>
        </div>
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


      {/* Events Grid/List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
           <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredEvents.map((event, index) => (
            <React.Fragment key={event.id}>
            <motion.div
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
                        onClick={() => handleRegister(event)}
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

            </React.Fragment>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '6rem 0', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '2px dashed #f1f5f9' }}>
           <Calendar style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} size={64} />
           <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d2046' }}>No events scheduled</h3>
           <p style={{ color: '#64748b' }}>Check back later for new opportunities.</p>
        </div>
      )}

      <StatusModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        showConfirmOnly={modalConfig.showConfirmOnly}
        onConfirm={modalConfig.onConfirm}
      />

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default EventsListing;

