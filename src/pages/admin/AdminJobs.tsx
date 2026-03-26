import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Users, Code, Plus, ChevronDown, 
  Download, Eye, Edit2, MoreHorizontal, ChevronRight,
  Search, Calendar, Folder, Cloud, Terminal, Server, Wifi, Layout, UserCircle
} from 'lucide-react';

const AdminJobs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  const jobs = [
    { id: 1, title: 'Java Developer', sub: 'Engineering | Solvare Development', date: 'May 25, 2024', year: '2024', applicants: 47, statusText: 'Active', statusPill: 'Active', iconType: 'folder', iconColor: '#f59e0b', iconBg: '#fef3c7' },
    { id: 2, title: 'Data Analyst', sub: 'Marketing | Data Science', date: 'Apr 18, 2024', year: '2024', applicants: 35, statusText: 'Active', statusPill: 'Active', iconType: 'brain', iconColor: '#1e3a8a', iconBg: '#eff6ff' },
    { id: 3, title: 'UI/UX Designer', sub: 'Figma | Adobe XD', date: 'May 20, 2024', year: '2024', applicants: 24, statusText: 'Active', statusPill: 'Active', iconType: 'layout', iconColor: '#1e3a8a', iconBg: '#eff6ff' },
    { id: 4, title: 'Network Engineer', sub: 'IT | Networking | Linux', date: 'May 18, 2024', year: '2024', applicants: 16, statusText: 'Active', statusPill: 'Active', iconType: 'cloud', iconColor: '#10b981', iconBg: '#ecfdf5' },
    { id: 5, title: 'Frontend Developer', sub: 'Engineering | Web Development', date: 'May 12, 2024', year: '2024', applicants: 56, statusText: 'Active', statusPill: 'Active', iconType: 'terminal', iconColor: '#1e3a8a', iconBg: '#eff6ff' },
    { id: 6, title: 'DevOps Engineer', sub: 'MVS | Docker | Jenkins', date: 'May 10, 2023', year: '2023', applicants: 29, statusText: 'Inactive', statusPill: 'Inactive', iconType: 'server', iconColor: '#64748b', iconBg: '#f1f5f9' },
    { id: 7, title: 'Staff Engineer', sub: 'Java | React | Cloud', date: 'Mar 25, 2023', year: '2023', applicants: 29, statusText: 'Active', statusPill: 'Active', iconType: 'wifi', iconColor: '#1e3a8a', iconBg: '#eff6ff' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Job Management</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Track and manage your recruitment pipeline and active job postings.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', color: '#f59e0b' }}>
               <Briefcase size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>28</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Active Jobs <span style={{ color: '#10b981', fontWeight: 600 }}>+6.5%</span></div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#e0e7ff', padding: '12px', borderRadius: '12px', color: '#1e3a8a' }}>
               <Users size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>1,570</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Total Hires <span style={{ color: '#10b981', fontWeight: 600 }}>+8.2%</span></div>
            </div>
          </div>

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

        <div style={{ minWidth: '140px' }}>
          <Link to="/admin/jobs/post" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              background: '#1e3a8a', color: '#fff', border: 'none', padding: '12px 24px', 
              borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              width: '100%', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
            }}>
              <Plus size={18} />
              Post Job
            </button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 16px', maxWidth: '320px', width: '100%' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by job title or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '14px', color: '#1e293b', background: 'transparent' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
            >
              <option value="All">Hiring Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Job Title</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Hiring Date</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Applicants</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job, index) => (
              <tr key={job.id} style={{ borderBottom: index !== filteredJobs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: job.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getIcon(job.iconType, job.iconColor)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{job.title}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{job.sub}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginTop: '4px' }}>{job.date}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                     <Calendar size={14} color="#1e3a8a" />
                     <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{job.applicants} <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>Apps</span></span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                   <div style={{ marginTop: '4px' }}>
                      <span style={{ background: job.statusPill === 'Active' ? '#dcfce7' : '#f1f5f9', color: job.statusPill === 'Active' ? '#16a34a' : '#64748b', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
                         {job.statusPill}
                      </span>
                   </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Eye size={18} /></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit2 size={18} /></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><MoreHorizontal size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
           <button style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>Next Page <ChevronRight size={14} style={{ marginLeft: '4px' }} /></button>
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;
