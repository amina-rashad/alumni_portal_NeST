import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImagePlus, Send, X, Loader2, Edit2, Save,
  CheckCircle2, Trash2, Clock, Video as VideoIcon, Megaphone
} from 'lucide-react';
import { socialApi } from '../../services/api';
import StatusModal from '../../components/StatusModal';

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

const CourseManagerPosts: React.FC = () => {
  const brandPrimary = '#233167'; // NeST Navy
  
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
      console.error('Failed to fetch broadcasts:', err);
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
      console.error('Course Manager Post Error:', err);
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
      message: 'This broadcast will be permanently removed from the community feed. This action cannot be undone.',
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
          message: res.message || 'Could not delete the broadcast. Please try again.',
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
          message: res.message || 'Could not save edits. Please try again.',
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
        message: 'Something went wrong while updating.',
        confirmText: 'Okay',
        showConfirmOnly: true,
        onConfirm: closeModal,
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    try {
      let cleanStr = String(dateStr).trim();
      if (!cleanStr.endsWith('Z') && !/[+-]\d{2}(:?\d{2})?$/.test(cleanStr)) {
        cleanStr += 'Z';
      }
      const parsedTime = new Date(cleanStr).getTime();
      if (isNaN(parsedTime)) return 'Recently';

      const diffMs = Date.now() - parsedTime;
      if (diffMs < 60000) return 'Just now';
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(cleanStr).toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '80px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Megaphone size={28} color={brandPrimary} /> Broadcast to Community
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
          Publish course announcements, curriculum milestones, and academic updates directly to the community feed.
        </p>
      </div>

      {/* Main Single White Card Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: '28px',
        border: '1px solid #e2e8f0',
        padding: '36px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Broadcast Content
          </label>
          <textarea
            rows={5}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share an academic milestone, new module release, or course announcement with learners and alumni..."
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '15px',
              color: '#1e293b',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.6
            }}
          />

          {/* Media Previews */}
          {selectedImages.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {selectedImages.map((img, i) => (
                <div key={i} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={img} alt="Upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedVideo && (
            <div style={{ position: 'relative', width: '240px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <video src={selectedVideo} style={{ width: '100%', maxHeight: '140px' }} controls />
              <button
                onClick={() => setSelectedVideo(null)}
                style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                <ImagePlus size={16} color={brandPrimary} />
                <span>Attach Photo</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                <VideoIcon size={16} color="#059669" />
                <span>Attach Video</span>
                <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <button
              onClick={handlePost}
              disabled={isPosting || !postContent.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '14px',
                background: brandPrimary,
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '14px',
                cursor: isPosting || !postContent.trim() ? 'not-allowed' : 'pointer',
                opacity: isPosting || !postContent.trim() ? 0.6 : 1,
                boxShadow: '0 4px 16px rgba(35, 49, 103, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{isPosting ? 'Broadcasting...' : 'Broadcast'}</span>
            </button>
          </div>

          {message.text && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: message.type === 'success' ? '#059669' : '#dc2626',
              border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
            }}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Broadcast History */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
              My Broadcast History
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
              Recent updates published from Course Management
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', background: '#f1f5f9', padding: '6px 14px', borderRadius: '100px' }}>
            {myPosts.length} Broadcasts
          </span>
        </div>

        {loadingPosts ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 size={32} className="animate-spin" color={brandPrimary} />
          </div>
        ) : myPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <Megaphone size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>No broadcasts published yet</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Your published updates to the community feed will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {myPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  padding: '28px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Post Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
                    <Clock size={14} />
                    <span>{formatRelativeTime(post.created_at)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {editingId === post.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(post.id)}
                          disabled={isSavingEdit}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Save size={14} /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(post)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => promptDelete(post.id)}
                          disabled={deletingId === post.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                {editingId === post.id ? (
                  <textarea
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit' }}
                  />
                ) : (
                  <p style={{ margin: 0, fontSize: '15px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {post.content}
                  </p>
                )}

                {/* Media Attachment */}
                {post.image_url && (
                  <div style={{ borderRadius: '16px', overflow: 'hidden', maxHeight: '350px', border: '1px solid #f1f5f9' }}>
                    <img src={post.image_url} alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {post.video_url && (
                  <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <video src={post.video_url} style={{ width: '100%', maxHeight: '300px' }} controls />
                  </div>
                )}

                {/* Engagement Footer - Likes Only */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #f8fafc', paddingTop: '12px', color: '#64748b', fontSize: '13px', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ❤️ {post.likes_count || 0} Likes
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default CourseManagerPosts;
