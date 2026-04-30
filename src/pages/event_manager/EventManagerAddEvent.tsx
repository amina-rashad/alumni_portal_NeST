import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Clock, MapPin, 
  Upload, X, Image as ImageIcon,
  Info, ChevronDown,
  ShieldCheck, AlertCircle, Video
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { eventManagerApi } from '../../services/api';
import StatusModal from '../../components/StatusModal';

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

      {isOpen && (
        <div style={{ 
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
        }}>
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
        </div>
      )}
    </div>
  );
};

const EventManagerAddEvent: React.FC = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const brandPrimary = '#233167';

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

  const [formData, setFormData] = useState({
    title: '',
    category: 'Networking & Mixer',
    limit: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    audience: 'Platform Wide',
    mode: 'Offline'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setCategory = (val: string) => setFormData(prev => ({ ...prev, category: val }));
  const setAudience = (val: string) => setFormData(prev => ({ ...prev, audience: val }));
  const setMode = (val: string) => setFormData(prev => ({ ...prev, mode: val }));

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

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!formData.title || !formData.date) {
      setStatusModal({
        show: true,
        type: 'error',
        title: 'Missing Fields',
        message: 'Please provide at least a title and a date for the event.'
      });
      return;
    }

    setStatusModal({
      show: true,
      type: 'info',
      title: 'Launching Event',
      message: 'Broadcasting your event to the community...'
    });

    try {
      const payload = {
        ...formData,
        cover_image: selectedImage,
        is_active: !isDraft,
        max_attendees: parseInt(formData.limit) || 0
      };

      const res = await eventManagerApi.createEvent(payload);
      if (res.success) {
        setStatusModal({
          show: true,
          type: 'success',
          title: 'Event Published!',
          message: isDraft ? 'Event saved as draft successfully.' : 'Your event is now live and notifications have been sent.'
        });
        setTimeout(() => navigate('/event-manager/events'), 2000);
      } else {
        throw new Error(res.message || 'Failed to create event');
      }
    } catch (err: any) {
      setStatusModal({
        show: true,
        type: 'error',
        title: 'Launch Failed',
        message: err.message || 'Something went wrong. Please try again.'
      });
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', background: '#fff', padding: '24px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(35, 49, 103, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/event-manager/events')}
            style={{ padding: '10px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Calendar size={14} color={brandPrimary} /> Event Management <span>{'>'}</span> New Event
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Create Event</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => handleSubmit(true)}
            style={{ padding: '12px 24px', borderRadius: '14px', background: '#f1f5f9', color: '#475569', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Save Draft
          </button>
          <button 
            onClick={() => handleSubmit(false)}
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
              boxShadow: '0 8px 32px rgba(35, 49, 103, 0.2)'
            }}>
            Launch Event
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary }}><Info size={18} /></div> Event Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Event Name</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Annual Alumni Gala 2026" style={glossyInputStyle as any} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <GlassSelect label="Category" name="category" value={formData.category} options={['Networking & Mixer', 'Workshop', 'Seminar', 'Conference']} onChange={setCategory} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Max Capacity</label>
                   <input type="number" name="limit" value={formData.limit} onChange={handleInputChange} placeholder="e.g. 500" style={glossyInputStyle as any} />
                </div>
              </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Description</label>
                  <textarea rows={6} name="description" value={formData.description} onChange={handleInputChange} placeholder="What is this event about?" style={{ ...glossyInputStyle, resize: 'none', height: 'auto', fontFamily: 'inherit' } as any} />
                </div>
            </div>
          </section>

          <section style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ImageIcon size={18} color={brandPrimary} /> Cover Media
            </h3>
            <div 
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{ border: `2px dashed ${dragActive ? brandPrimary : '#cbd5e1'}`, borderRadius: '24px', padding: '48px', textAlign: 'center', background: dragActive ? 'rgba(35, 49, 103, 0.05)' : '#f8fafc', position: 'relative' }}
            >
              {selectedImage ? (
                <div style={{ position: 'relative' }}>
                  <img src={selectedImage} alt="Preview" style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '16px' }} />
                  <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}><X size={16} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <Upload size={32} color={brandPrimary} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>Upload an image or drag and drop</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>PNG, JPG up to 10MB</div>
                  </div>
                  <input type="file" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={handleImageSelect} />
                </div>
              )}
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} color={brandPrimary} /> Date & Venue
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>Event Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={glossyInputStyle as any} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} style={glossyInputStyle as any} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>{formData.mode === 'Online' ? 'Meeting Link' : 'Location'}</label>
                <div style={{ position: 'relative' }}>
                  {formData.mode === 'Online' ? (
                    <Video size={16} color={brandPrimary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  ) : (
                    <MapPin size={16} color={brandPrimary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  )}
                  <input name="venue" value={formData.venue} onChange={handleInputChange} placeholder={formData.mode === 'Online' ? 'Zoom, Meet, or Teams Link' : 'Venue name or Physical Address'} style={{ ...glossyInputStyle, paddingLeft: '40px' } as any} />
                </div>
              </div>
            </div>
          </section>

          <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={16} color="#10b981" /> Settings
            </h3>
            <GlassSelect label="Event Mode" name="mode" value={formData.mode} options={['Online', 'Offline']} onChange={setMode} />
          </section>

          <div style={{ background: 'rgba(35, 49, 103, 0.05)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(35, 49, 103, 0.1)', display: 'flex', gap: '12px' }}>
             <AlertCircle color={brandPrimary} size={20} />
             <div>
               <div style={{ fontSize: '13px', fontWeight: 800, color: brandPrimary, marginBottom: '4px' }}>Draft Mode</div>
               <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Your event will be saved as a draft first.</p>
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

export default EventManagerAddEvent;
