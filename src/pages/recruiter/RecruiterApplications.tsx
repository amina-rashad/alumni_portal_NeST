import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Search, Mail, User, FileText, Briefcase, Users, Calendar, Clock, Filter, Download, ChevronDown, DownloadCloud, FileArchive, X, AlertCircle, Edit, CheckSquare, MessageSquare, Loader2 } from 'lucide-react';
import { recruiterApi } from '../../services/api';
import nestIcon from '../../assets/nest_icon.png';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

const smoothSpring = { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: smoothSpring }
};

const RecruiterApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [updateData, setUpdateData] = useState({ status: 'Aptitude', interviewDate: '', notes: '' });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  
  const resumeRef = useRef<HTMLDivElement>(null);
  const [renderData, setRenderData] = useState<any>(null);

  const getStatusStyles = (status: string) => {
    switch (status) {
        case 'Applied': return { color: '#475569', bg: '#f1f5f9' };
        case 'Aptitude': return { color: '#e67700', bg: '#fff9db' };
        case 'Shortlisted': return { color: '#1971c2', bg: '#e7f5ff' };
        case 'Interview Scheduled': return { color: '#7048e8', bg: '#f3f0ff' };
        case 'Offered': return { color: '#2b8a3e', bg: '#ebfbee' };
        case 'Rejected': return { color: '#c92a2a', bg: '#fff5f5' };
        default: return { color: '#475569', bg: '#f1f5f9' };
    }
  };

  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await recruiterApi.getApplications();
      if (response.success && response.data) {
        let apps = response.data.applications;
        setApplications(apps);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (data: any): Promise<Blob | null> => {
    return new Promise((resolve) => {
      setRenderData(data);
      // Wait for re-render
      setTimeout(async () => {
        if (!resumeRef.current) {
          resolve(null);
          return;
        }
        
        try {
          const canvas = await html2canvas(resumeRef.current, { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#ffffff',
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          resolve(pdf.output('blob'));
        } catch (err) {
          console.error('PDF Generation Error:', err);
          resolve(null);
        } finally {
          setRenderData(null);
        }
      }, 100);
    });
  };

  const handleDownloadCV = async (app: any) => {
    if (app.resume_url && (app.resume_url.startsWith('http') || app.resume_url.startsWith('data:'))) {
        // Direct download
        const link = document.createElement('a');
        link.href = app.resume_url;
        link.download = `${app.applicant_name.replace(/\s+/g, '_')}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
    }

    if (!app.resume_data) {
        alert("No resume data found for this applicant.");
        return;
    }

    setDownloadingId(app.id);
    const blob = await generatePDF(app.resume_data);
    if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${app.applicant_name.replace(/\s+/g, '_')}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    setDownloadingId(null);
  };

  const confirmBulkDownload = async () => {
    setShowConfirmModal(false);
    setIsBulkDownloading(true);
    
    try {
        const zip = new JSZip();
        const appsToDownload = filter === 'all' ? applications : applications.filter(a => a.job_title === filter);
        
        for (const app of appsToDownload) {
            if (app.resume_url && (app.resume_url.startsWith('http') || app.resume_url.startsWith('data:'))) {
                try {
                    const response = await fetch(app.resume_url);
                    const blob = await response.blob();
                    zip.file(`${app.applicant_name.replace(/\s+/g, '_')}_Resume.pdf`, blob);
                } catch (err) {
                    console.error(`Failed to fetch resume for ${app.applicant_name}`, err);
                }
            } else if (app.resume_data) {
                const blob = await generatePDF(app.resume_data);
                if (blob) {
                    zip.file(`${app.applicant_name.replace(/\s+/g, '_')}_Resume.pdf`, blob);
                }
            }
        }
        
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Resumes_${filter === 'all' ? 'All_Jobs' : filter.replace(/\s+/g, '_')}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Bulk download failed:', error);
    } finally {
        setIsBulkDownloading(false);
    }
  };

  const uniqueJobs = Array.from(new Set(applications.map(app => app.job_title)));

  const filteredApps = filter === 'all' 
    ? applications 
    : applications.filter(app => app.job_title === filter);

  const handleUpdateClick = (app: any) => {
    setSelectedApp(app);
    setUpdateData({
        status: app.status || 'Aptitude',
        interviewDate: app.interviewDate || '',
        notes: app.notes || ''
    });
  };

  const handleSaveUpdate = async () => {
    try {
        const response = await recruiterApi.updateApplicationStatus(selectedApp.id, updateData);
        if (response.success) {
            setApplications(apps => apps.map(a => 
                a.id === selectedApp.id ? { ...a, ...updateData } : a
            ));
            setSelectedApp(null);
        } else {
            alert(response.message || "Failed to update application.");
        }
    } catch (err) {
        console.error("Update error:", err);
        alert("An error occurred while updating the application.");
    }
  };

  const renderTextBlock = (text: string, columns: number = 1) => {
    if (!text) return null;
    const blocks = text.split('\n\n').filter(Boolean);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: columns > 1 ? `repeat(${columns}, 1fr)` : '1fr', gap: '8px' }}>
        {blocks.map((block, idx) => {
          const lines = block.split('\n');
          return (
            <div key={idx} style={{ marginBottom: columns === 1 ? '8px' : 0 }}>
              {lines.map((line, lIdx) => {
                if (lIdx === 0) return <div key={lIdx} style={{ fontWeight: 700, fontSize: '9px', marginBottom: '2px', color: '#000' }}>{line}</div>;
                if (line.startsWith('-')) return <div key={lIdx} style={{ fontSize: '8px', paddingLeft: '8px', position: 'relative', marginBottom: '2px', color: '#000' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span> {line.substring(1).trim()}
                </div>;
                return <div key={lIdx} style={{ fontSize: '9px', marginBottom: '2px', color: '#000' }}>{line}</div>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      
      <style>{`
        .luxury-card {
          background: linear-gradient(135deg, rgba(26, 38, 82, 0.08) 0%, rgba(67, 94, 190, 0.02) 100%);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(26, 38, 82, 0.1);
          box-shadow: 0 4px 20px rgba(26, 38, 82, 0.02);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .luxury-card:hover {
          background: linear-gradient(135deg, rgba(26, 38, 82, 0.12) 0%, rgba(67, 94, 190, 0.04) 100%);
          box-shadow: 0 20px 40px rgba(26, 38, 82, 0.12);
          transform: translateY(-4px) scale(1.002);
          border-color: rgba(26, 38, 82, 0.2);
        }
        .btn-bulk {
            background: ${nestNavy};
            color: white;
            padding: 14px 24px;
            border-radius: 12px;
            border: none;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s;
            box-shadow: 0 10px 20px rgba(26, 38, 82, 0.15);
        }
        .btn-bulk:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }
      `}</style>

      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <FileText size={20} color={nestRed} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Applicant Review</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>Application Archive</h1>
      </header>

      {/* Filter Section - Blue Glass Effect */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(26, 38, 82, 0.05), rgba(26, 38, 82, 0.02))', 
        backdropFilter: 'blur(16px)',
        padding: '28px', borderRadius: '24px', border: '1px solid rgba(26, 38, 82, 0.1)', 
        boxShadow: '0 8px 32px rgba(26, 38, 82, 0.04)', marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: '320px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Select Job Listing</label>
                <div style={{ position: 'relative' }}>
                    <Briefcase style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: nestNavy, pointerEvents: 'none' }} size={18} />
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ 
                            width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc',
                            color: '#1e293b', fontWeight: 700, fontSize: '16px', outline: 'none', cursor: 'pointer', appearance: 'none'
                        }}
                    >
                        <option value="all">All Active Job Postings</option>
                        {uniqueJobs.map(job => (
                            <option key={job} value={job}>{job}</option>
                        ))}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} size={18} />
                </div>
            </div>

            <button 
                onClick={() => setShowConfirmModal(true)}
                disabled={isBulkDownloading}
                className="btn-bulk"
            >
                {isBulkDownloading ? <Loader2 size={20} className="animate-spin" /> : <DownloadCloud size={20} />}
                {isBulkDownloading ? 'Preparing ZIP...' : 'Bulk Download CVs'}
            </button>
        </div>

        {/* Text Display Summary */}
        <div style={{ 
            marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed #e2e8f0', 
            display: 'flex', alignItems: 'center', gap: '12px' 
        }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: nestRed, boxShadow: `0 0 10px ${nestRed}40` }}></div>
            <p style={{ margin: 0, fontSize: '16px', color: '#334155', fontWeight: 600 }}>
                {filter === 'all' 
                    ? `Showing all ${applications.length} applications received across the portal.`
                    : <>Found <span style={{ color: nestNavy, fontWeight: 900 }}>{applications.filter(a => a.job_title === filter).length}</span> applications for <span style={{ color: nestNavy, fontWeight: 900 }}>{filter}</span>.</>
                }
            </p>
        </div>
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
          style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <motion.div
                  key={app.id}
                  variants={itemVariants}
                  layout
                  className="luxury-card"
                  style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', alignItems: 'center', gap: '32px' }}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ 
                        width: '56px', height: '56px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: nestNavy, border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                    }}>
                      <User size={28} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>{app.applicant_name}</h3>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                        <Mail size={12} color={nestRed} /> {app.applicant_email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <Briefcase size={15} color={nestNavy} />
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>{app.job_title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
                      <Clock size={12} /> Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: getStatusStyles(app.status || 'Applied').color, background: getStatusStyles(app.status || 'Applied').bg, padding: '4px 10px', borderRadius: '12px', width: 'fit-content' }}>
                      <CheckSquare size={14} /> {app.status || 'Applied'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                            onClick={() => handleUpdateClick(app)}
                            className="btn-action" style={{ 
                                padding: '8px 16px', borderRadius: '10px', border: `1px solid ${nestNavy}`, background: '#f8fafc', 
                                color: nestNavy, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer'
                            }}>
                            <Edit size={14} /> Update
                        </button>
                        <button 
                            onClick={() => handleDownloadCV(app)}
                            disabled={downloadingId === app.id}
                            className="btn-action" 
                            style={{ 
                                padding: '8px 16px', borderRadius: '10px', border: `1px solid ${nestNavy}`, background: nestNavy, 
                                color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer',
                                opacity: downloadingId === app.id ? 0.7 : 1
                            }}>
                            {downloadingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                            CV
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
                <div style={{ textAlign: 'center', padding: '100px 40px', background: '#fff', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                    <div style={{ width: '72px', height: '72px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#cbd5e1' }}>
                       <Users size={36} />
                    </div>
                    <h3 style={{ color: '#1e293b', fontWeight: 800, fontSize: '20px', margin: '0 0 8px 0' }}>No candidates listed</h3>
                    <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '340px', margin: '0 auto', lineHeight: 1.6 }}>There are currently no resumes matching this job category.</p>
                </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Hidden Resume Renderer for PDF generation */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
        <div ref={resumeRef} style={{ 
          background: 'white', 
          padding: '40px', 
          width: '595px', // A4 width at 72dpi
          minHeight: '842px', // A4 height
          fontFamily: 'Helvetica, Arial, sans-serif',
          color: '#000',
          lineHeight: 1.4,
          boxSizing: 'border-box'
        }}>
          {renderData && (
            <>
              <div style={{ marginBottom: '20px', borderBottom: '2px solid #1a2652', paddingBottom: '15px' }}>
                <h1 style={{ margin: '0', fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', color: '#1a2652' }}>{renderData.fullName}</h1>
                <h2 style={{ margin: '5px 0 0', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#c8102e' }}>{renderData.title}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px', fontSize: '9px', color: '#555' }}>
                  {renderData.email && <span>{renderData.email}</span>}
                  {renderData.phone && <span>{renderData.phone}</span>}
                  {renderData.address && <span>{renderData.address}</span>}
                </div>
              </div>

              {renderData.summary && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px', color: '#1a2652', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>Professional Summary</h3>
                  <p style={{ fontSize: '9px', margin: 0, color: '#333' }}>{renderData.summary}</p>
                </div>
              )}

              {renderData.experience && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px', color: '#1a2652', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>Experience</h3>
                  {renderTextBlock(renderData.experience)}
                </div>
              )}

              {renderData.education && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px', color: '#1a2652', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>Education</h3>
                  {renderTextBlock(renderData.education, 2)}
                </div>
              )}

              {renderData.projects && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px', color: '#1a2652', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>Key Projects</h3>
                  {renderTextBlock(renderData.projects)}
                </div>
              )}

              {renderData.certification && (
                <div>
                  <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px', color: '#1a2652', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>Certifications</h3>
                  {renderTextBlock(renderData.certification, 2)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* NeST Branded Professional Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
                position: 'fixed', inset: 0, background: 'rgba(5, 13, 30, 0.6)', backdropFilter: 'blur(12px)',
                zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              style={{ 
                  background: '#ffffff', width: '100%', maxWidth: '380px', borderRadius: '32px', padding: '40px 32px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative', textAlign: 'center'
              }}
            >
              {/* Close Button - Subtle */}
              <button 
                onClick={() => setShowConfirmModal(false)} 
                style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', color: '#e2e8f0', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = nestNavy}
                onMouseLeave={e => e.currentTarget.style.color = '#e2e8f0'}
              >
                  <X size={20} />
              </button>

              {/* NeST Branded Header - Compact Logo */}
              <div style={{ marginBottom: '24px' }}>
                  <img src={nestIcon} alt="NeST" style={{ height: '56px', objectFit: 'contain', margin: '0 auto' }} />
              </div>
              
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '12px', fontFamily: "'Playfair Display', serif" }}>Download Confirmation</h2>
              <p style={{ color: '#64748b', lineHeight: 1.5, fontSize: '15px', margin: '0 0 32px 0' }}>
                Are you sure you want to download certificates for <br/> 
                <span style={{ color: nestNavy, fontWeight: 800, display: 'block', marginTop: '6px', fontSize: '16px' }}>
                    {filter === 'all' ? 'All Active Job Postings' : filter}
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '8px' }}>This will aggregate all applicant data into a secure archive.</span>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={confirmBulkDownload}
                    style={{ 
                        width: '100%', background: nestRed, color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', 
                        fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                  >
                      Confirm & Start Download
                  </button>
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    style={{ 
                        width: '100%', background: 'none', color: '#94a3b8', border: 'none', padding: '10px', borderRadius: '12px', 
                        fontWeight: 600, fontSize: '14px', cursor: 'pointer'
                    }}
                  >
                      Cancel
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Application Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
                position: 'fixed', inset: 0, background: 'rgba(5, 13, 30, 0.6)', backdropFilter: 'blur(12px)',
                zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              style={{ 
                  background: '#ffffff', width: '100%', maxWidth: '450px', borderRadius: '24px', padding: '32px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative'
              }}
            >
              <button 
                onClick={() => setSelectedApp(null)} 
                style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                  <X size={20} />
              </button>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: nestNavy, margin: '0 0 4px 0' }}>Update Application</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0' }}>Editing status for <strong style={{color: '#111827'}}>{selectedApp.applicant_name}</strong> - {selectedApp.job_title}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                          <CheckSquare size={16} color={nestNavy} /> Application Status
                      </label>
                      <select 
                          value={updateData.status}
                          onChange={e => setUpdateData({...updateData, status: e.target.value})}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: 600, color: getStatusStyles(updateData.status).color, backgroundColor: getStatusStyles(updateData.status).bg, outline: 'none' }}
                      >
                          <option style={{ color: '#475569', background: '#fff' }} value="Applied">Applied</option>
                          <option style={{ color: '#e67700', background: '#fff' }} value="Aptitude">Aptitude</option>
                          <option style={{ color: '#1971c2', background: '#fff' }} value="Shortlisted">Shortlisted</option>
                          <option style={{ color: '#7048e8', background: '#fff' }} value="Interview Scheduled">Interview Scheduled</option>
                          <option style={{ color: '#2b8a3e', background: '#fff' }} value="Offered">Offered</option>
                          <option style={{ color: '#c92a2a', background: '#fff' }} value="Rejected">Rejected</option>
                      </select>
                  </div>

                  {updateData.status === 'Interview Scheduled' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                            <Calendar size={16} color={nestNavy} /> Interview Date
                        </label>
                        <input 
                            type="date"
                            value={updateData.interviewDate}
                            onChange={e => setUpdateData({...updateData, interviewDate: e.target.value})}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </motion.div>
                  )}

                  <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                          <MessageSquare size={16} color={nestNavy} /> Note for Applicant
                      </label>
                      <textarea 
                          value={updateData.notes}
                          onChange={e => setUpdateData({...updateData, notes: e.target.value})}
                          placeholder="e.g. Technical round with the Engineering Lead."
                          rows={3}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', color: '#1e293b', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                  </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  <button 
                    onClick={handleSaveUpdate}
                    style={{ flex: 1, background: nestNavy, color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                  >
                      Save Changes
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div style={{ paddingBottom: '4rem' }} />
    </div>
  );
};

export default RecruiterApplications;
