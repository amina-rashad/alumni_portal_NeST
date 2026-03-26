import React, { useState } from 'react';
import {
  Users, Briefcase, Calendar, CheckCircle2,
  Clock, XCircle, Search, Filter, MoreVertical,
  Download, Send, Eye, Brain
} from 'lucide-react';
import { motion } from 'framer-motion';

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

  // Dummy Application Data with AI Match Scores
  const applications: Application[] = [
    {
      id: '1',
      candidate: { name: 'Sarah Wilson', email: 'sarah.w@example.com', avatar: 'SW' },
      role: 'Software Engineer',
      date: 'Oct 24, 2023',
      aiScore: 94,
      matchQuality: 'High',
      status: 'Reviewing'
    },
    {
      id: '2',
      candidate: { name: 'James Miller', email: 'j.miller@example.com', avatar: 'JM' },
      role: 'Product Designer',
      date: 'Oct 23, 2023',
      aiScore: 78,
      matchQuality: 'Medium',
      status: 'Pending'
    },
    {
      id: '3',
      candidate: { name: 'Anita Gupta', email: 'anita.g@example.com', avatar: 'AG' },
      role: 'Full Stack Developer',
      date: 'Oct 22, 2023',
      aiScore: 96,
      matchQuality: 'High',
      status: 'Interview'
    },
    {
      id: '4',
      candidate: { name: 'Robert Chen', email: 'r.chen@example.com', avatar: 'RC' },
      role: 'Data Scientist',
      date: 'Oct 21, 2023',
      aiScore: 62,
      matchQuality: 'Low',
      status: 'Rejected'
    },
    {
      id: '5',
      candidate: { name: 'Elena Rodriguez', email: 'elena.r@example.com', avatar: 'ER' },
      role: 'UX Researcher',
      date: 'Oct 20, 2023',
      aiScore: 88,
      matchQuality: 'High',
      status: 'Reviewing'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: '#fff7ed', border: '#ffedd5', text: '#9a3412', icon: <Clock size={12} /> };
      case 'Reviewing': return { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af', icon: <Eye size={12} /> };
      case 'Interview': return { bg: '#fdf4ff', border: '#fae8ff', text: '#86198f', icon: <Send size={12} /> };
      case 'Hired': return { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', icon: <CheckCircle2 size={12} /> };
      case 'Rejected': return { bg: '#fef2f2', border: '#fee2e2', text: '#991b1b', icon: <XCircle size={12} /> };
      default: return { bg: '#f8fafc', border: '#f1f5f9', text: '#64748b', icon: <Clock size={12} /> };
    }
  };

  const getMatchQualityColor = (quality: string) => {
    switch (quality) {
      case 'High': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Applications Management</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Track and manage job applications with AI recruitment insights.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', fontWeight: 500, cursor: 'pointer' }}>
            <Download size={18} /> Export List
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Total Applications', value: '1,248', icon: <Users size={24} />, color: '#3b82f6' },
          { label: 'AI Shortlisted', value: '384', icon: <Brain size={24} />, color: '#8b5cf6' },
          { label: 'Active Interviews', value: '56', icon: <Send size={24} />, color: '#10b981' },
          { label: 'Rejected Applications', value: '142', icon: <XCircle size={24} />, color: '#f43f5e' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
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

      <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)', overflow: 'hidden' }}>
        {/* Table Filters */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdfdfd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0 16px', flex: 1, maxWidth: '400px' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by name, role or skill..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '12px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#1e293b', fontWeight: 500, cursor: 'pointer' }}>
              <Filter size={16} /> Filters
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#1e293b', fontWeight: 500, cursor: 'pointer' }}>
              <Briefcase size={16} /> All Jobs
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>CANDIDATE</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>ROLE</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>DATE APPLIED</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>AI SCORE</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>STATUS</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => {
                const status = getStatusColor(app.status);
                return (
                  <motion.tr 
                    key={app.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    whileHover={{ background: '#f8fafc' }}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>
                          {app.candidate.avatar}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{app.candidate.name}</span>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{app.candidate.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>{app.role}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {['React', 'Node.js'].map((skill, idx) => (
                            <span key={idx} style={{ fontSize: '10px', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', color: '#64748b' }}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} /> {app.date}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '10px', minWidth: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${app.aiScore}%`, height: '100%', background: getMatchQualityColor(app.matchQuality), borderRadius: '10px' }}></div>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: getMatchQualityColor(app.matchQuality) }}>{app.aiScore}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        background: status.bg, 
                        color: status.text, 
                        border: `1px solid ${status.border}` 
                      }}>
                        {status.icon} {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-highlight">
                          <Eye size={16} />
                        </button>
                        <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>Showing 1 to 5 of 1,248 entries</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>Previous</button>
            <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Applications;
