import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, MessageCircle, Share2, 
  MoreHorizontal, Plus, Image as ImageIcon, 
  TrendingUp, Sparkles,
  Bookmark
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  time: string;
  tags: string[];
}

const MOCK_POSTS: Post[] = [
  { 
    id: '1', 
    user: { name: 'Amina Rashad', avatar: 'AR', role: 'Staff Alumna' },
    content: 'Just finished the NeST Architecture Summit. The future of cybernetics in our industry is looking incredibly promising! 🚀',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    likes: 124, 
    comments: 18, 
    time: '2h ago',
    tags: ['FutureTech', 'NeSTSummit', 'Innovation']
  },
  { 
    id: '2', 
    user: { name: 'Kevin Omondi', avatar: 'KO', role: 'Regional Lead' },
    content: 'Are there any alumni in high-frequency trading who can share insights on Go performance optimization? Looking for some specialized benchmarks.',
    likes: 45, 
    comments: 32, 
    time: '5h ago',
    tags: ['GoLang', 'TechHelp', 'Performance']
  },
];

const Feed: React.FC = () => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedPosts(newLiked);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Social Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            to="/dashboard" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Social <span style={{ color: '#d32f2f' }}>Feed</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '1.1rem' }}>Connect, share, and stay updated with the global NeST network.</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Main Feed Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quick Post Box */}
          <div className="luxury-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#475569' }}>
              NS
            </div>
            <Link to="/social/post/create" style={{ flex: 1, cursor: 'text', textDecoration: 'none' }}>
               <div style={{ background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '14px', border: '1px solid #E2E8F0', color: '#94A3B8', fontSize: '1rem', transition: 'all 0.2s' }}
                 onMouseOver={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                 onMouseOut={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
               >
                 What's on your mind, Alumnus?
               </div>
            </Link>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ width: '44px', height: '44px', borderRadius: '12px', border: 'none', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ImageIcon size={20} />
              </button>
              <button style={{ width: '44px', height: '44px', borderRadius: '12px', border: 'none', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {MOCK_POSTS.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="luxury-card"
                style={{ overflow: 'hidden', border: '1px solid #E2E8F0' }}
              >
                {/* Post Header */}
                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F1F5F9', border: '2px solid white', boxShadow: '0 0 0 2px #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0F172A' }}>
                      {post.user.avatar}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{post.user.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {post.user.role} • {post.time}
                      </p>
                    </div>
                  </div>
                  <button style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Post Body */}
                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                  <p style={{ margin: '0 0 1.5rem', fontSize: '1.05rem', lineHeight: 1.6, color: '#334155' }}>{post.content}</p>
                  
                  {post.tags && (
                    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                      {post.tags.map(tag => (
                        <span key={tag} style={{ color: '#d32f2f', fontWeight: 700, fontSize: '0.8rem' }}>#{tag}</span>
                      ))}
                    </div>
                  )}

                  {post.image && (
                    <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #F1F5F9' }}>
                      <img src={post.image} alt="Post content" style={{ width: '100%', display: 'block' }} />
                    </div>
                  )}

                  {/* Interations */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <button 
                         onClick={() => toggleLike(post.id)}
                         style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', color: likedPosts.has(post.id) ? '#d32f2f' : '#64748B', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <Heart size={20} fill={likedPosts.has(post.id) ? '#d32f2f' : 'transparent'} /> {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </button>
                      <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}>
                        <MessageCircle size={20} /> {post.comments}
                      </button>
                      <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}>
                        <Share2 size={20} />
                      </button>
                    </div>
                    <button style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                      <Bookmark size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem' }}>
          
          {/* Trending Card */}
          <div className="luxury-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <TrendingUp size={18} color="#d32f2f" /> Trending Topics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { topic: 'ArchitectureSummit', volume: '1.2K posts' },
                { topic: 'AIReform', volume: '850 posts' },
                { topic: 'RustConcurrency', volume: '640 posts' },
                { topic: 'NeSTCareers', volume: '520 posts' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>#{item.topic}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.volume}</span>
                </div>
              ))}
            </div>
            <button style={{ width: '100%', marginTop: '1.5rem', padding: '0.6rem', borderRadius: '10px', background: '#F8FAFC', color: '#0F172A', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              View More
            </button>
          </div>

          {/* Suggested Groups */}
          <div className="luxury-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={18} color="#F59E0B" /> Communities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { name: 'Kochi Tech Leads', members: '120', avatar: 'KT' },
                { name: 'Go Backend Experts', members: '85', avatar: 'GB' },
                { name: 'NeST Digital Alumni', members: '2.4K', avatar: 'ND' },
              ].map((group, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#64748B' }}>
                      {group.avatar}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{group.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94A3B8' }}>{group.members} members</p>
                    </div>
                  </div>
                  <button style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'transparent', color: '#0F172A', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .luxury-card {
           background: #ffffff;
           border-radius: 24px;
           border: 1px solid rgba(226, 232, 240, 0.8);
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
           transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>
    </div>
  );
};

export default Feed;
