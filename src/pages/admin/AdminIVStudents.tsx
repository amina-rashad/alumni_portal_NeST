import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, Users, Building, GraduationCap, Plus, ChevronDown, 
  Download, Eye, Edit2, MoreHorizontal, ChevronRight
} from 'lucide-react';

const AdminIVStudents: React.FC = () => {
  const visits = [
    { id: 1, date: 'Today', isToday: true, college: 'Mar Athanasius', collegeSub: 'Saintgits', hasSquare: false, students: 45, coordName: 'Alan Mathew', coordEmail: 'alan.mathew@xample.com', notes: 'Workshop on Java\nDevelopment' },
    { id: 2, date: 'Apr 18,\n2024', isToday: false, college: 'Saintgits', collegeSub: 'Saingits', hasSquare: true, squareColor: '#10b981', students: 60, coordName: 'Rahul Nair', coordEmail: 'rahul.nair@example.com', notes: 'Session on IoT and\nRobotics' },
    { id: 3, date: 'Apr 15,\n2024', isToday: false, college: 'Rajagiri', collegeSub: 'Rajagiri', hasSquare: true, squareColor: '#10b981', students: 35, coordName: 'Anu Prasad', coordEmail: 'anu.prasad@example.com', notes: 'Company overview &\nhands-on demo' },
    { id: 4, date: 'Apr 10,\n2024', isToday: false, college: 'Amal Jyothi', collegeSub: 'Saintgits', hasSquare: true, squareColor: '#3b82f6', students: 40, coordName: 'Maya Prasad', coordEmail: 'maya.prasad@example.com', notes: 'Networking and cloud\ncomputing seminar' },
    { id: 5, date: 'Apr 02,\n2024', isToday: false, college: 'MACFAST', collegeSub: 'Saintgits', hasSquare: true, squareColor: '#10b981', students: 25, coordName: 'Rahul Nair', coordEmail: 'rahul.nair@example.com', notes: 'Introduction to Software\nTesting' },
    { id: 6, date: 'Mar 25,\n2024', isToday: false, college: 'Mar Athanasius', collegeSub: 'Saintgits', hasSquare: false, students: 50, coordName: 'Alan Mathew', coordEmail: 'alan.mathew@example.com', notes: 'Workshop on Data Science' },
    { id: 7, date: 'Mar 02,\n2024', isToday: false, college: 'Mah Nair', collegeSub: 'rahul.nair@example.com', hasSquare: false, students: 50, coordName: 'Rahul Nair', coordEmail: 'rahul.nair@example.com', notes: 'Workshop on Data Science' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>IV Student Management</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Track and manage visits from various colleges in one place.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Stat Cards */}
        <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
          {/* Total Visits */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fce7f3', padding: '12px', borderRadius: '12px', color: '#be185d' }}>
               <CalendarDays size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>82</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Total <span style={{ color: '#10b981', fontWeight: 600 }}>+12.3%</span></div>
            </div>
          </div>

          {/* Total Students */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
               <Users size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>1,570</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Total \n\n</div>
               {/* Note: The UI says "Total viset +12.6%" which implies two lines but formatted similar to total */}
               <div style={{ fontSize: '13px', color: '#64748b', marginTop: '-18px' }}>Total viset <span style={{ color: '#10b981', fontWeight: 600 }}>+12.6%</span></div>
            </div>
          </div>

          {/* Upcoming Visit */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px', color: '#059669' }}>
               <Building size={24} />
            </div>
            <div>
               <div style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>Mar Athanasius</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Apr 20, 2024</div>
            </div>
          </div>

          {/* Another Stat */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#f3e8ff', padding: '12px', borderRadius: '12px', color: '#7e22ce' }}>
               <GraduationCap size={24} />
            </div>
            <div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>330</div>
               <div style={{ fontSize: '13px', color: '#64748b' }}>Saintgits</div>
            </div>
          </div>
        </div>

        {/* Action Buttons right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '140px' }}>
          <Link to="/admin/iv-students/add" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', 
              borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(59, 130, 246, 0.2)',
              width: '100%'
            }}>
              <Plus size={18} />
              Add Visit
            </button>
          </Link>
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
            Visit Date <ChevronDown size={14} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', padding: '8px 12px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
            All <ChevronDown size={14} />
          </button>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
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
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Date</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>College</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Students</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Coordinator</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Notes</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                   Actions <MoreHorizontal size={14} color="#94a3b8" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit, index) => (
              <tr key={visit.id} style={{ borderBottom: index !== visits.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s', ...({ ':hover': { background: '#f8fafc' } } as any) }}>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  <input type="checkbox" style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6', marginTop: '4px' }} />
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  {visit.isToday ? (
                     <span style={{ 
                       background: '#9f1239', color: '#fff', padding: '6px 12px', 
                       borderRadius: '16px', fontSize: '12px', fontWeight: 600, display: 'inline-block' 
                     }}>
                        {visit.date}
                     </span>
                  ) : (
                     <div style={{ fontSize: '14px', color: '#475569', fontWeight: 500, whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                        {visit.date}
                     </div>
                  )}
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                   <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>{visit.college}</div>
                   {visit.hasSquare ? (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <div style={{ width: '12px', height: '8px', borderRadius: '2px', background: visit.squareColor }}></div>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{visit.collegeSub}</span>
                     </div>
                   ) : (
                     <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{visit.collegeSub}</div>
                   )}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b', fontWeight: 500, verticalAlign: 'top' }}>
                  {visit.students}
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                   <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>{visit.coordName}</div>
                   <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{visit.coordEmail}</div>
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                   <div style={{ fontSize: '13px', color: '#475569', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                      {visit.notes}
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

export default AdminIVStudents;
