import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Briefcase, FileText, UserCheck, Clock, TrendingUp, Users, UserPlus, 
  ChevronRight, BarChart3, Filter, MoreHorizontal, CheckCircle2, AlertCircle
} from 'lucide-react';
import { recruiterApi, getUser, type AuthUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// --- ANIMATION VARIANTS (Consistent with User Dashboard) ---
const smoothSpring = { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 };

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { ...smoothSpring, staggerChildren: 0.1, delayChildren: 0.05 } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: smoothSpring }
};

const RecruiterDashboard: React.FC = () => {
  const [user, setUserData] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState({
    total_jobs: 0,
    total_applications: 0,
    shortlisted: 0,
    hired: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getUser() as unknown as AuthUser;
    if (currentUser) setUserData(currentUser);

    const fetchStats = async () => {
      try {
        const response = await recruiterApi.getStats();
        if (response.success && response.data) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Error fetching recruiter stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Open Roles', value: stats.total_jobs, icon: <Briefcase size={20} />, color: '#1a2652' },
    { title: 'Total Applicants', value: stats.total_applications, icon: <Users size={20} />, color: '#c8102e' },
    { title: 'Shortlisted', value: stats.shortlisted, icon: <UserCheck size={20} />, color: '#10b981' },
    { title: 'Hired This Month', value: stats.hired, icon: <TrendingUp size={20} />, color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #1a2652', borderRadius: '50%' }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      
      {/* LUXURY CSS OVERRIDES (Internal to match Dashboard.tsx structure) */}
      <style>{`
        .luxury-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .luxury-card:hover {
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
          border-color: rgba(26, 38, 82, 0.1);
        }
        .btn-premium {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: pointer;
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
        }
        @keyframes jitter {
          0% { transform: translate(0,0) }
          10% { transform: translate(-0.5%,-0.5%) }
          20% { transform: translate(0.5%,0.5%) }
          100% { transform: translate(0,0) }
        }
        .noise-overlay {
          position: absolute;
          inset: -100%;
          width: 300%;
          height: 300%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          animation: jitter 0.3s steps(2) infinite;
          zIndex: 0;
        }
        .premium-banner {
          position: relative;
          padding: 3rem;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(26, 38, 82, 0.08);
          overflow: hidden;
          margin-bottom: 2.5rem;
          box-shadow: 0 20px 40px -12px rgba(26, 38, 82, 0.08);
        }
        .mesh-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.1;
          pointer-events: none;
        }
      `}</style>

      {/* ── PREMIUM BANNER ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-banner"
      >
        <div className="noise-overlay" />
        <div className="mesh-blob" style={{ width: '400px', height: '400px', top: '-100px', left: '-100px', background: 'radial-gradient(circle, #1a2652 0%, transparent 70%)' }}></div>
        <div className="mesh-blob" style={{ width: '300px', height: '300px', bottom: '-80px', right: '-50px', background: 'radial-gradient(circle, #c8102e 0%, transparent 70%)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ padding: '6px 12px', background: 'rgba(26,38,82,0.06)', borderRadius: '99px', fontSize: '11px', fontWeight: 800, color: '#1a2652', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Talent Acquisition
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Active Hiring Season</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>
            Welcome back, <span style={{ color: '#c8102e' }}>{user?.full_name.split(' ')[0]}</span>.
          </h1>
          <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: '1.1rem', fontWeight: 500, maxWidth: '600px', lineHeight: 1.6 }}>
            Ready to build the future? You have <span style={{ color: '#1a2652', fontWeight: 700 }}>{stats.pending} pending reviews</span> across your active listings.
          </p>
        </div>
      </motion.div>

      {/* ── METRICS GRID ── */}
      <motion.div 
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '3rem' }}
      >
        {statCards.map((card, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="luxury-card"
            style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${card.color}10`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {card.icon}
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{card.title}</p>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* ── HIRING PIPELINE ── */}
        <motion.section variants={sectionVariants} initial="hidden" animate="visible">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={24} color="#1a2652" />
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Recent Hiring Pipeline</h2>
            </div>
            <button 
              onClick={() => navigate('/recruiter/applications')}
              className="link-hover" 
              style={{ background: 'transparent', border: 'none', color: '#1a2652', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              See Pipeline <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { role: 'Senior Software Engineer', candidates: 12, stage: 'Interviewing', status: 'high' },
              { role: 'UI/UX Designer', candidates: 8, stage: 'Technical Assessment', status: 'medium' },
              { role: 'Product Manager', candidates: 15, stage: 'Resume Screening', status: 'critical' },
              { role: 'Data Scientist', candidates: 5, stage: 'Offer Phase', status: 'success' },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="luxury-card btn-premium"
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={20} color="#64748b" />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{item.role}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{item.candidates} Active Candidates</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {item.status === 'success' && <CheckCircle2 size={14} color="#10b981" />}
                      {item.status === 'critical' && <AlertCircle size={14} color="#ef4444" />}
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{item.stage}</span>
                   </div>
                   <div style={{ width: '120px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: item.status === 'high' ? '70%' : item.status === 'medium' ? '40%' : item.status === 'critical' ? '20%' : '95%' }}
                        style={{ height: '100%', background: item.status === 'success' ? '#10b981' : item.status === 'critical' ? '#ef4444' : '#1a2652' }}
                      />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── QUICK ACTIONS & TIPS ── */}
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <div className="luxury-card" style={{ padding: '28px', background: '#1a2652', color: '#fff', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            <div className="noise-overlay" style={{ opacity: 0.1 }} />
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 700 }}>Recruiter Tools</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => navigate('/recruiter/jobs/post')}
                className="btn-premium"
                style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <UserPlus size={18} /> Create New Job
              </button>
              <button 
                onClick={() => navigate('/recruiter/applications')}
                className="btn-premium"
                style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <Filter size={18} /> Bulk Filter Applicants
              </button>
            </div>
            
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
               <p style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>Quick Tip</p>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <TrendingUp size={20} color="#10b981" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'rgba(255,255,255,0.8)' }}>
                    Personalizing rejection feedback improves alumni promoter score by 22%.
                  </p>
               </div>
            </div>
          </div>

          <div className="luxury-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Top Talent Pool</h3>
              <MoreHorizontal size={18} color="#94a3b8" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { name: 'Arun Kumar', role: 'Fullstack Dev', score: '98%' },
                { name: 'Kavita Iyer', role: 'System Architect', score: '95%' },
                { name: 'Siddharth M', role: 'Data Engineer', score: '92%' }
              ].map((person, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{person.name.charAt(0)}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{person.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{person.role}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>{person.score}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
      
      <div style={{ paddingBottom: '4rem' }} />
    </div>
  );
};

export default RecruiterDashboard;
