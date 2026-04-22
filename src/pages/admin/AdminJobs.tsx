import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Plus, 
  Download, Eye, Edit2, MoreHorizontal,
  Search, Calendar
} from 'lucide-react';
import { jobsApi, adminApi } from '../../services/api';

const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const nestNavy = '#1a2652';

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      const res = await jobsApi.getAllJobs();
      if (res.success && res.data) {
        setJobs((res.data as any).jobs || []);
      }
      setIsLoading(false);
    };
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      const res = await adminApi.deleteJob(id);
      if (res.success) {
        setJobs(jobs.filter(j => j.id !== id));
      } else {
        alert(res.message || 'Failed to delete job');
      }
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Job Management</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Manage all job postings and track applicant interest.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', color: '#f59e0b' }}>
             <Briefcase size={24} />
          </div>
          <div>
             <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{jobs.length}</div>
             <div style={{ fontSize: '13px', color: '#64748b' }}>Active Job Postings</div>
          </div>
        </div>
        <div style={{ flex: 2 }} />

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/admin/jobs/post" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              background: '#1A2652', color: '#fff', border: 'none', padding: '14px 24px', 
              borderRadius: '14px', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
              width: '100%', boxShadow: '0 8px 24px rgba(26, 38, 82, 0.2)'
            }}>
              <Plus size={20} />
              Post Job
            </button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#fff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          padding: '8px 12px',
          width: '300px'
        }}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search jobs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              border: 'none', 
              outline: 'none', 
              marginLeft: '8px', 
              width: '100%',
              fontSize: '13px',
              color: '#1e293b',
              background: 'transparent'
            }} 
          />
        </div>
      </div>

      {/* Data Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading jobs...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Job Title</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Company</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Location</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Salary</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No jobs found.</td>
                </tr>
              ) : filteredJobs.map((job, index) => (
                <tr key={job.id} style={{ borderBottom: index !== filteredJobs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '8px', 
                        background: '#eff6ff', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Briefcase size={18} color="#3b82f6" />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{job.title}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{job.company}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{job.location}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#10b981', fontWeight: 600 }}>{job.salary}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} title="View"><Eye size={18} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete" onClick={() => handleDelete(job.id)}><MoreHorizontal size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;
