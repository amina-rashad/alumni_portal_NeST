import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Search, ChevronUp 
} from 'lucide-react';

interface Alumnus {
  id: string;
  rank: number;
  name: string;
  points: number;
  badges: number;
  department: string;
  avatar: string;
  trend: 'up' | 'down' | 'stable';
  level: number;
}

const MOCK_LEADERBOARD: Alumnus[] = [
  { id: '1', rank: 1, name: 'Sidharth S', points: 15420, badges: 24, department: 'Engineering', avatar: 'SS', trend: 'up', level: 42 },
  { id: '2', rank: 2, name: 'Anjali Nair', points: 14850, badges: 21, department: 'Digital', avatar: 'AN', trend: 'up', level: 38 },
  { id: '3', rank: 3, name: 'Rahul Krishnan', points: 13900, badges: 19, department: 'Cybernetics', avatar: 'RK', trend: 'down', level: 35 },
  { id: '4', rank: 4, name: 'Meera Das', points: 12500, badges: 15, department: 'Digital', avatar: 'MD', trend: 'stable', level: 32 },
  { id: '5', rank: 5, name: 'Arjun P', points: 11800, badges: 12, department: 'Engineering', avatar: 'AP', trend: 'up', level: 30 },
  { id: '6', rank: 6, name: 'Sneha Roy', points: 10500, badges: 10, department: 'HR', avatar: 'SR', trend: 'stable', level: 28 },
  { id: '7', rank: 7, name: 'Aditya V', points: 9800, badges: 9, department: 'Digital', avatar: 'AV', trend: 'down', level: 25 },
  { id: '8', rank: 8, name: 'Priya M', points: 8900, badges: 8, department: 'Engineering', avatar: 'PM', trend: 'up', level: 22 },
];

const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'all-time'>('monthly');
  const [searchTerm, setSearchTerm] = useState('');
  
  const topThree = MOCK_LEADERBOARD.slice(0, 3);
  const others = MOCK_LEADERBOARD.slice(3);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '3rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}
        >
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Alumni <span style={{ color: '#d32f2f' }}>Leaderboard</span>
            </h1>
          </div>
          
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.4rem', borderRadius: '14px', gap: '0.25rem' }}>
            <button 
              onClick={() => setActiveTab('monthly')}
              style={{ 
                padding: '0.6rem 1.25rem', 
                borderRadius: '10px', 
                border: 'none',
                background: activeTab === 'monthly' ? '#fff' : 'transparent',
                color: activeTab === 'monthly' ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'monthly' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              This Month
            </button>
            <button 
              onClick={() => setActiveTab('all-time')}
              style={{ 
                padding: '0.6rem 1.25rem', 
                borderRadius: '10px', 
                border: 'none',
                background: activeTab === 'all-time' ? '#fff' : 'transparent',
                color: activeTab === 'all-time' ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'all-time' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              All Time
            </button>
          </div>
        </motion.div>

        {/* Top 3 Podium Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '2rem', 
          alignItems: 'flex-end',
          paddingTop: '2rem'
        }}>
          {/* Rank 2 (Silver) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="podium-card silver"
            style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '2rem 1.5rem', 
              textAlign: 'center',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#94A3B8', color: 'white', padding: '0.4rem 1rem', borderRadius: '12px', fontWeight: 800 }}>
              2ND
            </div>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F1F5F9', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#475569', border: '4px solid #CBD5E1' }}>
              {topThree[1].avatar}
            </div>
            <h3 style={{ margin: '0 0 0.25rem', color: '#0F172A', fontWeight: 700 }}>{topThree[1].name}</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1rem' }}>{topThree[1].department}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#d32f2f' }}>{topThree[1].points.toLocaleString()}</span>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points</span>
              </div>
            </div>
          </motion.div>

          {/* Rank 1 (Gold) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'linear-gradient(135deg, #FFF 0%, #FAFAFA 100%)', 
              borderRadius: '28px', 
              padding: '3rem 2rem', 
              textAlign: 'center',
              border: '2px solid #FEF3C7',
              boxShadow: '0 20px 50px rgba(212, 163, 115, 0.15)',
              position: 'relative',
              transform: 'scale(1.1)',
              zIndex: 2
            }}
          >
            <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)' }}>
               <motion.div
                 animate={{ rotate: [0, 10, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 4 }}
               >
                 <Crown size={60} color="#F59E0B" fill="#F59E0B" />
               </motion.div>
            </div>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#FFFBEB', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#92400E', border: '5px solid #FCD34D', boxShadow: '0 0 20px rgba(252, 211, 77, 0.3)' }}>
              {topThree[0].avatar}
            </div>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', color: '#0F172A', fontWeight: 800 }}>{topThree[0].name}</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{topThree[0].department}</p>
            <div style={{ background: '#FEF3C7', padding: '0.75rem', borderRadius: '16px' }}>
              <span style={{ display: 'block', fontSize: '1.6rem', fontWeight: 900, color: '#92400E' }}>{topThree[0].points.toLocaleString()}</span>
              <span style={{ fontSize: '0.75rem', color: '#B45309', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Lifetime Points</span>
            </div>
          </motion.div>

          {/* Rank 3 (Bronze) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="podium-card bronze"
            style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '2rem 1.5rem', 
              textAlign: 'center',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#D97706', color: 'white', padding: '0.4rem 1rem', borderRadius: '12px', fontWeight: 800 }}>
              3RD
            </div>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F1F5F9', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#475569', border: '4px solid #FCD34D' }}>
              {topThree[2].avatar}
            </div>
            <h3 style={{ margin: '0 0 0.25rem', color: '#0F172A', fontWeight: 700 }}>{topThree[2].name}</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1rem' }}>{topThree[2].department}</p>
            <div>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#d32f2f' }}>{topThree[2].points.toLocaleString()}</span>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rankings List */}
      <div style={{ background: 'white', borderRadius: '28px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Full Rankings</h2>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={18} />
            <input 
              type="text" 
              placeholder="Search alumni..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '0.7rem 1rem 0.7rem 2.8rem', 
                borderRadius: '12px', 
                border: '1px solid #E2E8F0', 
                background: '#F8FAFC',
                fontSize: '0.9rem',
                width: '240px',
                outline: 'none'
              }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {others.map((person, index) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '80px 1fr 150px 120px 60px', 
                alignItems: 'center', 
                padding: '1.25rem', 
                borderRadius: '18px', 
                background: index % 2 === 0 ? '#F8FAFC' : 'white',
                border: '1px solid transparent',
                transition: 'all 0.2s'
              }}
              whileHover={{ scale: 1.01, borderColor: '#E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            >
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#94A3B8' }}>{person.rank}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#475569' }}>
                  {person.avatar}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{person.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{person.department}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${(person.points / 15420) * 100}%`, height: '100%', background: '#d32f2f' }} />
                </div>
              </div>

              <div style={{ textAlign: 'right', paddingRight: '1rem' }}>
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{person.points}</span>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>XP</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {person.trend === 'up' && <ChevronUp size={20} color="#10B981" />}
                {person.trend === 'stable' && <div style={{ width: '12px', height: '2px', background: '#94A3B8' }} />}
                {person.trend === 'down' && <ChevronUp size={20} color="#EF4444" style={{ transform: 'rotate(180deg)' }} />}
              </div>
            </motion.div>
          ))}
        </div>

        <button style={{ 
          width: '100%', 
          marginTop: '2rem', 
          padding: '1rem', 
          borderRadius: '16px', 
          border: '2px dashed #E2E8F0', 
          background: 'transparent',
          color: '#64748B',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = '#F8FAFC')}
        onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Load More Leaderboard Positions
        </button>
      </div>

      {/* Global CSS for the Luxury Look */}
      <style>{`
        .podium-card {
           transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .podium-card:hover {
           transform: translateY(-8px);
           box-shadow: 0 30px 60px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
