import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, Mail, Phone,
  Briefcase, Book, Award, 
  Linkedin, Github, Twitter, Globe,
  CheckCircle2, Building, Info, Share2, GraduationCap, FileText, Download
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { usersApi, getUser } from '../services/api';
import profileBanner from '../assets/profile_banner_modern.png';

// --- RESUME PREVIEW COMPONENT ---
const ResumePreview: React.FC<{ data: any }> = ({ data }) => {
  const renderTextBlock = (text: string, columns: number = 1) => {
    if (!text) return null;
    const blocks = text.split('\n\n').filter(Boolean);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: columns > 1 ? `repeat(${columns}, 1fr)` : '1fr', gap: '1rem' }}>
        {blocks.map((block, idx) => {
          const lines = block.split('\n');
          return (
            <div key={idx} style={{ marginBottom: columns === 1 ? '1rem' : 0 }}>
              {lines.map((line, lIdx) => {
                if (lIdx === 0) return <div key={lIdx} style={{ fontWeight: 700, fontSize: '11px', marginBottom: '3px', color: '#000' }}>{line}</div>;
                if (line.startsWith('-')) return <div key={lIdx} style={{ fontSize: '10px', paddingLeft: '10px', position: 'relative', marginBottom: '3px', color: '#333' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span> {line.substring(1).trim()}
                </div>;
                return <div key={lIdx} style={{ fontSize: '10px', marginBottom: '2px', color: '#444' }}>{line}</div>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '3rem', 
      width: '100%', 
      maxWidth: '800px', 
      margin: '0 auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: '#000',
      lineHeight: 1.5,
      border: '1px solid #e2e8f0',
      borderRadius: '8px'
    }}>
      <div style={{ marginBottom: '2.5rem', borderBottom: '2px solid #1a2652', paddingBottom: '1.5rem' }}>
        <h1 style={{ margin: '0', fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', color: '#1a2652' }}>{data.fullName}</h1>
        <h2 style={{ margin: '8px 0 0', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c8102e' }}>{data.title}</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '15px', fontSize: '11px', color: '#64748b' }}>
           {data.email && <span>{data.email}</span>}
           {data.phone && <span>{data.phone}</span>}
           {data.address && <span>{data.address}</span>}
           {data.portfolio && <span style={{ color: '#c8102e' }}>{data.portfolio}</span>}
        </div>
      </div>
      
      {data.summary && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 10px', color: '#1a2652', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Professional Summary</h3>
          <p style={{ fontSize: '11px', margin: 0, color: '#333' }}>{data.summary}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {data.experience && (
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 10px', color: '#1a2652', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Work Experience</h3>
            {renderTextBlock(data.experience)}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {data.education && (
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 10px', color: '#1a2652', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Education</h3>
              {renderTextBlock(data.education)}
            </div>
          )}
          {data.certification && (
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 10px', color: '#1a2652', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Certifications</h3>
              {renderTextBlock(data.certification)}
            </div>
          )}
        </div>

        {data.projects && (
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 10px', color: '#1a2652', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Key Projects</h3>
            {renderTextBlock(data.projects)}
          </div>
        )}
      </div>
    </div>
  );
};

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
          const apiUser = data.user;
          setUserData(apiUser);
          
          // Optionally sync local storage if it's stale
          const localUser = getUser() as any;
          if (localUser && (localUser.id === apiUser.id)) {
            // Keep local tokens but update profile info
            // setUser({ ...localUser, ...apiUser }); 
          }
        } else {
          const localUser = getUser();
          if (localUser) {
            setUserData(localUser);
          } else {
            setUserData({
              full_name: 'Melbin',
              specialization: 'Software Engineer',
              batch: '2023',
              email: 'melbin@google.com',
              phone: '+91 98765 43210',
              bio: 'Passionate software engineer with expertise in building scalable web applications. Always eager to learn new technologies and contribute to meaningful projects.',
              skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Framer Motion'],
              status: 'open_to_work',
              profile_picture: null
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        const localUser = getUser();
        if (localUser) {
          setUserData(localUser);
        } else {
          setUserData({
            full_name: 'Melbin',
            specialization: 'Software Engineer',
            batch: '2023',
            email: 'melbin@google.com',
            bio: 'No professional bio provided yet. Add a bio to tell others about your journey, interests, and expertise.',
            skills: ['React', 'TypeScript', 'Cloud Computing'],
            status: 'none',
            profile_picture: null
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      console.log('DEBUG: Current user profile data:', {
        name: user.full_name,
        resume_url: user.resume_url ? `${user.resume_url.substring(0, 50)}...` : null,
        is_resume_created: user.is_resume_created,
        has_resume_data: !!user.resume_data
      });
    }
  }, [user]);

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

  if (error && !user) {
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
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
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

          <Link to="edit" style={{ 
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

          {/* Certificates Section */}
          <section style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '19px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Award size={22} color="#c8102e" /> Certificates & Accreditations
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {user.certificates && user.certificates.length > 0 ? (
                user.certificates.map((cert: any) => (
                  <div key={cert.id} style={{ padding: '20px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', transition: '0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: cert.type === 'portal' ? '#fff1f1' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cert.type === 'portal' ? '#c8102e' : '#64748b' }}>
                        <Award size={24} />
                      </div>
                      {cert.type === 'portal' && (
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#c8102e', background: '#fff1f1', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified</span>
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{cert.name}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{cert.issuer}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Issued {cert.date}</p>
                    </div>
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c8102e', fontSize: '13px', fontWeight: 700, textDecoration: 'none', marginTop: '4px' }}>
                      <Share2 size={14} /> View Certificate
                    </a>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>
                  <Award size={48} color="#e2e8f0" style={{ marginBottom: '12px' }} />
                  <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic', fontSize: '15px' }}>No certificates added yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Resume Section */}
          {(user.resume_url || user.is_resume_created) && (
            <section style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '19px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={22} color="#c8102e" /> Professional Resume
              </h3>
              
              {user.resume_data ? (
                <div style={{ marginTop: '10px' }}>
                  <ResumePreview data={user.resume_data} />
                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                    <a 
                      href={user.resume_url} 
                      download={`${user.full_name.replace(/\s+/g, '_')}_Resume.pdf`}
                      style={{ 
                        padding: '12px 24px', 
                        background: '#1a2652', 
                        color: 'white', 
                        borderRadius: '12px', 
                        textDecoration: 'none', 
                        fontWeight: 700, 
                        fontSize: '14px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)'
                      }}
                    >
                      <Download size={18} /> Download Full PDF Resume
                    </a>
                  </div>
                </div>
              ) : user.resume_url ? (
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {(user.resume_url.startsWith('data:application/pdf') || user.resume_url.includes('pdf')) ? (
                    <div style={{ position: 'relative' }}>
                      <iframe src={user.resume_url} width="100%" height="800px" style={{ border: 'none' }} title="Resume Preview" />
                      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                        <a 
                          href={user.resume_url} 
                          download={`${user.full_name.replace(/\s+/g, '_')}_Resume.pdf`}
                          style={{ padding: '10px 24px', background: '#c8102e', color: 'white', borderRadius: '30px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 15px rgba(200, 16, 46, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Download size={18} /> Download PDF
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8102e' }}><FileText size={28} /></div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Uploaded Professional Document</h4>
                          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>Resume format verified</p>
                        </div>
                      </div>
                      <a href={user.resume_url} download={`${user.full_name.replace(/\s+/g, '_')}_Resume`} style={{ padding: '12px 28px', background: '#1a2652', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Download size={18} /> Download
                      </a>
                    </div>
                  )}
                </div>
              ) : user.is_resume_created ? (
                <div style={{ padding: '40px 24px', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fff1f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8102e', margin: '0 auto 20px' }}>
                    <FileText size={32} />
                  </div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>NeST Resume Profile</h4>
                  <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '15px', maxWidth: '400px', marginInline: 'auto' }}>You have initialized the resume builder. Complete the process in the editor to view it here.</p>
                  <Link to="edit" style={{ padding: '12px 32px', background: 'white', border: '2px solid #1a2652', borderRadius: '12px', color: '#1a2652', fontWeight: 700, textDecoration: 'none', display: 'inline-block', transition: '0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#1a2652'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#1a2652'; }}
                  >
                    Go to Resume Builder
                  </Link>
                </div>
              ) : null}
            </section>
          )}
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
               {user.linkedin_url && <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#1a2652'}><Linkedin size={20} /></a>}
               {user.github_url && <a href={user.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#000'}><Github size={20} /></a>}
               {user.twitter_url && <a href={user.twitter_url} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#1DA1F2'}><Twitter size={20} /></a>}
               {user.portfolio_url && <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#c8102e'}><Globe size={20} /></a>}
               {!user.linkedin_url && !user.github_url && !user.twitter_url && !user.portfolio_url && (
                 <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>No social links added.</p>
               )}
            </div>
          </section>

        </div>
      </div>
    </motion.div>
  );
};

export default ViewProfile;

