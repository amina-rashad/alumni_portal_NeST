import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, MapPin, Clock, 
  Share2, 
  Download,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventsApi, usersApi } from '../services/api';
import { generateEventCertificate } from '../utils/CertificateGenerator';


const MyEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, profileRes] = await Promise.all([
        eventsApi.getMyEvents(),
        usersApi.getProfile()
      ]);
      
      if (eventsRes.success && eventsRes.data) {
        setEvents((eventsRes.data as any).events || []);
      }
      
      if (profileRes.success && profileRes.data) {
        setUserProfile((profileRes.data as any).user);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadCertificate = (event: any) => {
    if (!userProfile) {
      alert("User profile not loaded. Please try again.");
      return;
    }
    
    generateEventCertificate(
      userProfile.full_name || userProfile.name || 'NeST Digital Member',
      event.title,
      event.date
    );
  };

  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const now = new Date();
    return activeTab === 'upcoming' ? eventDate >= now : eventDate < now;
  });

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
              <div style={{ position: 'relative', aspectRatio: '16/9' }}>
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
                    {event.mode || 'Hybrid'}
                  </div>
                </div>
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
                      onClick={() => {
                        const url = `${window.location.origin}/events/${event.id}`;
                        if (navigator.share) {
                          navigator.share({
                            title: event.title,
                            text: `Check out this event: ${event.title}`,
                            url: url,
                          }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(url);
                          alert('Event link copied to clipboard!');
                        }
                      }}
                      style={{ flex: 1, background: '#F1F5F9', borderRadius: '10px', border: 'none', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0.75rem', fontWeight: 700, gap: '0.5rem' }}
                    >
                      <Share2 size={18} /> Share Event
                    </button>
                  ) : (
                      <button 
                        onClick={() => handleDownloadCertificate(event)}
                        disabled={!event.is_certificate_issued}
                        style={{ 
                          flex: 1, 
                          background: event.is_certificate_issued ? '#f0fdf4' : '#F1F5F9', 
                          color: event.is_certificate_issued ? '#166534' : '#94a3b8', 
                          padding: '0.75rem', 
                          borderRadius: '10px', 
                          border: event.is_certificate_issued ? '1px solid #bbf7d0' : 'none', 
                          fontWeight: 700, 
                          cursor: event.is_certificate_issued ? 'pointer' : 'not-allowed', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.5rem' 
                        }}
                      >
                        {event.is_certificate_issued ? <Award size={18} /> : <Download size={18} />}
                        {event.is_certificate_issued ? 'Download Certificate' : 'Certificate Pending'}
                      </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
