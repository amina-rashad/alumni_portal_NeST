import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Filter, Mail, Shield, 
  MoreHorizontal, Edit3, Trash2, CheckCircle2, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  /* NeST NAVY BLUE BRAND COLOR */
  const nestNavy = '#1a2652';

  const users = [
    { id: '1', name: 'Admin User', email: 'admin@nest.com', role: 'Admin', status: 'Active', joinedDate: 'Jan 10, 2024' },
    { id: '2', name: 'Sarah Wilson', email: 'sarah.w@example.com', role: 'Alumni', status: 'Active', joinedDate: 'Feb 15, 2024' },
    { id: '3', name: 'Maya Prasad', email: 'maya.p@example.com', role: 'Student', status: 'Active', joinedDate: 'Mar 02, 2024' },
    { id: '4', name: 'Rahul Nair', email: 'rahul.n@example.com', role: 'Alumni', status: 'Inactive', joinedDate: 'Mar 10, 2024' },
    { id: '5', name: 'Elena Rodriguez', email: 'elena.r@example.com', role: 'Student', status: 'Active', joinedDate: 'Mar 15, 2024' },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>User Governance</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '4px' }}>Manage user access, roles, and platform permissions.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/users/add')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: nestNavy, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' }}
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '8px 16px', maxWidth: '400px' }}>
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#1e293b', background: 'transparent' }} 
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
           <option value="All">All Roles</option>
           <option value="Admin">Admin</option>
           <option value="Alumni">Alumni</option>
           <option value="Student">Student</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
           <option value="All">All Status</option>
           <option value="Active">Active</option>
           <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>User</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Joined</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, i) => (
              <tr key={user.id} style={{ borderBottom: i !== filteredUsers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.08)', color: nestNavy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>{user.role}</span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {user.status === 'Active' ? <CheckCircle2 size={14} color="#16a34a" /> : <XCircle size={14} color="#dc2626" />}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: user.status === 'Active' ? '#16a34a' : '#dc2626' }}>{user.status}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>{user.joinedDate}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit3 size={16} /></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Trash2 size={16} /></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><MoreHorizontal size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
