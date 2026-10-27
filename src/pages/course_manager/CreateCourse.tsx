import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, BookOpen, Clock,
  Upload, X, Image as ImageIcon,
  Info, ChevronDown, Plus, Check
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

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

  useEffect(() => {
    if (id) {
      const fetchCourseData = async () => {
        try {
          setLoading(true);
          const res = await courseManagerAPI.getCourse(id);
          if (res.success && res.data?.course) {
            const c = res.data.course;
            setFormData({
              title: c.title || '',
              description: c.description || '',
              level: c.level || 'Beginner Friendly',
              duration: c.duration || '',
              links: Array.isArray(c.links) && c.links.length > 0 ? c.links : ['']
            });
            if (c.cover_image) {
              setSelectedImage(c.cover_image);
            }
          }
        } catch (err) {
          console.error('Failed to load course details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourseData();
    }
  }, [id]);

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
      title: isEditing ? 'Updating Course' : 'Adding Course',
      message: isEditing ? 'Saving updates to platform...' : 'Uploading your new course to the platform...'
    });

    try {
      const payload = { 
        ...formData, 
        cover_image: selectedImage,
        is_active: true,
        is_published: true,
        status: 'Active'
      };
      
      const res = isEditing
        ? await courseManagerAPI.updateCourse(id!, payload)
        : await courseManagerAPI.createCourse(payload);
      
      if (res.success) {
        setStatusModal({
          show: true,
          type: 'success',
          title: isEditing ? 'Course Updated!' : 'Course Published!',
          message: isEditing ? 'Your changes have been saved.' : 'Your course has been successfully created and is now available.'
        });
        setTimeout(() => navigate('/course-manager/courses'), 1500);
      } else {
        throw new Error(res.message || `Failed to ${isEditing ? 'update' : 'create'} course`);
      }
    } catch (error: any) {
      console.error('Failed to save course:', error);
      setStatusModal({
        show: true,
        type: 'error',
        title: isEditing ? 'Update Failed' : 'Deployment Failed',
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px', fontFamily: "'Inter', sans-serif" }}>
      {/* Unified Single White Background Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
        padding: '36px 40px'
      }}>
        {/* Header Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingBottom: '24px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/course-manager/courses')}
              style={{ padding: '10px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <BookOpen size={14} color={brandPrimary} /> Academic Governance <span>{'>'}</span> {isEditing ? 'Edit Course' : 'New Course'}
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{isEditing ? 'Edit Course' : 'Add Course'}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
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
                boxShadow: '0 8px 24px rgba(35, 49, 103, 0.2)',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Course')}
            </button>
          </div>
        </div>

        {/* All Fields in Single White Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px', marginTop: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Course Information */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#f1f5f9' }} />

            {/* Course Links & Resources */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            </div>
          </div>

          {/* Right Column: Cover Media */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary }}><ImageIcon size={18} /></div> Cover Media
            </h3>
            <div 
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{ border: `2px dashed ${dragActive ? brandPrimary : '#cbd5e1'}`, borderRadius: '24px', padding: '32px', textAlign: 'center', background: dragActive ? 'rgba(35, 49, 103, 0.05)' : '#f8fafc', position: 'relative', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {selectedImage ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <img src={selectedImage} alt="Preview" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '16px' }} />
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
          </div>
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
