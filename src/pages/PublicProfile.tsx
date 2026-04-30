import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Phone,
  Briefcase, Award, 
  Linkedin, Github, Twitter, Globe,
  CheckCircle2, Building, GraduationCap, FileText, Download, ArrowLeft
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usersApi } from '../services/api';
import profileBanner from '../assets/profile_banner_modern.png';

const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await usersApi.getPublicProfile(id);
        if (res.success && res.data?.user) {
          setUserData(res.data.user);
        } else {
          setError("User not found.");
        }
      } catch (err) {
        console.error('Error fetching public profile:', err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProfile();
  }, [id]);

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
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <div style={{ width: '80px', height: '80px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#ef4444' }}>
          <Building size={40} />
        </div>
        <h2 style={{ color: '#1e293b', fontWeight: 800 }}>Profile Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{error || "The profile you are looking for doesn't exist or has been removed."}</p>
        <button onClick={() => navigate(-1)} style={{ padding: '12px 24px', background: '#1a2652', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>Go Back</button>
      </div>
    );
  }

  const initials = user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px 4rem' }}
    >
      <button 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={18} /> Back to Directory
      </button>

      {/* --- HERO SECTION --- */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <div style={{ 
          height: '220px', 
          borderRadius: '24px', 
          overflow: 'hidden',
          background: `url(${profileBanner}) center/cover no-repeat`,
          position: 'relative'
        }}>
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
        </div>
        
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>{user.full_name}</h1>
                {user.status && user.status !== 'none' && (
                  <span style={{ 
                    padding: '6px 14px', 
                    borderRadius: '20px', 
                    fontSize: '13px', 
                    fontWeight: 800, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    background: user.status === 'open_to_work' ? '#f0fdf4' : '#f0f9ff',
                    color: user.status === 'open_to_work' ? '#16a34a' : '#0284c7',
                    border: `1px solid ${user.status === 'open_to_work' ? '#bbf7d0' : '#bae6fd'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.status === 'open_to_work' ? '#16a34a' : '#0284c7' }}></span>
                    {user.status === 'open_to_work' ? '#OpenToWork' : '#Hiring'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
                 <span><Building size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {user.specialization || 'Professional'}</span>
                 <span>•</span>
                 <span>Batch of {user.batch || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* About Section */}
          <section style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '19px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={22} color="#c8102e" /> About
            </h3>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: '16px' }}>
              {user.bio || "No professional bio provided yet."}
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
              {user.experience && user.experience.length > 0 ? (
                user.experience.map((exp: any) => (
                  <div key={exp.id} style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                      <Building size={28} color="#94a3b8" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: '#1e292b' }}>{exp.role}</h4>
                      <p style={{ margin: '4px 0', fontSize: '15px', color: '#64748b', fontWeight: 500 }}>{exp.company} • {exp.type || 'Full-time'}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{exp.duration}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '15px' }}>No experience listed yet.</p>
              )}
            </div>
          </section>

          {/* Education Section */}
          <section style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '19px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <GraduationCap size={22} color="#c8102e" /> Education
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {user.education && user.education.length > 0 ? (
                user.education.map((edu: any) => (
                  <div key={edu.id} style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                      <GraduationCap size={28} color="#94a3b8" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: '#1e292b' }}>{edu.degree}</h4>
                      <p style={{ margin: '4px 0', fontSize: '15px', color: '#64748b', fontWeight: 500 }}>{edu.school}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Class of {edu.year}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '15px' }}>No education details added yet.</p>
              )}
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <section style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8102e' }}><Mail size={18} /></div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Email Address</div>
                  <div style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>{user.email}</div>
                </div>
              </div>
              {user.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8102e' }}><Phone size={18} /></div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Phone Number</div>
                    <div style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>{user.phone}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '30px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
               {user.linkedin_url && <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#1a2652'}><Linkedin size={20} /></a>}
               {user.github_url && <a href={user.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#000'}><Github size={20} /></a>}
               {user.twitter_url && <a href={user.twitter_url} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#1DA1F2'}><Twitter size={20} /></a>}
               {user.portfolio_url && <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#c8102e'}><Globe size={20} /></a>}
            </div>
          </section>

          {user.resume_url && (
            <section style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>Professional Resume</h3>
              <a href={user.resume_url} download={`${user.full_name.replace(/\s+/g, '_')}_Resume`} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', background: '#1a2652', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                <Download size={18} /> Download CV
              </a>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PublicProfile;
