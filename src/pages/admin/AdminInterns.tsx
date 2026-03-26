import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, Briefcase, Plus, ChevronDown, 
  Eye, Edit2, MoreHorizontal, ChevronRight, Search, Laptop
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminInterns: React.FC = () => {
  const [interns, setInterns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterns = async () => {
      setIsLoading(true);
      const res = await adminApi.getAllUsers();
      if (res.success && res.data) {
        // Filter for interns
        const filtered = res.data.users.filter((u: any) => u.user_type === 'Intern');
        setInterns(filtered);
      }
      setIsLoading(false);
    };
    fetchInterns();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Intern Management</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>Onboard and track interns from various institutional partners.</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flex: 1, gap: '20px' }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ background: 'rgba(26, 38, 82, 0.08)', padding: '12px', borderRadius: '16px', color: nestNavy }}>
               <Users size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{interns.length}</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Total Interns</div>
            </div>
          </div>

          <div style={{ flex: 2 }} />
        </div>

        <div style={{ minWidth: '160px' }}>
          <Link to="/admin/interns/add" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              background: nestNavy, color: '#fff', border: 'none', padding: '14px 24px', 
              borderRadius: '14px', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
              width: '100%', boxShadow: '0 8px 24px rgba(26, 38, 82, 0.2)'
            }}>
              <Plus size={20} />
              Add Intern
            </button>
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading interns...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '16px', width: '48px' }}>
                  <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                </th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Name</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>College / Batch</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Specialization</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Status</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interns.map((intern, index) => (
                <tr key={intern.id} style={{ borderBottom: index !== interns.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '16px' }}>
                    <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        background: '#10b981', color: '#fff', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 600 
                      }}>
                        {intern.full_name?.charAt(0) || 'I'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{intern.full_name}</div>
                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>{intern.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                     <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>Batch: {intern.batch}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                    {intern.specialization}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      background: intern.is_active ? '#dcfce7' : '#fee2e2',
                      color: intern.is_active ? '#16a34a' : '#ef4444'
                    }}>
                      {intern.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

export default AdminInterns;
