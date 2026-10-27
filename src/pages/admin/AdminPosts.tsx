import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImagePlus, Send, X, Loader2,
  CheckCircle2, Trash2, Clock, MessageSquare, Video as VideoIcon, Megaphone,
  Edit2, Save
} from 'lucide-react';
import { socialApi } from '../../services/api';
import StatusModal from '../../components/StatusModal';
import AutoPlayVideo from '../../components/AutoPlayVideo';

interface Post {
  id: string;
  _id?: string;
  content: string;
  image_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

const AdminPosts: React.FC = () => {
  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';
  
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Admin posts state
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
    if (!postContent) return;
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
        setMessage({ type: 'success', text: 'Management broadcast published successfully!' });
        setPostContent('');
        setSelectedImages([]);
        setSelectedVideo(null);
        fetchMyPosts();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to publish post.' });
      }
    } catch (err) {
      console.error('Admin Post Error:', err);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsPosting(false);
    }
  };

  const promptDelete = (postId: string) => {
    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: 'Delete Broadcast?',
      message: 'This broadcast post will be permanently removed from the community feed. This action cannot be undone.',
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
        setMyPosts(prev => prev.filter(p => (p.id ?? p._id)?.toString() !== postId.toString()));
        setModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Deleted Successfully',
          message: 'Your broadcast post has been removed from the feed.',
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
    
    let cleanStr = String(dateStr).trim();
    if (!cleanStr.endsWith('Z') && !/[+-]\d{2}(:?\d{2})?$/.test(cleanStr)) {
      cleanStr += 'Z';
    }
    
    const parsedTime = new Date(cleanStr).getTime();
    if (isNaN(parsedTime)) return 'Just now';

    const diff = Date.now() - parsedTime;
    if (diff < 60000) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(cleanStr).toLocaleDateString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '60px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Megaphone size={20} color={nestRed} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Management Communications</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>Broadcast Updates</h1>
          <p style={{ color: '#64748b', marginTop: '6px', fontSize: '15px' }}>Publish official news, engineering updates, and timelines to the entire NeST community.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Create Post Card */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 25px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(26, 38, 82, 0.08)', color: nestNavy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Compose Community Update</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>This will appear as an official Management Broadcast in the Career Timelines feed.</p>
            </div>
          </div>

          {message.text && (
            <div style={{ 
              padding: '14px 18px', 
              borderRadius: '16px', 
              marginBottom: '20px',
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
            placeholder="Write your announcement or career timeline milestone here..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={6}
            style={{ 
              width: '100%', 
              padding: '20px', 
              borderRadius: '20px', 
              border: '1px solid rgba(226, 232, 240, 0.8)', 
              outline: 'none', 
              fontSize: '15px', 
              resize: 'none', 
              background: '#f8fafc', 
              color: '#1e293b', 
              fontFamily: 'inherit', 
              marginBottom: '20px', 
              transition: 'all 0.3s', 
              lineHeight: '1.6' 
            }}
            onFocus={e => {
              e.target.style.borderColor = nestNavy;
              e.target.style.background = '#fff';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(226, 232, 240, 0.8)';
              e.target.style.background = '#f8fafc';
            }}
          />

          {/* Media Previews */}
          {(selectedImages.length > 0 || selectedVideo) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <AnimatePresence>
                {selectedImages.map((img, idx) => (
                  <motion.div 
                    key={`img-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{ position: 'relative', width: '150px', height: '110px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
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
                    style={{ position: 'relative', width: '190px', height: '110px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div>
                <input 
                  type="file" 
                  id="admin-photo-upload" 
                  multiple 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload} 
                />
                <label 
                  htmlFor="admin-photo-upload" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', background: '#f1f5f9', color: '#475569', borderRadius: '30px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                >
                  <ImagePlus size={18} color={nestRed} /> Add Photo
                </label>
              </div>
              <div>
                <input 
                  type="file" 
                  id="admin-video-upload" 
                  accept="video/*" 
                  style={{ display: 'none' }} 
                  onChange={handleVideoUpload} 
                />
                <label 
                  htmlFor="admin-video-upload" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', background: '#f1f5f9', color: '#475569', borderRadius: '30px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                >
                  <VideoIcon size={18} color={nestRed} /> Add Video
                </label>
              </div>
            </div>
            
            <button 
              onClick={handlePost}
              disabled={!postContent || isPosting}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 36px', 
                background: (!postContent) ? '#cbd5e1' : `linear-gradient(135deg, ${nestNavy} 0%, #2a3a7a 100%)`, 
                color: '#fff', borderRadius: '30px', fontWeight: 800, border: 'none', cursor: (!postContent) ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
                boxShadow: (!postContent) ? 'none' : `0 10px 20px rgba(26, 38, 82, 0.15)`
              }}
              onMouseEnter={e => { if (postContent) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { if (postContent) e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {isPosting ? 'Publishing...' : <><Send size={16} /> Publish Broadcast</>}
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast History */}
      <div style={{ marginTop: '20px', paddingTop: '40px', borderTop: '2px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0 }}>My Broadcast History</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>Manage and track all updates you've shared with the community.</p>
          </div>
          <div style={{ background: `${nestNavy}10`, color: nestNavy, padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}>
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
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
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
                            fontFamily: 'inherit',
                            marginBottom: '12px'
                          }}
                        />
                      ) : (
                        <p style={{ 
                          color: '#1e293b', 
                          fontSize: '15px', 
                          lineHeight: 1.6, 
                          margin: '0 0 12px',
                          wordBreak: 'break-word'
                        }}>
                          {post.content}
                        </p>
                      )}

                      {post.image_url && !editingId && (
                        <img 
                          src={post.image_url} 
                          alt="Broadcast attachment" 
                          style={{ 
                            width: '100%', 
                            maxHeight: '250px', 
                            objectFit: 'cover', 
                            borderRadius: '12px', 
                            marginBottom: '12px' 
                          }} 
                        />
                      )}

                      {post.video_url && !editingId && (
                        <div style={{ width: '100%', maxHeight: '250px', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
                          <AutoPlayVideo 
                            src={post.video_url} 
                            maxHeight="250px"
                            style={{ borderRadius: '12px', width: '100%' }} 
                          />
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {timeAgo(post.created_at)}
                        </span>
                        <span>❤️ {post.likes_count}</span>
                      </div>
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
                            title="Edit broadcast"
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
                            title="Delete broadcast"
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
                        </>
                      )}
                    </div>
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

export default AdminPosts;
