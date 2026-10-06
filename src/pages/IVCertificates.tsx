/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Calendar, ShieldCheck, Loader2, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUser, usersApi } from '../services/api';
import { generateIVCertificate, getIVCertificatePDF } from '../utils/CertificateGenerator';

const AIWave: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const mouse = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const points: { x: number; y: number; ox: number; oy: number }[] = [];
    const spacing = 35;
    const rows = Math.ceil(height / spacing) + 1;
    const cols = Math.ceil(width / spacing) + 1;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        points.push({
          x: j * spacing,
          y: i * spacing,
          ox: j * spacing,
          oy: i * spacing
        });
      }
    }

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      points.forEach((p, idx) => {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, (150 - dist) / 150);
        
        // Liquid distortion logic
        const angle = Math.atan2(dy, dx);
        p.x = p.ox - Math.cos(angle) * force * 40 + Math.sin(time * 0.002 + p.oy * 0.01) * 3;
        p.y = p.oy - Math.sin(angle) * force * 40 + Math.cos(time * 0.002 + p.ox * 0.01) * 3;

        // Draw Dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = idx % 3 === 0 ? 'rgba(200, 16, 46, 0.25)' : 'rgba(26, 38, 82, 0.25)';
        ctx.fill();

        // Draw Lines (optimized with glow)
        if (idx % cols < cols - 1) { // Connect to right
          const right = points[idx + 1];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(right.x, right.y);
          ctx.strokeStyle = `rgba(26, 38, 82, ${0.1 * (1 - force)})`;
          ctx.shadowBlur = 5 * force;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
          ctx.stroke();
          ctx.shadowBlur = 0; // Reset for performance
        }
        if (idx < points.length - cols) { // Connect to bottom
          const bottom = points[idx + cols];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(bottom.x, bottom.y);
          ctx.strokeStyle = `rgba(26, 38, 82, ${0.1 * (1 - force)})`;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.8 }} />;
};

const IVCertificates: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUserData] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [myCertificates, setMyCertificates] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = getUser();
        if (!storedUser) {
          navigate('/login');
          return;
        }
        setUserData(storedUser);

        // Fetch IV certificates from the global repository based on Name/Email matching
        const res = await usersApi.getMyIVCertificates();
        if (res.success && res.data?.certificates) {
          setMyCertificates(res.data.certificates);
        } else {
          // Fallback to profile certificates if the new endpoint fails or returns nothing
          const userCerts = (storedUser as any).certificates || [];
          const matches = userCerts.filter((c: any) => c.type === 'iv');
          setMyCertificates(matches);
        }

        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleDownload = async (cert: any) => {
    setIsDownloading(cert.id || cert.date); 
    await new Promise(resolve => setTimeout(resolve, 800));
    generateIVCertificate(cert.student_name || user?.full_name || 'Student', cert.batch || '2024', cert.date);
    setIsDownloading(null);
  };

  const handleView = (cert: any) => {
    const doc = getIVCertificatePDF(cert.student_name || user?.full_name || 'Student', cert.batch || '2024', cert.date);
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getProfile();
      if (res.success && res.data?.user) {
        setUserData(res.data.user);
        const matches = (res.data.user.certificates || []).filter((c: any) => c.type === 'iv');
        setMyCertificates(matches);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="#c8102e" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 0 3rem 0' }}>
      {/* ── CINEMATIC LUXURY HERO SECTION ── */}
      <section style={{ 
        position: 'relative', 
        width: '100%', 
        height: '420px', 
        background: '#ffffff',
        borderRadius: '0 0 40px 40px',
        overflow: 'hidden',
        marginBottom: '4rem',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.04)'
      }}>
        {/* Dynamic AI Mesh Wave Component */}
        <AIWave />

        {/* Animated Mesh Background (Existing) */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {/* Soft Navy Gradient */}
          <div style={{ 
            position: 'absolute', 
            top: '-20%', 
            right: '-10%', 
            width: '60%', 
            height: '140%', 
            background: 'radial-gradient(circle, rgba(26, 38, 82, 0.04) 0%, transparent 70%)',
            transform: 'rotate(-15deg)',
            filter: 'blur(60px)'
          }} />
          
          {/* Crimson Red Glow */}
          <div style={{ 
            position: 'absolute', 
            bottom: '-10%', 
            left: '-5%', 
            width: '40%', 
            height: '80%', 
            background: 'radial-gradient(circle, rgba(200, 16, 46, 0.03) 0%, transparent 70%)',
            filter: 'blur(50px)'
          }} />

          {/* Holographic Accents */}
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              position: 'absolute', 
              top: '15%', 
              left: '25%', 
              width: '300px', 
              height: '300px', 
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }} 
          />

          {/* Certificate-inspired Line Art Pattern */}
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L30 60M0 30L60 30' stroke='%231a2652' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='30' cy='30' r='15' stroke='%23c8102e' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px'
          }} />
        </div>

        {/* Floating Particles */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0, 0.4, 0]
              }}
              transition={{ 
                duration: 4 + Math.random() * 4, 
                repeat: Infinity, 
                delay: Math.random() * 5 
              }}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '4px',
                height: '4px',
                background: i % 2 === 0 ? '#1a2652' : '#c8102e',
                borderRadius: '50%',
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 5rem', width: '100%' }}>
          <div style={{ maxWidth: '800px' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >

              <h1 style={{ 
                fontSize: '4.8rem', 
                fontWeight: 900, 
                color: '#0f172a', 
                margin: 0, 
                letterSpacing: '-0.04em',
                lineHeight: 1,
                fontFamily: "'Outfit', sans-serif"
              }}>
                Industrial Visit <br />
                <span style={{ 
                  position: 'relative',
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #c8102e 0%, #1a2652 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  paddingRight: '10px'
                }}>
                  Certifications
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 1 }}
                    style={{ 
                      position: 'absolute', 
                      bottom: '8px', 
                      left: 0, 
                      height: '6px', 
                      background: 'rgba(200, 16, 46, 0.1)', 
                      zIndex: -1,
                      borderRadius: '4px'
                    }} 
                  />
                </span>
              </h1>

              <p style={{ 
                color: '#64748b', 
                fontSize: '1.25rem', 
                marginTop: '1.5rem', 
                fontWeight: 500,
                maxWidth: '600px',
                lineHeight: 1.6
              }}>
                Official recognition of your professional exposure and technical mastery acquired through high-impact industrial engagements at <span style={{ color: '#1a2652', fontWeight: 700 }}>NeST Digital</span>.
              </p>
            </motion.div>
          </div>
        </div>

        {/* High-Definition Industrial Visual Integrated into Banner */}
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            position: 'absolute', 
            right: 0, 
            top: 0,
            bottom: 0,
            width: '55%', 
            zIndex: 1,
            overflow: 'hidden'
          }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative'
          }}>
            <img 
              src="/images/hero/iv_hero.png" 
              alt="Industrial Excellence" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.jpg";
              }}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                filter: 'contrast(1.05) brightness(1.05)'
              }} 
            />
            
            {/* Smooth Edge Fade to Left */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0.9) 10%, transparent 40%)',
              zIndex: 2
            }} />

            {/* Bottom Accent Glow */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(to top, rgba(26, 38, 82, 0.1), transparent)',
              zIndex: 2
            }} />

            {/* Scanline Effect */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%)',
              backgroundSize: '100% 4px',
              pointerEvents: 'none',
              zIndex: 3,
              opacity: 0.3
            }} />
          </div>
        </motion.div>
      </section>

      <div style={{ padding: '0 5rem' }}>

      {myCertificates.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {myCertificates.map((cert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ 
                background: 'linear-gradient(135deg, #1a2652 0%, #2a3b7d 100%)', 
                padding: '24px', 
                color: '#fff',
                position: 'relative'
              }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Award size={22} />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>IV Completion Certificate</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.7 }}>Verified Professional Credential</p>
              </div>

              <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Institution</label>
                  <p style={{ margin: '4px 0 0', fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>{cert.college}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visit Date</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <Calendar size={14} color="#64748b" />
                      <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>{cert.date}</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <ShieldCheck size={14} color="#22c55e" />
                      <span style={{ fontSize: '14px', color: '#22c55e', fontWeight: 700 }}>Verified</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={() => handleView(cert)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(26, 38, 82, 0.05)',
                      color: '#1a2652',
                      fontSize: '14px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Eye size={18} /> View
                  </button>
                  <button
                    onClick={() => handleDownload(cert)}
                    disabled={isDownloading === (cert.id || cert.date)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: '#c8102e',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: isDownloading === (cert.id || cert.date) ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isDownloading === (cert.id || cert.date) ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <><Download size={18} /> PDF</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '5rem 2rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}
        >
          <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#cbd5e1' }}>
            <Award size={40} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>No Certificates Yet</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your Industrial Visit certificates will appear here once they are issued by the administration.
          </p>
          <button 
            onClick={refreshData}
            style={{ 
              padding: '12px 32px', 
              borderRadius: '12px', 
              background: '#1a2652', 
              color: '#fff', 
              fontWeight: 700, 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <Loader2 size={18} className={loading ? "animate-spin" : ""} /> Check for Updates
          </button>
        </motion.div>
      )}
      </div>
    </div>
  );
};

export default IVCertificates;
