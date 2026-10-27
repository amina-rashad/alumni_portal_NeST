/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, User, BookOpen, ChevronDown, Award, 
  Download, Eye, Lock, Clock, Sparkles, X, ShieldCheck, CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { courseManagerAPI } from '../../services/api';
import UserAvatar from '../../components/UserAvatar';
import { generateCourseIVCertificate } from '../../utils/CertificateGenerator';
import { formatDateOnly, getLocalDateString } from '../../utils/dateUtils';

const GlassSelect: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const brandPrimary = '#233167';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }} ref={dropdownRef}>
      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          padding: '12px 16px', 
          borderRadius: '14px', 
          border: '1px solid #e2e8f0', 
          background: '#fff', 
          fontSize: '14px', 
          width: '100%', 
          color: '#1e293b', 
          fontWeight: 700, 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}
      >
        {value}
        <ChevronDown size={14} color="#94a3b8" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '105%', 
          left: 0, 
          right: 0, 
          zIndex: 100, 
          background: '#fff', 
          borderRadius: '14px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          padding: '6px'
        }}>
          {options.map((opt) => (
            <div 
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{ 
                padding: '10px 14px', 
                fontSize: '13px', 
                fontWeight: 600, 
                color: value === opt ? brandPrimary : '#475569',
                background: value === opt ? 'rgba(200, 16, 46, 0.05)' : 'transparent',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CM_Students: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const brandPrimary = '#233167';
  const brandRed = '#c8102e';

  const searchParams = new URLSearchParams(location.search);
  const initialCourse = searchParams.get('course') || 'All Courses';

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState(initialCourse);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewStudent, setPreviewStudent] = useState<any | null>(null);

  const [coursesList, setCoursesList] = useState<any[]>([]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const [studentsRes, coursesRes] = await Promise.all([
        courseManagerAPI.fetchStudents(),
        courseManagerAPI.fetchCourses()
      ]);
      setStudents(studentsRes.data?.students || []);
      setCoursesList(coursesRes.data?.courses || []);
    } catch (err) {
      setError('Failed to load students.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDownloadCertificate = (student: any) => {
    try {
      const cert = student.certificate;
      const issueDate = cert?.issueDate || student.enrolledDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      generateCourseIVCertificate(
        student.name,
        student.course,
        issueDate
      );

      toast.success(`Official certificate for ${student.name} downloaded successfully!`);
    } catch (err) {
      console.error('Error generating certificate PDF:', err);
      toast.error('Failed to download certificate PDF.');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesCourse = courseFilter === 'All Courses' || student.course === courseFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'Certificates Issued') {
      matchesStatus = !!student.isCertified;
    } else if (statusFilter === 'Ready to Issue') {
      matchesStatus = !student.isCertified && (student.progress >= 100 || student.status === 'Completed');
    } else if (statusFilter !== 'All Statuses') {
      matchesStatus = student.status === statusFilter;
    }

    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesStatus && matchesSearch;
  });

  const uniqueCourses = ['All Courses', ...Array.from(new Set([
    ...coursesList.map((c: any) => c.title).filter(Boolean),
    ...students.map((s: any) => s.course).filter(Boolean)
  ]))];
  const certifiedCount = students.filter(s => s.isCertified).length;

  const handleExportStudentsExcel = () => {
    if (filteredStudents.length === 0) {
      toast.error('No learners found to export.');
      return;
    }

    const headers = ['Learner Name', 'Email Address', 'Enrolled Academic Track', 'Status', 'Credential Issued', 'Enrollment Date'];
    const rows = filteredStudents.map(s => [
      s.name || '',
      s.email || '',
      s.course || '',
      s.status || 'Learning',
      s.isCertified ? 'Certificate Issued' : 'Pending',
      s.enrollmentDate ? formatDateOnly(s.enrollmentDate) : 'N/A'
    ]);

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = headers.map((h, i) => {
      let maxLen = h.length;
      rows.forEach(row => {
        const cellLen = String(row[i] || '').length;
        if (cellLen > maxLen) maxLen = cellLen;
      });
      return { wch: Math.min(Math.max(maxLen + 4, 14), 40) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Learners Directory');
    const timestamp = getLocalDateString();
    const safeTrack = courseFilter !== 'All Courses' ? `_${courseFilter.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    XLSX.writeFile(wb, `NeST_Learners${safeTrack}_${timestamp}.xlsx`);
    toast.success(`Exported ${filteredStudents.length} learners to Excel (.xlsx)!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Learner Directory</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Track student progress, engagement, and export academic rosters to Excel (.xlsx).</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Active Learners Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(200, 16, 46, 0.05)', color: brandPrimary }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Active Learners</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{students.length.toLocaleString()}</div>
            </div>
          </div>

          {/* Certificates Issued Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: '#ecfdf5', color: '#059669' }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Certificates Issued</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>{certifiedCount}</div>
            </div>
          </div>

          {/* Export to Excel (.xlsx) */}
          <button
            onClick={handleExportStudentsExcel}
            disabled={filteredStudents.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '16px',
              background: '#ecfdf5',
              color: '#059669',
              border: '1.5px solid #a7f3d0',
              fontWeight: 800,
              fontSize: '13px',
              cursor: filteredStudents.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)',
              transition: 'all 0.15s ease',
              opacity: filteredStudents.length === 0 ? 0.6 : 1
            }}
            onMouseEnter={e => filteredStudents.length > 0 && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => filteredStudents.length > 0 && (e.currentTarget.style.transform = 'translateY(0)')}
            title="Download learner roster in Excel (.xlsx) format"
          >
            <FileSpreadsheet size={16} color="#059669" />
            <span>Export to Excel (.xlsx) ({filteredStudents.length})</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search learners by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '12px 16px 12px 48px', 
              borderRadius: '14px', 
              border: '1px solid #e2e8f0', 
              background: '#f8fafc', 
              fontSize: '14px', 
              width: '100%', 
              outline: 'none',
              fontWeight: 600
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '220px' }}>
             <GlassSelect 
               label="Track Filter" 
               options={uniqueCourses} 
               value={courseFilter} 
               onChange={setCourseFilter} 
             />
          </div>
          <div style={{ width: '200px' }}>
             <GlassSelect 
               label="Filter By Status" 
               options={['All Statuses', 'Certificates Issued', 'Ready to Issue', 'Learning', 'Assessment', 'Completed']} 
               value={statusFilter} 
               onChange={setStatusFilter} 
             />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Learner Identity</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Academic Track</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Phase</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credential Status</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certificate Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={5} style={{ padding: '24px' }} className="skeleton-pulse"><div style={{ height: '40px', background: '#f1f5f9', borderRadius: '12px' }}></div></td></tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No learners found matching your criteria.</td>
                </tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-row">
                  {/* Learner Identity */}
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <UserAvatar
                        src={student.profile_picture}
                        name={student.name}
                        status={student.role !== 'admin' ? 'open_to_work' : undefined}
                        size={40}
                        bgColor="#c8102e"
                      />
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{student.name}</span>
                          {student.role !== 'admin' && (
                            <span style={{ fontSize: '9px', color: '#16a34a', fontWeight: 900, background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.3px' }}>ENROLLED</span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{student.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Academic Track */}
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600, fontSize: '14px' }}>
                      <BookOpen size={16} color={brandPrimary} /> {student.course}
                    </div>
                  </td>

                  {/* Current Phase */}
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ 
                        width: 'fit-content', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', 
                        background: student.status === 'Completed' ? '#ecfdf5' : student.status === 'Assessment' ? '#fff7ed' : '#eff6ff',
                        color: student.status === 'Completed' ? '#10b981' : student.status === 'Assessment' ? '#f59e0b' : '#3b82f6',
                        border: `1px solid ${student.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : student.status === 'Assessment' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                      }}>
                        {student.status}
                      </span>
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>Active: {student.lastActive}</span>
                    </div>
                  </td>

                  {/* Credential Status */}
                  <td style={{ padding: '20px 24px' }}>
                    {student.isCertified ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '6px', 
                          background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', 
                          padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, width: 'fit-content' 
                        }}>
                          <Award size={13} color="#059669" />
                          <span>Certificate Issued</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
                          {student.certificate?.issueDate}
                        </div>
                      </div>
                    ) : student.progress >= 100 || student.status === 'Completed' ? (
                      <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '5px', 
                        background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', 
                        padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 
                      }}>
                        <Clock size={12} color="#b45309" />
                        <span>Ready to Issue</span>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '5px', 
                        background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', 
                        padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 
                      }}>
                        <Lock size={12} color="#94a3b8" />
                        <span>Incomplete ({student.progress}%)</span>
                      </div>
                    )}
                  </td>

                  {/* Certificate Action (Download & Preview) */}
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    {student.isCertified ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                        {/* Download Certificate Button */}
                        <button
                          onClick={() => handleDownloadCertificate(student)}
                          title="Download official IV student certificate PDF"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '12px',
                            background: brandPrimary,
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(35, 49, 103, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>

                        {/* Preview Certificate Button */}
                        <button
                          onClick={() => setPreviewStudent(student)}
                          title="Preview official certificate"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            background: '#f8fafc',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Eye size={14} color="#64748b" />
                          <span>Preview</span>
                        </button>
                      </div>
                    ) : student.progress >= 100 || student.status === 'Completed' ? (
                      <button
                        onClick={() => navigate('/course-manager/certificates')}
                        title="Go to Credential Center to issue certificate"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '12px',
                          background: '#ecfdf5',
                          color: '#059669',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: '1px solid #a7f3d0',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Sparkles size={13} color="#059669" />
                        <span>Issue in Center</span>
                      </button>
                    ) : (
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        color: '#94a3b8', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        padding: '6px 12px',
                        background: '#f8fafc',
                        borderRadius: '10px'
                      }}>
                        <Lock size={12} />
                        <span>100% Required</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Preview Modal */}
      {previewStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '850px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 28px',
              borderBottom: '1px solid #f1f5f9',
              background: '#fafbfc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '10px',
                  background: 'rgba(35, 49, 103, 0.08)',
                  color: brandPrimary
                }}>
                  <ShieldCheck size={22} color={brandPrimary} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                    Official NeST Certificate
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                    Recipient: <strong style={{ color: '#1e293b' }}>{previewStudent.name}</strong> • Track: {previewStudent.course}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPreviewStudent(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Certificate Visual Frame */}
            <div style={{ padding: '32px', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: '#ffffff',
                border: '8px solid #1a2652',
                borderRadius: '8px',
                padding: '40px 48px',
                width: '100%',
                maxWidth: '750px',
                position: 'relative',
                boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                overflow: 'hidden'
              }}>
                {/* NeST Triangle Accents in Top-Right / Right */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '140px',
                  height: '140px',
                  background: 'linear-gradient(135deg, transparent 50%, #1a2652 50%)',
                  opacity: 0.95
                }} />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '90px',
                  height: '90px',
                  background: 'linear-gradient(135deg, transparent 50%, #c8102e 50%)',
                  opacity: 0.95
                }} />

                {/* NeST Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                  <div style={{
                    fontWeight: 900,
                    fontSize: '28px',
                    color: '#c8102e',
                    fontFamily: 'sans-serif',
                    letterSpacing: '-0.5px'
                  }}>
                    NeST
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#1a2652',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    borderLeft: '2px solid #e2e8f0',
                    paddingLeft: '12px'
                  }}>
                    Digital Academy
                  </div>
                </div>

                {/* Certificate Title */}
                <div style={{ textAlign: 'center', margin: '20px 0 30px' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '4px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    marginBottom: '6px'
                  }}>
                    Official Credential
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#1a2652',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Certificate of Course Completion
                  </div>
                </div>

                {/* Recipient */}
                <div style={{ textAlign: 'center', margin: '24px 0' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>This is proudly presented to</div>
                  <div style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    color: '#1a2652',
                    textTransform: 'uppercase',
                    margin: '10px 0 6px',
                    letterSpacing: '1px'
                  }}>
                    {previewStudent.name}
                  </div>
                  <div style={{ width: '220px', height: '2px', background: '#1a2652', margin: '0 auto 16px' }} />
                  <p style={{
                    fontSize: '13px',
                    color: '#475569',
                    maxWidth: '560px',
                    margin: '0 auto',
                    lineHeight: '1.6',
                    fontWeight: 500
                  }}>
                    for successfully demonstrating mastery, fulfilling all academic track requirements, and completing 100% of curriculum assessments in <strong>{previewStudent.course}</strong>.
                  </p>
                </div>

                {/* Seal & Metadata */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '36px',
                  paddingTop: '20px',
                  borderTop: '1px dashed #e2e8f0'
                }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Completion Date</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                      {previewStudent.certificate?.issueDate || previewStudent.enrolledDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Gold Verified Seal */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#fefce8',
                    border: '1.5px solid #facc15',
                    padding: '8px 14px',
                    borderRadius: '50px'
                  }}>
                    <Award size={18} color="#ca8a04" />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#a16207', textTransform: 'uppercase' }}>
                      Verified NeST Seal
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ width: '130px', borderBottom: '1.5px solid #1a2652', marginBottom: '6px' }} />
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#1a2652' }}>Authorized Signatory</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>NeST Digital Academy</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 28px',
              borderTop: '1px solid #f1f5f9',
              background: '#fafbfc'
            }}>
              <button
                onClick={() => setPreviewStudent(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadCertificate(previewStudent);
                  setPreviewStudent(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: brandPrimary,
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(35, 49, 103, 0.25)'
                }}
              >
                <Download size={15} />
                <span>Download Official Certificate PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-row:hover { background: #fcfdfe !important; }
        .skeleton-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
};

export default CM_Students;
