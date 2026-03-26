import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Users, Code, Plus, ChevronDown, 
  Download, Eye, Edit2, MoreHorizontal, ChevronRight,
  Search, Calendar, Folder, Cloud, Terminal, Server, Wifi, Layout, UserCircle
} from 'lucide-react';

const AdminJobs: React.FC = () => {
  const jobs = [
    { id: 1, title: 'Java Developer', sub: 'Engineering | Solvare Development', date: 'May 25, 2024', applicants: 47, statusText: 'Active', statusPill: 'Active', iconType: 'folder', iconColor: '#f59e0b', iconBg: '#fef3c7' },
    { id: 2, title: 'Data Analyst', sub: 'Marketing | Data Science', date: 'Apr 18, 2024', applicants: 35, statusText: 'Active', statusPill: 'Active', iconType: 'brain', iconColor: '#3b82f6', iconBg: '#eff6ff' },
    { id: 3, title: 'UI/UX Designer', sub: 'Figma | Adobe XD', date: 'May 20, 2024', applicants: 24, statusText: 'Active', statusPill: 'Active', iconType: 'layout', iconColor: '#3b82f6', iconBg: '#eff6ff' },
    { id: 4, title: 'Network Engineer', sub: 'IT | Networking | Linux', date: 'May 18, 2024', applicants: 16, statusText: 'Active', statusPill: 'Active', iconType: 'cloud', iconColor: '#10b981', iconBg: '#ecfdf5' },
    { id: 5, title: 'Frontend Developer', sub: 'Engineering | Web Development', date: 'May 12, 2024', applicants: 56, statusText: 'Active', statusPill: 'Active', iconType: 'terminal', iconColor: '#3b82f6', iconBg: '#eff6ff' },
    { id: 6, title: 'DevOps Engineer', sub: 'MVS | Docker | Jenkins', date: 'May 10, 2024', applicants: 29, statusText: 'Active', statusPill: 'Active', iconType: 'server', iconColor: '#10b981', iconBg: '#ecfdf5' },
    { id: 7, title: 'Rahul Nair', sub: 'Java | React | Java', date: 'Mar 25, 2024', applicants: 29, statusText: 'Active', statusPill: 'Active', iconType: 'wifi', iconColor: '#3b82f6', iconBg: '#eff6ff' },
  ];

  const getIcon = (type: string, color: string) => {
    switch(type) {
      case 'folder': return <Folder size={18} color={color} />;
      case 'brain': return <UserCircle size={18} color={color} />;
      case 'layout': return <Layout size={18} color={color} />;
      case 'cloud': return <Cloud size={18} color={color} />;
      case 'terminal': return <Terminal size={18} color={color} />;
      case 'server': return <Server size={18} color={color} />;
      case 'wifi': return <Wifi size={18} color={color} />;
      default: return <Briefcase size={18} color={color} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Job Management</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Track and manage visits from various colleges in one place.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Stat Cards */}
        <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
          {/* Active Jobs */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', color: '#f59e0b' }}>
               <Briefcase size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>28</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Active <span style={{ color: '#10b981', fontWeight: 600 }}>+6.5%</span></div>
            </div>
          </div>

          {/* Total Hires */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
               <Users size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>1,570</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Total Hires <span style={{ color: '#10b981', fontWeight: 600 }}>+8.2%</span></div>
            </div>
          </div>

          {/* In-Demand Role */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '12px', color: '#ef4444' }}>
               <Code size={24} />
            </div>
            <div>
               <div style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>Java Developer</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>In-Demand Role</div>
            </div>
          </div>
        </div>

        {/* Action Button right col */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/admin/jobs/post" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', 
              borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(59, 130, 246, 0.2)', height: 'fit-content'
            }}>
              <Plus size={18} />
              Post Job
            </button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e2e8f0', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
            Bulk Actions <ChevronDown size={14} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', padding: '8px 12px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
            Status <ChevronDown size={14} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', padding: '8px 12px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
            Visit Date <ChevronDown size={14} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', padding: '8px 12px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
            All <ChevronDown size={14} />
          </button>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            padding: '8px 12px',
            width: '200px',
            marginLeft: '8px'
          }}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search vsits..." 
              style={{ 
                border: 'none', 
                outline: 'none', 
                marginLeft: '8px', 
                width: '100%',
                fontSize: '13px',
                color: '#1e293b',
                background: 'transparent'
              }} 
            />
            <MoreHorizontal size={14} color="#cbd5e1" style={{ cursor: 'pointer' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '16px', width: '48px' }}>
                <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }} />
              </th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Date</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>College</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Students</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}></th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                   Actions <MoreHorizontal size={14} color="#94a3b8" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={job.id} style={{ borderBottom: index !== jobs.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s', ...({ ':hover': { background: '#f8fafc' } } as any) }}>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6', marginTop: '4px' }} />
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '8px', 
                      background: job.iconBg, display: 'flex', 
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      {getIcon(job.iconType, job.iconColor)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{job.title}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{job.sub}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                   <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b', marginTop: '4px' }}>{job.date}</div>
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                     <Calendar size={16} color="#64748b" style={{ marginTop: '2px' }} />
                     <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{job.applicants} <span style={{ fontSize: '10px', color: '#94a3b8', position: 'relative', top: '-4px' }}>o</span></div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Applicants</div>
                     </div>
                  </div>
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                   <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b', marginTop: '4px' }}>{job.statusText}</div>
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                   <div style={{ marginTop: '4px' }}>
                      <span style={{ 
                        background: '#dcfce7', color: '#16a34a', padding: '6px 12px', 
                        borderRadius: '16px', fontSize: '12px', fontWeight: 600 
                      }}>
                         {job.statusPill}
                      </span>
                   </div>
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
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

export default AdminJobs;
