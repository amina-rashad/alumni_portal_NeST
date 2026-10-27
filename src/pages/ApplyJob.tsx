import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Building2, MapPin, 
  Send, Sparkles, CheckCircle2, AlertCircle,
  Upload, FileText, X, Briefcase, Eye
} from 'lucide-react';
import { jobsApi, applicationsApi, usersApi } from '../services/api';
import StatusModal from '../components/StatusModal';
import { REFERRAL_OPTIONS } from '../components/ApplicationFormModal';

const ApplyJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasStoredData, setHasStoredData] = useState(false);

  const [formData, setFormData] = useState({
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
    tech_stacks: [] as string[],
    interested_positions: [] as string[],
    declaration_confirmed: false,
  });

  const [otherReferralText, setOtherReferralText] = useState('');
  const [otherTechStackChecked, setOtherTechStackChecked] = useState(false);
  const [otherTechStackText, setOtherTechStackText] = useState('');
  const [otherPositionChecked, setOtherPositionChecked] = useState(false);
  const [otherPositionText, setOtherPositionText] = useState('');

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState<string>('');
  const [resumeUrl, setResumeUrl] = useState<string>('');

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      setErrorMessage('Please upload a valid document in PDF, DOC, or DOCX format.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }

    setResumeFile(file);
    setResumeName(file.name);
    setErrorMessage('');

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

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    title: '',
    message: '',
    confirmText: 'Okay',
    showConfirmOnly: true,
    onConfirm: undefined as (() => void) | undefined,
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [jobRes, profileRes] = await Promise.all([
          jobsApi.getJobById(id),
          usersApi.getProfile(),
        ]);

        let apiJob: any = null;
        if (jobRes.success && jobRes.data && (jobRes.data as any).job) {
          apiJob = (jobRes.data as any).job;
          setJob(apiJob);

          if (apiJob.is_active === false) {
            setModalConfig({
              isOpen: true,
              type: 'warning',
              title: 'Job Closed',
              message: 'This position is no longer accepting applications.',
              confirmText: 'Back to Listings',
              showConfirmOnly: true,
              onConfirm: () => navigate('/jobs'),
            });
          }
        }

        if (profileRes.success && profileRes.data) {
          const u = (profileRes.data as any).user || (profileRes.data as any).profile || profileRes.data;
          const name = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim();
          const gradYear = u.graduation_year || u.batch || '';
          const organisation = u.current_organisation || u.current_company || '';
          const designation = u.current_designation || u.title || '';
          const totalExp = u.total_experience || '';
          const currLoc = u.current_location || u.location || '';
          const prefLoc = u.preferred_location || '';
          const resumeLink = u.resume_drive_link || u.resume_url || '';
          const savedResumeName = u.resume_name || (resumeLink ? (resumeLink.startsWith('data:') ? 'Attached_Resume.pdf' : resumeLink.split('/').pop() || 'Attached_Resume') : '');
          if (resumeLink) {
            setResumeUrl(resumeLink);
            setResumeName(savedResumeName);
          }
          const refSource = u.referral_source || '';
          const refDetails = u.referral_source_details || '';

          const jobSkills = (apiJob?.skills_required && apiJob.skills_required.length > 0)
            ? apiJob.skills_required
            : (apiJob?.skills && apiJob.skills.length > 0)
              ? apiJob.skills
              : (apiJob?.requirements && apiJob.requirements.length > 0)
                ? apiJob.requirements
                : [apiJob?.title || 'Software Engineering'];

          const jobTitle = apiJob?.title || 'Software Engineer';

          setFormData({
            full_name: name || '',
            email: u.email || '',
            phone: u.phone || u.phone_number || '',
            graduation_year: gradYear,
            current_organisation: organisation,
            current_designation: designation,
            total_experience: totalExp,
            current_location: currLoc,
            preferred_location: prefLoc,
            resume_drive_link: resumeLink,
            referral_source: refSource,
            referral_source_details: refDetails,
            tech_stacks: jobSkills,
            interested_positions: [jobTitle],
            declaration_confirmed: Boolean(u.declaration_confirmed),
          });
        }
      } catch (err) {
        console.error('Failed to load application data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Keep tech stacks and position automatically in sync with the job applying for
  useEffect(() => {
    if (job) {
      const skills = (Array.isArray(job.skills_required) && job.skills_required.length > 0)
        ? job.skills_required
        : (Array.isArray(job.skills) && job.skills.length > 0)
          ? job.skills
          : (Array.isArray(job.requirements) && job.requirements.length > 0)
            ? job.requirements
            : [job.title || 'Software Engineering'];

      setFormData(prev => ({
        ...prev,
        tech_stacks: skills,
        interested_positions: [job.title || 'Software Engineer']
      }));
    }
  }, [job]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReferralChange = (option: string) => {
    setFormData(prev => ({ ...prev, referral_source: option }));
    if (option !== 'Other') setOtherReferralText('');
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
    if (!id) return;

    if (!formData.full_name.trim()) {
      setErrorMessage('Candidate Full Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Candidate Mail ID is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Candidate Phone Number is required.');
      return;
    }
    if (!formData.total_experience.trim()) {
      setErrorMessage('Total Years of Experience is required.');
      return;
    }
    if (!formData.current_location.trim()) {
      setErrorMessage('Current Location is required.');
      return;
    }
    if (!formData.preferred_location.trim()) {
      setErrorMessage('Preferred Work Location is required.');
      return;
    }
    if (!resumeUrl && !resumeFile && !formData.resume_drive_link.trim()) {
      setErrorMessage('Please upload your Resume document (.pdf, .doc, or .docx).');
      return;
    }

    const resolvedReferralSource =
      formData.referral_source === 'Other'
        ? otherReferralText.trim()
        : formData.referral_source.trim();

    if (!resolvedReferralSource) {
      setErrorMessage('Please select or specify a Referral Source.');
      return;
    }
    if (!formData.referral_source_details.trim()) {
      setErrorMessage('Please provide details of the Referral Source.');
      return;
    }

    const finalTechStacks = (formData.tech_stacks && formData.tech_stacks.length > 0)
      ? formData.tech_stacks
      : ((job?.skills_required && job.skills_required.length > 0) 
          ? job.skills_required 
          : (job?.skills && job.skills.length > 0) 
            ? job.skills 
            : [job?.title || 'Software Engineering']);

    const finalPositions = (formData.interested_positions && formData.interested_positions.length > 0)
      ? formData.interested_positions
      : [job?.title || 'Software Engineer'];

    if (!formData.declaration_confirmed) {
      setErrorMessage('Please confirm the Declaration by selecting "Agree".');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload: any = {
        job_id: id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        graduation_year: formData.graduation_year,
        batch: formData.graduation_year,
        current_organisation: formData.current_organisation,
        current_company: formData.current_organisation,
        current_designation: formData.current_designation,
        title: formData.current_designation,
        total_experience: formData.total_experience,
        current_location: formData.current_location,
        location: formData.current_location,
        resume_drive_link: (formData.resume_drive_link && (formData.resume_drive_link.startsWith('http://') || formData.resume_drive_link.startsWith('https://')) && !formData.resume_drive_link.startsWith('data:') && !formData.resume_drive_link.toLowerCase().endsWith('.pdf')) ? formData.resume_drive_link : '',
        resume_url: resumeUrl || ((formData.resume_drive_link && (formData.resume_drive_link.startsWith('http://') || formData.resume_drive_link.startsWith('https://'))) ? formData.resume_drive_link : ''),
        resume_name: resumeName || (resumeFile ? resumeFile.name : 'Resume.pdf'),
        referral_source: resolvedReferralSource,
        referral_source_details: formData.referral_source_details,
        tech_stacks: finalTechStacks,
        interested_positions: finalPositions,
        declaration_confirmed: true,
      };

      const res = await applicationsApi.applyForJob(payload);

      if (res.success) {
        setModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Application Submitted!',
          message: 'Your candidate details have been saved and your application was submitted successfully.',
          confirmText: 'View Applications',
          showConfirmOnly: true,
          onConfirm: () => navigate('/applications'),
        });
      } else {
        throw new Error(res.message || 'Failed to submit application');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #c8102e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1rem', fontFamily: '"Inter", sans-serif' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#64748b',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1.5rem',
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {job && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#c8102e',
              background: '#fff1f2',
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'inline-block',
              marginBottom: '8px',
            }}
          >
            Applying for
          </span>
          <h1 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
            {job.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#64748b', fontSize: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} /> {job.company}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> {job.location}
            </span>
          </div>
        </div>
      )}

      {hasStoredData && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '12px 18px',
            borderRadius: '12px',
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
          <Sparkles size={18} color="#16a34a" />
          <span>Pre-filled with your saved profile. You can edit any details before submitting.</span>
        </div>
      )}

      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '28px 32px' }}>
          {errorMessage && (
            <div
              style={{
                marginBottom: '24px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* ── SECTION 1: CANDIDATE DETAILS ── */}
            <div>
              <h2 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                Candidate Details
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
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
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Upload your updated resume or curriculum vitae as a PDF or Word document (.pdf, .doc, .docx).
                  </p>
                </div>
              </div>
            </div>

            {/* ── SECTION 2: REFERRAL DETAILS ── */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                Referral Details
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
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
                          fontSize: '14.5px',
                          color: '#334155',
                        }}
                      >
                        <input
                          type="radio"
                          name="referral_source"
                          value={opt}
                          checked={formData.referral_source === opt}
                          onChange={() => handleReferralChange(opt)}
                          style={{ width: '18px', height: '18px', accentColor: '#c8102e' }}
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
                                style={{ ...inputStyle, padding: '8px 12px', flex: 1 }}
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

            {/* ── SECTION 3: TECH STACKS & POSITIONS (AUTO-FETCHED DIRECTLY FROM JOB) ── */}
            <div style={{ paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 13. Mention the Tech Stacks interested to apply: */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      13. Mention the Tech Stacks interested to apply: <span style={{ color: '#ef4444' }}>*</span>
                    </label>
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
                  </div>

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
                      {(formData.tech_stacks.length > 0 ? formData.tech_stacks : (job?.skills_required || job?.skills || [job?.title || 'Software Engineering'])).map((stack: string, idx: number) => (
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
                      Required tech stacks automatically mapped from the <strong>{job?.title || 'target job'}</strong> specifications.
                    </p>
                  </div>
                </div>

                {/* 14. Interested to apply for the selected positions in NeST: */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      14. Interested to apply for the selected positions in NeST: <span style={{ color: '#ef4444' }}>*</span>
                    </label>
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
                  </div>

                  <input
                    type="text"
                    readOnly
                    value={job?.title || (formData.interested_positions[0] || 'Selected Position')}
                    style={{
                      ...inputStyle,
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontWeight: 600,
                      cursor: 'default'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── SECTION 4: DECLARATION ── */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                Declaration
              </h2>

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
                      accentColor: '#c8102e',
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
              }}
            >
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '12px 32px',
                  borderRadius: '12px',
                  background: '#c8102e',
                  border: 'none',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(200, 16, 46, 0.25)',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                <Send size={16} />
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <StatusModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        showConfirmOnly={modalConfig.showConfirmOnly}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
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
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

export default ApplyJob;
