import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardSignature, Briefcase, Banknote, ClipboardCheck,
  Bold, Italic, Underline, AlignLeft, AlignCenter, CheckSquare, List, Calendar, ArrowLeft
} from 'lucide-react';
import { adminApi } from '../../services/api';

const AdminPostJob: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Select category',
    location: '',
    jobType: 'Select job type',
    joinDate: '',
    endDate: '',
    description: '',
    minSalary: '',
    maxSalary: '',
    salaryType: 'Yearly',
    currency: 'INR (₹)',
    skills: '',
    experience: 'Select experience level',
    education: 'Select education level'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Map the new UI state to what the backend expects
    const jobData = {
      title: formData.title,
      company: 'NeST',
      location: formData.location,
      salary: `${formData.currency} ${formData.minSalary} - ${formData.maxSalary} / ${formData.salaryType}`,
      description: `[${formData.category}] [${formData.jobType}] ${formData.description}`,
      requirements: [
        `Skills: ${formData.skills}`,
        `Experience: ${formData.experience}`,
        `Education: ${formData.education}`
      ]
    };

    const res = await adminApi.addJob(jobData);
    if (res.success) {
      alert('Job posted successfully!');
      navigate('/admin/jobs');
    } else {
      alert(res.message || 'Failed to post job');
    }
    setIsSubmitting(false);
  };

  const nestNavy = '#1a2652';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/admin/jobs')}
          style={{ 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Post a Job</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 24px' }}>
        
        {/* Top Info Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#f1f5f9', color: '#475569', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardSignature size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0, fontFamily: '"Playfair Display", serif' }}>Post a Job</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>Fill out the details to create a new job posting.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section: Job Details */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <Briefcase size={18} color="#475569" /> Job Details
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Job Title</label>
                <input required type="text" placeholder="Enter job title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Job Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center', cursor: 'pointer' }}>
                  <option value="Select category" disabled>Select category</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Location</label>
                <input required type="text" placeholder="Enter location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Job Type</label>
                <select value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center', cursor: 'pointer' }}>
                  <option value="Select job type" disabled>Select job type</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Joining Date</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                    <Calendar size={16} />
                  </div>
                  <input required type="date" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} onClick={(e) => { try { (e.target as HTMLInputElement).showPicker?.(); } catch (err) {} }} style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', width: '100%', boxSizing: 'border-box', background: '#fff', cursor: 'pointer' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>End Date</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                    <Calendar size={16} />
                  </div>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} onClick={(e) => { try { (e.target as HTMLInputElement).showPicker?.(); } catch (err) {} }} style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', width: '100%', boxSizing: 'border-box', background: '#fff', cursor: 'pointer' }} />
                </div>
              </div>

            </div>

            {/* Pseudo Rich Text Editor inside Job Details block */}
            <div style={{ padding: '0 24px 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Job Description</label>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  {/* Toolbar */}
                  <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#fff', color: '#64748b' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Bold size={16} style={{ cursor: 'pointer' }} />
                      <Italic size={16} style={{ cursor: 'pointer' }} />
                      <Underline size={16} style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <AlignLeft size={16} style={{ cursor: 'pointer' }} />
                      <AlignCenter size={16} style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <CheckSquare size={16} style={{ cursor: 'pointer' }} />
                      <List size={16} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                  {/* Textarea */}
                  <textarea 
                    required 
                    rows={6} 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      border: 'none', 
                      outline: 'none', 
                      fontSize: '14px', 
                      color: '#fff', 
                      background: '#404040', 
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Section: Salary & Compensation */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <Banknote size={18} color="#475569" /> Salary & Compensation
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Minimum Salary</label>
                <input required type="text" placeholder="e.g. 50,000" value={formData.minSalary} onChange={e => setFormData({...formData, minSalary: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Maximum Salary</label>
                <input required type="text" placeholder="e.g. 80,000" value={formData.maxSalary} onChange={e => setFormData({...formData, maxSalary: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Salary Type</label>
                <select value={formData.salaryType} onChange={e => setFormData({...formData, salaryType: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center', cursor: 'pointer' }}>
                  <option value="Yearly">Yearly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Hourly">Hourly</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Currency</label>
                <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center', cursor: 'pointer' }}>
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section: Job Requirements */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
              <ClipboardCheck size={18} color="#475569" /> Job Requirements
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Skills Required</label>
                <input required type="text" placeholder="Enter required skills" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', background: '#fff' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Experience Level</label>
                  <select value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center', cursor: 'pointer' }}>
                    <option value="Select experience level" disabled>Select experience level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Education</label>
                  <select value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: '#1e293b', appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center', cursor: 'pointer' }}>
                    <option value="Select education level" disabled>Select education level</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Ph.D.">Ph.D.</option>
                    <option value="Any">Any</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', margin: '16px -24px -32px -24px', padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button type="button" onClick={() => navigate('/admin/jobs')} style={{ padding: '12px 28px', borderRadius: '8px', background: '#fff', color: '#475569', fontWeight: 700, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
            <button disabled={isSubmitting} type="submit" style={{ padding: '12px 28px', borderRadius: '8px', background: nestNavy, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1, fontSize: '14px', boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)' }}>
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminPostJob;
