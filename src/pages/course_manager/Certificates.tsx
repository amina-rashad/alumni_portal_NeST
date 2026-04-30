import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Search, 
  Mail, 
  Download, 
  CheckCircle, 
  Clock, 
  User,
  BookOpen,
  Send,
  MoreVertical,
  Filter,
  Loader2
} from 'lucide-react';
import certificateService from '../../services/certificateService';
import type { CertificateRecord } from '../../types/course-manager';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Type moved to global types file

const CM_Certificates: React.FC = () => {
  const [records, setRecords] = useState<CertificateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending Generation' | 'Generated' | 'Sent'>('All');

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      const data = await certificateService.getAllCertificates();
      setRecords(data);
    } catch (err) {
      toast.error('Failed to synchronize certification records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          record.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || record.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAction = async (id: string, action: 'Generated' | 'Sent') => {
    const loadingToast = toast.loading(`${action === 'Generated' ? 'Generating official PDF' : 'Dispatching strategic email'}...`);
    try {
      await certificateService.updateCertificateStatus(id, action);
      setRecords(prev => 
        prev.map(rec => rec.id === id ? { ...rec, status: action } : rec)
      );
      toast.success(`Certificate successfully ${action === 'Generated' ? 'generated' : 'dispatched'}!`, { id: loadingToast });
    } catch (err) {
      toast.error(`Failed to process certificate action.`, { id: loadingToast });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Generation': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Generated': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Sent': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="cm-animate-fade-up" style={{ maxWidth: "1350px", margin: "0 auto", padding: "0 32px 48px 32px", display: "flex", flexDirection: "column", gap: "32px", fontFamily: "\"Inter\", sans-serif" }}>
      {/* Header */}
      <div className="cm-page-header">
        <div>
          <h1 className="cm-title">Certificates</h1>
          <p className="cm-subtitle">Generate and distribute completion certificates to graduates.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', padding: '12px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '40px', height: '40px', background: '#fef2f2', color: '#c8102e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Total Issued</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
              {records.filter(r => r.status === 'Sent' || r.status === 'Generated').length}
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER SECTION (Matched to Reference Image) ── */}
      <div style={{
        background: '#ffffff', 
        borderRadius: '28px', 
        padding: '20px 24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
        border: '1px solid #f1f5f9',
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px',
      }}>
        {/* Search Section */}
        <div style={{ 
          flex: '1 1 45%', 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center',
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '4px 12px',
        }}>
          <Search size={18} style={{ color: '#94a3b8', marginLeft: '8px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', 
              height: '44px', 
              border: 'none', 
              paddingLeft: '12px', 
              paddingRight: '12px',
              fontSize: '14px', 
              fontWeight: 500,
              color: '#1e293b', 
              fontFamily: 'inherit',
              background: 'transparent', 
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Tabs Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#f8fafc', 
          padding: '6px', 
          borderRadius: '18px',
          gap: '4px'
        }}>
          {(['Pending Generation', 'Generated', 'Sent'] as const).map(f => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '10px 20px', 
                  borderRadius: '14px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  fontWeight: 800,
                  fontFamily: 'inherit', 
                  transition: 'all 0.2s', 
                  whiteSpace: 'nowrap',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#1e2d5e' : '#94a3b8',
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Certificates Table */}
      <div className="cm-table-container">
        <div className="overflow-x-auto">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Student Graduate</th>
                <th>Academic Program</th>
                <th>Validation Status</th>
                <th className="text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-24">
                    <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto mb-2" />
                    <span className="text-slate-400 font-bold">Synchronizing graduation records...</span>
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="group">
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1a2652] flex items-center justify-center text-white font-black text-xs shadow-lg">
                          {record.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-black text-[#1e293b] text-sm">{record.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {record.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <BookOpen size={16} className="text-[#c8102e] mt-0.5 shrink-0" />
                          <span className="text-sm font-bold text-[#1e293b] line-clamp-1">{record.courseName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 ml-6">
                          <span className="flex items-center gap-1.5"><Clock size={12}/> {record.issuedDate}</span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">Grade: {record.grade}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`cm-badge ${
                        record.status === 'Sent' ? 'cm-badge-success' : 
                        record.status === 'Generated' ? 'cm-badge-info' : 'cm-badge-warning'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        {record.status === 'Pending Generation' && (
                          <button 
                            onClick={() => handleAction(record.id, 'Generated')}
                            className="cm-btn cm-btn-primary px-5 py-2.5 h-10 text-[11px]"
                          >
                            <Download size={14} /> Generate PDF
                          </button>
                        )}

                        {record.status === 'Generated' && (
                          <button 
                            onClick={() => handleAction(record.id, 'Sent')}
                            className="cm-btn cm-btn-primary px-5 py-2.5 h-10 text-[11px]"
                          >
                            <Send size={14} /> Dispatch Email
                          </button>
                        )}

                        {record.status === 'Sent' && (
                          <button className="cm-btn cm-btn-secondary px-5 py-2.5 h-10 text-[11px]">
                            <Download size={14} /> Archive Copy
                          </button>
                        )}

                        <button className="cm-btn cm-btn-secondary cm-btn-icon h-10 w-10">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-24">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                        <Award size={32} />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No academic records found matching selection.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CM_Certificates;

