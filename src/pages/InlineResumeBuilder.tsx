import React, { useState, useRef, useEffect } from 'react';
import { Download, CheckCheck, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InlineResumeBuilderProps {
  onAttach: (file: File, data: any) => void;
  initialData?: any;
  buttonText?: string;
}

const InlineResumeBuilder: React.FC<InlineResumeBuilderProps> = ({ onAttach, initialData, buttonText }) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [isGeneratingAttach, setIsGeneratingAttach] = useState(false);
  
  // Initialize with initialData or default values
  const [data, setData] = useState({
    fullName: initialData?.fullName || 'LAURICE MORETTI',
    title: initialData?.title || 'SYSTEMS DESIGNER',
    summary: initialData?.summary || 'I am a committed and innovative systems design professional with 10 years of experience creating, implementing, and optimizing complex systems.',
    phone: initialData?.phone || '+123-456-7890',
    email: initialData?.email || 'hello@reallygreatsite.com',
    address: initialData?.address || '123 Anywhere St., Any City, ST 12345',
    portfolio: initialData?.portfolio || 'www.reallygreatsite.com',
    experience: initialData?.experience || 'Senior Systems Designer | 2030-2035\nThe IT Company\n- Designed and implemented advanced system architectures, resulting in a 30% increase in operational efficiency\n- Led a group of 10 engineers in developing scalable solutions, ensuring alignment with business objectives and regulatory requirements\n\nSystems Design Engineer | 2027-2030\nCyber Tech Company\n- Developed robust system designs for clients in the healthcare, finance, and education industries\n- Implemented best practices in system design and integration, improving system performance and reliability by 30%\n\nIT Project Analyst | 2025-2027\nThe Systems Design Inc.\n- Assisted in the design and implementation of systems for small to mid-sized business clients\n- Collaborated with junior and senior designers to develop system specifications and documentation',
    projects: initialData?.projects || 'Alumni Portal Revamp | 2026\nOpen Source Contribution\n- Redesigned core layout components to achieve a modernized responsive interface\n- Collaborated on establishing a standardized digital design system',
    education: initialData?.education || 'North State University | 2025-2027\nMaster of Systems Design and Management\n- GPA: 3.8\n- Best Mentor Awardee\n- Recognition for Extended Research Paper\n\nSouth City College | 2021-2025\nBachelor of Science in Computer Engineering\n- GPA: 3.8\n- Editor-in-Chief, The SCC Tribune\n- President, The IT Society',
    certification: initialData?.certification || 'Project Management | 2027\nThe Project Management Institute\n\nSystem Optimization | 2028\nScrum Learning Society\n\nRisk Management and Mitigation | 2028\nInternal Auditors Team\n\nVendor Relations | 2030\nNorth State University'
  });

  // Sync state if initialData changes (useful for autofill)
  useEffect(() => {
    if (initialData) {
      setData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const [isAttached, setIsAttached] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const generatePDF = async () => {
    if (!resumeRef.current) return null;
    const canvas = await html2canvas(resumeRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const handleDownload = async () => {
    setIsGeneratingDownload(true);
    try {
      const pdf = await generatePDF();
      if (pdf) {
        pdf.save(`${data.fullName ? data.fullName.replace(/\s+/g, '_') : 'Resume'}.pdf`);
      }
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  const handleAttach = async () => {
    setIsGeneratingAttach(true);
    try {
      const pdf = await generatePDF();
      if (pdf) {
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], `${data.fullName ? data.fullName.replace(/\s+/g, '_') : 'Resume'}.pdf`, { type: 'application/pdf' });
        onAttach(file, data); // Pass data back too
        setIsAttached(true);
      }
    } catch (err) {
      console.error('Failed to attach PDF', err);
    } finally {
      setIsGeneratingAttach(false);
      setTimeout(() => setIsAttached(false), 3000); // Reset after 3s
    }
  };

  // Helper to render text blocks with bold first lines and bullet points
  const renderTextBlock = (text: string, columns: number = 1) => {
    const blocks = text.split('\n\n').filter(Boolean);
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: columns > 1 ? `repeat(${columns}, 1fr)` : '1fr', gap: '1rem' }}>
        {blocks.map((block, idx) => {
          const lines = block.split('\n');
          return (
            <div key={idx} style={{ marginBottom: columns === 1 ? '1rem' : 0 }}>
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
    <div className="inline-resume-builder" style={{ background: '#ffffff', border: '1px solid #e9ecef', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .inline-resume-builder input, .inline-resume-builder textarea {
          color: #1a1a1a !important;
          font-family: inherit;
        }
        .inline-resume-builder input::placeholder, .inline-resume-builder textarea::placeholder {
          color: #adb5bd !important;
        }
      `}</style>
      <div style={{ padding: '1rem 1.5rem', background: '#f8f9fa', borderBottom: '1px solid #e9ecef', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.1rem', fontWeight: 600 }}>Create Your Resume</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" disabled={isGeneratingDownload} onClick={handleDownload} style={{ padding: '0.6rem 1rem', background: '#ffffff', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#4a4a4a', opacity: isGeneratingDownload ? 0.7 : 1 }}>
            {isGeneratingDownload ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {isGeneratingDownload ? 'Generating...' : 'Download PDF'}
          </button>
          <button type="button" disabled={isGeneratingAttach || isAttached} onClick={handleAttach} style={{ padding: '0.6rem 1rem', background: isAttached ? '#2b8a3e' : '#c8102e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', opacity: isGeneratingAttach ? 0.7 : 1 }}>
            {isGeneratingAttach ? <Loader2 size={16} className="animate-spin" /> : (isAttached ? <CheckCheck size={16} /> : null)} {isGeneratingAttach ? 'Generating...' : (isAttached ? 'Attached!' : (buttonText || 'Attach as PDF'))}
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', padding: '1.5rem' }}>
        {/* Form Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '1rem', scrollbarWidth: 'thin' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Full Name</label>
            <input name="fullName" value={data.fullName} onChange={handleChange} placeholder="LAURICE MORETTI" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', background: '#f8f9fa' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Professional Title</label>
            <input name="title" value={data.title} onChange={handleChange} placeholder="SYSTEMS DESIGNER" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', background: '#f8f9fa' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Phone</label>
              <input name="phone" value={data.phone} onChange={handleChange} placeholder="+123-456-7890" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', background: '#f8f9fa' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Address</label>
              <input name="address" value={data.address} onChange={handleChange} placeholder="123 Anywhere St..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', background: '#f8f9fa' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Email</label>
              <input name="email" value={data.email} onChange={handleChange} placeholder="hello@reallygreatsite.com" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', background: '#f8f9fa' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Portfolio</label>
              <input name="portfolio" value={data.portfolio} onChange={handleChange} placeholder="www.reallygreatsite.com" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', background: '#f8f9fa' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Professional Summary</label>
            <textarea name="summary" value={data.summary} onChange={handleChange} rows={3} placeholder="Briefly describe your professional background..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', resize: 'vertical', background: '#f8f9fa', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Work Experience (Separate by double enter)</label>
            <textarea name="experience" value={data.experience} onChange={handleChange} rows={6} placeholder="Title | Dates\nCompany\n- Bullet 1\n- Bullet 2" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', resize: 'vertical', background: '#f8f9fa', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Projects (Separate by double enter)</label>
            <textarea name="projects" value={data.projects} onChange={handleChange} rows={5} placeholder="Project Name | Dates\nRole/Tech Stack\n- Bullet 1" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', resize: 'vertical', background: '#f8f9fa', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Academic History (Separate by double enter)</label>
            <textarea name="education" value={data.education} onChange={handleChange} rows={5} placeholder="University | Dates\nDegree\n- Bullet 1" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', resize: 'vertical', background: '#f8f9fa', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a4a4a', marginBottom: '0.3rem', display: 'block' }}>Certification (Separate by double enter)</label>
            <textarea name="certification" value={data.certification} onChange={handleChange} rows={5} placeholder="Certificate | Dates\nIssuer" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', resize: 'vertical', background: '#f8f9fa', fontFamily: 'inherit' }} />
          </div>
        </div>

        {/* Live Preview Section styled to match the image */}
        <div style={{ background: '#f1f3f5', padding: '1.5rem', borderRadius: '8px', overflowY: 'auto', maxHeight: '600px', textAlign: 'center' }}>
          <div ref={resumeRef} style={{ 
            background: 'white', 
            padding: '2.5rem', 
            width: '100%', 
            maxWidth: '550px', 
            minHeight: '700px',
            height: 'max-content',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: '#000',
            lineHeight: 1.4,
            boxSizing: 'border-box',
            wordBreak: 'break-word',
            margin: '0 auto',
            textAlign: 'left',
            display: 'inline-block'
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ margin: '0', fontSize: '26px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{data.fullName}</h1>
              <h2 style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>{data.title}</h2>
            </div>
            
            {data.summary && (
              <div style={{ marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px' }}>Professional Summary</h3>
                <p style={{ fontSize: '9px', margin: 0, paddingRight: '20px' }}>{data.summary}</p>
              </div>
            )}

            <div style={{ marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px' }}>Contact</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '4px', fontSize: '9px' }}>
                <div>Phone: {data.phone}</div>
                <div>Address: {data.address}</div>
                <div>Email: {data.email}</div>
                <div>Portfolio: {data.portfolio}</div>
              </div>
            </div>

            {data.experience && (
              <div style={{ marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px' }}>Work Experience</h3>
                {renderTextBlock(data.experience, 1)}
              </div>
            )}

            {data.projects && (
              <div style={{ marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px' }}>Projects</h3>
                {renderTextBlock(data.projects, 1)}
              </div>
            )}

            {data.education && (
              <div style={{ marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px' }}>Academic History</h3>
                {renderTextBlock(data.education, 2)}
              </div>
            )}

            {data.certification && (
              <div>
                <h3 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px' }}>Certification</h3>
                {renderTextBlock(data.certification, 2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineResumeBuilder;
