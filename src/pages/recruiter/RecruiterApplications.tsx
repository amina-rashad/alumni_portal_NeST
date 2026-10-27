import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  Search, Mail, User, FileText, Briefcase, Users, Calendar, Clock, Filter, 
  Download, ChevronDown, DownloadCloud, FileArchive, X, AlertCircle, Edit, 
  CheckSquare, MessageSquare, Loader2, Phone, MapPin, GraduationCap, Eye, 
  ExternalLink, Building, CheckCircle2, Award, Globe, Github, Linkedin, 
  ShieldCheck, Check, Sparkles, Tag, FileSpreadsheet, Send, ChevronUp, 
  MailCheck, History, RotateCcw, XCircle, ChevronRight
} from 'lucide-react';
import { recruiterApi, getUser } from '../../services/api';
import nestIcon from '../../assets/nest_icon.png';
import UserAvatar from '../../components/UserAvatar';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

import { useLocation } from 'react-router-dom';
import { formatDateTime, formatDateOnly, formatTimeAgo, getLocalDateTag, getLocalDateString } from '../../utils/dateUtils';

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

const formatShortName = (str: string, maxLen = 22): string => {
  const sanitized = (str || '')
    .replace(/[\\/:*?"<>|,.-]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('_')
    .replace(/_+/g, '_');
  return (sanitized || 'Item').slice(0, maxLen);
};

const RecruiterApplications: React.FC = () => {
  const location = useLocation();
  const currentUser = useMemo(() => (getUser() as any) || {}, []);
  const currentRecruiterName = currentUser.full_name || currentUser.name || 'Recruiter';
  const currentRecruiterId = currentUser.emp_id || currentUser.employee_id || currentUser.id || currentUser.email || 'REC';
  const currentRecruiterEmail = currentUser.email || '';
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'specific_date' | 'custom_range'>('all');
  const [viewFilter, setViewFilter] = useState<'all' | 'unviewed' | 'viewed'>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [downloadScope, setDownloadScope] = useState<'filtered' | 'all'>('filtered');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [updateData, setUpdateData] = useState({ 
    status: 'Aptitude', 
    interviewDate: '', 
    interviewTime: '',
    interviewLocation: '',
    notes: '',
    sendEmail: true,
    emailSubject: '',
    emailCandidateNote: ''
  });
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [commentError, setCommentError] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [viewingAppDetails, setViewingAppDetails] = useState<any | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'form' | 'profile' | 'timeline' | 'emails'>('form');

  // Email History Modal State
  const [selectedEmailHistoryApp, setSelectedEmailHistoryApp] = useState<any | null>(null);

  // Direct Compose Email Modal State
  const [composeEmailApp, setComposeEmailApp] = useState<any | null>(null);
  const [composeData, setComposeData] = useState({
    subject: '',
    message: '',
    status: '',
    interviewDate: '',
    interviewTime: '',
    interviewLocation: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  const markAppAsViewed = async (appId: string) => {
    const target = applications.find(a => a.id === appId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    const viewedByObj = { id: currentUser.id, name: currentRecruiterName };

    // Always update to the latest viewing recruiter and current timestamp
    setApplications(prev => prev.map(a => 
      a.id === appId ? { ...a, is_viewed: true, viewed_at: nowIso, viewed_by: viewedByObj } : a
    ));

    // Also update viewing modal if this application is currently open
    setViewingAppDetails((prev: any) => 
      prev && prev.id === appId 
        ? { ...prev, is_viewed: true, viewed_at: nowIso, viewed_by: viewedByObj } 
        : prev
    );

    try {
      await recruiterApi.markApplicationViewed(appId);
    } catch (e) {
      console.error('Failed to mark application as viewed:', e);
    }
  };

  const openAppDetails = (app: any) => {
    markAppAsViewed(app.id);
    const nowIso = new Date().toISOString();
    const viewedByObj = { id: currentUser.id, name: currentRecruiterName };
    setViewingAppDetails({
      ...app,
      is_viewed: true,
      viewed_at: nowIso,
      viewed_by: viewedByObj
    });
    // Direct users default to Form Submission view, Admin-added users default to Profile view
    setActiveDetailTab(app.not_added_by_admin ? 'form' : 'profile');
  };

  const toArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
    if (typeof val === 'string') {
      const s = val.trim();
      if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('(') && s.endsWith(')'))) {
        try {
          const jsonFormatted = s.replace(/'/g, '"');
          const parsed = JSON.parse(jsonFormatted);
          if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
        } catch {
          return s.slice(1, -1).split(',').map((x) => x.replace(/['"]/g, '').trim()).filter(Boolean);
        }
      }
      return s.split(',').map((x) => x.trim()).filter(Boolean);
    }
    return [];
  };
  
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
        case 'Withdrawn': return { color: '#868e96', bg: '#f8f9fa' };
        default: return { color: '#475569', bg: '#f1f5f9' };
    }
  };

  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  const [pdfPreviewModal, setPdfPreviewModal] = useState<{ isOpen: boolean; url: string; title: string; filename: string } | null>(null);

  const isValidExternalDriveLink = (link?: string | null): boolean => {
    if (!link || typeof link !== 'string') return false;
    const trimmed = link.trim().toLowerCase();
    if (!trimmed || trimmed.startsWith('data:') || trimmed.endsWith('.pdf') || trimmed.endsWith('.docx') || trimmed.endsWith('.doc')) {
      return false;
    }
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('drive.google.com') || trimmed.includes('dropbox.com') || trimmed.includes('onedrive.');
  };

  const dataUriToBlob = (dataUri: string): Blob => {
    const parts = dataUri.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
  };

  const cleanRepetitiveEmailBody = (content: string): string => {
    if (!content) return '';
    // If Personal Note wraps a duplicated full template (Dear ..., We wanted to share an update...), clean it
    const personalNoteRegex = /Personal Note:\s*"([\s\S]*?)"/;
    const match = content.match(personalNoteRegex);
    if (match) {
      const innerNote = match[1].trim();
      if (innerNote.toLowerCase().includes('dear ') && innerNote.toLowerCase().includes('update regarding your application')) {
        const innerLines = innerNote.split('\n')
          .map(l => l.trim())
          .filter(l => l && !l.toLowerCase().startsWith('dear ') && !l.toLowerCase().includes('update regarding your application'));
        const cleanedNote = innerLines.join('\n').trim();
        if (cleanedNote) {
          content = content.replace(match[0], `Personal Note: "${cleanedNote}"`);
        } else {
          content = content.replace(match[0], '').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
        }
      }
    }
    return content;
  };

  const getEmailBodyContent = (email: any, fallbackName?: string, fallbackJob?: string) => {
    const raw = (email?.content || email?.body || email?.email_content || '').trim();
    if (raw) {
      return cleanRepetitiveEmailBody(raw);
    }

    const candidateName = email?.recipient_name || fallbackName || 'Candidate';
    const roleTitle = email?.job_title || fallbackJob || 'Position';
    const targetStatus = email?.status_to || 'Applied';
    const recruiter = email?.sent_by?.name || 'Recruiter';

    const statusGuidance: Record<string, string> = {
      'Shortlisted': `Congratulations! Your profile has been shortlisted for the ${roleTitle} role. Our team was impressed with your credentials, and we are moving you forward to the next evaluation stage.`,
      'Interview Scheduled': `We are pleased to invite you for an interview for the ${roleTitle} position. Please review the interview schedule and details below.`,
      'Aptitude': `You have been selected to proceed to the aptitude and skill assessment round for the ${roleTitle} opportunity.`,
      'Offered': `Congratulations! We are delighted to inform you that you have been selected for employment for the ${roleTitle} position at NeST Digital.`,
      'Rejected': `Thank you for your interest in the ${roleTitle} role at NeST Digital. While we were impressed with your background, we have chosen to move forward with other candidates whose profiles align more closely with our current requirements.`,
      'Withdrawn': `We acknowledge that your application for the ${roleTitle} role at NeST Digital has been marked as Withdrawn.`
    };

    const guidance = statusGuidance[targetStatus] || `We wanted to share an update regarding your application for the ${roleTitle} role at NeST Digital.`;

    const lines = [
      `Dear ${candidateName},`,
      '',
      guidance
    ];

    if (targetStatus === 'Interview Scheduled' && (email?.interview_date || email?.interview_time || email?.interview_location)) {
      lines.push('');
      lines.push(`📅 Interview Schedule:`);
      lines.push(`Date: ${email?.interview_date || 'TBD'} • Time: ${email?.interview_time || 'TBD'} • Location: ${email?.interview_location || 'NeST Tech Park, Kochi'}`);
    }

    if (email?.candidate_note && email.candidate_note.trim()) {
      let note = email.candidate_note.trim();
      if (note.toLowerCase().startsWith('dear ') && note.toLowerCase().includes('update regarding your application')) {
        const innerLines = note.split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l && !l.toLowerCase().startsWith('dear ') && !l.toLowerCase().includes('update regarding your application'));
        note = innerLines.join('\n').trim();
      }
      if (note) {
        lines.push('');
        lines.push(`Personal Note: "${note}"`);
      }
    }

    lines.push('');
    lines.push('You can track the ongoing progress of all your applications anytime on your NDA Connect Candidate Portal:');
    lines.push('http://localhost:5180/jobs/applications');
    lines.push('');
    lines.push('Warm regards,');
    lines.push(recruiter);
    lines.push('Talent Acquisition Team • NeST Digital');

    return lines.join('\n');
  };

  const [, setTimeTick] = useState(0);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const jobParam = queryParams.get('job');
    if (jobParam) {
      setFilter(jobParam);
    }
    const searchParam = queryParams.get('search') || queryParams.get('q');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    fetchApplications(true);
  }, [location.search]);

  // Periodic time ticker & background sync for live 'Viewed by' updates across all recruiters
  useEffect(() => {
    const liveTimer = setInterval(() => {
      setTimeTick(t => t + 1);
    }, 10000);

    const backgroundSync = setInterval(() => {
      fetchApplications(false);
    }, 20000);

    const handleFocus = () => {
      fetchApplications(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(liveTimer);
      clearInterval(backgroundSync);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchApplications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await recruiterApi.getApplications();
      if (response.success && response.data) {
        const apps = response.data.applications;
        setApplications(apps);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      if (showLoading) setLoading(false);
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
    markAppAsViewed(app.id);
    const rawUrl = app.resume_url || app.resume_drive_link;
    if (rawUrl && (rawUrl.startsWith('http') || rawUrl.startsWith('data:'))) {
        // Direct download
        const isDocx = app.resume_name?.endsWith('.docx') || rawUrl.includes('wordprocessingml') || rawUrl.includes('officedocument');
        const isDoc = app.resume_name?.endsWith('.doc') || rawUrl.includes('msword');
        const defaultExt = isDocx ? 'docx' : isDoc ? 'doc' : 'pdf';
        const filename = app.resume_name || `${(app.applicant_name || 'Applicant').replace(/\s+/g, '_')}_Resume.${defaultExt}`;
        const link = document.createElement('a');
        link.href = rawUrl;
        link.download = filename;
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

  const handleOpenPdfPreview = async (app: any) => {
    if (!app) return;
    markAppAsViewed(app.id);
    const formData = app.form_data || app;
    const rawUrl = formData.resume_url || app.resume_url || (!isValidExternalDriveLink(formData.resume_drive_link) ? formData.resume_drive_link : '');
    const filename = formData.resume_name || app.resume_name || `${(app.applicant_name || 'Applicant').replace(/\s+/g, '_')}_Resume.pdf`;

    if (rawUrl && rawUrl.startsWith('data:application/pdf')) {
      try {
        const blob = dataUriToBlob(rawUrl);
        const blobUrl = URL.createObjectURL(blob);
        setPdfPreviewModal({
          isOpen: true,
          url: blobUrl,
          title: `${app.applicant_name || 'Applicant'} - Resume PDF`,
          filename: filename
        });
        return;
      } catch (e) {
        setPdfPreviewModal({
          isOpen: true,
          url: rawUrl,
          title: `${app.applicant_name || 'Applicant'} - Resume PDF`,
          filename: filename
        });
        return;
      }
    }

    if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) && rawUrl.toLowerCase().endsWith('.pdf')) {
      setPdfPreviewModal({
        isOpen: true,
        url: rawUrl,
        title: `${app.applicant_name || 'Applicant'} - Resume PDF`,
        filename: filename
      });
      return;
    }

    const resumeData = app.resume_data || app.profile_data?.resume_data;
    if (resumeData) {
      setDownloadingId(app.id);
      const blob = await generatePDF(resumeData);
      setDownloadingId(null);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        setPdfPreviewModal({
          isOpen: true,
          url: blobUrl,
          title: `${app.applicant_name || 'Applicant'} - Resume PDF`,
          filename: filename
        });
        return;
      }
    }

    // Fallback: download if not a direct PDF view
    handleDownloadCV(app);
  };

  const createCandidateProfilePDF = (app: any): Blob => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(26, 38, 82);
    doc.text(app.applicant_name || 'Candidate Profile', 20, 24);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 16, 46);
    doc.text(`Applied Position: ${app.job_title || 'General Application'}`, 20, 32);

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 36, 190, 36);

    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    let y = 46;
    const addRow = (label: string, value: string) => {
      if (!value) return;
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 72, y);
      y += 9;
    };

    addRow('College / Institution', app.college || 'Not Specified');
    addRow('Candidate Email', app.applicant_email || 'N/A');
    addRow('Phone Number', app.phone || 'N/A');
    addRow('Application Status', app.status || 'Applied');
    addRow('Applied Date', app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A');
    addRow('Batch / Year', app.batch || app.graduation_year || 'N/A');
    addRow('Specialization / Branch', app.specialization || 'N/A');
    addRow('Current Location', app.location || app.current_location || 'N/A');
    addRow('Preferred Location', app.preferred_location || 'N/A');
    addRow('Total Experience', app.total_experience || 'N/A');
    addRow('Current Organisation', app.current_organisation || 'N/A');
    addRow('Current Designation', app.current_designation || 'N/A');
    if (app.tech_stacks && Array.isArray(app.tech_stacks) && app.tech_stacks.length > 0) {
      addRow('Tech Stacks', app.tech_stacks.join(', '));
    }
    const resumeFileName = app.resume_name || app.resume_filename || (app.resume_drive_link && !isValidExternalDriveLink(app.resume_drive_link) ? app.resume_drive_link : '') || `${(app.applicant_name || 'Candidate').trim().replace(/\s+/g, '_')}_Resume.pdf`;
    if (resumeFileName) {
      addRow('Attached Resume File', resumeFileName);
    }
    return doc.output('blob');
  };

  const uniqueJobs = useMemo(() => {
    return Array.from(new Set(applications.map(app => (app.job_title || '').trim()))).filter(Boolean).sort();
  }, [applications]);

  const uniqueColleges = useMemo(() => {
    return Array.from(new Set(applications.map(app => (app.college || 'Not Specified').trim()))).filter(Boolean).sort();
  }, [applications]);

  const matchSearch = useMemo(() => {
    if (!searchTerm.trim()) return () => true;
    const q = searchTerm.trim().toLowerCase();
    return (app: any) => {
      const name = String(app.applicant_name || app.full_name || '').toLowerCase();
      const email = String(app.applicant_email || app.email || '').toLowerCase();
      const job = String(app.job_title || '').toLowerCase();
      const college = String(app.college || '').toLowerCase();
      const phone = String(app.phone || '').toLowerCase();
      const batch = String(app.batch || app.graduation_year || '').toLowerCase();
      const spec = String(app.specialization || '').toLowerCase();
      const loc = String(app.location || app.current_location || app.preferred_location || '').toLowerCase();
      const org = String(app.current_organisation || app.current_company || '').toLowerCase();
      const desig = String(app.current_designation || app.title || '').toLowerCase();
      const status = String(app.status || '').toLowerCase();
      const userType = String(app.user_type || (app.not_added_by_admin ? 'portal applicant direct candidate' : 'alumni directory member')).toLowerCase();
      const empId = String(app.emp_id || app.student_id || '').toLowerCase();
      const resumeName = String(app.resume_name || '').toLowerCase();
      
      const skills = toArray(app.skills).join(' ').toLowerCase();
      const techStacks = toArray(app.tech_stacks).join(' ').toLowerCase();
      const positions = toArray(app.interested_positions).join(' ').toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        job.includes(q) ||
        college.includes(q) ||
        phone.includes(q) ||
        batch.includes(q) ||
        spec.includes(q) ||
        loc.includes(q) ||
        org.includes(q) ||
        desig.includes(q) ||
        status.includes(q) ||
        userType.includes(q) ||
        empId.includes(q) ||
        resumeName.includes(q) ||
        skills.includes(q) ||
        techStacks.includes(q) ||
        positions.includes(q)
      );
    };
  }, [searchTerm]);

  const parseAppDate = (dateStr?: string | null): Date | null => {
    if (!dateStr) return null;
    const normalized = typeof dateStr === 'string' && dateStr.includes(' ') && !dateStr.includes('T')
      ? dateStr.replace(' ', 'T')
      : dateStr;
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  };

  const checkAppMatchesTimeframe = (app: any, tf: string, selDate: string, sDate: string, eDate: string): boolean => {
    if (tf === 'all') return true;
    const d = parseAppDate(app.applied_at);
    if (!d) return false;
    const now = new Date();

    if (tf === 'today') {
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }

    if (tf === 'yesterday') {
      const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      return (
        d.getFullYear() === yest.getFullYear() &&
        d.getMonth() === yest.getMonth() &&
        d.getDate() === yest.getDate()
      );
    }

    if (tf === 'specific_date') {
      if (!selDate) return true;
      const [y, m, day] = selDate.split('-').map(Number);
      return d.getFullYear() === y && (d.getMonth() + 1) === m && d.getDate() === day;
    }

    if (tf === 'week') {
      // Last 7 days including today
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return d >= weekAgo && d <= endOfToday;
    }

    if (tf === 'month') {
      // Current calendar month or last 30 days
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const isCurrentMonth = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      return isCurrentMonth || (d >= monthAgo && d <= endOfToday);
    }

    if (tf === 'custom_range') {
      if (sDate) {
        const [sy, sm, sd] = sDate.split('-').map(Number);
        const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
        if (d < start) return false;
      }
      if (eDate) {
        const [ey, em, ed] = eDate.split('-').map(Number);
        const end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    }

    return true;
  };

  const getTimeframeLabel = () => {
    switch (timeframeFilter) {
      case 'today': return 'Today (Day-wise)';
      case 'yesterday': return 'Yesterday (Day-wise)';
      case 'week': return 'This Week (Weekly)';
      case 'month': return 'This Month (Monthly)';
      case 'specific_date': return selectedDate ? `Custom Day: ${selectedDate}` : 'Custom Day';
      case 'custom_range': return `Custom Range: ${startDate || 'Start'} to ${endDate || 'End'}`;
      default: return 'All Time';
    }
  };

  const formatYMD = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleSetQuickDay = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setSelectedDate(formatYMD(d));
    setTimeframeFilter('specific_date');
  };

  const handleSetQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    setStartDate(formatYMD(start));
    setEndDate(formatYMD(end));
    setTimeframeFilter('custom_range');
  };

  const timeframeCounts = useMemo(() => {
    const basePool = applications.filter(a => {
      const matchesSearchFilter = matchSearch(a);
      const matchesJob = filter === 'all' || (a.job_title || '').trim() === filter;
      const matchesCol = collegeFilter === 'all' || (a.college || 'Not Specified').trim().toLowerCase() === collegeFilter.toLowerCase();
      return matchesSearchFilter && matchesJob && matchesCol;
    });

    return {
      all: basePool.length,
      today: basePool.filter(a => checkAppMatchesTimeframe(a, 'today', '', '', '')).length,
      yesterday: basePool.filter(a => checkAppMatchesTimeframe(a, 'yesterday', '', '', '')).length,
      week: basePool.filter(a => checkAppMatchesTimeframe(a, 'week', '', '', '')).length,
      month: basePool.filter(a => checkAppMatchesTimeframe(a, 'month', '', '', '')).length,
    };
  }, [applications, filter, collegeFilter, matchSearch]);

  const collegeCountsForJob = useMemo(() => {
    const counts: Record<string, number> = {};
    const pool = applications.filter(a => {
      const matchesSearchFilter = matchSearch(a);
      const matchesJob = filter === 'all' || (a.job_title || '').trim() === filter;
      const matchesDate = checkAppMatchesTimeframe(a, timeframeFilter, selectedDate, startDate, endDate);
      return matchesSearchFilter && matchesJob && matchesDate;
    });
    pool.forEach(a => {
      const col = (a.college || 'Not Specified').trim();
      counts[col] = (counts[col] || 0) + 1;
    });
    return counts;
  }, [applications, filter, matchSearch, timeframeFilter, selectedDate, startDate, endDate]);

  const jobCountsForCollege = useMemo(() => {
    const counts: Record<string, number> = {};
    const pool = applications.filter(a => {
      const matchesSearchFilter = matchSearch(a);
      const matchesCol = collegeFilter === 'all' || (a.college || 'Not Specified').trim().toLowerCase() === collegeFilter.toLowerCase();
      const matchesDate = checkAppMatchesTimeframe(a, timeframeFilter, selectedDate, startDate, endDate);
      return matchesSearchFilter && matchesCol && matchesDate;
    });
    pool.forEach(a => {
      const job = (a.job_title || '').trim();
      counts[job] = (counts[job] || 0) + 1;
    });
    return counts;
  }, [applications, collegeFilter, matchSearch, timeframeFilter, selectedDate, startDate, endDate]);

  const viewCounts = useMemo(() => {
    const pool = applications.filter(a => {
      const matchesSearchFilter = matchSearch(a);
      const matchesJob = filter === 'all' || (a.job_title || '').trim() === filter;
      const matchesCol = collegeFilter === 'all' || (a.college || 'Not Specified').trim().toLowerCase() === collegeFilter.toLowerCase();
      const matchesDate = checkAppMatchesTimeframe(a, timeframeFilter, selectedDate, startDate, endDate);
      return matchesSearchFilter && matchesJob && matchesCol && matchesDate;
    });
    return {
      all: pool.length,
      unviewed: pool.filter(a => !a.is_viewed).length,
      viewed: pool.filter(a => a.is_viewed).length
    };
  }, [applications, filter, collegeFilter, matchSearch, timeframeFilter, selectedDate, startDate, endDate]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearchFilter = matchSearch(app);
      const matchJob = filter === 'all' || (app.job_title || '').trim() === filter;
      const matchCollege = collegeFilter === 'all' || (app.college || 'Not Specified').trim().toLowerCase() === collegeFilter.toLowerCase();
      const matchTimeframe = checkAppMatchesTimeframe(app, timeframeFilter, selectedDate, startDate, endDate);
      const matchView = viewFilter === 'all' || (viewFilter === 'viewed' ? Boolean(app.is_viewed) : !app.is_viewed);
      return matchesSearchFilter && matchJob && matchCollege && matchTimeframe && matchView;
    });
  }, [applications, filter, collegeFilter, matchSearch, timeframeFilter, selectedDate, startDate, endDate, viewFilter]);

  const isAnyFilterActive = collegeFilter !== 'all' || filter !== 'all' || timeframeFilter !== 'all' || viewFilter !== 'all' || searchTerm.trim().length > 0 || Boolean(selectedDate) || Boolean(startDate) || Boolean(endDate);

  const confirmBulkDownload = async (scopeOverride?: 'filtered' | 'all') => {
    const activeScope = scopeOverride || downloadScope;
    setShowConfirmModal(false);
    setIsBulkDownloading(true);
    
    try {
        const targetApps = activeScope === 'all' ? applications : filteredApps;
        if (!targetApps || targetApps.length === 0) {
            setIsBulkDownloading(false);
            return;
        }

        const zip = new JSZip();
        const usedPaths = new Set<string>();

        const isSpecificCollege = collegeFilter !== 'all';
        const isSpecificJob = filter !== 'all';
        const isFullyFiltered = activeScope === 'filtered' && isSpecificCollege && isSpecificJob;

        for (const app of targetApps) {
            const rawCollege = (app.college || 'Unspecified_College').trim();
            const rawJob = (app.job_title || 'General_Position').trim();
            const safeName = (app.applicant_name || app.applicant_email?.split('@')[0] || 'Candidate')
                .replace(/[\\/:*?"<>|]/g, ' ')
                .trim()
                .split(/\s+/)
                .slice(0, 3)
                .join('_')
                .slice(0, 22);

            let candidateFilename = `${safeName}_Resume.pdf`;

            // Avoid redundant deep folder hierarchies that exceed Windows MAX_PATH limit
            let zipPath = '';
            if (isFullyFiltered) {
                // If filtered to a specific college and job, keep files flat in the archive
                zipPath = candidateFilename;
            } else if (activeScope === 'filtered' && isSpecificCollege) {
                // Filtered by college -> group by job name
                const jobFolder = formatShortName(rawJob, 22);
                zipPath = `${jobFolder}/${candidateFilename}`;
            } else if (activeScope === 'filtered' && isSpecificJob) {
                // Filtered by job -> group by college name
                const collegeFolder = formatShortName(rawCollege, 22);
                zipPath = `${collegeFolder}/${candidateFilename}`;
            } else {
                // Complete archive -> concise college and job folders
                const collegeFolder = formatShortName(rawCollege, 20);
                const jobFolder = formatShortName(rawJob, 20);
                zipPath = `${collegeFolder}/${jobFolder}/${candidateFilename}`;
            }

            // Deduplicate filename collisions
            if (usedPaths.has(zipPath)) {
                const shortId = String(app._id || Math.floor(Math.random() * 1000)).slice(-4);
                if (zipPath.includes('/')) {
                    const lastSlash = zipPath.lastIndexOf('/');
                    zipPath = `${zipPath.slice(0, lastSlash)}/${safeName}_${shortId}_Resume.pdf`;
                } else {
                    zipPath = `${safeName}_${shortId}_Resume.pdf`;
                }
            }
            usedPaths.add(zipPath);

            let fileBlob: Blob | null = null;
            if (app.resume_url && (app.resume_url.startsWith('http') || app.resume_url.startsWith('data:'))) {
                try {
                    const response = await fetch(app.resume_url);
                    fileBlob = await response.blob();
                } catch (err) {
                    console.warn(`Failed to fetch direct resume for ${app.applicant_name}`, err);
                }
            } else if (app.resume_data) {
                fileBlob = await generatePDF(app.resume_data);
            }

            if (!fileBlob) {
                fileBlob = createCandidateProfilePDF(app);
            }

            if (fileBlob) {
                zip.file(zipPath, fileBlob);
            }
        }

        // Resolve distinct resume file name
        const getResumeFileName = (a: any) => {
            let resumeFile = '';
            if (a.resume_name && a.resume_name.trim()) {
                resumeFile = a.resume_name.trim();
            } else if (a.resume_filename && a.resume_filename.trim()) {
                resumeFile = a.resume_filename.trim();
            } else if (a.resume_drive_link && !isValidExternalDriveLink(a.resume_drive_link)) {
                resumeFile = a.resume_drive_link.trim();
            } else if (a.resume_url) {
                if (!a.resume_url.startsWith('http://') && !a.resume_url.startsWith('https://')) {
                    // Uploaded document / data URL
                    resumeFile = `${(a.applicant_name || 'Candidate').trim().replace(/\s+/g, '_')}_Resume.pdf`;
                } else if (!isValidExternalDriveLink(a.resume_url)) {
                    const parts = a.resume_url.split('/');
                    const last = parts[parts.length - 1];
                    if (last && (last.endsWith('.pdf') || last.endsWith('.docx') || last.endsWith('.doc'))) {
                        resumeFile = decodeURIComponent(last);
                    }
                }
            }

            return resumeFile || `${(a.applicant_name || 'Candidate').trim().replace(/\s+/g, '_')}_Resume.pdf`;
        };

        // Add Excel (.xlsx), CSV, and PDF summary reports inside the archive
        const excelHeaders = [
            'Candidate Name',
            'Email',
            'Phone',
            'College',
            'Job Title',
            'Applied Date',
            'Current Status',
            'Status Last Updated At',
            'Last Updated By',
            'Recruiter ID',
            'Recruiter Internal Comment / Reason',
            'View Status',
            'Experience',
            'Specialization',
            'Location',
            'Attached Resume File'
        ];
        const excelData = targetApps.map(a => {
            const lastEv = [...(a.timeline || [])].reverse().find((e: any) => e.action === 'Status Changed' || e.recruiter_id || e.note);
            const updaterName = a.last_updated_by?.name || lastEv?.actor_name || '';
            const updaterId = a.last_updated_by?.recruiter_id || lastEv?.recruiter_id || '';
            const noteText = a.notes || a.last_status_note || lastEv?.note || '';
            const updateTime = (a.status_updated_at || a.updated_at) ? formatDateTime(a.status_updated_at || a.updated_at) : '';
            const viewStatusText = a.is_viewed ? `Viewed by ${a.viewed_by?.name || 'Recruiter'}${a.viewed_at ? ` (${formatTimeAgo(a.viewed_at)})` : ''}` : 'Unviewed / New';

            return [
                a.applicant_name || '',
                a.applicant_email || '',
                a.phone || '',
                a.college || 'Not Specified',
                a.job_title || '',
                a.applied_at ? formatDateOnly(a.applied_at) : '',
                a.status || 'Applied',
                updateTime,
                updaterName,
                updaterId,
                noteText,
                viewStatusText,
                a.total_experience || '',
                a.specialization || '',
                a.location || '',
                getResumeFileName(a)
            ];
        });

        // 1. Build and pack Applicants_Summary.xlsx
        const wsData = [excelHeaders, ...excelData];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = excelHeaders.map((h, i) => {
            let maxLen = h.length;
            excelData.forEach(row => {
                const cellLen = String(row[i] || '').length;
                if (cellLen > maxLen) maxLen = cellLen;
            });
            return { wch: Math.min(Math.max(maxLen + 4, 14), 50) };
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Applicants Summary');
        const excelArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        zip.file(`Applicants_Summary.xlsx`, excelArrayBuffer);

        // 2. Also keep Applicants_Summary.csv for convenience
        const csvContent = [excelHeaders.join(','), ...excelData.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\r\n');
        zip.file(`Applicants_Summary.csv`, csvContent);

        // 3. Build and pack Applicants_Summary.pdf inside the archive
        try {
            const summaryPdfDoc = generateApplicantsSummaryPDF(targetApps, activeScope === 'all' ? 'All Archive' : 'Filtered');
            const summaryPdfBuffer = summaryPdfDoc.output('arraybuffer');
            zip.file('Applicants_Summary.pdf', summaryPdfBuffer);
        } catch (pdfErr) {
            console.warn('Failed to embed summary PDF in archive:', pdfErr);
        }
        
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;

        const dateTag = getLocalDateTag();
        let timeframeTag = '';
        if (timeframeFilter === 'today') timeframeTag = '_Today';
        else if (timeframeFilter === 'yesterday') timeframeTag = '_Yesterday';
        else if (timeframeFilter === 'week') timeframeTag = '_ThisWeek';
        else if (timeframeFilter === 'month') timeframeTag = '_ThisMonth';
        else if (timeframeFilter === 'specific_date' && selectedDate) timeframeTag = `_Date_${selectedDate.replace(/-/g, '')}`;
        else if (timeframeFilter === 'custom_range') timeframeTag = `_Range_${(startDate || 'Start').replace(/-/g, '')}_to_${(endDate || 'End').replace(/-/g, '')}`;

        if (activeScope === 'all') {
            link.download = `Apps_Archive_All_${dateTag}.zip`;
        } else if (isFullyFiltered) {
            const shortCol = formatShortName(collegeFilter, 18);
            const shortJb = formatShortName(filter, 18);
            link.download = `Apps_${shortCol}_${shortJb}${timeframeTag}_${dateTag}.zip`;
        } else if (isSpecificCollege) {
            const shortCol = formatShortName(collegeFilter, 22);
            link.download = `Apps_${shortCol}_AllJobs${timeframeTag}_${dateTag}.zip`;
        } else if (isSpecificJob) {
            const shortJb = formatShortName(filter, 22);
            link.download = `Apps_AllColleges_${shortJb}${timeframeTag}_${dateTag}.zip`;
        } else {
            link.download = `Apps_Filtered${timeframeTag}_${dateTag}.zip`;
        }

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

  // Direct standalone export to Excel (.xlsx)
  const handleExportApplicantsExcel = (scope: 'filtered' | 'all' = 'filtered') => {
    const targetApps = scope === 'all' ? applications : filteredApps;
    if (!targetApps || targetApps.length === 0) {
        toast.error('No applicants available to export.');
        return;
    }

    const getResumeFileName = (a: any) => {
        let resumeFile = '';
        if (a.resume_name && a.resume_name.trim()) {
            resumeFile = a.resume_name.trim();
        } else if (a.resume_filename && a.resume_filename.trim()) {
            resumeFile = a.resume_filename.trim();
        } else if (a.resume_drive_link && !isValidExternalDriveLink(a.resume_drive_link)) {
            resumeFile = a.resume_drive_link.trim();
        } else if (a.resume_url) {
            if (!a.resume_url.startsWith('http://') && !a.resume_url.startsWith('https://')) {
                // Uploaded document / data URL
                resumeFile = `${(a.applicant_name || 'Candidate').trim().replace(/\s+/g, '_')}_Resume.pdf`;
            } else if (!isValidExternalDriveLink(a.resume_url)) {
                const parts = a.resume_url.split('/');
                const last = parts[parts.length - 1];
                if (last && (last.endsWith('.pdf') || last.endsWith('.docx') || last.endsWith('.doc'))) {
                    resumeFile = decodeURIComponent(last);
                }
            }
        }

        return resumeFile || `${(a.applicant_name || 'Candidate').trim().replace(/\s+/g, '_')}_Resume.pdf`;
    };

    const excelHeaders = [
        'Candidate Name',
        'Email',
        'Phone',
        'College',
        'Job Title',
        'Applied Date',
        'Current Status',
        'Status Last Updated At',
        'Last Updated By',
        'Recruiter ID',
        'Recruiter Internal Comment / Reason',
        'View Status',
        'Experience',
        'Specialization',
        'Location',
        'Attached Resume File'
    ];
    const excelData = targetApps.map(a => {
        const lastEv = [...(a.timeline || [])].reverse().find((e: any) => e.action === 'Status Changed' || e.recruiter_id || e.note);
        const updaterName = a.last_updated_by?.name || lastEv?.actor_name || '';
        const updaterId = a.last_updated_by?.recruiter_id || lastEv?.recruiter_id || '';
        const noteText = a.notes || a.last_status_note || lastEv?.note || '';
        const updateTime = (a.status_updated_at || a.updated_at) ? formatDateTime(a.status_updated_at || a.updated_at) : '';
        const viewStatusText = a.is_viewed ? `Viewed by ${a.viewed_by?.name || 'Recruiter'}${a.viewed_at ? ` (${formatTimeAgo(a.viewed_at)})` : ''}` : 'Unviewed / New';

        return [
            a.applicant_name || '',
            a.applicant_email || '',
            a.phone || '',
            a.college || 'Not Specified',
            a.job_title || '',
            a.applied_at ? formatDateOnly(a.applied_at) : '',
            a.status || 'Applied',
            updateTime,
            updaterName,
            updaterId,
            noteText,
            viewStatusText,
            a.total_experience || '',
            a.specialization || '',
            a.location || '',
            getResumeFileName(a)
        ];
    });

    const wsData = [excelHeaders, ...excelData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = excelHeaders.map((h, i) => {
        let maxLen = h.length;
        excelData.forEach(row => {
            const cellLen = String(row[i] || '').length;
            if (cellLen > maxLen) maxLen = cellLen;
        });
        return { wch: Math.min(Math.max(maxLen + 4, 14), 50) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applicants');

    const dateTag = getLocalDateTag();
    let timeframeTag = '';
    if (timeframeFilter === 'today') timeframeTag = '_Today';
    else if (timeframeFilter === 'yesterday') timeframeTag = '_Yesterday';
    else if (timeframeFilter === 'week') timeframeTag = '_ThisWeek';
    else if (timeframeFilter === 'month') timeframeTag = '_ThisMonth';
    else if (timeframeFilter === 'specific_date' && selectedDate) timeframeTag = `_Date_${selectedDate.replace(/-/g, '')}`;
    else if (timeframeFilter === 'custom_range') timeframeTag = `_Range_${(startDate || 'Start').replace(/-/g, '')}_to_${(endDate || 'End').replace(/-/g, '')}`;

    let fileName = `NeST_Applicants_${scope === 'all' ? 'All' : 'Filtered'}${timeframeTag}_${dateTag}.xlsx`;
    if (scope === 'filtered') {
        if (collegeFilter !== 'all' && filter !== 'all') {
            fileName = `NeST_Applicants_${formatShortName(collegeFilter, 15)}_${formatShortName(filter, 15)}${timeframeTag}_${dateTag}.xlsx`;
        } else if (collegeFilter !== 'all') {
            fileName = `NeST_Applicants_${formatShortName(collegeFilter, 20)}${timeframeTag}_${dateTag}.xlsx`;
        } else if (filter !== 'all') {
            fileName = `NeST_Applicants_${formatShortName(filter, 20)}${timeframeTag}_${dateTag}.xlsx`;
        } else if (timeframeTag) {
            fileName = `NeST_Applicants${timeframeTag}_${dateTag}.xlsx`;
        }
    }

    XLSX.writeFile(wb, fileName);
    toast.success(`Exported ${targetApps.length} candidate applications to Excel (.xlsx)!`);
  };

  // Master PDF Summary Generator (A4 Landscape)
  const generateApplicantsSummaryPDF = (targetApps: any[], filterLabel?: string): jsPDF => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header Banner
    doc.setFillColor(26, 38, 82); // nestNavy
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('NeST Digital — Candidate Applications Master Summary Report', 14, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225); // slate-300
    const generatedText = `Generated: ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} | Total Candidates: ${targetApps.length}${filterLabel ? ` | Scope: ${filterLabel}` : ''}`;
    doc.text(generatedText, 14, 16);

    const pdfHeaders = [
      'Candidate Name',
      'Email / Phone',
      'College',
      'Job Title',
      'Applied Date',
      'Current Status',
      'Status Last Updated At',
      'Last Updated By',
      'Recruiter Internal Comment / Reason'
    ];

    const pdfRows = targetApps.map((a: any) => {
      const lastEv = [...(a.timeline || [])].reverse().find((e: any) => e.action === 'Status Changed' || e.recruiter_id || e.note);
      const updaterName = a.last_updated_by?.name || lastEv?.actor_name || '—';
      const noteText = a.notes || a.last_status_note || lastEv?.note || '—';
      const updateTime = (a.status_updated_at || a.updated_at) ? formatDateTime(a.status_updated_at || a.updated_at) : '—';
      const contactInfo = `${a.applicant_email || ''}${a.phone ? `\n${a.phone}` : ''}`;

      return [
        a.applicant_name || 'Candidate',
        contactInfo,
        a.college || 'Not Specified',
        a.job_title || 'General',
        a.applied_at ? formatDateOnly(a.applied_at) : '—',
        a.status || 'Applied',
        updateTime,
        updaterName,
        noteText
      ];
    });

    autoTable(doc, {
      head: [pdfHeaders],
      body: pdfRows,
      startY: 25,
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        overflow: 'linebreak',
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [26, 38, 82],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 28, fontStyle: 'bold' },
        1: { cellWidth: 36 },
        2: { cellWidth: 32 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 22, fontStyle: 'bold' },
        6: { cellWidth: 26 },
        7: { cellWidth: 24 },
        8: { cellWidth: 'auto' }
      },
      margin: { top: 25, left: 10, right: 10, bottom: 12 },
      didDrawPage: (data) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 25,
          doc.internal.pageSize.getHeight() - 5
        );
        doc.text(
          'NeST Digital Confidential — For Authorized Recruiter Internal Use Only',
          10,
          doc.internal.pageSize.getHeight() - 5
        );
      }
    });

    return doc;
  };

  // Direct standalone export to PDF (.pdf)
  const handleExportApplicantsPDF = (scope: 'filtered' | 'all' = 'filtered') => {
    const targetApps = scope === 'all' ? applications : filteredApps;
    if (!targetApps || targetApps.length === 0) {
      toast.error('No applicants available to export.');
      return;
    }

    const doc = generateApplicantsSummaryPDF(targetApps, isAnyFilterActive ? 'Filtered' : 'All Candidates');

    const dateTag = getLocalDateTag();
    let timeframeTag = '';
    if (timeframeFilter === 'today') timeframeTag = '_Today';
    else if (timeframeFilter === 'yesterday') timeframeTag = '_Yesterday';
    else if (timeframeFilter === 'week') timeframeTag = '_ThisWeek';
    else if (timeframeFilter === 'month') timeframeTag = '_ThisMonth';
    else if (timeframeFilter === 'specific_date' && selectedDate) timeframeTag = `_Date_${selectedDate.replace(/-/g, '')}`;
    else if (timeframeFilter === 'custom_range') timeframeTag = `_Range_${(startDate || 'Start').replace(/-/g, '')}_to_${(endDate || 'End').replace(/-/g, '')}`;

    let fileName = `NeST_Applicants_Summary_${scope === 'all' ? 'All' : 'Filtered'}${timeframeTag}_${dateTag}.pdf`;
    if (scope === 'filtered') {
      if (collegeFilter !== 'all' && filter !== 'all') {
        fileName = `NeST_Applicants_${formatShortName(collegeFilter, 15)}_${formatShortName(filter, 15)}${timeframeTag}_${dateTag}.pdf`;
      } else if (collegeFilter !== 'all') {
        fileName = `NeST_Applicants_${formatShortName(collegeFilter, 20)}${timeframeTag}_${dateTag}.pdf`;
      } else if (filter !== 'all') {
        fileName = `NeST_Applicants_${formatShortName(filter, 20)}${timeframeTag}_${dateTag}.pdf`;
      } else if (timeframeTag) {
        fileName = `NeST_Applicants${timeframeTag}_${dateTag}.pdf`;
      }
    }

    doc.save(fileName);
    toast.success(`Exported ${targetApps.length} candidate applications to PDF (.pdf)!`);
  };

  const handleUpdateClick = (app: any) => {
    if (app?.id) {
      markAppAsViewed(app.id);
    }
    setSelectedApp(app);
    setCommentError(false);
    setShowEmailPreview(false);
    const nextStatus = app.status || 'Applied';
    setUpdateData({
        status: nextStatus,
        interviewDate: app.interviewDate || app.interview_date || '',
        interviewTime: app.interview_time || (nextStatus === 'Interview Scheduled' ? '10:30 AM IST' : ''),
        interviewLocation: app.interview_location || (nextStatus === 'Interview Scheduled' ? 'NeST Campus, Kochi / MS Teams' : ''),
        notes: '',
        sendEmail: true,
        emailSubject: `Application Update: ${app.job_title || 'Position'} at NeST Digital — Status: ${nextStatus}`,
        emailCandidateNote: ''
    });
  };

  const openEmailHistoryModal = (app: any) => {
    if (app?.id) {
      markAppAsViewed(app.id);
    }
    setSelectedEmailHistoryApp(app);
  };

  const handleOpenComposeEmail = (app: any) => {
    if (app?.id) {
      markAppAsViewed(app.id);
    }
    setComposeEmailApp(app);
    const isWithdrawn = app.status === 'Withdrawn';
    const isInterview = app.status === 'Interview Scheduled';
    setComposeData({
      subject: isWithdrawn
        ? `Application Update: ${app.job_title || 'Position'} at NeST Digital — Status: Withdrawn`
        : `Application Update: ${app.job_title || 'Position'} at NeST Digital — Status: ${app.status || 'Applied'}`,
      message: isWithdrawn
        ? `Dear ${app.applicant_name || 'Candidate'},\n\nWe acknowledge that your application for the ${app.job_title || 'Position'} role at NeST Digital has been marked as Withdrawn.\n\nThank you for considering NeST Digital. If you have any questions or wish to explore other opportunities with us in the future, please feel free to reach out.`
        : `Dear ${app.applicant_name || 'Candidate'},\n\nWe wanted to share an update regarding your application for the ${app.job_title || 'Position'} role at NeST Digital.\n\nPlease log in to your Candidate Portal to review next steps.`,
      status: app.status || 'Applied',
      interviewDate: isInterview ? (app.interviewDate || app.interview_date || '') : '',
      interviewTime: isInterview ? (app.interview_time || '10:30 AM IST') : '',
      interviewLocation: isInterview ? (app.interview_location || 'NeST Digital Campus, Kochi / MS Teams') : ''
    });
  };

  const handleSendDirectEmail = async () => {
    if (!composeEmailApp) return;
    if (!composeData.subject.trim()) {
      toast.error("Subject line is required.");
      return;
    }
    if (!composeData.message.trim()) {
      toast.error("Email message content is required.");
      return;
    }

    const isInterview = composeData.status === 'Interview Scheduled';
    try {
      setSendingEmail(true);
      const res = await recruiterApi.sendApplicationEmail(composeEmailApp.id, {
        subject: composeData.subject,
        message: composeData.message,
        status: composeData.status,
        interview_date: isInterview ? composeData.interviewDate : undefined,
        interview_time: isInterview ? composeData.interviewTime : undefined,
        interview_location: isInterview ? composeData.interviewLocation : undefined
      });

      if (res.success) {
        const newEmailLog = (res as any).email_log || (res.data as any)?.email_log;
        
        // Update applications list state
        setApplications(apps => apps.map(a => {
          if (a.id === composeEmailApp.id) {
            const updatedHistory = newEmailLog ? [newEmailLog, ...(a.email_history || [])] : (a.email_history || []);
            return {
              ...a,
              email_history: updatedHistory
            };
          }
          return a;
        }));

        // Update viewingAppDetails if open
        if (viewingAppDetails && viewingAppDetails.id === composeEmailApp.id) {
          setViewingAppDetails((prev: any) => {
            const updatedHistory = newEmailLog ? [newEmailLog, ...(prev.email_history || [])] : (prev.email_history || []);
            return {
              ...prev,
              email_history: updatedHistory
            };
          });
        }

        // Update selectedEmailHistoryApp if open
        if (selectedEmailHistoryApp && selectedEmailHistoryApp.id === composeEmailApp.id) {
          setSelectedEmailHistoryApp((prev: any) => {
            const updatedHistory = newEmailLog ? [newEmailLog, ...(prev.email_history || [])] : (prev.email_history || []);
            return {
              ...prev,
              email_history: updatedHistory
            };
          });
        }

        setComposeEmailApp(null);
        toast.success(`Personalized email sent and recorded in history!`);
      } else {
        toast.error(res.message || "Failed to trigger email.");
      }
    } catch (err: any) {
      console.error("Direct email error:", err);
      toast.error(err?.message || "Error sending email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSaveUpdate = async () => {
    if (!updateData.notes || !updateData.notes.trim()) {
        setCommentError(true);
        toast.error("Internal comment / reason is mandatory. Please provide a comment before saving.");
        return;
    }

    try {
        setIsUpdatingStatus(true);
        const payload = {
          status: updateData.status,
          interviewDate: updateData.interviewDate,
          interview_date: updateData.interviewDate,
          interview_time: updateData.interviewTime,
          interview_location: updateData.interviewLocation,
          notes: updateData.notes,
          send_email: updateData.sendEmail,
          email_subject: updateData.emailSubject,
          email_candidate_note: updateData.emailCandidateNote
        };

        const response: any = await recruiterApi.updateApplicationStatus(selectedApp.id, payload);
        if (response.success) {
            const nowIso = new Date().toISOString();
            const newTimelineEvent = {
              action: 'Status Changed',
              status: updateData.status,
              previous_status: selectedApp.status,
              timestamp: nowIso,
              actor_id: currentUser.id,
              actor_name: currentRecruiterName,
              actor_role: 'Recruiter',
              recruiter_id: currentRecruiterId,
              recruiter_email: currentRecruiterEmail,
              note: updateData.notes || `Application status updated to ${updateData.status} by ${currentRecruiterName}.`,
              email_sent: response.email_sent || false
            };

            const newEmailLog = response.email_log;

            const updatedAppFields = {
              ...updateData,
              status: updateData.status,
              interviewDate: updateData.interviewDate,
              interview_date: updateData.interviewDate,
              interview_time: updateData.interviewTime,
              interview_location: updateData.interviewLocation,
              status_updated_at: nowIso,
              statusUpdatedAt: nowIso,
              notes: updateData.notes,
              last_status_note: updateData.notes,
              is_viewed: true,
              viewed_at: nowIso,
              viewed_by: {
                id: currentUser.id,
                name: currentRecruiterName
              },
              last_updated_by: {
                id: currentUser.id,
                name: currentRecruiterName,
                recruiter_id: currentRecruiterId,
                email: currentRecruiterEmail,
                role: 'Recruiter'
              }
            };

            setApplications(apps => apps.map(a => {
                if (a.id === selectedApp.id) {
                  const updatedHistory = newEmailLog ? [newEmailLog, ...(a.email_history || [])] : (a.email_history || []);
                  return {
                    ...a, 
                    ...updatedAppFields,
                    email_history: updatedHistory,
                    timeline: [...(a.timeline || []), newTimelineEvent]
                  };
                }
                return a;
            }));

            if (viewingAppDetails && viewingAppDetails.id === selectedApp.id) {
              setViewingAppDetails((prev: any) => {
                const updatedHistory = newEmailLog ? [newEmailLog, ...(prev.email_history || [])] : (prev.email_history || []);
                return {
                  ...prev,
                  ...updatedAppFields,
                  email_history: updatedHistory,
                  timeline: [...(prev.timeline || []), newTimelineEvent]
                };
              });
            }

            if (selectedEmailHistoryApp && selectedEmailHistoryApp.id === selectedApp.id) {
              setSelectedEmailHistoryApp((prev: any) => {
                const updatedHistory = newEmailLog ? [newEmailLog, ...(prev.email_history || [])] : (prev.email_history || []);
                return {
                  ...prev,
                  ...updatedAppFields,
                  email_history: updatedHistory
                };
              });
            }

            setSelectedApp(null);
            if (response.email_sent) {
              toast.success(`Application updated to ${updateData.status} & email sent to candidate!`);
            } else if (updateData.sendEmail) {
              toast.success(`Status updated to ${updateData.status} (Email recorded in history).`);
            } else {
              toast.success(`Application status updated to ${updateData.status}!`);
            }
        } else {
            alert(response.message || "Failed to update application.");
        }
    } catch (err: any) {
        console.error("Update error:", err);
        alert(err?.message || "An error occurred while updating the application.");
    } finally {
        setIsUpdatingStatus(false);
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
            padding: 14px 20px;
            border-radius: 12px;
            border: none;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
            box-shadow: 0 8px 18px rgba(26, 38, 82, 0.16);
            white-space: nowrap;
        }
        .btn-bulk:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }
        .btn-bulk-secondary {
            background: #ffffff;
            color: ${nestNavy};
            padding: 13px 18px;
            border-radius: 12px;
            border: 1.5px solid ${nestNavy};
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(26, 38, 82, 0.05);
            white-space: nowrap;
        }
        .btn-bulk-secondary:hover {
            background: #f8fafc;
            border-color: ${nestRed};
            color: ${nestRed};
            transform: translateY(-2px);
            box-shadow: 0 8px 18px rgba(200, 16, 46, 0.12);
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
        {/* Global Common Search Bar */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Search size={14} color={nestNavy} /> Global Search Bar
            </label>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', color: nestRed, fontWeight: 700, fontSize: '12px', cursor: 'pointer', padding: 0 }}
              >
                Clear search
              </button>
            )}
          </div>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            borderRadius: '14px',
            border: isSearchFocused ? `2px solid ${nestNavy}` : '1.5px solid #cbd5e1',
            boxShadow: isSearchFocused ? '0 10px 25px -5px rgba(26, 38, 82, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
            padding: '4px 8px 4px 18px',
            transition: 'all 0.25s ease'
          }}>
            <Search size={18} color={isSearchFocused ? nestNavy : '#94a3b8'} style={{ flexShrink: 0, marginRight: '12px' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search all applications globally by applicant name, email, job title, college, skills, location, phone..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '15px',
                fontWeight: 600,
                color: '#0f172a',
                padding: '12px 0'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                  marginRight: '8px',
                  transition: 'all 0.15s'
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
            <div style={{
              fontSize: '12px',
              fontWeight: 800,
              background: searchTerm ? '#eff6ff' : '#f8fafc',
              color: searchTerm ? '#1d4ed8' : '#64748b',
              border: searchTerm ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
              padding: '6px 14px',
              borderRadius: '10px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              {filteredApps.length} {filteredApps.length === 1 ? 'applicant' : 'applicants'}
            </div>
          </div>
        </div>
        {/* Dropdown Filters (3 Columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* College Filter */}
            <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Filter by College Name
                </label>
                <div style={{ position: 'relative' }}>
                    <GraduationCap style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: nestNavy, pointerEvents: 'none' }} size={18} />
                    <select 
                        value={collegeFilter}
                        onChange={(e) => setCollegeFilter(e.target.value)}
                        style={{ 
                            width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc',
                            color: '#1e293b', fontWeight: 700, fontSize: '15px', outline: 'none', cursor: 'pointer', appearance: 'none'
                        }}
                    >
                        <option value="all">All Colleges ({applications.length} applications)</option>
                        {uniqueColleges.map(col => (
                            <option key={col} value={col}>
                              {col} ({collegeCountsForJob[col] || 0} application{(collegeCountsForJob[col] || 0) === 1 ? '' : 's'})
                            </option>
                        ))}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} size={18} />
                </div>
            </div>

            {/* Job Listing Filter */}
            <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Select Job Listing
                </label>
                <div style={{ position: 'relative' }}>
                    <Briefcase style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: nestNavy, pointerEvents: 'none' }} size={18} />
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ 
                            width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc',
                            color: '#1e293b', fontWeight: 700, fontSize: '15px', outline: 'none', cursor: 'pointer', appearance: 'none'
                        }}
                    >
                        <option value="all">All Active Job Postings ({filteredApps.length} applications)</option>
                        {uniqueJobs.map(job => (
                            <option key={job} value={job}>
                              {job} ({jobCountsForCollege[job] || 0} application{(jobCountsForCollege[job] || 0) === 1 ? '' : 's'})
                            </option>
                        ))}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} size={18} />
                </div>
            </div>

            {/* Filter by Timeframe (Day-wise, Weekly, Monthly, Custom) */}
            <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Filter by Timeframe / Date
                </label>
                <div style={{ position: 'relative' }}>
                    <Calendar style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: nestNavy, pointerEvents: 'none' }} size={18} />
                    <select 
                        value={timeframeFilter}
                        onChange={(e) => setTimeframeFilter(e.target.value as any)}
                        style={{ 
                            width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc',
                            color: '#1e293b', fontWeight: 700, fontSize: '15px', outline: 'none', cursor: 'pointer', appearance: 'none'
                        }}
                    >
                        <option value="all">All Dates ({timeframeCounts.all} applications)</option>
                        <option value="today">Today - Day-wise ({timeframeCounts.today} application{timeframeCounts.today === 1 ? '' : 's'})</option>
                        <option value="yesterday">Yesterday ({timeframeCounts.yesterday} application{timeframeCounts.yesterday === 1 ? '' : 's'})</option>
                        <option value="week">This Week - Weekly ({timeframeCounts.week} application{timeframeCounts.week === 1 ? '' : 's'})</option>
                        <option value="month">This Month - Monthly ({timeframeCounts.month} application{timeframeCounts.month === 1 ? '' : 's'})</option>
                        <option value="specific_date">Custom Day (Pick Date)</option>
                        <option value="custom_range">Custom Date Range (From - To)</option>
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} size={18} />
                </div>
            </div>
        </div>

        {/* Bulk Download & Export Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
          {/* Direct Export to Excel (.xlsx) */}
          <button 
              onClick={() => handleExportApplicantsExcel(isAnyFilterActive ? 'filtered' : 'all')}
              disabled={applications.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 18px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#059669',
                border: '1.5px solid #a7f3d0',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              title={`Directly export applicants spreadsheet to Excel (.xlsx) format`}
          >
              <FileSpreadsheet size={16} color="#059669" />
              <span>Export to Excel (.xlsx) ({isAnyFilterActive ? filteredApps.length : applications.length})</span>
          </button>

          {/* Direct Export to PDF (.pdf) */}
          <button 
              onClick={() => handleExportApplicantsPDF(isAnyFilterActive ? 'filtered' : 'all')}
              disabled={applications.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 18px',
                borderRadius: '12px',
                background: '#fef2f2',
                color: nestRed,
                border: '1.5px solid #fecaca',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(200, 16, 46, 0.1)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              title={`Directly export applicants master summary report to printable PDF format`}
          >
              <FileText size={16} color={nestRed} />
              <span>Export to PDF (.pdf) ({isAnyFilterActive ? filteredApps.length : applications.length})</span>
          </button>

          {isAnyFilterActive ? (
            <>
              <button 
                  onClick={() => { setDownloadScope('filtered'); setShowConfirmModal(true); }}
                  disabled={isBulkDownloading || filteredApps.length === 0}
                  className="btn-bulk"
                  title={`Download only the ${filteredApps.length} filtered candidate CVs matching current criteria`}
              >
                  {isBulkDownloading && downloadScope === 'filtered' ? <Loader2 size={18} className="animate-spin" /> : <DownloadCloud size={18} />}
                  {isBulkDownloading && downloadScope === 'filtered' ? 'Preparing ZIP...' : `Download Filtered (${filteredApps.length})`}
              </button>

              <button 
                  onClick={() => { setDownloadScope('all'); setShowConfirmModal(true); }}
                  disabled={isBulkDownloading || applications.length === 0}
                  className="btn-bulk-secondary"
                  title={`Commonly download all ${applications.length} candidate CVs across all colleges, jobs, and dates`}
              >
                  {isBulkDownloading && downloadScope === 'all' ? <Loader2 size={18} className="animate-spin" /> : <FileArchive size={18} />}
                  {isBulkDownloading && downloadScope === 'all' ? 'Preparing ZIP...' : `Download All Commonly (${applications.length})`}
              </button>
            </>
          ) : (
            <button 
                onClick={() => { setDownloadScope('all'); setShowConfirmModal(true); }}
                disabled={isBulkDownloading || applications.length === 0}
                className="btn-bulk"
                title={`Download all ${applications.length} candidate CVs organized into college and job folders`}
            >
                {isBulkDownloading ? <Loader2 size={18} className="animate-spin" /> : <DownloadCloud size={18} />}
                {isBulkDownloading ? 'Preparing ZIP...' : `Bulk Download All CVs (${applications.length})`}
            </button>
          )}
        </div>

        {/* Quick-filter badges for Timeframe (Day wise, Weekly, Monthly, Custom Day, Custom Date Range) */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} color={nestNavy} /> Timeframe:
          </span>
          {[
            { id: 'all', label: 'All Dates', count: timeframeCounts.all },
            { id: 'today', label: 'Today (Day-wise)', count: timeframeCounts.today },
            { id: 'yesterday', label: 'Yesterday', count: timeframeCounts.yesterday },
            { id: 'week', label: 'This Week (Weekly)', count: timeframeCounts.week },
            { id: 'month', label: 'This Month (Monthly)', count: timeframeCounts.month },
          ].map(tf => {
            const isSelected = timeframeFilter === tf.id;
            return (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTimeframeFilter(isSelected && tf.id !== 'all' ? 'all' : tf.id as any)}
                style={{
                  background: isSelected ? nestNavy : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: isSelected ? `1px solid ${nestNavy}` : '1px solid #cbd5e1',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? '0 4px 12px rgba(26, 38, 82, 0.25)' : 'none'
                }}
              >
                <span>{tf.label}</span>
                <span style={{ 
                  background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9', 
                  color: isSelected ? '#ffffff' : '#0f172a',
                  padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 
                }}>
                  {tf.count}
                </span>
              </button>
            );
          })}

          {/* Custom Day Pill */}
          <button
            type="button"
            onClick={() => setTimeframeFilter(timeframeFilter === 'specific_date' ? 'all' : 'specific_date')}
            style={{
              background: timeframeFilter === 'specific_date' ? nestRed : '#ffffff',
              color: timeframeFilter === 'specific_date' ? '#ffffff' : '#334155',
              border: timeframeFilter === 'specific_date' ? `1px solid ${nestRed}` : '1px solid #cbd5e1',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: timeframeFilter === 'specific_date' ? '0 4px 12px rgba(200, 16, 46, 0.25)' : 'none'
            }}
          >
            <Calendar size={13} color={timeframeFilter === 'specific_date' ? '#ffffff' : nestNavy} />
            <span>Custom Day {selectedDate ? `(${selectedDate})` : ''}</span>
          </button>

          {/* Custom Date Range Pill */}
          <button
            type="button"
            onClick={() => setTimeframeFilter(timeframeFilter === 'custom_range' ? 'all' : 'custom_range')}
            style={{
              background: timeframeFilter === 'custom_range' ? nestNavy : '#ffffff',
              color: timeframeFilter === 'custom_range' ? '#ffffff' : '#334155',
              border: timeframeFilter === 'custom_range' ? `1px solid ${nestNavy}` : '1px solid #cbd5e1',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: timeframeFilter === 'custom_range' ? '0 4px 12px rgba(26, 38, 82, 0.25)' : 'none'
            }}
          >
            <Calendar size={13} color={timeframeFilter === 'custom_range' ? '#ffffff' : nestNavy} />
            <span>Custom Date Range {(startDate || endDate) ? `(${startDate || 'Start'} to ${endDate || 'End'})` : ''}</span>
          </button>
        </div>

        {/* Quick-filter badges for View Status (All, Unviewed / New, Viewed) */}
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={13} color={nestNavy} /> View Status:
          </span>
          {[
            { id: 'all', label: 'All Applications', count: viewCounts.all },
            { id: 'unviewed', label: 'Unviewed / New', count: viewCounts.unviewed, isNew: true },
            { id: 'viewed', label: 'Viewed', count: viewCounts.viewed, isViewed: true },
          ].map(vf => {
            const isSelected = viewFilter === vf.id;
            return (
              <button
                key={vf.id}
                type="button"
                onClick={() => setViewFilter(isSelected && vf.id !== 'all' ? 'all' : vf.id as any)}
                style={{
                  background: isSelected ? nestNavy : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: isSelected ? `1px solid ${nestNavy}` : '1px solid #cbd5e1',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? '0 4px 12px rgba(26, 38, 82, 0.25)' : 'none'
                }}
              >
                {vf.isNew && !isSelected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c8102e', display: 'inline-block' }} />}
                {vf.isViewed && !isSelected && <Eye size={12} color="#0284c7" />}
                <span>{vf.label}</span>
                <span style={{ 
                  background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9', 
                  color: isSelected ? '#ffffff' : '#0f172a',
                  padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 
                }}>
                  {vf.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Specific Date Picker Panel (Positioned right below Timeframe pills) */}
        {timeframeFilter === 'specific_date' && (
          <div style={{ 
            marginTop: '12px', 
            background: '#ffffff', 
            border: '1.5px solid #cbd5e1', 
            borderRadius: '14px', 
            padding: '12px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: nestNavy, fontWeight: 700, fontSize: '13px' }}>
              <Calendar size={16} />
              <span>Select Custom Day:</span>
            </div>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontWeight: 600,
                fontSize: '13px',
                color: '#1e293b',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Quick:</span>
              <button
                type="button"
                onClick={() => handleSetQuickDay(0)}
                style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickDay(1)}
                style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
              >
                Yesterday
              </button>
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                style={{ background: 'none', border: 'none', color: nestRed, fontWeight: 700, fontSize: '12px', cursor: 'pointer', padding: 0 }}
              >
                Clear Day
              </button>
            )}
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', marginLeft: 'auto' }}>
              {selectedDate ? `${filteredApps.length} applicant${filteredApps.length === 1 ? '' : 's'} on ${selectedDate}` : 'Pick a date to filter'}
            </span>
          </div>
        )}

        {/* Custom Date Range Panel (Positioned right below Timeframe pills) */}
        {timeframeFilter === 'custom_range' && (
          <div style={{ 
            marginTop: '12px', 
            background: '#ffffff', 
            border: '1.5px solid #cbd5e1', 
            borderRadius: '14px', 
            padding: '12px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: nestNavy, fontWeight: 700, fontSize: '13px' }}>
              <Calendar size={16} />
              <span>Custom Range:</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>From:</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#1e293b',
                  outline: 'none',
                  background: '#f8fafc'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>To:</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#1e293b',
                  outline: 'none',
                  background: '#f8fafc'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Quick:</span>
              <button
                type="button"
                onClick={() => handleSetQuickRange(3)}
                style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
              >
                Last 3 Days
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickRange(7)}
                style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickRange(30)}
                style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
              >
                Last 30 Days
              </button>
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                style={{ background: 'none', border: 'none', color: nestRed, fontWeight: 700, fontSize: '12px', cursor: 'pointer', padding: 0 }}
              >
                Clear Range
              </button>
            )}
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', marginLeft: 'auto' }}>
              {filteredApps.length} applicant{filteredApps.length === 1 ? '' : 's'} in range
            </span>
          </div>
        )}

        {/* Quick-filter badges for colleges */}
        {uniqueColleges.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
              Colleges:
            </span>
            <button
              onClick={() => setCollegeFilter('all')}
              style={{
                background: collegeFilter === 'all' ? nestNavy : '#ffffff',
                color: collegeFilter === 'all' ? '#ffffff' : '#334155',
                border: collegeFilter === 'all' ? `1px solid ${nestNavy}` : '1px solid #cbd5e1',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              All Colleges ({applications.length})
            </button>
            {uniqueColleges.map(col => {
              const count = collegeCountsForJob[col] || 0;
              const isSelected = collegeFilter.toLowerCase() === col.toLowerCase();
              return (
                <button
                  key={col}
                  onClick={() => setCollegeFilter(isSelected ? 'all' : col)}
                  style={{
                    background: isSelected ? nestRed : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: isSelected ? `1px solid ${nestRed}` : '1px solid #cbd5e1',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isSelected ? '0 4px 12px rgba(200, 16, 46, 0.25)' : 'none'
                  }}
                >
                  <GraduationCap size={14} color={isSelected ? '#ffffff' : nestNavy} />
                  <span>{col}</span>
                  <span style={{ 
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9', 
                    color: isSelected ? '#ffffff' : '#0f172a',
                    padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Text Display Summary */}
        <div style={{ 
            marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0', 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' 
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: nestRed, boxShadow: `0 0 10px ${nestRed}40` }}></div>
              <p style={{ margin: 0, fontSize: '15px', color: '#334155', fontWeight: 600 }}>
                {isAnyFilterActive ? (
                  <>
                    Found <span style={{ color: nestNavy, fontWeight: 900 }}>{filteredApps.length}</span> application{filteredApps.length === 1 ? '' : 's'}
                    {searchTerm ? <> matching <span style={{ color: nestRed, fontWeight: 900 }}>"{searchTerm}"</span></> : ''}
                    {timeframeFilter !== 'all' ? <> received <span style={{ color: '#4f46e5', fontWeight: 900 }}>{getTimeframeLabel()}</span></> : ''}
                    {collegeFilter !== 'all' ? <> from <span style={{ color: nestNavy, fontWeight: 900 }}>{collegeFilter}</span></> : ''}
                    {filter !== 'all' ? <> for <span style={{ color: nestRed, fontWeight: 900 }}>{filter}</span></> : ''}.
                  </>
                ) : (
                  <>
                    Showing all <span style={{ color: nestNavy, fontWeight: 900 }}>{applications.length}</span> applications received across <span style={{ color: nestNavy, fontWeight: 900 }}>{uniqueColleges.length}</span> college{uniqueColleges.length === 1 ? '' : 's'} and <span style={{ color: nestNavy, fontWeight: 900 }}>{uniqueJobs.length}</span> job listing{uniqueJobs.length === 1 ? '' : 's'}.
                  </>
                )}
              </p>
            </div>

            {isAnyFilterActive && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCollegeFilter('all');
                  setFilter('all');
                  setTimeframeFilter('all');
                  setSelectedDate('');
                  setStartDate('');
                  setEndDate('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: nestRed,
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Reset all filters
              </button>
            )}
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
                  style={{ 
                    padding: '24px 32px', 
                    display: 'grid', 
                    gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(280px, 1.4fr) auto', 
                    alignItems: 'center', 
                    gap: '16px 24px',
                    borderLeft: !app.is_viewed ? '4px solid #1a2652' : undefined
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <UserAvatar
                      src={app.applicant_picture}
                      name={app.applicant_name}
                      status={app.applicant_status || 'open_to_work'}
                      size={54}
                      bgColor={nestNavy}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: 0 }}>
                          {app.applicant_name || app.applicant_email?.split('@')[0]}
                        </h3>
                        {app.is_viewed ? (
                          <span 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              fontSize: '11px', 
                              fontWeight: 700, 
                              color: '#0284c7', 
                              background: '#f0f9ff', 
                              border: '1px solid #bae6fd', 
                              padding: '2px 8px', 
                              borderRadius: '6px' 
                            }}
                            title={`Viewed by ${app.viewed_by?.name || 'Recruiter'}`}
                          >
                            <Eye size={12} color="#0284c7" />
                            Viewed by {app.viewed_by?.name || 'Recruiter'}{app.viewed_at ? ` • ${formatTimeAgo(app.viewed_at)}` : ''}
                          </span>
                        ) : (
                          <span 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              fontSize: '10px', 
                              fontWeight: 800, 
                              color: '#c8102e', 
                              background: '#fef2f2', 
                              border: '1px solid #fecaca', 
                              padding: '2px 7px', 
                              borderRadius: '6px',
                              letterSpacing: '0.4px',
                              textTransform: 'uppercase'
                            }}
                            title="Not viewed yet"
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c8102e', display: 'inline-block' }} />
                            New
                          </span>
                        )}
                        {app.not_added_by_admin && (
                          <span style={{ fontSize: '9px', color: '#6d28d9', fontWeight: 900, background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.3px' }}>
                            PORTAL APPLICANT
                          </span>
                        )}
                        {(app.applicant_status === 'open_to_work' || !app.applicant_status) && (
                          <span style={{ fontSize: '9px', color: '#16a34a', fontWeight: 900, background: '#dcfce7', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.3px' }}>
                            OPEN TO WORK
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                        <Mail size={12} color={nestRed} /> {app.applicant_email}
                      </p>
                      {app.phone && (
                        <p style={{ fontSize: '12px', color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                          <Phone size={12} /> {app.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={15} color={nestNavy} />
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>{app.job_title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
                      <Clock size={12} /> Applied on {app.applied_at ? formatDateOnly(app.applied_at) : 'N/A'}
                    </div>

                    {/* Applicant Form Details Tag Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                      {app.college && app.college !== 'Not Specified' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700 }} title="Candidate College">
                          <GraduationCap size={12} color="#2563eb" />
                          {app.college}
                        </span>
                      )}
                      {app.specialization && app.specialization.trim() !== '' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', color: '#334155', border: '1px solid #e2e8f0', fontWeight: 600 }} title="Specialization / Branch">
                          <Briefcase size={12} color={nestNavy} />
                          {app.specialization}
                        </span>
                      )}
                      {(app.batch || app.graduation_year) && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', color: '#334155', border: '1px solid #e2e8f0', fontWeight: 600 }} title="Graduation Year">
                          <GraduationCap size={12} color={nestNavy} />
                          Graduation Year ({app.batch || app.graduation_year})
                        </span>
                      )}
                      {app.location && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', color: '#334155', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                          <MapPin size={12} color={nestRed} />
                          {app.location}
                        </span>
                      )}
                      {app.resume_name && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px', color: '#166534', border: '1px solid #bbf7d0', fontWeight: 600 }}>
                          <FileText size={12} color="#16a34a" />
                          {app.resume_name}
                        </span>
                      )}
                    </div>

                    {/* Latest Recruiter Status & Comment Preview (Visible to Recruiters) */}
                    {(() => {
                      const lastEv = [...(app.timeline || [])].reverse().find((e: any) => e.action === 'Status Changed' || e.recruiter_id || e.note);
                      const updaterName = app.last_updated_by?.name || lastEv?.actor_name;
                      const updaterId = app.last_updated_by?.recruiter_id || lastEv?.recruiter_id;
                      const noteText = app.notes || app.last_status_note || lastEv?.note;

                      if (!updaterName && !updaterId && !noteText) return null;

                      return (
                        <div style={{ marginTop: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', fontSize: '11px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: 600, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: nestNavy, fontWeight: 700 }}>
                              <ShieldCheck size={12} color={nestNavy} /> Updated by: {updaterName || 'Recruiter'}
                            </span>
                            {updaterId && (
                              <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                ID: {updaterId}
                              </span>
                            )}
                            {(app.status_updated_at || app.statusUpdatedAt) && (
                              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                • <Clock size={10} /> {formatDateTime(app.status_updated_at || app.statusUpdatedAt)}
                              </span>
                            )}
                          </div>
                          {noteText && (
                            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#334155', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                              <span style={{ color: '#94a3b8', fontWeight: 800 }}>“</span>
                              <span style={{ flex: 1 }}>{noteText}</span>
                              <span style={{ color: '#94a3b8', fontWeight: 800 }}>”</span>
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: getStatusStyles(app.status || 'Applied').color, background: getStatusStyles(app.status || 'Applied').bg, padding: '4px 10px', borderRadius: '12px', width: 'fit-content' }}>
                      <CheckSquare size={14} /> {app.status || 'Applied'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                            onClick={() => openAppDetails(app)}
                            className="btn-action" 
                            style={{ 
                                padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', 
                                color: '#334155', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                            title={app.not_added_by_admin ? "View details entered through the application form" : "View candidate details fetched from profile"}
                        >
                            <Eye size={14} color={nestNavy} /> Details
                        </button>
                        <button 
                            onClick={() => openEmailHistoryModal(app)}
                            className="btn-action" 
                            style={{ 
                                padding: '8px 14px', borderRadius: '10px', 
                                border: (app.email_history && app.email_history.length > 0) ? '1px solid #86efac' : '1px solid #cbd5e1', 
                                background: (app.email_history && app.email_history.length > 0) ? '#f0fdf4' : '#ffffff', 
                                color: (app.email_history && app.email_history.length > 0) ? '#166534' : '#334155', 
                                fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                            title="View email dispatch log and trigger emails for this candidate"
                        >
                            <Mail size={14} color={(app.email_history && app.email_history.length > 0) ? '#16a34a' : nestNavy} /> 
                            Emails
                            {(app.email_history && app.email_history.length > 0) && (
                              <span style={{
                                background: '#16a34a', color: '#ffffff', fontSize: '10px', fontWeight: 800,
                                padding: '1px 6px', borderRadius: '99px', minWidth: '16px', textAlign: 'center'
                              }}>
                                {app.email_history.length}
                              </span>
                            )}
                        </button>
                        <button 
                            onClick={() => handleUpdateClick(app)}
                            className="btn-action" style={{ 
                                padding: '8px 14px', borderRadius: '10px', border: `1px solid ${nestNavy}`, background: '#f8fafc', 
                                color: nestNavy, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer'
                            }}>
                            <Edit size={14} /> Update
                        </button>
                        <button 
                            onClick={() => handleDownloadCV(app)}
                            disabled={downloadingId === app.id}
                            className="btn-action" 
                            style={{ 
                                padding: '8px 14px', borderRadius: '10px', border: `1px solid ${nestNavy}`, background: nestNavy, 
                                color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer',
                                opacity: downloadingId === app.id ? 0.7 : 1
                            }}>
                            {downloadingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                            CV
                        </button>
                    </div>
                  </div>

                  {/* Full-Length Email Dispatch Status Banner Spanning All Columns */}
                  <div style={{ gridColumn: '1 / -1', width: '100%', marginTop: '4px' }}>
                    {app.email_history && app.email_history.length > 0 ? (
                      <div 
                        onClick={() => openEmailHistoryModal(app)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 18px',
                          background: 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%)',
                          border: '1px solid #a7f3d0',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(6, 95, 70, 0.05)',
                          transition: 'all 0.2s ease',
                          gap: '12px'
                        }}
                        title="Click to view full email communication history"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#d1fae5',
                            border: '1px solid #6ee7b7',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            color: '#065f46',
                            fontSize: '11px',
                            fontWeight: 800,
                            whiteSpace: 'nowrap'
                          }}>
                            <MailCheck size={13} color="#059669" />
                            Email Triggered ({app.email_history.length})
                          </span>

                          <span style={{ color: '#047857', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                            <span style={{ color: '#94a3b8' }}>•</span> Last: <strong style={{ color: '#065f46', fontWeight: 800 }}>{app.email_history[0]?.status_to || app.status}</strong>
                          </span>

                          {(app.email_history[0]?.sent_by?.name || app.last_updated_by?.name) && (
                            <span style={{ color: '#047857', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                              <span style={{ color: '#94a3b8' }}>•</span> Triggered by: <strong style={{ color: '#065f46', fontWeight: 800 }}>{app.email_history[0]?.sent_by?.name || app.last_updated_by?.name}</strong>
                              {(app.email_history[0]?.sent_by?.recruiter_id || app.last_updated_by?.recruiter_id) ? (
                                <span style={{ fontSize: '10px', background: '#ffffff', border: '1px solid #a7f3d0', color: '#065f46', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  ID: {app.email_history[0]?.sent_by?.recruiter_id || app.last_updated_by?.recruiter_id}
                                </span>
                              ) : ''}
                            </span>
                          )}

                          {app.email_history[0]?.sent_at && (
                            <span style={{ color: '#059669', fontSize: '11px', opacity: 0.85, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                              <Clock size={11} /> ({formatTimeAgo(app.email_history[0].sent_at)})
                            </span>
                          )}
                        </div>

                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#047857',
                          background: '#ffffff',
                          border: '1px solid #a7f3d0',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}>
                          <span>View History</span>
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleOpenComposeEmail(app)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 14px',
                          background: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#64748b',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="No status update emails sent yet. Click to trigger an email."
                      >
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={12} color="#94a3b8" />
                          <span>No notification email sent yet</span>
                        </div>
                        <span style={{ color: nestNavy, fontWeight: 700, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          Send Email <ChevronRight size={12} />
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
                <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                    <div style={{ width: '72px', height: '72px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#cbd5e1' }}>
                       {searchTerm ? <Search size={36} color="#94a3b8" /> : <Users size={36} />}
                    </div>
                    <h3 style={{ color: '#1e293b', fontWeight: 800, fontSize: '20px', margin: '0 0 8px 0' }}>
                      {searchTerm ? `No applicants matching "${searchTerm}"` : 'No candidates listed'}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                      {searchTerm 
                        ? 'Try searching with another name, email, job title, college, skills, location, or phone number.' 
                        : 'There are currently no applications matching the selected criteria.'}
                    </p>
                    {isAnyFilterActive && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setCollegeFilter('all');
                          setFilter('all');
                          setTimeframeFilter('all');
                          setSelectedDate('');
                          setStartDate('');
                          setEndDate('');
                        }}
                        style={{
                          background: nestNavy,
                          color: '#ffffff',
                          padding: '10px 22px',
                          borderRadius: '10px',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Reset All Filters
                      </button>
                    )}
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
              
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '16px', fontFamily: "'Playfair Display', serif" }}>
                Download Applications Archive
              </h2>

              {/* Scope Switcher: Filtered vs Common / All */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => setDownloadScope('filtered')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: downloadScope === 'filtered' ? '#ffffff' : 'transparent',
                    color: downloadScope === 'filtered' ? nestNavy : '#64748b',
                    boxShadow: downloadScope === 'filtered' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <DownloadCloud size={15} color={downloadScope === 'filtered' ? nestRed : '#64748b'} />
                  <span>Filtered ({filteredApps.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDownloadScope('all')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: downloadScope === 'all' ? '#ffffff' : 'transparent',
                    color: downloadScope === 'all' ? nestNavy : '#64748b',
                    boxShadow: downloadScope === 'all' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <FileArchive size={15} color={downloadScope === 'all' ? nestRed : '#64748b'} />
                  <span>All Commonly ({applications.length})</span>
                </button>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Target College</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0d9488', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <GraduationCap size={15} />
                    {downloadScope === 'all' 
                      ? `All Colleges (${uniqueColleges.length} colleges, organized into college subfolders)`
                      : (collegeFilter === 'all' ? 'All Colleges (Organized by College Folders)' : collegeFilter)}
                  </span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Target Job</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: nestNavy, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Briefcase size={15} />
                    {downloadScope === 'all' 
                      ? `All Active Job Listings (${uniqueJobs.length} roles, organized into role subfolders)`
                      : (filter === 'all' ? 'All Active Job Postings' : filter)}
                  </span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Target Timeframe</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Clock size={15} />
                    {downloadScope === 'all' ? 'All Time (Complete History)' : getTimeframeLabel()}
                  </span>
                </div>
                <div style={{ paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    {downloadScope === 'all' ? 'Complete Archive Bundle:' : 'Filtered Applications Bundle:'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: nestRed }}>
                    {downloadScope === 'all' ? `${applications.length} Candidates` : `${filteredApps.length} Candidates`}
                  </span>
                </div>
              </div>

              <p style={{ color: '#64748b', lineHeight: 1.4, fontSize: '12px', margin: '0 0 24px 0' }}>
                {downloadScope === 'all'
                  ? 'This creates a complete master ZIP archive containing every applicant across all colleges and positions, organized into concise college and job subfolders with candidate resume files, master Applicants_Summary.xlsx, Applicants_Summary.pdf, and .csv spreadsheets.'
                  : (filteredApps.length < applications.length 
                      ? 'This creates an optimized ZIP archive with candidate resume files, master Applicants_Summary.xlsx, Applicants_Summary.pdf, and .csv spreadsheets formatted for easy extraction on Windows.'
                      : 'This creates an organized ZIP archive with candidate resume files, master Applicants_Summary.xlsx, Applicants_Summary.pdf, and .csv spreadsheets.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={() => confirmBulkDownload()}
                    style={{ 
                        width: '100%', background: nestRed, color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', 
                        fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                  >
                      {downloadScope === 'all' 
                        ? `Confirm & Download All Archive (${applications.length})` 
                        : `Confirm & Download Filtered (${filteredApps.length})`}
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
                  background: '#ffffff', width: '100%', maxWidth: '540px', maxHeight: '90vh', borderRadius: '24px', padding: '32px',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.18)', position: 'relative', display: 'flex', flexDirection: 'column'
              }}
            >
              <button 
                onClick={() => setSelectedApp(null)} 
                style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', zIndex: 10 }}
              >
                  <X size={20} />
              </button>

              <div style={{ flexShrink: 0, marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: nestNavy, margin: '0 0 4px 0' }}>Update Application Status</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                    Editing status for <strong style={{color: '#111827'}}>{selectedApp.applicant_name}</strong> • {selectedApp.job_title}
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Current Status:</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '99px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: getStatusStyles(selectedApp.status || 'Applied').bg,
                      color: getStatusStyles(selectedApp.status || 'Applied').color,
                      border: selectedApp.status === 'Withdrawn' ? '1px solid #fca5a5' : '1px solid #e2e8f0'
                    }}>
                      {selectedApp.status === 'Withdrawn' ? <XCircle size={12} color="#dc2626" /> : <CheckSquare size={12} />}
                      {selectedApp.status || 'Applied'}
                    </span>
                  </div>
                </div>

                {/* Prominent Withdrawn Banner if currently withdrawn */}
                {selectedApp.status === 'Withdrawn' && (
                  <div style={{
                    marginBottom: '12px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: '10px',
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#991b1b',
                    fontWeight: 600
                  }}>
                    <XCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Candidate Withdrawn:</strong> This applicant previously withdrew their application {selectedApp.withdrawn_at ? `on ${formatDateTime(selectedApp.withdrawn_at)}` : ''}.
                    </span>
                  </div>
                )}

                {/* Logged-in Recruiter Identity Indicator */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color={nestNavy} />
                    <span style={{ fontSize: '12px', color: '#334155', fontWeight: 700 }}>
                      Recruiter: <strong style={{ color: nestNavy }}>{currentRecruiterName}</strong>
                    </span>
                    {currentRecruiterId && (
                      <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        ID: {currentRecruiterId}
                      </span>
                    )}
                  </div>
                  {selectedApp.email_history && selectedApp.email_history.length > 0 && (
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MailCheck size={12} /> {selectedApp.email_history.length} email{selectedApp.email_history.length === 1 ? '' : 's'} sent previously
                    </span>
                  )}
                </div>
              </div>

              {/* Scrollable Form Body */}
              <div style={{ overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
                  <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                          <CheckSquare size={16} color={nestNavy} /> New Application Status
                      </label>
                      <select 
                          value={updateData.status}
                          onChange={e => {
                            const newStatus = e.target.value;
                            setUpdateData(prev => ({
                              ...prev,
                              status: newStatus,
                              emailSubject: `Application Update: ${selectedApp?.job_title || 'Position'} at NeST Digital — Status: ${newStatus}`,
                              interviewTime: newStatus === 'Interview Scheduled' && !prev.interviewTime ? '10:30 AM IST' : prev.interviewTime,
                              interviewLocation: newStatus === 'Interview Scheduled' && !prev.interviewLocation ? 'NeST Campus, Kochi / MS Teams Link' : prev.interviewLocation
                            }));
                            setCommentError(false);
                          }}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: 600, color: getStatusStyles(updateData.status).color, backgroundColor: getStatusStyles(updateData.status).bg, outline: 'none' }}
                      >
                          <option style={{ color: '#475569', background: '#fff' }} value="Applied">Applied</option>
                          <option style={{ color: '#e67700', background: '#fff' }} value="Aptitude">Aptitude</option>
                          <option style={{ color: '#1971c2', background: '#fff' }} value="Shortlisted">Shortlisted</option>
                          <option style={{ color: '#7048e8', background: '#fff' }} value="Interview Scheduled">Interview Scheduled</option>
                          <option style={{ color: '#2b8a3e', background: '#fff' }} value="Offered">Offered</option>
                          <option style={{ color: '#c92a2a', background: '#fff' }} value="Rejected">Rejected</option>
                          <option style={{ color: '#b91c1c', background: '#fff' }} value="Withdrawn">Withdrawn</option>
                      </select>
                  </div>

                  {/* Interview Details (When Interview Scheduled) */}
                  {updateData.status === 'Interview Scheduled' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="#7e22ce" /> Interview Scheduling Details
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Date</label>
                            <input 
                                type="date"
                                value={updateData.interviewDate}
                                onChange={e => setUpdateData({...updateData, interviewDate: e.target.value})}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d8b4fe', background: '#ffffff', fontSize: '13px', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Time (IST)</label>
                            <input 
                                type="text"
                                placeholder="e.g. 10:30 AM IST"
                                value={updateData.interviewTime}
                                onChange={e => setUpdateData({...updateData, interviewTime: e.target.value})}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d8b4fe', background: '#ffffff', fontSize: '13px', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Interview Location / Virtual Link</label>
                          <input 
                              type="text"
                              placeholder="e.g. NeST Digital CSEZ Campus / Microsoft Teams"
                              value={updateData.interviewLocation}
                              onChange={e => setUpdateData({...updateData, interviewLocation: e.target.value})}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d8b4fe', background: '#ffffff', fontSize: '13px', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                    </motion.div>
                  )}

                  {/* Mandatory Internal Recruiter Comment */}
                  <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#334155', margin: 0 }}>
                            <MessageSquare size={16} color={nestNavy} /> 
                            <span>Recruiter Internal Comment / Reason</span>
                            <span style={{ color: nestRed, fontWeight: 800 }}>*</span>
                        </label>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            🔒 Visible to Recruiters Only
                        </span>
                      </div>
                      <textarea 
                          value={updateData.notes}
                          onChange={e => {
                            setUpdateData({...updateData, notes: e.target.value});
                            if (e.target.value.trim()) setCommentError(false);
                          }}
                          placeholder={`Enter internal comment / reason for updating status to "${updateData.status}" (mandatory)...`}
                          rows={2}
                          style={{ 
                            width: '100%', 
                            padding: '10px 12px', 
                            borderRadius: '10px', 
                            border: commentError ? `1.5px solid ${nestRed}` : '1px solid #e2e8f0', 
                            background: commentError ? '#fff5f5' : '#f8fafc', 
                            fontSize: '13px', 
                            color: '#1e293b', 
                            outline: 'none', 
                            resize: 'none', 
                            fontFamily: 'inherit', 
                            boxSizing: 'border-box'
                          }}
                      />
                      {(selectedApp?.notes || selectedApp?.last_status_note) && (
                        <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 600 }}>Previous Reason:</span>
                          <span style={{ fontStyle: 'italic', color: '#475569' }}>
                            "{selectedApp.notes || selectedApp.last_status_note}"
                          </span>
                        </div>
                      )}
                      {commentError && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: nestRed, fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
                          <AlertCircle size={13} /> Internal comment / reason is mandatory for saving status updates.
                        </span>
                      )}
                  </div>

                  {/* ══════════════════════════════════════════════════════════════════════════
                      ENHANCED PERSONALIZED EMAIL NOTIFICATION DISPATCH SECTION
                      ══════════════════════════════════════════════════════════════════════════ */}
                  <div style={{ 
                    background: updateData.sendEmail ? '#f0fdf4' : '#f8fafc', 
                    border: updateData.sendEmail ? '1.5px solid #86efac' : '1px solid #e2e8f0', 
                    borderRadius: '14px', 
                    padding: '16px',
                    transition: 'all 0.2s ease'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={updateData.sendEmail}
                        onChange={e => setUpdateData({ ...updateData, sendEmail: e.target.checked })}
                        style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#16a34a', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: updateData.sendEmail ? '#166534' : '#334155' }}>
                            Trigger personalized status email to candidate
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: 800, background: updateData.sendEmail ? '#dcfce7' : '#e2e8f0', color: updateData.sendEmail ? '#15803d' : '#64748b', padding: '2px 8px', borderRadius: '99px' }}>
                            {updateData.sendEmail ? 'Active • Will Dispatch' : 'Email Disabled'}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                          Sends a branded update to <strong style={{ color: '#0f172a' }}>{selectedApp.applicant_email || selectedApp.email || 'candidate'}</strong> highlighting the status move from <strong>{selectedApp.status || 'Applied'}</strong> to <strong style={{ color: getStatusStyles(updateData.status).color }}>{updateData.status}</strong>.
                        </p>
                      </div>
                    </label>

                    {updateData.sendEmail && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '12px' }}
                      >
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                            Email Subject Line
                          </label>
                          <input 
                            type="text"
                            value={updateData.emailSubject}
                            onChange={e => setUpdateData({ ...updateData, emailSubject: e.target.value })}
                            style={{ 
                              width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #86efac', 
                              background: '#ffffff', fontSize: '12px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', fontWeight: 600
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                            Candidate Note / Message (Optional, visible to candidate in email)
                          </label>
                          <textarea 
                            value={updateData.emailCandidateNote}
                            onChange={e => setUpdateData({ ...updateData, emailCandidateNote: e.target.value })}
                            placeholder="Add personalized note or preparation instructions for the candidate in this email..."
                            rows={2}
                            style={{ 
                              width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #86efac', 
                              background: '#ffffff', fontSize: '12px', color: '#1e293b', outline: 'none', boxSizing: 'border-box',
                              resize: 'none', fontFamily: 'inherit'
                            }}
                          />
                        </div>

                        {/* Expandable Live Email Preview */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowEmailPreview(!showEmailPreview)}
                            style={{
                              background: 'none', border: 'none', padding: 0, color: '#15803d', fontSize: '12px', fontWeight: 700,
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <Eye size={13} /> {showEmailPreview ? 'Hide Candidate Email Preview' : 'Preview Email Content to Candidate'}
                            {showEmailPreview ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>

                          {showEmailPreview && (
                            <div style={{ marginTop: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', fontSize: '12px', color: '#334155', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
                              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: '#64748b' }}>
                                <div><strong>From:</strong> NeST Digital Talent Acquisition Team &lt;ndaconnect@nestgroup.net&gt;</div>
                                <div><strong>To:</strong> {selectedApp.applicant_name} &lt;{selectedApp.applicant_email || selectedApp.email}&gt;</div>
                                <div><strong>Subject:</strong> {updateData.emailSubject}</div>
                              </div>
                              <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#0f172a' }}>
                                Dear {selectedApp.applicant_name},
                              </p>
                              <p style={{ margin: '0 0 10px 0', lineHeight: 1.5 }}>
                                Thank you for your continued interest in <strong>NeST Digital</strong>. We are writing to provide you with an update regarding your application for the <strong>{selectedApp.job_title}</strong> role.
                              </p>
                              <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#64748b', fontWeight: 600 }}>Status:</span>
                                <span style={{ background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>
                                  {selectedApp.status || 'Applied'}
                                </span>
                                <span>➔</span>
                                <span style={{ background: getStatusStyles(updateData.status).bg, color: getStatusStyles(updateData.status).color, padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                                  {updateData.status}
                                </span>
                              </div>
                              {updateData.status === 'Interview Scheduled' && (
                                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: '8px 12px', borderRadius: '8px', margin: '8px 0' }}>
                                  <div style={{ fontWeight: 700, color: '#7e22ce' }}>📅 Interview Details:</div>
                                  <div>Date: {updateData.interviewDate || 'To be communicated'} • Time: {updateData.interviewTime || '10:30 AM IST'}</div>
                                  <div>Location: {updateData.interviewLocation || 'NeST Digital Campus / Virtual Link'}</div>
                                </div>
                              )}
                              {updateData.emailCandidateNote && (
                                <div style={{ background: '#eff6ff', borderLeft: '3px solid #3b82f6', padding: '8px 12px', borderRadius: '4px', margin: '8px 0', fontStyle: 'italic' }}>
                                  "{updateData.emailCandidateNote}"
                                </div>
                              )}
                              <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                                Warm regards,<br/>
                                <strong>{currentRecruiterName}</strong><br/>
                                Talent Acquisition Team • NeST Digital
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexShrink: 0 }}>
                  <button 
                    onClick={() => setSelectedApp(null)}
                    disabled={isUpdatingStatus}
                    style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                  >
                      Cancel
                  </button>
                  <button 
                    onClick={handleSaveUpdate}
                    disabled={isUpdatingStatus}
                    style={{ 
                      flex: 1.5, background: nestNavy, color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', 
                      fontWeight: 700, fontSize: '14px', cursor: isUpdatingStatus ? 'not-allowed' : 'pointer', 
                      boxShadow: '0 4px 12px rgba(26, 38, 82, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      opacity: isUpdatingStatus ? 0.8 : 1
                    }}
                  >
                      {isUpdatingStatus ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Saving & Dispatching...
                        </>
                      ) : (
                        <>
                          <Check size={16} /> Save Status {updateData.sendEmail ? '& Send Email' : ''}
                        </>
                      )}
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Application Form & Profile Details Modal */}
      {createPortal(
        <AnimatePresence>
          {viewingAppDetails && (() => {
            const isDirectUser = Boolean(viewingAppDetails.not_added_by_admin);
            const formData = viewingAppDetails.form_data || viewingAppDetails;
            const profileData = viewingAppDetails.profile_data || viewingAppDetails;
            const techStacks = toArray(formData.tech_stacks || viewingAppDetails.tech_stacks);
            const interestedPositions = toArray(formData.interested_positions || viewingAppDetails.interested_positions);
            const profileSkills = toArray(profileData.skills || viewingAppDetails.skills);
            const experiences = Array.isArray(profileData.experience) ? profileData.experience : [];
            const educations = Array.isArray(profileData.education) ? profileData.education : [];
            const certificates = Array.isArray(profileData.certificates) ? profileData.certificates : [];

            return (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ 
                    position: 'fixed', inset: 0, background: 'rgba(5, 13, 30, 0.72)', backdropFilter: 'blur(14px)',
                    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}
                onClick={() => setViewingAppDetails(null)}
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={smoothSpring}
                  onClick={(e) => e.stopPropagation()}
                  style={{ 
                      background: '#ffffff', width: '100%', maxWidth: '820px', borderRadius: '24px',
                      boxShadow: '0 25px 60px -15px rgba(0, 20, 50, 0.4)', position: 'relative',
                      maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
                  }}
                >
                  {/* Top Header */}
                  <div style={{ 
                    padding: '24px 28px 18px', 
                    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', 
                    borderBottom: '1px solid #e2e8f0', 
                    position: 'relative' 
                  }}>
                    <button 
                      onClick={() => setViewingAppDetails(null)} 
                      style={{ 
                        position: 'absolute', top: '20px', right: '20px', border: 'none', 
                        background: '#f1f5f9', borderRadius: '50%', width: '34px', height: '34px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', 
                        cursor: 'pointer', transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                      title="Close modal"
                    >
                        <X size={18} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <UserAvatar
                        src={viewingAppDetails.applicant_picture}
                        name={viewingAppDetails.applicant_name || formData.full_name || profileData.full_name}
                        status={viewingAppDetails.applicant_status || 'open_to_work'}
                        size={64}
                        bgColor={nestNavy}
                      />
                      <div style={{ flex: 1, paddingRight: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0 }}>
                            {viewingAppDetails.applicant_name || formData.full_name || profileData.full_name}
                          </h2>
                          {isDirectUser ? (
                            <span style={{ fontSize: '10px', color: '#6d28d9', fontWeight: 900, background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '3px 9px', borderRadius: '6px', letterSpacing: '0.4px' }}>
                              DIRECT PORTAL APPLICANT
                            </span>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', color: '#1e40af', fontWeight: 900, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: '6px', letterSpacing: '0.4px' }}>
                                {profileData.user_type || 'ALUMNI DIRECTORY'}
                              </span>
                              {(profileData.emp_id || profileData.student_id) && (
                                <span style={{ fontSize: '10px', color: '#475569', fontWeight: 800, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
                                  ID: {profileData.emp_id || profileData.student_id}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b' }}>
                          <span>Applied for <strong style={{ color: nestNavy, fontWeight: 700 }}>{viewingAppDetails.job_title}</strong></span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} color="#94a3b8" /> Applied: {formatDateTime(viewingAppDetails.applied_at)}
                          </span>
                          {viewingAppDetails.reapplied_at && (
                            <>
                              <span>•</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 600 }}>
                                <RotateCcw size={13} /> Reapplied: {formatDateTime(viewingAppDetails.reapplied_at)}
                              </span>
                            </>
                          )}
                          {viewingAppDetails.withdrawn_at && (
                            <>
                              <span>•</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 600 }}>
                                <XCircle size={13} /> Withdrawn: {formatDateTime(viewingAppDetails.withdrawn_at)}
                              </span>
                            </>
                          )}
                          {viewingAppDetails.status_updated_at && viewingAppDetails.status !== 'Applied' && (
                            <>
                              <span>•</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                                <Clock size={13} /> Updated: {formatDateTime(viewingAppDetails.status_updated_at)}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span style={{ 
                            fontSize: '11px', fontWeight: 700, 
                            color: getStatusStyles(viewingAppDetails.status || 'Applied').color, 
                            background: getStatusStyles(viewingAppDetails.status || 'Applied').bg, 
                            padding: '2px 8px', borderRadius: '8px' 
                          }}>
                            {viewingAppDetails.status || 'Applied'}
                          </span>
                          {viewingAppDetails.is_viewed && (
                            <>
                              <span>•</span>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                color: '#0284c7', 
                                background: '#f0f9ff', 
                                border: '1px solid #bae6fd', 
                                padding: '2px 8px', 
                                borderRadius: '6px' 
                              }}>
                                <Eye size={12} color="#0284c7" />
                                Viewed by {viewingAppDetails.viewed_by?.name || 'Recruiter'}{viewingAppDetails.viewed_at ? ` • ${formatTimeAgo(viewingAppDetails.viewed_at)}` : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Segmented Tab Switcher */}
                    <div style={{ 
                      display: 'flex', gap: '8px', marginTop: '18px', 
                      background: '#f1f5f9', padding: '4px', borderRadius: '12px', 
                      width: 'fit-content' 
                    }}>
                      <button
                        onClick={() => setActiveDetailTab('form')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '7px 16px', borderRadius: '9px', border: 'none',
                          fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: activeDetailTab === 'form' ? nestNavy : 'transparent',
                          color: activeDetailTab === 'form' ? '#ffffff' : '#64748b'
                        }}
                      >
                        <FileText size={15} /> Application Form Details
                        {isDirectUser && (
                          <span style={{ 
                            fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px',
                            background: activeDetailTab === 'form' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                            color: activeDetailTab === 'form' ? '#ffffff' : '#475569'
                          }}>
                            Candidate Filled
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setActiveDetailTab('profile')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '7px 16px', borderRadius: '9px', border: 'none',
                          fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: activeDetailTab === 'profile' ? nestNavy : 'transparent',
                          color: activeDetailTab === 'profile' ? '#ffffff' : '#64748b'
                        }}
                      >
                        <User size={15} /> Candidate Profile Details
                        {!isDirectUser && (
                          <span style={{ 
                            fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px',
                            background: activeDetailTab === 'profile' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                            color: activeDetailTab === 'profile' ? '#ffffff' : '#475569'
                          }}>
                            Portal Profile
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setActiveDetailTab('timeline')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '7px 16px', borderRadius: '9px', border: 'none',
                          fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: activeDetailTab === 'timeline' ? nestNavy : 'transparent',
                          color: activeDetailTab === 'timeline' ? '#ffffff' : '#64748b'
                        }}
                      >
                        <Clock size={15} /> Application History & Timeline
                        <span style={{ 
                          fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px',
                          background: activeDetailTab === 'timeline' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                          color: activeDetailTab === 'timeline' ? '#ffffff' : '#475569'
                        }}>
                          {viewingAppDetails.timeline?.length || 1} Events
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveDetailTab('emails')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '7px 16px', borderRadius: '9px', border: 'none',
                          fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: activeDetailTab === 'emails' ? nestNavy : 'transparent',
                          color: activeDetailTab === 'emails' ? '#ffffff' : '#64748b'
                        }}
                      >
                        <Mail size={15} /> Triggered Emails
                        <span style={{ 
                          fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px',
                          background: activeDetailTab === 'emails' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                          color: activeDetailTab === 'emails' ? '#ffffff' : '#475569'
                        }}>
                          {viewingAppDetails.email_history?.length || 0} Emails
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Content Body */}
                  <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Latest Recruiter Note & Status Banner (Visible to all recruiters) */}
                    {(() => {
                      const lastEv = [...(viewingAppDetails.timeline || [])].reverse().find((e: any) => e.action === 'Status Changed' || e.recruiter_id || e.note);
                      const updaterName = viewingAppDetails.last_updated_by?.name || lastEv?.actor_name;
                      const updaterId = viewingAppDetails.last_updated_by?.recruiter_id || lastEv?.recruiter_id;
                      const note = viewingAppDetails.notes || viewingAppDetails.last_status_note || lastEv?.note;

                      if (!updaterName && !updaterId && !note) return null;

                      return (
                        <div style={{
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          borderRadius: '14px',
                          padding: '14px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <ShieldCheck size={16} color="#0284c7" />
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                Latest Recruiter Status Update
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0c4a6e' }}>
                                by {updaterName || 'Recruiter'}
                              </span>
                              {updaterId && (
                                <span style={{ fontSize: '11px', background: '#0284c7', color: '#ffffff', padding: '1px 7px', borderRadius: '4px', fontWeight: 800 }}>
                                  ID: {updaterId}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> {formatDateTime(viewingAppDetails.status_updated_at || viewingAppDetails.updated_at || lastEv?.timestamp)}
                            </span>
                          </div>
                          {note && (
                            <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
                              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '2px' }}>
                                Internal Recruiter Comment:
                              </span>
                              <p style={{ margin: 0, fontSize: '13px', color: '#0c4a6e', fontStyle: 'italic', lineHeight: 1.5 }}>
                                “{note}”
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {activeDetailTab === 'form' ? (
                      /* ═════════════════════════════════════════════════════════════════════════
                         VIEW 1: APPLICATION FORM SUBMISSION DETAILS (FOR DIRECT APPLICANTS)
                         ═════════════════════════════════════════════════════════════════════════ */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Notice Banner */}
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={20} color="#0284c7" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                              Application Form Submission Details
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                              Displaying all information submitted by the candidate through the job application form.
                            </p>
                          </div>
                          {isDirectUser && (
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '3px 10px', borderRadius: '8px' }}>
                              Direct Applicant Form
                            </span>
                          )}
                        </div>

                        {/* Section 1: Contact & Location Info */}
                        <div>
                          <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                            Contact & Location
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Email Address
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                <Mail size={15} color={nestRed} /> {formData.email || viewingAppDetails.applicant_email || '—'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Phone Number
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                <Phone size={15} color="#0284c7" /> {formData.phone || viewingAppDetails.phone || 'Not provided'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Current Location
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                <MapPin size={15} color={nestRed} /> {formData.current_location || formData.location || viewingAppDetails.location || 'Not specified'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Preferred Location(s)
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                <Building size={15} color="#0284c7" /> {formData.preferred_location || 'Flexible / Any Location'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Academic & Referral Information */}
                        <div>
                          <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                            Academic Background & Referral
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                College / University
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#0d9488' }}>
                                <GraduationCap size={16} color="#0d9488" /> {formData.college || viewingAppDetails.college || 'Not specified'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Specialization / Branch
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                <Briefcase size={15} color={nestNavy} /> {formData.specialization || viewingAppDetails.specialization || 'Not specified'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Graduation Year
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                <Calendar size={15} color={nestNavy} /> {formData.batch || formData.graduation_year || viewingAppDetails.batch || 'Not specified'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Referral Source
                              </label>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                {formData.referral_source || 'Direct Application'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Referral Source Details
                              </label>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                {formData.referral_source_details || '—'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Current Employment & Experience */}
                        <div>
                          <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                            Current Employment & Total Experience
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Current Organisation
                              </label>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                {formData.current_organisation || 'Fresher / Not Employed'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Current Designation
                              </label>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                {formData.current_designation || 'Entry-Level / Student'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Total Experience
                              </label>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: nestNavy }}>
                                {formData.total_experience || '0 Years (Fresher)'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 4: Tech Stacks & Target Positions */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                              Submitted Tech Stacks
                            </label>
                            {techStacks.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {techStacks.map((tech, idx) => (
                                  <span key={idx} style={{ fontSize: '12px', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '8px' }}>
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>None specified in application form</span>
                            )}
                          </div>

                          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                              Interested Positions / Roles
                            </label>
                            {interestedPositions.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {interestedPositions.map((pos, idx) => (
                                  <span key={idx} style={{ fontSize: '12px', fontWeight: 700, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '3px 10px', borderRadius: '8px' }}>
                                    {pos}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>None specified in application form</span>
                            )}
                          </div>
                        </div>

                        {/* Section 5: Online Profiles */}
                        {formData.linkedin_url && (
                          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                              LinkedIn Profile
                            </label>
                            <a 
                              href={formData.linkedin_url.startsWith('http') ? formData.linkedin_url : `https://${formData.linkedin_url}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}
                            >
                              <ExternalLink size={14} /> Open LinkedIn Profile ↗
                            </a>
                          </div>
                        )}

                        {/* Section 6: Candidate PDF View & Document (Inserted during form application) */}
                        {(() => {
                          const hasValidDrive = isValidExternalDriveLink(formData.resume_drive_link);
                          const rawResume = formData.resume_url || viewingAppDetails.resume_url || (!hasValidDrive ? formData.resume_drive_link : '');
                          const resumeDocName = formData.resume_name || viewingAppDetails.resume_name || `${viewingAppDetails.applicant_name}_Resume.pdf`;

                          return (
                            <div style={{
                              background: '#ffffff',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
                            }}>
                              <div style={{
                                background: '#f8fafc',
                                padding: '14px 18px',
                                borderBottom: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '12px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={22} color="#dc2626" />
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Candidate Resume (PDF View)
                                      </span>
                                      <span style={{ fontSize: '10px', fontWeight: 700, background: '#ecfdf5', color: '#059669', padding: '1px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                                        Application Form Attachment
                                      </span>
                                    </div>
                                    <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                      {resumeDocName}
                                    </p>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => handleOpenPdfPreview(viewingAppDetails)}
                                    style={{
                                      padding: '8px 16px',
                                      borderRadius: '10px',
                                      border: 'none',
                                      background: nestNavy,
                                      color: '#ffffff',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '13px',
                                      boxShadow: '0 2px 6px rgba(26, 38, 82, 0.25)'
                                    }}
                                  >
                                    <Eye size={15} /> View Full PDF
                                  </button>

                                  <button
                                    onClick={() => handleDownloadCV(viewingAppDetails)}
                                    disabled={downloadingId === viewingAppDetails.id}
                                    style={{
                                      padding: '8px 14px',
                                      borderRadius: '10px',
                                      border: '1px solid #cbd5e1',
                                      background: '#ffffff',
                                      color: '#334155',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '13px'
                                    }}
                                  >
                                    {downloadingId === viewingAppDetails.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download
                                  </button>
                                </div>
                              </div>

                              {/* Interactive PDF Document Viewer */}
                              {rawResume && rawResume.startsWith('data:application/pdf') ? (
                                <div style={{ padding: '14px', background: '#f1f5f9' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                      <FileText size={13} color="#dc2626" /> PDF Document Preview (Application Attachment)
                                    </span>
                                    <button
                                      onClick={() => handleOpenPdfPreview(viewingAppDetails)}
                                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                                    >
                                      <ExternalLink size={12} /> Open Full View ↗
                                    </button>
                                  </div>
                                  <iframe
                                    src={rawResume}
                                    title="Candidate Resume PDF View"
                                    style={{
                                      width: '100%',
                                      height: '460px',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '10px',
                                      background: '#ffffff'
                                    }}
                                  />
                                </div>
                              ) : rawResume && (rawResume.startsWith('http://') || rawResume.startsWith('https://')) && rawResume.toLowerCase().endsWith('.pdf') ? (
                                <div style={{ padding: '14px', background: '#f1f5f9' }}>
                                  <iframe
                                    src={rawResume}
                                    title="Candidate Resume PDF View"
                                    style={{
                                      width: '100%',
                                      height: '460px',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '10px',
                                      background: '#ffffff'
                                    }}
                                  />
                                </div>
                              ) : (
                                <div style={{ padding: '20px 24px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                                    Document ready: Click <strong>View Full PDF</strong> or <strong>Download</strong> to view the candidate's uploaded resume.
                                  </span>
                                  <button
                                    onClick={() => handleOpenPdfPreview(viewingAppDetails)}
                                    style={{
                                      padding: '7px 14px',
                                      borderRadius: '8px',
                                      border: `1px solid ${nestNavy}`,
                                      background: '#ffffff',
                                      color: nestNavy,
                                      fontWeight: 700,
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                  >
                                    <Eye size={13} /> View Resume
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Section 7: Cover Letter / Candidate Statement */}
                        {formData.cover_letter && (
                          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                              Cover Letter / Candidate Statement
                            </label>
                            <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {formData.cover_letter}
                            </p>
                          </div>
                        )}

                        {/* Section 8: Candidate Declaration Status */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          background: formData.declaration_confirmed ? '#f0fdf4' : '#fffbeb',
                          border: `1px solid ${formData.declaration_confirmed ? '#bbf7d0' : '#fef3c7'}`,
                          padding: '12px 16px', borderRadius: '12px'
                        }}>
                          <ShieldCheck size={20} color={formData.declaration_confirmed ? '#16a34a' : '#d97706'} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: formData.declaration_confirmed ? '#166534' : '#92400e' }}>
                            {formData.declaration_confirmed 
                              ? 'Declaration Confirmed: Applicant certified all details and credentials entered in this form are accurate and complete.' 
                              : 'Declaration pending confirmation.'}
                          </span>
                        </div>
                      </div>
                    ) : activeDetailTab === 'profile' ? (
                      /* ═════════════════════════════════════════════════════════════════════════
                         VIEW 2: CANDIDATE PROFILE DETAILS (FOR ADMIN-ADDED / PORTAL USERS)
                         ═════════════════════════════════════════════════════════════════════════ */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Notice Banner */}
                        <div style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '14px',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={20} color="#1d4ed8" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>
                              Candidate Profile Details
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#3b82f6' }}>
                              Details fetched directly from the member's official NeST portal profile.
                            </p>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', background: '#ffffff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '8px' }}>
                            {profileData.user_type || 'Portal Member'}
                          </span>
                        </div>

                        {/* Section 1: Professional Bio */}
                        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Professional Summary / Bio
                          </label>
                          <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: 1.6, fontStyle: profileData.bio ? 'normal' : 'italic' }}>
                            {profileData.bio || viewingAppDetails.bio || 'No professional bio added on candidate profile.'}
                          </p>
                        </div>

                        {/* Section 2: Current Professional Role & Organisation */}
                        <div>
                          <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                            Current Position & Experience
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Designation / Role
                              </label>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                                {profileData.current_designation || viewingAppDetails.current_designation || 'Alumni Member'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Current Organisation
                              </label>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                                {profileData.current_organisation || viewingAppDetails.current_organisation || 'NeST Group'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Total Experience
                              </label>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: nestNavy }}>
                                {profileData.total_experience || viewingAppDetails.total_experience || '—'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Contact & Location */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Email Address
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                              <Mail size={15} color={nestRed} /> {profileData.email || viewingAppDetails.applicant_email || '—'}
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Phone Number
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                              <Phone size={15} color="#0284c7" /> {profileData.phone || viewingAppDetails.phone || 'Not provided'}
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Location
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                              <MapPin size={15} color={nestRed} /> {profileData.current_location || profileData.location || viewingAppDetails.location || 'Not specified'}
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Preferred Location
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                              <Building size={15} color="#0284c7" /> {profileData.preferred_location || 'Flexible / Any Location'}
                            </div>
                          </div>
                        </div>

                        {/* Section 4: Academic Background */}
                        <div>
                          <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                            Institutional & Academic Affiliation
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                College / Institution
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0d9488' }}>
                                <GraduationCap size={15} color="#0d9488" /> {profileData.college || viewingAppDetails.college || 'Saintgits College of Engineering'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Department / Branch
                              </label>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                                {profileData.specialization || viewingAppDetails.specialization || 'Engineering'}
                              </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Graduation Year
                              </label>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                                {profileData.batch || profileData.graduation_year || viewingAppDetails.batch || '—'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 5: Core Skills & Competencies */}
                        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                            Core Skills & Technical Competencies
                          </label>
                          {profileSkills.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {profileSkills.map((skill, idx) => (
                                <span key={idx} style={{ 
                                  fontSize: '12px', fontWeight: 700, 
                                  background: '#f0fdf4', color: '#15803d', 
                                  border: '1px solid #bbf7d0', padding: '4px 12px', 
                                  borderRadius: '8px' 
                                }}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>No skills listed on member profile</span>
                          )}
                        </div>

                        {/* Section 6: Work Experience Timeline (if present) */}
                        {experiences.length > 0 && (
                          <div>
                            <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                              Work Experience History
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {experiences.map((exp: any, idx: number) => (
                                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                      {exp.title || exp.role || 'Role'}
                                    </h5>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                                      {exp.period || exp.duration || (exp.start_date ? `${exp.start_date} - ${exp.end_date || 'Present'}` : '')}
                                    </span>
                                  </div>
                                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: nestNavy, fontWeight: 600 }}>
                                    {exp.company || exp.organisation || ''}
                                  </p>
                                  {exp.description && (
                                    <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                                      {exp.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section 7: Education Timeline (if present) */}
                        {educations.length > 0 && (
                          <div>
                            <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                              Academic Qualifications
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {educations.map((edu: any, idx: number) => (
                                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                      {edu.degree || edu.qualification || 'Degree'}
                                    </h5>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                                      {edu.year || edu.period || ''}
                                    </span>
                                  </div>
                                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#0d9488', fontWeight: 600 }}>
                                    {edu.school || edu.institution || edu.college || ''}
                                  </p>
                                  {edu.grade && (
                                    <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#334155', fontWeight: 600 }}>
                                      Score: {edu.grade}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section 8: Certifications & Licenses (if present) */}
                        {certificates.length > 0 && (
                          <div>
                            <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                              Certifications & Credentials
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                              {certificates.map((cert: any, idx: number) => (
                                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <Award size={20} color="#e67700" style={{ flexShrink: 0 }} />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {cert.title || cert.name || 'Certificate'}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                                      {cert.issuer || cert.issued_by || 'Verified Issuance'} {cert.date ? `• ${cert.date}` : ''}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section 9: Online Profiles & Portfolio */}
                        <div>
                          <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                            Online Profiles & Links
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                LinkedIn
                              </label>
                              {profileData.linkedin_url || viewingAppDetails.linkedin_url ? (
                                <a 
                                  href={(profileData.linkedin_url || viewingAppDetails.linkedin_url).startsWith('http') ? (profileData.linkedin_url || viewingAppDetails.linkedin_url) : `https://${profileData.linkedin_url || viewingAppDetails.linkedin_url}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}
                                >
                                  <Linkedin size={14} /> Profile ↗
                                </a>
                              ) : (
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Not provided</span>
                              )}
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                GitHub
                              </label>
                              {profileData.github_url || viewingAppDetails.github_url ? (
                                <a 
                                  href={(profileData.github_url || viewingAppDetails.github_url).startsWith('http') ? (profileData.github_url || viewingAppDetails.github_url) : `https://${profileData.github_url || viewingAppDetails.github_url}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#1e293b', textDecoration: 'none' }}
                                >
                                  <Github size={14} /> GitHub ↗
                                </a>
                              ) : (
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Not provided</span>
                              )}
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Portfolio
                              </label>
                              {profileData.portfolio_url || viewingAppDetails.portfolio_url ? (
                                <a 
                                  href={(profileData.portfolio_url || viewingAppDetails.portfolio_url).startsWith('http') ? (profileData.portfolio_url || viewingAppDetails.portfolio_url) : `https://${profileData.portfolio_url || viewingAppDetails.portfolio_url}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0d9488', textDecoration: 'none' }}
                                >
                                  <Globe size={14} /> Website ↗
                                </a>
                              ) : (
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Not provided</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section 10: Profile Resume / CV Card */}
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileText size={20} color="#1d4ed8" />
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>Candidate Resume / CV</span>
                              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                {profileData.resume_name || viewingAppDetails.resume_name || `${viewingAppDetails.applicant_name}_Resume.pdf`}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenPdfPreview(viewingAppDetails)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                background: nestNavy,
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Eye size={14} /> View PDF
                            </button>
                            <button
                              onClick={() => handleDownloadCV(viewingAppDetails)}
                              disabled={downloadingId === viewingAppDetails.id}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#334155',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {downloadingId === viewingAppDetails.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : activeDetailTab === 'timeline' ? (
                      /* ═════════════════════════════════════════════════════════════════════════
                         VIEW 3: APPLICATION HISTORY & TIMELINE (CHRONOLOGICAL AUDIT TRAIL)
                         ═════════════════════════════════════════════════════════════════════════ */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Summary Metrics Banner */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '12px',
                          background: '#f8fafc',
                          padding: '16px',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Original Application
                            </label>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={14} color="#94a3b8" /> {formatDateTime(viewingAppDetails.applied_at)}
                            </span>
                          </div>

                          {viewingAppDetails.reapplied_at && (
                            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Reapplied At
                              </label>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <RotateCcw size={14} /> {formatDateTime(viewingAppDetails.reapplied_at)}
                              </span>
                            </div>
                          )}

                          {viewingAppDetails.withdrawn_at && (
                            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Withdrawn At
                              </label>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <XCircle size={14} /> {formatDateTime(viewingAppDetails.withdrawn_at)}
                              </span>
                            </div>
                          )}

                          <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Latest Status Transition
                            </label>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={14} color="#94a3b8" /> {formatDateTime(viewingAppDetails.status_updated_at || viewingAppDetails.updated_at || viewingAppDetails.applied_at)}
                            </span>
                          </div>
                        </div>

                        {/* Chronological Event History */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px 24px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 800, color: nestNavy, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} /> Complete Chronological Audit Trail
                          </h4>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                            {(viewingAppDetails.timeline && viewingAppDetails.timeline.length > 0 ? viewingAppDetails.timeline : [
                              {
                                action: 'Applied',
                                status: 'Applied',
                                timestamp: viewingAppDetails.applied_at,
                                actor_name: viewingAppDetails.applicant_name || 'Candidate',
                                actor_role: 'Candidate',
                                note: 'Candidate submitted initial application.'
                              },
                              ...(viewingAppDetails.reapplied_at ? [{
                                action: 'Reapplied',
                                status: 'Applied',
                                timestamp: viewingAppDetails.reapplied_at,
                                actor_name: viewingAppDetails.applicant_name || 'Candidate',
                                actor_role: 'Candidate',
                                note: 'Candidate reapplied for position.'
                              }] : []),
                              ...(viewingAppDetails.withdrawn_at ? [{
                                action: 'Withdrawn',
                                status: 'Withdrawn',
                                timestamp: viewingAppDetails.withdrawn_at,
                                actor_name: viewingAppDetails.applicant_name || 'Candidate',
                                actor_role: 'Candidate',
                                note: 'Application withdrawn by candidate.'
                              }] : [])
                            ]).map((evt: any, idx: number) => {
                              const isWithdrawn = evt.action === 'Withdrawn' || evt.status === 'Withdrawn';
                              const isReapplied = evt.action === 'Reapplied';
                              const isApplied = evt.action === 'Applied' && !isReapplied;
                              const statusStyle = getStatusStyles(evt.status || 'Applied');

                              return (
                                <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: isWithdrawn ? '#fee2e2' : isReapplied ? '#eff6ff' : isApplied ? '#f1f5f9' : statusStyle.bg,
                                    border: `1px solid ${isWithdrawn ? '#fecaca' : isReapplied ? '#bfdbfe' : isApplied ? '#cbd5e1' : statusStyle.color}`,
                                    color: isWithdrawn ? '#dc2626' : isReapplied ? '#2563eb' : isApplied ? '#475569' : statusStyle.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '2px'
                                  }}>
                                    {isWithdrawn ? <XCircle size={16} /> : isReapplied ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
                                  </div>
                                  <div style={{ flex: 1, background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                                          {evt.action === 'Status Changed' ? `Status updated to ${evt.status}` : evt.action}
                                        </span>
                                        {evt.previous_status && evt.previous_status !== evt.status && (
                                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                                            (from {evt.previous_status})
                                          </span>
                                        )}
                                        <span style={{ fontSize: '11px', color: '#1e293b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                          <User size={11} /> {evt.actor_name || evt.actor_role || 'System'}
                                        </span>
                                        {evt.recruiter_id && (
                                          <span style={{ fontSize: '11px', color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                                            Recruiter ID: {evt.recruiter_id}
                                          </span>
                                        )}
                                        {evt.recruiter_email && (
                                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                                            ({evt.recruiter_email})
                                          </span>
                                        )}
                                      </div>
                                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={13} color="#94a3b8" /> {formatDateTime(evt.timestamp)}
                                      </span>
                                    </div>
                                    {evt.note && (
                                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: `3px solid ${nestNavy}`, borderRadius: '6px', padding: '8px 12px', marginTop: '6px' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <MessageSquare size={11} color={nestNavy} /> Internal Recruiter Comment
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: 1.5 }}>
                                          {evt.note}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ═════════════════════════════════════════════════════════════════════════
                         VIEW 4: TRIGGERED EMAILS & DISPATCH HISTORY
                         ═════════════════════════════════════════════════════════════════════════ */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Email Metrics & Direct Compose Banner */}
                        <div style={{
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                          border: '1.5px solid #a7f3d0',
                          borderRadius: '16px',
                          padding: '18px 22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <MailCheck size={24} color="#059669" />
                            </div>
                            <div>
                              <h3 style={{ margin: '0 0 3px 0', fontSize: '15px', fontWeight: 800, color: '#065f46' }}>
                                Candidate Email Log ({viewingAppDetails.email_history?.length || 0} Triggered)
                              </h3>
                              <p style={{ margin: 0, fontSize: '12px', color: '#047857' }}>
                                Recipient: <strong>{viewingAppDetails.applicant_email || viewingAppDetails.email}</strong> • Role: <strong>{viewingAppDetails.job_title}</strong>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenComposeEmail(viewingAppDetails)}
                            style={{
                              padding: '9px 16px',
                              borderRadius: '10px',
                              border: 'none',
                              background: '#059669',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                            }}
                          >
                            <Send size={13} /> Compose & Trigger Email
                          </button>
                        </div>

                        {/* Email Cards List */}
                        {viewingAppDetails.email_history && viewingAppDetails.email_history.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {viewingAppDetails.email_history.map((email: any, index: number) => {
                              const isDelivered = email.delivery_status === 'Sent';
                              return (
                                <div 
                                  key={email.id || index}
                                  style={{
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '14px',
                                    padding: '16px 20px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                                        Status Move:
                                      </span>
                                      <span style={{ background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>
                                        {email.status_from || 'Applied'}
                                      </span>
                                      <span style={{ color: '#94a3b8', fontWeight: 800 }}>➔</span>
                                      <span style={{ background: getStatusStyles(email.status_to).bg, color: getStatusStyles(email.status_to).color, padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                                        {email.status_to}
                                      </span>
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '99px',
                                        background: isDelivered ? '#ecfdf5' : '#fef2f2',
                                        color: isDelivered ? '#059669' : '#dc2626',
                                        border: `1px solid ${isDelivered ? '#a7f3d0' : '#fecaca'}`
                                      }}>
                                        {isDelivered ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                        {isDelivered ? 'Dispatched' : 'Failed'}
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                                      <Clock size={12} color="#94a3b8" />
                                      <span>{formatDateTime(email.sent_at)}</span>
                                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>({formatTimeAgo(email.sent_at)})</span>
                                    </div>
                                  </div>

                                  <div>
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Subject</span>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                                      {email.subject}
                                    </p>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#475569', flexWrap: 'wrap' }}>
                                    <div>
                                      <strong>Recipient:</strong> <span style={{ color: '#0369a1' }}>{email.recipient_email}</span>
                                    </div>
                                    <div>
                                      <strong>Triggered By:</strong> {email.sent_by?.name || 'Recruiter'} {email.sent_by?.recruiter_id ? `(ID: ${email.sent_by.recruiter_id})` : ''}
                                    </div>
                                  </div>

                                  {email.status_to === 'Interview Scheduled' && (email.interview_date || email.interview_time || email.interview_location) && (
                                    <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#6b21a8' }}>
                                      <div style={{ fontWeight: 800, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} color="#7e22ce" /> Interview Schedule:
                                      </div>
                                      <div>
                                        Date: <strong>{email.interview_date || 'TBD'}</strong> • Time: <strong>{email.interview_time || 'TBD'}</strong> • Location: <strong>{email.interview_location || 'NeST Kochi Campus'}</strong>
                                      </div>
                                    </div>
                                  )}

                                  {/* Triggered Email Content Display */}
                                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ background: '#f1f5f9', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                                        <Mail size={12} color="#0284c7" /> Triggered Email Content
                                      </div>
                                      <span style={{ fontSize: '10px', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                        Sent to Candidate
                                      </span>
                                    </div>
                                    <div style={{ padding: '12px 14px', fontSize: '12px', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#fafbfc' }}>
                                      {getEmailBodyContent(email, viewingAppDetails?.applicant_name, viewingAppDetails?.job_title)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#0284c7' }}>
                              <Mail size={24} />
                            </div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                              No emails triggered yet
                            </h4>
                            <p style={{ margin: '0 auto 16px', fontSize: '12px', color: '#64748b', maxWidth: '380px', lineHeight: 1.5 }}>
                              No status update or customized emails have been triggered for this candidate yet.
                            </p>
                            <button
                              onClick={() => handleOpenComposeEmail(viewingAppDetails)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: nestNavy,
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Send size={12} /> Trigger First Email Now
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sticky Footer Actions */}
                  <div style={{ 
                    padding: '16px 28px', 
                    background: '#ffffff', 
                    borderTop: '1px solid #f1f5f9', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                      Showing {activeDetailTab === 'form' ? 'Application Form Submission' : activeDetailTab === 'profile' ? 'Portal Profile Details' : activeDetailTab === 'timeline' ? 'Application History & Timeline' : 'Candidate Email History'}
                    </span>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleOpenComposeEmail(viewingAppDetails)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '10px',
                          border: '1px solid #86efac',
                          background: '#f0fdf4',
                          color: '#166534',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Mail size={14} color="#16a34a" />
                        Trigger Email
                      </button>
                      <button
                        onClick={() => handleOpenPdfPreview(viewingAppDetails)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          border: 'none',
                          background: nestNavy,
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(26, 38, 82, 0.25)'
                        }}
                      >
                        <Eye size={14} />
                        View PDF Resume
                      </button>

                      <button
                        onClick={() => handleDownloadCV(viewingAppDetails)}
                        disabled={downloadingId === viewingAppDetails.id}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#1e293b',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {downloadingId === viewingAppDetails.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        Download CV
                      </button>

                      <button
                        onClick={() => {
                          const app = viewingAppDetails;
                          setViewingAppDetails(null);
                          handleUpdateClick(app);
                        }}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          border: `1px solid ${nestNavy}`,
                          background: nestNavy,
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Edit size={14} /> Update Application Status
                      </button>

                      <button
                        onClick={() => setViewingAppDetails(null)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#e2e8f0',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}

      {/* Applicant Email History Modal Portal */}
      {createPortal(
        <AnimatePresence>
          {selectedEmailHistoryApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(5, 13, 30, 0.7)',
                backdropFilter: 'blur(10px)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
              onClick={() => setSelectedEmailHistoryApp(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                style={{
                  background: '#ffffff',
                  width: '100%',
                  maxWidth: '680px',
                  maxHeight: '88vh',
                  borderRadius: '24px',
                  padding: '28px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MailCheck size={24} color="#059669" />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 3px 0', fontSize: '18px', fontWeight: 800, color: nestNavy }}>
                        Candidate Email History
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                          <strong style={{ color: '#0f172a' }}>{selectedEmailHistoryApp.applicant_name}</strong> • {selectedEmailHistoryApp.job_title}
                        </p>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '99px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: getStatusStyles(selectedEmailHistoryApp.status || 'Applied').bg,
                          color: getStatusStyles(selectedEmailHistoryApp.status || 'Applied').color,
                          border: selectedEmailHistoryApp.status === 'Withdrawn' ? '1px solid #fca5a5' : '1px solid #e2e8f0'
                        }}>
                          {selectedEmailHistoryApp.status === 'Withdrawn' ? <XCircle size={12} color="#dc2626" /> : <CheckSquare size={12} />}
                          {selectedEmailHistoryApp.status || 'Applied'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: 600 }}>
                          ✉ {selectedEmailHistoryApp.applicant_email || selectedEmailHistoryApp.email}
                        </span>
                        {selectedEmailHistoryApp.withdrawn_at && (
                          <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={12} /> Withdrawn on {formatDateTime(selectedEmailHistoryApp.withdrawn_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const app = selectedEmailHistoryApp;
                        setSelectedEmailHistoryApp(null);
                        handleOpenComposeEmail(app);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#059669',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                      }}
                    >
                      <Send size={12} /> Trigger Email
                    </button>
                    <button
                      onClick={() => setSelectedEmailHistoryApp(null)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: 'none',
                        background: '#f1f5f9',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {selectedEmailHistoryApp.email_history && selectedEmailHistoryApp.email_history.length > 0 ? (
                    selectedEmailHistoryApp.email_history.map((email: any, index: number) => {
                      const isDelivered = email.delivery_status === 'Sent';
                      return (
                        <div
                          key={email.id || index}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '16px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                                Status:
                              </span>
                              <span style={{ background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>
                                {email.status_from || 'Applied'}
                              </span>
                              <span style={{ color: '#94a3b8', fontWeight: 800 }}>➔</span>
                              <span style={{ background: getStatusStyles(email.status_to).bg, color: getStatusStyles(email.status_to).color, padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                                {email.status_to}
                              </span>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '99px',
                                background: isDelivered ? '#ecfdf5' : '#fef2f2',
                                color: isDelivered ? '#059669' : '#dc2626',
                                border: `1px solid ${isDelivered ? '#a7f3d0' : '#fecaca'}`
                              }}>
                                {isDelivered ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                {isDelivered ? 'Dispatched' : 'Delivery Failed'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                              <Clock size={12} color="#94a3b8" />
                              <span>{formatDateTime(email.sent_at)}</span>
                              <span>({formatTimeAgo(email.sent_at)})</span>
                            </div>
                          </div>

                          <div>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Subject</span>
                            <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                              {email.subject}
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#475569', flexWrap: 'wrap' }}>
                            <div>
                              <strong>To:</strong> <span style={{ color: '#0369a1' }}>{email.recipient_email}</span>
                            </div>
                            <div>
                              <strong>Triggered By:</strong> {email.sent_by?.name || 'Recruiter'} {email.sent_by?.recruiter_id ? `(ID: ${email.sent_by.recruiter_id})` : ''}
                            </div>
                          </div>

                          {email.status_to === 'Interview Scheduled' && (email.interview_date || email.interview_time || email.interview_location) && (
                            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#6b21a8' }}>
                              <div style={{ fontWeight: 800, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} color="#7e22ce" /> Interview Schedule:
                              </div>
                              <div>
                                Date: <strong>{email.interview_date || 'TBD'}</strong> • Time: <strong>{email.interview_time || 'TBD'}</strong> • Location: <strong>{email.interview_location || 'NeST Kochi Campus'}</strong>
                              </div>
                            </div>
                          )}

                          {/* Triggered Email Content Display */}
                          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ background: '#f1f5f9', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                                <Mail size={12} color="#0284c7" /> Triggered Email Content
                              </div>
                              <span style={{ fontSize: '10px', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                Sent to Candidate
                              </span>
                            </div>
                            <div style={{ padding: '12px 14px', fontSize: '12px', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#fafbfc' }}>
                              {getEmailBodyContent(email, selectedEmailHistoryApp?.applicant_name, selectedEmailHistoryApp?.job_title)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#0284c7' }}>
                        <Mail size={28} />
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                        No emails have been triggered yet
                      </h4>
                      <p style={{ margin: '0 auto 18px', fontSize: '13px', color: '#64748b', maxWidth: '380px', lineHeight: 1.5 }}>
                        This candidate has not received any status change emails yet. Recruiters can trigger an email anytime using the button below or by updating their application status.
                      </p>
                      <button
                        onClick={() => {
                          const app = selectedEmailHistoryApp;
                          setSelectedEmailHistoryApp(null);
                          handleOpenComposeEmail(app);
                        }}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '10px',
                          border: 'none',
                          background: nestNavy,
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)'
                        }}
                      >
                        <Send size={14} /> Trigger First Email Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <button
                    onClick={() => setSelectedEmailHistoryApp(null)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Direct Email Composer Modal Portal */}
      {createPortal(
        <AnimatePresence>
          {composeEmailApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(5, 13, 30, 0.7)',
                backdropFilter: 'blur(10px)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
              onClick={() => setComposeEmailApp(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                style={{
                  background: '#ffffff',
                  width: '100%',
                  maxWidth: '560px',
                  maxHeight: '90vh',
                  borderRadius: '24px',
                  padding: '28px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setComposeEmailApp(null)}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    border: 'none',
                    background: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  <X size={20} />
                </button>

                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '19px', fontWeight: 800, color: nestNavy, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={18} color="#059669" /> Trigger Personalized Email to Candidate
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                      Candidate: <strong style={{ color: '#0f172a' }}>{composeEmailApp.applicant_name}</strong> • {composeEmailApp.job_title}
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Current Status:</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '99px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: getStatusStyles(composeEmailApp.status || 'Applied').bg,
                        color: getStatusStyles(composeEmailApp.status || 'Applied').color,
                        border: composeEmailApp.status === 'Withdrawn' ? '1px solid #fca5a5' : '1px solid #e2e8f0'
                      }}>
                        {composeEmailApp.status === 'Withdrawn' ? <XCircle size={12} color="#dc2626" /> : <CheckSquare size={12} />}
                        {composeEmailApp.status || 'Applied'}
                      </span>
                    </div>
                  </div>

                  {/* Prominent Withdrawn Banner if status is Withdrawn */}
                  {composeEmailApp.status === 'Withdrawn' && (
                    <div style={{
                      marginTop: '10px',
                      background: '#fef2f2',
                      border: '1px solid #fee2e2',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#991b1b',
                      fontWeight: 600
                    }}>
                      <XCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Application Withdrawn:</strong> This candidate has withdrawn their application {composeEmailApp.withdrawn_at ? `on ${formatDateTime(composeEmailApp.withdrawn_at)}` : ''}.
                      </span>
                    </div>
                  )}

                  <div style={{ marginTop: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                    ✉ Delivering to: <strong>{composeEmailApp.applicant_email || composeEmailApp.email}</strong>
                  </div>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '4px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                        Application Status Reference
                      </label>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        Current: <strong style={{ color: getStatusStyles(composeEmailApp.status || 'Applied').color }}>{composeEmailApp.status || 'Applied'}</strong>
                      </span>
                    </div>
                    <select
                      value={composeData.status}
                      onChange={e => {
                        const newStat = e.target.value;
                        const isWithdrawnSel = newStat === 'Withdrawn';
                        setComposeData({
                          ...composeData,
                          status: newStat,
                          subject: `Application Update: ${composeEmailApp.job_title} at NeST Digital — Status: ${newStat}`,
                          message: isWithdrawnSel
                            ? `Dear ${composeEmailApp.applicant_name || 'Candidate'},\n\nWe acknowledge that your application for the ${composeEmailApp.job_title || 'Position'} role at NeST Digital has been marked as Withdrawn.\n\nThank you for considering NeST Digital. If you have any questions or wish to explore other opportunities with us in the future, please feel free to reach out.`
                            : composeData.message
                        });
                      }}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1',
                        background: '#f8fafc', fontSize: '13px', fontWeight: 600, color: '#1e293b', outline: 'none'
                      }}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Aptitude">Aptitude</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </div>

                  {composeData.status === 'Interview Scheduled' && (
                    <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase' }}>
                        Interview Session Details
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4b5563', marginBottom: '4px' }}>Date</label>
                          <input
                            type="date"
                            value={composeData.interviewDate}
                            onChange={e => setComposeData({ ...composeData, interviewDate: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #d8b4fe', background: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4b5563', marginBottom: '4px' }}>Time (IST)</label>
                          <input
                            type="text"
                            placeholder="e.g. 11:00 AM IST"
                            value={composeData.interviewTime}
                            onChange={e => setComposeData({ ...composeData, interviewTime: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #d8b4fe', background: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4b5563', marginBottom: '4px' }}>Interview Location / Online Link</label>
                        <input
                          type="text"
                          placeholder="e.g. NeST Kochi Campus / Microsoft Teams"
                          value={composeData.interviewLocation}
                          onChange={e => setComposeData({ ...composeData, interviewLocation: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #d8b4fe', background: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Subject Line <span style={{ color: nestRed }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '13px', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Personalized Message / Guidance <span style={{ color: nestRed }}>*</span>
                    </label>
                    <textarea
                      value={composeData.message}
                      onChange={e => setComposeData({ ...composeData, message: e.target.value })}
                      rows={5}
                      placeholder="Type your message to the candidate here..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '13px', color: '#1e293b', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '18px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <button
                    onClick={() => setComposeEmailApp(null)}
                    disabled={sendingEmail}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendDirectEmail}
                    disabled={sendingEmail}
                    style={{
                      flex: 1.5,
                      padding: '10px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#059669',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: sendingEmail ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                      opacity: sendingEmail ? 0.8 : 1
                    }}
                  >
                    {sendingEmail ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Dispatching...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Send & Record in History
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Full PDF Viewer Modal Portal */}
      {pdfPreviewModal && pdfPreviewModal.isOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 13, 30, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setPdfPreviewModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: '1020px',
              height: '90vh',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.45)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {pdfPreviewModal.title}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {pdfPreviewModal.filename}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href={pdfPreviewModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ExternalLink size={13} /> Open in New Tab
                </a>

                <a
                  href={pdfPreviewModal.url}
                  download={pdfPreviewModal.filename}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: nestNavy,
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={13} /> Download
                </a>

                <button
                  onClick={() => setPdfPreviewModal(null)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#e2e8f0',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close PDF Viewer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, background: '#525659' }}>
              <iframe
                src={pdfPreviewModal.url}
                title={pdfPreviewModal.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
      
      <div style={{ paddingBottom: '4rem' }} />
    </div>
  );
};

export default RecruiterApplications;
