import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, MessageCircle, 
  Share2, Bookmark, MoreHorizontal,
  Send, Smile, ImageIcon
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const PostDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');

  // Mock Post Data
  const post = {
    id: id || '1',
    author: 'Sidharth S',
    role: 'Principal Engineer',
    avatar: 'SS',
    time: '4 hours ago',
    content: "Excited to share that our team just deployed the new NeST AI Core! 🚀 It's been an incredible journey over the last 6 months, and we're seeing some amazing performance gains in system latency. Huge shoutout to the infrastructure team for their support. #NeSTLife #AICore #EngineeringExcellence",
    likes: 124,
    comments: [
      { id: 1, author: 'Anjali Nair', text: 'Stunning work! Can\'t wait to see the benchmark results.', time: '2h ago', avatar: 'AN' },
      { id: 2, author: 'Rahul K', text: 'The latency numbers are definitely impressive. Great job everyone!', time: '1h ago', avatar: 'RK' },
    ]
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button 
            onClick={() => navigate('/dashboard/activity')}
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
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0F172A' }}>
                {post.avatar}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{post.author}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{post.role} • {post.time}</p>
              </div>
            </div>
            <button style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}><MoreHorizontal size={20} /></button>
          </div>

          <p style={{ fontSize: '1.2rem', color: '#0F172A', lineHeight: 1.6, marginBottom: '2rem' }}>{post.content}</p>

          <div style={{ display: 'flex', gap: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
            <button 
              onClick={() => setLiked(!liked)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: liked ? '#EF4444' : '#64748B', fontWeight: 700, cursor: 'pointer' }}
            >
              <Heart size={20} fill={liked ? '#EF4444' : 'none'} /> {post.likes + (liked ? 1 : 0)}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontWeight: 700 }}>
              <MessageCircle size={20} /> {post.comments.length}
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}>
              <Share2 size={20} /> Share
            </button>
            <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
               <Bookmark size={20} />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div style={{ background: '#F8FAFC', padding: '2.5rem', borderTop: '1px solid #E2E8F0' }}>
           <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem' }}>Comments</h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              {post.comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '1rem' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#475569', fontSize: '0.8rem', flexShrink: 0 }}>
                     {c.avatar}
                   </div>
                   <div style={{ flex: 1 }}>
                      <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                         <h5 style={{ margin: '0 0 0.25rem 0', fontWeight: 800 }}>{c.author}</h5>
                         <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>{c.text}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                         <span>{c.time}</span>
                         <span style={{ cursor: 'pointer' }}>Like</span>
                         <span style={{ cursor: 'pointer' }}>Reply</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* Add Comment */}
           <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0F172A', fontSize: '0.8rem', flexShrink: 0 }}>
                NS
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                 <textarea 
                    placeholder="Add a comment..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1rem 3.5rem 1rem 1rem', fontSize: '0.9rem', outline: 'none', resize: 'none', minHeight: '60px' }}
                 />
                 <div style={{ position: 'absolute', right: '1rem', bottom: '1.25rem', display: 'flex', gap: '0.5rem', color: '#64748B' }}>
                    <ImageIcon size={18} style={{ cursor: 'pointer' }} />
                    <Smile size={18} style={{ cursor: 'pointer' }} />
                 </div>
              </div>
              <button 
                onClick={() => { setComment(''); alert('Comment posted!'); }}
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#0F172A', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Send size={20} />
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
