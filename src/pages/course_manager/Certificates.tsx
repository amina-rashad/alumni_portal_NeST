import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface CertificateRecord {
  id: string;
  studentName: string;
  course: string;
  completionDate: string;
  grade: string;
  status: 'Pending Generation' | 'Generated' | 'Sent';
}

const CM_Certificates: React.FC = () => {
  const initialRecords: CertificateRecord[] = [
    { id: 'cert-001', studentName: 'David Chen', course: 'UX Design Fundamentals', completionDate: 'Oct 24, 2023', grade: '98%', status: 'Sent' },
    { id: 'cert-002', studentName: 'Emily Brown', course: 'Cloud Infrastructure with AWS', completionDate: 'Oct 23, 2023', grade: '92%', status: 'Generated' },
    { id: 'cert-003', studentName: 'James Taylor', course: 'React Performance Optimization', completionDate: 'Oct 25, 2023', grade: '95%', status: 'Pending Generation' },
    { id: 'cert-004', studentName: 'Sophia Martinez', course: 'Advanced Full-Stack Architecture', completionDate: 'Oct 20, 2023', grade: '88%', status: 'Sent' },
    { id: 'cert-005', studentName: 'Lucas Wilson', course: 'UX Design Fundamentals', completionDate: 'Oct 25, 2023', grade: '91%', status: 'Pending Generation' },
  ];

  const [records, setRecords] = useState<CertificateRecord[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending Generation' | 'Generated' | 'Sent'>('All');

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          record.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || record.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAction = async (id: string, action: 'Generated' | 'Sent') => {
    const loadingToast = toast.loading(`${action === 'Generated' ? 'Generating' : 'Sending'} certificate...`);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecords(prev => 
        prev.map(rec => rec.id === id ? { ...rec, status: action } : rec)
      );
      
      toast.success(`Certificate ${action === 'Generated' ? 'generated' : 'sent'} successfully!`, { id: loadingToast });
    } catch (err) {
      toast.error(`Failed to ${action.toLowerCase()} certificate.`, { id: loadingToast });
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Certificates</h1>
          <p className="text-slate-500 font-medium mt-1">Generate and distribute completion certificates to graduates.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-red-50 rounded-xl text-[#c8102e]">
            <Award size={20} />
          </div>
          <div className="pr-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Issued</div>
            <div className="text-lg font-black text-[#1e293b] leading-tight">856</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c8102e] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by student or course..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all font-bold text-[#1e293b] placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full md:w-auto overflow-x-auto">
          {(['All', 'Pending Generation', 'Generated', 'Sent'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-white text-[#1a2652] shadow-md border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-600 border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Graduate</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Program</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Validation Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/30 transition-colors group">
                    {/* Student Info */}
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1a2652] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-900/20">
                          {record.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-black text-[#1e293b] text-base">{record.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {record.id}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Course & Date */}
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <BookOpen size={16} className="text-[#c8102e] mt-0.5 shrink-0" />
                          <span className="text-base font-bold text-[#1e293b] line-clamp-1">{record.course}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 ml-6">
                          <span className="flex items-center gap-1.5"><Clock size={12}/> Completed {record.completionDate}</span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">Grade: {record.grade}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${getStatusColor(record.status)}`}>
                        {record.status === 'Sent' ? <CheckCircle size={12} strokeWidth={3} /> : record.status === 'Generated' ? <Award size={12} strokeWidth={3} /> : <Clock size={12} strokeWidth={3} />}
                        {record.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                        
                        {record.status === 'Pending Generation' && (
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAction(record.id, 'Generated')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2652] text-white hover:bg-[#c8102e] rounded-xl font-black text-xs transition-all shadow-lg shadow-indigo-900/10"
                          >
                            <Download size={14} /> Generate PDF
                          </motion.button>
                        )}

                        {record.status === 'Generated' && (
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAction(record.id, 'Sent')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#c8102e] text-white hover:bg-[#a00d25] rounded-xl font-black text-xs shadow-xl shadow-red-900/20 transition-all"
                          >
                            <Send size={14} /> Dispatch Email
                          </motion.button>
                        )}

                        {record.status === 'Sent' && (
                          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 rounded-xl font-black text-xs transition-all shadow-sm">
                            <Download size={14} /> Archive Copy
                          </button>
                        )}

                        <button className="p-2.5 text-slate-300 hover:text-[#1e293b] hover:bg-slate-100 rounded-xl transition-all">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                        <Award size={32} />
                      </div>
                      <p className="text-slate-400 font-bold">No academic records found matching your selection.</p>
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

