import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Users, Code, Plus, ChevronDown, 
  Eye, Edit2, MoreHorizontal, ChevronRight,
  Search, Calendar, Folder, Cloud, Terminal, Server, Wifi, Layout, UserCircle
} from 'lucide-react';

const AdminJobs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  // NeST NAVY BLUE
  const nestNavy = '#1a2652';

  const jobs = [
    { id: 1, title: 'Java Developer', sub: 'Engineering | Solvare Development', date: 'May 25, 2024', year: '2024', applicants: 47, statusText: 'Active', statusPill: 'Active', iconType: 'folder', iconColor: '#f59e0b', iconBg: '#fef3c7' },
    { id: 2, title: 'Data Analyst', sub: 'Marketing | Data Science', date: 'Apr 18, 2024', year: '2024', applicants: 35, statusText: 'Active', statusPill: 'Active', iconType: 'brain', iconColor: nestNavy, iconBg: 'rgba(26, 38, 82, 0.08)' },
    { id: 3, title: 'UI/UX Designer', sub: 'Figma | Adobe XD', date: 'May 20, 2024', year: '2024', applicants: 24, statusText: 'Active', statusPill: 'Active', iconType: 'layout', iconColor: nestNavy, iconBg: 'rgba(26, 38, 82, 0.08)' },
    { id: 4, title: 'Network Engineer', sub: 'IT | Networking | Linux', date: 'May 18, 2024', year: '2024', applicants: 16, statusText: 'Active', statusPill: 'Active', iconType: 'cloud', iconColor: '#10b981', iconBg: '#ecfdf5' },
    { id: 5, title: 'Frontend Developer', sub: 'Engineering | Web Development', date: 'May 12, 2024', year: '2024', applicants: 56, statusText: 'Active', statusPill: 'Active', iconType: 'terminal', iconColor: nestNavy, iconBg: 'rgba(26, 38, 82, 0.08)' },
    { id: 6, title: 'DevOps Engineer', sub: 'MVS | Docker | Jenkins', date: 'May 10, 2023', year: '2023', applicants: 29, statusText: 'Inactive', statusPill: 'Inactive', iconType: 'server', iconColor: '#64748b', iconBg: '#f1f5f9' },
    { id: 7, title: 'Staff Engineer', sub: 'Java | React | Cloud', date: 'Mar 25, 2023', year: '2023', applicants: 29, statusText: 'Active', statusPill: 'Active', iconType: 'wifi', iconColor: nestNavy, iconBg: 'rgba(26, 38, 82, 0.08)' },
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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.sub.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || job.statusText === statusFilter;
    const matchesYear = yearFilter === 'All' || job.year === yearFilter;
    
    return matchesSearch && matchesStatus && matchesYear;
  });

  const years = Array.from(new Set(jobs.map(j => j.year))).sort().reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Job Management</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>Track and manage your recruitment pipeline and active job postings.</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flex: 1, gap: '20px' }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '16px', color: '#f59e0b' }}>
               <Briefcase size={24} />
            </div>
            <div>
               <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>28</div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Jobs <span style={{ color: '#10b981' }}>+6.5%</span></div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ background: 'rgba(26, 38, 82, 0.08)', padding: '12px', borderRadius: '16px', color: nestNavy }}>
               <Users size={24} />
            </div>
            <div>
               <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>1,570</div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Hires <span style={{ color: '#10b981' }}>+8.2%</span></div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '16px', color: '#ef4444' }}>
               <Code size={24} />
            </div>
            <div>
               <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Java Developer</div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>In-Demand Role</div>
            </div>
          </div>
        </div>

        <div style={{ minWidth: '160px' }}>
          <Link to="/admin/jobs/post" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              background: nestNavy, color: '#fff', border: 'none', padding: '14px 24px', 
              borderRadius: '14px', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
              width: '100%', boxShadow: '0 8px 24px rgba(26, 38, 82, 0.2)'
            }}>
              <Plus size={20} />
              Post Job
            </button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '10px 20px', maxWidth: '400px', width: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by job title or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#1e293b', background: 'transparent', fontWeight: 500 }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '12px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontSize: '13px', fontWeight: 700, cursor: 'pointer', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ padding: '12px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontSize: '13px', fontWeight: 700, cursor: 'pointer', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
            >
              <option value="All">Hiring Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fcfdfe' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Title</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hiring Date</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicants</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job, index) => (
              <tr key={job.id} style={{ borderBottom: index !== filteredJobs.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s', cursor: 'default' }} className="table-row-hover">
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: job.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getIcon(job.iconType, job.iconColor)}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{job.title}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>{job.sub}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{job.date}</div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                     <div style={{ padding: '4px', borderRadius: '6px', background: 'rgba(26, 38, 82, 0.05)', color: nestNavy }}><Users size={14} /></div>
                     <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{job.applicants} <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>APPS</span></span>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                   <div>
                      <span style={{ background: job.statusPill === 'Active' ? 'rgba(22, 163, 74, 0.1)' : '#f1f5f9', color: job.statusPill === 'Active' ? '#16a34a' : '#64748b', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                         {job.statusPill}
                      </span>
                   </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}><Eye size={18} /></button>
                    <button style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}><Edit2 size={18} /></button>
                    <button style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#fcfdfe' }}>
           <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 800, color: '#1e293b', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
             Next Page <ChevronRight size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;
