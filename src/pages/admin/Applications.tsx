import React, { useState } from 'react';
import {
  Users, Briefcase, Calendar, CheckCircle2,
  Clock, XCircle, Search, Filter, MoreVertical,
  Download, Send, Eye, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Application {
  id: string;
  candidate: {
    name: string;
    email: string;
    avatar: string;
  };
  role: string;
  date: string;
  aiScore: number;
  matchQuality: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Reviewing' | 'Interview' | 'Hired' | 'Rejected';
}

const Applications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dummy Application Data
  const applications: Application[] = [
    { id: '1', candidate: { name: 'Sarah Wilson', email: 'sarah.w@example.com', avatar: 'SW' }, role: 'Software Engineer', date: 'Oct 24, 2023', aiScore: 94, matchQuality: 'High', status: 'Reviewing' },
    { id: '2', candidate: { name: 'James Miller', email: 'j.miller@example.com', avatar: 'JM' }, role: 'Product Designer', date: 'Oct 23, 2023', aiScore: 78, matchQuality: 'Medium', status: 'Pending' },
    { id: '3', candidate: { name: 'Anita Gupta', email: 'anita.g@example.com', avatar: 'AG' }, role: 'Full Stack Developer', date: 'Oct 22, 2023', aiScore: 96, matchQuality: 'High', status: 'Interview' },
    { id: '4', candidate: { name: 'Robert Chen', email: 'r.chen@example.com', avatar: 'RC' }, role: 'Data Scientist', date: 'Oct 21, 2023', aiScore: 62, matchQuality: 'Low', status: 'Rejected' },
    { id: '5', candidate: { name: 'Elena Rodriguez', email: 'elena.r@example.com', avatar: 'ER' }, role: 'UX Researcher', date: 'Oct 20, 2023', aiScore: 88, matchQuality: 'High', status: 'Reviewing' }
  ];

  const filteredApplications = applications.filter(app => 
    app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: '#fff7ed', border: '#ffedd5', text: '#9a3412', icon: <Clock size={12} /> };
      case 'Reviewing': return { bg: '#e0e7ff', border: '#dbeafe', text: '#1e3a8a', icon: <Eye size={12} /> };
      case 'Interview': return { bg: '#fdf4ff', border: '#fae8ff', text: '#86198f', icon: <Send size={12} /> };
      case 'Hired': return { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', icon: <CheckCircle2 size={12} /> };
      case 'Rejected': return { bg: '#fef2f2', border: '#fee2e2', text: '#991b1b', icon: <XCircle size={12} /> };
      default: return { bg: '#f8fafc', border: '#f1f5f9', text: '#64748b', icon: <Clock size={12} /> };
    }
  };

  const getMatchQualityColor = (quality: string) => {
    switch (quality) {
      case 'High': return '#16a34a'; /* Replaced green with a deeper one */
      case 'Medium': return '#f59e0b';
      case 'Low': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Applications</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Track and manage job applications with AI insights.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#1e3a8a', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)' }} 
            onClick={() => setIsModalOpen(true)}
          >
            Post Job
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 16px', flex: 1, maxWidth: '400px' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: '#1e293b' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>CANDIDATE</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>ROLE</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>DATE</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>AI SCORE</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app, i) => {
                const status = getStatusColor(app.status);
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1e3a8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{app.candidate.avatar}</div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{app.candidate.name}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{app.candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}><span style={{ fontSize: '14px', color: '#475569' }}>{app.role}</span></td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{app.date}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '4px', background: '#f1f5f9', borderRadius: '10px', minWidth: '80px', overflow: 'hidden' }}>
                           <div style={{ width: `${app.aiScore}%`, height: '100%', background: getMatchQualityColor(app.matchQuality) }}></div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: getMatchQualityColor(app.matchQuality) }}>{app.aiScore}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: status.bg, color: status.text }}>
                        {status.icon} {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Eye size={18} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><MoreVertical size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '500px' }}>
               <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Post New Job</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input type="text" placeholder="Job Title" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  <textarea placeholder="Description" rows={4} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', resize: 'none' }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                    <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600 }}>Cancel</button>
                    <button style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#1e3a8a', color: '#fff', fontWeight: 600 }}>Post Job</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Applications;
