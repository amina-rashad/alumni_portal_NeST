import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Download, Trash2, ShieldCheck, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { adminApi } from '../../services/api';
import { getIVCertificatePDF } from '../../utils/CertificateGenerator';
import toast from 'react-hot-toast';

interface StudentData {
  name: string;
  college: string;
  date: string;
  batch: string;
  phone: string;
  email: string;
}

const IssueIVCertificates: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isIssued, setIsIssued] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      processFile(uploadedFile);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(sheet);
        
        console.log("Parsed Excel Data:", parsedData);

        // Expected columns: Name, College, Date, Batch, Phone, Email
        const formattedData: StudentData[] = parsedData.map(row => {
          const findVal = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
            return foundKey ? row[foundKey] : '';
          };

          return {
            name: findVal(['name', 'student name', 'full name', 'participant']),
            college: findVal(['college', 'college name', 'institution', 'university', 'organization']),
            date: findVal(['date', 'visit date', 'date of visit', 'issued date']),
            batch: findVal(['batch', 'batch/year', 'year', 'class']) || '2024',
            phone: String(findVal(['phone', 'mobile', 'contact', 'phone number']) || ''),
            email: String(findVal(['email', 'mail', 'email id', 'e-mail']) || '').trim().toLowerCase()
          };
        }).filter(s => s.name && s.email); // Must have name AND email

        if (formattedData.length === 0) {
          toast.error('No valid students found. Ensure your Excel has "Name" and "Email" columns.');
        } else {
          setStudents(formattedData);
          toast.success(`Parsed ${formattedData.length} students with valid emails`);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse Excel file.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkIssue = async () => {
    if (students.length === 0) return;
    
    setIsProcessing(true);
    try {
      // ... ZIP and saving logic ...
      const zip = new JSZip();
      const mainFolder = zip.folder(`IV_Certificates_Batch_${new Date().getTime()}`);
      
      students.forEach(student => {
        const collegeFolderName = student.college.replace(/[^a-z0-9]/gi, '_');
        const collegeFolder = mainFolder?.folder(collegeFolderName);
        
        const doc = getIVCertificatePDF(student.name, student.batch, student.date);
        const pdfBlob = doc.output('blob');
        const fileName = `${student.name.replace(/\s+/g, '_')}_IV_Certificate.pdf`;
        
        collegeFolder?.file(fileName, pdfBlob);
      });

      const zipContent = await zip.generateAsync({ type: "blob" });
      saveAs(zipContent, `IV_Certificates_Batch_${new Date().getTime()}.zip`);

      const issuedList = JSON.parse(localStorage.getItem('full_issued_iv_certificates') || '[]');
      const newList = [...issuedList, ...students.map(s => ({
        ...s,
        issuedAt: new Date().toISOString()
      }))];
      localStorage.setItem('full_issued_iv_certificates', JSON.stringify(newList));
      
      const cleanEmail = (e: any) => String(e || '').toLowerCase().trim();
      const cleanName = (n: any) => String(n || '').toLowerCase().trim();

      const lookupList = JSON.parse(localStorage.getItem('issued_iv_lookup') || '[]');
      const newLookupList = [...lookupList, ...students.map(s => `${cleanName(s.name)}|${cleanEmail(s.email)}`)];
      localStorage.setItem('issued_iv_lookup', JSON.stringify(newLookupList));
      
      setIsIssued(true);
      toast.success(`Issued ${students.length} certificates!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to issue certificates');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'Name': 'John Doe', 'College': 'CET Trivandrum', 'Date': '2024-05-20', 'Batch': '2024', 'Phone': '9876543210', 'Email': 'john@example.com' },
      { 'Name': 'Jane Smith', 'College': 'MEC', 'Date': '2024-05-22', 'Batch': '2024', 'Phone': '9876543211', 'Email': 'jane@example.com' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "IV_Certificate_Template.xlsx");
  };


  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <button 
            onClick={() => navigate('/admin/iv-students')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1rem', fontWeight: 600 }}
          >
            <ArrowLeft size={18} /> Back to IV Management
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a2652', margin: 0 }}>Bulk Issue Certificates</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Upload an Excel sheet to generate and issue certificates to students.</p>
        </div>
      </div>


      {!isIssued ? (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Upload Zone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}
            style={{
              border: `2px dashed ${dragActive ? '#c8102e' : '#e2e8f0'}`,
              borderRadius: '24px',
              padding: '4rem 2rem',
              textAlign: 'center',
              background: dragActive ? 'rgba(200, 16, 46, 0.02)' : '#fff',
              transition: '0.3s'
            }}
          >
            <div style={{ width: '64px', height: '64px', background: 'rgba(26, 38, 82, 0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <FileSpreadsheet size={32} color="#1a2652" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              {file ? file.name : 'Click to upload or drag and drop'}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Support .xlsx and .csv files with columns: Name, College, Date, Batch</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <label style={{ background: file ? '#f1f5f9' : '#1a2652', color: file ? '#1e293b' : '#fff', padding: '12px 32px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-block', border: file ? '1px solid #e2e8f0' : 'none' }}>
                {file ? 'Change File' : 'Select Excel File'}
                <input type="file" hidden accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
              </label>

              {file && students.length > 0 && (
                <button
                  onClick={handleBulkIssue}
                  disabled={isProcessing}
                  style={{ 
                    background: '#c8102e', color: '#fff', padding: '12px 32px', borderRadius: '12px', 
                    fontWeight: 700, border: 'none', cursor: isProcessing ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(200, 16, 46, 0.2)'
                  }}
                >
                  {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Award size={20} />}
                  Generate Certificates
                </button>
              )}
            </div>
          </div>

          {/* Preview Table */}
          <AnimatePresence>
            {students.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}
              >
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                    Previewing {students.length} Students
                  </h3>
                  <button onClick={() => { setStudents([]); setFile(null); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trash2 size={16} /> Clear List
                  </button>
                </div>
                <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '12px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Student Name</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Institution</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '16px 24px', fontWeight: 700, color: '#1e293b' }}>{s.name}</td>
                          <td style={{ padding: '16px 24px', color: '#64748b' }}>{s.college}</td>
                          <td style={{ padding: '16px 24px', color: '#64748b' }}>{s.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={handleBulkIssue}
                    disabled={isProcessing}
                    style={{ 
                      width: '100%', background: '#1a2652', color: '#fff', padding: '16px', borderRadius: '16px', 
                      fontSize: '1.1rem', fontWeight: 800, border: 'none', cursor: isProcessing ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                    }}
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <ShieldCheck size={22} />}
                    {isProcessing ? 'Issuing Certificates...' : `Confirm & Issue ${students.length} Certificates`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Success State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0' }}
        >
          <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>Certificates Issued!</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            The certificates have been generated and updated for {students.length} students. They can now download them from their dashboard.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/admin/iv-students')}
              style={{ padding: '12px 32px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}
            >
              Back to Dashboard
            </button>
            <button 
              onClick={() => { setIsIssued(false); setStudents([]); setFile(null); }}
              style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#1a2652', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              Issue More
            </button>
          </div>
        </motion.div>
      )}

      {/* Help Info */}
      {!isIssued && students.length === 0 && (
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(26, 38, 82, 0.03)', borderRadius: '24px', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <AlertCircle size={24} color="#1a2652" />
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Important Instructions</h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '8px', color: '#64748b', fontSize: '14px' }}>
              <li>• Ensure the first row of your Excel contains headers (Name, College, Date, Email).</li>
              <li>• Email is mandatory for student verification and record accuracy.</li>
              <li>• Student names must match their registered names for verification.</li>
              <li>• The date format should be YYYY-MM-DD or similar standard formats.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueIVCertificates;
