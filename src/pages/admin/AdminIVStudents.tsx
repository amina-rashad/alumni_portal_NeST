import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, Users, Building, GraduationCap, Plus, ChevronDown, 
  Download, Edit2, Trash2, Search, Filter, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminIVStudents: React.FC = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<any[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [specFilter, setSpecFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  const fetchVisits = async () => {
    setIsLoading(true);
    const res = await adminApi.getVisits();
    if (res.success && res.data) {
      setVisits(res.data.visits);
      setFilteredVisits(res.data.visits);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  useEffect(() => {
    let result = visits;

    if (searchQuery) {
      result = result.filter(v => 
        v.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.coordinator_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (batchFilter !== 'All') {
      result = result.filter(v => v.batch === batchFilter);
    }

    if (collegeFilter !== 'All') {
      result = result.filter(v => v.college === collegeFilter);
    }

    if (specFilter !== 'All') {
      result = result.filter(v => (v.branch === specFilter || v.specialization === specFilter));
    }

    setFilteredVisits(result);
  }, [searchQuery, batchFilter, collegeFilter, specFilter, visits]);

  const handleDelete = async (id: string, college: string) => {
    if (window.confirm(`Are you sure you want to delete the visit record for ${college}?`)) {
      const res = await adminApi.deleteVisit(id);
      if (res.success) {
        fetchVisits();
      }
    }
  };

  const resetAll = () => {
    setSearchQuery('');
    setBatchFilter('All');
    setCollegeFilter('All');
    setSpecFilter('All');
  };

  const batches = Array.from(new Set(visits.map(v => v.batch))).filter(Boolean).sort().reverse();
  const colleges = Array.from(new Set(visits.map(v => v.college))).filter(Boolean).sort();
  const specializations = Array.from(new Set(visits.map(v => v.branch || v.specialization))).filter(Boolean).sort();

  const activeFiltersCount = (batchFilter !== 'All' ? 1 : 0) + (collegeFilter !== 'All' ? 1 : 0) + (specFilter !== 'All' ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100%' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a2652', margin: 0 }}>IV Management</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: 500 }}>Management and scheduling of institutional Industrial Visits.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/iv-students/add')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: nestNavy, color: '#fff', border: 'none', 
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', 
            fontWeight: 700, cursor: 'pointer', transition: '0.2s',
            boxShadow: '0 4px 12px rgba(26, 38, 82, 0.15)'
          }}
        >
          <Plus size={18} /> Schedule New Visit
        </button>
      </div>

      {/* Stats and Search Overlay */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', padding: '12px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ background: 'rgba(200, 16, 46, 0.05)', color: nestRed, padding: '10px', borderRadius: '12px' }}>
            <CalendarDays size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{visits.length}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Visits</div>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search college, department, coordinator..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 44px 14px 48px', borderRadius: '16px', 
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px',
              background: '#fff', color: '#1e293b', fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }} 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
            >
              <Trash2 size={16} />
            </button>
          )}
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
              fontSize: '14px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            <Filter size={18} /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>

          {showFilters && (
            <div className="glass-morphism" style={{ 
              position: 'absolute', top: 'calc(100% + 12px)', right: 0, 
              width: '280px', padding: '24px', borderRadius: '24px', 
              zIndex: 100, border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Batch / Year</label>
                <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', cursor: 'pointer', fontSize: '13px' }}>
                  <option value="All">All Batches</option>
                  {batches.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Institution</label>
                <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', cursor: 'pointer', fontSize: '13px' }}>
                  <option value="All">All Colleges</option>
                  {colleges.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Specialization</label>
                <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', cursor: 'pointer', fontSize: '13px' }}>
                  <option value="All">All Departments</option>
                  {specializations.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <button 
                onClick={resetAll} 
                style={{ width: '100%', background: '#fff1f2', border: `1px solid #fecdd3`, color: nestRed, padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Displaying {filteredVisits.length} visits</div>
          <button onClick={fetchVisits} style={{ background: 'none', border: 'none', color: nestNavy, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visit Date</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>College / Specialization</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Students</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coordinator</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ padding: '80px', textAlign: 'center', color: nestNavy, fontWeight: 700 }}>Loading industrial visits...</td></tr>
              ) : filteredVisits.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>No visit records found.</td></tr>
              ) : (
                filteredVisits.map((visit, idx) => (
                  <tr key={visit.id} style={{ borderBottom: idx === filteredVisits.length - 1 ? 'none' : '1px solid #f8fafc', transition: '0.2s' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{visit.date}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{visit.time || 'TBD'}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{visit.college}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{visit.branch || visit.specialization}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>Year {visit.batch || '—'}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.05)', color: nestNavy, fontSize: '13px', fontWeight: 700 }}>
                        {visit.students_count} Students
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{visit.coordinator_name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{visit.coordinator_email}</div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(visit.id, visit.college)} style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '10px', borderRadius: '10px', color: '#e11d48', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
        .glass-morphism { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
      `}</style>
    </div>
  );
};

export default AdminIVStudents;

