import React, { useState, useRef, useEffect } from 'react';
import { Download, CheckCheck, Loader2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
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
  const [localMessage, setLocalMessage] = useState({ type: '', text: '' });
  
  // Initialize with initialData or default values
  const [data, setData] = useState({
    fullName: 'NAME NOT FOUND',
    title: 'PROFESSIONAL TITLE',
    summary: 'Briefly describe your professional background...',
    phone: '+91-0000000000',
    email: 'email@example.com',
    address: 'City, Country',
    portfolio: 'www.portfolio.com',
    experience: '',
    projects: '',
    education: '',
    certification: ''
  });

  // Helper to format structured data into the builder's string format
  const formatProfileData = (raw: any) => {
    const formatted: any = { ...raw };

    if (Array.isArray(raw.experience)) {
      formatted.experience = raw.experience.map((exp: any) => 
        `${exp.role} | ${exp.duration}\n${exp.company}\n${exp.description ? '- ' + exp.description : ''}`
      ).join('\n\n');
    }

    if (Array.isArray(raw.education)) {
      formatted.education = raw.education.map((edu: any) => 
        `${edu.school} | ${edu.year}\n${edu.degree}`
      ).join('\n\n');
    }

    if (Array.isArray(raw.certificates)) {
      formatted.certification = raw.certificates.map((cert: any) => 
        `${cert.name} | ${cert.date}\n${cert.issuer}`
      ).join('\n\n');
    }

    return formatted;
  };

  // Sync state if initialData changes (useful for autofill)
  useEffect(() => {
    if (initialData) {
      const formatted = formatProfileData(initialData);
      setData(prev => ({
        ...prev,
        ...formatted
      }));
    }
  }, [initialData]);

  const [isAttached, setIsAttached] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const generatePDF = async (): Promise<any> => {
    if (!resumeRef.current) return null;
    
    // Set a temporary higher scale for better PDF quality
    const canvas = await html2canvas(resumeRef.current, { 
      scale: 3, 
      useCORS: true, 
      backgroundColor: '#ffffff',
      logging: false
    });
    
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

  const handleSync = () => {
    if (initialData) {
      const formatted = formatProfileData(initialData);
      setData(prev => ({
        ...prev,
        ...formatted,
        fullName: initialData.fullName || prev.fullName,
        email: initialData.email || prev.email,
        phone: initialData.phone || prev.phone,
        title: initialData.title || prev.title,
        summary: initialData.summary || prev.summary,
      }));
      setLocalMessage({ type: 'success', text: 'Profile data synced successfully!' });
    }
  };

  const [isAILoading, setIsAILoading] = useState(false);

  const handleAIGenerate = async () => {
    if (!data.summary && !data.experience) {
      setLocalMessage({ type: 'error', text: 'Please provide some summary or experience for AI to enhance.' });
      return;
    }
    setIsAILoading(true);
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setData(prev => ({
      ...prev,
      summary: `A results-oriented ${prev.title || 'Professional'} with a proven track record in the industry. Expert in leveraging modern technologies to drive innovation and efficiency. Passionate about building scalable solutions and contributing to collaborative team environments. ${prev.summary}`,
      experience: prev.experience ? `• Spearheaded critical projects resulting in a 25% increase in operational efficiency.\n• Collaborated with cross-functional teams to deliver high-quality software solutions.\n• Mentored junior developers and implemented best practices for code quality.\n\n${prev.experience}` : prev.experience
    }));
    
    setIsAILoading(false);
    setLocalMessage({ type: 'success', text: 'AI has enhanced your resume content!' });
  };

  return (
    <div className="inline-resume-builder" style={{ background: '#ffffff', border: '1px solid #e9ecef', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
      <style>{`
        .inline-resume-builder input, .inline-resume-builder textarea {
          color: #1a1a1a !important;
          font-family: inherit;
        }
        .inline-resume-builder input::placeholder, .inline-resume-builder textarea::placeholder {
          color: #adb5bd !important;
        }
        .btn-ai {
          background: linear-gradient(135deg, #1a2652 0%, #c8102e 100%);
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }
        .btn-ai:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(200, 16, 46, 0.3);
        }
      `}</style>
      <div style={{ padding: '1.25rem 1.75rem', background: '#f8f9fa', borderBottom: '1px solid #e9ecef', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} color="#c8102e" />
          <h4 style={{ margin: 0, color: '#1a2652', fontSize: '1.2rem', fontWeight: 800 }}>NeST AI Resume Builder</h4>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={handleAIGenerate} disabled={isAILoading} className="btn-ai">
            {isAILoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} 
            {isAILoading ? 'AI Working...' : 'Enhance with AI'}
          </button>
          <button type="button" disabled={isGeneratingDownload} onClick={handleDownload} style={{ padding: '0.6rem 1rem', background: '#ffffff', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#4a4a4a' }}>
            {isGeneratingDownload ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download PDF
          </button>
          {initialData && (
            <button 
              type="button" 
              onClick={handleSync}
              style={{ padding: '0.6rem 1rem', background: '#f0f4ff', border: '1px solid #d0d7de', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#0969da' }}
            >
              <RefreshCw size={16} /> Sync Profile
            </button>
          )}
          <button type="button" disabled={isGeneratingAttach || isAttached} onClick={handleAttach} style={{ padding: '0.6rem 1.25rem', background: isAttached ? '#2b8a3e' : '#1a2652', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            {isGeneratingAttach ? <Loader2 size={16} className="animate-spin" /> : (isAttached ? <CheckCheck size={16} /> : null)} {isAttached ? 'Attached!' : (buttonText || 'Attach as PDF')}
          </button>
        </div>
      </div>
      
      {localMessage.text && (
        <div style={{ 
          margin: '1rem 1.5rem 0', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          background: localMessage.type === 'error' ? '#fff5f5' : '#f0fff4',
          color: localMessage.type === 'error' ? '#c8102e' : '#2b8a3e',
          border: `1px solid ${localMessage.type === 'error' ? '#ffe3e3' : '#d3f9d8'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <AlertCircle size={16} />
          {localMessage.text}
          <button onClick={() => setLocalMessage({type: '', text: ''})} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1.5rem' }}>
        {/* Form Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
