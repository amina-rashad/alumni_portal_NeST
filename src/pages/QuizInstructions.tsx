import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, Info, 
  ShieldCheck, AlertTriangle, 
  Zap, Brain, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizInstructions: React.FC = () => {
  const navigate = useNavigate();

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
            <ArrowLeft size={16} /> Cancel and Exit
          </button>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Assessment <span style={{ color: '#d32f2f' }}>Briefing</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '1.1rem' }}>Please review the instructions carefully before starting the evaluation.</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Rules Card */}
        <div className="luxury-card" style={{ padding: '2.5rem', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Info size={20} color="#3B82F6" /> Evaluation Rules
          </h3>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              { icon: Clock, title: 'Timed Session', desc: 'You have 20 minutes to complete 30 questions. The timer cannot be paused once started.' },
              { icon: ShieldCheck, title: 'Integrity Check', desc: 'Switching tabs or minimizing the window may result in automatic disqualification.' },
              { icon: Zap, title: 'Scoring', desc: 'Higher XP is awarded for correct answers finished significantly before the time limit.' },
              { icon: AlertTriangle, title: 'Single Attempt', desc: 'You can only take this certification assessment once every 30 days.' },
            ].map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', background: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', flexShrink: 0 }}>
                   <rule.icon size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{rule.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards Summary */}
        <div style={{ background: '#0F172A', color: 'white', padding: '2rem', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
               <Brain size={28} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Mastery Reward</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>Earn up to <strong>1,200 XP</strong> and a 'System Architect' badge.</p>
            </div>
          </div>
        </div>

        {/* Start Action */}
        <button 
          onClick={() => navigate('/assessments/quiz')}
          style={{ 
            padding: '1.5rem', 
            borderRadius: '24px', 
            background: '#d32f2f', 
            color: 'white', 
            border: 'none', 
            fontWeight: 800, 
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            boxShadow: '0 10px 30px rgba(211, 47, 47, 0.2)',
            transition: 'all 0.3s'
          }}
        >
          I Understand, Begin Assessment <ChevronRight size={24} />
        </button>
      </div>

      <style>{`
        .luxury-card {
           background: #ffffff;
           border-radius: 32px;
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }
        button:hover {
           transform: translateY(-4px);
           box-shadow: 0 15px 35px rgba(211, 47, 47, 0.3);
        }
      `}</style>
    </div>
  );
};

export default QuizInstructions;
