import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Calendar, ShieldCheck, Loader2, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUser, usersApi } from '../services/api';
import { generateIVCertificate, getIVCertificatePDF } from '../utils/CertificateGenerator';

const IVCertificates: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUserData] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>

          Industrial Visit <span style={{ color: '#c8102e' }}>Certifications</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>
          Official recognition of your professional exposure at NeST Digital.
        </p>
      </div>

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
  );
};

export default IVCertificates;
