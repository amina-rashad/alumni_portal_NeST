import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Calendar, Eye, Trash2, Edit, Plus, Search, Filter, MoreVertical, Signal, CheckCircle, Clock, Users, ChevronDown } from 'lucide-react';
import { recruiterApi } from '../../services/api';
import { Link } from 'react-router-dom';

const smoothSpring = { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: smoothSpring }
};

const RecruiterJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await recruiterApi.getMyJobs();
      if (response.success && response.data) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this listing permanently?')) {
        try {
            const response = await recruiterApi.deleteJob(id);
            if (response.success) {
                setJobs(prev => prev.filter(j => j.id !== id));
            }
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    }
  };

  const filteredJobs = jobs.filter(job => {
    const titleMatch = job?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const locationMatch = job?.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || locationMatch;
  });

  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      
      <style>{`
        .luxury-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .luxury-card:hover {
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }
        .search-wrapper:focus-within {
          border-color: ${nestNavy} !important;
          box-shadow: 0 0 0 3px rgba(26, 38, 82, 0.1);
        }
        .btn-plus {
          background: ${nestNavy};
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          alignItems: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(26, 38, 82, 0.2);
          transition: all 0.2s;
        }
        .btn-plus:hover {
          background: #0f172a;
          transform: translateY(-2px);
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Briefcase size={20} color={nestRed} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Position Management</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>Manage Job Postings</h1>
        </div>
        <Link to="/recruiter/jobs/post" style={{ textDecoration: 'none' }}>
          <button className="btn-plus">
            <Plus size={20} /> Post New Job
          </button>
        </Link>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '40px', 
        background: '#fff', 
        padding: '12px', 
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <div 
          className="search-wrapper"
          style={{ position: 'relative', flex: 1, border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s' }}
        >
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input
            type="text"
            placeholder="Search roles, locations, or requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 48px',
              borderRadius: '12px',
              border: 'none',
              background: '#ffffff',
              outline: 'none',
              fontSize: '14px',
              color: '#1e293b'
            }}
          />
        </div>
        <button style={{ 
          padding: '0 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px'
        }}>
          <Filter size={18} /> Refine
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
           <motion.div
             animate={{ rotate: 360 }}
             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
             style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #1a2652', borderRadius: '50%' }}
           />
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '30px',
            alignItems: 'start'
          }}
        >
          <AnimatePresence>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, translateY: -10 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="luxury-card"
                  style={{ 
                    padding: '30px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(26, 38, 82, 0.08) 100%)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px' }}>
                     <span style={{ 
                        background: job.is_active ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9', 
                        color: job.is_active ? '#059669' : '#64748b', 
                        padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' 
                     }}>
                        {job.is_active ? 'Active' : 'Closed'}
                     </span>
                  </div>

                  <div style={{ 
                      width: '60px', height: '60px', background: 'rgba(26, 38, 82, 0.05)', borderRadius: '18px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: nestNavy, marginBottom: '20px',
                      border: '1px solid rgba(26, 38, 82, 0.05)'
                  }}>
                    <Briefcase size={30} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#111827', margin: '0 0 16px 0', lineHeight: 1.3 }}>{job.title}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '14px', fontWeight: 600 }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={14} color={nestRed} />
                        </div>
                        {job.location}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '14px', fontWeight: 600 }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={14} color="#10b981" />
                        </div>
                        {job.salary || 'Market Rate'}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={14} />
                        </div>
                        Posted on {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Expandable Balance Details */}
                    <details style={{ marginBottom: '20px' }}>
                        <summary style={{ 
                            fontSize: '12px', fontWeight: 800, color: nestNavy, cursor: 'pointer', 
                            listStyle: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(26, 38, 82, 0.05)', padding: '8px 12px', borderRadius: '8px', width: 'fit-content'
                        }}>
                             <ChevronDown size={14} /> More Details
                        </summary>
                        <div style={{ 
                            marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.4)', 
                            borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', fontSize: '13px'
                        }}>
                            <p style={{ margin: '0 0 12px 0', color: '#1e293b', fontWeight: 600, lineHeight: 1.6, textAlign: 'justify' }}>{job.description}</p>
                            
                            {job.requirements && job.requirements.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Requirements</p>
                                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', textAlign: 'justify' }}>
                                        {job.requirements.map((req: string, i: number) => <li key={i} style={{ marginBottom: '4px' }}>{req}</li>)}
                                    </ul>
                                </div>
                            )}

                            {job.skills_required && job.skills_required.length > 0 && (
                                <div>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Key Skills Portfolio</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {job.skills_required.map((skill: string, i: number) => (
                                            <span key={i} style={{ 
                                                background: nestNavy, color: '#fff', padding: '4px 12px', 
                                                borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                                boxShadow: '0 2px 4px rgba(26, 38, 82, 0.1)'
                                            }}>{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </details>

                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(26, 38, 82, 0.03)', 
                        padding: '10px 14px', borderRadius: '12px', marginBottom: '24px' 
                    }}>
                    <Users size={16} color={nestNavy} />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: nestNavy }}>{job.application_count} Applicants</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <button style={{ 
                        padding: '12px', borderRadius: '12px', border: 'none', background: nestNavy, 
                        color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px',
                        boxShadow: '0 4px 12px rgba(26, 38, 82, 0.15)'
                    }}>
                      <Users size={16} /> Manage Candidates
                    </button>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                        <button style={{ 
                            padding: '12px', borderRadius: '12px', 
                            background: 'rgba(26, 38, 82, 0.08)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(26, 38, 82, 0.2)',
                            color: nestNavy, fontWeight: 800, cursor: 'pointer', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px',
                            transition: 'all 0.2s'
                        }}>
                          <Edit size={16} /> Edit Listing
                        </button>
                        <button 
                            onClick={() => handleDelete(job.id)}
                            style={{ 
                            width: '45px', height: '45px', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fff', 
                            color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}>
                          <Trash2 size={18} />
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
                <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                    <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#cbd5e1' }}>
                       <Briefcase size={32} />
                    </div>
                    <h3 style={{ color: '#1e293b', fontWeight: 700, margin: '0 0 8px 0' }}>No active listings found</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>You haven't posted any jobs yet or your search criteria didn't match.</p>
                </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
      
      <div style={{ paddingBottom: '4rem' }} />
    </div>
  );
};

export default RecruiterJobs;
