import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, Plus, UserPlus,
  Eye, Edit2, MoreHorizontal,
  ChevronDown, Filter
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminUsers: React.FC = () => {
  const nestNavy = '#1a2652';
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  
  const filterRef = useRef<HTMLDivElement>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle outside click for filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]);

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       user.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesIdentity = roleFilter === 'All' || user.user_type === roleFilter;
    const matchesStatus = statusFilter === 'All' || (user.is_active ? 'Active' : 'Inactive') === statusFilter;
    
    return matchesSearch && matchesIdentity && matchesStatus;
  });

  const handleToggleStatus = async (user: any) => {
    const newStatus = !user.is_active;
    const res = await adminApi.updateUser(user.id, { is_active: newStatus });
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (window.confirm(`Are you sure you want to delete ${user.full_name}? This action cannot be undone.`)) {
      const res = await adminApi.deleteUser(user.id);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
      }
    }
  };

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                fontWeight: 600,
                background: 'transparent'
              }} 
            />
          </div>

          {/* Filter Button */}
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: isFilterOpen ? '#f1f5f9' : '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                color: '#475569',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'background 0.2s'
              }}
            >
              <Filter size={18} /> 
              Filters
              {(roleFilter !== 'All' || statusFilter !== 'All' || skillFilter !== '' || experienceFilter !== '') && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginLeft: '4px' }}></div>
              )}
            </button>

            {/* Filter Dropdown Modal */}
            {isFilterOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '320px',
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                boxShadow: '0 12px 32px rgba(31, 38, 135, 0.1)',
                padding: '24px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <style>{`
                  .glass-select {
                    appearance: none;
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    color: #1e293b;
                    outline: none;
                    transition: all 0.3s ease;
                    box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.3);
                  }
                  .glass-select:hover {
                    background: rgba(255, 255, 255, 0.5);
                    border-color: rgba(255, 255, 255, 0.8);
                  }
                  .glass-select:focus {
                    background: rgba(255, 255, 255, 0.6);
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), inset 0 2px 6px rgba(255, 255, 255, 0.4);
                  }
                  .glass-select-container {
                    position: relative;
                  }
                  .glass-select-icon {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease;
                    color: #64748b;
                  }
                  .glass-select:focus + .glass-select-icon {
                    transform: translateY(-50%) rotate(180deg);
                    color: #2563eb;
                  }
                  .glass-select option {
                    background: #fff;
                    color: #1e293b;
                  }
                `}</style>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '15px' }}>Filter Users</span>
                  <span 
                    onClick={() => {
                      setRoleFilter('All');
                      setStatusFilter('All');
                      setSkillFilter('');
                      setExperienceFilter('');
                    }}
                    style={{ fontSize: '13px', color: '#2563eb', cursor: 'pointer', fontWeight: 800 }}
                  >
                    Reset All
                  </span>
                </div>

                <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '-4px 0', borderBottom: '1px solid rgba(255,255,255,0.4)' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Identity</label>
                  <div className="glass-select-container">
                    <select className="glass-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', paddingRight: '36px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
                      <option value="All">All Identities</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Intern">Intern</option>
                      <option value="Industrial Student">IV Student</option>
                      <option value="Staff">Staff</option>
                      <option value="Trainee">Trainee</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <ChevronDown className="glass-select-icon" size={16} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Status</label>
                  <div className="glass-select-container">
                    <select className="glass-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', paddingRight: '36px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown className="glass-select-icon" size={16} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Primary Skills</label>
                  <div className="glass-select-container">
                    <select className="glass-select" value={skillFilter} onChange={e => setSkillFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', paddingRight: '36px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
                      <option value="">Any Skill</option>
                      <option value="React">React / React Native</option>
                      <option value="Node.js">Node.js</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java / Spring</option>
                      <option value="C++">C++</option>
                      <option value="Angular">Angular</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Data Analysis">Data Science / Analysis</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Project Management">Project Management</option>
                    </select>
                    <ChevronDown className="glass-select-icon" size={16} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Years of Experience</label>
                  <div className="glass-select-container">
                    <select className="glass-select" value={experienceFilter} onChange={e => setExperienceFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', paddingRight: '36px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
                      <option value="">Any Experience</option>
                      <option value="0-2">0 - 2 years</option>
                      <option value="3-5">3 - 5 years</option>
                      <option value="6-10">6 - 10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                    <ChevronDown className="glass-select-icon" size={16} />
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'visible' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading users...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '16px', width: '48px' }}>
                  <div style={{ width: '18px', height: '18px', border: '2px solid #cbd5e1', borderRadius: '4px' }}></div>
                </th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#475569' }}>Name</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#475569' }}>Email</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#475569' }}>Identity</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#475569' }}>Status</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: index !== filteredUsers.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ width: '18px', height: '18px', border: '2px solid #cbd5e1', borderRadius: '4px' }}></div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '50%', 
                        background: '#3b82f6', 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 700,
                        boxShadow: '0 2px 6px rgba(59, 130, 246, 0.2)'
                      }}>
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{user.full_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '999px', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      textTransform: 'capitalize'
                    }}>
                      {user.user_type || user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '999px', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      background: user.is_active ? '#eff6ff' : '#fef2f2',
                      color: user.is_active ? '#2563eb' : '#dc2626',
                      border: user.is_active ? '1px solid #dbeafe' : '1px solid #fee2e2'
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button 
                         onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                         style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s' }}
                         onMouseEnter={e => e.currentTarget.style.color = nestNavy}
                         onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                         title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      
                      <div style={{ position: 'relative' }}>
                        <button 
                          onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = nestNavy}
                          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                          title="More"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        
                        {activeMenu === user.id && (
                          <div 
                            ref={menuRef}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              width: '180px',
                              background: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                              zIndex: 100,
                              overflow: 'hidden',
                              marginTop: '8px'
                            }}
                          >
                            <button 
                              onClick={() => { handleToggleStatus(user); setActiveMenu(null); }}
                              style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: 500, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              {user.is_active ? 'Deactivate User' : 'Activate User'}
                            </button>
                            <div style={{ height: '1px', background: '#f1f5f9' }}></div>
                            <button 
                              onClick={() => { handleDeleteUser(user); setActiveMenu(null); }}
                              style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: 500, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              Delete Account
                            </button>
                          </div>
                        )}
                      </div>
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
