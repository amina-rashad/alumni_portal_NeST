import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, Briefcase, Plus, ChevronDown, 
  Eye, Edit2, MoreHorizontal, ChevronRight, Search, Laptop
} from 'lucide-react';

const AdminInterns: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  // NeST NAVY BLUE
  const nestNavy = '#1a2652';

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
               <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>128</div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Interns <span style={{ color: '#10b981' }}>+8.2%</span></div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '16px', color: '#f59e0b' }}>
               <Laptop size={24} />
            </div>
            <div>
               <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>12</div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>New Domains <span style={{ color: '#10b981' }}>+4.1%</span></div>
            </div>
          </div>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '10px 20px', maxWidth: '400px', width: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#1e293b', background: 'transparent', fontWeight: 500 }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)} style={{ padding: '12px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontSize: '13px', fontWeight: 700, cursor: 'pointer', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <option value="All">All Colleges</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ padding: '12px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontSize: '13px', fontWeight: 700, cursor: 'pointer', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <option value="All">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fcfdfe' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intern Details</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>College</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Domain & Time</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInterns.map((intern, index) => (
              <tr key={intern.id} style={{ borderBottom: index !== filteredInterns.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '20px 24px' }}>
                   <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{intern.name}</div>
                   <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{intern.email}</div>
                </td>
                <td style={{ padding: '20px' }}>
                   <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 700 }}>{intern.college}</div>
                </td>
                <td style={{ padding: '20px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{intern.domain}</div>
                   <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{intern.year} • {intern.duration}</div>
                </td>
                <td style={{ padding: '20px' }}>
                   <span style={{ 
                     background: intern.status === 'Active' ? 'rgba(22, 163, 74, 0.1)' : (intern.status === 'Completed' ? 'rgba(26, 38, 82, 0.08)' : '#f1f5f9'), 
                     color: intern.status === 'Active' ? '#16a34a' : (intern.status === 'Completed' ? nestNavy : '#64748b'), 
                     padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'
                   }}>{intern.status}</span>
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

export default AdminInterns;
