import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, MoreVertical, User, 
  BookOpen, Award, ChevronDown, Mail, 
  Eye, Loader2, AlertCircle, TrendingUp,
  Clock, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { courseManagerAPI } from '../../services/api';

const GlassSelect: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const brandPrimary = '#c8102e';

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
  const brandPrimary = '#c8102e';
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);
        const response = await courseManagerAPI.fetchStudents();
        setStudents(response.data || []);
      } catch (err) {
        setError('Failed to load students.');
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesCourse = courseFilter === 'All Courses' || student.course === courseFilter;
    const matchesStatus = statusFilter === 'All Statuses' || student.status === statusFilter;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesStatus && matchesSearch;
  });

  const uniqueCourses = ['All Courses', ...Array.from(new Set(students.map(s => s.course)))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Learner Directory</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Track student progress and engagement across all academic tracks.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(200, 16, 46, 0.05)', color: brandPrimary }}>
              <User size={20} />
            </div>
           <div>
             <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Active Learners</div>
             <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{students.length.toLocaleString()}</div>
           </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search learners..." 
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
          <div style={{ width: '180px' }}>
             <GlassSelect 
               label="Track Filter" 
               options={uniqueCourses} 
               value={courseFilter} 
               onChange={setCourseFilter} 
             />
          </div>
          <div style={{ width: '160px' }}>
             <GlassSelect 
               label="Phase" 
               options={['All Statuses', 'Learning', 'Assessment', 'Completed']} 
               value={statusFilter} 
               onChange={setStatusFilter} 
             />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Learner Identity</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Academic Track</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progression</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Phase</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operations</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={5} style={{ padding: '24px' }} className="skeleton-pulse"><div style={{ height: '40px', background: '#f1f5f9', borderRadius: '12px' }}></div></td></tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No learners found matching your criteria.</td>
                </tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-row">
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #c8102e 0%, #9b0a22 100%)', 
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' 
                      }}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600, fontSize: '14px' }}>
                      <BookOpen size={16} color={brandPrimary} /> {student.course}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: '100px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${student.progress}%`, background: brandPrimary, borderRadius: '3px' }}></div>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>{student.progress}%</span>
                    </div>
                  </td>
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
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}><Eye size={18} /></button>
                      <button style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}><Mail size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .hover-row:hover { background: #fcfdfe !important; }
        .skeleton-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
};

export default CM_Students;
