import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, 
  Eye, Edit2, MoreHorizontal
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const res = await adminApi.getAllUsers();
      if (res.success && res.data) {
        setUsers(res.data.users);
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading users...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '16px', width: '48px' }}>
                  <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                </th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Name</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Email</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Role</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Status</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: index !== filteredUsers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '16px' }}>
                    <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: '#3b82f6', 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 600
                      }}>
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{user.full_name}</div>
                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>{user.email}</div>
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
                      background: user.role === 'admin' ? '#e0e7ff' : '#f1f5f9',
                      color: user.role === 'admin' ? '#4f46e5' : '#475569'
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
                      background: user.is_active ? '#dcfce7' : '#fee2e2',
                      color: user.is_active ? '#16a34a' : '#ef4444'
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} title="View"><Eye size={18} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} title="Edit"><Edit2 size={18} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} title="More"><MoreHorizontal size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
