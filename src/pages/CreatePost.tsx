import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ImageIcon, FileText, 
  MapPin, Sparkles, 
  Send, X, Globe, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>(['NeSTLife']);
  const [newTag, setNewTag] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibility, setVisibility] = useState<'Public' | 'Connections'>('Public');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePostSubmit = () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    // Mock API delay
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/social/feed');
    }, 1500);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button 
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', background: 'none', border: 'none', padding: 0.5, cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Inspire the <span style={{ color: '#d32f2f' }}>Community</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '1.1rem' }}>Share your achievements, insights, or updates with the network.</p>
        </motion.div>
      </div>

      <div className="luxury-card" style={{ padding: '2.5rem', border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden' }}>
        {/* User Context */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', border: '2px solid #fff', boxShadow: '0 0 0 2px #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0F172A' }}>
              NS
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Noble Sibi</h4>
              <button 
                onClick={() => setVisibility(visibility === 'Public' ? 'Connections' : 'Public')}
                style={{ 
                  marginTop: '0.2rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: '#64748B',
                  background: '#F1F5F9',
                  border: 'none',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {visibility === 'Public' ? <Globe size={12} /> : <Lock size={12} />} {visibility}
              </button>
            </div>
          </div>
          
          <Sparkles size={24} color="#f59e0b" style={{ opacity: 0.2 }} />
        </div>

        {/* Post Area */}
        <textarea 
          placeholder="What's your story today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ 
            width: '100%', 
            minHeight: '150px', 
            border: 'none', 
            background: 'transparent', 
            fontSize: '1.25rem', 
            lineHeight: 1.6, 
            color: '#0F172A', 
            outline: 'none',
            resize: 'none',
            marginBottom: '1rem'
          }}
        />

        {/* Image Previews */}
        {selectedImages.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '1.5rem' }}>
            {selectedImages.map((img, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <img src={img} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  onClick={() => handleRemoveImage(idx)}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem' }}>
          {tags.map(tag => (
            <motion.span 
              layout
              key={tag} 
              style={{ background: '#F1F5F9', color: '#0F172A', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              #{tag} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
            </motion.span>
          ))}
          <input 
            type="text" 
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={addTag}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              outline: 'none', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: '#d32f2f',
              width: '120px'
            }}
          />
        </div>

        {/* Media Attachments */}
        <div style={{ display: 'flex', gap: '0.75rem', padding: '1.5rem 0', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="file" 
              id="user-photo-upload" 
              multiple 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
            />
            <label 
              htmlFor="user-photo-upload" 
              style={{ padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
            >
              <ImageIcon size={20} color="#10B981" /> Photo / Video
            </label>
          </div>
          <button style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            <FileText size={20} color="#3B82F6" /> Document
          </button>
          <button style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            <MapPin size={20} color="#EF4444" /> Location
          </button>
        </div>

        {/* Post Button */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
             onClick={handlePostSubmit}
             disabled={!content.trim() || isSubmitting}
             style={{ 
               padding: '1rem 3rem', 
               borderRadius: '16px', 
               background: content.trim() ? '#0F172A' : '#F1F5F9', 
               color: content.trim() ? 'white' : '#94A3B8', 
               border: 'none', 
               fontWeight: 800, 
               fontSize: '1.1rem',
               cursor: content.trim() ? 'pointer' : 'default',
               display: 'flex',
               alignItems: 'center',
               gap: '0.75rem',
               transition: 'all 0.3s'
             }}
          >
            {isSubmitting ? 'Posting...' : 'Post Update'} <Send size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .luxury-card {
           background: #ffffff;
           border-radius: 32px;
           box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
           transition: all 0.4s ease;
        }
        button:not(:disabled):hover {
           transform: translateY(-2px);
           box-shadow: 0 8px 16px rgba(0,0,0,0.06);
        }
        button:not(:disabled):active {
           transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default CreatePost;
