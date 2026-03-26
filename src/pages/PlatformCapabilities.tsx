import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

const featureDetails: Record<string, any> = {
  'talent-tracking': {
    title: 'Talent Tracking',
    subtitle: 'Comprehensive lifecycle tracking for all platform members.',
    heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop',
    cards: [
       { icon: CheckCircle, title: 'Skill Matrices', desc: 'Visualize capabilities across your entire alumni network instantly.' },
       { icon: Zap, title: 'Engagement Scoring', desc: 'Automated points system based on interactions, course completions, and participation.' },
       { icon: ShieldCheck, title: 'Predictive Analytics', desc: 'Forecast future talent availability based on current trainee progress.' }
    ]
  },
  'job-management': {
    title: 'Job Management',
    subtitle: 'Streamline hiring directly from your vetted NeST pipeline.',
    heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
    cards: [
       { icon: CheckCircle, title: 'Smart Recommendations', desc: 'AI-driven mapping of your open jobs to the best alumni profiles.' },
       { icon: Zap, title: 'Referral System', desc: 'Gamified built-in referral system for high-trust hiring.' },
       { icon: ShieldCheck, title: 'ATS Integration', desc: 'Seamlessly port candidates into your existing HR tools.' }
    ]
  },
  'learning-courses': {
    title: 'Learning & Courses',
    subtitle: 'Provide continuous upskilling resources.',
    heroImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
    cards: [
       { icon: CheckCircle, title: 'Custom Curriculums', desc: 'Build modular courses with videos, documents, and quizzes.' },
       { icon: Zap, title: 'Progress Monitoring', desc: 'Track where users drop off and optimize your training material.' },
       { icon: ShieldCheck, title: 'Certification Engine', desc: 'Automatically generate and issue verified certificates.' }
    ]
  },
  'assessments': {
    title: 'Assessments',
    subtitle: 'Ensure quality and readiness with automated skill checks.',
    heroImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop',
    cards: [
       { icon: CheckCircle, title: 'Code Validations', desc: 'Test engineering candidates securely within the browser.' },
       { icon: Zap, title: 'Behavioral Quizzes', desc: 'Measure cultural fit through interactive scenarios.' },
       { icon: ShieldCheck, title: 'Live Leaderboards', desc: 'Encourage healthy competition among interns and trainees.' }
    ]
  }
};

const PlatformCapabilities: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const feature = id ? featureDetails[id] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!feature) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: '#0d2046', minHeight: '100vh', color: 'white' }}>
         <h2>Feature not found.</h2>
         <Link to="/" style={{ color: '#c8102e', textDecoration: 'underline' }}>Go Back</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0d2046', minHeight: '100vh', color: 'white', fontFamily: '"Inter", -apple-system, sans-serif' }}>
       {/* CSS INJECT */}
       <style>{`
         html, body {
           font-family: 'Inter', sans-serif;
         }
         .luxury-glass {
           background: rgba(255, 255, 255, 0.05);
           backdrop-filter: blur(20px);
           -webkit-backdrop-filter: blur(20px);
           border: 1px solid rgba(255, 255, 255, 0.1);
           border-radius: 24px;
           box-shadow: 0 10px 30px rgba(0,0,0,0.1);
         }
         
         .splash-hero {
           position: relative;
           height: 55vh;
           min-height: 400px;
           overflow: hidden;
           display: flex;
           align-items: center;
           justify-content: center;
         }
         
         .splash-hero img {
           position: absolute;
           top: 0; left: 0; width: 100%; height: 100%;
           object-fit: cover;
           z-index: 0;
           opacity: 0.35;
         }

         .light-sweep {
           background: linear-gradient(
             110deg,
             rgba(255, 255, 255, 1) 0%,
             rgba(255, 255, 255, 1) 40%,
             rgba(255, 255, 255, 0.1) 48%,
             rgba(255, 255, 255, 1) 52%,
             rgba(255, 255, 255, 1) 100%
           );
           background-size: 200% auto;
           color: #fff;
           background-clip: text;
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
           animation: sweep 4s cubic-bezier(0.25, 1, 0.5, 1) infinite;
           filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
           display: inline-block;
         }

         @keyframes sweep {
           0% { background-position: 200% center; }
           100% { background-position: -200% center; }
         }
       `}</style>
       
       <motion.div className="splash-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
           <motion.img 
             src={feature.heroImage} 
             alt={feature.title} 
             initial={{ scale: 1.15 }}
             animate={{ scale: 1 }}
             transition={{ duration: 8, ease: "easeOut" }}
           />
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(13, 32, 70, 0.1), #0d2046)' }} />
           
           <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 2rem', marginTop: '2rem' }}>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}>
                 <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#c8102e', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem', background: 'white', padding: '0.6rem 1.25rem', borderRadius: '999px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    <ArrowLeft size={16} /> Back to Home
                 </Link>
                 <motion.h1 
                    className="light-sweep"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, margin: '0 0 1rem', fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em' }}
                 >
                    {feature.title}
                 </motion.h1>
                 <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.85)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}
                 >
                    {feature.subtitle}
                 </motion.p>
              </motion.div>
           </div>
       </motion.div>

       <div style={{ maxWidth: '1200px', margin: '-40px auto 0', padding: '0 2rem 6rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
             {feature.cards.map((c: any, i: number) => {
                const Icon = c.icon;
                return (
                  <motion.div 
                    key={i}
                    className="luxury-glass"
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: i * 0.15, type: 'spring', stiffness: 80 }}
                    viewport={{ once: true, margin: "-10%" }}
                    style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', cursor: 'default' }}
                    whileHover={{ y: -12, backgroundColor: 'rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                  >
                     <div style={{ width: '56px', height: '56px', background: 'rgba(200, 16, 46, 0.15)', border: '1px solid rgba(200, 16, 46, 0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d6d' }}>
                        <Icon size={28} />
                     </div>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{c.title}</h3>
                     <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontSize: '1.05rem', margin: 0 }}>{c.desc}</p>
                  </motion.div>
                );
             })}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: '6rem', padding: '5rem 2rem', background: 'linear-gradient(135deg, rgba(200, 16, 46, 0.08), rgba(255,255,255,0.02))', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
          >
             <h2 style={{ fontSize: '2.8rem', fontFamily: '"Playfair Display", serif', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Ready to Experience {feature.title}?</h2>
             <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto 2.5rem' }}>Join the NeST Digital ecosystem today and supercharge your team's workflow.</p>
             <Link to="/register" style={{ display: 'inline-block', background: '#c8102e', color: 'white', padding: '1.25rem 3rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem', transition: 'all 0.3s', boxShadow: '0 8px 20px rgba(200, 16, 46, 0.3)' }} onMouseOver={(e) => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(200, 16, 46, 0.4)'}} onMouseOut={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(200, 16, 46, 0.3)'}}>
               Create Your Account
             </Link>
          </motion.div>
       </div>
    </div>
  );
}

export default PlatformCapabilities;
