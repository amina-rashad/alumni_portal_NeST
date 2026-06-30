import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImagePlus, Send, X, Loader2, Edit2, Save,
  CheckCircle2, Trash2, Clock, MessageSquare, Video as VideoIcon
} from 'lucide-react';
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

const RecruiterPosts: React.FC = () => {
  const brandPrimary = '#1a2652'; // Nest Navy
  
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // My posts state
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [tick, setTick] = useState(0);

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
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePost = async () => {
    if (!postContent.trim()) return;
    setIsPosting(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        content: postContent,
        image_url: selectedImages.length > 0 ? selectedImages[0] : undefined,
        video_url: selectedVideo || undefined
      };
      
      const res = await socialApi.createPost(payload);
      if (res.success) {
        setMessage({ type: 'success', text: 'Broadcast sent successfully!' });
        setPostContent('');
        setSelectedImages([]);
        setSelectedVideo(null);
        fetchMyPosts();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to post update.' });
      }
    } catch (err) {
      console.error('Recruiter Post Error:', err);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsPosting(false);
    }
  };

  const promptDelete = (postId: string) => {
    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: 'Delete Post?',
      message: 'This post will be permanently removed from the feed. This action cannot be undone.',
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
          message: 'Your post has been removed successfully.',
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

  const handleEditClick = (post: Post) => {
    setEditingId(post.id);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editContent.trim()) return;
    setIsSavingEdit(true);
    try {
      const res = await socialApi.updatePost(postId, { content: editContent });
      if (res.success) {
        setMyPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent } : p));
        setEditingId(null);
        setEditContent('');
      } else {
        setModalConfig({
          isOpen: true,
          type: 'error',
          title: 'Update Failed',
          message: res.message || 'Could not update the post. Please try again.',
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
      setIsSavingEdit(false);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0, fontFamily: "'Montserrat', sans-serif" }}>Community Feed</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Share updates, job alerts, and company news with the alumni community.</p>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          
          {/* Create Post Card */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${brandPrimary}15`, color: brandPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImagePlus size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Create New Broadcast</h3>
            </div>

            {message.text && (
              <div style={{ 
                padding: '14px 16px', 
                borderRadius: '14px', 
                marginBottom: '16px',
                background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                color: message.type === 'success' ? '#16a34a' : '#ef4444',
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={16} />
                {message.text}
              </div>
            )}
            

            <textarea 
              placeholder="What would you like to broadcast today? Share job updates or company highlights..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={6}
              style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px', resize: 'none', background: '#fff', color: '#1e293b', fontFamily: 'inherit', marginBottom: '16px', transition: 'all 0.2s', lineHeight: '1.6' }}
            />

            {/* Media Previews */}
            {(selectedImages.length > 0 || selectedVideo) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                <AnimatePresence>
                  {selectedImages.map((img, idx) => (
                    <motion.div 
                      key={`img-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={{ position: 'relative', width: '140px', height: '100px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    >
                      <img src={img} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => handleRemoveImage(idx)}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                  {selectedVideo && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={{ position: 'relative', width: '180px', height: '100px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    >
                      <video src={selectedVideo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <VideoIcon size={24} color="#fff" />
                      </div>
                      <button 
                        onClick={() => setSelectedVideo(null)}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div>
                  <input 
                    type="file" 
                    id="photo-upload" 
                    multiple 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload} 
                  />
                  <label 
                    htmlFor="photo-upload" 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#f1f5f9', color: '#475569', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                  >
                    <ImagePlus size={18} /> Photo
                  </label>
                </div>
                <div>
                  <input 
                    type="file" 
                    id="video-upload" 
                    accept="video/*" 
                    style={{ display: 'none' }} 
                    onChange={handleVideoUpload} 
                  />
                  <label 
                    htmlFor="video-upload" 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#f1f5f9', color: '#475569', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                  >
                    <VideoIcon size={18} /> Video
                  </label>
                </div>
              </div>
              <button 
                onClick={handlePost}
                disabled={!postContent.trim() || isPosting}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', 
                  background: (!postContent.trim()) ? '#cbd5e1' : brandPrimary, 
                  color: '#fff', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: (!postContent.trim()) ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  boxShadow: (!postContent.trim()) ? 'none' : `0 4px 14px 0 rgba(26, 38, 82, 0.3)`
                }}
              >
                {isPosting ? 'Broadcasting...' : <><Send size={16} /> Broadcast Now</>}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* My Posts Section */}
      <div style={{ marginTop: '20px', paddingTop: '40px', borderTop: '2px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0 }}>My Broadcast History</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>Manage and track all updates you've shared with the community.</p>
          </div>
          <div style={{ background: `${brandPrimary}10`, color: brandPrimary, padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}>
            {myPosts.length} {myPosts.length === 1 ? 'Broadcast' : 'Broadcasts'}
          </div>
        </div>

        {loadingPosts ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Loader2 size={28} className="spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>Loading your broadcasts...</p>
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
            <p style={{ color: '#94a3b8', fontWeight: 600, margin: 0 }}>You haven't broadcasted anything yet.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', 
            gap: '24px' 
          }}>
            <AnimatePresence>
              {myPosts.map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                  style={{ 
                    background: 'white', 
                    borderRadius: '20px', 
                    padding: '28px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8', fontWeight: 600, marginBottom: '16px' }}>
                          <Clock size={16} /> {timeAgo(post.created_at)}
                        </div>
                        
                        {editingId === post.id ? (
                          <textarea 
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            style={{ 
                              width: '100%', 
                              minHeight: '120px', 
                              padding: '16px', 
                              borderRadius: '12px', 
                              border: '1px solid #cbd5e1', 
                              fontSize: '15px', 
                              resize: 'vertical',
                              outline: 'none',
                              lineHeight: 1.6,
                              fontFamily: 'inherit'
                            }}
                          />
                        ) : (
                          <p style={{ 
                            color: '#1e293b', 
                            fontSize: '16px', 
                            lineHeight: 1.7, 
                            margin: 0,
                            wordBreak: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {post.content}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {editingId === post.id ? (
                          <>
                            <button
                              onClick={handleCancelEdit}
                              title="Cancel"
                              style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px', background: '#f1f5f9', color: '#64748b',
                                border: 'none', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                              }}
                            >
                              <X size={18} />
                            </button>
                            <button
                              onClick={() => handleSaveEdit(post.id)}
                              disabled={isSavingEdit || !editContent.trim()}
                              title="Save Edit"
                              style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px', background: '#ecfdf5', color: '#10b981',
                                border: 'none', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                                opacity: (!editContent.trim() || isSavingEdit) ? 0.5 : 1
                              }}
                            >
                              {isSavingEdit ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(post)}
                              title="Edit post"
                              style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px', background: '#f8fafc', color: '#64748b',
                                border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                              onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => promptDelete(post.id)}
                              disabled={deletingId === post.id}
                              title="Delete post"
                              style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px', background: deletingId === post.id ? '#fecaca' : '#fef2f2', color: '#ef4444',
                                border: 'none', borderRadius: '12px', cursor: deletingId === post.id ? 'not-allowed' : 'pointer', transition: '0.2s',
                              }}
                              onMouseEnter={e => { if (deletingId !== post.id) e.currentTarget.style.background = '#fecaca'; }}
                              onMouseLeave={e => { if (deletingId !== post.id) e.currentTarget.style.background = '#fef2f2'; }}
                            >
                              {deletingId === post.id ? <Loader2 size={18} className="spin" /> : <Trash2 size={18} />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {post.image_url && !editingId && (
                      <img 
                        src={post.image_url} 
                        alt="Post" 
                        style={{ 
                          width: '100%', 
                          height: '240px', 
                          objectFit: 'cover', 
                          borderRadius: '16px' 
                        }} 
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#94a3b8', fontWeight: 600, borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>❤️ {post.likes_count}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
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

export default RecruiterPosts;
