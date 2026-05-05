import React, { useState, useRef, useEffect } from 'react';
import { 
  Award, Search, Mail, Download, CheckCircle, Clock, 
  User, BookOpen, Send, MoreVertical, Filter, 
  ChevronDown, ExternalLink, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CertificateRecord {
  id: string;
  studentName: string;
  course: string;
  completionDate: string;
  grade: string;
  status: 'Pending Generation' | 'Generated' | 'Sent';
}

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

const CM_Certificates: React.FC = () => {
  const brandPrimary = '#c8102e';
  const initialRecords: CertificateRecord[] = [
    { id: 'cert-001', studentName: 'David Chen', course: 'UX Design Fundamentals', completionDate: 'Oct 24, 2023', grade: '98%', status: 'Sent' },
    { id: 'cert-002', studentName: 'Emily Brown', course: 'Cloud Infrastructure with AWS', completionDate: 'Oct 23, 2023', grade: '92%', status: 'Generated' },
    { id: 'cert-003', studentName: 'James Taylor', course: 'React Performance Optimization', completionDate: 'Oct 25, 2023', grade: '95%', status: 'Pending Generation' },
    { id: 'cert-004', studentName: 'Sophia Martinez', course: 'Advanced Full-Stack Architecture', completionDate: 'Oct 20, 2023', grade: '88%', status: 'Sent' },
    { id: 'cert-005', studentName: 'Lucas Wilson', course: 'UX Design Fundamentals', completionDate: 'Oct 25, 2023', grade: '91%', status: 'Pending Generation' },
  ];

  const [records, setRecords] = useState<CertificateRecord[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All Records');

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          record.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All Records' || record.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAction = async (id: string, action: 'Generated' | 'Sent') => {
    const loadingToast = toast.loading(`${action === 'Generated' ? 'Generating' : 'Sending'} certificate...`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecords(prev => prev.map(rec => rec.id === id ? { ...rec, status: action } : rec));
      toast.success(`Certificate ${action.toLowerCase()} successfully!`, { id: loadingToast });
    } catch (err) {
      toast.error(`Failed to process certificate.`, { id: loadingToast });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Credential Center</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Issue and manage official digital academic certifications.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
           <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(200, 16, 46, 0.05)', color: brandPrimary }}>
             <Award size={20} />
           </div>
           <div>
             <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Total Issued</div>
             <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>856</div>
           </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search graduates..." 
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
               label="Status Filter" 
               options={['All Records', 'Pending Generation', 'Generated', 'Sent']} 
               value={filter} 
               onChange={setFilter} 
             />
          </div>
          <button style={{ padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Graduate</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Academic Achievement</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credential Status</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operations</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No records found.</td>
                </tr>
              ) : filteredRecords.map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-row">
                  <td style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #1a2652 0%, #0f172a 100%)', 
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' 
                      }}>
                        {record.studentName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{record.studentName}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>ID: {record.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 700, fontSize: '14px' }}>
                         <BookOpen size={14} color={brandPrimary} /> {record.course}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}><Clock size={12} /> {record.completionDate}</span>
                          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '6px', background: '#ecfdf5', color: '#10b981', fontWeight: 700 }}>Grade: {record.grade}</span>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '24px' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                      background: record.status === 'Sent' ? '#ecfdf5' : record.status === 'Generated' ? '#eff6ff' : '#fff7ed',
                      color: record.status === 'Sent' ? '#10b981' : record.status === 'Generated' ? '#3b82f6' : '#f59e0b',
                      border: `1px solid ${record.status === 'Sent' ? 'rgba(16, 185, 129, 0.1)' : record.status === 'Generated' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)'}`
                    }}>
                      {record.status === 'Sent' ? <ShieldCheck size={14} /> : record.status === 'Generated' ? <Download size={14} /> : <Clock size={14} />}
                      {record.status}
                    </span>
                  </td>
                  <td style={{ padding: '24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {record.status === 'Pending Generation' && (
                        <button 
                          onClick={() => handleAction(record.id, 'Generated')}
                          style={{ padding: '10px 16px', borderRadius: '12px', background: brandPrimary, color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Download size={14} /> Generate
                        </button>
                      )}
                      {record.status === 'Generated' && (
                        <button 
                          onClick={() => handleAction(record.id, 'Sent')}
                          style={{ padding: '10px 16px', borderRadius: '12px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Send size={14} /> Dispatch
                        </button>
                      )}
                      {record.status === 'Sent' && (
                        <button style={{ padding: '10px 16px', borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ExternalLink size={14} /> View
                        </button>
                      )}
                      <button style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#94a3b8', cursor: 'pointer' }}>
                        <MoreVertical size={18} />
                      </button>
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
      `}</style>
    </div>
  );
};

export default CM_Certificates;
