import React, { useState, useEffect } from 'react';
import {
  Users, Briefcase, Calendar, CheckCircle2,
  Clock, XCircle, Search, Filter, MoreVertical,
  Download, Send, Eye, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../../services/api';

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
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      setIsLoading(true);
      const res = await adminApi.getApplications();
      if (res.success && res.data && res.data.applications) {
        const mapped = res.data.applications.map((app: any) => ({
          id: app.id,
          candidate: {
            name: app.applicant_name || 'Alumni Member',
            email: app.applicant_email || 'member@nest.com',
            avatar: ''
          },
          role: app.job_title || 'Software Role',
          date: app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Today',
          aiScore: Math.floor(Math.random() * 40) + 60, // Mock AI Score for demo
          matchQuality: 'Medium' as 'Medium',
          status: app.status || 'Pending'
        }));
        setApplications(mapped);
      }
      setIsLoading(false);
    };
    fetchApps();
  }, []);

  const filteredApplications = applications.filter(app => 
    app.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role?.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Applications</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Track and manage job applications with AI insights.</p>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Total Applications', value: applications.length, icon: <Users size={24} />, color: '#3b82f6' },
          { label: 'AI Shortlisted', value: applications.filter(a => (a.aiScore || 0) > 80).length, icon: <Brain size={24} />, color: '#8b5cf6' },
          { label: 'Active Interviews', value: applications.filter(a => a.status === 'Interview').length, icon: <Send size={24} />, color: '#10b981' },
          { label: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, icon: <XCircle size={24} />, color: '#f43f5e' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${stat.color}10`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, margin: '0 0 4px 0' }}>{stat.label}</p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
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
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading applications...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>CANDIDATE</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>ROLE</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>DATE</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>AI SCORE</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>STATUS</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No applications found.</td>
                  </tr>
                ) : applications.map((app, i) => {
                  const status = getStatusColor(app.status || 'Pending');
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                            {app.candidate?.name?.substring(0, 2).toUpperCase() || '??'}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{app.candidate?.name}</span>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{app.candidate?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{app.role}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{app.date}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '10px', minWidth: '80px' }}>
                            <div style={{ width: `${app.aiScore || 0}%`, height: '100%', background: (app.aiScore || 0) > 80 ? '#22c55e' : '#f59e0b', borderRadius: '10px' }}></div>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 700 }}>{app.aiScore || 0}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
                          {status.icon} {app.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b' }}><Eye size={16} /></button>
                          <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b' }}><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
