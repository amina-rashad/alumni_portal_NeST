import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, User, GraduationCap, Briefcase, FileText, ArrowLeft, Calendar
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminAddIntern: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: 'Select gender',
    college: '',
    course: '',
    graduation_year: '',
    role_domain: '',
    start_date: '',
    duration: '',
    mentor: '',
    password: 'password123', // Default temporary password
    role: 'user',
    user_type: 'Intern',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mapping to API expectations while sending extra data
    const apiPayload = {
      ...formData,
      batch: `${formData.college} ${formData.graduation_year}`.trim(),
      specialization: formData.role_domain
    };

    const res = await adminApi.createUser(apiPayload);
    if (res.success) {
      alert('Intern registered successfully!');
      navigate('/admin/interns');
    } else {
      alert(res.message || 'Failed to register intern');
    }
    setIsSubmitting(false);
  };

  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/admin/interns')}
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
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Add New Intern</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
        
        {/* Top Info Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#f1f5f9', color: '#475569', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0, fontFamily: '"Playfair Display", serif' }}>Intern Registration</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>Fill out the details to register a new intern in the system.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section: Personal Information */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <User size={18} color="#475569" /> Personal Information
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Full Name</label>
                <input required type="text" placeholder="Enter full name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Email Address</label>
                <input required type="email" placeholder="e.g. intern@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Phone Number</label>
                <input type="tel" placeholder="Enter contact number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Gender</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center', cursor: 'pointer' }}>
                  <option value="Select gender" disabled>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section: Academic Background */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <GraduationCap size={18} color="#475569" /> Academic Background
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>College/University</label>
                <input required type="text" placeholder="Enter college name" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Course / Branch</label>
                <input required type="text" placeholder="e.g. B.Tech Computer Science" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Year of Graduation</label>
                <input required type="text" placeholder="e.g. 2024" value={formData.graduation_year} onChange={e => setFormData({...formData, graduation_year: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

            </div>
          </div>

          {/* Section: Internship Details */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <Briefcase size={18} color="#475569" /> Internship Details
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Internship Role / Domain</label>
                <input required type="text" placeholder="e.g. Frontend Developer" value={formData.role_domain} onChange={e => setFormData({...formData, role_domain: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Start Date</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                    <Calendar size={16} />
                  </div>
                  <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} onClick={(e) => { try { (e.target as HTMLInputElement).showPicker?.(); } catch (err) {} }} style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', width: '100%', boxSizing: 'border-box', background: '#fff', cursor: 'pointer' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Duration (Months)</label>
                <input required type="text" placeholder="e.g. 3" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Assigned Mentor</label>
                <input required type="text" placeholder="Enter mentor name" value={formData.mentor} onChange={e => setFormData({...formData, mentor: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

            </div>
          </div>

          {/* Section: Attachments */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <FileText size={18} color="#475569" /> Attachments
            </div>
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
              
              <div style={{ width: '100%', maxWidth: '100%', border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#fafaf9', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>
                  <FileText size={20} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Upload Resume & Documents</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>PDF, DOCX up to 5MB</div>
                </div>
              </div>

            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', margin: '16px -24px -32px -24px', padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button type="button" onClick={() => navigate('/admin/interns')} style={{ padding: '12px 28px', borderRadius: '8px', background: '#fff', color: '#475569', fontWeight: 700, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
            <button disabled={isSubmitting} type="submit" style={{ padding: '12px 28px', borderRadius: '8px', background: nestNavy, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1, fontSize: '14px', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' }}>
              {isSubmitting ? 'Registering...' : 'Add Intern'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminAddIntern;
