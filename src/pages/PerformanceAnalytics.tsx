import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Award, Target, 
  BarChart3, Activity,
  Zap, Users,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SKILLS_DATA = [
  { name: 'React', level: 92, category: 'Frontend' },
  { name: 'Go', level: 78, category: 'Backend' },
  { name: 'System Design', level: 85, category: 'Architecture' },
  { name: 'Cloud Ops', level: 65, category: 'Infrastucture' },
  { name: 'Security', level: 72, category: 'General' },
  { name: 'Cybernetics', level: 58, category: 'Innovation' },
];

const PerformanceAnalytics: React.FC = () => {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Header and Back Link */}
      <div style={{ marginBottom: '3rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Performance <span style={{ color: '#d32f2f' }}>Analytics</span>
          </h1>
        </motion.div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'Total Career XP', value: '15.4K', icon: Zap, color: '#F59E0B' },
          { label: 'Assessments Passed', value: '12', icon: Target, color: '#10B981' },
          { label: 'Rank Percentile', value: 'Top 5%', icon: Award, color: '#6366F1' },
          { label: 'Network Reach', value: '450+', icon: Users, color: '#3B82F6' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="luxury-card"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${kpi.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <kpi.icon size={20} color={kpi.color} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{kpi.value}</span>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        
        {/* Skill Proficiency Matrix */}
        <div className="luxury-card" style={{ padding: '2rem', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Skill Mastery Matrix</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={16} /> Technical Proficiency
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {SKILLS_DATA.map((skill, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.95rem' }}>
                    {skill.name} <span style={{ fontWeight: 400, color: '#94A3B8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>• {skill.category}</span>
                  </span>
                  <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{skill.level}%</span>
                </div>
                <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + index * 0.1 }}
                    style={{ 
                      height: '100%', 
                      background: skill.level > 80 ? 'linear-gradient(90deg, #d32f2f, #ef4444)' : 'linear-gradient(90deg, #334155, #64748B)', 
                      borderRadius: '10px' 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Learning Activity Chart (Visual placeholder) */}
          <div className="luxury-card" style={{ padding: '2rem', flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Activity size={18} color="#d32f2f" /> Recent Activity
            </h3>
            
            <div style={{ position: 'relative', height: '120px', display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
              {[60, 45, 80, 55, 90, 75, 40, 85, 30].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  style={{ flex: 1, background: i === 4 ? '#d32f2f' : '#E2E8F0', borderRadius: '4px' }} 
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>JAN</span>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>JUN</span>
            </div>
            
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Course completion rate</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981' }}>+12%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Learning velocity</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>High</span>
              </div>
            </div>
          </div>

          {/* Recommended Path Card */}
          <div className="luxury-card" style={{ padding: '1.5rem', background: '#0F172A', color: 'white', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
               <TrendingUp size={100} color="white" />
             </div>
             <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Next Milestone</h3>
             <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
               Based on your AI proficiency, we recommend the <strong>Advanced LLM Fine-tuning</strong> certification.
             </p>
             <Link 
               to="/courses"
               style={{ 
                 width: '100%', 
                 padding: '0.75rem', 
                 borderRadius: '10px', 
                 background: '#d32f2f', 
                 color: 'white', 
                 border: 'none', 
                 fontWeight: 700, 
                 fontSize: '0.85rem',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '0.5rem',
                 textDecoration: 'none'
               }}
             >
               Explore Now <ChevronRight size={16} />
             </Link>
          </div>
        </div>
      </div>

      <style>{`
        .luxury-card {
           background: #ffffff;
           border-radius: 24px;
           border: 1px solid rgba(226, 232, 240, 0.8);
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
           transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>
    </div>
  );
};

export default PerformanceAnalytics;
