import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, Briefcase, Plus, ChevronDown, 
  Download, Eye, Edit2, MoreHorizontal, ChevronRight, Search, Laptop
} from 'lucide-react';

const AdminInterns: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  const interns = [
    { id: 1, name: 'Ananya R', email: 'ananya.r@gmail.com', college: 'Mar Athanasius', year: '2024', domain: 'Java Full Stack', duration: '6 Months', status: 'Active' },
    { id: 2, name: 'Rahul Nair', email: 'rahul.n@gmail.com', college: 'Saintgits', year: '2024', domain: 'Python Django', duration: '3 Months', status: 'Completed' },
    { id: 3, name: 'Maya Prasad', email: 'maya.p@gmail.com', college: 'Rajagiri', year: '2024', domain: 'UI/UX Design', duration: '3 Months', status: 'Active' },
    { id: 4, name: 'Kevin Jose', email: 'kevin.j@gmail.com', college: 'Amal Jyothi', year: '2023', domain: 'Data Science', duration: '6 Months', status: 'Active' },
    { id: 5, name: 'Sana Khan', email: 'sana.k@gmail.com', college: 'MACFAST', year: '2023', domain: 'Cyber Security', duration: '6 Months', status: 'Inactive' },
  ];

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = 
      intern.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      intern.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCollege = collegeFilter === 'All' || intern.college === collegeFilter;
    const matchesYear = yearFilter === 'All' || intern.year === yearFilter;
    
    return matchesSearch && matchesCollege && matchesYear;
  });

  const colleges = Array.from(new Set(interns.map(i => i.college)));
  const years = Array.from(new Set(interns.map(i => i.year))).sort().reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Intern Management</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Onboard and track interns from various institutional partners.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#e0e7ff', padding: '12px', borderRadius: '12px', color: '#1e3a8a' }}>
               <Users size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>128</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Active Interns <span style={{ color: '#10b981', fontWeight: 600 }}>+8.2%</span></div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', color: '#f59e0b' }}>
               <Laptop size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>12</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>New Domains <span style={{ color: '#10b981', fontWeight: 600 }}>+4.1%</span></div>
            </div>
          </div>
        </div>

        <div style={{ minWidth: '140px' }}>
          <Link to="/admin/interns/add" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              background: '#1e3a8a', color: '#fff', border: 'none', padding: '12px 24px', 
              borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              width: '100%', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)'
            }}>
              <Plus size={18} />
              Add Intern
            </button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 16px', maxWidth: '300px', width: '100%' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '14px', color: '#1e293b', background: 'transparent' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
              <option value="All">All Colleges</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
              <option value="All">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Intern Details</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>College</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Domain & Time</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInterns.map((intern, index) => (
              <tr key={intern.id} style={{ borderBottom: index !== filteredInterns.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '16px 24px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{intern.name}</div>
                   <div style={{ fontSize: '12px', color: '#64748b' }}>{intern.email}</div>
                </td>
                <td style={{ padding: '16px' }}>
                   <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{intern.college}</div>
                </td>
                <td style={{ padding: '16px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{intern.domain}</div>
                   <div style={{ fontSize: '12px', color: '#64748b' }}>{intern.year} • {intern.duration}</div>
                </td>
                <td style={{ padding: '16px' }}>
                   <span style={{ 
                     background: intern.status === 'Active' ? '#dcfce7' : (intern.status === 'Completed' ? '#e0e7ff' : '#f1f5f9'), 
                     color: intern.status === 'Active' ? '#16a34a' : (intern.status === 'Completed' ? '#1e3a8a' : '#64748b'), 
                     padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 
                   }}>{intern.status}</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

export default AdminInterns;
