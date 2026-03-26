import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardSignature, ChevronDown, Briefcase, ClipboardCheck,
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  CheckSquare, List, ListOrdered, Link, Minus, Settings, Banknote, ArrowLeft, FilePlus, Calendar
} from 'lucide-react';

const AdminPostJob: React.FC = () => {
  const navigate = useNavigate();

  /* NeST NAVY BLUE */
  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Post a Job</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(26, 38, 82, 0.05)' }}>
        {/* Card Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: 'rgba(26, 38, 82, 0.08)', color: nestNavy, padding: '16px', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <ClipboardSignature size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Post a Job</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: 0 }}>Fill out the details to create a new job posting.</p>
          </div>
        </div>

        {/* Form Sections */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Job Details Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={18} color={nestNavy} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Job Details</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Job Title</label>
                  <input type="text" placeholder="Enter job title" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Job Category</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#1e293b', fontWeight: 600 }}>
                      <option>Select category</option>
                      <option>Engineering</option>
                      <option>Design</option>
                      <option>Marketing</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Location</label>
                  <input type="text" placeholder="Enter location" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Job Type</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#1e293b', fontWeight: 600 }}>
                      <option>Select job type</option>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
                {/* Dates Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Joining Date</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '16px', top: '12px', pointerEvents: 'none' }}>
                      <Calendar size={16} color="#94a3b8" />
                    </div>
                    <input 
                      type="date" 
                      onClick={(e) => (e.currentTarget as any).showPicker?.()}
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px 12px 42px', 
                        borderRadius: '10px', 
                        border: '1px solid #e2e8f0', 
                        background: '#fff', 
                        fontSize: '14px', 
                        outline: 'none', 
                        color: '#1e293b',
                        cursor: 'pointer'
                      }} 
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>End Date</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '16px', top: '12px', pointerEvents: 'none' }}>
                      <Calendar size={16} color="#94a3b8" />
                    </div>
                    <input 
                      type="date" 
                      onClick={(e) => (e.currentTarget as any).showPicker?.()}
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px 12px 42px', 
                        borderRadius: '10px', 
                        border: '1px solid #e2e8f0', 
                        background: '#fff', 
                        fontSize: '14px', 
                        outline: 'none', 
                        color: '#1e293b',
                        cursor: 'pointer'
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Job Description</label>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Bold size={16} color={nestNavy} style={{ cursor: 'pointer' }} />
                      <Italic size={16} color={nestNavy} style={{ cursor: 'pointer' }} />
                      <Underline size={16} color={nestNavy} style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ width: '1px', height: '16px', background: '#cbd5e1' }}></div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <AlignLeft size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <AlignCenter size={16} color="#475569" style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ width: '1px', height: '16px', background: '#cbd5e1' }}></div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <CheckSquare size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <List size={16} color="#475569" style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                  <textarea style={{ width: '100%', minHeight: '120px', border: 'none', padding: '16px', fontSize: '14px', outline: 'none', resize: 'vertical' }}></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Banknote size={18} color={nestNavy} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Salary & Compensation</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Minimum Salary</label>
                  <input type="text" placeholder="e.g. 50,000" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Maximum Salary</label>
                  <input type="text" placeholder="e.g. 80,000" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Salary Type</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#1e293b', fontWeight: 600 }}>
                      <option>Yearly</option>
                      <option>Monthly</option>
                      <option>Hourly</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Currency</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#1e293b', fontWeight: 600 }}>
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardCheck size={18} color={nestNavy} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Job Requirements</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Skills Required</label>
                  <input type="text" placeholder="Enter required skills" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Experience Level</label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#1e293b', fontWeight: 600 }}>
                        <option>Select experience level</option>
                        <option>Fresher</option>
                        <option>1-2 Years</option>
                        <option>3-5 Years</option>
                      </select>
                      <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Education</label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#1e293b', fontWeight: 600 }}>
                        <option>Select education level</option>
                        <option>Bachelor's</option>
                        <option>Master's</option>
                      </select>
                      <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fcfdfd' }}>
          <button 
            onClick={() => navigate('/admin/jobs')}
            style={{ 
              padding: '12px 24px', borderRadius: '10px', background: '#fff', 
              color: '#475569', fontSize: '14px', fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
          <button style={{ 
            padding: '12px 24px', borderRadius: '10px', background: nestNavy, 
            color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' 
          }}>
            Post Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPostJob;
