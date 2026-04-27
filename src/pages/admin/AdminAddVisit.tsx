import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, ArrowLeft, Building2, Users2, FileText, Calendar, Clock
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminAddVisit: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    college: '',
    branch: '',
    date: '',
    time: '',
    amPm: 'AM',
    students_count: '',
    coordinator_name: '',
    coordinator_email: '',
    coordinator_phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Combine date/time or send separately based on backend needs. 
    // We'll just leave it as is or append time to notes for now if backend doesn't support time natively.
    const payload = {
      ...formData,
      notes: formData.time ? `[Time: ${formData.time} ${formData.amPm}] ${formData.notes}` : formData.notes
    };
    
    // The api might expect date to have everything, or just ignore time.
    const res = await adminApi.addVisit(payload);
    
    if (res.success) {
      alert('IV Visit scheduled successfully!');
      navigate('/admin/iv-students');
    } else {
      alert(res.message || 'Failed to schedule visit');
    }
    setIsSubmitting(false);
  };

  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/admin/iv-students')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            color: '#64748b', 
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Schedule Visit</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
        
        {/* Top Info Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#f1f5f9', color: '#475569', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarDays size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0, fontFamily: '"Playfair Display", serif' }}>Add IV Visit</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>Fill out the required details to schedule a new Industrial Visit array.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>College Name</label>
              <input required type="text" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', color: '#111827' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Branch / Department</label>
              <input required type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', color: '#111827' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Date of Visit</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', color: '#111827' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Number of Students</label>
              <input required type="number" value={formData.students_count} onChange={e => setFormData({...formData, students_count: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', color: '#111827' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Coordinator Name</label>
              <input required type="text" value={formData.coordinator_name} onChange={e => setFormData({...formData, coordinator_name: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', color: '#111827' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Coordinator Email</label>
              <input required type="email" value={formData.coordinator_email} onChange={e => setFormData({...formData, coordinator_email: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', color: '#111827' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Additional Notes</label>
            <textarea rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical', color: '#111827' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                background: nestNavy,
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddVisit;
