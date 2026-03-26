import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Briefcase, GraduationCap, FileText, ChevronDown, ArrowLeft
} from 'lucide-react';

const AdminAddIntern: React.FC = () => {
  const navigate = useNavigate();

  /* NeST NAVY BLUE */
  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Add New Intern</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(26, 38, 82, 0.05)' }}>
        {/* Card Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: 'rgba(26, 38, 82, 0.08)', color: nestNavy, padding: '16px', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <UserPlus size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Intern Registration</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: 0 }}>Fill out the details to register a new intern in the system.</p>
          </div>
        </div>

        {/* Form Sections */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Personal Information Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserPlus size={18} color={nestNavy} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Personal Information</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Full Name</label>
                  <input type="text" placeholder="Enter full name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Email Address</label>
                  <input type="email" placeholder="e.g. intern@example.com" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Phone Number</label>
                  <input type="tel" placeholder="Enter contact number" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Gender</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#1e293b', fontWeight: 600 }}>
                      <option>Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GraduationCap size={18} color={nestNavy} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Academic Background</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>College/University</label>
                  <input type="text" placeholder="Enter college name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Course / Branch</label>
                  <input type="text" placeholder="e.g. B.Tech Computer Science" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Year of Graduation</label>
                  <input type="number" placeholder="e.g. 2024" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Internship Details Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={18} color={nestNavy} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Internship Details</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Internship Role / Domain</label>
                  <input type="text" placeholder="e.g. Frontend Developer" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Start Date</label>
                  <input type="date" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', color: '#1e293b' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Duration (Months)</label>
                  <input type="number" placeholder="e.g. 3" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Assigned Mentor</label>
                  <input type="text" placeholder="Enter mentor name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} color={nestNavy} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Attachments</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ background: 'rgba(26, 38, 82, 0.05)', color: nestNavy, padding: '12px', borderRadius: '50%' }}>
                     <FileText size={24} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Upload Resume & Documents</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>PDF, DOCX up to 5MB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fcfdfd' }}>
          <button 
            onClick={() => navigate('/admin/interns')}
            style={{ 
              padding: '12px 24px', borderRadius: '10px', background: '#fff', 
              color: '#475569', fontSize: '14px', fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
          <button style={{ 
            padding: '12px 24px', borderRadius: '10px', background: nestNavy, 
            color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' 
          }}>
            Add Intern
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddIntern;
