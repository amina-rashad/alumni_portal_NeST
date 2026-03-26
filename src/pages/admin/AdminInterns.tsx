import React from 'react';
<<<<<<< Updated upstream
import { Link } from 'react-router-dom';
=======
>>>>>>> Stashed changes
import { 
  Users, UserCheck, School, PieChart, Plus, ChevronDown, 
  Download, Eye, Edit2, MoreHorizontal, ChevronRight
} from 'lucide-react';

const AdminInterns: React.FC = () => {
  const interns = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', college: 'Saintgits', collegeSub: 'tia', collegeSubColor: '#10b981', year: '2023', skills: ['Java', 'React'], perf: '90%', perfColor: '#10b981', avatar: 'J', avatarBg: '#ef4444' },
    { id: 2, name: 'Rahul Nair', email: 'rahul.nair@xample.com', college: 'Rajagiri', collegeSub: 'na', collegeSubColor: '#3b82f6', year: '2024', skills: ['Python', 'SQL'], perf: '75%', perfColor: '#f59e0b', avatarBg: '#3b82f6' },
    { id: 3, name: 'Alan Mathew', email: 'alan.mathew@example.com', college: 'Mar Athanasius', collegeSub: 'Python', collegeSubColor: '#10b981', year: '2023', skills: ['Node.js', 'MongoDB'], perf: '85%', perfColor: '#10b981', avatarBg: '#10b981' },
    { id: 4, name: 'Maya Prasad', email: 'maya.prasad@example.com', college: 'Amal Jyothi', collegeSub: 'React', collegeSubColor: '#3b82f6', year: '2022', skills: ['React', 'Python'], perf: '60%', perfColor: '#f59e0b', avatarBg: '#8b5cf6' },
    { id: 5, name: 'Karthik Kumar', email: 'john.doe@example.com', college: 'MACFAST', collegeSub: 'Java', collegeSubColor: '#10b981', year: '2024', skills: ['JavaScript', 'TypeScript'], perf: '92%', perfColor: '#10b981', avatarBg: '#06b6d4' },
    { id: 6, name: 'Ajith Menon', email: 'rahul.nesa@example.com', college: 'Saintgits', collegeSub: 'Java', collegeSubColor: '#f59e0b', year: '2024', skills: ['Java', 'Angular'], perf: '83%', perfColor: '#10b981', avatarBg: '#3b82f6' },
    { id: 7, name: 'Rahul Nair', email: 'john.doe@example.com', college: 'Saintgits', collegeSub: 'Java', collegeSubColor: '#10b981', year: '2024', skills: ['Java', 'React'], perf: '90%', perfColor: '#10b981', avatarBg: '#3b82f6' },
  ];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Intern Management</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Track and manage all your interns in one place.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Stat Cards */}
        <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
          {/* Total Interns */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
               <Users size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>235</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Total <span style={{ color: '#10b981', fontWeight: 600 }}>+12.6%</span></div>
            </div>
          </div>

          {/* Active Interns */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '12px', color: '#0ea5e9' }}>
               <UserCheck size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>186</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Active <span style={{ color: '#10b981', fontWeight: 600 }}>+9.8%</span></div>
            </div>
          </div>

          {/* Top College */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '12px', color: '#8b5cf6' }}>
               <School size={24} />
            </div>
            <div>
               <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Saintgits</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Top College</div>
            </div>
          </div>

          {/* Top Skill */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
               <PieChart size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>87</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Java · 30%</div>
            </div>
          </div>
        </div>

        {/* Action Buttons right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '140px' }}>
<<<<<<< Updated upstream
          <Link to="/admin/interns/add" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', 
              borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(59, 130, 246, 0.2)',
              width: '100%'
            }}>
              <Plus size={18} />
              Add Intern
            </button>
          </Link>
=======
          <button style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
            background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', 
            borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(59, 130, 246, 0.2)'
          }}>
            <Plus size={18} />
            Add Intern
          </button>
>>>>>>> Stashed changes
          <button style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            background: '#fff', border: '1px solid #e2e8f0', padding: '10px 14px', 
            borderRadius: '12px', fontSize: '14px', fontWeight: 500, color: '#475569', 
            cursor: 'pointer'
          }}>
            Filter <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e2e8f0', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
            Bulk Actions <ChevronDown size={14} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', padding: '8px 12px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
            College <ChevronDown size={14} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', padding: '8px 12px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
            Year <ChevronDown size={14} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', padding: '8px 12px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
            All <ChevronDown size={14} />
          </button>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
          <Download size={16} /> Export
        </button>
      </div>

      {/* Data Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '16px', width: '48px' }}>
                <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }} />
              </th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Name</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>College</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Year</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Skills</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Performance</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                   Status <MoreHorizontal size={14} color="#94a3b8" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {interns.map((intern, index) => (
              <tr key={intern.id} style={{ borderBottom: index !== interns.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s', ...({ ':hover': { background: '#f8fafc' } } as any) }}>
                <td style={{ padding: '16px' }}>
                  <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      background: intern.avatarBg, color: '#fff', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600 
                    }}>
                      <img src={`https://ui-avatars.com/api/?name=${intern.name.replace(' ', '+')}&background=${intern.avatarBg.replace('#', '')}&color=fff`} style={{width: '40px', height: '40px', borderRadius: '50%'}} alt={intern.name} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{intern.name}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{intern.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{intern.college}</div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <div style={{ width: '12px', height: '8px', borderRadius: '2px', background: intern.collegeSubColor }}></div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{intern.collegeSub}</span>
                   </div>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                  {intern.year}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                     {intern.skills.map(skill => (
                       <span key={skill} style={{ 
                         padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                         background: skill === 'Java' ? '#e0f2fe' : skill === 'React' ? '#e0e7ff' : skill === 'Python' ? '#ffedd5' : skill === 'Node.js' ? '#dcfce7' : skill === 'JavaScript' ? '#fef3c7' : '#f1f5f9',
                         color: skill === 'Java' ? '#0369a1' : skill === 'React' ? '#4338ca' : skill === 'Python' ? '#c2410c' : skill === 'Node.js' ? '#15803d' : skill === 'JavaScript' ? '#b45309' : '#475569'
                       }}>
                         {skill}
                       </span>
                     ))}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                       <svg width="20" height="20" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="8" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                          <circle cx="10" cy="10" r="8" fill="none" stroke={intern.perfColor} strokeWidth="3" strokeDasharray={`${parseFloat(intern.perf) * 0.5} 50`} strokeLinecap="round" transform="rotate(-90 10 10)" />
                       </svg>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{intern.perf}</span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }} title="View">
                      <Eye size={18} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }} title="More">
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
            <button style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
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

export default AdminInterns;
