import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardSignature, Briefcase, Banknote, ClipboardCheck
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminPostJob: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    requirements: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const jobData = {
      ...formData,
      requirements: formData.requirements.split('\n').filter(r => r.trim() !== '')
    };

    const res = await adminApi.addJob(jobData);
    if (res.success) {
      alert('Job posted successfully!');
      navigate('/admin/jobs');
    } else {
      alert(res.message || 'Failed to post job');
    }
    setIsSubmitting(false);
  };

  /* NeST NAVY BLUE */
  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Post a Job</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '16px', borderRadius: '16px' }}>
            <ClipboardSignature size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Job Details</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Fill out the details to create a new recruitment listing.</p>
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Job Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Senior Java Developer" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Company</label>
              <input 
                required
                type="text" 
                placeholder="e.g. NeST Digital" 
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Location</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Kochi, Kerala" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Salary Range</label>
              <input 
                type="text" 
                placeholder="e.g. 5L - 8L PA" 
                value={formData.salary}
                onChange={e => setFormData({...formData, salary: e.target.value})}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Job Description</label>
            <textarea 
              required
              rows={4}
              placeholder="Describe the role and responsibilities..." 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Requirements (One per line)</label>
            <textarea 
              rows={4}
              placeholder="e.g. 3+ years experience in React&#10;Strong understanding of Node.js" 
              value={formData.requirements}
              onChange={e => setFormData({...formData, requirements: e.target.value})}
              style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical' }} 
            />
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
          <button 
            type="button"
            onClick={() => navigate('/admin/jobs')}
            style={{ padding: '12px 24px', borderRadius: '10px', background: '#fff', color: '#475569', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            disabled={isSubmitting}
            type="submit"
            style={{ padding: '12px 24px', borderRadius: '10px', background: '#2563eb', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPostJob;
