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

  const visits = [
    { id: 1, date: 'Today', year: '2024', isToday: true, college: 'Mar Athanasius', collegeSub: 'Saintgits', hasSquare: false, students: 45, coordName: 'Alan Mathew', coordEmail: 'alan.mathew@xample.com', notes: 'Workshop on Java Development' },
    { id: 2, date: 'Apr 18, 2024', year: '2024', isToday: false, college: 'Saintgits', collegeSub: 'Saingits', hasSquare: true, squareColor: '#10b981', students: 60, coordName: 'Rahul Nair', coordEmail: 'rahul.nair@example.com', notes: 'Session on IoT and Robotics' },
    { id: 3, date: 'Apr 15, 2024', year: '2024', isToday: false, college: 'Rajagiri', collegeSub: 'Rajagiri', hasSquare: true, squareColor: '#10b981', students: 35, coordName: 'Anu Prasad', coordEmail: 'anu.prasad@example.com', notes: 'Company overview & hands-on demo' },
    { id: 4, date: 'Apr 10, 2024', year: '2024', isToday: false, college: 'Amal Jyothi', collegeSub: 'Saintgits', hasSquare: true, squareColor: '#1e3a8a', students: 40, coordName: 'Maya Prasad', coordEmail: 'maya.prasad@example.com', notes: 'Networking and cloud computing seminar' },
    { id: 5, date: 'Apr 02, 2024', year: '2024', isToday: false, college: 'MACFAST', collegeSub: 'Saintgits', hasSquare: true, squareColor: '#10b981', students: 25, coordName: 'Rahul Nair', coordEmail: 'rahul.nair@example.com', notes: 'Introduction to Software Testing' },
    { id: 6, date: 'Mar 25, 2023', year: '2023', isToday: false, college: 'Mar Athanasius', collegeSub: 'Saintgits', hasSquare: false, students: 50, coordName: 'Alan Mathew', coordEmail: 'alan.mathew@example.com', notes: 'Workshop on Data Science' },
    { id: 7, date: 'Mar 02, 2023', year: '2023', isToday: false, college: 'Mah Nair', collegeSub: 'rahul.nair@example.com', hasSquare: false, students: 50, coordName: 'Rahul Nair', coordEmail: 'rahul.nair@example.com', notes: 'Workshop on Data Science' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>IV Student Management</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Track and manage visits from various colleges in one place.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fce7f3', padding: '12px', borderRadius: '12px', color: '#be185d' }}>
               <CalendarDays size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>82</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Total Visits <span style={{ color: '#10b981', fontWeight: 600 }}>+12.3%</span></div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#e0e7ff', padding: '12px', borderRadius: '12px', color: '#1e3a8a' }}>
               <Users size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>1,570</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Total Students <span style={{ color: '#10b981', fontWeight: 600 }}>+12.6%</span></div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px', color: '#059669' }}>
               <Building size={24} />
            </div>
            <div>
               <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Mar Athanasius</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Next Visit: Apr 20</div>
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f3e8ff', padding: '12px', borderRadius: '12px', color: '#7e22ce' }}>
               <GraduationCap size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>330</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Highest Intake</div>
            </div>
          </div>
        </div>

        <div style={{ minWidth: '140px' }}>
          <Link to="/admin/iv-students/add" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              background: '#1e3a8a', color: '#fff', border: 'none', padding: '12px 24px', 
              borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              width: '100%', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)'
            }}>
              <Plus size={18} />
              Add Visit
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
              placeholder="Search by college or coordinator..." 
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
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
          <Download size={16} /> Export
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Visit Date</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>College</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Students</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Coordinator</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit, index) => (
              <tr key={visit.id} style={{ borderBottom: index !== filteredVisits.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '16px 24px' }}>
                  {visit.isToday ? (
                     <span style={{ background: '#9f1239', color: '#fff', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>{visit.date}</span>
                  ) : (
                     <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{visit.date}</div>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{visit.college}</div>
                   <div style={{ fontSize: '12px', color: '#64748b' }}>{visit.collegeSub}</div>
                </td>
                <td style={{ padding: '16px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a' }}>{visit.students} <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>Students</span></div>
                </td>
                <td style={{ padding: '16px' }}>
                   <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{visit.coordName}</div>
                   <div style={{ fontSize: '12px', color: '#64748b' }}>{visit.coordEmail}</div>
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

export default AdminIVStudents;
