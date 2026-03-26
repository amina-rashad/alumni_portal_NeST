import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, TrendingUp, Award, Calendar, 
  ChevronRight, Zap, Info, 
  History, Users, BookOpen,
  Trophy, Medal, Shield, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Mock Data ──

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

const PointsOverview: React.FC = () => {
  const [hoveredWay, setHoveredWay] = useState<number | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem 1.5rem', 
        fontFamily: '"Inter", sans-serif',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}
    >
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}>
            <motion.div whileHover={{ x: -4 }} style={{ display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={20} style={{ marginRight: '0.75rem' }} /> 
              <span style={{ fontWeight: 600 }}>Back to Dashboard</span>
            </motion.div>
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/gamification/leaderboard" style={{ 
            padding: '0.6rem 1.25rem', 
            borderRadius: '0.75rem', 
            background: 'white', 
            color: '#0d2046', 
            textDecoration: 'none', 
            fontSize: '0.875rem', 
            fontWeight: 700,
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <Trophy size={16} color="#eab308" /> View Leaderboard
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* ── Main Points Balance ── */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
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
          {/* Abstract decoration */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              <Zap size={16} fill="white" />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Balance</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '2rem' }}>
              <motion.h2 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                style={{ fontSize: '4rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}
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

        {/* ── Ways to Earn ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d2046', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#c8102e" /> Ways to Earn
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {USER_POINTS.waysToEarn.map((way, idx) => (
              <motion.div
                key={idx}
                onMouseEnter={() => setHoveredWay(idx)}
                onMouseLeave={() => setHoveredWay(null)}
                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                style={{
                  background: 'white',
                  padding: '1.25rem',
                  borderRadius: '1.25rem',
                  border: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}
              >
                <div style={{ 
                  background: hoveredWay === idx ? '#c8102e' : '#f8fafc', 
                  color: hoveredWay === idx ? 'white' : '#c8102e',
                  padding: '0.75rem', 
                  borderRadius: '0.75rem',
                  transition: 'all 0.2s ease'
                }}>
                  {React.cloneElement(way.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{way.title}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>{way.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#c8102e', fontWeight: 800, fontSize: '0.875rem' }}>
                    <Zap size={14} fill="#c8102e" />
                    +{way.points} pts
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        
        {/* ── Transaction History ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ 
            background: 'white', 
            borderRadius: '2rem', 
            padding: '2rem', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f1f5f9'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d2046', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} color="#c8102e" /> Point History
            </h3>
            <button style={{ 
              background: 'none', 
              border: 'none', 
              color: '#3b82f6', 
              fontWeight: 700, 
              fontSize: '0.875rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              View Full Statement <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#f1f5f9', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
            {USER_POINTS.recentActivities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ backgroundColor: '#fcfcfc' }}
                style={{ 
                  background: 'white', 
                  padding: '1.25rem 1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ color: '#0d2046', opacity: 0.5 }}>{activity.icon}</div>
                  <div>
                    <h5 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{activity.name}</h5>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{activity.type}</span>
                      <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#22c55e' }}>+{activity.points}</span>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Level Benefits ── */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ 
            background: 'white', 
            borderRadius: '2rem', 
            padding: '2rem', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f1f5f9'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d2046', marginBottom: '1.5rem' }}>{USER_POINTS.level} Benefits</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { title: 'Exclusive Meetups', icon: <Users size={16} /> },
                { title: 'Early Course Access', icon: <Zap size={16} /> },
                { title: 'Premium Job Portal', icon: <Medal size={16} /> },
                { title: 'Certification Discounts', icon: <Shield size={16} /> }
              ].map((benefit, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: '#f8fafc' }}>
                  <div style={{ color: '#c8102e', display: 'flex' }}>{benefit.icon}</div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{benefit.title}</span>
                </div>
              ))}
            </div>
            <button style={{ 
              width: '100%', 
              marginTop: '1.5rem', 
              padding: '1rem', 
              borderRadius: '1rem', 
              background: '#0d2046', 
              color: 'white', 
              border: 'none', 
              fontWeight: 700, 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(13, 32, 70, 0.2)'
            }}>
              Explore All Rewards
            </button>
          </div>

          {/* Quick Tip */}
          <div style={{ padding: '1.5rem', borderRadius: '1.5rem', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', display: 'flex', gap: '1rem' }}>
            <div style={{ color: '#f97316' }}><Info size={20} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#9a3412', marginBottom: '0.25rem' }}>Pro Tip!</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#c2410c', lineHeight: 1.5 }}>
                Referring just one alumni from your batch gives you a massive 1,000 pt boost!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PointsOverview;
