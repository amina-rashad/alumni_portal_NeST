import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Plus, 
  Eye, Edit2, MoreHorizontal, UserPlus, FileSpreadsheet, Trash2, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const nestNavy = '#1a2652';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>User Governance</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '4px' }}>
            Managing <span style={{ color: '#1a2652', fontWeight: 700 }}>{users.length} total users</span> across the platform.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={async () => {
              setIsLoading(true);
              const res = await adminApi.getAllUsers();
              if (res.success && res.data) setUsers(res.data.users);
              setIsLoading(false);
              toast.success('User list updated');
            }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', 
              background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', 
              borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
            }}
            title="Refresh List"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => navigate('/admin/users/bulk')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
              background: '#f1f5f9', color: '#1a2652', border: '1px solid #e2e8f0', 
              borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: '0.2s'
            }}
          >
            <FileSpreadsheet size={18} /> Bulk Onboarding
          </button>
          <button 
            onClick={() => navigate('/admin/users/add')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: nestNavy, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' }}
          >
            <UserPlus size={18} /> Add User
          </button>
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
          </div>
        </div>
        
        {/* Filter button or other controls could go here */}
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
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          padding: '2.5px', 
                          borderRadius: '50%', 
                          background: (user.status === 'open_to_work' || (!user.status && user.user_type === 'Intern'))
                            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                            : user.status === 'hiring' 
                              ? 'linear-gradient(135deg, #3b82f6 0%, #0284c7 100%)' 
                              : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
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
                            fontWeight: 800,
                            border: '2px solid #fff'
                          }}>
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {user.full_name}
                          <span style={{ fontSize: '10px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                            {user.user_type || 'Alumni'}
                          </span>
                          {(user.status === 'open_to_work' || (!user.status && user.user_type === 'Intern')) && (
                            <span style={{ fontSize: '9px', color: '#16a34a', fontWeight: 900, background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.3px' }}>OPEN TO WORK</span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{user.email}</div>
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
                      <button 
                        onClick={() => navigate(`/admin/users/view/${user.id}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', transition: '0.2s' }} 
                        title="View Detailed Profile"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', transition: '0.2s' }} 
                        title="Edit User"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete ${user.full_name}? This action cannot be undone.`)) {
                            try {
                              const res = await adminApi.deleteUser(user.id);
                              if (res.success) {
                                setUsers(prev => prev.filter(u => u.id !== user.id));
                                toast.success('User deleted successfully');
                              } else {
                                toast.error(res.message || 'Failed to delete user');
                              }
                            } catch (err) {
                              toast.error('Error deleting user');
                            }
                          }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', transition: '0.2s' }} 
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
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
