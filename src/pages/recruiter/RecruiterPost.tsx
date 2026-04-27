import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, Send, X, Upload, MessageSquare, AlertCircle, CheckCircle2, Globe, Lock, Clock } from 'lucide-react';
import nestMainLogo from '../../assets/nest_logo.png';

const RecruiterPost: React.FC = () => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [visibility, setVisibility] = useState('public');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePublish = async () => {
    if (!content.trim()) return;
    
    setIsPublishing(true);
    // Simulate API call
    setTimeout(() => {
      setIsPublishing(false);
      setShowSuccess(true);
      setContent('');
      removeMedia();
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            <MessageSquare size={24} color={nestRed} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Communication Hub</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
            Share an <span style={{ color: nestNavy }}>Update</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '16px' }}>Broadcast announcements, news, or celebrations to the alumni network.</p>
      </header>

      <div style={{ 
        background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', overflow: 'hidden'
      }}>
        {/* Post Creator Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                    <img src={nestMainLogo} alt="NeST" style={{ width: '24px' }} />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>NeST Recruitment Team</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setVisibility(visibility === 'public' ? 'private' : 'public')}>
                        {visibility === 'public' ? <Globe size={11} color="#64748b" /> : <Lock size={11} color="#64748b" />}
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{visibility === 'public' ? 'Public' : 'Alumni Only'}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Text Area */}
        <div style={{ padding: '32px' }}>
            <textarea 
                placeholder="What's happening in NeST Digital today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ 
                    width: '100%', minHeight: '160px', border: 'none', outline: 'none', fontSize: '18px', 
                    color: '#1e293b', lineHeight: 1.6, resize: 'none', background: 'transparent'
                }}
            />

            {/* Media Preview Area */}
            <AnimatePresence>
                {mediaPreview && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{ position: 'relative', marginTop: '24px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0' }}
                    >
                        <img src={mediaPreview} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                        <button 
                            onClick={removeMedia}
                            style={{ 
                                position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', 
                                backdropFilter: 'blur(10px)', color: '#fff', border: 'none', width: '36px', height: '36px', 
                                borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '20px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input type="file" ref={fileInputRef} onChange={handleMediaUpload} accept="image/*,video/*" style={{ display: 'none' }} />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ 
                        background: '#fff', color: '#475569', padding: '10px 16px', 
                        borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
                        fontSize: '13px', fontWeight: 700, border: '1px solid #e2e8f0', transition: 'all 0.2s'
                    }}
                >
                    <Image size={18} color={nestNavy} /> Photo/Video
                </button>
            </div>

            <button 
                onClick={handlePublish}
                disabled={!content.trim() || isPublishing}
                style={{ 
                    border: 'none', background: !content.trim() ? '#e2e8f0' : nestNavy, color: '#fff', 
                    padding: '12px 32px', borderRadius: '14px', cursor: 'pointer', fontWeight: 800, 
                    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', transition: 'all 0.3s',
                    boxShadow: !content.trim() ? 'none' : '0 10px 20px rgba(26, 38, 82, 0.2)'
                }}
            >
                {isPublishing ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Clock size={18} />
                    </motion.div>
                ) : <Send size={18} />}
                {isPublishing ? 'Publishing...' : 'Broadcast Post'}
            </button>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{ 
                    position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    background: '#10b981', color: '#fff', padding: '16px 32px', borderRadius: '100px',
                    display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
                    zIndex: 1000, fontWeight: 700
                }}
            >
                <CheckCircle2 size={24} />
                Your post has been broadcasted successfully!
            </motion.div>
        )}
      </AnimatePresence>

      <div style={{ paddingBottom: '100px' }} />
    </div>
  );
};

export default RecruiterPost;
