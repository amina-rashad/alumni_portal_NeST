import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Linkedin, MessageSquare, UserPlus, Filter, X } from 'lucide-react';
import { networkingApi } from '../services/api';

const UserDirectory: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [specFilter, setSpecFilter] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await networkingApi.listAllUsers({
          q: searchTerm,
          batch: batchFilter,
          spec: specFilter
        });
        const data = res.data as any;
        if (res.success && data && data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error('Failed to fetch directory:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, batchFilter, specFilter]);

  const batches = Array.from({ length: 15 }, (_, i) => (2010 + i).toString());

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', fontFamily: '"Inter", sans-serif' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0d2046', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Alumni <span style={{ color: 'var(--primary)' }}>Directory</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px' }}>
          Connect with fellow professionals, mentors, and batchmates within the NeST global network.
        </p>
      </div>

      <div style={{ 
        background: '#ffffff', 
        padding: '1.5rem', 
        borderRadius: '1.5rem', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
        border: '1px solid #f1f5f9', 
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ gridColumn: 'span 2', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="text"
              placeholder="Search by name, skills, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '1rem', outline: 'none' }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
             <select 
               value={batchFilter}
               onChange={(e) => setBatchFilter(e.target.value)}
               style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '1rem', outline: 'none', appearance: 'none' }}
             >
               <option value="">All Batches</option>
               {batches.map(b => <option key={b} value={b}>{b}</option>)}
             </select>
             <Filter style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} size={16} />
          </div>

          <div style={{ position: 'relative' }}>
             <input 
               type="text"
               placeholder="Specialization..."
               value={specFilter}
               onChange={(e) => setSpecFilter(e.target.value)}
               style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '1rem', outline: 'none' }}
             />
             {(searchTerm || batchFilter || specFilter) && (
               <button onClick={() => {setSearchTerm(''); setBatchFilter(''); setSpecFilter('');}} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                 <X size={16} />
               </button>
             )}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
           <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : users.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {users.map((member) => (
            <motion.div 
              key={member.id}
              whileHover={{ y: -5 }}
              style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}
            >
                <div style={{ borderTop: '1px solid #f8fafc', marginTop: 'auto', paddingTop: '1rem' }}>
                 <div style={{ position: 'relative' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '1rem', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                       {member.profile_picture ? (
                         <img src={member.profile_picture} alt={member.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       ) : (
                         <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff1f1', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 800 }}>
                            {member.full_name.charAt(0)}
                         </div>
                       )}
                    </div>
                    <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '24px', height: '24px', backgroundColor: '#22c55e', border: '4px solid #ffffff', borderRadius: '50%' }} />
                 </div>
                 <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d2046', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>{member.full_name}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{member.specialization || "Engineering Professional"}</p>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '0.5rem', width: 'fit-content' }}>
                       Batch of {member.batch || "N/A"}
                    </div>
                 </div>
              </div>

              <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.5rem', minHeight: '40px' }}>
                {member.bio || "No bio provided. This member is part of the NeST alumni network."}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(member.skills || []).slice(0, 3).map((skill: string, i: number) => (
                   <span key={i} style={{ padding: '0.25rem 0.6rem', backgroundColor: '#fafafa', color: '#64748b', fontSize: '0.65rem', fontWeight: 800, borderRadius: '0.4rem', border: '1px solid #f1f5f9', textTransform: 'uppercase' }}>{skill}</span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #f8fafc' }}>
                 <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Linkedin style={{ color: '#94a3b8', cursor: 'pointer' }} size={18} />
                    <MessageSquare style={{ color: '#94a3b8', cursor: 'pointer' }} size={18} />
                 </div>
                 <button style={{ padding: '0.5rem 1rem', backgroundColor: '#0d2046', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Connect <UserPlus size={14} />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
           <Search style={{ color: '#cbd5e1', marginBottom: '1rem' }} size={48} />
           <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d2046' }}>No members found</h3>
           <p style={{ color: '#64748b' }}>Try adjusting your filters.</p>
        </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default UserDirectory;

