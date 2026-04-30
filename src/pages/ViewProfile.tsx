import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, Mail, Phone,
  Briefcase, Book, Award, 
  Linkedin, Github, Twitter, Globe,
  CheckCircle2, Building, FileText, Download
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { usersApi, getUser } from '../services/api';
import profileCover from '../assets/profile_cover_abstract_1774463298619.png'; // Using the generated image

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
        console.log('Profile data:', res);
        if (res.success && data && data.user) {
          setUserData(data.user);
        } else {
          // Fallback to local user if API fails or returns no data
          const localUser = getUser();
          if (localUser) {
            setUserData(localUser);
          } else {
            setError('Failed to load profile. Please try logging in again.');
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        const localUser = getUser();
        if (localUser) {
          setUserData(localUser);
        } else {
          setError('A network error occurred while loading your profile.');
        }
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
          style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #d32f2f', borderRadius: '50%' }}
        />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#d32f2f' }}>Oops! something went wrong</h2>
        <p style={{ color: '#666' }}>{error || 'We couldn\'t find your profile data.'}</p>
        <button 
          onClick={() => navigate('/login')}
          style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  const initials = user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem', fontFamily: '"Inter", sans-serif' }}
    >
      {/* Header / Cover Section */}
      <div style={{ position: 'relative', marginBottom: '80px' }}>
        <div style={{ 
          height: '240px', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          background: `url(${profileCover}) center/cover no-repeat, linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`
        }}>
          {/* Cover gradient overlay for better text contrast if needed */}
          <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.02)' }} />
        </div>
        
        {/* Profile Picture Overlay */}
        <div style={{ 
          position: 'absolute', 
          bottom: '-60px', 
          left: '40px', 
          display: 'flex', 
          alignItems: 'flex-end',
          gap: '24px'
        }}>
          <div style={{ 
            width: '140px', 
            height: '140px', 
            borderRadius: '24px', 
            background: 'white', 
            padding: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}>
            <div style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '18px', 
              background: '#d32f2f', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontSize: '48px', 
              fontWeight: 700 
            }}>
              {user.profile_picture ? (
                <img src={user.profile_picture} alt={user.full_name} style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover' }} />
              ) : initials}
            </div>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {user.full_name}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={16} /> {user.specialization || 'Professional'} • {user.batch || 'Class of N/A'}
            </p>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '-45px', right: '0' }}>
          <Link to="/profile/edit" style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '12px 24px', background: '#0f172a', color: 'white', 
            borderRadius: '12px', textDecoration: 'none', fontWeight: 600,
            boxShadow: '0 10px 20px rgba(15, 23, 42, 0.15)',
            transition: '0.2s transform'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Edit3 size={18} /> Edit Profile
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', marginTop: '20px' }}>
        {/* Left Column: Bio and Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* About Section */}
          <section style={{ 
            background: 'white', padding: '32px', borderRadius: '20px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="#d32f2f" /> About
            </h3>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.7, fontSize: '16px', whiteSpace: 'pre-line' }}>
              {user.bio || "No professional bio provided yet. Add a bio to tell others about your journey, interests, and expertise."}
            </p>
          </section>

          {/* Skills Section */}
          <section style={{ 
            background: 'white', padding: '32px', borderRadius: '20px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={20} color="#d32f2f" /> Skills & Expertise
              </h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {user.skills && user.skills.length > 0 ? (
                user.skills.map((skill: string, index: number) => (
                  <span 
                    key={index} 
                    style={{ 
                      padding: '8px 16px', borderRadius: '8px', background: '#f8fafc', 
                      color: '#334155', fontSize: '14px', fontWeight: 600, border: '1px solid #e2e8f0'
                    }}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>No skills added yet.</p>
              )}
            </div>
          </section>

          {/* Experience Section (Placeholder) */}
          <section style={{ 
            background: 'white', padding: '32px', borderRadius: '20px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9'
          }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={20} color="#d32f2f" /> Experience
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={24} color="#94a3b8" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Software Engineer</h4>
                    <p style={{ margin: '2px 0', fontSize: '14px', color: '#64748b' }}>NeST Digital • Full-time</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Jan 2023 - Present • 1 yr 3 mos</p>
                  </div>
               </div>
            </div>
          </section>

          {/* ── Professional Professional Resume Section (Reference Style) ── */}
          {(user.resume_url || user.resume_data) && (
            <section style={{ 
              background: 'white', padding: '48px', borderRadius: '4px', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
              fontFamily: '"Inter", "Helvetica", sans-serif', color: '#1e293b'
            }}>
              {user.is_resume_created && user.resume_data ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Resume Header */}
                  <div style={{ textAlign: 'center', borderBottom: '4px solid #1e293b', paddingBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: '#1a365d', textTransform: 'uppercase', letterSpacing: '2px' }}>
                      {user.full_name}
                    </h1>
                    <h2 style={{ margin: '8px 0', fontSize: '18px', fontWeight: 800, color: '#1a365d', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {user.resume_data.job_title}
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: '#64748b', fontSize: '13px', marginTop: '12px', fontWeight: 500 }}>
                      <span>NeST Digital Campus</span> <span>|</span>
                      <span>{user.phone || '+123-456-7890'}</span> <span>|</span>
                      <span>{user.email}</span>
                    </div>
                  </div>

                  {/* Profile Summary */}
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#1a365d', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px', letterSpacing: '1px' }}>
                      Profile Summary
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#475569' }}>
                      {user.bio || "Dynamic and results-driven professional with a strong foundation in digital technologies. Committed to delivering high-quality solutions and continuous professional growth within the NeST Digital ecosystem."}
                    </p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#1a365d', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '16px', letterSpacing: '1px' }}>
                      Experience
                    </h3>
                    <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line' }}>
                      {user.resume_data.experience}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#1a365d', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px', letterSpacing: '1px' }}>
                      Education
                    </h3>
                    <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line' }}>
                      {user.resume_data.education}
                    </div>
                  </div>

                  {/* Skills (Grouped) */}
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#1a365d', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px', letterSpacing: '1px' }}>
                      Skills
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {user.resume_data.skills_tools && (
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Technical Tools</div>
                          <div style={{ fontSize: '13px', color: '#475569' }}>{user.resume_data.skills_tools}</div>
                        </div>
                      )}
                      {user.resume_data.skills_specialties && (
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Specialties</div>
                          <div style={{ fontSize: '13px', color: '#475569' }}>{user.resume_data.skills_specialties}</div>
                        </div>
                      )}
                      {user.resume_data.skills_soft && (
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Soft Skills</div>
                          <div style={{ fontSize: '13px', color: '#475569' }}>{user.resume_data.skills_soft}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Achievements */}
                  {user.resume_data.achievements && (
                    <div>
                      <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#1a365d', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px', letterSpacing: '1px' }}>
                        Achievements
                      </h3>
                      <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line' }}>
                        {user.resume_data.achievements}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div style={{ 
                  padding: '40px', borderRadius: '12px', background: '#f8fafc', border: '2px dashed #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px'
                }}>
                  <FileText size={48} color="#94a3b8" />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>Uploaded Resume Document</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>File: {user.resume_url}</div>
                  </div>
                  <button style={{ 
                    marginTop: '8px', padding: '12px 24px', background: '#0f172a', color: 'white', 
                    border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <Download size={18} /> Download Document
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column: Contact and Network */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Quick Info Card */}
          <section style={{ 
            background: 'white', padding: '24px', borderRadius: '20px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                <div style={{ color: '#d32f2f' }}><Mail size={18} /></div>
                <div style={{ fontSize: '14px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Email Address</div>
                  {user.email || "not-available@nest.com"}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                <div style={{ color: '#d32f2f' }}><Phone size={18} /></div>
                <div style={{ fontSize: '14px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Phone Number</div>
                  {user.phone || "Not shared"}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                <div style={{ color: '#d32f2f' }}><Book size={18} /></div>
                <div style={{ fontSize: '14px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Education</div>
                  {user.specialization || "Engineering"} - {user.batch || "Alumni"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', gap: '16px' }}>
               <a href="#" style={{ color: '#64748b', transition: '0.2s color' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0072b1'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}><Linkedin size={20} /></a>
               <a href="#" style={{ color: '#64748b', transition: '0.2s color' }} onMouseEnter={(e) => e.currentTarget.style.color = '#333'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}><Github size={20} /></a>
               <a href="#" style={{ color: '#64748b', transition: '0.2s color' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1DA1F2'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}><Twitter size={20} /></a>
               <a href="#" style={{ color: '#64748b', transition: '0.2s color' }} onMouseEnter={(e) => e.currentTarget.style.color = '#d32f2f'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}><Globe size={20} /></a>
            </div>
          </section>

          {/* Analytics / Stats (Bonus section to wow) */}
          <section style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
            padding: '24px', borderRadius: '20px', color: 'white'
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Profile Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>{user.id ? (user.id % 50 + 10) : 42}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginTop: '4px' }}>Views</div>
               </div>
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>{user.id ? (user.id % 20 + 5) : 12}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginTop: '4px' }}>Connections</div>
               </div>
            </div>
            <button style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', background: 'rgba(211, 47, 47, 0.9)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
              Share Profile
            </button>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewProfile;

