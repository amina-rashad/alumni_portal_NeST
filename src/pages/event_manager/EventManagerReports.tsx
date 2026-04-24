import React from 'react';
import { 
  BarChart3, PieChart, TrendingUp, Download, 
  Calendar, FileText, ArrowUpRight
} from 'lucide-react';

const EventManagerReports: React.FC = () => {
  const brandPrimary = '#233167';

  const handleDownload = (filename: string) => {
    // Generate a valid minimal blank PDF Data URI for mock downloading
    const pdfDataUri = 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAyN9MwUTI2MDPUslEBCxkC2qZGRhZm5rYmhmZWRoameiZqZuamZuZmppQUAUlMMgQplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjY5CmVuZG9iagoKNCAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3ggWzAgMCA1OTUuMjggODQxLjg5XS9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNSAwIFI+Pj4+L0NvbnRlbnRzIDIgMCBSL1BhcmVudCAxIDAgUj4+CmVuZG9iagoKNSAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9QYWdlcy9LaWRzWzQgMCBSXS9Db3VudCAXPj4KZW5kb2JqCgo2IDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAxIDAgUj4+CmVuZG9iagoKNyAwIG9iago8PC9DcmVhdG9yKERTKS9Qcm9kdWNlcihkc19wZGYpL01vZERhdGUoRDoyMDIzMTEwNzE1MzUwMFopL0NyZWF0aW9uRGF0ZShEOjIwMjMxMTA3MTUzNTAwWik+PgplbmRvYmoKCnhyZWYKMCA4CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDI1MCAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxMzEgMDAwMDAgbiAKMDAwMDAwMDE1MCAwMDAwMCBuIAowMDAwMDAwMjQ5IDAwMDAwIG4gCjAwMDAwMDAzMTEgMDAwMDAgbiAKMDAwMDAwMDM1NiAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgOC9Sb290IDYgMCBSL0luZm8gNyAwIFIvSUQgWzw0ODk3RUFERkQwRkJFNTA3QTM1NDA0MDg0MTA1QUE2Nz4gPDQ4OTdFQURGRDBGQkU1MDdBMzU0MDQwODQxMDVBQTY3Pl0+PgpzdGFydHhyZWYKNTAwCiUlRU9GCg==';
    const link = document.createElement('a');
    link.href = pdfDataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0, fontFamily: "'Montserrat', sans-serif" }}>Analytics Reports</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Analyze event performance, attendance metrics, and user engagement.</p>
      </div>

      {/* Grid of Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Attendance Summary */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: `${brandPrimary}10`, color: brandPrimary, padding: '10px', borderRadius: '12px' }}>
                <TrendingUp size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Attendance Overview</h3>
            </div>
            <button style={{ background: 'none', border: 'none', color: brandPrimary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              View Details <ArrowUpRight size={16} />
            </button>
          </div>
          
          <div style={{ height: '200px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
             [ Attendance Growth Chart Placeholder ]
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Avg. Attendance</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>82%</div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Retention Rate</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>45%</div>
            </div>
          </div>
        </div>

        {/* Attendee Distribution */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#0ea5e910', color: '#0ea5e9', padding: '10px', borderRadius: '12px' }}>
                <PieChart size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Attendee Distribution</h3>
            </div>
            <button onClick={() => handleDownload('Attendee_Distribution_Report.pdf')} style={{ background: 'none', border: 'none', color: brandPrimary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              Download PDF <Download size={16} />
            </button>
          </div>

          <div style={{ height: '200px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
             [ Category Distribution Chart Placeholder ]
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Top Category</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>Alumni (52%)</div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Reach</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: brandPrimary, marginTop: '4px' }}>12,480 Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Reports List */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Generated Documents</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Access past reports or generate new ones by date.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
             <div style={{ display: 'flex', gap: '8px' }}>
                <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', color: '#1e293b', fontWeight: 600, outline: 'none' }}>
                  <option>Day</option>
                  {[...Array(31)].map((_, i) => <option key={i+1}>{i+1}</option>)}
                </select>
                <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', color: '#1e293b', fontWeight: 600, outline: 'none' }}>
                  <option>Month</option>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m}>{m}</option>)}
                </select>
                <select style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', color: '#1e293b', fontWeight: 600, outline: 'none' }}>
                  <option>Year</option>
                  {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
                </select>
             </div>
             <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
             <button 
               onClick={() => handleDownload('Custom_Report.pdf')}
               style={{ background: brandPrimary, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(35, 49, 103, 0.15)' }}
             >
               <Download size={14} /> Export Custom
             </button>
          </div>
        </div>

        {[
          { name: 'Annual Alumni Meet Final Report', date: 'March 20, 2024', size: '2.4 MB', type: 'PDF' },
          { name: 'Technical Workshop Registration List', date: 'March 18, 2024', size: '1.1 MB', type: 'Excel' },
          { name: 'Q1 Event Engagement Survey Results', date: 'March 15, 2024', size: '850 KB', type: 'CSV' },
        ].map((file, idx) => (
          <div key={idx} style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 2 ? '1px solid #f8fafc' : 'none', transition: 'background 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.background = '#fcfdfe'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={{ padding: '12px', background: 'rgba(35, 49, 103, 0.05)', color: brandPrimary, borderRadius: '14px' }}>
                  <FileText size={22} />
               </div>
               <div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{file.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Generated on {file.date} • {file.size}</div>
               </div>
            </div>
            <button onClick={() => handleDownload(`${file.name.replace(/\s+/g, '_')}.pdf`)} style={{ padding: '10px 20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = brandPrimary; e.currentTarget.style.color = brandPrimary; }} onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
               <Download size={14} /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventManagerReports;
