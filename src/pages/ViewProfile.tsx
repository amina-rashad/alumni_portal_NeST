import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, Mail, Phone,
  Briefcase, Book, Award, 
  Linkedin, Github, Twitter, Globe,
  CheckCircle2, Building, Info, Share2, GraduationCap
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { usersApi, getUser } from '../services/api';
import profileBanner from '../assets/profile_banner_modern.png';

const ViewProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersApi.getProfile();
        const data = res.data as any;
        if (res.success && data && data.user) {
          setUserData(data.user);
        } else {
          const localUser = getUser();
          if (localUser) setUserData(localUser);
          else setError('Failed to load profile.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        const localUser = getUser();
        if (localUser) setUserData(localUser);
        else setError('A network error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTop: '4px solid #c8102e', borderRadius: '50%' }}
        />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#c8102e' }}>Oops! something went wrong</h2>
        <p style={{ color: '#64748b' }}>{error || 'Profile data not found.'}</p>
        <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', background: '#1a2652', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}>Go to Login</button>
      </div>
    );
  }

  const initials = user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 4rem' }}
    >
      {/* --- HERO SECTION --- */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        {/* Banner */}
        <div style={{ 
          height: '220px', 
          borderRadius: '24px', 
          overflow: 'hidden',
          background: `url(${profileBanner}) center/cover no-repeat`,
          position: 'relative'
        }}>
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)' }} />
        </div>
        
        {/* Profile Identity Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between',
          padding: '0 40px',
          marginTop: '-60px',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
            <div style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '30px', 
              background: '#ffffff', 
              padding: '6px',
              boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '24px', 
                background: '#c8102e', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontSize: '64px', 
                fontWeight: 800,
                overflow: 'hidden'
              }}>
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
              </div>
            </div>
            
            <div style={{ paddingBottom: '12px' }}>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>{user.full_name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
                 <span><Building size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {user.specialization || 'Professional'}</span>
                 <span>•</span>
                 <span>Batch of {user.batch || 'N/A'}</span>
              </div>
            </div>
          </div>

          <Link to="/profile/edit" style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', 
            padding: '12px 28px', background: '#1a2652', color: 'white', 
            borderRadius: '12px', textDecoration: 'none', fontWeight: 700,
            fontSize: '15px', marginBottom: '12px',
            boxShadow: '0 8px 16px rgba(26, 38, 82, 0.2)',
            transition: '0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Edit3 size={18} /> Edit Profile
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* About Section */}
          <section style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '19px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={22} color="#c8102e" /> About
            </h3>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: '16px' }}>
              {user.bio || "No professional bio provided yet. Add a bio to tell others about your journey, interests, and expertise."}
            </p>
          </section>

          {/* Skills Section */}
          <section style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '19px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Award size={22} color="#c8102e" /> Skills & Expertise
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {user.skills && user.skills.length > 0 ? (
                user.skills.map((skill: string, index: number) => (
                  <span key={index} style={{ padding: '10px 18px', borderRadius: '12px', background: '#f8fafc', color: '#475569', fontSize: '14px', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                    {skill}
                  </span>
                ))
              ) : (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '15px' }}>No skills added yet.</p>
              )}
            </div>
          </section>

          {/* Experience Section */}
          <section style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '19px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Briefcase size={22} color="#c8102e" /> Experience
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                    <Building size={28} color="#94a3b8" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: '#1e292b' }}>Software Engineer</h4>
                    <p style={{ margin: '4px 0', fontSize: '15px', color: '#64748b', fontWeight: 500 }}>NeST Digital • Full-time</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Jan 2023 - Present • 1 yr 3 mos</p>
                  </div>
                </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Contact Info Card */}
          <section style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8102e' }}><Mail size={18} /></div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Email Address</div>
                  <div style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>{user.email || 'melbin@google.com'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8102e' }}><Phone size={18} /></div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Phone Number</div>
                  <div style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>{user.phone || 'Not shared'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8102e' }}><GraduationCap size={18} /></div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Education</div>
                  <div style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>{user.specialization || 'Engineering'} - Batch of {user.batch || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '30px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
               <a href="#" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#1a2652'}><Linkedin size={20} /></a>
               <a href="#" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#000'}><Github size={20} /></a>
               <a href="#" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#1DA1F2'}><Twitter size={20} /></a>
               <a href="#" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#c8102e'}><Globe size={20} /></a>
            </div>
          </section>

          {/* Stats Card */}
          <section style={{ background: '#1a2652', padding: '28px', borderRadius: '24px', color: 'white', boxShadow: '0 10px 24px rgba(26, 38, 82, 0.2)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 700, opacity: 0.9 }}>Profile Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '20px 10px', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>42</div>
                <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em' }}>Views</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '20px 10px', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>12</div>
                <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em' }}>Connections</div>
              </div>
            </div>
            <button style={{ width: '100%', marginTop: '24px', padding: '14px', borderRadius: '12px', background: '#c8102e', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(200, 16, 46, 0.4)' }}>
               Share Profile
            </button>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewProfile;

