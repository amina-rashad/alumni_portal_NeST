import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Award, Target, 
  BarChart3, Activity,
  Zap, Users,
  ChevronRight, Sparkles, History, Info, BookOpen, Calendar, Trophy, Medal, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SKILLS_DATA = [
  { name: 'React', level: 92, category: 'Frontend' },
  { name: 'Go', level: 78, category: 'Backend' },
  { name: 'System Design', level: 85, category: 'Architecture' },
  { name: 'Cloud Ops', level: 65, category: 'Infrastructure' },
  { name: 'Security', level: 72, category: 'General' },
  { name: 'Cybernetics', level: 58, category: 'Innovation' },
];

const USER_POINTS = {
  total: 2450,
  level: "Gold",
  nextLevel: "Platinum",
  progressToNext: 65, // percentage
  pointsToNext: 1550,
  recentActivities: [
    { id: 1, type: 'Course Completion', name: 'Advanced Cloud Architecture', points: 500, date: '2026-03-24', icon: <BookOpen size={18} /> },
    { id: 2, type: 'Referral', name: 'Referred John Doe (Batch of 2018)', points: 1000, date: '2026-03-20', icon: <Users size={18} /> },
    { id: 3, type: 'Event Participation', name: 'Tech Conclave 2026', points: 200, date: '2026-03-15', icon: <Calendar size={18} /> },
    { id: 4, type: 'Community Activity', name: 'Answered 5 forum questions', points: 150, date: '2026-03-10', icon: <Zap size={18} /> },
    { id: 5, type: 'Daily Check-in', name: '7-day streak bonus', points: 50, date: '2026-03-08', icon: <TrendingUp size={18} /> },
  ],
  waysToEarn: [
    { title: 'Refer an Alumni', points: 1000, desc: 'Help your batchmates find the community.', icon: <Users /> },
    { title: 'Complete a Certification', points: 500, desc: 'Finish any of our professional courses.', icon: <Award /> },
    { title: 'Speak at an Event', points: 2000, desc: 'Share your expertise with the network.', icon: <TrendingUp /> },
    { title: 'Mentorship Session', points: 300, desc: 'Conduct a 1-hour session for juniors.', icon: <Users /> },
  ]
};

const PerformanceAnalysis: React.FC = () => {
  const [hoveredWay, setHoveredWay] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem', fontFamily: '"Inter", "Montserrat", sans-serif' }}>
      
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '3rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Performance <span style={{ color: '#d32f2f' }}>Analysis</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '1.1rem' }}>Comprehensive overview of your technical growth and community contributions.</p>
        </motion.div>
      </div>

      {/* ── Top Level Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
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
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${kpi.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <kpi.icon size={22} color={kpi.color} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{kpi.label}</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{kpi.value}</span>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* ── Left Column: Skills and Points Balance ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Points Balance Card (High Fidelity) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'linear-gradient(135deg, #0d2046 0%, #1e293b 100%)', 
              color: 'white', 
              padding: '2.5rem', 
              borderRadius: '2rem', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                <Zap size={16} fill="white" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Points Balance</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '2rem' }}>
                <motion.h2 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ fontSize: '4.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}
                >
                  {USER_POINTS.total.toLocaleString()}
                </motion.h2>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, opacity: 0.6 }}>POINTS</span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={18} color="#facc15" />
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{USER_POINTS.level} Rank</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.6 }}>{USER_POINTS.progressToNext}% to {USER_POINTS.nextLevel}</span>
                </div>
                
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${USER_POINTS.progressToNext}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ height: '100%', background: '#c8102e', borderRadius: '4px', boxShadow: '0 0 10px rgba(200, 16, 46, 0.5)' }}
                  ></motion.div>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6, fontWeight: 500 }}>
                  Earn {USER_POINTS.pointsToNext.toLocaleString()} more points to reach {USER_POINTS.nextLevel} status.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Skill Proficiency Matrix */}
          <div className="luxury-card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Skill Mastery Matrix</h2>
              <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <BarChart3 size={18} /> Technical Proficiency
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {SKILLS_DATA.map((skill, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span style={{ fontWeight: 700, color: '#475569', fontSize: '1rem' }}>
                      {skill.name} <span style={{ fontWeight: 400, color: '#94A3B8', fontSize: '0.85rem', marginLeft: '0.5rem' }}>• {skill.category}</span>
                    </span>
                    <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>{skill.level}%</span>
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
        </div>

        {/* ── Right Column: Ways to Earn and Activities ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Recent Activity Chart */}
          <div className="luxury-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Activity size={20} color="#d32f2f" /> Engagement Velocity
            </h3>
            
            <div style={{ position: 'relative', height: '140px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
              {[60, 45, 80, 55, 90, 75, 40, 85, 30].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  style={{ flex: 1, background: i === 4 ? '#d32f2f' : '#E2E8F0', borderRadius: '6px' }} 
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800 }}>JAN</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800 }}>JUN</span>
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>Course completion rate</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10B981' }}>+12%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>Learning velocity</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>High</span>
              </div>
            </div>
          </div>

          {/* Ways to Earn */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0d2046', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={22} color="#c8102e" /> Community Growth
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {USER_POINTS.waysToEarn.map((way, idx) => (
                <motion.div
                  key={idx}
                  onMouseEnter={() => setHoveredWay(idx)}
                  onMouseLeave={() => setHoveredWay(null)}
                  whileHover={{ x: 5, boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.05)' }}
                  style={{
                    background: 'white',
                    padding: '1.25rem',
                    borderRadius: '1.5rem',
                    border: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem'
                  }}
                >
                  <div style={{ 
                    background: hoveredWay === idx ? '#c8102e' : '#f8fafc', 
                    color: hoveredWay === idx ? 'white' : '#c8102e',
                    padding: '0.8rem', 
                    borderRadius: '1rem',
                    transition: 'all 0.2s ease'
                  }}>
                    {React.cloneElement(way.icon as React.ReactElement<{ size?: number }>, { size: 22 })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{way.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c8102e', fontWeight: 800, fontSize: '0.9rem' }}>
                      <Zap size={15} fill="#c8102e" />
                      +{way.points} pts
                    </div>
                  </div>
                  <ChevronRight size={18} color="#CBD5E1" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Level Benefits Snippet */}
          <div className="luxury-card" style={{ padding: '1.75rem', border: '1px dashed #E2E8F0', background: '#F8FAFC' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d2046', marginBottom: '1.25rem' }}>{USER_POINTS.level} Rank Benefits</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { title: 'Meetups', icon: <Users size={14} /> },
                { title: 'Early Access', icon: <Zap size={14} /> },
                { title: 'Premium Job', icon: <Medal size={14} /> },
                { title: 'Discounts', icon: <Shield size={14} /> }
              ].map((benefit, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', borderRadius: '0.75rem', backgroundColor: 'white', border: '1px solid #F1F5F9' }}>
                  <div style={{ color: '#c8102e', display: 'flex' }}>{benefit.icon}</div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{benefit.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
        
        {/* ── Transaction History ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="luxury-card"
          style={{ padding: '2.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <History size={22} color="#c8102e" /> Point History
            </h3>
            <button style={{ 
              background: 'none', 
              border: 'none', 
              color: '#3b82f6', 
              fontWeight: 700, 
              fontSize: '0.9rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              View Full Statement <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#f1f5f9', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
            {USER_POINTS.recentActivities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ backgroundColor: '#fcfcfc' }}
                style={{ 
                  background: 'white', 
                  padding: '1.5rem 1.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ color: '#0d2046', opacity: 0.5 }}>{activity.icon}</div>
                  <div>
                    <h5 style={{ margin: '0 0 0.2rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>{activity.name}</h5>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{activity.type}</span>
                      <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22c55e' }}>+{activity.points}</span>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Recommended Path Card */}
          <div className="luxury-card" style={{ padding: '2rem', background: '#0F172A', color: 'white', position: 'relative', overflow: 'hidden', height: 'fit-content' }}>
             <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.15 }}>
               <TrendingUp size={120} color="white" />
             </div>
             <div style={{ position: 'relative', zIndex: 1 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                 <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                   <Trophy size={20} color="#FACC15" />
                 </div>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Strategic Next Step</h3>
               </div>
               <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                 Based on your current tech stack and community engagement, we recommend the <strong>Advanced LLM Fine-tuning</strong> certification.
               </p>
               <Link 
                 to="/courses"
                 style={{ 
                   width: '100%', 
                   padding: '1rem', 
                   borderRadius: '12px', 
                   background: '#d32f2f', 
                   color: 'white', 
                   border: 'none', 
                   fontWeight: 800, 
                   fontSize: '0.9rem',
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '0.6rem',
                   textDecoration: 'none',
                   transition: '0.2s'
                 }}
                 onMouseEnter={e => e.currentTarget.style.background = '#b71c1c'}
                 onMouseLeave={e => e.currentTarget.style.background = '#d32f2f'}
               >
                 View Recommended Course <ChevronRight size={18} />
               </Link>
             </div>
          </div>

          {/* Pro Tip Card */}
          <div style={{ padding: '2rem', borderRadius: '2rem', backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7', display: 'flex', gap: '1.25rem' }}>
            <div style={{ color: '#D97706', marginTop: '4px' }}><Info size={24} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#92400E', marginBottom: '0.4rem' }}>Optimizing Results</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#B45309', lineHeight: 1.5, opacity: 0.9 }}>
                Mentoring sessions for juniors yield a <strong style={{ color: '#92400E' }}>2.5x higher</strong> engagement score compared to standard forum activity.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .luxury-card {
           background: #ffffff;
           border-radius: 2rem;
           border: 1px solid rgba(226, 232, 240, 0.8);
           box-shadow: 0 4px 25px rgba(0, 0, 0, 0.04);
           transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .luxury-card:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
};

export default PerformanceAnalysis;
