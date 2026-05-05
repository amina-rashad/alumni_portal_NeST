import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Clock, CheckCircle2,
  TrendingUp, Image as ImageIcon,
  MessageSquare, Heart, Loader2
} from 'lucide-react';
import { socialApi, getUser } from '../services/api';
import alumniStoriesBg from '../assets/alumni_stories_bg.png';

interface Post {
  id: string;
  author_name: string;
  author_type: string;
  author_picture?: string;
  content: string;
  image_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

const trendingTopics = [
  { topic: 'Quantum FinTech', growth: '+32%', interactions: '2.4k' },
  { topic: 'Cloud Governance', growth: '+15%', interactions: '920' },
  { topic: 'Alumni Meet 2026', growth: '+45%', interactions: '3.1k' }
];

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

const verifiedBadge = (size = 14) => (
  <div style={{ background: '#DC2626', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CheckCircle2 size={size} color="white" />
  </div>
);

const ActivityFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const fetchFeed = async () => {
    try {
      const res = await socialApi.getFeed();
      if (res.success && res.data) {
        setPosts((res.data as any).posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLike = async (id: string) => {
    try {
      const res = await socialApi.likePost(id);
      if (res.success && res.data) {
        setPosts(prev => prev.map(p => {
          if (p.id === id) {
            const isLiked = res.data?.liked ?? p.is_liked;
            return {
              ...p,
              is_liked: isLiked,
              likes_count: isLiked !== p.is_liked 
                ? (isLiked ? p.likes_count + 1 : p.likes_count - 1)
                : p.likes_count
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    
    // Ensure the date string is treated as UTC if it lacks timezone info
    let normalizedDate = dateStr;
    if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-')) {
      normalizedDate += 'Z';
    }
    
    const diff = Date.now() - new Date(normalizedDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

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
          background-image: url('${alumniStoriesBg}');
          background-size: cover;
          background-position: center;
          padding: 4rem 0;
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
          width: 100vw;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          color: white;
        }
        .video-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.6) 30%, transparent 100%);
          z-index: 1;
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
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="video-banner"
          style={{ position: 'relative' }}
        >
          {/* Background Video */}
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
              filter: 'brightness(0.55) contrast(1.1)'
            }}
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-seen-from-above-3453-large.mp4" type="video/mp4" />
          </video>

          <div className="banner-noise" style={{ zIndex: 3 }} />
          <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
            <h1 style={{ margin: 0, fontSize: '3.5rem', fontWeight: 950, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.25rem', textShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>Career Timelines</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', fontWeight: 500, maxWidth: '550px', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
              Chronicles of engineering leadership and professional breakthroughs from our global community.
            </p>
          </div>
        </motion.div>

        {/* Quick Post Box - Hidden for regular users */}
        {getUser()?.role !== 'user' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="insight-card"
            style={{ padding: '1.25rem 1.75rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', border: '2px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0F172A', overflow: 'hidden' }}>
              {(getUser() as any)?.profile_picture ? (
                <img src={(getUser() as any).profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              ) : (
                (getUser() as any)?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <button 
              onClick={() => window.location.href = '/social/post/create'}
              style={{ 
                flex: 1, 
                background: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '99px', 
                padding: '12px 24px', 
                textAlign: 'left', 
                color: '#94A3B8', 
                fontSize: '1rem', 
                fontWeight: 500, 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = '#DC2626')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              What's on your mind, {(getUser() as any)?.full_name?.split(' ')[0] || 'Alumnus'}?
            </button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
               <button onClick={() => window.location.href = '/social/post/create'} style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10B981', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                  <ImageIcon size={18} /> Photo
               </button>
               <button onClick={() => window.location.href = '/social/post/create'} style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                  <TrendingUp size={18} /> Video
               </button>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1.5rem' }}>
          
          <motion.div variants={pageVariants} initial="hidden" animate="visible">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                <Loader2 size={32} className="spin" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 600 }}>Syncing with global feed...</p>
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                 <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                 <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>The feed is quiet...</h3>
                 <p style={{ color: '#64748b' }}>Be the first to share an update with the community!</p>
              </div>
            ) : (
              posts.map((post) => (
                <motion.div key={post.id} variants={itemVariants} className="insight-card">
                  <div style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ 
                        background: post.author_type === 'Admin' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(15, 23, 42, 0.04)', 
                        color: post.author_type === 'Admin' ? '#DC2626' : '#1e293b', 
                        padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' 
                      }}>
                        {post.author_type || 'Update'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>
                        <Clock size={12} /> {timeAgo(post.created_at)}
                      </div>
                    </div>

                    <p style={{ margin: '0 0 1.25rem', color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 500 }}>
                      {post.content}
                    </p>

                    {post.image_url && (
                      <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                         <img src={post.image_url} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} alt="Post content" />
                      </div>
                    )}

                    {post.video_url && (
                      <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', background: '#000' }}>
                         <video src={post.video_url} controls style={{ width: '100%', maxHeight: '400px', outline: 'none' }} />
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={post.author_picture || `https://ui-avatars.com/api/?name=${post.author_name}&background=random`} 
                            style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} 
                          />
                          <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                            {verifiedBadge(10)}
                          </div>
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{post.author_name}</h4>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{post.author_type}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleLike(post.id)}
                          style={{ 
                            background: post.is_liked ? 'rgba(220, 38, 38, 0.1)' : 'white', 
                            border: '1px solid',
                            borderColor: post.is_liked ? 'rgba(220, 38, 38, 0.2)' : '#E2E8F0',
                            padding: '10px 20px', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <Heart 
                            size={18} 
                            color={post.is_liked ? '#DC2626' : '#64748B'} 
                            fill={post.is_liked ? '#DC2626' : 'transparent'} 
                          />
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: post.is_liked ? '#DC2626' : '#0F172A' }}>
                            {post.likes_count}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          <div style={{ position: 'sticky', top: '2rem' }}>
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="insight-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                   <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <TrendingUp size={20} color="#DC2626" /> Trending Now
                   </h4>
                   <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                   {trendingTopics.map((item, i) => (
                      <div key={i}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>#{item.topic.replace(' ', '')}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{item.growth}</span>
                         </div>
                         <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>{item.interactions} professional interactions</p>
                      </div>
                   ))}
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
