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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/admin/iv-students')}
          style={{ 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569'
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section: College & Visit Details */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <Building2 size={18} color="#475569" /> College & Visit Details
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>College Name</label>
                <input required type="text" placeholder="Enter college name" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Branch / Department</label>
                <input required type="text" placeholder="e.g. Computer Science" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Date of Visit</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                    <Calendar size={16} />
                  </div>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} onClick={(e) => { try { (e.target as HTMLInputElement).showPicker?.(); } catch (err) {} }} style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', width: '100%', boxSizing: 'border-box', background: '#fff', cursor: 'pointer' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Time of Visit</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                      <Clock size={16} />
                    </div>
                    <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} onClick={(e) => { try { (e.target as HTMLInputElement).showPicker?.(); } catch (err) {} }} style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', width: '100%', boxSizing: 'border-box', background: '#fff', cursor: 'pointer' }} />
                  </div>
                  {/* Kept the AM/PM dropdown just in case the brower's time picker doesn't include it natively on some OS/Browsers, though type="time" normally provides its own 12h/24h toggle depending on locale. */}
                  <select value={formData.amPm} onChange={e => setFormData({...formData, amPm: e.target.value})} style={{ padding: '12px 32px 12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 12px center', cursor: 'pointer', minWidth: '80px' }}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Number of Students</label>
                <input required type="number" placeholder="e.g. 50" value={formData.students_count} onChange={e => setFormData({...formData, students_count: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

            </div>
          </div>

          {/* Section: Coordinator Information */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <Users2 size={18} color="#475569" /> Coordinator Information
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Coordinator Name</label>
                <input required type="text" placeholder="Enter full name" value={formData.coordinator_name} onChange={e => setFormData({...formData, coordinator_name: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Email Address</label>
                <input required type="email" placeholder="e.g. user@example.com" value={formData.coordinator_email} onChange={e => setFormData({...formData, coordinator_email: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Phone Number</label>
                <input required type="tel" placeholder="Enter contact number" value={formData.coordinator_phone} onChange={e => setFormData({...formData, coordinator_phone: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

            </div>
          </div>

          {/* Section: Additional Notes */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <FileText size={18} color="#475569" /> Additional Notes
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Visit Overview & Requirements</label>
                <textarea rows={5} placeholder="Enter details about the workshop, seminar, or any special requests..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', resize: 'vertical', background: '#fff' }} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', margin: '16px -24px -32px -24px', padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button type="button" onClick={() => navigate('/admin/iv-students')} style={{ padding: '12px 28px', borderRadius: '8px', background: '#fff', color: '#475569', fontWeight: 700, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
            <button disabled={isSubmitting} type="submit" style={{ padding: '12px 28px', borderRadius: '8px', background: nestNavy, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1, fontSize: '14px', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' }}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminAddVisit;
