import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, School, Users, FileText, ArrowLeft, Clock, ChevronDown
} from 'lucide-react';

const AdminAddVisit: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
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
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Schedule Visit</h1>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Card Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: '#eff6ff', color: '#2563eb', padding: '16px', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <CalendarDays size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Add IV Visit</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: 0 }}>Fill out the required details to schedule a new Industrial Visit array.</p>
          </div>
        </div>

        {/* Form Sections */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Visit Information Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <School size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>College & Visit Details</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* College Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>College Name</label>
                  <input type="text" placeholder="Enter college name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* College Sub/Branch */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Branch / Department</label>
                  <input type="text" placeholder="e.g. Computer Science" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Visit Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Date of Visit</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '16px', top: '12px', pointerEvents: 'none' }}>
                      <CalendarDays size={16} color="#94a3b8" />
                    </div>
                    <input 
                      type="date" 
                      onClick={(e) => (e.currentTarget as any).showPicker?.()}
                      style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', color: '#1e293b', cursor: 'pointer' }} 
                    />
                  </div>
                </div>
                {/* Visit Time */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Time of Visit</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <div style={{ position: 'absolute', left: '16px', top: '12px', pointerEvents: 'none' }}>
                        <Clock size={16} color="#94a3b8" />
                      </div>
                      <input 
                        type="time" 
                        onClick={(e) => (e.currentTarget as any).showPicker?.()}
                        style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', color: '#1e293b', cursor: 'pointer' }} 
                      />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <select style={{ height: '44px', padding: '0 32px 0 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', color: '#1e293b', appearance: 'none', width: '80px' }}>
                        <option>AM</option>
                        <option>PM</option>
                      </select>
                      <ChevronDown size={14} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '15px', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
                {/* Number of Students */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Number of Students</label>
                  <input type="number" placeholder="e.g. 50" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Coordinator Details Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Coordinator Information</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Coordinator Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Coordinator Name</label>
                  <input type="text" placeholder="Enter full name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Coordinator Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Email Address</label>
                  <input type="email" placeholder="e.g. user@example.com" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Phone Number */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Phone Number</label>
                  <input type="tel" placeholder="Enter contact number" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Additional Notes</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Visit Overview & Requirements</label>
                <textarea 
                  placeholder="Enter details about the workshop, seminar, or any special requests..." 
                  style={{ width: '100%', minHeight: '120px', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', fontSize: '14px', outline: 'none', resize: 'vertical', background: '#fff', color: '#1e293b' }}
                ></textarea>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fff' }}>
          <button 
            onClick={() => navigate('/admin/iv-students')}
            style={{ 
              padding: '12px 24px', borderRadius: '10px', background: '#f1f5f9', 
              color: '#475569', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
          <button style={{ 
            padding: '12px 24px', borderRadius: '10px', background: '#2563eb', 
            color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)' 
          }}>
            Schedule Visit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddVisit;
