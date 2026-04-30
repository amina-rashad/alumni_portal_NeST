import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Award,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  MessageSquare,
  BookOpen as GitMerge,
  Loader2,
  Clock
} from 'lucide-react';
import { dashboardService, type DashboardStats } from '../../services/dashboardService';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, colorHex, trend, trendColor, icon: Icon }: { label: string, value: string, colorHex: string, trend: string, trendColor: string, icon: any }) => (
  <div style={{ backgroundColor: '#fff', borderRadius: '28px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '160px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.2s' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{ width: '48px', height: '48px', backgroundColor: `${colorHex}15`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colorHex }}>
        <Icon size={22} strokeWidth={3} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: trendColor }}>
        <TrendingUp size={14} strokeWidth={3} />
        <span style={{ fontSize: '11px', fontWeight: 900 }}>{trend}</span>
      </div>
    </div>
    <div style={{ marginTop: 'auto' }}>
      <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
        <ArrowUpRight size={18} style={{ color: '#cbd5e1' }} />
      </div>
    </div>
  </div>
);

const CM_Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardService.getDashboardKPIs();
      setStats(data);
    } catch (err) {
      toast.error('Failed to sync dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const kpiCards = [
    { label: 'Total Courses', value: String(stats?.totalCourses ?? 0), colorHex: '#1d4ed8', trend: '+12%', trendColor: '#059669', icon: BookOpen },
    { label: 'Total Enrollments', value: (stats?.totalEnrollments ?? 0).toLocaleString(), colorHex: '#c8102e', trend: '+18%', trendColor: '#059669', icon: Users },
    { label: 'Pending Reviews', value: String(stats?.pendingReviews ?? 0), colorHex: '#ea580c', trend: '+2%', trendColor: '#059669', icon: ClipboardCheck },
    { label: 'Certificates Issued', value: String(stats?.certificatesIssued ?? 0), colorHex: '#059669', trend: '+24%', trendColor: '#059669', icon: Award },
  ];

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 32px 48px 32px', display: 'flex', flexDirection: 'column', gap: '32px' }} className="font-['Inter',sans-serif]">
      
      {/* Professional Header Section */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ padding: '6px 12px', backgroundColor: '#fff1f2', color: '#c8102e', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '999px' }}>
            Academic Governance
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Calendar size={14} /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Educational Excellence <span style={{ color: '#c8102e' }}>Dashboard</span>
        </h1>
        
        <p style={{ fontSize: '16px', color: '#64748b', fontWeight: 500, maxWidth: '800px', lineHeight: 1.6 }}>
          Comprehensive oversight of curriculum performance, enrollment metrics, and student achievement tracks.
        </p>
      </div>

      {/* Critical Alerts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px 24px', borderRadius: '20px', border: '1px solid #fee2e2', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8102e' }}>
                <AlertCircle size={18}/>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>{stats?.pendingAlerts || 0} Critical Alerts</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>Requires Immediate Review</div>
              </div>
            </div>
            <ArrowUpRight size={14} color="#c8102e"/>
          </div>

          <div style={{ padding: '16px 24px', borderRadius: '20px', border: '1px solid #dbeafe', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <MessageSquare size={18}/>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>Unresolved Queries</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>Support Pipeline Active</div>
              </div>
            </div>
            <ArrowUpRight size={14} color="#3b82f6"/>
          </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {isLoading ? (
          [1,2,3,4].map(i => (
            <div key={i} style={{ height: '160px', backgroundColor: '#fff', borderRadius: '28px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 className="animate-spin text-slate-200" />
            </div>
          ))
        ) : kpiCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }} className="xl-grid">
        
        {/* Student Engagement Widget */}
        <div style={{ backgroundColor: '#1a2652', borderRadius: '40px', padding: '40px', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ padding: '6px 12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '999px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Live Analytics
                </span>
              </div>
              <h3 style={{ fontSize: '36px', fontWeight: 900, color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '16px' }}>
                Student Engagement is at <span style={{ color: '#10b981' }}>{stats?.engagementRate || 0}%</span>
              </h3>
              <p style={{ color: '#c7d2fe', fontSize: '15px', fontWeight: 500, lineHeight: 1.6, maxWidth: '400px' }}>
                {stats?.engagementRate || 0}% of enrolled students are maintaining active session tracks. Daily velocity is stable.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '40px' }}>
                <div style={{ display: 'flex', marginLeft: '12px' }}>
                  {[1,2,3,4].map((i, idx) => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #1a2652', marginLeft: '-12px', zIndex: 10 - idx }} alt="Student" />
                  ))}
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #1a2652', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: 'white', marginLeft: '-12px', zIndex: 1 }}>+84</div>
                </div>
                <button onClick={() => navigate('/course-manager/insights')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '13px', fontWeight: 900, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Detailed Insights <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            <div style={{ width: '280px', height: '220px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>DAU Trend</div>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px', marginTop: '20px' }}>
                {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                  <div key={i} style={{ flex: 1, backgroundColor: '#10b981', borderRadius: '999px', opacity: 0.9, width: '100%', height: `${h}%` }} />
                ))}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '16px' }}>
                {stats?.activeToday || '0'} <span style={{ fontSize: '10px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Today</span>
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '380px', height: '380px', backgroundColor: '#10b981', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.2, pointerEvents: 'none' }} />
        </div>

        {/* Sidebar Widgets */}
        <div style={{ backgroundColor: '#fff', borderRadius: '40px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Quick Operations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Design New Course', path: '/course-manager/courses/create', icon: BookOpen, color: '#c8102e' },
                  { label: 'Attendance Reports', path: '/course-manager/attendance', icon: Clock, color: '#475569' },
                  { label: 'Student Directory', path: '/course-manager/students', icon: Users, color: '#475569' },
                ].map((op, i) => (
                  <button 
                    key={i}
                    onClick={() => navigate(op.path)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid transparent', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <op.icon size={18} color={op.color} />
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{op.label}</span>
                    </div>
                    <ArrowUpRight size={16} color="#cbd5e1" />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Status</span>
               </div>
               <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', lineHeight: 1.5 }}>
                  All synchronization pipelines are operational. Last backup: <span style={{ color: '#0f172a' }}>14 mins ago</span>.
               </p>
            </div>
        </div>
      </div>
      
      <style>
        {`
          @media (max-width: 1024px) {
            .xl-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CM_Dashboard;
