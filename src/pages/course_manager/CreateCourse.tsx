import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, BookOpen, Clock,
  Upload, X, Image as ImageIcon,
  Info, ChevronDown, Plus, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { courseManagerAPI } from '../../services/api';
import StatusModal from '../../components/StatusModal';
import { motion, AnimatePresence } from 'framer-motion';

// --- Components ---

const GlassSelect: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  name: string;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const brandPrimary = '#233167';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }} ref={dropdownRef}>
      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          padding: '14px 20px', 
          borderRadius: '16px', 
          border: '1px solid rgba(35, 49, 103, 0.1)', 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(16px)', 
          fontSize: '15px', 
          width: '100%', 
          color: '#1e293b', 
          fontWeight: 700, 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(35, 49, 103, 0.03)',
          transition: 'all 0.2s ease'
        }}
      >
        {value}
        <ChevronDown size={14} color="#94a3b8" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ 
              position: 'absolute', 
              top: '105%', 
              left: 0, 
              right: 0, 
              zIndex: 100, 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(24px)', 
              borderRadius: '18px', 
              border: '1px solid rgba(35, 49, 103, 0.1)', 
              boxShadow: '0 10px 30px rgba(35, 49, 103, 0.1)',
              overflow: 'hidden',
              padding: '8px'
            }}
          >
            {options.map((opt) => (
              <div 
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                style={{ 
                  padding: '12px 16px', 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  color: value === opt ? brandPrimary : '#475569',
                  background: value === opt ? 'rgba(35, 49, 103, 0.05)' : 'transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Interfaces ---

const CM_CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const brandPrimary = '#233167';
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner Friendly',
    duration: '',
    links: [''] // Dynamic links array
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.links];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const addLinkField = () => setFormData(prev => ({ ...prev, links: [...prev.links, ''] }));
  
  const removeLinkField = (index: number) => {
    if (formData.links.length === 1) return;
    const newLinks = formData.links.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const setLevel = (val: string) => setFormData(prev => ({ ...prev, level: val }));

  // Image Handlers
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.duration) {
      setStatusModal({
        show: true,
        type: 'error',
        title: 'Missing Fields',
        message: 'Please provide at least a title and duration for the course.'
      });
      return;
    }

    setLoading(true);
    setStatusModal({
      show: true,
      type: 'info',
      title: 'Adding Course',
      message: 'Uploading your new course to the platform...'
    });

    try {
      const payload = { 
        ...formData, 
        cover_image: selectedImage 
      };
      
      const res = await courseManagerAPI.createCourse(payload);
      
      if (res.success) {
        setStatusModal({
          show: true,
          type: 'success',
          title: 'Course Published!',
          message: 'Your course has been successfully created and is now available.'
        });
        setTimeout(() => navigate('/course-manager/courses'), 2000);
      } else {
        throw new Error(res.message || 'Failed to create course');
      }
    } catch (error: any) {
      console.error('Failed to create course:', error);
      setStatusModal({
        show: true,
        type: 'error',
        title: 'Deployment Failed',
        message: error.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const glossyInputStyle = {
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid rgba(35, 49, 103, 0.1)',
    background: 'rgba(35, 49, 103, 0.05)', 
    backdropFilter: 'blur(16px)',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
    color: '#1e1b4b', 
    fontWeight: 700,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(35, 49, 103, 0.02)'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px', fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '40px', 
        background: '#fff', 
        padding: '24px 32px', 
        borderRadius: '24px', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 4px 20px rgba(35, 49, 103, 0.04)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/course-manager/courses')}
            style={{ padding: '10px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <BookOpen size={14} color={brandPrimary} /> Academic Governance <span>{'>'}</span> New Course
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Add Course</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ padding: '12px 24px', borderRadius: '14px', background: '#f1f5f9', color: '#475569', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 28px', 
              borderRadius: '14px', 
              background: brandPrimary, 
              border: 'none',
              color: '#fff', 
              fontWeight: 800, 
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(35, 49, 103, 0.2)',
              opacity: loading ? 0.7 : 1
            }}>
            {loading ? 'Adding...' : 'Add Course'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Section 1: Basic Info */}
          <section style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary }}><Info size={18} /></div> Course Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Course Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Advanced System Architecture & Design" 
                  style={glossyInputStyle as any} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Description / Details</label>
                <textarea 
                  rows={6} 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="What will students master in this course?" 
                  style={{ ...glossyInputStyle, resize: 'none', height: 'auto', fontFamily: 'inherit' } as any} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <GlassSelect 
                  label="Difficulty Level" 
                  name="level" 
                  value={formData.level} 
                  options={['Beginner Friendly', 'Intermediate Professional', 'Advanced Strategic']} 
                  onChange={setLevel} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Duration</label>
                   <div style={{ position: 'relative' }}>
                     <Clock size={16} color={brandPrimary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                     <input 
                       type="text" 
                       name="duration" 
                       value={formData.duration} 
                       onChange={handleInputChange} 
                       placeholder="e.g. 12 Weeks" 
                       style={{ ...glossyInputStyle, paddingLeft: '40px' } as any} 
                     />
                   </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Section 2: Course Links */}
          <section style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary }}><BookOpen size={18} /></div> Course Links & Resources
              </div>
              <button 
                onClick={addLinkField}
                style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(35, 49, 103, 0.05)', color: brandPrimary, border: 'none', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Add Link
              </button>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formData.links.map((link, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input 
                      type="text" 
                      value={link} 
                      onChange={(e) => handleLinkChange(idx, e.target.value)} 
                      placeholder="e.g. https://youtube.com/lecture-v1" 
                      style={glossyInputStyle as any} 
                    />
                  </div>
                  {formData.links.length > 1 && (
                    <button 
                      onClick={() => removeLinkField(idx)}
                      style={{ padding: '12px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Info size={16} color="#64748b" />
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Attach external resources, video lectures, or reference documents for students.</p>
              </div>
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Sidebar Section 1: Cover Media */}
          <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ImageIcon size={18} color={brandPrimary} /> Cover Media
            </h3>
            <div 
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{ border: `2px dashed ${dragActive ? brandPrimary : '#cbd5e1'}`, borderRadius: '24px', padding: '32px', textAlign: 'center', background: dragActive ? 'rgba(35, 49, 103, 0.05)' : '#f8fafc', position: 'relative', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {selectedImage ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <img src={selectedImage} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '16px' }} />
                  <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Upload size={28} color={brandPrimary} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>Upload Banner</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>PNG, JPG up to 10MB</div>
                  </div>
                  <input type="file" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={handleImageSelect} />
                </div>
              )}
            </div>
          </section>

        </div>
      </div>

      <StatusModal
        isOpen={statusModal.show}
        onClose={() => setStatusModal(prev => ({ ...prev, show: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </div>
  );
};

export default CM_CreateCourse;
