import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Briefcase, GraduationCap
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminAddIntern: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: 'password123', // Default temporary password
    role: 'user',
    user_type: 'Intern',
    batch: '',
    specialization: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await adminApi.createUser(formData);
    if (res.success) {
      alert('Intern registered successfully!');
      navigate('/admin/interns');
    } else {
      alert(res.message || 'Failed to register intern');
    }
    setIsSubmitting(false);
  };

  /* NeST NAVY BLUE */
  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Add New Intern</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '16px', borderRadius: '16px' }}>
            <UserPlus size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Intern Registration</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Register a new intern and assign them to a batch.</p>
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Full Name</label>
              <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>College / Batch</label>
              <input required type="text" placeholder="e.g. Saintgits 2024" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Specialization</label>
              <input required type="text" placeholder="e.g. Python Fullstack" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Phone Number</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
          <button type="button" onClick={() => navigate('/admin/interns')} style={{ padding: '12px 24px', borderRadius: '10px', background: '#fff', color: '#475569', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer' }}>Cancel</button>
          <button disabled={isSubmitting} type="submit" style={{ padding: '12px 24px', borderRadius: '10px', background: '#2563eb', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Registering...' : 'Add Intern'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddIntern;
