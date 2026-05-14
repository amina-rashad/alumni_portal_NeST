import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Edit3, Mail, Phone,
  Briefcase, Book, Award, 
  Linkedin, Github, Twitter, Globe,
  CheckCircle2, Building, Info, Share2, GraduationCap, FileText, Download, ExternalLink, MoreHorizontal, Eye, Share
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { usersApi, getUser } from '../services/api';
import profileBanner from '../assets/profile_banner_modern.png';

// --- RESUME PREVIEW COMPONENT (Mirrored from Builder) ---
const ResumePreview: React.FC<{ data: any }> = ({ data }) => {
  const renderTextBlock = (text: string, columns: number = 1) => {
    if (!text) return null;
    const blocks = text.split('\n\n').filter(Boolean);
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: columns > 1 ? `repeat(${columns}, 1fr)` : '1fr', gap: '2rem' }}>
        {blocks.map((block, idx) => {
          const lines = block.split('\n');
          return (
            <div key={idx} style={{ marginBottom: columns === 1 ? '1.5rem' : 0 }}>
              {lines.map((line, lIdx) => {
                if (lIdx === 0) return (
                  <div key={lIdx} style={{ fontWeight: 700, fontSize: '11px', marginBottom: '4px', color: '#000', display: 'flex', justifyContent: 'space-between' }}>
                    {line}
                  </div>
                );
                if (line.startsWith('-')) return (
                  <div key={lIdx} style={{ fontSize: '10px', paddingLeft: '12px', position: 'relative', marginBottom: '4px', color: '#334155', lineHeight: 1.5 }}>
                    <span style={{ position: 'absolute', left: 0 }}>•</span> {line.substring(1).trim()}
                  </div>
                );
                return (
                  <div key={lIdx} style={{ fontSize: '10px', marginBottom: '2px', color: '#475569', lineHeight: 1.5 }}>
                    {line}
                  </div>
                );
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
      padding: '2.5rem', 
      width: '100%', 
      maxWidth: '210mm', 
      height: 'max-content',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)', 
      fontFamily: '"Montserrat", "Helvetica", Arial, sans-serif',
      color: '#1e293b',
      lineHeight: 1.5,
      boxSizing: 'border-box',
      wordBreak: 'break-word',
      margin: '0 auto',
      textAlign: 'left',
      borderRadius: '8px'
    }}>
      {/* Header section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0', fontSize: '32px', fontWeight: 900, color: '#1e2652', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{data.fullName}</h1>
        <h2 style={{ margin: '8px 0 12px', fontSize: '14px', fontWeight: 800, color: '#c8102e', textTransform: 'uppercase', letterSpacing: '1px' }}>{data.title}</h2>
        
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.address && <span>{data.address}</span>}
          {data.portfolio && <span style={{ color: '#1a2652', fontWeight: 700 }}>{data.portfolio}</span>}
        </div>
      </div>

      {/* Thick Navy Divider */}
      <div style={{ height: '2.5px', background: '#1e2652', width: '100%', marginBottom: '2.5rem' }} />
      
      {data.summary && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1e2652', textTransform: 'uppercase', margin: '0 0 12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Professional Summary</h3>
          <p style={{ fontSize: '10.5px', margin: 0, color: '#334155', lineHeight: 1.6 }}>{data.summary}</p>
        </div>
      )}

      {data.experience && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1e2652', textTransform: 'uppercase', margin: '0 0 12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Work Experience</h3>
          {renderTextBlock(data.experience, 1)}
        </div>
      )}

      {/* Side-by-side Education and Certifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        <div>
          {data.education && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1e2652', textTransform: 'uppercase', margin: '0 0 12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Education</h3>
              {renderTextBlock(data.education, 1)}
            </div>
          )}
        </div>
        <div>
          {data.certification && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1e2652', textTransform: 'uppercase', margin: '0 0 12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Certifications</h3>
              {renderTextBlock(data.certification, 1)}
            </div>
          )}
        </div>
      </div>

      {data.projects && (
        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1e2652', textTransform: 'uppercase', margin: '0 0 12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Key Projects</h3>
          {renderTextBlock(data.projects, 1)}
        </div>
      )}
    </div>
  );
};

const ViewProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeBlobUrl, setResumeBlobUrl] = useState<string | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalTopRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showResumeModal) {
      const timer = setTimeout(() => {
        if (modalTopRef.current) {
          modalTopRef.current.scrollIntoView({ block: 'start', behavior: 'instant' });
        }
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showResumeModal]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = resumeBlobUrl || user.resume_url;
    
    setIsDownloading(true);
    try {
      if (url) {
        // Force download for file URLs
        const link = document.createElement('a');
        link.href = url;
        link.download = user.full_name ? `${user.full_name.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (user.resume_data && resumeRef.current) {
        // GENERATE PDF FROM HTML
        const canvas = await html2canvas(resumeRef.current, {
          scale: 2, // High quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(user.full_name ? `${user.full_name.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf');
      } else {
        alert("No resume content found to download.");
      }
    } catch (err) {
      console.error('Download failed', err);
      alert("Failed to generate PDF. Please try again or use the print option.");
    } finally {
      setIsDownloading(false);
    }
  };
  useEffect(() => {
    if (user?.resume_url && user.resume_url.startsWith('data:')) {
      try {
        const parts = user.resume_url.split(',');
        if (parts.length < 2) return;
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (!mimeMatch) return;
        const mime = mimeMatch[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const url = URL.createObjectURL(blob);
        setResumeBlobUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Failed to convert resume data URI to Blob', e);
      }
    } else if (user?.resume_url) {
      // If it's a direct URL but not a data URI, ensure it has the full path if needed
      // (Assuming backend provides full URL or relative to API_BASE_URL)
      setResumeBlobUrl(user.resume_url);
    } else {
      setResumeBlobUrl(null);
    }
  }, [user?.resume_url]);

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
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at top right, rgba(200,16,46,0.05), transparent 50%), radial-gradient(circle at bottom left, rgba(26,38,82,0.05), transparent 50%)', pointerEvents: 'none', zIndex: -1 }} />
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 4rem', position: 'relative' }}
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
              borderRadius: '50%', 
              background: '#ffffff', 
              padding: '6px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
              position: 'relative',
              border: user.status === 'open_to_work' ? '4px solid #16a34a' : 'none'
            }}>
              <div style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%', 
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
              {user.status === 'open_to_work' && (
                <div style={{
                  position: 'absolute',
                  bottom: '5px',
                  right: '5px',
                  background: '#16a34a',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  border: '2px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  whiteSpace: 'nowrap'
                }}>
                  Open To Work
                </div>
              )}
            </div>
            
            <div style={{ paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>{user.full_name}</h1>
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
          <section style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(24px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '19px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={22} color="#c8102e" /> About
            </h3>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: '16px' }}>
              {user.bio || "No professional bio provided yet. Add a bio to tell others about your journey, interests, and expertise."}
            </p>
          </section>

          {/* Skills Section */}
          <section style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(24px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
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
          <section style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(24px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
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
          <section style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(24px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
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

          {/* Certificates Section (NeST Blue Branding) */}
          <section style={{ background: 'rgba(26, 38, 82, 0.95)', backdropFilter: 'blur(24px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(26, 38, 82, 0.5)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '19px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Award size={22} color="white" /> Certificates & Accreditations
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {user?.certificates && user.certificates.length > 0 ? (
                user.certificates.map((cert: any) => (
                  <div key={cert.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* File Card Layout (Ultra-Sleek & Sexy) */}
                    <div 
                      onClick={() => {
                        if (cert.url) {
                          const newWindow = window.open();
                          if (newWindow) {
                            newWindow.document.write(`<iframe src="${cert.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                          }
                        }
                      }}
                      style={{ 
                        borderRadius: '12px', 
                        overflow: 'hidden', 
                        background: 'white', 
                        border: '1.5px solid #c8102e', 
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 20px rgba(200, 16, 46, 0.15), 0 0 10px rgba(0,0,0,0.05)',
                        transition: '0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(200, 16, 46, 0.3)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(200, 16, 46, 0.15)';
                      }}
                    >
                      {/* Slim Glassmorphic Header */}
                      <div style={{ 
                        padding: '8px 12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(241, 245, 249, 0.8)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                          <div style={{ color: '#c8102e' }}>
                            <FileText size={16} />
                          </div>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 800, 
                            color: '#1e293b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            letterSpacing: '0.2px'
                          }}>
                            {cert.name}.pdf
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                          <ExternalLink size={14} />
                        </div>
                      </div>

                      {/* Micro-Preview Area */}
                      <div style={{ 
                        height: '140px', 
                        width: '100%', 
                        background: '#f8fafc', 
                        position: 'relative',
                        overflow: 'hidden', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {cert.url && cert.url !== '#' ? (
                          cert.url.startsWith('data:application/pdf') || cert.url.endsWith('.pdf') ? (
                            <div style={{ width: '130%', height: '140%', overflow: 'hidden', position: 'relative', marginTop: '-5%', marginRight: '-15%' }}>
                              <iframe 
                                src={`${cert.url}#toolbar=0&navpanes=0&scrollbar=0`} 
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  border: 'none', 
                                  pointerEvents: 'none'
                                }}
                                scrolling="no"
                                title="Certificate Preview"
                              />
                            </div>
                          ) : (
                            <img 
                              src={cert.url} 
                              alt="Certificate Thumbnail" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )
                        ) : (
                          <Award size={32} color="#e2e8f0" />
                        )}
                        
                        {/* Minimalist Floating Action Button */}
                        <div style={{ 
                          position: 'absolute', bottom: '8px', right: '8px',
                          padding: '6px 12px', background: 'rgba(26, 38, 82, 0.98)', color: 'white', 
                          borderRadius: '15px', fontSize: '10px', fontWeight: 800,
                          display: 'flex', alignItems: 'center', gap: '4px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                          zIndex: 10,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <Eye size={12} /> View
                        </div>
                      </div>
                    </div>
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
            <section style={{ background: 'transparent', padding: '0', borderRadius: '0', border: 'none', boxShadow: 'none' }}>
              <div className="group resume-card" style={{ position: 'relative' }}>
                {/* --- PREMIUM DOCUMENT CARD --- */}
                <div style={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  background: 'white', 
                  border: '1.5px solid #e2e8f0', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}>
                  {/* Card Header (Matches Screenshot) */}
                  <div 
                    onClick={() => setShowResumeModal(true)}
                    style={{ 
                      padding: '12px 20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        background: '#f8fafc', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#ef4444',
                        border: '1px solid #e2e8f0'
                      }}>
                        <FileText size={24} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: '15px', 
                          fontWeight: 700, 
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {user.full_name ? `${user.full_name.replace(/\s+/g, '_')}_Resume.pdf` : 'Professional_Resume.pdf'}
                        </h4>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                      {/* Download button removed from here */}
                    </div>
                  </div>

                  <div 
                    onClick={() => setShowResumeModal(true)}
                    style={{ 
                      height: '300px', 
                      background: 'black', // Black background like the screenshot
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Add overlay to catch clicks over the iframe */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 10 }} />
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      position: 'relative'
                    }}>
                      {user.resume_data ? (
                        <div style={{ 
                          transform: 'scale(0.5)', 
                          transformOrigin: 'top center',
                          width: '210mm',
                          pointerEvents: 'none',
                          marginTop: '15px'
                        }}>
                          <ResumePreview data={user.resume_data} />
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                          {(user.resume_url && (user.resume_url.startsWith('data:image/') || user.resume_url.match(/\.(jpg|jpeg|png|webp)$/i))) ? (
                            <img 
                              src={resumeBlobUrl || user.resume_url} 
                              alt="Resume Preview" 
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                            />
                          ) : (
                            <iframe 
                              src={`${resumeBlobUrl || user.resume_url}#toolbar=0&navpanes=0&scrollbar=0`} 
                              style={{ 
                                width: '100%', 
                                height: '120%', 
                                border: 'none', 
                                pointerEvents: 'none'
                              }}
                              title="Resume Preview"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', position: 'sticky', top: '100px', alignSelf: 'start' }}>
          {/* Contact Info Card */}
          <section style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(24px)', padding: '28px 28px 20px 28px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
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

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
               {user.linkedin_url && <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0a66c2', transition: 'all 0.2s ease', display: 'inline-flex' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}><Linkedin size={22} fill="currentColor" /></a>}
               {user.github_url && <a href={user.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#24292e', transition: 'all 0.2s ease', display: 'inline-flex' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}><Github size={22} fill="currentColor" /></a>}
               {user.twitter_url && <a href={user.twitter_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2', transition: 'all 0.2s ease', display: 'inline-flex' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}><Twitter size={22} fill="currentColor" /></a>}
               {user.portfolio_url && <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: '#c8102e', transition: 'all 0.2s ease', display: 'inline-flex' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}><Globe size={22} /></a>}
               {!user.linkedin_url && !user.github_url && !user.twitter_url && !user.portfolio_url && (
                 <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>No social links added.</p>
               )}
            </div>
          </section>

        </div>
      </div>
    </motion.div>

    {/* Full Screen Resume Modal */}
    {showResumeModal && (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#0f172a',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem'
      }}>
        <div ref={modalTopRef} style={{ height: '1px', width: '100%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', background: 'white', padding: '8px 20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              background: '#f8fafc', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#ef4444',
              border: '1px solid #e2e8f0'
            }}>
              <FileText size={20} />
            </div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
              {user.full_name ? `${user.full_name.replace(/\s+/g, '_')}_Resume.pdf` : 'Professional_Resume.pdf'}
            </h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              style={{ 
                background: isDownloading ? '#f1f5f9' : '#f8fafc', 
                color: isDownloading ? '#c8102e' : '#1e293b', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                padding: '0 16px',
                height: '36px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                cursor: isDownloading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                fontWeight: 700,
                fontSize: '13px'
              }}
              onMouseEnter={(e) => { if(!isDownloading) { e.currentTarget.style.background = '#1a2652'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#1a2652'; } }}
              onMouseLeave={(e) => { if(!isDownloading) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#1e293b'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
              title={isDownloading ? "Downloading..." : "Download Resume"}
            >
              {isDownloading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: '16px', height: '16px', border: '2px solid #e2e8f0', borderTopColor: '#c8102e', borderRadius: '50%' }}
                  />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download CV</span>
                </>
              )}
            </button>
            <button 
              onClick={() => setShowResumeModal(false)}
              style={{ 
                background: '#f8fafc', 
                color: '#0f172a', 
                border: '1px solid #e2e8f0', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              ✕
            </button>
          </div>
        </div>
        <div style={{ flex: 1, background: 'radial-gradient(circle at center, #1e293b 0%, #0b1121 100%)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)' }}>
          {user.resume_data ? (
            <div ref={scrollContainerRef} className="hide-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '1rem 0' }}>
              <div ref={resumeRef} style={{ margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', borderRadius: '8px', width: '95%', maxWidth: '1000px' }}>
                <ResumePreview data={user.resume_data} />
              </div>
            </div>
          ) : (
            <div ref={scrollContainerRef} style={{ width: '100%', height: '100%', padding: '0', overflowY: 'auto' }}>
              <iframe 
                src={`${resumeBlobUrl || user.resume_url}#view=FitH&toolbar=0`} 
                style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', height: '100%', minHeight: '90vh', display: 'block', border: 'none', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
                title="Resume Full View"
              />
            </div>
          )}
        </div>
      </div>
    )}

    </div>
  );
};

export default ViewProfile;

