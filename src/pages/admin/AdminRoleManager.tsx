import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Users, UserCheck, ShieldAlert, X, ChevronRight, Activity, UserPlus } from 'lucide-react';
import { adminApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const nestNavy = '#1a2652';

const AdminRoleManager: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser.role === 'super_admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await adminApi.getAllUsers();
      if (res.success && res.data) {
        setAllUsers(res.data.users);
        setUsers(res.data.users); // Show all initially
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allUsers.filter((u: any) => 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUsers(filtered);
    } else {
      setUsers(allUsers);
    }
  }, [searchQuery, allUsers]);

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;
    setIsUpdating(true);
    const res = await adminApi.updateUser(selectedUser.id, { role: newRole });
    if (res.success) {
      setMessage({ text: `Successfully appointed ${selectedUser.full_name} as ${newRole.replace('_', ' ')}.`, type: 'success' });
      setSelectedUser(null);
      setNewRole('');
      setSearchQuery('');
    } else {
      setMessage({ text: res.message || 'Failed to update role.', type: 'error' });
    }
    setIsUpdating(false);
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Appoint Managers</h1>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '4px' }}>Assign administrative privileges and system oversight roles.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/admin/roles/add')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '12px', border: 'none', 
              background: nestNavy, color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)'
            }}
          >
            <UserPlus size={18} /> Add New Manager
          </button>
          <div style={{ padding: '8px 16px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0' }}>
            <Shield size={16} color={nestNavy} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
              {isSuperAdmin ? 'Full Authorization' : 'Standard Admin'}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ 
              padding: '16px 24px', 
              borderRadius: '16px', 
              background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', 
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fee2e2'}`,
              color: message.type === 'success' ? '#166534' : '#991b1b',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {message.type === 'success' ? <UserCheck size={20} /> : <ShieldAlert size={20} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px' }}>
        
        {/* Left: User Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>Select Staff Member</h3>
            
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
              {users.map(user => (
                <button 
                  key={user.id}
                  onClick={() => { setSelectedUser(user); setNewRole(user.role); }}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid',
                    borderColor: selectedUser?.id === user.id ? nestNavy : 'transparent',
                    background: selectedUser?.id === user.id ? `${nestNavy}05` : '#f8fafc',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: nestNavy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
                    {user.full_name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{user.full_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{user.role?.replace('_', ' ')}</div>
                  </div>
                  {selectedUser?.id === user.id && <ChevronRight size={18} color={nestNavy} />}
                </button>
              ))}
              {users.length === 0 && searchQuery.trim() && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <Users size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>No users matched your search</p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right: Role Assignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Assignment Details</h3>

            {selectedUser ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: nestNavy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>
                    {selectedUser.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{selectedUser.full_name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{selectedUser.email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Assign System Privilege</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <RoleOption id="job_recruiter" label="Job Recruiter" desc="Post & manage career opportunities" active={newRole === 'job_recruiter'} onClick={() => setNewRole('job_recruiter')} />
                    <RoleOption id="event_manager" label="Event Manager" desc="Organize platform activities" active={newRole === 'event_manager'} onClick={() => setNewRole('event_manager')} />
                    <RoleOption id="course_manager" label="Course Manager" desc="Curate educational content" active={newRole === 'course_manager'} onClick={() => setNewRole('course_manager')} />
                    <RoleOption id="user" label="Standard User" desc="Revoke administrative access" active={newRole === 'user'} onClick={() => setNewRole('user')} />
                    
                    {isSuperAdmin && (
                      <>
                        <RoleOption id="admin" label="System Admin" desc="Full platform operations" active={newRole === 'admin'} onClick={() => setNewRole('admin')} color="#3b82f6" />
                        <RoleOption id="super_admin" label="Super Admin" desc="Root security & governance" active={newRole === 'super_admin'} onClick={() => setNewRole('super_admin')} color="#ef4444" />
                      </>
                    )}
                  </div>
                </div>

                {!isSuperAdmin && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px' }}>
                    <ShieldAlert size={16} color="#d97706" style={{ marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: '#92400e', lineHeight: '1.5' }}>
                      As a Standard Admin, you cannot appoint other Administrators or Super Admins. Please contact system root for higher elevation.
                    </p>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <button 
                    onClick={handleRoleUpdate}
                    disabled={isUpdating || newRole === selectedUser.role}
                    style={{ 
                      width: '100%', padding: '16px', borderRadius: '16px', border: 'none', 
                      background: isUpdating || newRole === selectedUser.role ? '#cbd5e1' : nestNavy,
                      color: '#fff', fontWeight: 700, cursor: isUpdating || newRole === selectedUser.role ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: newRole !== selectedUser.role ? '0 10px 15px -3px rgba(26, 38, 82, 0.3)' : 'none'
                    }}
                  >
                    {isUpdating ? 'Synchronizing...' : 'Confirm Appointment'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center', gap: '16px' }}>
                <Activity size={48} style={{ opacity: 0.2 }} />
                <p style={{ margin: 0, fontSize: '15px' }}>Select a user from the left panel to modify their system privileges.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const RoleOption: React.FC<{ id: string, label: string, desc: string, active: boolean, onClick: () => void, color?: string }> = ({ label, desc, active, onClick, color }) => (
  <button 
    onClick={onClick}
    style={{
      padding: '12px', borderRadius: '12px', border: '1px solid',
      borderColor: active ? (color || nestNavy) : '#e2e8f0',
      background: active ? `${color || nestNavy}08` : '#fff',
      textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
    }}
  >
    <div style={{ fontSize: '13px', fontWeight: 800, color: active ? (color || nestNavy) : '#1e293b' }}>{label}</div>
    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{desc}</div>
  </button>
);

export default AdminRoleManager;
