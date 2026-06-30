import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Plus, 
  Eye, Edit2, MoreHorizontal, UserPlus, FileSpreadsheet, Trash2, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import UserAvatar from '../../components/UserAvatar';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
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

  const getDisplayRole = (user: any) => {
    if (isStaffRole(user.role) || user.user_type === 'Staff') return 'Staff';
    if (user.user_type === 'Industrial Student' || user.user_type === 'IV Student') return 'IV Student';
    if (user.user_type === 'Intern') return 'Intern';
    if (user.user_type === 'Trainee') return 'Trainee';
    if (user.user_type === 'Alumni' || (!user.user_type && !isStaffRole(user.role))) return 'Alumni';
    return 'Other';
  };

  const isStaffRole = (role: string) => {
    return ['super_admin', 'admin', 'event_manager', 'course_manager', 'job_recruiter'].includes(role);
  };

  const getRoleBadgeStyle = (displayRole: string) => {
    switch (displayRole) {
      case 'Alumni':
        return { background: '#e2e7f3', color: '#1a2652' };
      case 'IV Student':
        return { background: '#eff6ff', color: '#3b82f6' };
      case 'Intern':
        return { background: '#fffbeb', color: '#d97706' };
      case 'Staff':
        return { background: '#fee2e2', color: '#ef4444' };
      case 'Trainee':
        return { background: '#f5f3ff', color: '#8b5cf6' };
      default:
        return { background: '#f1f5f9', color: '#475569' };
    }
  };

  const filteredUsers = users.filter(user => {
    // 1. Search filter
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    // 2. Category filter
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Staff') return isStaffRole(user.role) || user.user_type === 'Staff';
    if (selectedCategory === 'Alumni') return user.user_type === 'Alumni' || (!user.user_type && !isStaffRole(user.role));
    if (selectedCategory === 'IV Students') return user.user_type === 'Industrial Student';
    if (selectedCategory === 'Interns') return user.user_type === 'Intern';
    if (selectedCategory === 'Trainees') return user.user_type === 'Trainee';
    
    // Others
    const knownTypes = ['Alumni', 'Industrial Student', 'Intern', 'Trainee', 'Staff'];
    const isKnown = knownTypes.includes(user.user_type) || isStaffRole(user.role);
    return !isKnown;
  });

  const isAllFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(user => selectedUserIds.includes(user.id));
  const isSomeFilteredSelected = filteredUsers.length > 0 && filteredUsers.some(user => selectedUserIds.includes(user.id)) && !isAllFilteredSelected;

  const handleSelectAllToggle = () => {
    if (isAllFilteredSelected) {
      const filteredIds = filteredUsers.map(u => u.id);
      setSelectedUserIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredUsers.map(u => u.id);
      setSelectedUserIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSelectUserToggle = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>User Governance</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '4px' }}>
            Managing <span style={{ color: '#1a2652', fontWeight: 700 }}>{users.length} total users</span> across the platform.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {selectedUserIds.length > 0 && (
            <button 
              onClick={() => setBulkDeleteConfirm(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '12px 24px', 
                background: '#ef4444', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: 700, 
                cursor: 'pointer', 
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
            >
              <Trash2 size={18} /> Delete Selected ({selectedUserIds.length})
            </button>
          )}
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
        <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            padding: '8px 16px',
            width: '100%',
            maxWidth: '300px'
          }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedUserIds([]); // reset selection when search query changes
              }}
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

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {['All', 'Alumni', 'IV Students', 'Interns', 'Trainees', 'Staff', 'Others'].map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedUserIds([]); // reset selection when category changes
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: isActive ? nestNavy : '#e2e8f0',
                    background: isActive ? nestNavy : '#fff',
                    color: isActive ? '#fff' : '#64748b',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(26, 38, 82, 0.15)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = nestNavy;
                      e.currentTarget.style.color = nestNavy;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.color = '#64748b';
                    }
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
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
                  <input 
                    type="checkbox" 
                    checked={isAllFilteredSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = isSomeFilteredSelected;
                      }
                    }}
                    onChange={handleSelectAllToggle}
                    style={{ 
                      cursor: 'pointer', 
                      width: '18px', 
                      height: '18px', 
                      accentColor: nestNavy,
                      colorScheme: 'light'
                    }} 
                  />
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
                <tr 
                  key={user.id} 
                  style={{ 
                    borderBottom: index !== filteredUsers.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: selectedUserIds.includes(user.id) ? 'rgba(26, 38, 82, 0.03)' : 'transparent',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleSelectUserToggle(user.id)}
                      style={{ 
                        cursor: 'pointer', 
                        width: '18px', 
                        height: '18px', 
                        accentColor: nestNavy,
                        colorScheme: 'light'
                      }} 
                    />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <UserAvatar
                        src={user.profile_picture}
                        name={user.full_name}
                        status={user.status || (user.user_type === 'Intern' ? 'open_to_work' : undefined)}
                        size={40}
                        bgColor={isStaffRole(user.role) ? nestNavy : "#3b82f6"}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {user.full_name}
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
                    {(() => {
                      const displayRole = getDisplayRole(user);
                      const badgeStyle = getRoleBadgeStyle(displayRole);
                      return (
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: 700, 
                          background: badgeStyle.background,
                          color: badgeStyle.color
                        }}>
                          {displayRole}
                        </span>
                      );
                    })()}
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
                        onClick={() => setDeleteConfirmUser(user)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && document.body && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#1e293b' }}>Confirm Deletion</h3>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.5, marginBottom: '24px' }}>
              Are you sure you want to delete <span style={{ fontWeight: 700, color: '#1e293b' }}>{deleteConfirmUser.full_name || deleteConfirmUser.name || deleteConfirmUser.email || 'this user'}</span>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setDeleteConfirmUser(null)}
                style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    const res = await adminApi.deleteUser(deleteConfirmUser.id);
                    if (res.success) {
                      setUsers(prev => prev.filter(u => u.id !== deleteConfirmUser.id));
                      setSelectedUserIds(prev => prev.filter(id => id !== deleteConfirmUser.id));
                      toast.success('User deleted successfully');
                    } else {
                      toast.error(res.message || 'Failed to delete user');
                    }
                  } catch (err) {
                    toast.error('Error deleting user');
                  }
                  setDeleteConfirmUser(null);
                }}
                style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && document.body && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#1e293b' }}>Confirm Bulk Deletion</h3>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.5, marginBottom: '24px' }}>
              Are you sure you want to delete <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedUserIds.length} selected users</span>? This action cannot be undone and will delete all associated applications and notifications.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setBulkDeleteConfirm(false)}
                style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const res = await adminApi.bulkDeleteUsers(selectedUserIds);
                    if (res.success) {
                      setUsers(prev => prev.filter(u => !selectedUserIds.includes(u.id)));
                      toast.success(res.message || 'Users deleted successfully');
                      setSelectedUserIds([]);
                    } else {
                      toast.error(res.message || 'Failed to delete users');
                    }
                  } catch (err) {
                    toast.error('Error deleting users');
                  }
                  setIsLoading(false);
                  setBulkDeleteConfirm(false);
                }}
                style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Delete Users
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Floating Action Bar (HUD) for Bulk operations */}
      {selectedUserIds.length > 0 && document.body && createPortal(
        <>
          <style>{`
            @keyframes slideUp {
              from {
                transform: translate(-50%, 100px);
                opacity: 0;
              }
              to {
                transform: translate(-50%, 0);
                opacity: 1;
              }
            }
          `}</style>
          <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(26, 38, 82, 0.95)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '16px 28px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            zIndex: 9998,
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <span style={{ fontSize: '15px', fontWeight: 700 }}>
              {selectedUserIds.length} {selectedUserIds.length === 1 ? 'user' : 'users'} selected
            </span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSelectedUserIds([])}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              >
                Clear
              </button>
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: '0.2s',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
              >
                <Trash2 size={16} /> Delete Selected
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default AdminUsers;
