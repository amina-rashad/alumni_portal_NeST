import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, 
  Calendar, MapPin, Users, Edit2, Trash2, ExternalLink,
  ArrowLeft, Clock, Upload, X, Image as ImageIcon,
  Info, ChevronDown, ShieldCheck, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlassSelect: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  name: string;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const brandPrimary = '#4f46e5';

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
          border: '1px solid rgba(79, 70, 229, 0.1)', 
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
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.03)',
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
          border: '1px solid rgba(79, 70, 229, 0.1)', 
          boxShadow: '0 10px 30px rgba(79, 70, 229, 0.1)',
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
                background: value === opt ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
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

const EventManagerEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const brandPrimary = '#4f46e5';

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

  const events = [
    { id: 1, title: 'Global Tech Summit 2026', category: 'Technology', date: '2026-10-24', location: 'Virtual', registrations: 450, capacity: 500, status: 'Active', image: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=800&auto=format&fit=crop&q=60' },
    { id: 2, title: 'Alumni Networking Night', category: 'Networking', date: '2026-11-12', location: 'Grand Plaza Hotel', registrations: 120, capacity: 200, status: 'Draft', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60' },
    { id: 3, title: 'Leadership & Strategy Workshop', category: 'Professional Development', date: '2026-12-05', location: 'NeST Innovation Hub', registrations: 85, capacity: 100, status: 'Active', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60' },
    { id: 4, title: 'Annual Charity Gala', category: 'Social', date: '2026-12-20', location: 'Seafront Pavilion', registrations: 310, capacity: 400, status: 'Active', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60' },
  ];

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

  const filteredEvents = activeTab === 'All' ? events : events.filter(e => e.status === activeTab);

  const glossyInputStyle = {
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid rgba(79, 70, 229, 0.1)',
    background: 'rgba(79, 70, 229, 0.05)', 
    backdropFilter: 'blur(16px)',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
    color: '#1e1b4b', 
    fontWeight: 700,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.02)'
  };

  if (isAddingEvent) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', background: '#fff', padding: '24px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => setIsAddingEvent(false)}
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
            <button onClick={() => setIsAddingEvent(false)} style={{ padding: '12px 24px', borderRadius: '14px', background: '#f1f5f9', color: '#475569', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
            <button 
              onClick={() => setIsAddingEvent(false)}
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
                boxShadow: '0 8px 32px rgba(79, 70, 229, 0.2)'
              }}>
              Launch Event
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.08)', color: brandPrimary }}><Info size={18} /></div> Event Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Event Name</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Annual Alumni Gala 2026" style={glossyInputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <GlassSelect label="Category" name="category" value={formData.category} options={['Networking & Mixer', 'Workshop', 'Seminar', 'Conference']} onChange={setCategory} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Max Capacity</label>
                    <input type="number" name="limit" value={formData.limit} onChange={handleInputChange} placeholder="e.g. 500" style={glossyInputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Description</label>
                  <textarea rows={6} name="description" value={formData.description} onChange={handleInputChange} placeholder="What is this event about?" style={{ ...glossyInputStyle, height: 'auto', fontFamily: 'inherit', resize: 'none' }} />
                </div>
              </div>
            </section>

            <section style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ImageIcon size={18} color={brandPrimary} /> Cover Media
              </h3>
              <div 
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                style={{ border: `2px dashed ${dragActive ? brandPrimary : '#cbd5e1'}`, borderRadius: '24px', padding: '48px', textAlign: 'center', background: dragActive ? 'rgba(79, 70, 229, 0.05)' : '#f8fafc', position: 'relative' }}
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
                    <input type="file" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={(e) => e.target.files && setSelectedImage(URL.createObjectURL(e.target.files[0]))} />
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
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={glossyInputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>Start Time</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} style={glossyInputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>Location</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} color={brandPrimary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input name="venue" value={formData.venue} onChange={handleInputChange} placeholder="Venue name or Link" style={{ ...glossyInputStyle, paddingLeft: '40px' }} />
                  </div>
                </div>
              </div>
            </section>

            <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={16} color="#10b981" /> Settings
              </h3>
              <GlassSelect label="Privacy" name="audience" value={formData.audience} options={['Public', 'Invite Only', 'Members Only']} onChange={setAudience} />
            </section>

            <div style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(79, 70, 229, 0.1)', display: 'flex', gap: '12px' }}>
               <AlertCircle color={brandPrimary} size={20} />
               <div>
                 <div style={{ fontSize: '13px', fontWeight: 800, color: brandPrimary, marginBottom: '4px' }}>Draft Mode</div>
                 <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Your event will be saved as a draft first.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Manage Events</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Create, monitor and maintain your event portfolio.</p>
        </div>
        <button 
          onClick={() => setIsAddingEvent(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '14px',
            background: brandPrimary,
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)'
          }}
        >
          <Plus size={18} /> Create Event
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Active', 'Draft', 'Past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab ? brandPrimary : 'transparent',
                color: activeTab === tab ? '#fff' : '#64748b',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search events..." 
              style={{ padding: '12px 16px 12px 48px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', width: '260px', outline: 'none' }}
            />
          </div>
          <button style={{ padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
        <AnimatePresence>
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }}
              style={{
                background: '#fff',
                borderRadius: '28px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: '200px' }}>
                <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: event.status === 'Active' ? '#16a34a' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: event.status === 'Active' ? '#16a34a' : '#64748b' }}></div>
                    {event.status}
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: brandPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    {event.category}
                  </div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>{event.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                      <Calendar size={16} /> {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                      <MapPin size={16} /> {event.location}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '14px' }}>
                      <Users size={16} /> {event.registrations} Registrations
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
                      {Math.round((event.registrations / event.capacity) * 100)}% Full
                    </div>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(event.registrations / event.capacity) * 100}%`, background: brandPrimary, borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Users size={16} /> Attendees
                  </button>
                  <button style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', cursor: 'pointer' }}>
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventManagerEvents;
