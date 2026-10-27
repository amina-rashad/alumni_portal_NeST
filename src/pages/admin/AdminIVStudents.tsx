import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Users, Building, GraduationCap, Plus, ChevronDown,
  Download, Edit2, Trash2, Search, Filter, RefreshCw, Award, Eye, X, FolderDown, Loader2, FileSpreadsheet,
  CheckCircle2, School, Mail, Calendar, Clock
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { adminApi } from '../../services/api';
import { getIVCertificatePDF, formatCertificateDate } from '../../utils/CertificateGenerator';
import toast from 'react-hot-toast';

const getInitials = (name?: string) => {
  if (!name) return 'IV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AdminIVStudents: React.FC = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<any[]>([]);
  const [allIVUsers, setAllIVUsers] = useState<any[]>([]);
  const [dbIssuedCertificates, setDbIssuedCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tab: 'students' (individual IV students) or 'colleges' (grouped by college)
  const [viewTab, setViewTab] = useState<'students' | 'colleges'>('students');

  // Filters for Students view
  const [statusFilter, setStatusFilter] = useState<'All' | 'Issued' | 'Pending'>('All');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCollegeFilter, setStudentCollegeFilter] = useState('All');
  const [studentBatchFilter, setStudentBatchFilter] = useState('All');

  // Filters for Colleges view
  const [collegeSearch, setCollegeSearch] = useState('');

  const [isDownloadingZip, setIsDownloadingZip] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [issuedStudents, setIssuedStudents] = useState<any[]>([]);

  // Issue modal for individual student
  const [issueModal, setIssueModal] = useState<{
    isOpen: boolean;
    student: any | null;
    visitDate: string;
    college: string;
    batch: string;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    student: null,
    visitDate: new Date().toISOString().split('T')[0],
    college: '',
    batch: '2024',
    isSubmitting: false
  });

  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  const fetchVisits = async () => {
    setIsLoading(true);
    try {
      const [visitRes, certRes, usersRes] = await Promise.all([
        adminApi.getVisits(),
        adminApi.getIssuedIVCertificates(),
        adminApi.getUsers({ type: 'IV Student' })
      ]);

      if (visitRes.success && visitRes.data) {
        setVisits(visitRes.data.visits || []);
      }
      if (certRes.success && certRes.data) {
        setDbIssuedCertificates(certRes.data.certificates || []);
      }
      if (usersRes.success && usersRes.data) {
        setAllIVUsers(usersRes.data.users || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load IV records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  // Unified list of ALL IV students (both registered in users and issued certificates)
  const unifiedStudents = useMemo(() => {
    const list: any[] = [];
    const seenEmails = new Set<string>();

    // 1. All registered IV users from platform (User Management)
    allIVUsers.forEach((u: any) => {
      const email = (u.email || '').toLowerCase().trim();
      seenEmails.add(email);

      // Check if user has an issued IV cert
      const userCert = (u.certificates || []).find((c: any) => c.type === 'iv');
      const dbCert = dbIssuedCertificates.find((c: any) => (c.email || '').toLowerCase().trim() === email);

      const cert = userCert || dbCert;
      const isIssued = !!cert;

      list.push({
        id: u.id || u._id,
        name: u.full_name || u.name || 'IV Student',
        email: u.email || 'N/A',
        college: u.college || cert?.college || 'N/A',
        batch: u.batch || cert?.batch || '2024',
        date: cert?.date || u.joining_date || 'N/A',
        issuedAt: cert?.issued_at || cert?.issuedAt || null,
        status: isIssued ? 'Issued' : 'Pending',
        isRegisteredUser: true,
        userDoc: u
      });
    });

    // 2. Any additional certificates issued to non-registered accounts (e.g. from Excel imports)
    dbIssuedCertificates.forEach((c: any) => {
      const email = (c.email || '').toLowerCase().trim();
      if (!seenEmails.has(email)) {
        seenEmails.add(email);
        list.push({
          id: c.id,
          name: c.name || 'IV Student',
          email: c.email || 'N/A',
          college: c.college || 'N/A',
          batch: c.batch || '2024',
          date: c.date || 'N/A',
          issuedAt: c.issuedAt || null,
          status: 'Issued',
          isRegisteredUser: false
        });
      }
    });

    return list;
  }, [allIVUsers, dbIssuedCertificates]);

  // Filtered students for display
  const filteredStudents = useMemo(() => {
    return unifiedStudents.filter((s: any) => {
      // Status filter
      if (statusFilter !== 'All' && s.status !== statusFilter) {
        return false;
      }

      // Search query
      const q = studentSearch.toLowerCase().trim();
      if (q) {
        const matchName = (s.name || '').toLowerCase().includes(q);
        const matchEmail = (s.email || '').toLowerCase().includes(q);
        const matchCollege = (s.college || '').toLowerCase().includes(q);
        const matchBatch = (s.batch || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCollege && !matchBatch) return false;
      }

      // College dropdown filter
      if (studentCollegeFilter !== 'All' && s.college !== studentCollegeFilter) {
        return false;
      }

      // Batch dropdown filter
      if (studentBatchFilter !== 'All' && s.batch !== studentBatchFilter) {
        return false;
      }

      return true;
    });
  }, [unifiedStudents, statusFilter, studentSearch, studentCollegeFilter, studentBatchFilter]);

  const studentColleges = useMemo(() => {
    return Array.from(new Set(unifiedStudents.map((s: any) => s.college))).filter((c) => c && c !== 'N/A').sort() as string[];
  }, [unifiedStudents]);

  const studentBatches = useMemo(() => {
    return Array.from(new Set(unifiedStudents.map((s: any) => s.batch))).filter((b) => b && b !== 'N/A').sort().reverse() as string[];
  }, [unifiedStudents]);

  // KPI Counts
  const totalStudentsCount = unifiedStudents.length;
  const issuedStudentsCount = unifiedStudents.filter(s => s.status === 'Issued').length;
  const pendingStudentsCount = unifiedStudents.filter(s => s.status === 'Pending').length;

  // College groups for College Summary Tab
  const collegeGroups = useMemo(() => {
    const groups: Record<string, any> = {};
    dbIssuedCertificates.forEach((s: any) => {
      const key = (s.college || 'N/A').toUpperCase();
      if (!groups[key]) {
        groups[key] = {
          college: s.college || 'N/A',
          lastIssuedAt: s.issuedAt || new Date().toISOString(),
          count: 0,
          students: []
        };
      }
      groups[key].count++;
      groups[key].students.push(s);
      if (new Date(s.issuedAt).getTime() > new Date(groups[key].lastIssuedAt).getTime()) {
        groups[key].lastIssuedAt = s.issuedAt;
      }
    });

    let result = Object.values(groups);
    if (collegeSearch) {
      result = result.filter((g: any) => g.college.toLowerCase().includes(collegeSearch.toLowerCase()));
    }

    return result.sort((a: any, b: any) => new Date(b.lastIssuedAt).getTime() - new Date(a.lastIssuedAt).getTime());
  }, [dbIssuedCertificates, collegeSearch]);

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

  const handlePreview = (s: any) => {
    try {
      const doc = getIVCertificatePDF(s.name, s.batch || '2024', s.date);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      toast.error('Failed to preview certificate');
    }
  };

  const handleDownloadSingle = (s: any) => {
    try {
      const doc = getIVCertificatePDF(s.name, s.batch || '2024', s.date);
      doc.save(`${(s.name || 'IV_Student').replace(/\s+/g, '_')}_IV_Certificate.pdf`);
      toast.success(`Downloaded certificate for ${s.name}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to download certificate');
    }
  };

  // Open Issue Certificate Modal
  const openIssueModal = (s: any) => {
    setIssueModal({
      isOpen: true,
      student: s,
      visitDate: s.date && s.date !== 'N/A' ? (s.date.includes('T') ? s.date.split('T')[0] : s.date) : new Date().toISOString().split('T')[0],
      college: s.college && s.college !== 'N/A' ? s.college : 'NeST Digital Tech Park',
      batch: s.batch && s.batch !== 'N/A' ? s.batch : '2024',
      isSubmitting: false
    });
  };

  const handleConfirmIssue = async () => {
    if (!issueModal.student) return;
    setIssueModal(prev => ({ ...prev, isSubmitting: true }));
    try {
      const payload = [{
        name: issueModal.student.name,
        email: issueModal.student.email,
        college: issueModal.college,
        batch: issueModal.batch,
        date: issueModal.visitDate
      }];
      const res = await adminApi.bulkIssueIVCertificates(payload);
      if (res.success) {
        toast.success(`Certificate issued successfully to ${issueModal.student.name}!`);
        setIssueModal(prev => ({ ...prev, isOpen: false }));
        await fetchVisits();
      } else {
        toast.error(res.message || 'Failed to issue certificate');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error issuing certificate');
    } finally {
      setIssueModal(prev => ({ ...prev, isSubmitting: false }));
    }
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
    const allIssued = dbIssuedCertificates;
    const collegeIssued = allIssued.filter((s: any) => 
      (s.college || '').toLowerCase() === collegeName.toLowerCase()
    );
    setIssuedStudents(collegeIssued);
    setSelectedCollege(collegeName);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minHeight: '100%', position: 'relative' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: nestNavy, margin: 0 }}>IV Management</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '6px', fontWeight: 500 }}>
            Management, scheduling, and certification of institutional Industrial Visit students.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => fetchVisits()}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', 
              background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', 
              borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
            }}
            title="Refresh List"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => navigate('/admin/users/bulk', { state: { defaultUserType: 'IV Student' } })}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
              background: '#f1f5f9', color: '#1a2652', border: '1px solid #e2e8f0', 
              borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: '0.2s',
              fontSize: '14px'
            }}
          >
            <FileSpreadsheet size={18} /> Bulk Onboarding
          </button>
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
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(26, 38, 82, 0.08)', color: nestNavy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>Total IV Students</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>{totalStudentsCount}</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>Certificates Issued</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>{issuedStudentsCount}</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>Pending Certification</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>{pendingStudentsCount}</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>Colleges Represented</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>{collegeGroups.length}</div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          onClick={() => setViewTab('students')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: viewTab === 'students' ? nestNavy : '#ffffff',
            color: viewTab === 'students' ? '#ffffff' : '#64748b',
            boxShadow: viewTab === 'students' ? '0 4px 12px rgba(26, 38, 82, 0.15)' : 'none',
            borderWidth: viewTab === 'students' ? '0' : '1px',
            borderStyle: 'solid',
            borderColor: '#e2e8f0'
          }}
        >
          <Users size={16} />
          All IV Students
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '20px',
            fontWeight: 800,
            background: viewTab === 'students' ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
            color: viewTab === 'students' ? '#ffffff' : '#475569'
          }}>
            {totalStudentsCount}
          </span>
        </button>

        <button
          onClick={() => setViewTab('colleges')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: viewTab === 'colleges' ? nestNavy : '#ffffff',
            color: viewTab === 'colleges' ? '#ffffff' : '#64748b',
            boxShadow: viewTab === 'colleges' ? '0 4px 12px rgba(26, 38, 82, 0.15)' : 'none',
            borderWidth: viewTab === 'colleges' ? '0' : '1px',
            borderStyle: 'solid',
            borderColor: '#e2e8f0'
          }}
        >
          <Building size={16} />
          Colleges Summary
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '20px',
            fontWeight: 800,
            background: viewTab === 'colleges' ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
            color: viewTab === 'colleges' ? '#ffffff' : '#475569'
          }}>
            {collegeGroups.length}
          </span>
        </button>
      </div>

      {/* ── TAB 1: ALL IV STUDENTS DIRECTORY ── */}
      {viewTab === 'students' && (
        <div>
          {/* Subheader & Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: nestNavy, margin: 0 }}>
                IV Students Directory
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>
                All registered Industrial Visit students and their certification statuses.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Status Filter Pills */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                <button
                  onClick={() => setStatusFilter('All')}
                  style={{
                    padding: '6px 14px', borderRadius: '9px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    background: statusFilter === 'All' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'All' ? nestNavy : '#64748b',
                    boxShadow: statusFilter === 'All' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  All ({totalStudentsCount})
                </button>
                <button
                  onClick={() => setStatusFilter('Issued')}
                  style={{
                    padding: '6px 14px', borderRadius: '9px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    background: statusFilter === 'Issued' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'Issued' ? '#16a34a' : '#64748b',
                    boxShadow: statusFilter === 'Issued' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  Issued ({issuedStudentsCount})
                </button>
                <button
                  onClick={() => setStatusFilter('Pending')}
                  style={{
                    padding: '6px 14px', borderRadius: '9px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    background: statusFilter === 'Pending' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'Pending' ? '#d97706' : '#64748b',
                    boxShadow: statusFilter === 'Pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  Pending ({pendingStudentsCount})
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', width: '250px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search student, email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px 9px 38px', borderRadius: '10px',
                    border: '1px solid #e2e8f0', outline: 'none', fontSize: '13px',
                    background: '#fff', color: '#1e293b', fontWeight: 600, boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* College Filter */}
              {studentColleges.length > 0 && (
                <select
                  value={studentCollegeFilter}
                  onChange={(e) => setStudentCollegeFilter(e.target.value)}
                  style={{
                    padding: '9px 12px', borderRadius: '10px', border: '1px solid #e2e8f0',
                    background: '#fff', fontSize: '13px', color: '#1e293b', fontWeight: 600, outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="All">All Colleges</option>
                  {studentColleges.map((col, idx) => (
                    <option key={idx} value={col}>{col}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Students Table */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Student</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>College</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Batch</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Visit Date</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Issued On</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
                          <Award size={44} color="#cbd5e1" />
                          <span style={{ fontSize: '15px', fontWeight: 600, color: '#64748b' }}>
                            {studentSearch || statusFilter !== 'All' || studentCollegeFilter !== 'All'
                              ? 'No IV students match the selected filters.'
                              : 'No IV students registered in the platform yet.'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s: any, idx: number) => {
                      const isIssued = s.status === 'Issued';
                      return (
                        <tr key={s.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: isIssued ? '#1a2652' : '#64748b',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                                fontWeight: 800,
                                flexShrink: 0
                              }}>
                                {getInitials(s.name)}
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                                  {s.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                  <Mail size={12} /> {s.email || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <School size={14} color="#94a3b8" />
                              <span>{s.college || 'N/A'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: '#f1f5f9',
                              color: '#475569',
                              fontSize: '12px',
                              fontWeight: 700
                            }}>
                              {s.batch || '2024'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={13} color="#94a3b8" />
                              <span>{s.date && s.date !== 'N/A' ? formatCertificateDate(s.date) : 'Pending Schedule'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                            {s.issuedAt ? formatCertificateDate(s.issuedAt) : '—'}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            {isIssued ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 700
                              }}>
                                <CheckCircle2 size={13} /> Issued
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#fef3c7',
                                color: '#d97706',
                                border: '1px solid #fde68a',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 700
                              }}>
                                <Clock size={13} /> Pending
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              {isIssued ? (
                                <>
                                  <button
                                    onClick={() => handlePreview(s)}
                                    title="Preview Certificate PDF"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      background: '#ffffff',
                                      border: '1px solid #e2e8f0',
                                      color: nestNavy,
                                      padding: '8px 14px',
                                      borderRadius: '10px',
                                      fontSize: '13px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      transition: '0.15s'
                                    }}
                                  >
                                    <Eye size={14} /> Preview
                                  </button>
                                  <button
                                    onClick={() => handleDownloadSingle(s)}
                                    title="Download Certificate PDF"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      background: nestNavy,
                                      border: 'none',
                                      color: '#ffffff',
                                      padding: '8px 14px',
                                      borderRadius: '10px',
                                      fontSize: '13px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      transition: '0.15s'
                                    }}
                                  >
                                    <Download size={14} /> Download
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => openIssueModal(s)}
                                  title="Issue Certificate to this Student"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: nestNavy,
                                    border: 'none',
                                    color: '#ffffff',
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(26, 38, 82, 0.2)'
                                  }}
                                >
                                  <Award size={14} /> Issue Certificate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: COLLEGES CERTIFICATION HISTORY ── */}
      {viewTab === 'colleges' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: nestNavy, margin: 0 }}>Colleges Certification Summary</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>
                Summary of bulk certificates issued to various educational institutions.
              </p>
            </div>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search by college name..."
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px 10px 40px', borderRadius: '12px',
                  border: '1px solid #e2e8f0', outline: 'none', fontSize: '13px',
                  background: '#fff', color: '#1e293b', fontWeight: 600, boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Issued Date</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>College Name</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Visit Date</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Students</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {collegeGroups.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
                          <Building size={44} color="#cbd5e1" />
                          <span style={{ fontSize: '15px', fontWeight: 600, color: '#64748b' }}>No college records found.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    collegeGroups.map((group: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                          {formatCertificateDate(group.lastIssuedAt)}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '15px', fontWeight: 800, color: nestNavy }}>
                          {group.college}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
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

                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ padding: '6px 12px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.05)', color: nestNavy, fontSize: '13px', fontWeight: 700 }}>
                            {group.count} Total Certificates
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleDownloadCollegeZip(group.college, group.students)}
                              disabled={isDownloadingZip === group.college}
                              style={{ 
                                background: '#f8fafc', color: nestNavy, border: '1px solid #e2e8f0', 
                                padding: '8px 14px', borderRadius: '10px', fontSize: '13px', 
                                fontWeight: 700, cursor: isDownloadingZip === group.college ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px'
                              }}
                            >
                              {isDownloadingZip === group.college ? <Loader2 size={14} className="animate-spin" /> : <FolderDown size={14} />}
                              Download ZIP
                            </button>
                            <button 
                              onClick={() => handleViewIssued(group.college)}
                              style={{ background: nestNavy, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              View College
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ISSUE CERTIFICATE TO STUDENT ── */}
      {issueModal.isOpen && issueModal.student && (
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
              background: '#fff', width: '100%', maxWidth: '520px',
              borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a2652' }}>Issue IV Certificate</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                  Generate and issue a verified completion certificate for this student.
                </p>
              </div>
              <button 
                onClick={() => setIssueModal(prev => ({ ...prev, isOpen: false }))} 
                style={{ background: '#f1f5f9', border: 'none', color: '#64748b', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Student Name
                </label>
                <input
                  type="text"
                  disabled
                  value={issueModal.student.name}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontWeight: 600, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="text"
                  disabled
                  value={issueModal.student.email}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 500, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  College / Institution Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Model Engineering College"
                  value={issueModal.college}
                  onChange={(e) => setIssueModal(prev => ({ ...prev, college: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#1e293b', fontWeight: 600, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Batch / Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={issueModal.batch}
                    onChange={(e) => setIssueModal(prev => ({ ...prev, batch: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#1e293b', fontWeight: 600, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={issueModal.visitDate}
                    onChange={(e) => setIssueModal(prev => ({ ...prev, visitDate: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#1e293b', fontWeight: 600, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setIssueModal(prev => ({ ...prev, isOpen: false }))} 
                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmIssue}
                disabled={issueModal.isSubmitting}
                style={{ 
                  background: nestNavy, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, cursor: issueModal.isSubmitting ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {issueModal.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
                Confirm & Issue Certificate
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Issued Certificates Modal (Per College) */}
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
                              <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>{formatCertificateDate(s.date)}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: nestNavy, cursor: 'pointer' }}
                            onClick={() => handlePreview(s)}
                          >
                            <Eye size={16} /> Preview
                          </button>
                          <button 
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: nestNavy, border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                            onClick={() => handleDownloadSingle(s)}
                          >
                            <Download size={16} /> Download
                          </button>
                        </div>
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
