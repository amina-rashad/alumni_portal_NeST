import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Award, CheckCircle2, 
  Zap, TrendingUp, 
  Share2, ChevronRight, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizResult: React.FC = () => {
  const navigate = useNavigate();

  // Mock Result Data (In a real app, this would come from state or location)
  const results = {
    score: 85,
    correct: 17,
    total: 20,
    timeTaken: '12:45',
    xpGained: 450,
    rank: 'Top 10%',
    status: 'Pass'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button 
            onClick={() => navigate('/assessments/quiz')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', background: 'none', border: 'none', padding: 0.25, cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} /> Back to Quizzes
          </button>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Assessment <span style={{ color: '#d32f2f' }}>Complete</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '1.1rem' }}>Great job! You've successfully completed the technical evaluation.</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Main Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="luxury-card"
          style={{ padding: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white' }}
        >
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 2rem' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="90" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
              <motion.circle 
                cx="100" cy="100" r="90" fill="transparent" stroke="#d32f2f" strokeWidth="12" 
                strokeDasharray="565.48"
                initial={{ strokeDashoffset: 565.48 }}
                animate={{ strokeDashoffset: 565.48 - (565.48 * results.score) / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 900 }}>{results.score}%</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.6 }}>SCORE</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle2 size={24} color="#10B981" style={{ marginBottom: '0.5rem' }} />
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>{results.correct}/{results.total}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>CORRECT</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Zap size={24} color="#F59E0B" style={{ marginBottom: '0.5rem' }} />
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>+{results.xpGained}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>XP GAIN</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Award size={24} color="#6366F1" style={{ marginBottom: '0.5rem' }} />
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>{results.rank}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>GLOBAL RANK</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button 
             onClick={() => navigate('/assessments/analytics')}
             style={{ flex: 1, padding: '1.25rem', borderRadius: '20px', background: 'white', color: '#0F172A', border: '1px solid #E2E8F0', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s' }}
          >
            <BarChart3 size={20} /> View Detailed Analytics
          </button>
          <button 
             onClick={() => navigate('/assessments/quiz')}
             style={{ flex: 1, padding: '1.25rem', borderRadius: '20px', background: '#d32f2f', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s' }}
          >
            Take Another Quiz <ChevronRight size={20} />
          </button>
        </div>

        {/* Share Section */}
        <div className="luxury-card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f' }}>
               <TrendingUp size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Share Achievement</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Let your network know about your new milestone.</p>
            </div>
          </div>
          <button style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#F8FAFC', color: '#0F172A', border: '1px solid #E2E8F0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
            <Share2 size={18} /> Share Result
          </button>
        </div>
      </div>

      <style>{`
        .luxury-card {
           background: #ffffff;
           border-radius: 32px;
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }
        button:hover {
           transform: translateY(-3px);
           box-shadow: 0 10px 20px rgba(0,0,0,0.06);
        }
      `}</style>
    </div>
  );
};

export default QuizResult;
