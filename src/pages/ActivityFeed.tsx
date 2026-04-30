import React, { useState, useEffect } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Clock, Sparkles,
  ChevronRight, CheckCircle2,
  Zap, FileText, Lightbulb, Search,
  Award, ShieldCheck, TrendingUp,
  MessageSquare, LayoutGrid, Users, Heart, Loader2
} from 'lucide-react';
import { socialApi, getUser } from '../services/api';

// --- COMPONENTS ---

const verifiedBadge = (size = 14) => (
  <div style={{ background: '#DC2626', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CheckCircle2 size={size} color="white" />
  </div>
);

const ActivityFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await socialApi.getFeed();
      console.log('Social Feed API Response:', res);
      if (res.success && res.data) {
        setPosts(res.data.posts || []);
      } else {
        setError(res.message || "Failed to load feed.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      const res = await socialApi.likePost(postId);
      if (res.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const nowLiked = res.data?.liked;
            return {
              ...p,
              is_liked: !!nowLiked,
              likes_count: p.likes_count + (nowLiked ? 1 : -1)
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Like Error:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

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
    visible: { opacity: 1, y: 0, scale: 1, transition: smoothSpring }
  };

  const trendingTopics = [
    { topic: 'Quantum FinTech', growth: '+32%', interactions: '2.4k' },
    { topic: 'Cloud Governance', growth: '+15%', interactions: '920' },
    { topic: 'Alumni Meet 2026', growth: '+45%', interactions: '3.1k' }
  ];

  return (
    <div className="font-sans" style={{ 
      backgroundColor: '#f6f9fc', 
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(211, 47, 47, 0.03) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(15, 23, 42, 0.03) 0px, transparent 50%)
      `,
      minHeight: '100vh', 
      padding: '2rem 1.5rem', 
      fontFamily: '"Montserrat", sans-serif' 
    }}>
      
      {/* GLOBAL CSS */}
      <style>{`
        .insight-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
          margin-bottom: 1.25rem;
        }
        .insight-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.07);
          border-color: rgba(220, 38, 38, 0.2);
        }
        .video-banner {
          background: linear-gradient(135deg, #1a2652 0%, #0f172a 100%);
          border-radius: 24px;
          padding: 3rem 3rem;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }
        .video-banner::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(-45deg, rgba(211, 47, 47, 0.15), transparent, rgba(15, 23, 42, 0.2));
          background-size: 400% 400%;
          animation: meshGradient 18s ease infinite;
          backdrop-filter: blur(5px);
          z-index: 2;
        }
        @keyframes meshGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50% ;}
          100% { background-position: 0% 50%; }
        }
        .verified-glow { box-shadow: 0 0 15px rgba(220, 38, 38, 0.15); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
        
        {/* CINEMATIC BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="video-banner"
        >
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
               <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.7rem' }}>Community Hub</span>
            </motion.div>
            
            <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 950, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1rem', textShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>Activity Feed</h1>
            
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', fontWeight: 500, maxWidth: '500px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
              Stay connected with real-time updates, broadcasts, and professional breakthroughs from the NeST network.
            </p>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          
          {/* MAIN FEED */}
          <motion.div variants={pageVariants} initial="hidden" animate="visible">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px' }}>
                <Loader2 size={40} className="spin" color="#1a2652" />
                <p style={{ marginTop: '12px', color: '#64748b', fontWeight: 600 }}>Syncing with community...</p>
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px' }}>
                <Sparkles size={40} color="#e2e8f0" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#94a3b8', fontWeight: 600 }}>No recent activities found.</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <motion.div key={post.id} variants={itemVariants} className="insight-card">
                  <div style={{ padding: '1.75rem' }}>
                    {/* Tag & Meta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{ 
                        background: (post.author_type || '').toLowerCase().includes('admin') || (post.author_type || '').toLowerCase().includes('recruiter') ? 'rgba(220, 38, 38, 0.08)' : 'rgba(26, 38, 82, 0.05)', 
                        color: (post.author_type || '').toLowerCase().includes('admin') || (post.author_type || '').toLowerCase().includes('recruiter') ? '#DC2626' : '#1a2652', 
                        padding: '4px 12px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' 
                      }}>
                        {post.author_type || 'Community'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>
                        <Clock size={12} /> {formatDate(post.created_at)}
                      </div>
                    </div>

                    <p style={{ margin: '0 0 1.5rem', color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                      {post.content}
                    </p>

                    {post.image_url && (
                      <div style={{ marginBottom: '1.5rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                         <img src={post.image_url} style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', background: '#f8fafc' }} alt="Post media" />
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                          {post.author_picture ? (
                            <img src={post.author_picture} style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} alt="author" />
                          ) : (
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#1a2652', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                              {post.author_name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{ position: 'absolute', bottom: -2, right: -2 }}>
                            {verifiedBadge(10)}
                          </div>
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{post.author_name}</h4>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{post.author_type}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                         <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLike(post.id)}
                            style={{ 
                              background: post.is_liked ? 'rgba(220, 38, 38, 0.08)' : 'rgba(26, 38, 82, 0.03)', 
                              border: 'none',
                              padding: '8px 18px', 
                              borderRadius: '12px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.6rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Heart 
                              size={18} 
                              color={post.is_liked ? '#DC2626' : '#1a2652'} 
                              fill={post.is_liked ? '#DC2626' : 'transparent'} 
                            />
                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: post.is_liked ? '#DC2626' : '#1a2652' }}>
                              {post.likes_count || 0}
                            </span>
                          </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* SIDEBAR */}
          <div style={{ position: 'sticky', top: '2rem' }}>
             
             {/* NETWORK STATUS */}
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="insight-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #1a2652 0%, #0f172a 100%)', color: 'white', border: 'none' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                   <Zap size={24} color="#DC2626" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.75rem' }}>Verified Feed</h3>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem', fontWeight: 500 }}>
                  You are viewing real-time activities from verified NeST Alumni and Recruitment teams.
                </p>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0 1.5rem' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '50%' }} />
                   <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981' }}>Network Synchronized</span>
                </div>
             </motion.div>

             {/* TRENDING TOPICS */}
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="insight-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                   <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <TrendingUp size={20} color="#DC2626" /> Community Focus
                   </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                   {trendingTopics.map((item, i) => (
                      <div key={i}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>#{item.topic.replace(' ', '')}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{item.growth}</span>
                         </div>
                         <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>{item.interactions} interactions</p>
                      </div>
                   ))}
                </div>
             </motion.div>

             {/* HELP CENTER */}
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ padding: '2rem', background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <MessageSquare size={32} color="#1a2652" style={{ marginBottom: '1rem' }} />
                <h4 style={{ margin: '0 0 0.5rem', fontWeight: 800 }}>Need Support?</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500, margin: '0 0 1.5rem' }}>Connect with the Directorate for assistance with your alumni profile.</p>
                <button style={{ width: '100%', background: '#1a2652', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Contact Support</button>
             </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
