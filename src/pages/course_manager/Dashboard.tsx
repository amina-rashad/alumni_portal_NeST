import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Users, ClipboardCheck, Award, 
  TrendingUp, ArrowUpRight, Calendar, Activity, 
  Star, Clock, Bell, MessageSquare, Trophy, 
  ChevronRight, BookOpen as GitMerge,
  ArrowRight
} from 'lucide-react';
import { courseManagerAPI } from '../../services/api';

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}> = ({ title, value, change, icon, color, loading }) => (
  <motion.div
    whileHover={{ y: -5 }}
    style={{
      background: '#fff',
      padding: '24px',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ padding: '12px', borderRadius: '16px', background: `${color}10`, color }}>
        {icon}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', fontWeight: 700 }}>
        <TrendingUp size={14} /> {change}
      </div>
    </div>
    <div>
      <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>{title}</div>
      {loading ? (
        <div style={{ height: '34px', width: '80px', background: '#f1f5f9', borderRadius: '8px' }} className="skeleton-pulse" />
      ) : (
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{value}</div>
      )}
    </div>
  </motion.div>
);

const CM_Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const brandPrimary = '#c8102e';
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Using existing API for now, simulating stats if not fully implemented in backend
        const res = await courseManagerAPI.fetchCourses();
        if (res.data) {
          setStats({
            total_courses: res.data.length || 0,
            total_enrollments: res.data.reduce((acc: number, curr: any) => acc + (curr.students || 0), 0),
            pending_reviews: 8,
            certificates_issued: 856
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Academic Governance</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Global oversight of academic tracks and learner progression.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/course-manager/courses/create')}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              background: brandPrimary,
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(200, 16, 46, 0.2)'
            }}
          >
            <GitMerge size={18} /> Design Course
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard title="Active Courses" value={stats?.total_courses || "0"} change="+3" icon={<BookOpen size={24} />} color={brandPrimary} loading={isLoading} />
        <StatCard title="Learner Enrollments" value={stats?.total_enrollments?.toLocaleString() || "0"} change="+12.4%" icon={<Users size={24} />} color="#0ea5e9" loading={isLoading} />
        <StatCard title="Pending Assessments" value={stats?.pending_reviews || "0"} change="+5" icon={<ClipboardCheck size={24} />} color="#f59e0b" loading={isLoading} />
        <StatCard title="Credentials Issued" value={stats?.certificates_issued || "0"} change="+24" icon={<Award size={24} />} color="#10b981" loading={isLoading} />
      </div>

      {/* Main Content Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Featured Analytics Card */}
          <section style={{
            background: 'linear-gradient(135deg, #1a2652 0%, #0f172a 100%)',
            padding: '40px',
            borderRadius: '32px',
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)'
          }}>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Live Platform Health</span>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.2 }}>Platform Engagement is at <span style={{ color: '#10b981' }}>Peak Velocity.</span></h2>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '16px', fontWeight: 500, maxWidth: '500px', lineHeight: 1.6 }}>
                Daily active learners have increased by 14.2% compared to last week. Average course completion time is down by 4 days.
              </p>
              
              <div style={{ display: 'flex', gap: '32px', marginTop: '40px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px' }}>Active Streak</div>
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>84% <TrendingUp size={18} color="#10b981" /></div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px' }}>Session Depth</div>
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>42 min <Star size={18} color="#f59e0b" fill="#f59e0b" /></div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/course-manager/performance')}
                style={{
                  marginTop: '40px',
                  padding: '14px 28px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                View Detailed Insights <ArrowRight size={18} />
              </button>
            </div>

            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(200, 16, 46, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
          </section>

          {/* Quick Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div 
              onClick={() => navigate('/course-manager/students')}
              style={{
                background: '#fff',
                padding: '32px',
                borderRadius: '32px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(14, 165, 233, 0.05)', color: '#0ea5e9', width: 'fit-content' }}>
                <Users size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>Learner Directory</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Manage student profiles and enrollment records.</p>
              </div>
            </div>
            
            <div 
              onClick={() => navigate('/course-manager/certificates')}
              style={{
                background: '#fff',
                padding: '32px',
                borderRadius: '32px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', width: 'fit-content' }}>
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>Credential Center</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Issue and verify digital academic certificates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Notifications / Alerts Widget */}
          <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={18} color={brandPrimary} /> Governance Alerts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { title: '8 Course Proposals', desc: 'Awaiting curriculum verification', time: '2h ago', icon: <BookOpen size={14} />, color: '#c8102e' },
                { title: '14 Forum Threads', desc: 'Moderation required in React track', time: '5h ago', icon: <MessageSquare size={14} />, color: '#0ea5e9' },
                { title: '32 Achievements', desc: 'Unlocked by students in Python core', time: '12h ago', icon: <Trophy size={14} />, color: '#f59e0b' }
              ].map((alert, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', background: `${alert.color}08`, color: alert.color, height: 'fit-content' }}>
                    {alert.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{alert.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>{alert.desc}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/course-manager/reminders')}
              style={{ width: '100%', marginTop: '32px', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'transparent', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              Open Alert Center
            </button>
          </section>

          {/* Quick Stats Widget */}
          <section style={{ background: '#f8fafc', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Pathways Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Technical Tracks', value: 12, total: 15, color: '#c8102e' },
                { label: 'Soft Skills', value: 4, total: 6, color: '#0ea5e9' },
                { label: 'Leadership Track', value: 3, total: 4, color: '#10b981' }
              ].map((path, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    <span style={{ color: '#475569' }}>{path.label}</span>
                    <span style={{ color: '#1e293b' }}>{path.value}/{path.total}</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(path.value / path.total) * 100}%`, background: path.color, borderRadius: '3px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CM_Dashboard;
