import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Mail, Shield, ChevronDown, Lock, Phone, ArrowLeft
} from 'lucide-react';

const AdminAddUser: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/admin/users')}
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
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Create User</h1>
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
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Add New User</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: 0 }}>Configure account details and access roles for a new user.</p>
          </div>
        </div>

        {/* Form Sections */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Basic Information Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Basic Details</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* First Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>First Name</label>
                  <input type="text" placeholder="Enter first name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Last Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Last Name</label>
                  <input type="text" placeholder="Enter last name" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                    <input type="email" placeholder="user@example.com" style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
                {/* Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                    <input type="tel" placeholder="+91 XXXX XXXX XX" style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role & Permissions Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Account Configuration</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* User Role */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Assign Role</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#1e293b' }}>
                      <option value="alumni">Alumni</option>
                      <option value="hr">HR / Recruiter</option>
                      <option value="intern">Intern</option>
                      <option value="admin">System Admin</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
                {/* Account Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Initial Status</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#16a34a', fontWeight: 600 }}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive / Pending</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Security Settings</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Temporary Password</label>
                  <input type="password" placeholder="Create a temporary password" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Force Reset Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
                   <input type="checkbox" id="forceReset" defaultChecked style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }} />
                   <label htmlFor="forceReset" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
                      Require password change on first login
                   </label>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fff' }}>
          <button 
            onClick={() => navigate('/admin/users')}
            style={{ 
              padding: '12px 24px', borderRadius: '10px', background: '#f1f5f9', 
              color: '#475569', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
          <button style={{ 
            padding: '12px 24px', borderRadius: '10px', background: '#3b82f6', 
            color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)' 
          }}>
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddUser;
