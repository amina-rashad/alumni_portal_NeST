import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, Users, Building, GraduationCap, Plus, ChevronDown, 
  Download, Eye, Edit2, MoreHorizontal, ChevronRight, Search
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminIVStudents: React.FC = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const nestNavy = '#1a2652';

  useEffect(() => {
    const fetchVisits = async () => {
      setIsLoading(true);
      const res = await adminApi.getVisits();
      if (res.success && res.data) {
        setVisits(res.data.visits);
      }
      setIsLoading(false);
    };
    fetchVisits();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this visit record?')) {
      const res = await adminApi.deleteVisit(id);
      if (res.success) {
        setVisits(visits.filter(v => v.id !== id));
      }
    }
  };


  const colleges = Array.from(new Set(visits.map(v => v.college)));
  const years = Array.from(new Set(visits.map(v => v.year))).sort().reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>IV Student Management</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>Track and manage visits from various colleges in one place.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fce7f3', padding: '12px', borderRadius: '12px', color: '#be185d' }}>
               <CalendarDays size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{visits.length}</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Total Visits</div>
            </div>
          </div>
          <div style={{ flex: 2 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '140px' }}>
          <Link to="/admin/iv-students/add" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              background: nestNavy, color: '#fff', border: 'none', padding: '14px 24px', 
              borderRadius: '14px', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
              width: '100%', boxShadow: '0 8px 24px rgba(26, 38, 82, 0.2)'
            }}>
              <Plus size={20} />
              Add Visit
            </button>
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading visits...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Date</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>College / Branch</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Students</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Coordinator</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Notes</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No visits scheduled.</td>
                </tr>
              ) : visits.map((visit, index) => (
                <tr key={visit.id} style={{ borderBottom: index !== visits.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '16px' }}>{visit.date}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{visit.college}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{visit.branch}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{visit.students_count}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>{visit.coordinator_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{visit.coordinator_email}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#475569', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{visit.notes}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} title="View"><Eye size={18} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete" onClick={() => handleDelete(visit.id)}><MoreHorizontal size={18} /></button>
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

export default AdminIVStudents;
