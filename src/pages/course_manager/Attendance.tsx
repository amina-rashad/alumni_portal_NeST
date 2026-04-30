import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Search, 
  Download,
  ChevronRight,
  BookOpen,
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { attendanceService } from '../../services/attendanceService';
import type { StudentAttendanceSummary } from '../../types/course-manager';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

const Attendance: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('Full Stack Development with React & Node');
  const [attendanceData, setAttendanceData] = useState<StudentAttendanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const courses = [
    'Advanced Cloud Architecture & DevOps',
    'Full Stack Development with React & Node',
    'Data Science & Machine Learning Essentials',
    'Cybersecurity Fundamentals & Ethical Hacking',
    'UX Design Masterclass: Theory to Practice'
  ];

  const loadAttendance = async () => {
    try {
      setIsLoading(true);
      const data = await attendanceService.getAttendanceByCourse(selectedCourse);
      setAttendanceData(data);
    } catch (err) {
      toast.error('Failed to load session logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedCourse]);

  const handleUpdateStatus = async (studentId: string, status: StudentAttendanceSummary['todayStatus']) => {
    const loadingToast = toast.loading('Updating session status...');
    try {
      await attendanceService.updateStudentAttendance(studentId, status);
      toast.success('Attendance updated successfully', { id: loadingToast });
      loadAttendance();
    } catch (err) {
      toast.error('Failed to update status', { id: loadingToast });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const loadingToast = toast.loading('Generating graduation-ready attendance report...');
    try {
      const fileName = await attendanceService.exportAttendanceReport(selectedCourse);
      toast.success(`Report ${fileName} ready for download!`, { id: loadingToast });
    } catch (err) {
      toast.error('Export failed', { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  const filteredData = attendanceData.filter(a => 
    a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pieData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [
      {
        data: [
          attendanceData.filter(a => a.todayStatus === 'Present').length,
          attendanceData.filter(a => a.todayStatus === 'Late').length,
          attendanceData.filter(a => a.todayStatus === 'Absent').length,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Average Minutes Spent',
        data: [110, 145, 120, 160, 135],
        backgroundColor: '#1a2652',
        borderRadius: 8,
      },
    ],
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="cm-animate-fade-up" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px 48px 32px", display: "flex", flexDirection: "column", gap: "28px", fontFamily: "\"Inter\", sans-serif" }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.03em' }}>Attendance Insights</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
            Course-wise student engagement and login duration analytics.
          </p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          style={{
            height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none',
            background: '#ffffff', color: '#1e293b', fontWeight: 800, fontSize: '13px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
            fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9'
          }}
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          Export Strategic Report
        </button>
      </div>

      {/* ── STRICT CSS GRID LAYOUT (2 Columns x 2 Rows) ── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr', 
        gridTemplateRows: 'auto auto',
        gap: '24px',
        width: '100%'
      }}>
        
        {/* ROW 1, LEFT: Select Program */}
        <div style={{ 
          background: '#fff', borderRadius: '20px', padding: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
          display: 'flex', flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Select Program</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {courses.map(course => {
              const isActive = selectedCourse === course;
              return (
                <button
                  key={course}
                  onClick={() => setSelectedCourse(course)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '14px 16px', borderRadius: '14px', border: 'none', transition: 'all 0.3s',
                    background: isActive ? '#c8102e' : '#f8fafc',
                    color: isActive ? '#fff' : '#475569',
                    cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <BookOpen size={14} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.5 }} />
                    <span style={{ fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course}</span>
                  </div>
                  <ChevronRight size={14} style={{ flexShrink: 0, opacity: 0.5 }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 1, RIGHT: Weekly Engagement */}
        <div style={{ 
          background: '#fff', borderRadius: '20px', padding: '28px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', margin: 0 }}>Weekly Engagement</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, marginTop: '4px' }}>Average Minutes per Session</p>
            </div>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              This Week
            </span>
          </div>
          <div style={{ width: '100%', height: '280px', maxHeight: '280px', overflow: 'hidden' }}>
            <Bar 
              data={barData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } },
                  x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } }
                }
              }} 
            />
          </div>
        </div>

        {/* ROW 2, LEFT: Attendance Split */}
        <div style={{ 
          background: '#fff', borderRadius: '20px', padding: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
          display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px'
        }}>
          <h3 style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Attendance Split</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: '100%', height: '240px' }}>
              <Pie 
                data={pieData} 
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false
                }} 
              />
            </div>
          </div>
          {/* Custom Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
            {[
              { label: 'Present', color: '#10b981' },
              { label: 'Late', color: '#f59e0b' },
              { label: 'Absent', color: '#ef4444' }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 2, RIGHT: Student Session Logs (BESIDE Attendance Split) */}
        <div style={{ 
          background: '#fff', borderRadius: '20px', 
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', 
          overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', margin: 0 }}>Student Session Logs</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginTop: '4px' }}>Daily engagement data for current track</p>
            </div>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..." 
                style={{
                  width: '100%', height: '38px', borderRadius: '999px', border: '1px solid #e2e8f0',
                  paddingLeft: '36px', paddingRight: '12px', fontSize: '13px', background: '#f8fafc', outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 0.8fr', background: '#f8fafc', padding: '12px 24px', borderBottom: '1px solid #f1f5f9' }}>
              {['Student', 'Track', 'Login', 'Status', 'Update'].map(col => (
                <div key={col} style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</div>
              ))}
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#c8102e', margin: '0 auto' }} />
                </div>
              ) : filteredData.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No records found.</div>
              ) : filteredData.map((record) => (
                <div key={record.studentId} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 0.8fr', padding: '16px 24px', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1a2652', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>
                      {initials(record.studentName)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.studentName}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{record.studentEmail}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${record.percentage}%`, background: record.percentage < 75 ? '#ef4444' : '#10b981' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: record.percentage < 75 ? '#ef4444' : '#10b981' }}>{record.percentage}%</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} style={{ color: '#c8102e' }} /> {record.todayLogin}
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{record.todayDuration} MINS</div>
                  </div>

                  <div>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '999px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase',
                      background: record.todayStatus === 'Present' ? '#f0fdf4' : record.todayStatus === 'Late' ? '#fff7ed' : '#fef2f2',
                      color: record.todayStatus === 'Present' ? '#15803d' : record.todayStatus === 'Late' ? '#c2410c' : '#dc2626',
                      border: `1px solid ${record.todayStatus === 'Present' ? '#bbf7d0' : record.todayStatus === 'Late' ? '#fed7aa' : '#fecaca'}`
                    }}>
                      {record.todayStatus}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button onClick={() => handleUpdateStatus(record.studentId, 'Present')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}><CheckCircle size={16} /></button>
                    <button onClick={() => handleUpdateStatus(record.studentId, 'Absent')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}><XCircle size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        /* Custom scrollbar for Student Logs */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; borderRadius: 4px; }
      `}</style>
    </div>
  );
};

export default Attendance;
