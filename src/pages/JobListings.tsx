import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Building, Search, PlusCircle, ExternalLink, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../services/api';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const JobListings: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobsApi.getAllJobs();
        const data = res.data as any;
        if (res.success && data && data.jobs) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error("Failed to fetch job board", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: '#64748b', textDecoration: 'none', marginRight: '1rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
            <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back
          </button>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: 800 }}>Opportunity Board</h1>
        </div>
        
        <button className="link-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0F172A', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '999px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}>
          <PlusCircle size={18} /> Post a Job
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
           <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#0F172A', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
           <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Loading openings...</p>
           <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ background: '#fff', padding: '4rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
           <Briefcase size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
           <h3 style={{ fontSize: '1.25rem', color: '#334155', margin: '0 0 0.5rem 0' }}>No Jobs Available</h3>
           <p style={{ color: '#64748b' }}>Check back later or post a new opportunity for the alumni network.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {jobs.map((job, idx) => (
            <motion.div 
               key={job.id || idx} 
               variants={itemVariants} 
               initial="hidden" animate="visible" 
               style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', cursor: 'pointer' }}
               onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px -10px rgba(0,0,0,0.1)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                 <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '24px', flexShrink: 0, boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}>
                    {(job.company || job.title || 'J').charAt(0).toUpperCase()}
                 </div>
                 {job.salary && <span style={{ padding: '0.35rem 0.75rem', background: '#F0FDF4', color: '#16A34A', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>{job.salary}</span>}
               </div>

               <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem 0' }}>{job.title || 'Career Opportunity'}</h3>
               <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 500 }}>
                 <Building size={16} /> {job.company || 'Confidential Company'}
               </p>

               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B', fontSize: '0.85rem', fontWeight: 500 }}><MapPin size={15}/> {job.location || 'Remote eligible'}</span>
               </div>

               <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 1.5rem 0', flex: 1 }}>
                 {job.description || "Exciting opportunity to join a fast-growing team and make a meaningful impact. Apply now within the NeST portal network to learn more."}
               </p>

               <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}</span>
                 <button style={{ background: 'transparent', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                   View Details <ExternalLink size={16} />
                 </button>
               </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default JobListings;
