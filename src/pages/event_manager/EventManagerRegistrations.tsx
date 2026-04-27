import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ClipboardList, Search, FileText, CheckCircle2, XCircle, 
  Clock, ArrowUpRight, UserPlus, X, Mail, Phone, Calendar as CalendarIcon, MapPin, 
  Download, Filter, ChevronRight
} from 'lucide-react';

const registrationsData = [
  { id: 'REG-001', name: 'John Doe', email: 'john.doe@example.com', phone: '+91 98765 43210', event: 'Global Alumni Meet 2024', type: 'Alumni', status: 'Attended', date: '2024-03-22 10:30 AM' },
  { id: 'REG-002', name: 'Sara Wilson', email: 'sara.w@example.com', phone: '+91 98765 43211', event: 'Web Development Workshop', type: 'Student', status: 'Not Attended', date: '2024-03-22 11:45 AM' },
  { id: 'REG-003', name: 'Michael Chen', email: 'm.chen@tech.com', phone: '+91 98765 43212', event: 'Tech Talk: Future of AI', type: 'Intern', status: 'Attended', date: '2024-03-21 02:15 PM' },
  { id: 'REG-004', name: 'Emily Davis', email: 'emily.d@university.edu', phone: '+91 98765 43213', event: 'Global Alumni Meet 2024', type: 'Student', status: 'Not Attended', date: '2024-03-20 09:00 AM' },
  { id: 'REG-005', name: 'David Miller', email: 'david.m@nest.com', phone: '+91 98765 43214', event: 'Networking Lunch', type: 'Faculty', status: 'Attended', date: '2024-03-22 08:30 AM' },
];

const EventManagerRegistrations: React.FC = () => {
  const brandPrimary = '#233167';
  const [searchTerm, setSearchTerm] = useState('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleReview = (reg: any) => {
    setSelectedReg(reg);
    setIsReviewOpen(true);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Participant report has been exported as CSV successfully!');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Section */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0, fontFamily: "'Montserrat', sans-serif" }}>Participant Tracking</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Review and manage student and alumni participation records.</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Expected Now', value: '12', color: brandPrimary, icon: <UserPlus size={20} /> },
          { label: 'Yet to Attend', value: '08', color: '#f59e0b', icon: <Clock size={20} /> },
          { label: 'Attended Today', value: '25', color: '#10b981', icon: <CheckCircle2 size={20} /> },
          { label: 'Absent', value: '03', color: '#ef4444', icon: <XCircle size={20} /> },
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
              <div style={{ color: item.color }}>{item.icon}</div>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: '12px', marginBottom: 0 }}>{item.value}</h3>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: item.color, opacity: 0.2 }}></div>
          </div>
        ))}
      </div>

      {/* Main Table Content */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or registrant name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '14px', transition: 'all 0.2s' }} 
              onFocus={e => e.currentTarget.style.borderColor = brandPrimary}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              style={{ 
                padding: '12px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, color: '#475569', fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', opacity: isExporting ? 0.7 : 1
              }}
              onMouseEnter={e => !isExporting && (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => !isExporting && (e.currentTarget.style.background = '#fff')}
            >
              {isExporting ? <div className="spinner"></div> : <Download size={18} />}
              {isExporting ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>ID / Info</th>
                <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Event Details</th>
                <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Attendee Type</th>
                <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '20px 24px', color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
               {registrationsData.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase())).map((reg) => (
                <tr key={reg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{reg.id}</div>
                    <div style={{ color: '#64748b', fontSize: '13px' }}>{reg.name}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 600, color: '#475569', fontSize: '14px' }}>{reg.event}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/>{reg.date}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{reg.type}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      background: reg.status === 'Attended' ? '#f0fdf4' : '#fef2f2',
                      color: reg.status === 'Attended' ? '#15803d' : '#b91c1c'
                    }}>
                      {reg.status === 'Attended' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {reg.status}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <button 
                      onClick={() => handleReview(reg)}
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '10px', 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        color: '#1e293b', 
                        fontSize: '13px', 
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                    >
                      <FileText size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ padding: '20px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: brandPrimary, fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            View All Registration History <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
      {/* Review Side Drawer */}
      <AnimatePresence>
        {isReviewOpen && selectedReg && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReviewOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'relative', width: '450px', background: '#fff', height: '100%', boxShadow: '-10px 0 40px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: brandPrimary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Registration Review</div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>{selectedReg.id}</h2>
                </div>
                <button onClick={() => setIsReviewOpen(false)} style={{ padding: '8px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: brandPrimary, color: '#fff', fontSize: '32px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    {selectedReg.name.charAt(0)}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{selectedReg.name}</h3>
                  <div style={{ fontSize: '14px', color: brandPrimary, fontWeight: 700, marginTop: '4px' }}>{selectedReg.type} Registry</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                   <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(35, 49, 103, 0.05)', color: brandPrimary }}><Mail size={18} /></div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</div>
                        <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>{selectedReg.email}</div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(35, 49, 103, 0.05)', color: brandPrimary }}><Phone size={18} /></div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Phone Number</div>
                        <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>{selectedReg.phone}</div>
                      </div>
                   </div>
                   <div style={{ height: '1px', background: '#f1f5f9', margin: '8px 0' }} />
                   <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(35, 49, 103, 0.05)', color: brandPrimary }}><CalendarIcon size={18} /></div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Event Applied</div>
                        <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>{selectedReg.event}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Requested on {selectedReg.date}</div>
                      </div>
                   </div>
                </div>

                <div style={{ marginTop: '40px' }}>
                   <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>Attendance Log</div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <button 
                        onClick={() => { alert('Marked as Attended!'); setIsReviewOpen(false); }}
                        style={{ padding: '14px', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <CheckCircle2 size={18} /> Mark Attended
                      </button>
                      <button 
                        onClick={() => { alert('Marked as Absent.'); setIsReviewOpen(false); }}
                        style={{ padding: '14px', borderRadius: '14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <XCircle size={18} /> Mark Absent
                      </button>
                   </div>
                </div>
              </div>

              <div style={{ padding: '32px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                 <button onClick={() => setIsReviewOpen(false)} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: brandPrimary, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(35, 49, 103, 0.2)' }}>Close Panel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0,0,0,0.1);
          border-top-color: #475569;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default EventManagerRegistrations;
