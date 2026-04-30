import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, MapPin, Clock, 
  Share2, Download, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../services/api';
import StatusModal from '../components/StatusModal';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'Online' | 'In-Person' | 'Hybrid';
  status: 'Registered' | 'Attended' | 'Missed' | 'Cancelled';
  thumbnail: string;
  countdown?: string;
}

const MOCK_MY_EVENTS: Event[] = [
  { id: '1', title: 'Global Alumni Tech Summit 2026', date: 'April 15, 2026', time: '10:00 AM - 4:00 PM', location: 'NeST Innovation Hub, Kochi', type: 'Hybrid', status: 'Registered', thumbnail: 'https://images.unsplash.com/photo-1540575861501-7ad05823c95b?auto=format&fit=crop&q=80&w=400', countdown: '18 Days to go' },
  { id: '2', title: 'Career Pivot: AI Engineering', date: 'April 22, 2026', time: '6:30 PM - 8:00 PM', location: 'Zoom Webinar', type: 'Online', status: 'Registered', thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400', countdown: '25 Days to go' },
  { id: '3', title: 'NeST Annual Networking Gala', date: 'March 10, 2026', time: '7:00 PM - 10:00 PM', location: 'The Grand Ballroom, Bangalore', type: 'In-Person', status: 'Attended', thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400' },
  { id: '4', title: 'System Design for Scale: Go vs Rust', date: 'Feb 15, 2026', time: '11:00 AM', location: 'Virtual', type: 'Online', status: 'Attended', thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400' },
];

const MyEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsApi.getMyEvents();
      if (res.success && res.data?.events) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error("Failed to fetch my events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activeTab === 'upcoming') {
      return eventDate >= today;
    } else {
      return eventDate < today;
    }
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAction = (type: 'share' | 'certificate' | 'recording') => {
    const configs = {
      share: { title: 'Share Event', message: 'The event link has been copied to your clipboard. You can now share it with your network!' },
      certificate: { title: 'Certificate Issued', message: 'Your certificate for this event is now available. Download will start automatically.' },
      recording: { title: 'Access Recording', message: 'You are being redirected to the event recording. Enjoy the session!' }
    };

    setModalConfig({
      isOpen: true,
      type: 'success',
      title: configs[type].title,
      message: configs[type].message,
      confirmText: 'Awesome',
      showConfirmOnly: true,
      onConfirm: undefined
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: '3rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                My <span style={{ color: '#d32f2f' }}>Events</span>
              </h1>

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
        <AnimatePresence mode="popLayout">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #d32f2f', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
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
              <div style={{ position: 'relative', height: '180px', background: '#0d2046', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {event.cover_image ? (
                  <img src={event.cover_image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Calendar size={48} color="rgba(255,255,255,0.2)" />
                )}
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
                    {event.category}
                  </div>
                </div>
                {activeTab === 'upcoming' && (
                   <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                     <div style={{ background: '#d32f2f', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                        Upcoming Session
                     </div>
                   </div>
                )}
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
                    <button 
                      onClick={() => handleAction('share')}
                      style={{ flex: 1, background: '#F1F5F9', borderRadius: '10px', border: 'none', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0.75rem', fontWeight: 700, gap: '0.5rem' }}
                    >
                      <Share2 size={18} /> Share Event
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleAction('certificate')}
                        style={{ flex: 1, background: '#F1F5F9', color: '#0F172A', padding: '0.75rem', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <Download size={18} /> Certificate
                      </button>
                      <button 
                        onClick={() => handleAction('recording')}
                        style={{ flex: 1, background: 'transparent', border: '1.5px solid #E2E8F0', color: '#64748B', padding: '0.75rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        Watch Recording
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
             <Calendar size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
             <h3 style={{ color: '#0F172A', fontWeight: 700 }}>No {activeTab} events found</h3>
             <p style={{ color: '#64748B' }}>{activeTab === 'upcoming' ? "You haven't registered for any upcoming events yet." : "You don't have any past events in your history."}</p>
          </div>
        )}
        </AnimatePresence>
      </div>

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

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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
