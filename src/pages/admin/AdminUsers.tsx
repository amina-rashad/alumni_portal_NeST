import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, 
  Eye, Edit2, MoreHorizontal, UserPlus, FileSpreadsheet, Trash2, RefreshCw,
  UserCheck, UserX, X, CheckCircle2
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

  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<{
    userName: string;
    userEmail: string;
    newStatus: boolean;
  } | null>(null);

  useEffect(() => {
    if (statusNotification) {
      const timer = setTimeout(() => {
        setStatusNotification(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [statusNotification]);

  const handleToggleStatus = async (user: any) => {
    if (statusUpdatingId) return;
    const currentActive = user.is_active !== false;
    const newStatus = !currentActive;
    setStatusUpdatingId(user.id);

    try {
      const res = await adminApi.updateUser(user.id, { is_active: newStatus });
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
        setStatusNotification({
          userName: user.full_name || user.email,
          userEmail: user.email,
          newStatus: newStatus
        });
        toast.success(`User status updated to ${newStatus ? 'Active' : 'Inactive'}`);
      } else {
        toast.error(res.message || 'Failed to update user status');
      }
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

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
    const normalizedType = user.user_type?.toLowerCase()?.trim();
    if (normalizedType === 'industrial student' || normalizedType === 'iv student' || normalizedType === 'iv students') return 'IV Student';
    if (normalizedType === 'intern' || normalizedType === 'interns') return 'Intern';
    if (normalizedType === 'trainee' || normalizedType === 'trainees') return 'Trainee';
    if (normalizedType === 'alumni') return 'Alumni';
    if (normalizedType === 'applicant' || normalizedType === 'applicants' || !user.user_type) return 'Applicant';
    return user.user_type || 'Applicant';
  };

  const isStaffRole = (role: string) => {
    return ['super_admin', 'admin', 'event_manager', 'course_manager', 'job_recruiter'].includes(role);
  };

  const getRoleBadgeStyle = (displayRole: string) => {
    switch (displayRole) {
      case 'Applicant':
        return { background: '#fef3c7', color: '#b45309' }; // Amber badge for direct applicants
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
        return { background: '#fef3c7', color: '#b45309' };
    }
  };

  const filteredUsers = users.filter(user => {
    // 1. Search filter
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    // 2. Category filter based on normalized display role
    const displayRole = getDisplayRole(user);
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Applicants') return displayRole === 'Applicant';
    if (selectedCategory === 'Staff') return displayRole === 'Staff';
    if (selectedCategory === 'Alumni') return displayRole === 'Alumni';
    if (selectedCategory === 'IV Students') return displayRole === 'IV Student';
    if (selectedCategory === 'Interns') return displayRole === 'Intern';
    if (selectedCategory === 'Trainees') return displayRole === 'Trainee';
    return true;
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
            {['All', 'Applicants', 'Alumni', 'IV Students', 'Interns', 'Trainees', 'Staff'].map((cat) => {
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
          <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                    {(() => {
                      const isActive = user.is_active !== false;
                      const isUpdating = statusUpdatingId === user.id;
                      return (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(user);
                          }}
                          disabled={isUpdating}
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            background: isActive ? '#dcfce7' : '#fee2e2',
                            color: isActive ? '#15803d' : '#b91c1c',
                            border: `1px solid ${isActive ? '#86efac' : '#fca5a5'}`,
                            cursor: isUpdating ? 'wait' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            opacity: isUpdating ? 0.7 : 1,
                            userSelect: 'none'
                          }}
                          title={`Click to switch status to ${isActive ? 'Inactive' : 'Active'}`}
                          onMouseEnter={(e) => { 
                            if (!isUpdating) {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.1)';
                            }
                          }}
                          onMouseLeave={(e) => { 
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                          }}
                        >
                          {isUpdating ? (
                            <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                          ) : (
                            <span style={{ 
                              width: '7px', 
                              height: '7px', 
                              borderRadius: '50%', 
                              background: isActive ? '#16a34a' : '#ef4444',
                              boxShadow: isActive ? '0 0 6px rgba(22, 163, 74, 0.6)' : '0 0 6px rgba(239, 68, 68, 0.6)'
                            }} />
                          )}
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      );
                    })()}
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
          </div>
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

      {/* Status Change Notification Pop Up */}
      {document.body && createPortal(
        <>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes notificationProgress {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
          <AnimatePresence>
            {statusNotification && (
              <motion.div
                initial={{ opacity: 0, y: -24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  top: '24px',
                  right: '24px',
                  zIndex: 99999,
                  width: 'calc(100% - 48px)',
                  maxWidth: '430px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(15, 23, 42, 0.08)',
                  overflow: 'hidden',
                  border: `1px solid ${statusNotification.newStatus ? '#bbf7d0' : '#fecaca'}`
                }}
              >
                {/* Top Accent Strip */}
                <div 
                  style={{ 
                    height: '4px', 
                    width: '100%', 
                    background: statusNotification.newStatus ? '#16a34a' : '#ef4444' 
                  }} 
                />
                
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    {/* Status Icon */}
                    <div 
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: statusNotification.newStatus ? '#dcfce7' : '#fee2e2',
                        color: statusNotification.newStatus ? '#15803d' : '#b91c1c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: statusNotification.newStatus 
                          ? '0 4px 12px rgba(22, 163, 74, 0.2)' 
                          : '0 4px 12px rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      {statusNotification.newStatus ? (
                        <UserCheck size={22} strokeWidth={2.2} />
                      ) : (
                        <UserX size={22} strokeWidth={2.2} />
                      )}
                    </div>

                    {/* Body Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          letterSpacing: '0.6px', 
                          textTransform: 'uppercase',
                          color: statusNotification.newStatus ? '#15803d' : '#b91c1c'
                        }}>
                          Status Notification
                        </span>
                        <button
                          onClick={() => setStatusNotification(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            borderRadius: '6px',
                            transition: 'color 0.15s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#1e293b')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          title="Dismiss"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <h4 style={{ 
                        margin: '0 0 6px 0', 
                        fontSize: '15px', 
                        fontWeight: 700, 
                        color: '#0f172a' 
                      }}>
                        {statusNotification.newStatus ? 'Account Marked Active' : 'Account Marked Inactive'}
                      </h4>

                      <p style={{ 
                        margin: '0 0 14px 0', 
                        fontSize: '13px', 
                        color: '#475569', 
                        lineHeight: 1.45 
                      }}>
                        User <strong style={{ color: '#0f172a' }}>{statusNotification.userName}</strong> ({statusNotification.userEmail}) is now{' '}
                        <span style={{ 
                          fontWeight: 700, 
                          color: statusNotification.newStatus ? '#15803d' : '#b91c1c' 
                        }}>
                          {statusNotification.newStatus ? 'Active' : 'Inactive'}
                        </span>.
                        {statusNotification.newStatus 
                          ? ' User can now log in and access authorized portal features.' 
                          : ' User login is now blocked and account access is suspended.'}
                      </p>

                      {/* Bottom action info */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: statusNotification.newStatus ? '#f0fdf4' : '#fef2f2',
                          color: statusNotification.newStatus ? '#166534' : '#991b1b',
                          border: `1px solid ${statusNotification.newStatus ? '#bbf7d0' : '#fecaca'}`
                        }}>
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            background: statusNotification.newStatus ? '#16a34a' : '#ef4444' 
                          }} />
                          Current: {statusNotification.newStatus ? 'Active' : 'Inactive'}
                        </span>

                        <button
                          onClick={() => setStatusNotification(null)}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            color: '#475569',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Countdown Bar */}
                <div style={{ width: '100%', height: '3px', background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: statusNotification.newStatus ? '#16a34a' : '#ef4444',
                    animation: 'notificationProgress 4.5s linear forwards'
                  }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  );
};

export default AdminUsers;
