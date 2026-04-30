import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Image as ImageIcon, X, 
  Sparkles, ShieldCheck, Globe, 
  Loader2, CheckCircle2, MessageSquare, Trash2, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { socialApi } from '../../services/api';
import StatusModal from '../../components/StatusModal';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

const RecruiterPost: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // My posts state
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    confirmText: 'Okay',
    showConfirmOnly: true,
    onConfirm: () => {},
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const fetchMyPosts = async () => {
    try {
      const res = await socialApi.getMyPosts();
      if (res.success && res.data) {
        setMyPosts((res.data as any).posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setMessage({ type: 'error', text: 'Please enter some content for your broadcast.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await socialApi.createPost({
        content: content.trim(),
        image_url: imageUrl || undefined
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Broadcast sent successfully!' });
        setContent('');
        setImageUrl(null);
        fetchMyPosts();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to send broadcast.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptDelete = (postId: string) => {
    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: 'Delete Broadcast?',
      message: 'This broadcast will be permanently removed from the feed. This action cannot be undone.',
      confirmText: 'Yes, Delete',
      showConfirmOnly: false,
      onConfirm: () => executeDelete(postId),
    });
  };

  const executeDelete = async (postId: string) => {
    closeModal();
    setDeletingId(postId);
    try {
      const res = await socialApi.deletePost(postId);
      if (res.success) {
        setMyPosts(prev => prev.filter(p => p.id !== postId));
        setModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Deleted',
          message: 'Your broadcast has been removed successfully.',
          confirmText: 'Okay',
          showConfirmOnly: true,
          onConfirm: closeModal,
        });
      } else {
        setModalConfig({
          isOpen: true,
          type: 'error',
          title: 'Delete Failed',
          message: res.message || 'Could not delete the post. Please try again.',
          confirmText: 'Okay',
          showConfirmOnly: true,
          onConfirm: closeModal,
        });
      }
    } catch (err) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Network Error',
        message: 'Something went wrong. Please check your connection and try again.',
        confirmText: 'Okay',
        showConfirmOnly: true,
        onConfirm: closeModal,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem 1rem',
      fontFamily: '"Montserrat", sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            background: 'rgba(200, 16, 46, 0.08)', 
            color: '#c8102e', 
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}
        >
          <Sparkles size={14} /> Official Broadcast
        </motion.div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1a2652', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
          Reach the <span style={{ color: '#c8102e' }}>Community</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
          Share updates, job alerts, or announcements with the entire NeST network.
        </p>
      </div>

      {/* Main Composer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          background: 'white', 
          borderRadius: '32px', 
          padding: '2.5rem', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
          border: '1px solid #f1f5f9'
        }}
      >
        {message.text && (
          <div style={{ 
            padding: '16px', 
            borderRadius: '16px', 
            marginBottom: '24px',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#16a34a' : '#ef4444',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Text Area */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to broadcast today?"
              style={{ 
                width: '100%', 
                minHeight: '200px', 
                padding: '24px', 
                borderRadius: '24px', 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0',
                fontSize: '1.1rem',
                color: '#1e293b',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
                lineHeight: 1.6
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#c8102e'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Image Preview Area */}
          {imageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9' }}
            >
              <img src={imageUrl} alt="Upload preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
              <button 
                onClick={() => setImageUrl(null)}
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  background: 'rgba(0,0,0,0.5)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '50%', 
                  padding: '8px', 
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <X size={18} />
              </button>
            </motion.div>
          )}

          {/* Action Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => document.getElementById('image-upload')?.click()}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '12px 20px', 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                <ImageIcon size={18} /> Add Image
              </button>
              <input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '14px 32px', 
                background: '#1a2652', 
                color: 'white', 
                border: 'none', 
                borderRadius: '16px', 
                fontSize: '16px', 
                fontWeight: 800, 
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: '0.2s',
                boxShadow: '0 8px 16px rgba(26, 38, 82, 0.2)'
              }}
              onMouseEnter={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {isSubmitting ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
              {isSubmitting ? 'Broadcasting...' : 'Broadcast Now'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* My Posts Section */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a2652', marginBottom: '1.5rem' }}>
          My Broadcasts
        </h2>

        {loadingPosts ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Loader2 size={28} className="spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>Loading your posts...</p>
          </div>
        ) : myPosts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            background: '#f8fafc', 
            borderRadius: '24px', 
            border: '1px solid #f1f5f9' 
          }}>
            <MessageSquare size={32} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
            <p style={{ color: '#94a3b8', fontWeight: 600, margin: 0 }}>You haven't posted any broadcasts yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AnimatePresence>
              {myPosts.map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  layout
                  style={{ 
                    background: 'white', 
                    borderRadius: '20px', 
                    padding: '24px', 
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ 
                        color: '#1e293b', 
                        fontSize: '15px', 
                        lineHeight: 1.6, 
                        margin: '0 0 12px',
                        wordBreak: 'break-word'
                      }}>
                        {post.content}
                      </p>

                      {post.image_url && (
                        <img 
                          src={post.image_url} 
                          alt="Post" 
                          style={{ 
                            width: '100%', 
                            maxHeight: '250px', 
                            objectFit: 'cover', 
                            borderRadius: '12px', 
                            marginBottom: '12px' 
                          }} 
                        />
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {timeAgo(post.created_at)}
                        </span>
                        <span>❤️ {post.likes_count}</span>
                        <span>💬 {post.comments_count}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => promptDelete(post.id)}
                      disabled={deletingId === post.id}
                      title="Delete post"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        background: deletingId === post.id ? '#fecaca' : '#fef2f2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: deletingId === post.id ? 'not-allowed' : 'pointer',
                        transition: '0.2s',
                        flexShrink: 0
                      }}
                      onMouseEnter={e => { if (deletingId !== post.id) e.currentTarget.style.background = '#fecaca'; }}
                      onMouseLeave={e => { if (deletingId !== post.id) e.currentTarget.style.background = '#fef2f2'; }}
                    >
                      {deletingId === post.id ? <Loader2 size={18} className="spin" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '3rem' }}>
        {[
          { icon: <Globe size={24} color="#1a2652" />, title: 'Global Reach', text: 'Visible to all alumni, students, and admins.' },
          { icon: <ShieldCheck size={24} color="#16a34a" />, title: 'Verified Post', text: 'Broadcasts carry the Official Recruiter badge.' },
          { icon: <MessageSquare size={24} color="#c8102e" />, title: 'Engagement', text: 'Users can like and comment on your updates.' }
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
            <div style={{ marginBottom: '16px' }}>{item.icon}</div>
            <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{item.title}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5, fontWeight: 500 }}>{item.text}</p>
          </div>
        ))}
      </div>

      {/* Themed StatusModal */}
      <StatusModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        showConfirmOnly={modalConfig.showConfirmOnly}
        onConfirm={modalConfig.onConfirm}
      />

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default RecruiterPost;
