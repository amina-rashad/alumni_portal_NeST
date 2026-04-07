import React, { useState, useEffect, useRef } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, ThumbsUp, MessageSquare, Share2, 
  MoreHorizontal, Image as ImageIcon, 
  Clock, PlayCircle, Plus, Sparkles,
  Briefcase, Send, Paperclip, ChevronRight, CheckCircle2,
  Heart, Navigation, Zap, FileText, Lightbulb, Search, X,
  Camera, Video, Crown, Smile, GalleryVerticalEnd, Flame,
  TrendingUp, Users, Calendar, Award
} from 'lucide-react';

import { socialApi } from '../services/api';

// --- MOCK DATA ---

const currentUser = {
  name: 'John Doe',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=DC2626&color=fff'
};

const stories = [
  { id: 's1', name: 'Your Story', avatar: currentUser.avatar, isUser: true, hasUnseen: false },
  { id: 's2', name: 'Google HQ', avatar: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200', isUser: false, hasUnseen: true },
  { id: 's3', name: 'NeST Alumni', avatar: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200', isUser: false, hasUnseen: true },
  { id: 's4', name: 'Elena', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200', isUser: false, hasUnseen: true },
  { id: 's5', name: 'Startup Pitch', avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200', isUser: false, hasUnseen: false },
  { id: 's6', name: 'James', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200', isUser: false, hasUnseen: false },
];

const feedPosts = [
  {
    id: 1,
    type: 'opportunity',
    author: {
      name: 'Alex Mercer',
      role: 'Engineering Manager @ Stripe',
      batch: 'Batch of 2015',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150'
    },
    time: '3 hours ago',
    content: "We're expanding our payments infrastructure team at Stripe! Looking for mid to senior backend engineers (Go/Java). I'm happy to refer NeST alumni directly. DM me with your resume! 🚀",
    media: null,
    referralData: {
      canRefer: true,
      successRate: '85%',
      referrers: [
        { name: 'Alex M.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150' },
        { name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150' }
      ]
    },
    reactions: { like: 210, support: 40, celebrate: 10, applaud: 70 },
    comments: 42,
  },
  {
    id: 2,
    type: 'career',
    author: {
      name: 'Michael Chang',
      role: 'Data Scientist @ OpenAI',
      batch: 'Batch of 2024',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150'
    },
    time: '5 hours ago',
    content: "3 months into my first job — here’s what I learned…\n\n1. Imposter syndrome is real, but everyone has it.\n2. Ask questions. Seriously, nobody expects you to know everything.\n3. Document your wins.\n\nThankful for the foundation NeST gave me. Excited for the journey ahead!",
    media: null,
    reactions: { like: 450, support: 100, celebrate: 80, applaud: 220 },
    comments: 34,
  },
  {
    id: 3,
    type: 'reel',
    author: {
      name: 'Sarah Jenkins',
      role: 'Tech Lead @ StartupInc',
      batch: 'Batch of 2020',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150'
    },
    time: '1 day ago',
    content: "Quick office tour of our new workspace in San Francisco! 🌉 The views are amazing.",
    media: { type: 'video', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop', duration: '0:24' },
    reactions: { like: 540, support: 0, celebrate: 200, applaud: 80 },
    comments: 112,
  },
  {
    id: 5,
    type: 'lifestyle',
    author: {
      name: 'James Chen',
      role: 'Product Designer',
      batch: 'Batch of 2018',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150'
    },
    time: '3 days ago',
    content: "Back to where it all started ❤️ #CampusDays\n\nVisited the old campus today and the nostalgia hit hard. The library where we pulled all-nighters, the cafeteria where startup ideas were born... so many memories!",
    media: { type: 'image', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop' },
    reactions: { like: 340, support: 10, celebrate: 50, applaud: 5 },
    comments: 56,
  }
];

// --- ANIMATION VARIANTS ---
const smoothSpring = { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 };

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { ...smoothSpring, staggerChildren: 0.12, delayChildren: 0.1 } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: smoothSpring
  }
};

const formatContent = (text: string) => {
  return text.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i !== text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

// --- COMPONENTS ---

const CareerGuidance = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div variants={itemVariants} className="glass-card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-premium"
        style={{ 
          width: '100%', padding: '1.5rem', background: isOpen ? '#FEF2F2' : 'linear-gradient(135deg, #ffffff 0%, #FEF2F2 100%)', 
          border: 'none', borderBottom: isOpen ? '1px solid #FEE2E2' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', background: '#DC2626', borderRadius: '14px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)' }}>
              <Navigation size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '1.15rem', fontWeight: 800 }}>Discover Your Career Path</h3>
              <p style={{ margin: '0.2rem 0 0', color: '#6B7280', fontSize: '0.85rem', fontWeight: 500 }}>Unlock AI suggestions and alumni insights.</p>
            </div>
        </div>
        
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.3 }} style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', color: '#DC2626', display: 'flex' }}>
          <ChevronRight size={20} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem', color: '#111827', fontSize: '1rem' }}>People from the same background:</h4>
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }} className="stories-scroll">
                {[
                  { name: 'Alice', role: 'UX Designer', company: 'Figma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150' },
                  { name: 'Bob', role: 'Product Manager', company: 'Google', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150' },
                  { name: 'Charlie', role: 'Frontend Dev', company: 'Vercel', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150' }
                ].map((person, i) => (
                  <div key={i} style={{ minWidth: '140px', background: '#F9FAFB', borderRadius: '12px', padding: '1rem', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <img src={person.avatar} style={{ width: '48px', height: '48px', borderRadius: '50%', marginBottom: '0.5rem' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{person.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{person.role}</span>
                    <span style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600 }}>@ {person.company}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', color: '#111827', fontSize: '1rem' }}>Suggested Next Steps</h4>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F9FAFB', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.25rem', borderRadius: '50%' }}><Lightbulb size={16} /></span>
                    <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>Take the <strong style={{ color: '#DC2626', cursor: 'pointer' }}>Career Assessment Quiz</strong></span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F9FAFB', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.25rem', borderRadius: '50%' }}><MessageSquare size={16} /></span>
                    <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>Book a 1:1 mentorship with <strong style={{ color: '#DC2626', cursor: 'pointer' }}>Alumni Mentors</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CreatePostModal = ({ onClose, onPublish }: { onClose: () => void, onPublish: (content: string) => void }) => {
  const [text, setText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeAttachments, setActiveAttachments] = useState<Record<string, boolean>>({ photo: false, video: false, event: false });

  const toggleAttachment = (type: string) => {
    setActiveAttachments(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handlePublish = async () => {
    if (text.trim() === '') return;
    setIsPublishing(true);
    await onPublish(text);
    setIsPublishing(false);
  };

  const attachmentButtons = [
    { key: 'photo', icon: Camera, label: 'Photo', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #DC2626 100%)' },
    { key: 'video', icon: Video, label: 'Video', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
    { key: 'event', icon: Crown, label: 'Event', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' },
  ];

  return (
    <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
       onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.1)' }}
      >
        {/* Header with sweep light */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(243,244,246,0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <h2 className="create-post-title" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#111827', position: 'relative', letterSpacing: '-0.02em' }}>Create a Post</h2>
          <motion.button 
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            style={{ background: '#F3F4F6', border: 'none', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', transition: 'background 0.2s' }}
          >
            <X size={20} color="#4B5563" />
          </motion.button>
        </div>
        
        <div style={{ padding: '1.75rem' }}>
          {/* User info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}
          >
            <div style={{ position: 'relative' }}>
              <img src={currentUser.avatar} style={{ width: '52px', height: '52px', borderRadius: '50%', border: '3px solid rgba(220,38,38,0.15)', boxShadow: '0 4px 14px rgba(220,38,38,0.12)' }} />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', background: '#10B981', borderRadius: '50%', border: '2.5px solid white' }}
              />
            </div>
            <div>
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#111827' }}>{currentUser.name}</h4>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={12} color="#DC2626" /> Sharing to Community
              </p>
            </div>
          </motion.div>

          {/* Premium Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ marginTop: '1rem', borderRadius: '18px', overflow: 'hidden', position: 'relative' }}
          >
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you want to share with the alumni community?"
              style={{ 
                width: '100%', 
                border: 'none', 
                outline: 'none', 
                minHeight: '140px', 
                resize: 'none', 
                fontSize: '1rem', 
                color: '#111827', 
                fontFamily: '"Inter", sans-serif',
                background: 'linear-gradient(145deg, #F9FAFB 0%, #F3F4F6 100%)',
                padding: '1.25rem 1.5rem',
                borderRadius: '18px',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)',
                lineHeight: 1.6,
                letterSpacing: '0.01em',
                fontWeight: 500
              }}
            />
            {/* Character count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: text.length > 0 ? 1 : 0 }}
              style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}
            >
              {text.length} / 2000
            </motion.div>
          </motion.div>

          {/* Active attachments indicator */}
          <AnimatePresence>
            {Object.values(activeAttachments).some(v => v) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {activeAttachments.photo && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: '0.75rem', background: 'linear-gradient(135deg, #FEE2E2, #FFF1F2)', color: '#DC2626', padding: '0.35rem 0.75rem', borderRadius: '999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid rgba(220,38,38,0.15)' }}>
                      <Camera size={12} /> Photo ready
                    </motion.span>
                  )}
                  {activeAttachments.video && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: '0.75rem', background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)', color: '#D97706', padding: '0.35rem 0.75rem', borderRadius: '999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid rgba(217,119,6,0.15)' }}>
                      <Video size={12} /> Video ready
                    </motion.span>
                  )}
                  {activeAttachments.event && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: '0.75rem', background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)', color: '#7C3AED', padding: '0.35rem 0.75rem', borderRadius: '999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid rgba(124,58,237,0.15)' }}>
                      <Crown size={12} /> Event ready
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Add to post - Premium Attachment Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{ border: '1px solid rgba(229,231,235,0.6)', borderRadius: '18px', padding: '1rem 1.25rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(249,250,251,0.5)' }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Flame size={16} color="#DC2626" /> Add to your post
            </span>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {attachmentButtons.map((btn, idx) => {
                const Icon = btn.icon;
                const isActive = activeAttachments[btn.key];
                return (
                  <motion.button
                    key={btn.key}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleAttachment(btn.key)}
                    title={btn.label}
                    style={{ 
                      background: isActive ? btn.gradient : 'rgba(243,244,246,0.8)',
                      border: isActive ? 'none' : '1px solid rgba(229,231,235,0.6)',
                      padding: '0.6rem', 
                      borderRadius: '14px', 
                      color: isActive ? 'white' : '#6B7280', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isActive ? `0 4px 14px ${btn.gradient.includes('#DC2626') ? 'rgba(220,38,38,0.3)' : btn.gradient.includes('#D97706') ? 'rgba(217,119,6,0.3)' : 'rgba(124,58,237,0.3)'}` : 'none',
                      transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                    }}
                  >
                    <Icon size={20} />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
        
        {/* Publish Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid rgba(243,244,246,0.8)', background: 'linear-gradient(to top, rgba(249,250,251,0.8), rgba(255,255,255,0.4))' }}
        >
          <motion.button 
            onClick={handlePublish}
            disabled={text.length === 0 || isPublishing}
            whileHover={text.length > 0 && !isPublishing ? { scale: 1.01, y: -1 } : {}}
            whileTap={text.length > 0 && !isPublishing ? { scale: 0.98 } : {}}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              background: (text.length > 0 && !isPublishing) 
                ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)' 
                : 'linear-gradient(135deg, #FCA5A5 0%, #FECACA 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '16px', 
              fontWeight: 700, 
              fontSize: '1rem', 
              cursor: (text.length > 0 && !isPublishing) ? 'pointer' : 'not-allowed', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '0.5rem',
              boxShadow: (text.length > 0 && !isPublishing) ? '0 8px 25px rgba(220, 38, 38, 0.3)' : 'none',
              transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              letterSpacing: '0.02em',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Sweep light on publish button */}
            {text.length > 0 && !isPublishing && (
              <motion.div
                animate={{ x: ['-200%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', repeatDelay: 1 }}
                style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', pointerEvents: 'none' }}
              />
            )}
            {isPublishing ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ height: '20px', width: '20px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                <span style={{ opacity: 0.9 }}>Publishing...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Publish Post
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const StoryViewerModal = ({ stories, initialStoryId, onClose, updateStoryInParent }: any) => {
  const initialIndex = stories.findIndex((s: any) => s.id === initialStoryId);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [direction, setDirection] = useState(0);

  const [replyText, setReplyText] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  const wheelLock = useRef<boolean>(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLock.current) return;
    if (Math.abs(e.deltaY) > 20 || Math.abs(e.deltaX) > 20) {
      if (e.deltaY > 0 || e.deltaX > 0) handleNext();
      else handlePrev();
      wheelLock.current = true;
      setTimeout(() => { wheelLock.current = false; }, 800);
    }
  };

  const story = stories[currentIndex];

  useEffect(() => {
    updateStoryInParent(story);
  }, [currentIndex, story, updateStoryInParent]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReplySubmit = (e: any) => {
    if (e.key === 'Enter' && replyText.trim() !== '') {
      setReplySuccess(true);
      setReplyText("");
      setTimeout(() => setReplySuccess(false), 3000);
    }
  };

  const handleShareToPerson = (personName: string) => {
    setShareSuccess(personName);
    setTimeout(() => {
      setShareSuccess(null);
      setShowShareMenu(false);
    }, 1500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onClose]);

  useEffect(() => {
    if (showShareMenu || replyText.length > 0) return;
    const timer = setTimeout(() => {
      handleNext();
    }, 10000);
    return () => clearTimeout(timer);
  }, [currentIndex, showShareMenu, replyText]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '40%' : '-40%',
      opacity: 0,
      scale: 0.85,
      filter: 'blur(8px)'
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)'
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '40%' : '-40%',
      opacity: 0,
      scale: 0.85,
      filter: 'blur(8px)'
    })
  };

  const handleLike = () => {
    setLiked(prev => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onWheel={handleWheel}
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
    >
      {/* Tap Zones */}
      <div onClick={handlePrev} style={{ position: 'absolute', top: '100px', left: 0, bottom: '100px', width: '30%', zIndex: 10, cursor: 'w-resize' }} />
      <div onClick={handleNext} style={{ position: 'absolute', top: '100px', right: 0, bottom: '100px', width: '30%', zIndex: 10, cursor: 'e-resize' }} />

      {/* Top Navigation */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={story.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white' }} />
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{story.isUser ? 'Your Story' : story.name}</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>2h</span>
        </div>
        <button className="btn-premium" onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
          <X size={20} />
        </button>
      </div>

      {/* Reply Success Component */}
      <AnimatePresence>
        {replySuccess && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', top: '15%', background: '#10B981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '999px', zIndex: 50, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}>
            <CheckCircle2 size={18} /> Reply sent to {story.isUser ? 'yourself' : story.name}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bars */}
      <div style={{ position: 'absolute', top: '0.75rem', left: '1rem', right: '1rem', display: 'flex', gap: '4px', zIndex: 20 }}>
        <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
          <motion.div 
            key={story.id} 
            initial={{ width: 0 }} 
            animate={{ width: '100%' }} 
            transition={{ duration: 10, ease: 'linear' }} 
            style={{ height: '100%', background: 'white' }} 
          />
        </div>
      </div>
      
      {/* Sliding Image Container */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={story.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 400, damping: 35 }, opacity: { duration: 0.3 }, scale: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          layoutId={`story-img-${story.id}`}
          src={story.avatar}
          alt="Story Content"
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', maxHeight: '100vh', maxWidth: '100%', zIndex: 5, pointerEvents: 'auto' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -100) handleNext();
            else if (swipe > 100) handlePrev();
          }}
        />
      </AnimatePresence>
      
      {/* Bottom Input Area */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', display: 'flex', gap: '1rem', zIndex: 20 }}>
        <input 
          type="text" 
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={handleReplySubmit}
          placeholder={`Reply to ${story.isUser ? 'yourself' : story.name}...`} 
          style={{ flex: 1, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', padding: '0.75rem 1.25rem', borderRadius: '999px', color: 'white', outline: 'none', backdropFilter: 'blur(10px)' }} 
        />
        <button 
          onClick={handleLike} 
          className="btn-premium"
          style={{ background: 'transparent', border: 'none', color: liked[currentIndex] ? '#DC2626' : 'white', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <motion.div animate={liked[currentIndex] ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
             <Heart size={28} fill={liked[currentIndex] ? '#DC2626' : 'none'} />
          </motion.div>
        </button>
        <button 
           onClick={() => setShowShareMenu(true)} 
           className="btn-premium"
           style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
           <Send size={24} />
        </button>
      </div>

      {/* Share Menu Overlay */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '1.5rem', zIndex: 100, color: 'black' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Share to Portal Alumni</h3>
              <button className="btn-premium" onClick={() => setShowShareMenu(false)} style={{ background: '#F3F4F6', border: 'none', padding: '0.5rem', borderRadius: '50%', display: 'flex', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {[
                { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150', role: 'Software Engineer' },
                { name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150', role: 'Product Manager' },
                { name: 'Michael Chang', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150', role: 'Data Scientist' }
              ].map((person, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={person.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{person.name}</h5>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>{person.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleShareToPerson(person.name)}
                    className="btn-premium"
                    style={{ background: shareSuccess === person.name ? '#10B981' : '#DC2626', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: '0.2s all' }}
                  >
                    {shareSuccess === person.name ? 'Sent!' : 'Send'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PostCard = ({ post, onReferralRequest, requestedRef }: { post: any, onReferralRequest: any, requestedRef: boolean }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  // AI Assistant State
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleLike = async () => {
    try {
      await socialApi.likePost(post.id);
      if (!isLiked) {
        setIsLiked(true);
        setShowHeartAnim(true);
        setTimeout(() => setShowHeartAnim(false), 1000);
      } else {
        setIsLiked(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeAiAction = (action: string) => {
    setAiAction(action);
    setAiGenerating(true);
    // simulate AI thinking
    setTimeout(() => {
      setAiGenerating(false);
    }, 1500);
  };

  const getAiContent = () => {
    if (aiGenerating) return null;
    switch(aiAction) {
      case 'summarize': return "This post highlights job openings at Stripe for backend engineers, with a high referral success rate (85%). Quick action is recommended if interested in Go/Java roles.";
      case 'advice': return "When applying, tailor your resume specifically for backend payments infrastructure, emphasizing Go/Java experience. A warm referral here significantly boosts your chances.";
      case 'similar': return "Looking up similar opportunities... Found 3 other mid-level backend roles in the Alumni job board at Netflix and Uber.";
      default: return null;
    }
  };

  const staticReactionsCount = Object.values(post.reactions || {}).reduce((a: any, b: any) => a + Number(b), 0);
  const isNowLikedWhenItWasNot = isLiked && !post.isLiked;
  const isNowUnlikedWhenItWas = !isLiked && post.isLiked;
  const totalReactions = Number(staticReactionsCount) + (isNowLikedWhenItWasNot ? 1 : (isNowUnlikedWhenItWas ? -1 : 0));

  return (
    <motion.div variants={itemVariants} className="glass-card" style={{ position: 'relative' }}>
      
      {/* POST HEADER */}
      <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img src={post.author.avatar} alt={post.author.name} style={{ width: '52px', height: '52px', borderRadius: post.author.batch === 'Official' ? '12px' : '50%', border: '2px solid rgba(220, 38, 38, 0.1)', boxShadow: '0 2px 10px rgba(220, 38, 38, 0.1)' }} />
            <div>
              <h4 className="link-hover" style={{ margin: '0 0 0.1rem', fontSize: '1.05rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                {post.author.name}
                {post.type === 'opportunity' && <Sparkles size={14} color="#DC2626" fill="#DC2626" />}
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>{post.author.role}</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {post.time}</p>
            </div>
          </div>
          <button className="btn-premium" style={{ padding: '8px', borderRadius: '50%', background: 'transparent', border: 'none' }}><MoreHorizontal size={20} color="#6B7280" /></button>
        </div>
        
        {/* TEXT CONTENT */}
        <p style={{ margin: 0, color: '#374151', lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
          {formatContent(post.content)}
        </p>
      </div>

      {/* AI ASSISTANT PANEL */}
      <div style={{ padding: '0 1.5rem 1rem' }}>
        <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '1rem', border: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: aiAction ? '1rem' : 0 }}>
            <Zap size={16} color="#DC2626" fill="#DC2626" className="ai-pulse-icon" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Feed Assistant</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => executeAiAction('summarize')} className="btn-premium" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '999px', background: aiAction === 'summarize' ? '#DC2626' : 'white', color: aiAction === 'summarize' ? 'white' : '#4B5563', border: '1px solid', borderColor: aiAction === 'summarize' ? '#DC2626' : '#E5E7EB', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <FileText size={12} /> Summarize
              </button>
              <button onClick={() => executeAiAction('advice')} className="btn-premium" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '999px', background: aiAction === 'advice' ? '#DC2626' : 'white', color: aiAction === 'advice' ? 'white' : '#4B5563', border: '1px solid', borderColor: aiAction === 'advice' ? '#DC2626' : '#E5E7EB', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <Lightbulb size={12} /> Key Advice
              </button>
              <button onClick={() => executeAiAction('similar')} className="btn-premium" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '999px', background: aiAction === 'similar' ? '#DC2626' : 'white', color: aiAction === 'similar' ? 'white' : '#4B5563', border: '1px solid', borderColor: aiAction === 'similar' ? '#DC2626' : '#E5E7EB', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <Search size={12} /> Similar Roles
              </button>
            </div>
          </div>

          <AnimatePresence>
            {aiAction && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #FEE2E2', position: 'relative' }}>
                  <button onClick={() => setAiAction(null)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={14}/></button>
                  {aiGenerating ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', fontSize: '0.85rem', fontWeight: 500 }}>
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '8px', height: '8px', background: '#DC2626', borderRadius: '50%' }} />
                      Analyzing...
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: 1.5 }}>
                      <strong style={{ color: '#DC2626' }}>AI Insight: </strong>{getAiContent()}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* REFERRAL SYSTEM BOX (Opportunities) */}
      {post.type === 'opportunity' && post.referralData && (
        <div style={{ margin: '0 1.5rem 1rem', padding: '1.25rem', background: 'linear-gradient(145deg, rgba(254, 242, 242, 0.7) 0%, rgba(255, 255, 255, 0.9) 100%)', borderRadius: '16px', border: '1px solid rgba(252, 165, 165, 0.8)', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={18} color="#DC2626" />
                  <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#991B1B' }}>Referral Available</h5>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#D1FAE5', padding: '4px 10px', borderRadius: '999px' }}>
                Success Rate: {post.referralData.successRate}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: 500 }}>Who can refer you:</span>
              <div style={{ display: 'flex' }}>
                  {post.referralData.referrers.map((ref: any, idx: number) => (
                    <img key={idx} src={ref.avatar} alt={ref.name} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid white', marginLeft: idx > 0 ? '-10px' : '0', zIndex: 10 - idx }} title={ref.name} />
                  ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <AnimatePresence mode="wait">
                {requestedRef ? (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="btn-premium" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#10B981', color: 'white', padding: '0.75rem', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'default' }}
                  >
                    <CheckCircle2 size={18} /> Request Sent!
                  </motion.button>
                ) : (
                  <button 
                    onClick={() => onReferralRequest(post.id)}
                    className="btn-premium" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#DC2626', color: 'white', padding: '0.75rem', borderRadius: '12px', fontWeight: 600, border: 'none', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)' }}
                  >
                    Request Referral <ChevronRight size={18} />
                  </button>
                )}
              </AnimatePresence>
              <button className="btn-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'white', color: '#4B5563', padding: '0.75rem 1rem', borderRadius: '12px', fontWeight: 600, border: '1px solid #E5E7EB' }} title="Attach Resume & DM">
                <Paperclip size={18} /> <Send size={18} />
              </button>
            </div>
        </div>
      )}
      
      {/* MEDIA AREA with LIKE ANIMATION OVERLAY */}
      {post.media && (
        <div style={{ position: 'relative', marginTop: '0.5rem', overflow: 'hidden' }} onDoubleClick={handleLike}>
          {post.media.type === 'image' && (
            <img src={post.media.url} alt="Attachment" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', display: 'block' }} />
          )}

          {post.media.type === 'video' && (
            <div style={{ position: 'relative', backgroundColor: '#000', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={post.media.url} alt="Reel Thumbnail" style={{ width: '100%', maxHeight: '550px', objectFit: 'cover', opacity: 0.8 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(12px)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} className="btn-premium">
                    <PlayCircle size={36} color="white" fill="white" />
                  </div>
                  <span style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>{post.media.duration}</span>
              </div>
            </div>
          )}

          {/* INSTAGRAM STYLE HEART BURST */}
          <AnimatePresence>
            {showHeartAnim && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 10 }}
              >
                <Heart size={80} color="white" fill="white" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* INTERACTIONS AREA */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(229, 231, 235, 0.6)', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#4B5563', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', marginRight: '0.5rem' }}>
              <div className="reaction-icon" style={{ background: '#DC2626', zIndex: 4 }}>❤️</div>
              <div className="reaction-icon" style={{ background: '#3b82f6', marginLeft: '-6px', zIndex: 3 }}>👍</div>
              <div className="reaction-icon" style={{ background: '#10b981', marginLeft: '-6px', zIndex: 2 }}>🎉</div>
            </div>
            <span style={{ fontWeight: 600, color: '#111827' }}>{totalReactions.toLocaleString()}</span>
          </div>
          <span className="link-hover" onClick={() => setShowComments(!showComments)} style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>{post.comments} comments • 12 shares</span>
        </div>
        
        {/* ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <button 
            onClick={handleLike}
            className="btn-premium" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: isLiked ? '#DC2626' : '#4B5563', fontWeight: 600, padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem' }}
          >
            <motion.div animate={isLiked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
              <ThumbsUp size={18} fill={isLiked ? "#DC2626" : "none"} />
            </motion.div>
            Like
          </button>
          <button onClick={() => setShowComments(!showComments)} className="btn-premium" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#4B5563', fontWeight: 600, padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem' }}>
            <MessageSquare size={18} /> Comment
          </button>
          <button className="btn-premium" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#4B5563', fontWeight: 600, padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem' }}>
            <Share2 size={18} /> Share
          </button>
        </div>

        {/* COMMENTS EXPAND SECTION */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #F3F4F6' }}>
                {/* Mock Comment */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '12px', flex: 1 }}>
                    <h5 style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#111827' }}>Michael Chang</h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#4B5563' }}>Great insights! I'll definitely reach out via DM.</p>
                  </div>
                </div>
                {/* Add Comment Input */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <img src={currentUser.avatar} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <input type="text" placeholder="Write a comment..." style={{ flex: 1, background: '#F3F4F6', border: 'none', padding: '0.75rem 1rem', borderRadius: '999px', outline: 'none', fontSize: '0.85rem' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
};

const ActivityFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [requestedReferrals, setRequestedReferrals] = useState<Record<number, boolean>>({});
  const [viewingStory, setViewingStory] = useState<any>(null);
  const [showUploadToast, setShowUploadToast] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPostSuccessToast, setShowPostSuccessToast] = useState(false);

  const loadFeed = async (pageNum: number) => {
    try {
      const res = await socialApi.getFeed(pageNum, 10);
      if (res.success && res.data) {
        const fetchedPosts = (res.data as any).posts;
        const total = (res.data as any).total;
        
        const formatted = fetchedPosts.map((p: any) => ({
          id: p.id,
          type: 'general',
          author: {
            name: p.author_name || 'Alumni Member',
            role: p.author_type || 'User',
            batch: '',
            avatar: p.author_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.author_name || 'User')}&background=DC2626&color=fff`
          },
          time: new Date(p.created_at).toLocaleString(),
          content: p.content,
          media: p.image_url ? { type: 'image', url: p.image_url } : null,
          reactions: { like: p.likes_count, support: 0, celebrate: 0, applaud: 0 },
          comments: p.comments_count || p.comments?.length || 0,
          isLiked: p.is_liked
        }));
        
        if (pageNum === 1) {
          setPosts(formatted);
        } else {
          setPosts(prev => [...prev, ...formatted]);
        }
        
        if (pageNum * 10 >= total) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadFeed(1);
  }, []);

  const handleRequestReferral = (id: number) => {
    setRequestedReferrals(prev => ({ ...prev, [id]: true }));
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadFeed(nextPage);
  };

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setShowUploadToast(true);
      setTimeout(() => setShowUploadToast(false), 3000);
      e.target.value = '';
    }
  };

  return (
    <div className="font-sans feed-container" style={{ position: 'relative', minHeight: '100vh', padding: '2rem 1rem 6rem', fontFamily: '"Inter", -apple-system, sans-serif' }}>
      
      {/* STORY UPLOAD HIDDEN INPUT */}
      <input type="file" id="story-upload" style={{ display: 'none' }} accept="image/*,video/*" onChange={handleStoryUpload} />

      {/* CUSTOM SUCCESS TOAST */}
      <AnimatePresence>
        {showUploadToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            style={{ position: 'fixed', top: '2rem', left: '50%', zIndex: 100000, background: 'rgba(255, 255, 255, 0.95)', padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(220, 38, 38, 0.1)', boxShadow: '0 10px 40px rgba(220, 38, 38, 0.15)', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ background: '#FEE2E2', borderRadius: '50%', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} color="#DC2626" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>Story Publishing...</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>Your story is currently being processed.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORY VIEWER MODAL */}
      <AnimatePresence>
        {viewingStory && (
          <StoryViewerModal 
            stories={stories} 
            initialStoryId={viewingStory.id} 
            onClose={() => setViewingStory(null)} 
            updateStoryInParent={(updatedStory: any) => setViewingStory(updatedStory)}
          />
        )}
      </AnimatePresence>

      {/* CREATE POST MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal 
            onClose={() => setShowCreateModal(false)}
            onPublish={async (content) => {
              setShowCreateModal(false);
              const res = await socialApi.createPost({ content });
              if (res.success) {
                setShowPostSuccessToast(true);
                setTimeout(() => setShowPostSuccessToast(false), 3000);
                setPage(1);
                loadFeed(1);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* POST SUCCESS TOAST */}
      <AnimatePresence>
        {showPostSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            style={{ position: 'fixed', top: '2rem', left: '50%', zIndex: 100000, background: 'rgba(255, 255, 255, 0.95)', padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.15)', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ background: '#D1FAE5', borderRadius: '50%', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} color="#10B981" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>Post Published!</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>Your new post is live on the feed.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACKGROUND DECORATIONS FOR LUXURY RED/WHITE THEME */}
      <div style={{ position: 'fixed', top: '5%', left: '10%', width: '400px', height: '400px', background: 'rgba(239, 68, 68, 0.05)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: '500px', height: '500px', background: 'rgba(220, 38, 38, 0.04)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '40%', left: '40%', width: '300px', height: '300px', background: 'rgba(255, 255, 255, 0.5)', filter: 'blur(90px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

      {/* GLOBAL CSS OVERRIDES */}
      <style>{`
        .font-sans, .font-sans h1, .font-sans h2, .font-sans h3, .font-sans h4, .font-sans h5, .font-sans h6, .font-sans p, .font-sans span, .font-sans button, .font-sans input {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif !important;
          letter-spacing: -0.015em;
        }

        .feed-container {
          background-color: #FFFFFF;
        }

        /* Premium Glassmorphism Cards */
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(229, 231, 235, 0.6);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03), inset 0 0 0 1px rgba(255,255,255,0.7);
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .glass-card:hover {
          box-shadow: 0 15px 50px rgba(220, 38, 38, 0.04), inset 0 0 0 1px rgba(255,255,255,0.9);
          transform: translateY(-2px);
        }

        /* Luxury Story Rings */
        .story-wrapper {
          position: relative;
          padding: 3px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .story-wrapper.unseen {
          background: linear-gradient(45deg, #F87171 0%, #DC2626 50%, #991B1B 100%);
        }
        .story-wrapper.seen {
          background: #E5E7EB;
        }
        .story-inner {
          background: white;
          padding: 2px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .story-img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          display: block; /* accurately fits in circle without gaps */
        }

        /* High-End Button Hovers */
        .btn-premium {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .btn-premium:hover {
          transform: translateY(-1px);
        }
        .btn-premium:active {
          transform: translateY(1px);
        }

        .link-hover:hover {
          color: #DC2626 !important;
        }

        .reaction-icon {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Floating Action Button */
        .fab {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 50;
        }
        .fab:hover {
          transform: scale(1.05) translateY(-4px);
          box-shadow: 0 15px 35px rgba(220, 38, 38, 0.4);
        }
        
        /* Custom Scrollbar for Stories */
        .stories-scroll::-webkit-scrollbar {
          display: none;
        }
        .stories-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Premium Sweep Light Animation for Create Post Title */
        .create-post-title {
          background: linear-gradient(
            90deg, 
            #111827 0%, 
            #111827 35%, 
            #DC2626 48%, 
            #F59E0B 52%, 
            #111827 65%, 
            #111827 100%
          );
          background-size: 250% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: sweepLight 3.5s ease-in-out infinite;
        }

        @keyframes sweepLight {
          0%, 100% { background-position: 100% center; }
          50% { background-position: 0% center; }
        }

        /* AI Assistant Pulse */
        @keyframes aiPulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        .ai-pulse-icon {
          animation: aiPulse 2s infinite;
        }

        @media (max-width: 1024px) {
          .feed-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .feed-sidebar-desktop {
            display: none !important;
          }
        }

        /* Textarea placeholder in dark mode */
        .feed-container textarea::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .feed-container textarea:focus {
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
        }
      `}</style>


      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2.5rem', position: 'relative', zIndex: 10, padding: '0 1rem' }} className="feed-layout-grid">
        
        {/* LEFT COLUMN: MAIN FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem' }}
        >
          <Link to="/" className="btn-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', borderRadius: '50%', background: 'white', border: '1px solid #E5E7EB', textDecoration: 'none', color: '#111827', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Community Feed</h1>
            <p style={{ margin: '0.15rem 0 0', color: '#6B7280', fontSize: '0.9rem', fontWeight: 500 }}>Premium insights & stories</p>
          </div>
        </motion.div>

        {/* STORIES SECTION (Instagram Style) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="stories-scroll"
          style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0.5rem 0 1rem' }}
        >
          {stories.map(story => (
            <div key={story.id} onClick={() => setViewingStory(story)} className="btn-premium" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <div className={`story-wrapper ${story.hasUnseen || story.isUser ? 'unseen' : 'seen'}`}>
                <div className="story-inner">
                  <motion.img layoutId={`story-img-${story.id}`} src={story.avatar} alt={story.name} className="story-img" />
                </div>
                {story.isUser && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); document.getElementById('story-upload')?.click(); }}
                    style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#DC2626', color: 'white', borderRadius: '50%', width: '26px', height: '26px', minWidth: '26px', minHeight: '26px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', padding: 0, cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                {story.isUser ? 'Your Story' : story.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </motion.div>

        {/* FEED AREA */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          animate="visible"
        >
          {/* WHAT SHOULD I DO NEXT FEATURE */}
          <CareerGuidance />

          {/* CREATE POST INPUT */}
          <motion.div variants={itemVariants} className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={currentUser.avatar} alt="You" style={{ width: '44px', height: '44px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-premium"
              style={{ flex: 1, textAlign: 'left', background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '0.85rem 1.25rem', borderRadius: '999px', color: '#6B7280', fontWeight: 500, fontSize: '0.95rem' }}
            >
              Share what's on your mind...
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn-premium" style={{ background: '#FEF2F2', color: '#DC2626', padding: '0.75rem', borderRadius: '50%', border: 'none' }}>
              <ImageIcon size={20} />
            </button>
          </motion.div>

          {/* POSTS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.length > 0 ? posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onReferralRequest={handleRequestReferral} 
                requestedRef={!!requestedReferrals[post.id]} 
              />
            )) : (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#F9FAFB', borderRadius: '16px', border: '1px dashed #E5E7EB' }}>
                <p style={{ margin: 0, color: '#6B7280', fontSize: '0.95rem' }}>No posts available yet. Be the first to share something!</p>
              </div>
            )}
          </div>

          {/* INFINITE SCROLL / LOAD MORE MOCK */}
          {posts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              {loadingMore ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} style={{ display: 'inline-block' }}>
                  <div style={{ width: '30px', height: '30px', border: '3px solid #E5E7EB', borderTopColor: '#DC2626', borderRadius: '50%' }} />
                </motion.div>
              ) : hasMore ? (
                <button 
                  onClick={handleLoadMore}
                  className="btn-premium" 
                  style={{ background: 'white', color: '#111827', border: '1px solid #E5E7EB', padding: '0.8rem 2rem', borderRadius: '999px', fontWeight: 600, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}
                >
                  Load More Updates
                </button>
              ) : (
                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>You're all caught up!</p>
              )}
            </div>
          )}
        </motion.section>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem', alignSelf: 'start' }} className="feed-sidebar-desktop">
          
          {/* PREMIUM TRENDING CARD */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card" 
            style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #DC2626, #F59E0B)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TrendingUp size={20} color="#DC2626" /> Trending Now
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { topic: 'ArchitectureSummit', posts: '1.4k', growth: '+12%' },
                { topic: 'AIReform', posts: '850', growth: '+5%' },
                { topic: 'NeSTCareers', posts: '620', growth: '+24%' },
                { topic: 'GoLangPerformance', posts: '430', growth: '+8%' },
              ].map((item, i) => (
                <div key={i} className="btn-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#374151' }}>#{item.topic}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF' }}>{item.posts} interactions</p>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{item.growth}</span>
                </div>
              ))}
            </div>
            <button className="btn-premium" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem', borderRadius: '12px', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#111827', fontWeight: 700, fontSize: '0.85rem' }}>
              Discover More Topics
            </button>
          </motion.div>

          {/* QUICK ACTIONS / TOOLS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card" 
            style={{ padding: '1.75rem' }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 1.25rem' }}>Quick Actions</h3>
            <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '1rem' }}>
              <div className="btn-premium" style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center', border: '1px solid #FEE2E2' }}>
                <Briefcase size={20} color="#DC2626" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991B1B' }}>Refer Alumni</span>
              </div>
              <div className="btn-premium" style={{ background: '#F0F9FF', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center', border: '1px solid #E0F2FE' }}>
                <Users size={20} color="#0284C7" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1' }}>New Groups</span>
              </div>
              <div className="btn-premium" style={{ background: '#F5F3FF', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center', border: '1px solid #EDE9FE' }}>
                <Calendar size={20} color="#7C3AED" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5B21B6' }}>Upc. Events</span>
              </div>
              <div className="btn-premium" style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center', border: '1px solid #FEF3C7' }}>
                <Award size={20} color="#D97706" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>Badge Rewards</span>
              </div>
            </div>
          </motion.div>

          {/* COMMUNITY INSIGHTS MOCKUP */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          >
            <Sparkles size={40} style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, transform: 'rotate(20deg)' }} />
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Carrer Assessment</h4>
            <p style={{ margin: '0.5rem 0 1.25rem', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4 }}>Find out how you stack up against other alumni.</p>
            <button className="btn-premium" style={{ background: 'white', color: '#111827', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>
              Take Quiz
            </button>
          </motion.div>

        </aside>

      </div>

      {/* FLOATING ACTION BUTTON */}
      <div className="fab" title="Create New Post" onClick={() => setShowCreateModal(true)}>
        <Plus size={28} />
      </div>

    </div>
  );
};

export default ActivityFeed;
