import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, MapPin, ArrowLeft, 
  Image as ImageIcon
} from 'lucide-react';

const AdminAddEvent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/admin/events')}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            width: '40px', height: '40px', borderRadius: '12px', background: '#fff', 
            border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Create New Event</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '16px', borderRadius: '16px' }}>
            <Plus size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Event Details</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Share all the necessary details about the upcoming event.</p>
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Event Title</label>
              <input type="text" placeholder="e.g. Annual Alumni Meet 2026" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff', color: '#1e293b' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Event Category</label>
              <select style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff', color: '#1e293b' }}>
                <option>Networking</option>
                <option>Workshop</option>
                <option>Seminar</option>
                <option>Career Fair</option>
                <option>Social</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Event Date</label>
              <input 
                type="date" 
                onClick={(e) => (e.currentTarget as any).showPicker?.()} 
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', cursor: 'pointer', background: '#fff', color: '#1e293b' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Event Time</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="time" 
                  onClick={(e) => (e.currentTarget as any).showPicker?.()} 
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', cursor: 'pointer', background: '#fff', color: '#1e293b' }} 
                />
                <select style={{ padding: '0 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', outline: 'none' }}>
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Venue / Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '13px' }} />
                <input type="text" placeholder="e.g. Grand Hall, Main Campus or Virtual Link" style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff', color: '#1e293b' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Event Description</label>
              <textarea placeholder="Tell attendees about the event, objectives, and what to expect..." style={{ width: '100%', minHeight: '150px', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical', background: '#fff', color: '#1e293b' }}></textarea>
            </div>
          </div>
          
          {/* Banner Upload */}
          <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', background: '#f8fafc' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '50%', color: '#64748b' }}>
              <ImageIcon size={32} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>Click to upload event banner</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>JPG, PNG or WEBP (Max 5MB). Recommended 1200x600px</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
          <button onClick={() => navigate('/admin/events')} style={{ padding: '12px 24px', borderRadius: '10px', background: '#fff', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
          <button style={{ padding: '12px 24px', borderRadius: '10px', background: '#2563eb', border: 'none', fontSize: '14px', fontWeight: 600, color: '#fff', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}>Create Event</button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddEvent;
