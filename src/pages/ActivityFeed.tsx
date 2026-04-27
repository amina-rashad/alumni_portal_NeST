import React, { useState, useEffect } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Clock, Sparkles,
  ChevronRight, CheckCircle2,
  Zap, FileText, Lightbulb, Search,
  Award, ShieldCheck, TrendingUp,
  MessageSquare, LayoutGrid, Users, Heart
} from 'lucide-react';

// --- PREMIUM MOCK DATA (Admin & Senior Insights Only) ---
const feedPosts = [
  {
    id: 1,
    isOfficial: true,
    type: 'announcement',
    author: {
      name: 'NeST Admin',
      role: 'Alumni Relations Directorate',
      avatar: 'https://ui-avatars.com/api/?name=NeST+Admin&background=0F172A&color=fff',
      verified: true
    },
    time: '2 hours ago',
    title: 'Global Alumni Meet 2026: Official Announcement',
     content: "We are thrilled to announce that the Global Alumni Meet 2026 will be held at our Zurich Innovation Center. Early bird registrations for verified senior members open next week.",
    tag: 'Official Announcement',
    likes: 342
  },
  {
    id: 4,
    type: 'event',
    author: {
      name: 'Event Management Team',
      role: 'NeST Events',
      avatar: 'https://ui-avatars.com/api/?name=Events&background=DC2626&color=fff',
      verified: true
    },
    time: '4 hours ago',
    title: 'Highlights: Tech Synergy Summit 2026',
     content: "Relive the best moments from last week's Tech Synergy Summit. Our alumni panel discussed the intersection of Quantum Computing and Fintech to a packed auditorium of 500+ attendees.",
    media: 'https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?q=80&w=1200&auto=format&fit=crop',
    tag: 'Event Recap',
    likes: 856
  },
  {
    id: 5,
    type: 'course',
    author: {
      name: 'NeST Academy',
      role: 'Learning & Development',
      avatar: 'https://ui-avatars.com/api/?name=Academy&background=F59E0B&color=fff',
      verified: true
    },
    time: '6 hours ago',
    title: 'New Course: Advanced Cloud Architecture',
     content: "In collaboration with AWS, we are launching an exclusive certification course for our alumni. Master multi-region distributed systems and serverless orchestration. Enrollments close this Friday.",
    tag: 'Course Update',
    likes: 124
  },
  {
    id: 2,
    isSenior: true,
    type: 'insight',
    author: {
      name: 'Dr. Elena Rossi',
      role: 'SVP of Engineering @ NVIDIA | Batch of 2008',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
      verified: true
    },
    time: '8 hours ago',
    title: 'The Shift Towards Edge Intelligence',
     content: "In my 15 years in silicon valley, the current shift from centralized LLMs to Edge-native intelligence is the most significant I've seen. Model quantization is the next big frontier.",
    tag: 'Technical Insight',
    likes: 219
  }
];

const trendingTopics = [
  { topic: 'Quantum FinTech', growth: '+32%', interactions: '2.4k' },
  { topic: 'Cloud Governance', growth: '+15%', interactions: '920' },
  { topic: 'Alumni Meet 2026', growth: '+45%', interactions: '3.1k' }
];

// --- ANIMATION VARIANTS ---
const smoothSpring = { type: 'spring' as const, stiffness: 80, damping: 20, mass: 1 };

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: smoothSpring
  }
};

// --- COMPONENTS ---

const verifiedBadge = (size = 14) => (
  <div style={{ background: '#DC2626', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CheckCircle2 size={size} color="white" />
  </div>
);

const ActivityFeed: React.FC = () => {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const handleLike = (id: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="font-sans" style={{ 
      backgroundColor: '#f6f9fc', 
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(211, 47, 47, 0.03) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(15, 23, 42, 0.03) 0px, transparent 50%)
      `,
      minHeight: '100vh', 
      padding: '2rem 1.5rem', /* Tighter padding */
      fontFamily: '"Montserrat", sans-serif' 
    }}>
      
      {/* GLOBAL CSS */}
      <style>{`
        .insight-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px; /* Slightly tighter radius */
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
          margin-bottom: 1.25rem; /* Reduced margin */
        }
        .insight-card:hover {
          transform: translateY(-4px); /* Subtler lift */
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.07);
          border-color: rgba(220, 38, 38, 0.2);
        }
        .video-banner {
          background-image: url('C:/Users/noble.sibi/.gemini/antigravity/brain/3d6cba0c-362d-4c3a-8fe3-d6b9791566fc/alumni_stories_ultra_premium_bg_1777026603631.png');
          background-size: cover;
          background-position: center;
          border-radius: 24px;
          padding: 3rem 3rem; /* Tighter padding */
          margin-bottom: 2rem; /* Reduced margin */
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }
        .video-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.4)); /* Premium Overlay Layer */
          z-index: 1;
        }
        .video-banner::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(-45deg, rgba(211, 47, 47, 0.15), transparent, rgba(15, 23, 42, 0.2)); /* Ultra Premium Enhancement Gradient */
          background-size: 400% 400%;
          animation: meshGradient 18s ease infinite;
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          z-index: 2;
        }
        @keyframes meshGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50% ;}
          100% { background-position: 0% 50%; }
        }
        .banner-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.12;
          pointer-events: none;
          mix-blend-mode: overlay;
          z-index: 1;
        }
        .verified-glow {
          box-shadow: 0 0 15px rgba(220, 38, 38, 0.15);
        }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
        
        {/* CINEMATIC VIDEO BANNER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="video-banner"
        >
          <div className="banner-noise" style={{ zIndex: 3 }} />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}
            >
               <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex' }}>
                 <LayoutGrid size={18} />
               </div>
               <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.7rem' }}>Excellence Archive</span>
            </motion.div>
            
            <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 950, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1rem', textShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>Alumni Stories</h1>
            
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', fontWeight: 500, maxWidth: '500px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
              Chronicles of engineering leadership and professional breakthroughs from our global community.
            </p>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
               <button className="btn-premium" style={{ background: '#fff', color: '#0F172A', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem' }}>Latest Chronicle</button>
               <button className="btn-premium" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', backdropFilter: 'blur(10px)' }}>Archive Search</button>
            </div>
          </div>

          <div style={{ position: 'absolute', right: '-50px', bottom: '-50px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(211,47,47,0.3) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1 }} />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          
          {/* MAIN FEED */}
          <motion.div variants={pageVariants} initial="hidden" animate="visible">
            {feedPosts.map((post) => (
              <motion.div key={post.id} variants={itemVariants} className="insight-card">
                <div style={{ padding: '1.75rem' }}>
                  {/* Tag & Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ 
                      background: post.isOfficial ? 'rgba(220, 38, 38, 0.08)' : 'rgba(15, 23, 42, 0.04)', 
                      color: post.isOfficial ? '#DC2626' : '#1e293b', 
                      padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' 
                    }}>
                      {post.tag}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>
                      <Clock size={12} /> {post.time}
                    </div>
                  </div>

                  <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.5rem', fontWeight: 850, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>{post.title}</h2>
                  
                  <p style={{ margin: '0 0 1.25rem', color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 450 }}>
                    {post.content}
                  </p>

                  {(post as any).media && (
                    <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                       <img src={(post as any).media} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} alt="Content" />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={post.author.avatar} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
                        <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                          {verifiedBadge(10)}
                        </div>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{post.author.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{post.author.role}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#DC2626', background: 'rgba(220, 38, 38, 0.04)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                        <Zap size={14} fill="#DC2626" /> Insight
                      </div>
                    </div>
                  </div>
                </div>

                {/* INTERACTION BAR (LIKE ONLY) */}
                <div style={{ background: 'rgba(248, 250, 252, 0.6)', padding: '1.25rem 2rem', borderTop: '1px solid rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
                        <ShieldCheck size={16} color="#10B981" /> Verified Archive
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Sparkles size={16} color="#F59E0B" /> Alumni Story
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleLike(post.id)}
                      style={{ 
                        background: likedPosts.has(post.id) ? 'rgba(220, 38, 38, 0.1)' : 'white', 
                        border: '1px solid',
                        borderColor: likedPosts.has(post.id) ? 'rgba(220, 38, 38, 0.2)' : '#E2E8F0',
                        padding: '10px 24px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <motion.div
                        animate={{ 
                          scale: likedPosts.has(post.id) ? [1, 1.5, 1] : 1,
                          rotate: likedPosts.has(post.id) ? [0, -15, 15, 0] : 0
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <Heart 
                          size={20} 
                          color={likedPosts.has(post.id) ? '#DC2626' : '#64748B'} 
                          fill={likedPosts.has(post.id) ? '#DC2626' : 'transparent'} 
                        />
                      </motion.div>
                      <span style={{ 
                        fontWeight: 800, 
                        fontSize: '0.95rem', 
                        color: likedPosts.has(post.id) ? '#DC2626' : '#0F172A' 
                      }}>
                        {((post as any).likes || 0) + (likedPosts.has(post.id) ? 1 : 0)}
                      </span>
                    </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* SIDEBAR */}
          <div style={{ position: 'sticky', top: '2rem' }}>
             
             {/* DIRECTORATE ANNOUNCEMENT */}
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="insight-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #0F172A 0%, #1e293b 100%)', color: 'white', border: 'none' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                   <Award size={24} color="#DC2626" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.75rem' }}>Verified Perspectives</h3>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem', fontWeight: 500 }}>
                  Only content verified by NeST Admin or Leadership is visible here to maintain professional standards.
                </p>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0 1.5rem' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <img src="https://ui-avatars.com/api/?name=Admin&background=DC2626&color=fff" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                   <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.9 }}>Directorate Managed</span>
                </div>
             </motion.div>

             {/* TRENDING NOW */}
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="insight-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                   <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <TrendingUp size={20} color="#DC2626" /> Trending Now
                   </h4>
                   <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                   {trendingTopics.map((item, i) => (
                      <div key={i} style={{ group: 'true' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>#{item.topic.replace(' ', '')}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{item.growth}</span>
                         </div>
                         <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>{item.interactions} professional interactions</p>
                      </div>
                   ))}
                </div>

                <button className="btn-premium" style={{ width: '100%', marginTop: '2.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '14px', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                   Discover More Topics
                </button>
             </motion.div>

             {/* SENIOR ENGAGEMENT CTA */}
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ padding: '2rem', background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <Users size={32} color="#DC2626" style={{ marginBottom: '1rem' }} />
                <h4 style={{ margin: '0 0 0.5rem', fontWeight: 800 }}>Engage with Experts</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500, margin: '0 0 1.5rem' }}>Reach out to contributors for personalized career mentorship.</p>
                <button className="btn-premium" style={{ width: '100%', background: '#0F172A', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700 }}>Mentorship Portal</button>
             </motion.div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ActivityFeed;
