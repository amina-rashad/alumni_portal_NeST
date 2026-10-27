import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, FileText, Sparkles, Send, ShieldCheck, CheckSquare, Square, Upload, Briefcase, Eye } from 'lucide-react';
import { usersApi, applicationsApi, getUser } from '../services/api';

const parseStringOrArray = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
  if (typeof val === 'string') {
    const s = val.trim();
    if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('(') && s.endsWith(')'))) {
      try {
        const jsonFormatted = s.replace(/'/g, '"');
        const parsed = JSON.parse(jsonFormatted);
        if (Array.isArray(parsed)) {
          return parsed.map((x) => String(x).trim()).filter(Boolean);
        }
      } catch {
        return s
          .slice(1, -1)
          .split(',')
          .map((x) => x.replace(/['"]/g, '').trim())
          .filter(Boolean);
      }
    }
    return s.split(',').map((x) => x.trim()).filter(Boolean);
  }
  return [];
};

export interface ApplicationProfileData {
  full_name: string;
  email: string;
  phone: string;
  graduation_year: string;
  current_organisation: string;
  current_designation: string;
  total_experience: string;
  current_location: string;
  preferred_location: string;
  resume_drive_link: string;
  referral_source: string;
  referral_source_details: string;
  tech_stacks: string[];
  interested_positions: string[];
  declaration_confirmed: boolean;
  // Aliases for compatibility
  batch?: string;
  specialization?: string;
  location?: string;
  resume_url?: string;
  resume_name?: string;
  linkedin_url?: string;
  cover_letter?: string;
}

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'event' | 'course' | 'job';
  itemTitle: string;
  itemSubtitle?: string;
  jobSkills?: string[];
  jobDetails?: any;
  onSubmit: (data: ApplicationProfileData) => Promise<void>;
}

export const REFERRAL_OPTIONS = [
  'Professional Network (Colleague/Vendor etc)',
  'Personal Network (Friend/Relative etc)',
  'Academic Network (Classmate/Alumni Network etc)',
  'Professional Platforms (LinkedIn/Industry Events etc)',
  'Other',
];

export const TECH_STACK_OPTIONS = [
  'Software Engineering',
  'Architecture',
  'Quality Engineering',
  'Cybersecurity',
  'Embedded Systems',
  'IoT',
  'Data and Analytics',
  'Finance',
  'Project Management',
];

export const POSITION_OPTIONS = [
  'Solutions Architect',
  'Technical Lead .Net AI',
  'Quality Engineering Architect',
  'Product Security Architect',
  'Kotlin Mobile Engineer',
  'IoT Backend Specialist',
  'Finance Analyst',
  'Senior Software Engineer',
  'Mechanical Design Engineer (NXCAD)',
  'Test Engineer',
  'Manual Tester',
  'Embedded Engineer',
  '.Net Lead Engineer',
  'Senior Software Engineer C++, QT',
  'Senior Performance Load Test Engineer',
];

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  type,
  itemTitle,
  itemSubtitle,
  jobSkills,
  jobDetails,
  onSubmit,
}) => {
  // Derive tech stacks and position directly from the job when applying for a job
  const autoJobTechStacks = useMemo(() => {
    if (jobSkills && jobSkills.length > 0) return jobSkills;
    if (jobDetails) {
      const s = jobDetails.skills_required || jobDetails.skills || jobDetails.requirements;
      if (Array.isArray(s) && s.length > 0) return s;
      if (typeof s === 'string' && s.trim()) return s.split(',').map((x: string) => x.trim()).filter(Boolean);
    }
    return [itemTitle || 'Software Engineering'];
  }, [jobSkills, jobDetails, itemTitle]);

  const autoJobPosition = jobDetails?.title || itemTitle || 'Software Engineer';
  const [formData, setFormData] = useState<ApplicationProfileData>({
    full_name: '',
    email: '',
    phone: '',
    graduation_year: '',
    current_organisation: '',
    current_designation: '',
    total_experience: '',
    current_location: '',
    preferred_location: '',
    resume_drive_link: '',
    referral_source: '',
    referral_source_details: '',
    tech_stacks: [],
    interested_positions: [],
    declaration_confirmed: false,
  });

  const [otherReferralText, setOtherReferralText] = useState('');
  const [otherTechStackChecked, setOtherTechStackChecked] = useState(false);
  const [otherTechStackText, setOtherTechStackText] = useState('');
  const [otherPositionChecked, setOtherPositionChecked] = useState(false);
  const [otherPositionText, setOtherPositionText] = useState('');

  const [hasStoredData, setHasStoredData] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState<string>('');
  const [resumeUrl, setResumeUrl] = useState<string>('');

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      setError('Please upload a valid document in PDF, DOC, or DOCX format.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }

    setResumeFile(file);
    setResumeName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setResumeUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewResume = () => {
    if (resumeFile) {
      const fileUrl = URL.createObjectURL(resumeFile);
      window.open(fileUrl, '_blank');
      return;
    }
    if (resumeUrl && resumeUrl.startsWith('data:')) {
      try {
        const parts = resumeUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (err) {
        window.open(resumeUrl, '_blank');
      }
      return;
    }
    if (resumeUrl && (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://'))) {
      window.open(resumeUrl, '_blank');
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeName('');
    setResumeUrl('');
    setFormData(prev => ({
      ...prev,
      resume_drive_link: ''
    }));
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingProfile(true);
    setError('');

    const loadProfile = async () => {
      try {
        const res = await usersApi.getProfile();
        if (!isMounted) return;

        let u: any = res.success && res.data ? ((res.data as any).user || (res.data as any).profile || res.data) : {};

        let latestApp: any = null;
        try {
          const appsRes = await applicationsApi.getMyApplications();
          if (appsRes.success && (appsRes.data as any)?.applications?.length > 0) {
            latestApp = (appsRes.data as any).applications[0];
          }
        } catch (e) {
          console.warn('Could not fetch previous applications for modal prefill:', e);
        }

        const getVal = (key: string, altKey?: string) => {
          if (u?.[key] !== undefined && u?.[key] !== null && String(u[key]).trim() !== '') return u[key];
          if (altKey && u?.[altKey] !== undefined && u?.[altKey] !== null && String(u[altKey]).trim() !== '') return u[altKey];
          if (latestApp?.[key] !== undefined && latestApp?.[key] !== null && String(latestApp[key]).trim() !== '') return latestApp[key];
          if (altKey && latestApp?.[altKey] !== undefined && latestApp?.[altKey] !== null && String(latestApp[altKey]).trim() !== '') return latestApp[altKey];
          return '';
        };

        const name = getVal('full_name') || `${u?.first_name || ''} ${u?.last_name || ''}`.trim();
        const gradYear = getVal('graduation_year', 'batch');
        const organisation = getVal('current_organisation', 'current_company');
        const designation = getVal('current_designation', 'title');
        const totalExp = getVal('total_experience');
        const currLoc = getVal('current_location', 'location');
        const prefLoc = getVal('preferred_location');
        const resumeLink = getVal('resume_drive_link', 'resume_url');
        const rName = getVal('resume_name') || (resumeLink ? (resumeLink.startsWith('data:') ? 'Attached_Resume.pdf' : resumeLink.split('/').pop() || 'Attached_Resume') : '');
        if (resumeLink) {
          setResumeUrl(resumeLink);
          setResumeName(rName);
        }
        const refSource = getVal('referral_source');
        const refDetails = getVal('referral_source_details', 'college');

        const rawTechStacks = parseStringOrArray(
          (u?.tech_stacks && u.tech_stacks.length > 0) ? u.tech_stacks : latestApp?.tech_stacks
        );
        const standardTechs = rawTechStacks.filter((s) => TECH_STACK_OPTIONS.includes(s));
        const customTechs = rawTechStacks.filter((s) => !TECH_STACK_OPTIONS.includes(s) && s.trim());
        if (customTechs.length > 0) {
          setOtherTechStackChecked(true);
          setOtherTechStackText(customTechs.join(', '));
        } else {
          setOtherTechStackChecked(false);
          setOtherTechStackText('');
        }

        const rawPositions = parseStringOrArray(
          (u?.interested_positions && u.interested_positions.length > 0) ? u.interested_positions : latestApp?.interested_positions
        );
        // Include itemTitle if type === 'job' and not yet in rawPositions
        if (type === 'job' && itemTitle && !rawPositions.some(p => p.toLowerCase() === itemTitle.toLowerCase())) {
          rawPositions.push(itemTitle);
        }

        const standardPositions = rawPositions.filter((p) => POSITION_OPTIONS.includes(p));
        const customPositions = rawPositions.filter((p) => !POSITION_OPTIONS.includes(p) && p.trim());
        if (customPositions.length > 0) {
          setOtherPositionChecked(true);
          setOtherPositionText(customPositions.join(', '));
        } else {
          setOtherPositionChecked(false);
          setOtherPositionText('');
        }

        const hasData = Boolean(
          name ||
          u?.email ||
          getVal('phone', 'phone_number') ||
          gradYear ||
          organisation ||
          designation ||
          totalExp ||
          currLoc ||
          resumeLink ||
          refSource ||
          rawTechStacks.length > 0 ||
          rawPositions.length > 0
        );

        setHasStoredData(hasData);

        let initialRefSource = refSource;
        if (refSource && !REFERRAL_OPTIONS.slice(0, 4).includes(refSource)) {
          initialRefSource = 'Other';
          setOtherReferralText(refSource);
        } else {
          setOtherReferralText('');
        }

        setFormData({
          full_name: name || '',
          email: getVal('email') || u?.email || '',
          phone: getVal('phone', 'phone_number'),
          graduation_year: gradYear,
          current_organisation: organisation,
          current_designation: designation,
          total_experience: totalExp,
          current_location: currLoc,
          preferred_location: prefLoc,
          resume_drive_link: resumeLink,
          referral_source: initialRefSource,
          referral_source_details: refDetails,
          tech_stacks: type === 'job' ? autoJobTechStacks : standardTechs,
          interested_positions: type === 'job' ? [autoJobPosition] : standardPositions,
          declaration_confirmed: Boolean(u?.declaration_confirmed ?? latestApp?.declaration_confirmed ?? false),
          batch: gradYear,
          location: currLoc,
          resume_url: resumeLink,
        });
      } catch (err) {
        console.error('Failed to load profile for application modal:', err);
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, itemTitle, type]);

  const handleChange = (field: keyof ApplicationProfileData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'graduation_year' ? { batch: value } : {}),
      ...(field === 'current_location' ? { location: value } : {}),
      ...(field === 'resume_drive_link' ? { resume_url: value } : {}),
    }));
  };

  const handleReferralChange = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      referral_source: option,
    }));
    if (option !== 'Other') {
      setOtherReferralText('');
    }
  };

  const toggleTechStack = (tech: string) => {
    setFormData((prev) => {
      const exists = prev.tech_stacks.includes(tech);
      const updated = exists ? prev.tech_stacks.filter((t) => t !== tech) : [...prev.tech_stacks, tech];
      return { ...prev, tech_stacks: updated };
    });
  };

  const togglePosition = (pos: string) => {
    setFormData((prev) => {
      const exists = prev.interested_positions.includes(pos);
      const updated = exists ? prev.interested_positions.filter((p) => p !== pos) : [...prev.interested_positions, pos];
      return { ...prev, interested_positions: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Full name validation
    if (!formData.full_name.trim()) {
      setError('Candidate Full Name is required.');
      return;
    }
    // 2. Email validation
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('A valid Candidate Mail ID is required.');
      return;
    }
    // 3. Phone validation
    if (!formData.phone.trim()) {
      setError('Candidate Phone Number is required.');
      return;
    }
    // 7. Total experience validation
    if (!formData.total_experience.trim()) {
      setError('Total Years of Experience is required.');
      return;
    }
    // 8. Current location validation
    if (!formData.current_location.trim()) {
      setError('Current Location is required.');
      return;
    }
    // 9. Preferred work location validation
    if (!formData.preferred_location.trim()) {
      setError('Preferred Work Location is required.');
      return;
    }
    // 10. Resume Document validation
    if (!resumeUrl && !resumeFile && !formData.resume_drive_link.trim()) {
      setError('Please upload your Resume document (.pdf, .doc, or .docx).');
      return;
    }
    // 11. Referral source validation
    const resolvedReferralSource =
      formData.referral_source === 'Other' ? otherReferralText.trim() : formData.referral_source.trim();

    if (!resolvedReferralSource) {
      setError('Please select or specify a Referral Source.');
      return;
    }
    // 12. Referral source details validation
    if (!formData.referral_source_details.trim()) {
      setError('Please give details of the Referral source.');
      return;
    }

    // 13. Tech stacks validation
    const finalTechStacks = type === 'job'
      ? (formData.tech_stacks.length > 0 ? formData.tech_stacks : autoJobTechStacks)
      : [...formData.tech_stacks];

    if (type !== 'job' && otherTechStackChecked && otherTechStackText.trim()) {
      otherTechStackText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => {
          if (!finalTechStacks.includes(s)) finalTechStacks.push(s);
        });
    }
    if (finalTechStacks.length === 0) {
      setError('Please select at least one Tech Stack you are interested in.');
      return;
    }

    // 14. Positions validation
    const finalPositions = type === 'job'
      ? (formData.interested_positions.length > 0 ? formData.interested_positions : [autoJobPosition])
      : [...formData.interested_positions];

    if (type !== 'job' && otherPositionChecked && otherPositionText.trim()) {
      otherPositionText
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p) => {
          if (!finalPositions.includes(p)) finalPositions.push(p);
        });
    }
    if (finalPositions.length === 0) {
      setError('Please select at least one Position you are interested to apply for.');
      return;
    }

    // 15. Declaration confirmation validation
    if (!formData.declaration_confirmed) {
      setError('Please confirm the Declaration by selecting "Agree".');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const submissionData: ApplicationProfileData = {
      ...formData,
      referral_source: resolvedReferralSource,
      tech_stacks: finalTechStacks,
      interested_positions: finalPositions,
      declaration_confirmed: true,
      batch: formData.graduation_year,
      resume_drive_link: (formData.resume_drive_link && (formData.resume_drive_link.startsWith('http://') || formData.resume_drive_link.startsWith('https://')) && !formData.resume_drive_link.startsWith('data:') && !formData.resume_drive_link.toLowerCase().endsWith('.pdf')) ? formData.resume_drive_link : '',
      resume_url: resumeUrl || ((formData.resume_drive_link && (formData.resume_drive_link.startsWith('http://') || formData.resume_drive_link.startsWith('https://'))) ? formData.resume_drive_link : ''),
      resume_name: resumeName || (resumeFile ? resumeFile.name : 'Resume.pdf'),
    };

    try {
      // 1. Save / persist user candidate profile to MongoDB
      try {
        await usersApi.updateProfile({
          full_name: submissionData.full_name,
          phone: submissionData.phone,
          graduation_year: submissionData.graduation_year,
          batch: submissionData.graduation_year,
          current_organisation: submissionData.current_organisation,
          current_company: submissionData.current_organisation,
          current_designation: submissionData.current_designation,
          title: submissionData.current_designation,
          total_experience: submissionData.total_experience,
          current_location: submissionData.current_location,
          location: submissionData.current_location,
          preferred_location: submissionData.preferred_location,
          resume_drive_link: submissionData.resume_drive_link,
          resume_url: submissionData.resume_url,
          resume_name: submissionData.resume_name,
          referral_source: submissionData.referral_source,
          referral_source_details: submissionData.referral_source_details,
          college: submissionData.referral_source_details,
          tech_stacks: submissionData.tech_stacks,
          interested_positions: submissionData.interested_positions,
          declaration_confirmed: true,
        });
      } catch (profileErr) {
        console.warn('Profile sync fallback:', profileErr);
      }

      // Also sync user in localStorage so top-right user name and local info reflect any edit
      try {
        const localUser = getUser();
        if (localUser) {
          localStorage.setItem('user', JSON.stringify({
            ...localUser,
            full_name: submissionData.full_name || (localUser as any).full_name,
            phone: submissionData.phone || (localUser as any).phone,
            location: submissionData.current_location || (localUser as any).location,
            batch: submissionData.graduation_year || (localUser as any).batch,
          }));
        }
      } catch (e) {
        // Ignore local storage error
      }

      // 2. Execute target action (apply job / register event / enroll course)
      await onSubmit(submissionData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionText =
    type === 'job' ? 'Submit Job Application' : type === 'event' ? 'Confirm Event Registration' : 'Complete Enrollment';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#ffffff',
                zIndex: 20,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--primary, #c8102e)',
                    background: '#fff1f2',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'inline-block',
                    marginBottom: '4px',
                  }}
                >
                  {type === 'job' ? 'Job Application' : type === 'event' ? 'Event Registration' : 'Course Enrollment'}
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {itemTitle}
                </h2>
                {itemSubtitle && (
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    {itemSubtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.2s',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Auto-fill Notification Badge */}
            {hasStoredData && !loadingProfile && (
              <div
                style={{
                  margin: '16px 28px 0',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#15803d',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={16} color="#16a34a" />
                <span>Pre-filled from your profile — you can update any detail below.</span>
              </div>
            )}

            {loadingProfile ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '3px solid #e2e8f0',
                    borderTop: '3px solid var(--primary, #c8102e)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px',
                  }}
                />
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Loading your details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {error && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {/* ── SECTION 1: CANDIDATE DETAILS ── */}
                <div>
                  <h3
                    style={{
                      margin: '0 0 20px',
                      fontSize: '19px',
                      fontWeight: 800,
                      color: '#0f172a',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Candidate Details
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {/* 1. Candidate Full Name * */}
                    <div>
                      <label style={labelStyle}>
                        1. Candidate Full Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        value={formData.full_name}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>

                    {/* 2. Candidate Mail ID * */}
                    <div>
                      <label style={labelStyle}>
                        2. Candidate Mail ID <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your answer"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>

                    {/* 3. Candidate Phone Number * */}
                    <div>
                      <label style={labelStyle}>
                        3. Candidate Phone Number <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter your answer"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>

                    {/* 4. Year of Graduation */}
                    <div>
                      <label style={labelStyle}>4. Year of Graduation</label>
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        value={formData.graduation_year}
                        onChange={(e) => handleChange('graduation_year', e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* 5. Current Organisation */}
                    <div>
                      <label style={labelStyle}>5. Current Organisation</label>
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        value={formData.current_organisation}
                        onChange={(e) => handleChange('current_organisation', e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* 6. Current Designation */}
                    <div>
                      <label style={labelStyle}>6. Current Designation</label>
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        value={formData.current_designation}
                        onChange={(e) => handleChange('current_designation', e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* 7. Total Years of Experience * */}
                    <div>
                      <label style={labelStyle}>
                        7. Total Years of Experience <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        value={formData.total_experience}
                        onChange={(e) => handleChange('total_experience', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>

                    {/* 8. Current Location * */}
                    <div>
                      <label style={labelStyle}>
                        8. Current Location <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        value={formData.current_location}
                        onChange={(e) => handleChange('current_location', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>

                    {/* 9. Preferred Work Location * */}
                    <div>
                      <label style={labelStyle}>
                        9. Preferred Work Location <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        value={formData.preferred_location}
                        onChange={(e) => handleChange('preferred_location', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>

                    {/* 10. Resume Document Upload * */}
                    <div>
                      <label style={labelStyle}>
                        10. Resume / CV Document <span style={{ color: '#ef4444' }}>*</span>
                      </label>

                      {resumeName || resumeFile ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 20px',
                          borderRadius: '14px',
                          border: '1.5px solid #cbd5e1',
                          background: '#f8fafc',
                          gap: '12px',
                          boxSizing: 'border-box',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '10px',
                              background: resumeName.toLowerCase().endsWith('.docx') || resumeName.toLowerCase().endsWith('.doc') 
                                ? 'rgba(37, 99, 235, 0.1)' 
                                : 'rgba(200, 16, 46, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <FileText size={22} color={
                                resumeName.toLowerCase().endsWith('.docx') || resumeName.toLowerCase().endsWith('.doc') 
                                  ? '#2563eb' 
                                  : '#c8102e'
                              } />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <span style={{ 
                                fontSize: '14px', 
                                fontWeight: 700, 
                                color: '#0f172a', 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis' 
                              }}>
                                {resumeName}
                              </span>
                              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                                {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB • Ready to submit` : 'Attached Document • Ready to submit'}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {(resumeFile || (resumeUrl && (resumeUrl.startsWith('data:application/pdf') || resumeName.toLowerCase().endsWith('.pdf')))) && (
                              <button
                                type="button"
                                onClick={handlePreviewResume}
                                style={{
                                  cursor: 'pointer',
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: '#1d4ed8',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                title="View / Preview inserted PDF"
                              >
                                <Eye size={14} /> View PDF
                              </button>
                            )}
                            <label style={{
                              cursor: 'pointer',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <Upload size={14} /> Replace
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleResumeFileChange}
                                style={{ display: 'none' }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={handleRemoveResume}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '6px',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Remove document"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '28px 20px',
                          borderRadius: '16px',
                          border: '2px dashed #cbd5e1',
                          background: '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#1a2652';
                          e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                        >
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(26, 38, 82, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1a2652',
                            marginBottom: '12px'
                          }}>
                            <Upload size={22} />
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                            Click to browse or drag & drop your Resume
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            Accepted formats: PDF, DOC, DOCX (Max 10 MB)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleResumeFileChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                        Upload your updated resume or curriculum vitae as a PDF or Word document (.pdf, .doc, .docx).
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── SECTION 2: REFERRAL DETAILS ── */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <h3
                    style={{
                      margin: '0 0 20px',
                      fontSize: '19px',
                      fontWeight: 800,
                      color: '#0f172a',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Referral Details
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* 11. Referral Source * */}
                    <div>
                      <label style={labelStyle}>
                        11. Referral Source <span style={{ color: '#ef4444' }}>*</span>
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                        {REFERRAL_OPTIONS.map((opt) => (
                          <label
                            key={opt}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              cursor: 'pointer',
                              padding: '8px 4px',
                              borderRadius: '8px',
                              transition: 'background 0.2s',
                              fontSize: '14.5px',
                              color: '#334155',
                              fontWeight: 500,
                            }}
                          >
                            <input
                              type="radio"
                              name="referral_source"
                              value={opt}
                              checked={formData.referral_source === opt}
                              onChange={() => handleReferralChange(opt)}
                              style={{
                                width: '18px',
                                height: '18px',
                                accentColor: 'var(--primary, #c8102e)',
                                cursor: 'pointer',
                              }}
                            />
                            {opt === 'Other' ? (
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Other</span>
                                {formData.referral_source === 'Other' && (
                                  <input
                                    type="text"
                                    placeholder="Please specify"
                                    value={otherReferralText}
                                    onChange={(e) => setOtherReferralText(e.target.value)}
                                    style={{
                                      ...inputStyle,
                                      padding: '8px 12px',
                                      fontSize: '13.5px',
                                      flex: 1,
                                    }}
                                    autoFocus
                                    required
                                  />
                                )}
                              </div>
                            ) : (
                              <span>{opt}</span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 12. Give details of the Referral source * */}
                    <div>
                      <label style={labelStyle}>
                        12. Give details of the Referral source (Name of the college/Industry Event){' '}
                        <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        value={formData.referral_source_details}
                        onChange={(e) => handleChange('referral_source_details', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION 3: TECH STACKS & POSITIONS INTERESTED ── */}
                <div style={{ paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* 13. Mention the Tech Stacks interested to apply: */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>
                          13. Mention the Tech Stacks interested to apply: <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        {type === 'job' && (
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            color: '#059669', 
                            background: '#ecfdf5', 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '5px',
                            border: '1px solid #a7f3d0'
                          }}>
                            <CheckCircle2 size={13} /> Auto-fetched from Job
                          </span>
                        )}
                      </div>

                      {type === 'job' ? (
                        <div style={{
                          background: '#f8fafc',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '16px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {autoJobTechStacks.map((stack: string, idx: number) => (
                              <span
                                key={idx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 14px',
                                  borderRadius: '10px',
                                  background: '#fff',
                                  color: '#1e293b',
                                  border: '1.5px solid #cbd5e1',
                                  fontWeight: 700,
                                  fontSize: '13.5px',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                                }}
                              >
                                <Sparkles size={13} color="#2563eb" />
                                {stack}
                              </span>
                            ))}
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                            Required tech stacks automatically mapped from the <strong>{autoJobPosition}</strong> specifications.
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                          {TECH_STACK_OPTIONS.map((stack) => {
                            const isChecked = formData.tech_stacks.includes(stack);
                            return (
                              <label
                                key={stack}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  cursor: 'pointer',
                                  padding: '8px 6px',
                                  borderRadius: '8px',
                                  fontSize: '14.5px',
                                  color: '#334155',
                                  fontWeight: 500,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleTechStack(stack)}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    accentColor: 'var(--primary, #c8102e)',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                  }}
                                />
                                <span>{stack}</span>
                              </label>
                            );
                          })}

                          {/* Other Stack option */}
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              cursor: 'pointer',
                              padding: '8px 6px',
                              borderRadius: '8px',
                              fontSize: '14.5px',
                              color: '#334155',
                              fontWeight: 500,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={otherTechStackChecked}
                              onChange={(e) => setOtherTechStackChecked(e.target.checked)}
                              style={{
                                width: '18px',
                                height: '18px',
                                accentColor: 'var(--primary, #c8102e)',
                                cursor: 'pointer',
                                borderRadius: '4px',
                              }}
                            />
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>Other</span>
                              {otherTechStackChecked && (
                                <input
                                  type="text"
                                  placeholder="Specify tech stacks (comma separated)"
                                  value={otherTechStackText}
                                  onChange={(e) => setOtherTechStackText(e.target.value)}
                                  style={{
                                    ...inputStyle,
                                    padding: '8px 12px',
                                    fontSize: '13.5px',
                                    flex: 1,
                                  }}
                                  autoFocus
                                />
                              )}
                            </div>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* 14. Interested to apply for the selected positions in NeST: */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>
                          14. Interested to apply for the selected positions in NeST:{' '}
                          <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        {type === 'job' && (
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            color: '#059669', 
                            background: '#ecfdf5', 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '5px',
                            border: '1px solid #a7f3d0'
                          }}>
                            <CheckCircle2 size={13} /> Auto-fetched from Job
                          </span>
                        )}
                      </div>

                      {type === 'job' ? (
                        <input
                          type="text"
                          readOnly
                          value={autoJobPosition}
                          style={{
                            ...inputStyle,
                            background: '#f8fafc',
                            color: '#0f172a',
                            fontWeight: 600,
                            cursor: 'default'
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                          {POSITION_OPTIONS.map((position) => {
                            const isChecked = formData.interested_positions.includes(position);
                            return (
                              <label
                                key={position}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  cursor: 'pointer',
                                  padding: '8px 6px',
                                  borderRadius: '8px',
                                  fontSize: '14.5px',
                                  color: '#334155',
                                  fontWeight: 500,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePosition(position)}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    accentColor: 'var(--primary, #c8102e)',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                  }}
                                />
                                <span>{position}</span>
                              </label>
                            );
                          })}

                          {/* Other Position option */}
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              cursor: 'pointer',
                              padding: '8px 6px',
                              borderRadius: '8px',
                              fontSize: '14.5px',
                              color: '#334155',
                              fontWeight: 500,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={otherPositionChecked}
                              onChange={(e) => setOtherPositionChecked(e.target.checked)}
                              style={{
                                width: '18px',
                                height: '18px',
                                accentColor: 'var(--primary, #c8102e)',
                                cursor: 'pointer',
                                borderRadius: '4px',
                              }}
                            />
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>Other</span>
                              {otherPositionChecked && (
                                <input
                                  type="text"
                                  placeholder="Specify position(s)"
                                  value={otherPositionText}
                                  onChange={(e) => setOtherPositionText(e.target.value)}
                                  style={{
                                    ...inputStyle,
                                    padding: '8px 12px',
                                    fontSize: '13.5px',
                                    flex: 1,
                                  }}
                                  autoFocus
                                />
                              )}
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── SECTION 4: DECLARATION ── */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <h3
                    style={{
                      margin: '0 0 16px',
                      fontSize: '19px',
                      fontWeight: 800,
                      color: '#0f172a',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Declaration
                  </h3>

                  <div>
                    <label style={{ ...labelStyle, marginBottom: '12px' }}>
                      15. I confirm that: <span style={{ color: '#ef4444' }}>*</span>
                    </label>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '16px',
                      }}
                    >
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: '20px',
                          color: '#334155',
                          fontSize: '14px',
                          lineHeight: '1.8',
                        }}
                      >
                        <li>The information provided is true to the best of my knowledge.</li>
                        <li>I have obtained the candidate's consent before sharing their profile.</li>
                        <li>The candidate is aware of this referral and interested in pursuing opportunities with the organization.</li>
                      </ul>
                    </div>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '8px 4px',
                        fontSize: '15px',
                        color: '#0f172a',
                        fontWeight: 700,
                      }}
                    >
                      <input
                        type="radio"
                        name="declaration_confirmed"
                        checked={formData.declaration_confirmed === true}
                        onChange={() => handleChange('declaration_confirmed', true)}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: 'var(--primary, #c8102e)',
                          cursor: 'pointer',
                        }}
                        required
                      />
                      <span>Agree</span>
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '14px',
                    paddingTop: '20px',
                    borderTop: '1px solid #f1f5f9',
                    marginTop: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '12px 28px',
                      borderRadius: '12px',
                      background: 'var(--primary, #c8102e)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 750,
                      fontSize: '14px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(200, 16, 46, 0.25)',
                      transition: 'all 0.2s',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid #ffffff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                          }}
                        />
                        Saving & Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        {actionText}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14.5px',
  fontWeight: 650,
  color: '#1e293b',
  marginBottom: '8px',
  lineHeight: 1.4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '14px',
  color: '#0f172a',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, background 0.2s',
  boxSizing: 'border-box',
};

export default ApplicationFormModal;
