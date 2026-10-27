/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { 
  Award, Search, Download, BookOpen, 
  ShieldCheck, Loader2, Lock, FileSpreadsheet, 
  Archive, Eye, X, Sparkles, UserCheck,
  Clock, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { courseManagerAPI, coursesApi } from '../../services/api';
import { generateCourseIVCertificate, getCourseIVCertificatePDF, formatCertificateDate } from '../../utils/CertificateGenerator';
import { EVENT_CERTIFICATE_BG, NEST_OVAL_LOGO } from '../../utils/LogoBase64';
import { getLocalDateString } from '../../utils/dateUtils';

interface CertificateRecord {
  id: string;
  enrollmentId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  profile_picture?: string;
  courseId: string;
  course: string;
  courseName: string;
  progress: number;
  canIssue: boolean;
  isIssued: boolean;
  certificateId?: string;
  completionDate: string;
  issuedDate: string;
  grade: string;
  status: 'Issued' | 'Ready to Issue' | 'Assessments Incomplete' | 'Generated' | 'Sent';
}

const CM_Certificates: React.FC = () => {
  const brandPrimary = '#233167';
  const brandRed = '#c8102e';

  // Data states
  const [courses, setCourses] = useState<any[]>([]);
  const [records, setRecords] = useState<CertificateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [filter, setFilter] = useState('All Records');
  const [searchQuery, setSearchQuery] = useState('');

  // Processing states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [isBulkIssuing, setIsBulkIssuing] = useState(false);

  // Single Certificate Preview Modal State
  const [previewRecord, setPreviewRecord] = useState<CertificateRecord | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, certsRes] = await Promise.all([
        coursesApi.getAllCourses(1, 100),
        courseManagerAPI.fetchCertificates()
      ]);

      if (coursesRes && coursesRes.data) {
        setCourses((coursesRes.data as any).courses || []);
      }

      if (certsRes && certsRes.data) {
        setRecords((certsRes.data as any).certificates || []);
      }
    } catch (err) {
      console.error('Failed to load certificates data:', err);
      toast.error('Failed to load certification roster');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter records based on active course tab, status filter, and search
  const filteredRecords = records.filter(record => {
    // Course filter
    if (selectedCourseId !== 'all') {
      const matchCourse = record.courseId === selectedCourseId || 
        record.course?.toLowerCase() === courses.find(c => (c._id || c.id) === selectedCourseId)?.title?.toLowerCase();
      if (!matchCourse) return false;
    }

    // Status filter
    if (filter === 'Issued' && !record.isIssued) return false;
    if (filter === 'Completed' && !record.canIssue && !record.isIssued) return false;
    if (filter === 'Ready to Issue' && (record.isIssued || !record.canIssue)) return false;
    if (filter === 'Assessments Incomplete' && record.canIssue) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = record.studentName?.toLowerCase().includes(q);
      const emailMatch = record.studentEmail?.toLowerCase().includes(q);
      const courseMatch = record.course?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !courseMatch) return false;
    }

    return true;
  });

  // Active course title
  const currentCourse = courses.find(c => (c._id || c.id) === selectedCourseId);
  const currentCourseTitle = currentCourse ? currentCourse.title : 'All Academic Courses';

  // ── ISSUE SINGLE CERTIFICATE ──
  const handleIssueCertificate = async (record: CertificateRecord) => {
    if (!record.canIssue) {
      toast.error(`Cannot issue certificate: ${record.studentName} has not completed and passed the course assessment.`);
      return;
    }

    setProcessingId(record.id);
    const toastId = toast.loading(`Issuing official certificate for ${record.studentName}...`);

    try {
      const res = await courseManagerAPI.issueCertificate({
        enrollment_id: record.id,
        user_id: record.userId,
        course_id: record.courseId,
        grade: record.grade || '100%'
      });

      if (res && (res as any).success !== false) {
        const issueDate = (res as any).data?.issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        setRecords(prev => prev.map(rec => rec.id === record.id ? {
          ...rec,
          isIssued: true,
          status: 'Issued',
          issuedDate: issueDate,
          completionDate: issueDate
        } : rec));

        toast.success(`Official certificate issued for ${record.studentName}!`, { id: toastId });

        // Auto-download clean IV PDF
        generateCourseIVCertificate(
          record.studentName,
          record.course,
          issueDate
        );
      } else {
        toast.error((res as any)?.message || 'Failed to issue certificate', { id: toastId });
      }
    } catch (err: any) {
      console.error('Error issuing certificate:', err);
      toast.error(err?.message || 'Failed to issue certificate', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  // ── DOWNLOAD SINGLE CERTIFICATE (IV FORMAT) ──
  const handleDownloadSingle = (record: CertificateRecord) => {
    if (!record.isIssued && !record.canIssue) {
      toast.error('Assessments incomplete. Certificate cannot be downloaded.');
      return;
    }

    const toastId = toast.loading(`Generating certificate for ${record.studentName}...`);
    try {
      generateCourseIVCertificate(
        record.studentName,
        record.course,
        record.issuedDate || record.completionDate
      );
      toast.success('Certificate downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF certificate.', { id: toastId });
    }
  };

  // ── BULK ISSUE ALL ELIGIBLE CERTIFICATES (100% COMPLETE) ──
  const handleBulkIssueEligible = async () => {
    const eligibleRecords = filteredRecords.filter(r => r.canIssue && !r.isIssued);
    if (eligibleRecords.length === 0) {
      toast('No un-issued learners with 100% assessment completion in the current view.', { icon: 'ℹ️' });
      return;
    }

    if (!window.confirm(`Issue official certificates to all ${eligibleRecords.length} eligible learners with 100% completed assessments?`)) {
      return;
    }

    setIsBulkIssuing(true);
    const toastId = toast.loading(`Bulk issuing ${eligibleRecords.length} certificates...`);

    try {
      await courseManagerAPI.bulkIssueCertificates(selectedCourseId);
      toast.success(`Successfully issued certificates to eligible graduates!`, { id: toastId });
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to bulk issue certificates', { id: toastId });
    } finally {
      setIsBulkIssuing(false);
    }
  };

  // ── BULK CERTIFICATES DOWNLOAD ON BASIS OF RESPECTED COURSES (ZIP ARCHIVE IN CLEAN IV FORMAT) ──
  const handleBulkDownloadCertificates = async (courseIdOverride?: string) => {
    const targetCourseId = courseIdOverride || selectedCourseId;
    const targetCourse = courses.find(c => (c._id || c.id) === targetCourseId);
    const courseTitle = targetCourse ? targetCourse.title : (targetCourseId === 'all' ? 'All Academic Courses' : currentCourseTitle);

    let targetRecords = records.filter(r => r.isIssued);
    if (targetCourseId !== 'all') {
      targetRecords = targetRecords.filter(r => 
        r.courseId === targetCourseId || 
        r.course?.toLowerCase() === targetCourse?.title?.toLowerCase()
      );
    }

    if (targetRecords.length === 0) {
      toast.error(`No issued certificates found to download for ${courseTitle}.`);
      return;
    }

    setIsBulkDownloading(true);
    const toastId = toast.loading(`Compiling ${targetRecords.length} certificates for ${courseTitle} into ZIP...`);

    try {
      const zip = new JSZip();
      const safeCourseName = courseTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const rootFolder = zip.folder(`NeST_Certificates_${safeCourseName}`);

      let count = 0;
      for (const rec of targetRecords) {
        try {
          const dateStr = rec.issuedDate || rec.completionDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          const doc = getCourseIVCertificatePDF(rec.studentName, rec.course, dateStr);
          const pdfBlob = doc.output('blob');

          const fileName = `${rec.studentName.replace(/\s+/g, '_')}_${rec.course.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`;
          rootFolder?.file(fileName, pdfBlob);
          count++;
        } catch (itemErr) {
          console.error(`Failed to generate cert for ${rec.studentName}:`, itemErr);
        }
      }

      if (count === 0) {
        throw new Error('Failed to generate any certificate PDFs');
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = getLocalDateString();
      saveAs(zipBlob, `NeST_Certificates_${safeCourseName}_${timestamp}.zip`);

      toast.success(`Successfully downloaded ${count} certificates in ZIP archive!`, { id: toastId });
    } catch (err: any) {
      console.error('Bulk download error:', err);
      toast.error('Failed to generate bulk certificates archive.', { id: toastId });
    } finally {
      setIsBulkDownloading(false);
    }
  };

  // ── EXPORT BULK LIST OF STUDENTS FROM WHOM CERTIFICATES ARE ISSUED (XLSX) ──
  const handleExportIssuedStudentsList = (courseIdOverride?: string) => {
    const targetCourseId = courseIdOverride || selectedCourseId;
    const targetCourse = courses.find(c => (c._id || c.id) === targetCourseId);
    const courseTitle = targetCourse ? targetCourse.title : (targetCourseId === 'all' ? 'All Academic Courses' : currentCourseTitle);

    let targetRecords = records.filter(r => r.isIssued);
    if (targetCourseId !== 'all') {
      targetRecords = targetRecords.filter(r => 
        r.courseId === targetCourseId || 
        r.course?.toLowerCase() === targetCourse?.title?.toLowerCase()
      );
    }

    if (targetRecords.length === 0) {
      toast.error(`No issued student records found to export for ${courseTitle}.`);
      return;
    }

    const headers = [
      'Learner Name',
      'Email Address',
      'Enrolled Academic Track',
      'Assessment Status',
      'Credential Status',
      'Certificate Issue Date',
      'Evaluation Grade'
    ];

    const rows = targetRecords.map(r => [
      r.studentName || '',
      r.studentEmail || '',
      r.course || '',
      'Completed & Passed',
      'Official Certificate Issued',
      r.issuedDate || r.completionDate || 'N/A',
      r.grade || 'Passed'
    ]);

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-fit column widths
    ws['!cols'] = headers.map((h, i) => {
      let maxLen = h.length;
      rows.forEach(row => {
        const cellLen = String(row[i] || '').length;
        if (cellLen > maxLen) maxLen = cellLen;
      });
      return { wch: Math.min(Math.max(maxLen + 4, 14), 45) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Issued Certificates');

    const safeName = courseTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = getLocalDateString();
    XLSX.writeFile(wb, `NeST_Issued_Students_${safeName}_${timestamp}.xlsx`);

    toast.success(`Exported ${targetRecords.length} issued student records for ${courseTitle} to Excel (.xlsx)!`);
  };

  const totalIssued = records.filter(r => r.isIssued).length;
  const readyToIssueCount = records.filter(r => r.canIssue && !r.isIssued).length;
  const incompleteCount = records.filter(r => !r.canIssue).length;
  const completedAllCount = records.filter(r => r.canIssue || r.isIssued).length;

  const currentCourseIssuedRecords = records.filter(r => {
    if (!r.isIssued) return false;
    if (selectedCourseId !== 'all') {
      return r.courseId === selectedCourseId || r.course?.toLowerCase() === currentCourse?.title?.toLowerCase();
    }
    return true;
  });
  const currentCourseIssuedCount = currentCourseIssuedRecords.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
      
      {/* ── HEADER & PRIMARY ACTION TOOLBAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ 
              padding: '4px 10px', borderRadius: '8px', 
              background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary, 
              fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' 
            }}>
              Credential & Certification Authority
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Credential Center
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
            Issue certificates for learners with 100% assessments, download issued student rosters in Excel (.xlsx), and bulk download credentials on the basis of each course.
          </p>
        </div>

        {/* Global Action Toolbar - Only the 2 requested actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* 1. Download Bulk of Students List from Whom Certificates Are Issued (Excel .xlsx) */}
          <button
            onClick={() => handleExportIssuedStudentsList()}
            title={`Download Excel (.xlsx) roster of all students with issued certificates for ${currentCourseTitle}`}
            style={{
              padding: '12px 20px',
              borderRadius: '14px',
              background: '#ecfdf5',
              color: '#059669',
              border: '1.5px solid #a7f3d0',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <FileSpreadsheet size={16} color="#059669" />
            <span>Export Issued Students (.xlsx) ({currentCourseIssuedCount})</span>
          </button>

          {/* 2. Bulk Download of Certificates on Basis of Respected Courses (ZIP) */}
          <button
            onClick={() => handleBulkDownloadCertificates()}
            disabled={isBulkDownloading}
            title={`Download bulk certificates ZIP archive for ${currentCourseTitle}`}
            style={{
              padding: '12px 22px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${brandPrimary} 0%, #172147 100%)`,
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '13px',
              cursor: isBulkDownloading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 16px rgba(35, 49, 103, 0.25)',
              opacity: isBulkDownloading ? 0.7 : 1,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => !isBulkDownloading && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => !isBulkDownloading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {isBulkDownloading ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
            <span>Download Bulk Certificates ZIP ({currentCourseIssuedCount})</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Official Credentials Issued</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{totalIssued}</div>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>NeST verified credentials</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Assessments Completed</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{readyToIssueCount}</div>
            <div style={{ fontSize: '11px', color: brandPrimary, fontWeight: 700 }}>Eligible for certification</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Assessments Pending</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{incompleteCount}</div>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>Evaluation pending</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(200, 16, 46, 0.08)', color: brandRed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Courses Tracked</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{courses.length}</div>
            <div style={{ fontSize: '11px', color: brandRed, fontWeight: 700 }}>Filterable individual tracks</div>
          </div>
        </div>
      </div>

      {/* ── RESPECTED COURSE QUICK NAVIGATION TABS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Layers size={15} color={brandPrimary} /> Filter On Basis of Respected Courses:
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* All Courses Tab */}
          <button
            onClick={() => setSelectedCourseId('all')}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              background: selectedCourseId === 'all' ? brandPrimary : '#fff',
              color: selectedCourseId === 'all' ? '#fff' : '#475569',
              border: selectedCourseId === 'all' ? `1.5px solid ${brandPrimary}` : '1.5px solid #e2e8f0',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: selectedCourseId === 'all' ? '0 4px 12px rgba(35, 49, 103, 0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🌐 All Academic Courses</span>
            <span style={{
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              background: selectedCourseId === 'all' ? 'rgba(255,255,255,0.2)' : '#ecfdf5',
              color: selectedCourseId === 'all' ? '#fff' : '#059669',
              fontWeight: 800
            }}>
              {totalIssued} Issued
            </span>
          </button>

          {/* Each Individual Course Tab */}
          {courses.map(course => {
            const cid = course._id || course.id;
            const courseIssuedCount = records.filter(r => (r.courseId === cid || r.course?.toLowerCase() === course.title?.toLowerCase()) && r.isIssued).length;
            const isSelected = selectedCourseId === cid;

            return (
              <button
                key={cid}
                onClick={() => setSelectedCourseId(cid)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '14px',
                  background: isSelected ? brandPrimary : '#fff',
                  color: isSelected ? '#fff' : '#475569',
                  border: isSelected ? `1.5px solid ${brandPrimary}` : '1.5px solid #e2e8f0',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isSelected ? '0 4px 12px rgba(35, 49, 103, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <BookOpen size={14} color={isSelected ? '#fff' : brandPrimary} />
                <span>{course.title}</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  background: isSelected ? 'rgba(255,255,255,0.2)' : '#ecfdf5',
                  color: isSelected ? '#fff' : '#059669',
                  fontWeight: 800
                }}>
                  {courseIssuedCount} Issued
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SEARCH & STATUS FILTERS ── */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        background: '#fff', padding: '16px 24px', borderRadius: '24px', 
        border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '300px', flex: 1 }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search graduates by name, email, or track..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '10px 14px 10px 38px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              background: '#f8fafc', 
              fontSize: '13px', 
              width: '100%', 
              outline: 'none',
              fontWeight: 600,
              color: '#1e293b'
            }}
          />
        </div>

        {/* Status Filter Dropdown */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Status:</div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              color: '#1e293b',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All Records">All Records ({records.length})</option>
            <option value="Completed">Completed 100% Assessments ({completedAllCount})</option>
            <option value="Issued">Official Certificate Issued ({totalIssued})</option>
            <option value="Ready to Issue">Ready to Issue ({readyToIssueCount})</option>
            <option value="Assessments Incomplete">Assessments Incomplete ({incompleteCount})</option>
          </select>

          {/* Quick Issue All 100% Button */}
          {readyToIssueCount > 0 && (
            <button
              onClick={handleBulkIssueEligible}
              disabled={isBulkIssuing}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '12px',
                cursor: isBulkIssuing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
            >
              <Sparkles size={14} /> Issue All Ready ({readyToIssueCount})
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div style={{ background: '#fff', borderRadius: '28px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Graduate & Respected Course</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assessment Status</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credential Status</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operations & Issuance</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={4} style={{ padding: '24px' }} className="skeleton-pulse"><div style={{ height: '50px', background: '#f1f5f9', borderRadius: '14px' }}></div></td></tr>
                ))
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '70px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', color: '#94a3b8' }}>
                      <Award size={30} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>No Learner Records Found</div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>No graduates match the current course or status filter.</p>
                  </td>
                </tr>
              ) : filteredRecords.map((record) => {
                const canIssue = record.canIssue; // assessments completed and passed
                const isIssued = record.isIssued;

                return (
                  <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-row">
                    
                    {/* Graduate & Course */}
                    <td style={{ padding: '22px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ 
                          width: '46px', height: '46px', borderRadius: '14px', 
                          background: isIssued ? '#10b981' : (canIssue ? brandPrimary : '#64748b'), 
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: 800, fontSize: '16px' 
                        }}>
                          {record.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{record.studentName}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>{record.studentEmail}</div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: brandPrimary, fontWeight: 700, fontSize: '12px' }}>
                            <BookOpen size={13} /> {record.course}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Assessment Status */}
                    <td style={{ padding: '22px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ 
                          fontSize: '12px', fontWeight: 800, 
                          color: canIssue ? '#10b981' : '#f59e0b' 
                        }}>
                          {canIssue ? 'Assessment Passed' : 'Assessment Pending'}
                        </span>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {record.completionDate ? `Completed: ${record.completionDate}` : (canIssue ? 'Ready for Certification' : 'Evaluation in Progress')}
                        </div>
                      </div>
                    </td>

                    {/* Credential Status */}
                    <td style={{ padding: '22px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', 
                          fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', width: 'fit-content',
                          background: isIssued ? '#ecfdf5' : (canIssue ? '#eff6ff' : '#fef2f2'),
                          color: isIssued ? '#10b981' : (canIssue ? '#2563eb' : '#ef4444'),
                          border: `1px solid ${isIssued ? '#a7f3d0' : (canIssue ? '#bfdbfe' : '#fecaca')}`
                        }}>
                          {isIssued ? <ShieldCheck size={14} /> : (canIssue ? <Sparkles size={14} /> : <Lock size={14} />)}
                          {isIssued ? 'OFFICIAL CERTIFICATE ISSUED' : (canIssue ? 'READY TO ISSUE' : 'ASSESSMENT PENDING')}
                        </span>
                      </div>
                    </td>

                    {/* Operations */}
                    <td style={{ padding: '22px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                        
                        {/* ── ISSUE CERTIFICATE BUTTON (ENABLED IF COMPLETED, BLOCKED IF PENDING) ── */}
                        {!isIssued && (
                          canIssue ? (
                            <button 
                              onClick={() => handleIssueCertificate(record)}
                              disabled={processingId === record.id}
                              style={{ 
                                padding: '10px 18px', borderRadius: '12px', 
                                background: '#10b981', color: '#fff', border: 'none', 
                                fontWeight: 800, fontSize: '13px', cursor: processingId === record.id ? 'wait' : 'pointer', 
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                                opacity: processingId === record.id ? 0.7 : 1
                              }}
                            >
                              {processingId === record.id ? <Loader2 size={15} className="animate-spin" /> : <Award size={15} />} 
                              Issue Certificate
                            </button>
                          ) : (
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <button 
                                disabled
                                title={`Assessment Pending: Learner must complete and pass the course assessment before certificate can be issued.`}
                                style={{ 
                                  padding: '10px 16px', borderRadius: '12px', 
                                  background: '#f1f5f9', color: '#94a3b8', 
                                  border: '1px solid #e2e8f0', fontWeight: 700, 
                                  fontSize: '12px', cursor: 'not-allowed', 
                                  display: 'flex', alignItems: 'center', gap: '6px' 
                                }}
                              >
                                <Lock size={14} /> Assessment Pending
                              </button>
                              <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>
                                Assessment Pass Required
                              </span>
                            </div>
                          )
                        )}

                        {/* ── OPEN & DOWNLOAD BUTTONS FOR ISSUED CERTIFICATES ── */}
                        {isIssued && (
                          <>
                            {/* Open Certificate Button */}
                            <button
                              onClick={() => setPreviewRecord(record)}
                              title="Open official certificate on screen"
                              style={{
                                padding: '9px 14px', borderRadius: '12px',
                                background: '#f8fafc', border: '1.5px solid #cbd5e1',
                                color: '#1e293b', fontWeight: 700, fontSize: '12px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Eye size={14} color="#2563eb" /> Open Certificate
                            </button>

                            {/* Download PDF Button */}
                            <button 
                              onClick={() => handleDownloadSingle(record)}
                              title="Download official IV certificate PDF"
                              style={{ 
                                padding: '9px 16px', borderRadius: '12px', 
                                background: brandPrimary, color: '#fff', 
                                border: 'none', fontWeight: 800, fontSize: '12px', 
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                boxShadow: '0 4px 12px rgba(35, 49, 103, 0.2)'
                              }}
                            >
                              <Download size={14} /> Download PDF
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SINGLE CERTIFICATE PREVIEW MODAL (OFFICIAL IV TEMPLATE FORMAT) ── */}
      {previewRecord && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '820px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={20} color={brandPrimary} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                  Official Certificate Preview (NeST Template Format)
                </h3>
              </div>
              <button 
                onClick={() => setPreviewRecord(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Certificate Canvas / Frame (Exact Event Template Layout) */}
            <div style={{ padding: '32px', background: '#f1f5f9', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%', maxWidth: '720px', aspectRatio: '1.414',
                borderRadius: '16px', padding: '36px 44px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.06)', position: 'relative',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                overflow: 'hidden', border: '1px solid #e2e8f0',
                backgroundImage: `url(${EVENT_CERTIFICATE_BG})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                textAlign: 'center'
              }}>
                {/* NeST Oval Logo Top-Left */}
                <img 
                  src={NEST_OVAL_LOGO} 
                  alt="NeST Logo" 
                  style={{ position: 'absolute', top: '22px', left: '26px', height: '36px', objectFit: 'contain' }} 
                />

                {/* Header: CERTIFICATE */}
                <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '3px', height: '28px', background: '#142850' }} />
                    <span style={{ fontSize: '30px', fontWeight: 900, color: '#142850', letterSpacing: '0.04em', lineHeight: 1 }}>
                      CERTIFICATE
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', letterSpacing: '0.08em', marginTop: '6px' }}>
                    OF COURSE COMPLETION
                  </div>
                </div>

                {/* Body: Presentation & Recipient */}
                <div style={{ zIndex: 2, margin: '22px 0 16px 0', width: '100%' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#505050', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    PROUDLY PRESENTED TO
                  </div>
                  <div style={{ fontSize: '36px', fontFamily: 'serif', fontStyle: 'italic', color: '#000000', margin: '6px 0 10px 0', lineHeight: 1.2 }}>
                    {previewRecord.studentName}
                  </div>
                  <div style={{ width: '140px', height: '1.5px', background: '#cbd5e1', margin: '0 auto 16px auto' }} />
                  <p style={{ fontSize: '11px', color: '#3c3c3c', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto', textTransform: 'uppercase', fontWeight: 500 }}>
                    FOR SUCCESSFULLY COMPLETING THE COURSE<br />
                    <strong style={{ color: '#0f172a', fontWeight: 800 }}>{previewRecord.course}</strong><br />
                    HELD ON {formatCertificateDate(previewRecord.issuedDate || previewRecord.completionDate).toUpperCase()} AT NeST DIGITAL TECH PARK
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '18px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fff' }}>
              <button
                onClick={() => setPreviewRecord(null)}
                style={{ padding: '10px 18px', borderRadius: '12px', background: '#fff', border: '1px solid #cbd5e1', color: '#64748b', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadSingle(previewRecord);
                  setPreviewRecord(null);
                }}
                style={{
                  padding: '10px 20px', borderRadius: '12px', background: brandPrimary, color: '#fff', border: 'none',
                  fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 12px rgba(35, 49, 103, 0.25)'
                }}
              >
                <Download size={15} /> Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-row:hover { background: #fcfdfe !important; }
        .skeleton-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
};

export default CM_Certificates;
