import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { 
  Clock, CheckCircle2,
  TrendingUp, Image as ImageIcon,
  MessageSquare, Heart, Loader2,
  Users, Award, Calendar
} from 'lucide-react';
import { socialApi, getUser } from '../services/api';
import alumniStoriesBg from '../assets/alumni_stories_bg.png';

interface Post {
  id: string;
  author_name: string;
  author_type: string;
  author_picture?: string;
  author_status?: string;
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
  { topic: 'Alumni Meet 2026', growth: '+45%', interactions: '3.1k' },
  { topic: 'Industrial IoT', growth: '+28%', interactions: '1.2k' },
  { topic: 'Cyber Security', growth: '+12%', interactions: '850' }
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
  const navigate = useNavigate();
  const user = getUser() as any;

  // Security Check: Only Admin/Super Admin can access this page now
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return null;

  return (
    <div className="font-sans" style={{ 
      backgroundColor: '#f6f9fc', 
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(211, 47, 47, 0.03) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(15, 23, 42, 0.03) 0px, transparent 50%)
      `,
      minHeight: '100vh', 
      padding: '0 1.5rem 2rem',
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
          padding: 6rem 0;
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

        {/* Exclusive Admin Post Creator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="insight-card"
          style={{ 
            padding: '24px 32px', 
            marginBottom: '40px', 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '2px solid rgba(220, 38, 38, 0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#DC2626', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>ADMIN POST</div>
            <div style={{ height: '1px', flex: 1, background: 'rgba(0,0,0,0.05)' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0F172A', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '2.5px solid #fff' }}>
              {user?.profile_picture ? (
                <img src={user.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              ) : (
                user?.full_name?.charAt(0) || 'A'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Broadcast Community Update</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Share news, events, or milestones with the alumni network.</p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => window.location.href = '/social/post/create'}
                  style={{ 
                    flex: 1, 
                    background: '#fff', 
                    border: '1.5px solid #E2E8F0', 
                    borderRadius: '14px', 
                    padding: '14px 20px', 
                    textAlign: 'left', 
                    color: '#94A3B8', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#DC2626';
                    e.currentTarget.style.background = '#fffafa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  Post a career milestone or community update...
                </button>
                
                <button 
                  onClick={() => window.location.href = '/social/post/create'}
                  style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <MessageSquare size={18} /> Create Post
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1.5rem' }}>
          
          <motion.div variants={pageVariants} initial="hidden" animate="visible" style={{ alignSelf: 'start' }}>
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
                  {/* ... post content ... */}
                  <div style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
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
                        <div style={{ 
                          position: 'relative', 
                          padding: '2px', 
                          borderRadius: '50%', 
                          border: post.author_status === 'open_to_work' ? '2px solid #16a34a' : post.author_status === 'hiring' ? '2px solid #0284c7' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img 
                            src={post.author_picture || `https://ui-avatars.com/api/?name=${post.author_name}&background=random`} 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} 
                          />
                          <div style={{ position: 'absolute', bottom: -2, right: -2 }}>
                            {post.author_status === 'open_to_work' ? (
                               <div style={{ backgroundColor: '#16a34a', color: 'white', fontSize: '7px', fontWeight: 900, padding: '1px 4px', borderRadius: '4px', border: '1px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>OPEN</div>
                            ) : post.author_status === 'hiring' ? (
                               <div style={{ backgroundColor: '#0284c7', color: 'white', fontSize: '7px', fontWeight: 900, padding: '1px 4px', borderRadius: '4px', border: '1px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>HIRE</div>
                            ) : verifiedBadge(8)}
                          </div>
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{post.author_name}</h4>

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

          <aside style={{ 
             display: 'flex',
             flexDirection: 'column',
             gap: '1.5rem',
             height: '100%'
          }}>
             {/* Card 1: Scrolls with the page */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.25 }} 
                className="insight-card" 
                style={{ 
                  height: '280px', 
                  position: 'relative', 
                  overflow: 'hidden',
                  padding: 0,
                  margin: 0,
                  flexShrink: 0
                }}
             >
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.9) contrast(1.1)'
                  }}
                >
                  <source src="https://nestdigital.com/wp-content/uploads/2026/03/Nest-HP-Video.mp4" type="video/mp4" />
                </video>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1.5rem',
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 100%)',
                  color: 'white',
                  zIndex: 2
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: '8px', height: '8px', background: '#DC2626', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9 }}>Digital Transformation</span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Inside NeST Digital</h4>
                </div>
             </motion.div>

             {/* Card 2: Sticks once reached */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }} 
                className="insight-card custom-scrollbar" 
                style={{ 
                  padding: '2rem', 
                  margin: 0,
                  position: 'sticky',
                  top: '24px',
                  zIndex: 10,
                  minHeight: 'calc(100vh - 100px)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto'
                }}
             >
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

                {/* Community Highlights Section */}
                <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                   <h4 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Community Highlights</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                         <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Users size={22} />
                         </div>
                         <div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>124 New Alumni</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Joined this month</div>
                         </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                         <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Award size={22} />
                          </div>
                          <div>
                             <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>45 Certifications</div>
                             <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Awarded last week</div>
                          </div>
                       </div>
                       <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          <div style={{ width: '48px', height: '48px', background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                             <Calendar size={22} />
                          </div>
                          <div>
                             <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>Annual Meetup</div>
                             <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>June 15, 2026</div>
                          </div>
                       </div>
                    </div>
                 </div>
             </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
