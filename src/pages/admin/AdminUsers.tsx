import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, ChevronDown, 
  Eye, Edit2, MoreHorizontal, ChevronRight
} from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const users = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', subEmail: 'john.doe@xample.com', role: 'Admin', status: 'Active', avatar: 'A', avatarBg: '#ef4444' },
    { id: 2, name: 'Rahul Nair', email: 'rahul.nair@example.com', subEmail: 'rahul.nair@xample.com', role: 'HR', status: 'Active', avatar: 'R', avatarBg: '#3b82f6' },
    { id: 3, name: 'Anu Prasad', email: 'anu.prasad@example.com', subEmail: 'anu.prasad@xample.com', role: 'Alumni', status: 'Inactive', avatar: 'A', avatarBg: '#f59e0b' },
    { id: 4, name: 'Alan Mathew', email: 'alan.mathew@example.com', subEmail: 'alan.mathew@xample.com', role: 'Intern', status: 'Active', avatar: 'AM', avatarBg: '#10b981' },
    { id: 5, name: 'Maya Prasad', email: 'maya.prasad@example.com', subEmail: 'maya.prasad@eample.com', role: 'Alumni', status: 'Active', avatar: 'M', avatarBg: '#8b5cf6' },
    { id: 6, name: 'John Doe', email: 'john.doe@example.com', subEmail: 'john.doe@xample.com', role: 'Alumni', status: 'Active', avatar: 'J', avatarBg: '#06b6d4' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>User Management</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Manage all users, roles, and access permissions.</p>
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'center' }}>
          {/* Search Bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            padding: '8px 16px',
            width: '100%',
            maxWidth: '360px'
          }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                border: 'none', 
                outline: 'none', 
                marginLeft: '10px', 
                width: '100%',
                fontSize: '14px',
                color: '#1e293b',
                background: 'transparent'
              }} 
            />
            <MoreHorizontal size={18} color="#cbd5e1" style={{ cursor: 'pointer' }} />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
              Role <ChevronDown size={14} />
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
              Status <ChevronDown size={14} />
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
              All <ChevronDown size={14} />
            </button>
          </div>
        </div>
        
        <Link to="/admin/users/add" style={{ textDecoration: 'none' }}>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: '#3b82f6', 
            color: '#fff', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '12px', 
            fontSize: '14px', 
            fontWeight: 600, 
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(59, 130, 246, 0.2)'
          }}>
            <Plus size={18} />
            Add User
          </button>
        </Link>
      </div>

      {/* Data Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '16px', width: '48px' }}>
                <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }} />
              </th>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Name</th>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Email</th>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Role</th>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Status <ChevronDown size={14} color="#94a3b8" />
              </th>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Actions <MoreHorizontal size={14} color="#94a3b8" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} style={{ borderBottom: index !== users.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s', ...({ ':hover': { background: '#f8fafc' } } as any) }}>
                <td style={{ padding: '16px' }}>
                  <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: user.avatarBg, 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 600,
                      opacity: 0.9
                    }}>
                      {user.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{user.name}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{user.subEmail}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                  {user.email}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    background: user.role === 'Admin' ? '#e0e7ff' : user.role === 'HR' ? '#dbeafe' : user.role === 'Intern' ? '#d1fae5' : '#f1f5f9',
                    color: user.role === 'Admin' ? '#4f46e5' : user.role === 'HR' ? '#2563eb' : user.role === 'Intern' ? '#059669' : '#475569'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    background: user.status === 'Active' ? '#dcfce7' : '#fee2e2',
                    color: user.status === 'Active' ? '#16a34a' : '#ef4444'
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex' }} title="View">
                      <Eye size={18} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex' }} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex' }} title="More">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '16px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Previous
            </button>
            <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              1
            </button>
            <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              2
            </button>
            <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              3
            </button>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', color: '#94a3b8' }}>...</span>
            <button style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
