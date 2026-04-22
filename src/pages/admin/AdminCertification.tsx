import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, GraduationCap, FileCheck, Search, Filter, Users, ChevronDown, Download } from 'lucide-react';

const AdminCertification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'iv' | 'intern' | 'alumni'>('iv');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');

  // Hardcoded Data
  const ivStudents = [
    { id: 1, name: 'Rahul Sharma', college: 'CET Trivandrum', course: 'B.Tech CS', batch: '2024-2026', date: '2024-03-15' },
    { id: 2, name: 'Anjali Desai', college: 'Model Engineering College', course: 'MCA', batch: '2024-2026', date: '2024-03-15' },
    { id: 3, name: 'Vivek Nair', college: 'Rajagiri School of Engineering', course: 'B.Tech IT', batch: '2024-2026', date: '2024-03-20' },
    { id: 4, name: 'Sneha KV', college: 'Muthoot Institute', course: 'M.Tech CSE', batch: '2024-2026', date: '2024-03-20' }
  ];

  const interns = [
    { id: 1, name: 'Arun Kumar', college: 'NSS College Palakkad', position: 'Frontend Developer Intern', duration: '3 Months' },
    { id: 2, name: 'Megha S', college: 'GEC Thrissur', position: 'Data Science Intern', duration: '6 Months' },
  ];

  const alumni = [
    { id: 1, name: 'Rohit Thomas', position: 'Software Engineer', joinDate: '2023-01-10', endDate: '2024-01-15' },
    { id: 2, name: 'Divya P', position: 'UI/UX Designer', joinDate: '2022-06-01', endDate: '2023-08-20' },
    { id: 3, name: 'Kiran Raj', position: 'Backend Developer', joinDate: '2021-03-15', endDate: '2023-11-30' },
  ];

  // Apply filters
  const filteredIv = ivStudents.filter(s => {
    const rawMatch = searchQuery.toLowerCase();
    const searchMatch = s.name.toLowerCase().includes(rawMatch) || s.college.toLowerCase().includes(rawMatch) || s.course.toLowerCase().includes(rawMatch);
    const collegeMatch = collegeFilter === 'All' || s.college === collegeFilter;
    const batchMatch = batchFilter === 'All' || s.batch === batchFilter;
    return searchMatch && collegeMatch && batchMatch;
  });

  const filteredInterns = interns.filter(s => {
    const rawMatch = searchQuery.toLowerCase();
    const searchMatch = s.name.toLowerCase().includes(rawMatch) || s.college.toLowerCase().includes(rawMatch) || s.position.toLowerCase().includes(rawMatch);
    return searchMatch;
  });

  const filteredAlumni = alumni.filter(s => {
    const rawMatch = searchQuery.toLowerCase();
    const searchMatch = s.name.toLowerCase().includes(rawMatch) || s.position.toLowerCase().includes(rawMatch);
    return searchMatch;
  });

  const uniqueColleges = Array.from(new Set(ivStudents.map(s => s.college)));
  const availableBatches = collegeFilter === 'All'
    ? Array.from(new Set(ivStudents.map(s => s.batch)))
    : Array.from(new Set(ivStudents.filter(s => s.college === collegeFilter).map(s => s.batch)));

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCollegeFilter(e.target.value);
    setBatchFilter('All');
  };

  return (
    <div className="admin-certification-container" style={{ paddingBottom: '40px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            color: '#1e293b', 
            marginBottom: '8px',
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '-0.01em'
          }}>
            Certification Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
            Generate and manage certificates for program completions.
          </p>
        </div>
      </div>

      {/* Horizontal Tabs Area */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '32px',
        padding: '6px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        border: '1px solid #e2e8f0'
      }}>
        <button
          onClick={() => setActiveTab('iv')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: activeTab === 'iv' ? '#1e293b' : 'transparent',
            color: activeTab === 'iv' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'iv' ? '0 8px 16px rgba(30, 41, 59, 0.2)' : 'none'
          }}
        >
          <School size={20} />
          IV Students
        </button>
        <button
          onClick={() => setActiveTab('intern')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: activeTab === 'intern' ? '#1e293b' : 'transparent',
            color: activeTab === 'intern' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'intern' ? '0 8px 16px rgba(30, 41, 59, 0.2)' : 'none'
          }}
        >
          <GraduationCap size={20} />
          Interns
        </button>
        <button
          onClick={() => setActiveTab('alumni')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: activeTab === 'alumni' ? '#1e293b' : 'transparent',
            color: activeTab === 'alumni' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'alumni' ? '0 8px 16px rgba(30, 41, 59, 0.2)' : 'none'
          }}
        >
          <Users size={20} />
          Alumni
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'iv' ? 'IV Students' : activeTab === 'intern' ? 'Interns' : 'Alumni'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              outline: 'none',
              fontSize: '14px',
              color: '#1e293b',
              boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02)',
              transition: 'border-color 0.2s',
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <AnimatePresence>
              {activeTab === 'iv' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#10b981',
                    border: '1px solid #059669',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Download size={16} />
                  Download Batch ZIP
                </motion.button>
              )}
            </AnimatePresence>

            {/* Download Popup Modal */}
            <AnimatePresence>
              {isDownloadOpen && (
                <>
                  <div 
                    onClick={() => setIsDownloadOpen(false)} 
                    style={{ position: 'fixed', inset: 0, zIndex: 15 }}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, pointerEvents: 'none' }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      width: '300px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                      padding: '24px',
                      zIndex: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '15px' }}>Batch Download</span>
                    </div>
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '-4px 0' }}></div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>College</label>
                      <div className="clean-select-container">
                        <select className="clean-select" value={collegeFilter} onChange={handleCollegeChange} style={{ width: '100%', padding: '12px', paddingRight: '36px', fontSize: '14px', cursor: 'pointer', borderRadius: '12px', background: 'white', color: '#1e293b', colorScheme: 'light' }}>
                          <option value="All">Select College</option>
                          {uniqueColleges.map(c => <option key={c} value={c} style={{ color: '#1e293b', background: 'white' }}>{c}</option>)}
                        </select>
                        <ChevronDown className="clean-select-icon" size={16} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Batch</label>
                      <div className="clean-select-container">
                        <select className="clean-select" value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} style={{ width: '100%', padding: '12px', paddingRight: '36px', fontSize: '14px', cursor: 'pointer', borderRadius: '12px', background: 'white', color: '#1e293b', colorScheme: 'light' }}>
                          <option value="All">Select Batch</option>
                          {availableBatches.map(b => (
                            <option key={b} value={b} style={{ color: '#1e293b', background: 'white' }}>{b}</option>
                          ))}
                        </select>
                        <ChevronDown className="clean-select-icon" size={16} />
                      </div>
                    </div>

                    <button 
                      disabled={collegeFilter === 'All' || batchFilter === 'All'}
                      onClick={() => {
                        alert(`Downloading complete ZIP for ${collegeFilter} - Batch ${batchFilter}`);
                        setIsDownloadOpen(false);
                      }}
                      style={{
                        marginTop: '10px',
                        padding: '12px',
                        background: (collegeFilter === 'All' || batchFilter === 'All') ? '#cbd5e1' : '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: (collegeFilter === 'All' || batchFilter === 'All') ? 'not-allowed' : 'pointer',
                        boxShadow: (collegeFilter === 'All' || batchFilter === 'All') ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      Process ZIP Download
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: isFilterOpen ? '#f1f5f9' : '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s'
              }}>
              <Filter size={16} />
              Filter
            </button>

            {/* Filter Dropdown Modal */}
            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div 
                    onClick={() => setIsFilterOpen(false)} 
                    style={{ position: 'fixed', inset: 0, zIndex: 15 }}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, pointerEvents: 'none' }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '300px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                      padding: '24px',
                      zIndex: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px'
                    }}>
                    <style>{`
                       .clean-input {
                        width: 100%;
                        padding: 12px 14px;
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 12px !important;
                        font-size: 14px;
                        outline: none;
                        background: #ffffff !important;
                        background-color: #ffffff !important;
                        color: #1e293b !important;
                        color-scheme: light !important;
                        transition: all 0.2s;
                      }
                      .clean-input:focus {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                      }
                      .clean-select {
                        -webkit-appearance: none;
                        -moz-appearance: none;
                        appearance: none;
                        background: #ffffff !important;
                        background-color: #ffffff !important;
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 12px !important;
                        color: #1e293b !important;
                        color-scheme: light !important;
                        outline: none;
                        transition: all 0.2s ease;
                        height: 44px;
                        line-height: normal;
                        box-shadow: none !important;
                      }
                      .clean-select:hover {
                        border-color: #cbd5e1 !important;
                      }
                      .clean-select:focus {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                      }
                      .clean-select option {
                        color: #1e293b;
                        background: #fff;
                      }
                      .clean-select-container {
                        position: relative;
                        display: flex;
                        width: 100%;
                      }
                      .clean-select-icon {
                        position: absolute;
                        right: 12px;
                        top: 50%;
                        transform: translateY(-50%);
                        pointer-events: none;
                        transition: transform 0.2s ease, color 0.2s ease;
                        color: #64748b !important;
                        z-index: 5;
                      }
                      .clean-select:focus + .clean-select-icon {
                        transform: translateY(-50%) rotate(180deg);
                        color: #2563eb !important;
                      }
                    `}</style>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '15px' }}>Filters</span>
                      <span 
                        onClick={() => {
                          setSearchQuery('');
                          setCollegeFilter('All');
                          setBatchFilter('All');
                        }}
                        style={{ fontSize: '13px', color: '#2563eb', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Reset All
                      </span>
                    </div>

                    <div style={{ height: '1px', background: '#e2e8f0', margin: '-4px 0' }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Name</label>
                      <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name..."
                        className="clean-input"
                      />
                    </div>

                    {activeTab === 'iv' && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>College</label>
                          <div className="clean-select-container">
                            <select className="clean-select" value={collegeFilter} onChange={handleCollegeChange} style={{ width: '100%', padding: '10px 12px', paddingRight: '36px', fontSize: '14px', cursor: 'pointer' }}>
                              <option value="All">All Colleges</option>
                              {uniqueColleges.map(college => (
                                <option key={college} value={college}>{college}</option>
                              ))}
                            </select>
                            <ChevronDown className="clean-select-icon" size={16} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Batch</label>
                          <div className="clean-select-container">
                            <select className="clean-select" value={batchFilter} onChange={e => setBatchFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', paddingRight: '36px', fontSize: '14px', cursor: 'pointer' }}>
                              <option value="All">All Batches</option>
                              {availableBatches.map(batch => (
                                <option key={batch} value={batch}>{batch}</option>
                              ))}
                            </select>
                            <ChevronDown className="clean-select-icon" size={16} />
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab !== 'iv' && (
                      <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                        Extra filters for {activeTab} coming soon.
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dynamic Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            background: '#fff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
            overflow: 'visible' /* Changed from hidden so filter dropdown visible */
          }}
        >
          {/* Subtle Background Icon */}
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.03, pointerEvents: 'none' }}>
            <FileCheck size={300} />
          </div>

          <div style={{ width: '100%', zIndex: 1, minHeight: '300px' }}>
            {activeTab === 'iv' ? (
              <div style={{ width: '100%', overflowX: 'auto', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>College</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIv.length > 0 ? filteredIv.map((student, i, arr) => (
                      <tr key={student.id} style={{ borderBottom: i === arr.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background-color 0.2s', background: '#fff' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{student.name}</td>
                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{student.college}</td>
                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>{student.course}</td>
                        <td style={{ padding: '16px 24px', color: '#2563eb', fontSize: '14px', fontWeight: 700 }}>{student.batch}</td>
                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{student.date}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(30, 41, 59, 0.2)' }}>
                            Generate
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No students match your filter criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'intern' ? (
              <div style={{ width: '100%', overflowX: 'auto', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>College</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInterns.length > 0 ? filteredInterns.map((intern, i, arr) => (
                      <tr key={intern.id} style={{ borderBottom: i === arr.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background-color 0.2s', background: '#fff' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{intern.name}</td>
                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{intern.college}</td>
                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{intern.position}</td>
                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{intern.duration}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(30, 41, 59, 0.2)' }}>
                            Generate
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No interns match your filter criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ width: '100%', overflowX: 'auto', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joining Date</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ending Date</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlumni.length > 0 ? filteredAlumni.map((alumni, i, arr) => (
                      <tr key={alumni.id} style={{ borderBottom: i === arr.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background-color 0.2s', background: '#fff' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{alumni.name}</td>
                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{alumni.position}</td>
                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{alumni.joinDate}</td>
                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{alumni.endDate}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(30, 41, 59, 0.2)' }}>
                            Generate
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No alumni match your filter criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
};

export default AdminCertification;
