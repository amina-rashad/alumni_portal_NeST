import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, Users, Building, GraduationCap, Plus, ChevronDown, 
  Download, Eye, Edit2, MoreHorizontal, ChevronRight, Search
} from 'lucide-react';

const AdminIVStudents: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // NeST NAVY BLUE
  const nestNavy = '#1a2652';

  const visits = [
    { id: 1, date: 'Today', year: '2024', isToday: true, college: 'Mar Athanasius', collegeSub: 'Engineering', hasSquare: false, students: 45, coordName: 'Alan Mathew', coordEmail: 'alan.mathew@xample.com', notes: 'Workshop on Java Development' },
    { id: 2, date: 'Apr 18, 2024', year: '2024', isToday: false, college: 'Saintgits', collegeSub: 'Technology', hasSquare: true, squareColor: '#10b981', students: 60, coordName: 'Rahul Nair', coordEmail: 'rahul.nair@example.com', notes: 'Session on IoT and Robotics' },
    { id: 3, date: 'Apr 15, 2024', year: '2024', isToday: false, college: 'Rajagiri', collegeSub: 'Applied Sciences', hasSquare: true, squareColor: '#10b981', students: 35, coordName: 'Anu Prasad', coordEmail: 'anu.prasad@example.com', notes: 'Company overview & hands-on demo' },
    { id: 4, date: 'Apr 10, 2024', year: '2024', isToday: false, college: 'Amal Jyothi', collegeSub: 'Engineering', hasSquare: true, squareColor: nestNavy, students: 40, coordName: 'Maya Prasad', coordEmail: 'maya.prasad@example.com', notes: 'Networking and cloud computing seminar' },
    { id: 5, date: 'Apr 02, 2024', year: '2024', isToday: false, college: 'MACFAST', collegeSub: 'IT', hasSquare: true, squareColor: '#10b981', students: 25, coordName: 'Rahul Nair', coordEmail: 'rahul.nair@example.com', notes: 'Introduction to Software Testing' },
    { id: 6, date: 'Mar 25, 2023', year: '2023', isToday: false, college: 'Mar Athanasius', collegeSub: 'Engineering', hasSquare: false, students: 50, coordName: 'Alan Mathew', coordEmail: 'alan.mathew@example.com', notes: 'Workshop on Data Science' },
    { id: 7, date: 'Mar 02, 2023', year: '2023', isToday: false, college: 'Mah Nair', collegeSub: 'Tech', hasSquare: false, students: 50, coordName: 'Rahul Nair', coordEmail: 'rahul.nair@example.com', notes: 'Workshop on Data Science' },
  ];

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = 
      visit.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.coordName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCollege = collegeFilter === 'All' || visit.college === collegeFilter;
    const matchesYear = yearFilter === 'All' || visit.year === yearFilter;
    
    return matchesSearch && matchesCollege && matchesYear;
  });

  const colleges = Array.from(new Set(visits.map(v => v.college)));
  const years = Array.from(new Set(visits.map(v => v.year))).sort().reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>IV Student Management</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px' }}>Track and manage visits from various colleges in one place.</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flex: 1, gap: '20px' }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.08)', padding: '12px', borderRadius: '16px', color: '#be185d' }}>
               <CalendarDays size={24} />
            </div>
            <div>
               <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>82</div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Visits <span style={{ color: '#10b981' }}>+12.3%</span></div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ background: 'rgba(26, 38, 82, 0.08)', padding: '12px', borderRadius: '16px', color: nestNavy }}>
               <Users size={24} />
            </div>
            <div>
               <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>1,570</div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Students <span style={{ color: '#10b981' }}>+12.6%</span></div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '12px', borderRadius: '16px', color: '#059669' }}>
               <Building size={24} />
            </div>
            <div>
               <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Mar Athanasius</div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Next Visit: Apr 20</div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ background: 'rgba(126, 34, 206, 0.08)', padding: '12px', borderRadius: '16px', color: '#7e22ce' }}>
               <GraduationCap size={24} />
            </div>
            <div>
               <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>330</div>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Highest Intake</div>
            </div>
          </div>
        </div>

        <div style={{ minWidth: '160px' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '10px 20px', maxWidth: '400px', width: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by college or coordinator..." 
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

        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <Download size={16} /> Export
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fcfdfe' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visit Date</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>College</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Students</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coordinator</th>
              <th style={{ padding: '20px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit, index) => (
              <tr key={visit.id} style={{ borderBottom: index !== filteredVisits.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '20px 24px' }}>
                  {visit.isToday ? (
                     <span style={{ background: '#9f1239', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>{visit.date.toUpperCase()}</span>
                  ) : (
                     <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{visit.date}</div>
                  )}
                </td>
                <td style={{ padding: '20px' }}>
                   <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{visit.college}</div>
                   <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>{visit.collegeSub}</div>
                </td>
                <td style={{ padding: '20px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 800, color: nestNavy }}>{visit.students} <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>STUDENTS</span></div>
                </td>
                <td style={{ padding: '20px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{visit.coordName}</div>
                   <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{visit.coordEmail}</div>
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

export default AdminIVStudents;
