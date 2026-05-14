import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays, Users, Building, GraduationCap, Plus, ChevronDown,
  Download, Edit2, Trash2, Search, Filter, RefreshCw, Award, Eye, X, FolderDown, Loader2
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { adminApi } from '../../services/api';
import { getIVCertificatePDF } from '../../utils/CertificateGenerator';
import toast from 'react-hot-toast';

const AdminIVStudents: React.FC = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<any[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [specFilter, setSpecFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<string | null>(null);
  
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [issuedStudents, setIssuedStudents] = useState<any[]>([]);

  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  const handleDownloadCollegeZip = async (college: string, students: any[]) => {
    setIsDownloadingZip(college);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${college.replace(/\s+/g, '_')}_Certificates`);
      
      students.forEach(s => {
        const doc = getIVCertificatePDF(s.name, s.batch || '2024', s.date);
        const pdfBlob = doc.output('blob');
        folder?.file(`${s.name.replace(/\s+/g, '_')}_IV_Certificate.pdf`, pdfBlob);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${college.replace(/\s+/g, '_')}_Full_Certification.zip`);
      toast.success(`Downloaded ${students.length} certificates for ${college}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate ZIP');
    } finally {
      setIsDownloadingZip(null);
    }
  };

  const fetchVisits = async () => {
    setIsLoading(true);
    const res = await adminApi.getVisits();
    if (res.success && res.data) {
      setVisits(res.data.visits);
      setFilteredVisits(res.data.visits);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  useEffect(() => {
    let result = visits;

    if (searchQuery) {
      result = result.filter(v =>
        v.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.coordinator_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (batchFilter !== 'All') {
      result = result.filter(v => v.batch === batchFilter);
    }

    if (collegeFilter !== 'All') {
      result = result.filter(v => v.college === collegeFilter);
    }

    if (specFilter !== 'All') {
      result = result.filter(v => (v.branch === specFilter || v.specialization === specFilter));
    }

    setFilteredVisits(result);
  }, [searchQuery, batchFilter, collegeFilter, specFilter, visits]);

  const handleDelete = async (id: string, college: string) => {
    if (window.confirm(`Are you sure you want to delete the visit record for ${college}?`)) {
      const res = await adminApi.deleteVisit(id);
      if (res.success) {
        fetchVisits();
      }
    }
  };

  const handlePreview = (s: any) => {
    const doc = getIVCertificatePDF(s.name, s.batch || '2024', s.date);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const [editingCollege, setEditingCollege] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState('');

  const handleBulkUpdateDate = (college: string) => {
    const allIssued = JSON.parse(localStorage.getItem('full_issued_iv_certificates') || '[]');
    const updated = allIssued.map((s: any) => {
      if (s.college.toUpperCase() === college.toUpperCase()) {
        return { ...s, date: tempDate };
      }
      return s;
    });
    localStorage.setItem('full_issued_iv_certificates', JSON.stringify(updated));
    setEditingCollege(null);
    toast.success(`Updated visit date for all students in ${college}`);
  };

  const handleViewIssued = (collegeName: string) => {
    const allIssued = JSON.parse(localStorage.getItem('full_issued_iv_certificates') || '[]');
    const collegeIssued = allIssued.filter((s: any) => 
      s.college.toLowerCase() === collegeName.toLowerCase()
    );
    setIssuedStudents(collegeIssued);
    setSelectedCollege(collegeName);
  };

  const resetAll = () => {
    setSearchQuery('');
    setBatchFilter('All');
    setCollegeFilter('All');
    setSpecFilter('All');
  };

  const batches = Array.from(new Set(visits.map(v => v.batch))).filter(Boolean).sort().reverse();
  const colleges = Array.from(new Set(visits.map(v => v.college))).filter(Boolean).sort();
  const specializations = Array.from(new Set(visits.map(v => v.branch || v.specialization))).filter(Boolean).sort();

  const activeFiltersCount = (batchFilter !== 'All' ? 1 : 0) + (collegeFilter !== 'All' ? 1 : 0) + (specFilter !== 'All' ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100%', position: 'relative' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a2652', margin: 0 }}>IV Management</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: 500 }}>Management and scheduling of institutional Industrial Visits.</p>
        </div>
        <button
          onClick={() => navigate('/admin/iv-students/issue')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: nestNavy, color: '#fff', border: 'none',
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px',
            fontWeight: 700, cursor: 'pointer', transition: '0.2s',
            boxShadow: '0 4px 12px rgba(26, 38, 82, 0.15)'
          }}
        >
          <Award size={18} /> Issue Certificate
        </button>
      </div>

      {/* Certification History Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: nestNavy, margin: 0 }}>Certification History</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>History of bulk certificates issued to various colleges.</p>
          </div>
          <div style={{ position: 'relative', width: '300px' }}>
             <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
             <input
               type="text"
               placeholder="Search by college name..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               style={{
                 width: '100%', padding: '12px 16px 12px 44px', borderRadius: '14px',
                 border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px',
                 background: '#fff', color: '#1e293b', fontWeight: 600
               }}
             />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Issued Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>College Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Visit Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Students</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const allIssued = JSON.parse(localStorage.getItem('full_issued_iv_certificates') || '[]');
                  if (allIssued.length === 0) {
                    return <tr><td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>No certificates issued yet.</td></tr>;
                  }

                  // Group by College ONLY
                  const groups: any = {};
                  allIssued.forEach((s: any) => {
                    const key = s.college.toUpperCase();
                    if (!groups[key]) {
                      groups[key] = {
                        college: s.college,
                        lastIssuedAt: s.issuedAt || new Date().toISOString(),
                        count: 0,
                        students: []
                      };
                    }
                    groups[key].count++;
                    groups[key].students.push(s);
                    // Keep track of the most recent issuance date
                    if (new Date(s.issuedAt).getTime() > new Date(groups[key].lastIssuedAt).getTime()) {
                      groups[key].lastIssuedAt = s.issuedAt;
                    }
                  });

                  let result = Object.values(groups);
                  if (searchQuery) {
                    result = result.filter((g: any) => g.college.toLowerCase().includes(searchQuery.toLowerCase()));
                  }

                  return result.sort((a: any, b: any) => new Date(b.lastIssuedAt).getTime() - new Date(a.lastIssuedAt).getTime()).map((group: any, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '20px 24px', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                        {new Date(group.lastIssuedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '20px 24px', fontSize: '15px', fontWeight: 800, color: nestNavy }}>{group.college}</td>
                      <td style={{ padding: '20px 24px', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                        {editingCollege === group.college ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                              type="date" 
                              value={tempDate} 
                              onChange={(e) => setTempDate(e.target.value)}
                              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            />
                            <button 
                              onClick={() => handleBulkUpdateDate(group.college)}
                              style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                            >Save</button>
                            <button 
                              onClick={() => setEditingCollege(null)}
                              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                            >Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>Multiple Batches</span>
                            <button 
                              onClick={() => {
                                setEditingCollege(group.college);
                                setTempDate(group.students[0]?.date || '');
                              }}
                              style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                            >Edit</button>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.05)', color: nestNavy, fontSize: '13px', fontWeight: 700 }}>
                          {group.count} Total Certificates
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleDownloadCollegeZip(group.college, group.students)}
                            disabled={isDownloadingZip === group.college}
                            style={{ 
                              background: '#f8fafc', color: nestNavy, border: '1px solid #e2e8f0', 
                              padding: '10px 16px', borderRadius: '12px', fontSize: '13px', 
                              fontWeight: 700, cursor: isDownloadingZip === group.college ? 'wait' : 'pointer',
                              display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                          >
                            {isDownloadingZip === group.college ? <Loader2 size={16} className="animate-spin" /> : <FolderDown size={16} />}
                            Download ZIP
                          </button>
                          <button 
                            onClick={() => handleViewIssued(group.college)}
                            style={{ background: nestNavy, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            View College
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}


              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* Issued Certificates Modal */}
      {selectedCollege && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '2rem'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#fff', width: '100%', maxWidth: '900px',
              borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a2652' }}>College Certification Directory</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>{selectedCollege}</p>
              </div>
              <button onClick={() => setSelectedCollege(null)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px', maxHeight: '65vh', overflowY: 'auto' }}>
              {issuedStudents.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {issuedStudents.map((s, i) => {
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: nestRed, border: '1px solid #e2e8f0' }}>
                            <Award size={24} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '16px' }}>{s.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <span style={{ fontSize: '13px', color: '#64748b' }}>Visit Date:</span>
                              <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>{s.date}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: nestNavy, cursor: 'pointer' }}
                          onClick={() => handlePreview(s)}
                        >
                          <Eye size={16} /> Preview
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#cbd5e1' }}>
                    <Users size={32} />
                  </div>
                  <p style={{ color: '#64748b', fontWeight: 500 }}>No certificates have been issued for this college yet.</p>
                </div>
              )}
            </div>
            
            <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', textAlign: 'right' }}>
              <button onClick={() => setSelectedCollege(null)} style={{ background: nestNavy, color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}


      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .glass-morphism { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
      `}</style>
    </div>
  );
};

export default AdminIVStudents;

