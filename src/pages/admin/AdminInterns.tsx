import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Briefcase, Plus, ChevronDown, 
  Edit2, Trash2, MoreVertical, Search, Filter, X, Check, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminInterns: React.FC = () => {
  const navigate = useNavigate();
  const [interns, setInterns] = useState<any[]>([]);
  const [filteredInterns, setFilteredInterns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  const fetchInterns = async () => {
    setIsLoading(true);
    const res = await adminApi.getAllUsers();
    if (res.success && res.data) {
      // Filter for interns
      const filtered = res.data.users.filter((u: any) => u.user_type === 'Intern');
      setInterns(filtered);
      setFilteredInterns(filtered);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  useEffect(() => {
    let result = interns;

    if (searchQuery) {
      result = result.filter(u => 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(u => statusFilter === 'Active' ? u.is_active : !u.is_active);
    }

    if (batchFilter !== 'All') {
      result = result.filter(u => u.batch === batchFilter);
    }

    setFilteredInterns(result);
  }, [searchQuery, statusFilter, batchFilter, interns]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await adminApi.updateUser(id, { is_active: !currentStatus });
    if (res.success) {
      fetchInterns();
    }
  };

  const handleDeleteIntern = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the intern account for ${name}?`)) {
      const res = await adminApi.deleteUser(id);
      if (res.success) {
        fetchInterns();
      }
    }
  };

  const batches = Array.from(new Set(interns.map(i => i.batch))).filter(Boolean).sort().reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100%' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>Intern Management</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: 500 }}>Management and oversight of the institutional internship program.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/users/add')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: nestNavy, color: '#fff', border: 'none', 
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', 
            fontWeight: 700, cursor: 'pointer', transition: '0.2s',
            boxShadow: '0 4px 12px rgba(26, 38, 82, 0.15)'
          }}
        >
          <Plus size={18} /> Add New Intern
        </button>
      </div>

      {/* Stats and Search Overlay */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', padding: '12px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ background: 'rgba(26, 38, 82, 0.05)', color: nestNavy, padding: '10px', borderRadius: '12px' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{interns.length}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Interns</div>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 16px 14px 48px', borderRadius: '16px', 
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px',
              background: '#fff', color: '#1e293b', fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
              transition: '0.2s'
            }} 
          />
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: showFilters ? nestNavy : '#fff', 
              color: showFilters ? '#fff' : '#475569', 
              border: '1px solid #e2e8f0', 
              padding: '14px 20px', borderRadius: '16px', 
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              transition: '0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
          >
            <Filter size={18} /> Filters {(statusFilter !== 'All' || batchFilter !== 'All') && '•'}
          </button>

          {showFilters && (
            <div className="glass-morphism" style={{ 
              position: 'absolute', top: 'calc(100% + 12px)', right: 0, 
              width: '280px', padding: '24px', borderRadius: '20px', 
              zIndex: 100, border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Filters</h3>
                <button onClick={() => { setStatusFilter('All'); setBatchFilter('All'); }} style={{ background: 'none', border: 'none', color: nestRed, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Reset All</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', cursor: 'pointer' }}>
                    <option value="All">All Status</option>
                    <option value="Active">Active Only</option>
                    <option value="Inactive">Inactive Only</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Batch</label>
                  <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', cursor: 'pointer' }}>
                    <option value="All">All Batches</option>
                    {batches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
            Displaying {filteredInterns.length} interns
          </div>
          <button onClick={fetchInterns} style={{ background: 'none', border: 'none', color: nestNavy, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intern Identity</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch / Session</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specialization</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ color: nestNavy, fontWeight: 700, fontSize: '16px' }}>Synchronizing data...</div>
                  </td>
                </tr>
              ) : filteredInterns.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '16px' }}>No interns found matching your criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredInterns.map((intern, idx) => (
                  <tr key={intern.id} style={{ borderBottom: idx === filteredInterns.length - 1 ? 'none' : '1px solid #f8fafc', transition: '0.2s' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ 
                          width: '44px', height: '44px', borderRadius: '16px', 
                          background: `linear-gradient(135deg, ${nestNavy} 0%, #2a3b7d 100%)`, 
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '15px', fontWeight: 800, boxShadow: '0 4px 10px rgba(26, 38, 82, 0.15)'
                        }}>
                          {intern.full_name?.charAt(0) || 'I'}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{intern.full_name}</div>
                          <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>{intern.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>Class of {intern.batch || 'TBD'}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{intern.specialization || 'Not Specified'}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div 
                        onClick={() => handleToggleStatus(intern.id, intern.is_active)}
                        style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                          background: intern.is_active ? '#dcfce7' : '#fee2e2',
                          color: intern.is_active ? '#16a34a' : '#ef4444',
                          cursor: 'pointer', transition: '0.2s'
                        }}
                      >
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                        {intern.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          onClick={() => navigate(`/admin/users/edit/${intern.id}`)}
                          style={{ 
                            background: '#f8fafc', border: '1px solid #e2e8f0', 
                            padding: '10px', borderRadius: '10px', color: '#64748b', 
                            cursor: 'pointer', transition: '0.2s' 
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteIntern(intern.id, intern.full_name)}
                          style={{ 
                            background: '#fff1f2', border: '1px solid #fecdd3', 
                            padding: '10px', borderRadius: '10px', color: '#e11d48', 
                            cursor: 'pointer', transition: '0.2s' 
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .glass-morphism {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  );
};

export default AdminInterns;

