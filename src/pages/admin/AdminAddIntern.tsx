import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Briefcase, GraduationCap, FileText, ChevronDown, ArrowLeft
} from 'lucide-react';

const AdminAddIntern: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
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
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Add New Intern</h1>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Card Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: '#eff6ff', color: '#2563eb', padding: '16px', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <UserPlus size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Intern Registration</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: 0 }}>Fill out the details to register a new intern in the system.</p>
          </div>
        </div>

        {/* Form Sections */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Personal Information Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserPlus size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Personal Information</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Full Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Full Name</label>
                  <input type="text" placeholder="Enter full name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Email Address</label>
                  <input type="email" placeholder="e.g. intern@example.com" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Phone Number</label>
                  <input type="tel" placeholder="Enter contact number" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Gender */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Gender</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#94a3b8' }}>
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
              <GraduationCap size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Academic Background</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* College Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>College/University</label>
                  <input type="text" placeholder="Enter college name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Course */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Course / Branch</label>
                  <input type="text" placeholder="e.g. B.Tech Computer Science" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Year of Graduation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Year of Graduation</label>
                  <input type="number" placeholder="e.g. 2024" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Internship Internship Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Internship Details</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Internship Role */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Internship Role / Domain</label>
                  <input type="text" placeholder="e.g. Frontend Developer" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Start Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Start Date</label>
                  <input type="date" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', color: '#475569' }} />
                </div>
                {/* Duration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Duration (Months)</label>
                  <input type="number" placeholder="e.g. 3" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Assigned Mentor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Assigned Mentor</label>
                  <input type="text" placeholder="Enter mentor name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Attachments</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s', ...({ ':hover': { borderColor: '#3b82f6' } } as any) }}>
                  <div style={{ background: '#f1f5f9', color: '#64748b', padding: '12px', borderRadius: '50%' }}>
                     <FileText size={24} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Upload Resume & Documents</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>PDF, DOCX up to 5MB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fff' }}>
          <button 
            onClick={() => navigate('/admin/interns')}
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
            Add Intern
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddIntern;
