import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Search, Filter, Users, Send, CheckCircle2,
  AlertCircle, X, ChevronRight, ChevronDown, Eye, Code, BookOpen, Clock
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

const RecruiterMail: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [searchParams, setSearchParams] = useState({ skill: '', course: '', specialization: '' });
  const [filters, setFilters] = useState<{ specializations: string[], courses: string[], skills: string[] }>({ specializations: [], courses: [], skills: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [mailContent, setMailContent] = useState({ subject: '', body: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  useEffect(() => {
    handleSearch();
    loadFilters();
  }, []);

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
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ padding: '10px', background: 'rgba(200, 16, 46, 0.1)', borderRadius: '12px', color: nestRed }}>
            <Mail size={24} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
            Talent <span style={{ color: nestNavy }}>Mailing</span>
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Filter the target audience and send personalized HTML/Rich-Text emails.</p>
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

              {/* Course Dropdown */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' }}>Filter by Course</label>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => setActiveDropdown(activeDropdown === 'course' ? null : 'course')}
                    style={{ 
                      width: '100%', padding: '14px 16px 14px 44px', borderRadius: '30px', 
                      border: '1px solid rgba(226, 232, 240, 0.8)', background: 'rgba(248, 250, 252, 0.7)', 
                      backdropFilter: 'blur(8px)', fontSize: '14px', cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: searchParams.course ? nestNavy : '#1e293b', fontWeight: 500, transition: 'all 0.3s'
                    }}
                  >
                    <BookOpen size={16} style={{ position: 'absolute', left: '16px', color: nestNavy }} />
                    <span>{searchParams.course || 'All Courses'}</span>
                    <ChevronDown size={14} style={{ color: nestRed, transform: activeDropdown === 'course' ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }} />
                  </div>

                  <AnimatePresence>
                    {activeDropdown === 'course' && (
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
                          onClick={() => { setSearchParams({ ...searchParams, course: '' }); setActiveDropdown(null); }}
                          style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', transition: '0.2s', color: '#64748b' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          All Courses
                        </div>
                        {(filters.courses || []).map(c => (
                          <div 
                            key={c}
                            onClick={() => { setSearchParams({ ...searchParams, course: c }); setActiveDropdown(null); }}
                            style={{ 
                              padding: '10px 16px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', 
                              transition: '0.2s', background: searchParams.course === c ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
                              color: searchParams.course === c ? nestNavy : '#1e293b', fontWeight: searchParams.course === c ? 700 : 500
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = searchParams.course === c ? 'rgba(37, 99, 235, 0.05)' : 'transparent')}
                          >
                            {c}
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
    </div>
  );
};

export default RecruiterMail;
