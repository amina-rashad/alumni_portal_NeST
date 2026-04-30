import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, User, BookOpen, ChevronDown, Mail, Eye, Loader2, AlertCircle } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { courseService } from '../../services/courseService';
import type { Student } from '../../types/course-manager';
import toast from 'react-hot-toast';

/* ── Grid column definition (header + rows must share this exactly) ── */
const GRID = '2fr 2fr 1fr 1.5fr 1fr 0.5fr';

const CM_Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const studentsPerPage = 6;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [studentData] = await Promise.all([
          studentService.getManagedStudents(),
          courseService.getAllCourses()
        ]);
        setStudents(studentData);
      } catch {
        setError('Failed to load student directory.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredStudents = students.filter(s => {
    const name = s.full_name || s.name || '';
    return (
      (courseFilter === 'All Courses' || s.course === courseFilter) &&
      (statusFilter === 'All Statuses' || s.status === statusFilter) &&
      (name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  useEffect(() => { setCurrentPage(1); }, [courseFilter, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const pageStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  const uniqueCourses = ['All Courses', ...Array.from(new Set(students.map(s => s.course)))];
  const uniqueStatuses = ['All Statuses', 'Learning', 'Assessment', 'Completed'];

  const getInitials = (s: Student) =>
    (s.full_name || s.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = ['#1e2d5e', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#1d4ed8'];
  const getAvatarColor = (i: number) => avatarColors[i % avatarColors.length];

  const statusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case 'Learning':   return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
      case 'Assessment': return { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' };
      case 'Completed':  return { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' };
      default:           return { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };

  const handleEmail = async (student: Student) => {
    const name = student.full_name || student.name || 'Student';
    const t = toast.loading(`Sending to ${name}...`);
    try {
      await studentService.sendMockMail(student.id);
      toast.success(`Sent to ${student.email}`, { id: t });
    } catch {
      toast.error('Failed to send.', { id: t });
    }
  };

  /* ─── shared cell style ─── */
  const cellStyle: React.CSSProperties = {
    padding: '20px 16px',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    overflow: 'hidden',
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.03em' }}>
            Student Enrollments
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
            Track student progress and manage enrollments across all courses.
          </p>
        </div>

        {/* Stats card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: '#ffffff', borderRadius: '16px', padding: '14px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
          flexShrink: 0,
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={18} style={{ color: '#1d4ed8' }} />
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Total Active
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', marginTop: '2px' }}>
              1,284 Students
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar (grouped container) ── */}
      <div style={{
        background: '#ffffff', borderRadius: '16px', padding: '14px 16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 60%', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', color: '#94a3b8', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', height: '44px', borderRadius: '999px',
              border: '1.5px solid #e2e8f0', paddingLeft: '44px', paddingRight: '16px',
              fontSize: '14px', color: '#1e293b', fontFamily: 'inherit',
              background: '#f8fafc', outline: 'none', transition: 'border 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = '#c8102e')}
            onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
          />
        </div>

        {/* Course dropdown */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            style={{
              height: '44px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
              padding: '0 36px 0 14px', fontSize: '14px', fontWeight: 600,
              color: '#334155', background: '#f8fafc', fontFamily: 'inherit',
              appearance: 'none', outline: 'none', cursor: 'pointer', minWidth: '160px',
            }}
          >
            {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        </div>

        {/* Status dropdown */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              height: '44px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
              padding: '0 36px 0 14px', fontSize: '14px', fontWeight: 600,
              color: '#334155', background: '#f8fafc', fontFamily: 'inherit',
              appearance: 'none', outline: 'none', cursor: 'pointer', minWidth: '150px',
            }}
          >
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* ── Table Card ── */}
      <div style={{
        background: '#ffffff', borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
        overflow: 'hidden',
      }}>
        {error && (
          <div style={{ padding: '16px 24px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #fee2e2' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── Table Header ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: GRID,
          background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
          padding: '0 8px',
        }}>
          {['Student Info', 'Course Enrolled', 'Attendance', 'Completion', 'Status', 'Actions'].map((col, i) => (
            <div key={col} style={{
              padding: '14px 16px',
              fontSize: '10px', fontWeight: 800, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              textAlign: i === 5 ? 'center' : 'left',
            }}>
              {col}
            </div>
          ))}
        </div>

        {/* ── Rows ── */}
        <div style={{ position: 'relative', minHeight: '300px' }}>
          {isLoading ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <Loader2 size={28} style={{ color: '#c8102e', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Loading student records...</span>
            </div>
          ) : pageStudents.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
              No students found matching your filters.
            </div>
          ) : (
            pageStudents.map((student, idx) => {
              const name = student.full_name || student.name || 'Unknown';
              const progress = student.progress || 0;
              const attendance = student.attendance || 0;
              const isMenuOpen = openMenu === student.id;

              return (
                <div
                  key={student.id}
                  style={{
                    display: 'grid', gridTemplateColumns: GRID,
                    borderBottom: idx < pageStudents.length - 1 ? '1px solid #f8fafc' : 'none',
                    padding: '0 8px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Student Info */}
                  <div style={cellStyle}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: getAvatarColor(idx),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '13px', color: '#fff',
                      flexShrink: 0, marginRight: '14px',
                    }}>
                      {getInitials(student)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                        <Mail size={11} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Enrolled */}
                  <div style={cellStyle}>
                    <BookOpen size={14} style={{ color: '#94a3b8', marginRight: '10px', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600, lineHeight: 1.4 }}>
                      {student.course}
                    </span>
                  </div>

                  {/* Attendance */}
                  <div style={cellStyle}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: attendance >= 75 ? '#22c55e' : '#ef4444',
                      marginRight: '8px', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                      {attendance}%
                    </span>
                  </div>

                  {/* Completion */}
                  <div style={{ ...cellStyle, gap: '10px' }}>
                    <div style={{ flex: 1, height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', minWidth: '60px' }}>
                      <div style={{
                        height: '100%', borderRadius: '999px',
                        width: `${progress}%`,
                        background: progress === 100 ? '#22c55e' : '#1e2d5e',
                        transition: 'width 1s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {progress}%
                    </span>
                  </div>

                  {/* Status */}
                  <div style={cellStyle}>
                    <span style={{
                      ...statusStyle(student.status),
                      padding: '5px 14px', borderRadius: '999px',
                      fontSize: '10px', fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}>
                      {student.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ ...cellStyle, justifyContent: 'center', position: 'relative' }}>
                    <button
                      onClick={() => setOpenMenu(isMenuOpen ? null : student.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '6px', borderRadius: '8px', color: '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {isMenuOpen && (
                      <div style={{
                        position: 'absolute', right: '8px', top: '44px', zIndex: 100,
                        background: '#fff', borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9',
                        padding: '6px', minWidth: '160px',
                      }}>
                        <button
                          onClick={() => { setOpenMenu(null); alert(`Viewing ${name}`); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', border: 'none', background: 'none', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '8px', fontWeight: 600 }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Eye size={14} /> View Profile
                        </button>
                        <button
                          onClick={() => { setOpenMenu(null); handleEmail(student); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', border: 'none', background: 'none', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '8px', fontWeight: 600 }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Mail size={14} /> Send Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Pagination ── */}
        {!isLoading && filteredStudents.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderTop: '1px solid #f8fafc', background: '#fafbfc',
          }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
              Showing {(currentPage - 1) * studentsPerPage + 1}–{Math.min(currentPage * studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  height: '36px', padding: '0 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                  fontSize: '13px', fontWeight: 700, color: '#334155', background: '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1,
                  fontFamily: 'inherit',
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{
                  height: '36px', padding: '0 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                  fontSize: '13px', fontWeight: 700, color: '#334155', background: '#fff',
                  cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                  opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1,
                  fontFamily: 'inherit',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CM_Students;
