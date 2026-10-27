import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Search, Filter, Users, Send, CheckCircle2,
  AlertCircle, X, ChevronRight, ChevronDown, ChevronUp, Eye, Code, BookOpen, Clock, Briefcase, History, Loader2
} from 'lucide-react';
import { recruiterApi } from '../../services/api';

interface Talent {
  id: string;
  full_name: string;
  email: string;
  skills: string;
  specialization: string;
  user_type: string;
  selected?: boolean;
}

interface MailHistoryItem {
  id: string;
  subject: string;
  body: string;
  recipients: string[];
  recipient_count: number;
  sent_at: string;
  status: string;
}

const RecruiterMail: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [searchParams, setSearchParams] = useState({ skill: '', course: '', specialization: '', job_id: '' });
  const [filters, setFilters] = useState<{ specializations: string[], courses: string[], skills: string[] }>({ specializations: [], courses: [], skills: [] });
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [mailContent, setMailContent] = useState({ subject: '', body: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Email History state
  const [showHistory, setShowHistory] = useState(false);
  const [mailHistory, setMailHistory] = useState<MailHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [expandedMailId, setExpandedMailId] = useState<string | null>(null);

  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await recruiterApi.getMailHistory();
      if (res.success && res.data) {
        setMailHistory(res.data.history || []);
      }
    } catch (err) {
      console.error("Failed to load mail history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenHistory = () => {
    setShowHistory(true);
    fetchHistory();
  };

  useEffect(() => {
    handleSearch();
    loadFilters();
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await recruiterApi.getMyJobs();
      if (res.success && res.data) {
        const activeJobs = (res.data.jobs || []).filter((j: any) => j.is_active !== false);
        setAvailableJobs(activeJobs);
      }
    } catch (err) {
      console.error("Failed to load jobs", err);
    }
  };

  const loadFilters = async () => {
    try {
      const res = await recruiterApi.getTalentFilters();
      if (res.success && res.data) {
        setFilters({
          specializations: res.data.specializations || [],
          courses: res.data.courses || [],
          skills: res.data.skills || []
        });
      }
    } catch (err) {
      console.error("Failed to load filters", err);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const res = await recruiterApi.searchTalents(searchParams);
      if (res.success && res.data) {
        setTalents(res.data.talents.map(t => ({ ...t, selected: false })));
      }
    } catch (err) {
      console.error("Failed to search talents", err);
      setStatus({ type: 'error', message: 'Failed to fetch talents. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === talents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(talents.map(t => t.id)));
    }
  };

  const handleSendMail = async () => {
    if (selectedIds.size === 0) {
      setStatus({ type: 'error', message: 'Please select at least one recipient.' });
      return;
    }
    if (!mailContent.subject || !mailContent.body) {
      setStatus({ type: 'error', message: 'Subject and Body are required.' });
      return;
    }

    setIsSending(true);
    try {
      const recipients = talents
        .filter(t => selectedIds.has(t.id))
        .map(t => t.email);

      const res = await recruiterApi.sendBroadcastMail({
        recipients,
        subject: mailContent.subject,
        body: mailContent.body
      });

      if (res.success) {
        setStatus({ type: 'success', message: res.message || 'Emails sent successfully!' });
        setMailContent({ subject: '', body: '' });
        setSelectedIds(new Set());
        fetchHistory();
      } else {
        setStatus({ type: 'error', message: res.message || 'Failed to send emails.' });
      }
    } catch (err) {
      console.error("Mail error", err);
      setStatus({ type: 'error', message: 'An error occurred while sending emails.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <header style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '10px', background: 'rgba(200, 16, 46, 0.1)', borderRadius: '12px', color: nestRed }}>
              <Mail size={24} />
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
              Talent <span style={{ color: nestNavy }}>Mailing</span>
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Filter the target audience and send personalized HTML/Rich-Text emails.</p>
        </div>

        <button
          onClick={handleOpenHistory}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: nestNavy,
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(26, 38, 82, 0.05)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <History size={17} color={nestNavy} />
          History
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '32px', alignItems: 'start' }}>

        {/* Left Column: Filter & Talent List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Search Card */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
              <Filter size={18} color={nestNavy} /> Filter Audience
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Skill Dropdown */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' }}>Search by Skill</label>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => setActiveDropdown(activeDropdown === 'skill' ? null : 'skill')}
                    style={{ 
                      width: '100%', padding: '14px 16px 14px 44px', borderRadius: '30px', 
                      border: '1px solid rgba(226, 232, 240, 0.8)', background: 'rgba(248, 250, 252, 0.7)', 
                      backdropFilter: 'blur(8px)', fontSize: '14px', cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: searchParams.skill ? nestNavy : '#1e293b', fontWeight: 500, transition: 'all 0.3s'
                    }}
                  >
                    <Code size={16} style={{ position: 'absolute', left: '16px', color: nestNavy }} />
                    <span>{searchParams.skill || 'All Skills'}</span>
                    <ChevronDown size={14} style={{ color: nestRed, transform: activeDropdown === 'skill' ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }} />
                  </div>

                  <AnimatePresence>
                    {activeDropdown === 'skill' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        style={{ 
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)',
                          borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                          maxHeight: '200px', overflowY: 'auto', padding: '8px'
                        }}
                      >
                        <div 
                          onClick={() => { setSearchParams({ ...searchParams, skill: '' }); setActiveDropdown(null); }}
                          style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', transition: '0.2s', color: '#64748b' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          All Skills
                        </div>
                        {(filters.skills || []).map(s => (
                          <div 
                            key={s}
                            onClick={() => { setSearchParams({ ...searchParams, skill: s }); setActiveDropdown(null); }}
                            style={{ 
                              padding: '10px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', 
                              transition: '0.2s', background: searchParams.skill === s ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
                              color: searchParams.skill === s ? nestNavy : '#1e293b', fontWeight: searchParams.skill === s ? 700 : 500
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = searchParams.skill === s ? 'rgba(37, 99, 235, 0.05)' : 'transparent')}
                          >
                            {s}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Specialization Dropdown */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' }}>Filter by Specialization</label>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => setActiveDropdown(activeDropdown === 'spec' ? null : 'spec')}
                    style={{ 
                      width: '100%', padding: '14px 16px 14px 44px', borderRadius: '30px', 
                      border: '1px solid rgba(226, 232, 240, 0.8)', background: 'rgba(248, 250, 252, 0.7)', 
                      backdropFilter: 'blur(8px)', fontSize: '14px', cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: searchParams.specialization ? nestNavy : '#1e293b', fontWeight: 500, transition: 'all 0.3s'
                    }}
                  >
                    <BookOpen size={16} style={{ position: 'absolute', left: '16px', color: nestNavy }} />
                    <span>{searchParams.specialization || 'All Specializations'}</span>
                    <ChevronDown size={14} style={{ color: nestRed, transform: activeDropdown === 'spec' ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }} />
                  </div>

                  <AnimatePresence>
                    {activeDropdown === 'spec' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        style={{ 
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)',
                          borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                          maxHeight: '200px', overflowY: 'auto', padding: '8px'
                        }}
                      >
                        <div 
                          onClick={() => { setSearchParams({ ...searchParams, specialization: '' }); setActiveDropdown(null); }}
                          style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', transition: '0.2s', color: '#64748b' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          All Specializations
                        </div>
                        {(filters.specializations || []).map(s => (
                          <div 
                            key={s}
                            onClick={() => { setSearchParams({ ...searchParams, specialization: s }); setActiveDropdown(null); }}
                            style={{ 
                              padding: '10px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', 
                              transition: '0.2s', background: searchParams.specialization === s ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
                              color: searchParams.specialization === s ? nestNavy : '#1e293b', fontWeight: searchParams.specialization === s ? 700 : 500
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = searchParams.specialization === s ? 'rgba(37, 99, 235, 0.05)' : 'transparent')}
                          >
                            {s}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Job Role Dropdown */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' }}>Filter by Job Role</label>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => setActiveDropdown(activeDropdown === 'job' ? null : 'job')}
                    style={{ 
                      width: '100%', padding: '14px 16px 14px 44px', borderRadius: '30px', 
                      border: '1px solid rgba(226, 232, 240, 0.8)', background: 'rgba(248, 250, 252, 0.7)', 
                      backdropFilter: 'blur(8px)', fontSize: '14px', cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: searchParams.job_id ? nestNavy : '#1e293b', fontWeight: 500, transition: 'all 0.3s'
                    }}
                  >
                    <Briefcase size={16} style={{ position: 'absolute', left: '16px', color: nestNavy }} />
                    <span>{availableJobs.find(j => j.id === searchParams.job_id)?.title || 'All Job Roles'}</span>
                    <ChevronDown size={14} style={{ color: nestRed, transform: activeDropdown === 'job' ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }} />
                  </div>

                  <AnimatePresence>
                    {activeDropdown === 'job' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        style={{ 
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)',
                          borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                          maxHeight: '200px', overflowY: 'auto', padding: '8px'
                        }}
                      >
                        <div 
                          onClick={() => { setSearchParams({ ...searchParams, job_id: '' }); setActiveDropdown(null); }}
                          style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', transition: '0.2s', color: '#64748b' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          All Job Roles
                        </div>
                        {(availableJobs || []).map(j => (
                          <div 
                            key={j.id}
                            onClick={() => { setSearchParams({ ...searchParams, job_id: j.id }); setActiveDropdown(null); }}
                            style={{ 
                              padding: '10px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', 
                              transition: '0.2s', background: searchParams.job_id === j.id ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
                              color: searchParams.job_id === j.id ? nestNavy : '#1e293b', fontWeight: searchParams.job_id === j.id ? 700 : 500
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = searchParams.job_id === j.id ? 'rgba(37, 99, 235, 0.05)' : 'transparent')}
                          >
                            {j.title}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button 
                onClick={handleSearch}
                disabled={isLoading}
                style={{ 
                  marginTop: '12px', width: '100%', padding: '16px', borderRadius: '30px', background: `linear-gradient(135deg, ${nestNavy} 0%, #2a3a7a 100%)`, 
                  color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.3s',
                  boxShadow: '0 10px 20px rgba(26, 38, 82, 0.15)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {isLoading ? 'Searching...' : <><Search size={18} /> Refresh Talents</>}
              </button>
            </div>
          </div>

          {/* Results Card */}
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>
                {talents.length} Talents Found
              </span>
              {talents.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  style={{ background: 'none', border: 'none', color: nestRed, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {selectedIds.size === talents.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {talents.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Clock size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    </motion.div>
                  ) : (
                    <Users size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  )}
                  <p style={{ fontSize: '14px', margin: 0 }}>
                    {isLoading ? 'Searching for talents...' : 'No talents found matching your criteria. Try clearing filters.'}
                  </p>
                </div>
              ) : (
                talents.map((talent) => (
                  <div
                    key={talent.id}
                    onClick={() => toggleSelect(talent.id)}
                    style={{
                      padding: '16px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                      background: selectedIds.has(talent.id) ? 'rgba(200, 16, 46, 0.03)' : 'transparent',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${selectedIds.has(talent.id) ? nestRed : '#cbd5e1'}`,
                      background: selectedIds.has(talent.id) ? nestRed : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {selectedIds.has(talent.id) && <CheckCircle2 size={12} color="#fff" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{talent.full_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{talent.specialization} • {talent.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Compose Mail */}
        <div style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Compose Broadcast</h3>
              <span style={{ fontSize: '12px', background: 'rgba(26, 38, 82, 0.05)', color: nestNavy, padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                {selectedIds.size} Recipients Selected
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowPreview(!showPreview)}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {showPreview ? <><Clock size={16} /> Edit</> : <><Eye size={16} /> Preview</>}
              </button>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            <AnimatePresence mode="wait">
              {showPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  style={{ minHeight: '400px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}
                >
                  <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Subject</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{mailContent.subject || '(No Subject)'}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Body Preview</div>
                  <div
                    style={{ fontSize: '15px', color: '#334155', lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: mailContent.body || '<p style="color: #94a3b8">Mail body is empty...</p>' }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Email Subject</label>
                      <input
                        type="text"
                        placeholder="e.g. Exciting Job Opportunity at NeST Digital"
                        value={mailContent.subject}
                        onChange={(e) => setMailContent({ ...mailContent, subject: e.target.value })}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', outline: 'none', fontWeight: 600, color: '#000000' }}
                      />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Email Body (HTML Supported)</label>
                      <div style={{ fontSize: '11px', color: nestRed, fontWeight: 700 }}>Rich Text / HTML Mode</div>
                    </div>
                    <textarea
                      rows={12}
                      placeholder="Hello, We are impressed with your profile..."
                      value={mailContent.body}
                      onChange={(e) => setMailContent({ ...mailContent, body: e.target.value })}
                      style={{
                        width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0',
                        background: '#f8fafc', fontSize: '15px', outline: 'none', resize: 'none',
                        fontFamily: "'Courier New', monospace", lineHeight: 1.6, color: '#000000'
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {status && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700,
                    color: status.type === 'success' ? '#10b981' : '#ef4444'
                  }}
                >
                  {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {status.message}
                </motion.div>
              )}
            </div>

            <button
              onClick={handleSendMail}
              disabled={isSending || selectedIds.size === 0}
              title={selectedIds.size === 0 ? "Select at least one recipient to send a broadcast" : ""}
              style={{
                background: (isSending || selectedIds.size === 0) ? '#cbd5e1' : nestRed,
                color: '#fff', padding: '14px 40px', borderRadius: '14px', border: 'none',
                cursor: (isSending || selectedIds.size === 0) ? 'not-allowed' : 'pointer',
                fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: (isSending || selectedIds.size === 0) ? 'none' : '0 10px 25px rgba(200, 16, 46, 0.25)',
                transition: 'all 0.3s'
              }}
            >
              {isSending ? 'Sending Broadcast...' : <><Send size={18} /> Send Email</>}
            </button>
          </div>
        </div>

      </div>

      <div style={{ paddingBottom: '100px' }} />

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(6px)',
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '100%',
                maxWidth: '820px',
                maxHeight: '85vh',
                background: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '24px 28px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(to right, #f8fafc, #ffffff)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(26, 38, 82, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: nestNavy
                  }}>
                    <History size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Sent Email History
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                      Review all talent acquisition broadcast emails that were sent
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
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
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search filter in modal */}
              <div style={{ padding: '16px 28px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Search size={16} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search sent emails by subject or recipient..."
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                  {historySearch && (
                    <button
                      onClick={() => setHistorySearch('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Body - List of Sent Emails */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                {loadingHistory ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#94a3b8' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: nestNavy, marginBottom: '12px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Loading email history...</span>
                  </div>
                ) : (() => {
                  const filtered = mailHistory.filter(item => {
                    if (!historySearch) return true;
                    const q = historySearch.toLowerCase();
                    const subMatch = (item.subject || '').toLowerCase().includes(q);
                    const recMatch = (item.recipients || []).some(r => r.toLowerCase().includes(q));
                    return subMatch || recMatch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px',
                          color: '#94a3b8'
                        }}>
                          <Mail size={28} />
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', margin: '0 0 6px' }}>
                          {historySearch ? 'No matching emails found' : 'No sent emails yet'}
                        </h3>
                        <p style={{ fontSize: '13px', margin: 0, maxWidth: '340px', marginInline: 'auto' }}>
                          {historySearch ? 'Try adjusting your search keyword' : 'Any broadcast email you compose and send will appear here with delivery details.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {filtered.map((item) => {
                        const isExpanded = expandedMailId === item.id;
                        const formattedDate = item.sent_at
                          ? new Date(item.sent_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recently';

                        return (
                          <div
                            key={item.id}
                            style={{
                              background: '#ffffff',
                              borderRadius: '16px',
                              border: '1px solid #e2e8f0',
                              padding: '18px 20px',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    color: '#059669',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <CheckCircle2 size={12} /> Delivered
                                  </span>
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#64748b',
                                    background: '#f1f5f9',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <Users size={12} /> {item.recipient_count || item.recipients?.length || 0} Recipient{(item.recipient_count || item.recipients?.length) === 1 ? '' : 's'}
                                  </span>
                                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                                    <Clock size={12} /> {formattedDate}
                                  </span>
                                </div>

                                <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                                  {item.subject}
                                </h4>

                                {/* Recipients list snippet */}
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                                  <strong style={{ color: '#334155' }}>To: </strong>
                                  {(item.recipients || []).slice(0, 3).join(', ')}
                                  {(item.recipients || []).length > 3 && ` +${item.recipients.length - 3} more`}
                                </div>

                                {/* Body preview or full */}
                                {isExpanded ? (
                                  <div style={{
                                    marginTop: '12px',
                                    padding: '14px',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid #edf2f7',
                                    fontSize: '13px',
                                    color: '#334155',
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                  }}>
                                    <div style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px dashed #cbd5e1' }}>
                                      <strong style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Recipient List:</strong>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                        {(item.recipients || []).map((em, idx) => (
                                          <span key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', color: '#475569' }}>
                                            {em}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <strong style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Content:</strong>
                                    <div style={{ marginTop: '4px' }}>{item.body}</div>
                                  </div>
                                ) : (
                                  <p style={{
                                    margin: 0,
                                    fontSize: '13px',
                                    color: '#64748b',
                                    lineHeight: 1.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}>
                                    {item.body}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setExpandedMailId(isExpanded ? null : item.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: nestNavy,
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 8px',
                                  borderRadius: '6px'
                                }}
                              >
                                {isExpanded ? (
                                  <>Hide Details <ChevronUp size={14} /></>
                                ) : (
                                  <>View Full Message <ChevronDown size={14} /></>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 28px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafbfc'
              }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                  Showing {mailHistory.length} sent broadcast{mailHistory.length === 1 ? '' : 's'}
                </span>
                <button
                  onClick={() => setShowHistory(false)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecruiterMail;
