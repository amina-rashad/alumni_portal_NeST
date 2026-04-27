import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Mail, Shield, ChevronDown, Lock, Phone, ArrowLeft, Banknote, Calendar, DollarSign
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminAddUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    salary: '',
    joining_date: '',
    role: 'Alumni',
    status: 'Active / Verified',
    password: '',
    require_password_change: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive full name for API if needed, but backend expects 'full_name' usually.
  // We'll combine them for the API submission.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const apiPayload = {
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      email: formData.email,
      phone: formData.phone,
      role: formData.role.toLowerCase() === 'system admin' ? 'admin' : 'user',
      user_type: formData.role,
      password: formData.password
    };

    const res = await adminApi.createUser(apiPayload);
    if (res.success) {
      alert('User created successfully!');
      navigate('/admin/users');
    } else {
      alert(res.message || 'Failed to create user');
    }
    setIsSubmitting(false);
  };

  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
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
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Create User</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
        
        {/* Top Info Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#f1f5f9', color: '#475569', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0, fontFamily: '"Playfair Display", serif' }}>Add New User</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>Configure account details and access roles for a new user.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={18} color={nestNavy} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Basic Details</span>
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>First Name</label>
                <input required type="text" placeholder="Enter first name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Last Name</label>
                <input required type="text" placeholder="Enter last name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <Mail size={16} />
                  </div>
                  <input required type="email" placeholder="user@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', width: '100%', boxSizing: 'border-box', background: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <Phone size={16} />
                  </div>
                  <input type="tel" placeholder="+91 XXXX XXXX XX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', width: '100%', boxSizing: 'border-box', background: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Salary / Stipend</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <Banknote size={16} />
                  </div>
                  <input type="text" placeholder="e.g. 25,000" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', width: '100%', boxSizing: 'border-box', background: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Joining Date</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                    <Calendar size={16} />
                  </div>
                  <input type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} onClick={(e) => { try { (e.target as HTMLInputElement).showPicker?.(); } catch (err) {} }} style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', width: '100%', boxSizing: 'border-box', background: '#fff', cursor: 'pointer' }} />
                </div>
              </div>

            </div>
          </div>

          {/* Section: Account Configuration */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <Shield size={18} color="#475569" /> Account Configuration
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Assign Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center', cursor: 'pointer' }}>
                  <option value="Alumni">Alumni</option>
                  <option value="System Admin">System Admin</option>
                  <option value="Intern">Intern</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Initial Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#10b981', fontWeight: 600, appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center', cursor: 'pointer' }}>
                  <option value="Active / Verified" style={{ color: '#10b981' }}>Active / Verified</option>
                  <option value="Pending" style={{ color: '#f59e0b' }}>Pending</option>
                  <option value="Inactive" style={{ color: '#ef4444' }}>Inactive</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section: Security Settings */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <Lock size={18} color="#475569" /> Security Settings
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Temporary Password</label>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input required type="password" placeholder="Create a temporary password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', flex: 1, minWidth: '280px', maxWidth: '400px', background: '#fff' }} />
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.require_password_change} 
                      onChange={e => setFormData({...formData, require_password_change: e.target.checked})}
                      style={{ 
                        width: '18px', height: '18px', accentColor: nestNavy, cursor: 'pointer',
                        borderRadius: '4px', border: '1px solid #cbd5e1'
                      }} 
                    />
                    Require password change on first login
                  </label>
                </div>
              </div>

            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', margin: '16px -24px -32px -24px', padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button type="button" onClick={() => navigate('/admin/users')} style={{ padding: '12px 28px', borderRadius: '8px', background: '#fff', color: '#475569', fontWeight: 700, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
            <button disabled={isSubmitting} type="submit" style={{ padding: '12px 28px', borderRadius: '8px', background: nestNavy, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1, fontSize: '14px', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' }}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminAddUser;
