import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, School, Users, FileText
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminAddVisit: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    college: '',
    branch: '',
    date: '',
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
    const res = await adminApi.addVisit(formData);
    if (res.success) {
      alert('IV Visit scheduled successfully!');
      navigate('/admin/iv-students');
    } else {
      alert(res.message || 'Failed to schedule visit');
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Schedule Visit</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '16px', borderRadius: '16px' }}>
            <CalendarDays size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Add IV Visit</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Fill out the details to schedule a new Industrial Visit.</p>
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>College Name</label>
              <input required type="text" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Branch / Department</label>
              <input required type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Date of Visit</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Number of Students</label>
              <input required type="number" value={formData.students_count} onChange={e => setFormData({...formData, students_count: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Coordinator Name</label>
              <input required type="text" value={formData.coordinator_name} onChange={e => setFormData({...formData, coordinator_name: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Coordinator Email</label>
              <input required type="email" value={formData.coordinator_email} onChange={e => setFormData({...formData, coordinator_email: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Additional Notes</label>
            <textarea rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
          <button type="button" onClick={() => navigate('/admin/iv-students')} style={{ padding: '12px 24px', borderRadius: '10px', background: '#fff', color: '#475569', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer' }}>Cancel</button>
          <button disabled={isSubmitting} type="submit" style={{ padding: '12px 24px', borderRadius: '10px', background: '#2563eb', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddVisit;
