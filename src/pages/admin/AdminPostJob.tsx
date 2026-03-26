import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardSignature, ChevronDown, Briefcase, ClipboardCheck,
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  CheckSquare, List, ListOrdered, Link, Minus, Settings, Banknote, ArrowLeft, FilePlus, Calendar
} from 'lucide-react';

const AdminPostJob: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/admin/jobs')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            color: '#64748b', 
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Post a Job</h1>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Card Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: '#eff6ff', color: '#2563eb', padding: '16px', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <ClipboardSignature size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Post a Job</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: 0 }}>Fill out the details to create a new job posting.</p>
          </div>
        </div>

        {/* Form Sections */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Job Details Section (Expanded) */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Job Details</span>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Job Title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Job Title</label>
                  <input type="text" placeholder="Enter job title" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Job Category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Job Category</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#94a3b8' }}>
                      <option>Select category</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
                {/* Location */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Location</label>
                  <input type="text" placeholder="Enter location" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Job Type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Job Type</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#94a3b8' }}>
                      <option>Select job type</option>
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

              {/* Job Description Rich Text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Job Description</label>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
                  {/* Toolbar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Bold size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <Italic size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <Underline size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <Strikethrough size={16} color="#475569" style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ width: '1px', height: '16px', background: '#cbd5e1' }}></div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <AlignLeft size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <AlignCenter size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <AlignRight size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <AlignJustify size={16} color="#475569" style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ width: '1px', height: '16px', background: '#cbd5e1' }}></div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <CheckSquare size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <List size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <ListOrdered size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <Link size={16} color="#475569" style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ width: '1px', height: '16px', background: '#cbd5e1' }}></div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Minus size={16} color="#475569" style={{ cursor: 'pointer' }} />
                      <Settings size={16} color="#475569" style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                  {/* Textarea */}
                  <textarea style={{ width: '100%', minHeight: '120px', border: 'none', padding: '16px', fontSize: '14px', outline: 'none', resize: 'vertical', background: '#fff', color: '#1e293b' }}></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Salary & Compensation Section (Expanded) */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Banknote size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Salary & Compensation</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Minimum Salary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Minimum Salary</label>
                  <input type="text" placeholder="e.g. 50,000" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Maximum Salary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Maximum Salary</label>
                  <input type="text" placeholder="e.g. 80,000" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                {/* Salary Type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Salary Type</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#94a3b8' }}>
                      <option>Yearly</option>
                      <option>Monthly</option>
                      <option>Hourly</option>
                      <option>Negotiable</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
                {/* Currency */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Currency</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#94a3b8' }}>
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Requirements Section (Expanded) */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardCheck size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Job Requirements</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Skills Required */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Skills Required</label>
                  <input type="text" placeholder="Enter required skills" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
                
                {/* 2-Col Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Experience Level</label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#94a3b8' }}>
                        <option>Select experience level</option>
                      </select>
                      <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Education</label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#94a3b8' }}>
                        <option>Select education level</option>
                      </select>
                      <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Settings Section (Expanded) */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Application Settings</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Deadline */}
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Application Deadline</label>
                  <div style={{ position: 'relative', maxWidth: '400px' }}>
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

                {/* How to Apply */}
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>How to Apply</label>
                  <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #93c5fd', background: '#f0f9ff', fontSize: '14px', outline: 'none', appearance: 'none', color: '#1e293b' }}>
                      <option>Online Application</option>
                    </select>
                    <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '16px', top: '14px', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Upload Resume */}
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Upload Resume?</label>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>
                      <input type="radio" name="upload_resume" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                      Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                      <input type="radio" name="upload_resume" style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                      No
                    </label>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
          {/* Attachments Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden', marginTop: '16px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FilePlus size={18} color="#475569" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>Upload Documents</span>
            </div>
            
            <div style={{ padding: '24px', background: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <div style={{ background: '#f1f5f9', color: '#64748b', padding: '12px', borderRadius: '50%' }}>
                     <FilePlus size={24} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Upload Documents</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>PDF, DOCX, Image up to 10MB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fff' }}>
          <button 
            onClick={() => navigate('/admin/jobs')}
            style={{ 
              padding: '12px 24px', borderRadius: '10px', background: '#f1f5f9', 
              color: '#475569', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
          <button style={{ 
            padding: '12px 24px', borderRadius: '10px', background: '#2563eb', 
            color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)' 
          }}>
            Post Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPostJob;
