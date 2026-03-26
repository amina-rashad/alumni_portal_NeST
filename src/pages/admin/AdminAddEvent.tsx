import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Clock, MapPin, 
  Upload, X, Image as ImageIcon,
  Info, ChevronDown,
  ShieldCheck, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// CUSTOM REUSABLE GLASS SELECT COMPONENT - UPDATED FOR NAVY
const GlassSelect: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  name: string;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nestNavy = '#1a2652';

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
          border: '1px solid rgba(26, 38, 82, 0.1)', 
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
          boxShadow: '0 4px 12px rgba(26, 38, 82, 0.03)',
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
          border: '1px solid rgba(26, 38, 82, 0.1)', 
          boxShadow: '0 10px 30px rgba(26, 38, 82, 0.1)',
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
                color: value === opt ? nestNavy : '#475569',
                background: value === opt ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
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

const AdminAddEvent: React.FC = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const nestNavy = '#1a2652';

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Networking & Mixer',
    limit: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    audience: 'Platform Wide'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setCategory = (val: string) => setFormData(prev => ({ ...prev, category: val }));
  const setAudience = (val: string) => setFormData(prev => ({ ...prev, audience: val }));

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  // NAVY GLOSSY STYLE
  const glossyInputStyle = {
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid rgba(26, 38, 82, 0.1)',
    background: 'rgba(26, 38, 82, 0.05)', 
    backdropFilter: 'blur(16px)',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
    color: '#1e3a8a', 
    fontWeight: 700,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    colorScheme: 'light' as const,
    boxShadow: '0 4px 12px rgba(26, 38, 82, 0.02)'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* Premium Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', background: '#fff', padding: '24px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(26, 38, 82, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/admin/events')}
            style={{ padding: '10px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Calendar size={14} color={nestNavy} /> Event Governance <span>{'>'}</span> Hosting
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Create Strategic Event</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '12px 24px', borderRadius: '14px', background: '#f1f5f9', color: '#475569', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Save Draft
          </button>
          <button 
            onClick={() => console.log('Publishing:', formData)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 28px', 
              borderRadius: '14px', 
              background: nestNavy, 
              border: 'none',
              color: '#fff', 
              fontWeight: 800, 
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(26, 38, 82, 0.2)'
            }}>
            Publish to Portal
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Section 1: Core Details */}
          <section style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.08)', color: nestNavy }}><Info size={18} /></div> Primary Event Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. NeST Global Alumni Leadership Summit 2026" 
                  style={glossyInputStyle} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <GlassSelect 
                  label="Event Category"
                  name="category"
                  value={formData.category}
                  options={['Networking & Mixer', 'Professional Workshop', 'Executive Seminar', 'Annual Social']}
                  onChange={setCategory}
                />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Limit</label>
                  <input 
                    type="number" 
                    name="limit"
                    value={formData.limit}
                    onChange={handleInputChange}
                    placeholder="Unlimited" 
                    style={glossyInputStyle} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detailed Agenda & Description</label>
                <textarea 
                  rows={8} 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a comprehensive breakdown of the event objectives, speaker details, and value proposition for attendees..." 
                  style={{ ...glossyInputStyle, resize: 'none', height: 'auto', fontFamily: 'inherit' }} 
                />
              </div>
            </div>
          </section>

          {/* Section 2: Image Upload */}
          <section style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.08)', color: nestNavy }}><ImageIcon size={18} /></div> Media & Branding
            </h3>

            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{ 
                border: `2px dashed ${dragActive ? nestNavy : '#cbd5e1'}`, 
                borderRadius: '24px', 
                padding: '48px', 
                textAlign: 'center',
                background: dragActive ? 'rgba(26, 38, 82, 0.05)' : 'rgba(248, 250, 252, 0.8)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {selectedImage ? (
                <div style={{ position: 'relative' }}>
                  <img src={selectedImage} alt="Preview" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '16px' }} />
                  <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.1)' }}>
                    <Upload size={28} color={nestNavy} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Click or drag thumbnail to upload</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Support JPG, PNG or WebP. Max size: 5MB</p>
                  </div>
                  <input type="file" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={(e) => e.target.files && setSelectedImage(URL.createObjectURL(e.target.files[0]))} />
                </div>
              )}
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Scheduling Card */}
          <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} color={nestNavy} /> Scheduling & Logistics
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Event Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  style={glossyInputStyle} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Start Time</label>
                <input 
                  type="time" 
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  style={glossyInputStyle} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Venue / Online Link</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color={nestNavy} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input 
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="Grand Ballroom or Zoom Link" 
                    style={{ ...glossyInputStyle, paddingLeft: '40px' }} 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Audience & Settings */}
          <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={16} color="#10b981" /> Settings & Governance
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <GlassSelect 
                label="Target Audience"
                name="audience"
                value={formData.audience}
                options={['Platform Wide', 'Exclusively Alumni', 'Intern Special']}
                onChange={setAudience}
              />
            </div>
          </section>

          {/* Governance Reminder */}
          <div style={{ background: 'rgba(26, 38, 82, 0.05)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(26, 38, 82, 0.1)', display: 'flex', gap: '12px' }}>
             <AlertCircle color={nestNavy} size={20} />
             <div>
               <div style={{ fontSize: '13px', fontWeight: 800, color: nestNavy, marginBottom: '4px' }}>Governance Compliance</div>
               <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>Automated invitations will be dispatched upon publication.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddEvent;
