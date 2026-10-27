import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, 
  Share2, Bookmark, MoreHorizontal
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { socialApi } from '../services/api';

const PostDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await socialApi.getPostById(id);
        if (res.success && res.data?.post) {
          setPost(res.data.post);
          setLiked(!!res.data.post.is_liked);
        } else {
          // Try to search feed as fallback
          const feedRes = await socialApi.getFeed(1, 50);
          if (feedRes.success && feedRes.data?.posts) {
            const match = feedRes.data.posts.find((p: any) => p.id === id);
            if (match) {
              setPost(match);
              setLiked(!!match.is_liked);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!id) return;
    try {
      const res = await socialApi.likePost(id);
      if (res.success && res.data) {
        const d = res.data as any;
        setLiked(d.liked);
        setPost((prev: any) => prev ? {
          ...prev,
          likes_count: d.liked ? (prev.likes_count || 0) + 1 : Math.max(0, (prev.likes_count || 1) - 1)
        } : null);
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #1a2652', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '5rem 1rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>Post Not Found</h3>
        <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>This update may have been removed or is no longer available.</p>
        <button 
          onClick={() => navigate('/dashboard/activity')}
          style={{ background: '#1a2652', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button 
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/dashboard/activity')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', background: 'none', border: 'none', padding: 0.25, cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} /> Back to Feed
          </button>
        </motion.div>
      </div>

      <div className="luxury-card" style={{ border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {/* Main Post Content */}
        <div style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {post.author_picture ? (
                <img src={post.author_picture} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1a2652', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                  {(post.author_name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{post.author_name || 'Anonymous User'}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                  {post.author_type || 'Member'} • {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>
            <button style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}><MoreHorizontal size={20} /></button>
          </div>

          <p style={{ fontSize: '1.2rem', color: '#0F172A', lineHeight: 1.6, marginBottom: post.image_url ? '1.5rem' : '2rem' }}>{post.content}</p>

          {post.image_url && (
            <div style={{ marginBottom: '2rem', borderRadius: '20px', overflow: 'hidden' }}>
              <img src={post.image_url} alt="" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
            <button 
              onClick={handleLike}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: liked ? '#EF4444' : '#64748B', fontWeight: 700, cursor: 'pointer' }}
            >
              <Heart size={20} fill={liked ? '#EF4444' : 'none'} /> {post.likes_count || 0}
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}>
              <Share2 size={20} /> Share
            </button>
            <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
               <Bookmark size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .luxury-card {
           background: #ffffff;
           border-radius: 32px;
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }
      `}</style>
    </div>
  );
};

export default PostDetails;
