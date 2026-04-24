import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImagePlus, Send, X, Calendar, MapPin, 
  MoreHorizontal, Heart, MessageSquare, Share2
} from 'lucide-react';

const mockEvents = [
  { id: '1', name: 'Global Alumni Meet 2024' },
  { id: '2', name: 'Tech Talk: Future of AI' },
  { id: '3', name: 'Web Development Workshop' },
];

const mockPosts = [
  {
    id: 1,
    title: 'Global Alumni Meet',
    subtitle: 'Posted 2 hours ago',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Tech Talk: Future of AI',
    subtitle: 'Insights from prominent speakers',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Web Dev Workshop',
    subtitle: 'Hands-on coding session',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Startup Mixer',
    subtitle: 'Networking with founders',
    image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  }
];

const EventManagerPosts: React.FC = () => {
  const brandPrimary = '#233167';
  
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Create local object URLs for preview
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePost = () => {
    if (!selectedEvent || !postContent) return;
    setIsPosting(true);
    setTimeout(() => {
      alert('Event post created successfully!');
      setIsPosting(false);
      setSelectedEvent('');
      setSelectedClass('');
      setPostContent('');
      setSelectedImages([]);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0, fontFamily: "'Montserrat', sans-serif" }}>Event Posts</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Share event highlights, photos, and updates with participants.</p>
        </div>
      </div>

      <div>
        
        {/* Main Feed Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          
          {/* Create Post Card */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${brandPrimary}15`, color: brandPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImagePlus size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Create New Post</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <select 
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', background: '#f8fafc', color: '#334155', fontWeight: 500 }}
              >
                <option value="" disabled>Select Event...</option>
                {mockEvents.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.name}</option>
                ))}
              </select>

              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', background: '#f8fafc', color: '#334155', fontWeight: 500 }}
              >
                <option value="" disabled>Select Class / Section...</option>
                {['All Classes', 'B.Tech CS 2024', 'B.Tech IT 2023', 'MBA 2024', 'MCA 2025'].map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <textarea 
              placeholder="What do you want to share about this event? Add highlights or after-event thoughts..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', resize: 'none', background: '#fff', fontFamily: 'inherit', marginBottom: '16px', transition: 'all 0.2s' }}
            />

            {/* Image Previews */}
            {selectedImages.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <AnimatePresence>
                  {selectedImages.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      <img src={img} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => handleRemoveImage(idx)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
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
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#f1f5f9', color: '#475569', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <ImagePlus size={16} /> Add Photos
                </label>
              </div>
              <button 
                onClick={handlePost}
                disabled={!selectedEvent || !selectedClass || !postContent || isPosting}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', 
                  background: (!selectedEvent || !selectedClass || !postContent) ? '#cbd5e1' : brandPrimary, 
                  color: '#fff', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: (!selectedEvent || !selectedClass || !postContent) ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  boxShadow: (!selectedEvent || !selectedClass || !postContent) ? 'none' : `0 4px 14px 0 rgba(35, 49, 103, 0.3)`
                }}
              >
                {isPosting ? 'Posting...' : <><Send size={16} /> Post</>}
              </button>
            </div>
          </div>



        </div>
      </div>

      {/* Recent Posts Gallery */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Recent Posts Gallery</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {mockPosts.map((post) => (
            <div key={post.id} style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ position: 'relative', width: '100%', paddingBottom: '75%' }}>
                 <img src={post.image} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '24px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{post.title}</h4>
                 <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{post.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventManagerPosts;
