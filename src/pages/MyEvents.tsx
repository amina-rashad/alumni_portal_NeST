import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, MapPin, Clock, 
  Share2, 
  Download,
  Award,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventsApi, usersApi } from '../services/api';
import { generateEventCertificate } from '../utils/CertificateGenerator';
import CertificateProgressButton from '../components/CertificateProgressButton';


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


  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const now = new Date();
    return activeTab === 'upcoming' ? eventDate >= now : eventDate < now;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '5rem' }}>
      
      {/* Dynamic Hero Banner */}
      <section style={{ 
        position: 'relative', 
        width: '100%', 
        height: '450px', 
        overflow: 'hidden',
        background: '#0F172A',
        marginBottom: '4rem'
      }}>
        {/* Background Image with Parallax & Dark Overlay */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        >
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.9))',
            zIndex: 1
          }} />
        </motion.div>

        {/* Animated Light Streaks */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '200%', opacity: [0, 0.3, 0] }}
              transition={{ 
                duration: 5, 
                delay: i * 2, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{
                position: 'absolute',
                top: `${20 + i * 25}%`,
                width: '600px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                transform: 'skewX(-45deg)'
              }}
            />
          ))}
        </div>

        {/* Floating Particles (Simplified CSS Particles) */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -40, 0], 
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 3 + Math.random() * 4, 
                repeat: Infinity, 
                delay: Math.random() * 5 
              }}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: '#60A5FA',
                borderRadius: '50%',
                boxShadow: '0 0 10px #60A5FA'
              }}
            />
          ))}
        </div>

        {/* Abstract Wave Pattern (SVG) */}
        <div style={{ position: 'absolute', bottom: -2, left: 0, width: '100%', zIndex: 1, opacity: 0.15 }}>
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path fill="#3b82f6" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        {/* Content Container */}
        <div style={{ 
          position: 'relative', 
          zIndex: 2, 
          maxWidth: '1100px', 
          margin: '0 auto', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          padding: '0 2rem'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ position: 'relative' }}
          >
            {/* Glass Background Layer for Text */}
            <div style={{
              position: 'absolute',
              inset: '-2rem -3rem',
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1), transparent 70%)',
              filter: 'blur(40px)',
              zIndex: -1
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
               <div style={{ width: '40px', height: '2px', background: '#3b82f6' }} />
               <span style={{ color: '#60A5FA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: '0.85rem' }}>Experience NeST</span>
            </div>
            
            <h1 style={{ 
              fontSize: '5.5rem', 
              fontWeight: 900, 
              color: '#FFFFFF', 
              letterSpacing: '-0.05em', 
              margin: 0,
              lineHeight: 0.9
            }}>
              My <span style={{ 
                color: '#c8102e',
                fontStyle: 'italic',
                fontFamily: '"Playfair Display", serif'
              }}>Events</span>
            </h1>

            {/* Glassmorphism Tab Controls */}
            <div style={{ 
              marginTop: '3.5rem',
              display: 'flex', 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(20px)',
              padding: '0.5rem', 
              borderRadius: '24px', 
              gap: '0.5rem',
              width: 'fit-content',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
            }}>
              <button 
                onClick={() => setActiveTab('upcoming')}
                style={{ 
                  padding: '0.8rem 2.5rem', 
                  borderRadius: '18px', 
                  border: 'none',
                  background: activeTab === 'upcoming' ? '#fff' : 'transparent',
                  color: activeTab === 'upcoming' ? '#0F172A' : '#fff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  boxShadow: activeTab === 'upcoming' ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                style={{ 
                  padding: '0.8rem 2.5rem', 
                  borderRadius: '18px', 
                  border: 'none',
                  background: activeTab === 'past' ? '#fff' : 'transparent',
                  color: activeTab === 'past' ? '#0F172A' : '#fff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  boxShadow: activeTab === 'past' ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Past Archive
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>

      {/* Main Events Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
              <div style={{ position: 'relative', height: '160px' }}>
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
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>{event.title}</h3>
                
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
                    <div style={{ flex: 1 }}>
                      {event.is_certificate_issued ? (
                        <CertificateProgressButton 
                          className="w-full"
                          onGenerate={() => {
                            if (!userProfile) return alert("Profile loading...");
                            generateEventCertificate(
                              userProfile.full_name || userProfile.name || 'NeST Digital Member',
                              event.title,
                              event.date
                            );
                          }}
                        />
                      ) : (
                        <button 
                          disabled
                          style={{ 
                            width: '100%', 
                            background: '#F1F5F9', 
                            color: '#94a3b8', 
                            padding: '0.85rem', 
                            borderRadius: '12px', 
                            border: 'none', 
                            fontWeight: 800, 
                            cursor: 'not-allowed', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.6rem'
                          }}
                        >
                          <Download size={18} />
                          Certificate Pending
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
