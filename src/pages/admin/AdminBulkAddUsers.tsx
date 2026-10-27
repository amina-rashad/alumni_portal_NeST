import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Download, Trash2, Users, UserPlus, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

interface UserUploadData {
  first_name?: string;
  last_name?: string;
  full_name: string;
  email: string;
  user_type: string;
  batch: string;
  specialization: string;
  phone: string;
  salary?: string;
  joining_date?: string;
  role: string;
}

const AdminBulkAddUsers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultUserType = (location.state as any)?.defaultUserType || 'Alumni';
  const [file, setFile] = useState<File | null>(null);
  const [users, setUsers] = useState<UserUploadData[]>([]);
  const [duplicateEmailsInBatch, setDuplicateEmailsInBatch] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(sheet);
        
        const formattedData: UserUploadData[] = parsedData.map(row => {
          const findVal = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
            return foundKey ? row[foundKey] : '';
          };

          const firstName = String(findVal(['first name', 'firstname', 'first_name']) || '').trim();
          const lastName = String(findVal(['last name', 'lastname', 'last_name']) || '').trim();
          let fullName = String(findVal(['name', 'full name', 'fullname', 'student name', 'user name']) || '').trim();
          if (!fullName && (firstName || lastName)) {
            fullName = `${firstName} ${lastName}`.trim();
          }

          // Joining Date handling (supports Excel Date objects, serial numbers, and string dates)
          let rawJoiningDate = findVal(['joining date', 'joining_date', 'doj', 'date of joining', 'joiningdate']);
          let joiningDateStr = '';
          if (rawJoiningDate instanceof Date) {
            const dd = String(rawJoiningDate.getDate()).padStart(2, '0');
            const mm = String(rawJoiningDate.getMonth() + 1).padStart(2, '0');
            const yyyy = rawJoiningDate.getFullYear();
            joiningDateStr = `${dd}/${mm}/${yyyy}`;
          } else if (typeof rawJoiningDate === 'number') {
            const parsedDate = new Date(Math.round((rawJoiningDate - 25569) * 86400 * 1000));
            if (!isNaN(parsedDate.getTime())) {
              const dd = String(parsedDate.getDate()).padStart(2, '0');
              const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
              const yyyy = parsedDate.getFullYear();
              joiningDateStr = `${dd}/${mm}/${yyyy}`;
            }
          } else if (rawJoiningDate) {
            joiningDateStr = String(rawJoiningDate).trim();
          }

          const userTypeVal = String(findVal(['type', 'user type', 'role', 'category', 'user_type', 'assign role']) || defaultUserType).trim();
          const roleVal = userTypeVal.toLowerCase() === 'system admin' ? 'admin' : 'user';

          return {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            email: String(findVal(['email', 'mail', 'email id', 'email address']) || '').trim().toLowerCase(),
            user_type: userTypeVal,
            batch: String(findVal(['batch', 'year', 'batch/year', 'batch / year']) || 'N/A'),
            specialization: String(findVal(['specialization', 'branch', 'stream', 'department', 'specialization / department']) || 'N/A'),
            phone: String(findVal(['phone', 'phone number', 'mobile', 'contact']) || ''),
            salary: String(findVal(['salary', 'salary / stipend', 'stipend', 'compensation']) || ''),
            joining_date: joiningDateStr,
            role: roleVal
          };
        }).filter(u => u.full_name && u.email);

        const seenInFile = new Set<string>();
        const duplicatesInFile = new Set<string>();
        formattedData.forEach(u => {
          const em = (u.email || '').trim().toLowerCase();
          if (seenInFile.has(em)) {
            duplicatesInFile.add(em);
          } else {
            seenInFile.add(em);
          }
        });

        setDuplicateEmailsInBatch(duplicatesInFile);

        if (formattedData.length === 0) {
          toast.error('No valid users found. Ensure your Excel has "Email" and name columns ("First Name", "Last Name", or "Name").');
        } else {
          setUsers(formattedData);
          if (duplicatesInFile.size > 0) {
            toast(`Parsed ${formattedData.length} records. Notice: ${duplicatesInFile.size} duplicate email(s) found in uploaded file. Duplicate rows will be automatically skipped.`, { icon: '⚠️' });
          } else {
            toast.success(`Parsed ${formattedData.length} users successfully`);
          }
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

  const [stats, setStats] = useState({ added: 0, skipped: 0 });

  const handleBulkAdd = async () => {
    if (users.length === 0 || !file) return;
    
    setIsProcessing(true);
    try {
      const res = await adminApi.bulkAddUsers({ 
        users, 
        filename: file.name 
      });
      if (res.success) {
        setStats({ 
          added: res.data.added_count || 0, 
          skipped: res.data.skipped_count || 0 
        });
        setIsSuccess(true);
        toast.success(res.message || 'Users added successfully');
      } else {
        toast.error(res.message || 'Failed to add users');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error during bulk add');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      { 
        'First Name': 'Aman', 
        'Last Name': 'Abdulla', 
        'Email': 'aman@example.com', 
        'Phone': '9847186044', 
        'User Type': 'IV Student', 
        'Salary': '25000', 
        'Joining Date': '01/06/2024', 
        'Batch': '2024-2026', 
        'Specialization': 'B.Tech Robotics' 
      },
      { 
        'First Name': 'Jane', 
        'Last Name': 'Doe', 
        'Email': 'jane@example.com', 
        'Phone': '9876543210', 
        'User Type': 'Intern', 
        'Salary': '15000', 
        'Joining Date': '15/07/2024', 
        'Batch': '2024', 
        'Specialization': 'Computer Science' 
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Template");
    XLSX.writeFile(wb, "Bulk_User_Import_Template.xlsx");
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/admin/users')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px', fontWeight: 600 }}
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1a2652', margin: 0 }}>Bulk User Onboarding</h1>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '16px' }}>Import multiple users simultaneously using an Excel spreadsheet with full Add User field support.</p>
      </div>

      {!isSuccess ? (
        <div style={{ display: 'grid', gridTemplateColumns: users.length > 0 ? '360px 1fr' : '1fr', gap: '32px' }}>
          {/* Upload Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
              style={{
                border: `2px dashed ${dragActive ? '#1a2652' : '#e2e8f0'}`,
                borderRadius: '24px',
                padding: '40px 20px',
                textAlign: 'center',
                background: dragActive ? '#f8fafc' : '#fff',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileUpload}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
              <div style={{ width: '64px', height: '64px', background: 'rgba(26, 38, 82, 0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#1a2652' }}>
                <Upload size={32} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>{file ? file.name : 'Click or drag Excel file'}</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Supports .xlsx, .xls and .csv formats</p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={downloadTemplate}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '16px', borderRadius: '16px',
                  background: '#f1f5f9', color: '#475569', border: 'none',
                  fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                }}
              >
                <Download size={20} /> Template
              </button>
              <button 
                onClick={() => navigate('/admin/users/bulk-history')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '16px', borderRadius: '16px',
                  background: 'rgba(26, 38, 82, 0.05)', color: '#1a2652', border: 'none',
                  fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                }}
              >
                <History size={20} /> View History
              </button>
            </div>

            {users.length > 0 && (
              <button 
                onClick={handleBulkAdd}
                disabled={isProcessing}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  width: '100%', padding: '18px', borderRadius: '16px',
                  background: '#1a2652', color: '#fff', border: 'none',
                  fontSize: '16px', fontWeight: 700, cursor: isProcessing ? 'wait' : 'pointer',
                  boxShadow: '0 10px 20px rgba(26, 38, 82, 0.2)'
                }}
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                Onboard {users.length} Users
              </button>
            )}
          </div>

          {/* Preview Section */}
          {users.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Import Preview ({users.length} Records)</h3>
                <button onClick={() => { setUsers([]); setFile(null); setDuplicateEmailsInBatch(new Set()); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={14} /> Clear
                </button>
              </div>
              {duplicateEmailsInBatch.size > 0 && (
                <div style={{ padding: '12px 24px', background: '#fef2f2', borderBottom: '1px solid #fee2e2', color: '#dc2626', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>Notice: {duplicateEmailsInBatch.size} duplicate email(s) found in uploaded file. Duplicate rows and existing users will be automatically skipped to prevent duplicates.</span>
                </div>
              )}
              <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '500px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <th style={{ padding: '12px 18px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>User</th>
                      <th style={{ padding: '12px 18px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Role / Type</th>
                      <th style={{ padding: '12px 18px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Phone</th>
                      <th style={{ padding: '12px 18px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Salary</th>
                      <th style={{ padding: '12px 18px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Joining Date</th>
                      <th style={{ padding: '12px 18px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Batch / Dept</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f8fafc', background: duplicateEmailsInBatch.has(u.email) ? '#fff7ed' : 'transparent' }}>
                        <td style={{ padding: '12px 18px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{u.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {u.email}
                            {duplicateEmailsInBatch.has(u.email) && (
                              <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                Duplicate in File
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: 700 }}>
                            {u.user_type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 18px', fontSize: '13px', color: '#64748b' }}>{u.phone || '—'}</td>
                        <td style={{ padding: '12px 18px', fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{u.salary ? `₹${u.salary}` : '—'}</td>
                        <td style={{ padding: '12px 18px', fontSize: '13px', color: '#64748b' }}>{u.joining_date || '—'}</td>
                        <td style={{ padding: '12px 18px', fontSize: '12px', color: '#64748b' }}>
                          <div>{u.batch !== 'N/A' ? u.batch : ''}</div>
                          <div style={{ color: '#94a3b8' }}>{u.specialization !== 'N/A' ? u.specialization : ''}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0' }}
        >
          <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1a2652', margin: '0 0 12px' }}>Import Processed</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '32px' }}>
            <div style={{ textAlign: 'center', padding: '16px 32px', background: '#f0fdf4', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Successfully Added</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#16a34a' }}>{stats.added}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px 32px', background: '#fffbeb', borderRadius: '20px', border: '1px solid #fef3c7' }}>
              <div style={{ fontSize: '12px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Skipped (Existing)</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#f59e0b' }}>{stats.skipped}</div>
            </div>
          </div>

          <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            The system has processed your file. Any users with <strong>new emails</strong> have been added. 
            Those with emails already in the database were skipped to protect existing data.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/admin/users')}
              style={{ padding: '14px 32px', borderRadius: '12px', background: '#1a2652', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              Go to User Management
            </button>
            <button 
              onClick={() => navigate('/admin/users/bulk-history')}
              style={{ padding: '14px 32px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              View Detailed Log
            </button>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      {!isSuccess && (
        <div style={{ marginTop: '48px', padding: '32px', background: 'rgba(26, 38, 82, 0.02)', borderRadius: '24px', border: '1px solid rgba(26, 38, 82, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#1a2652' }}>
            <AlertCircle size={24} />
            <h3 style={{ margin: 0, fontWeight: 800 }}>Onboarding Instructions</h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', lineHeight: 1.8, fontSize: '14px' }}>
            <li>Download the template and fill in the user details.</li>
            <li>Supported fields include: <strong>First Name</strong>, <strong>Last Name</strong> (or combined <strong>Name</strong>), <strong>Email</strong>, <strong>Phone</strong>, <strong>User Type</strong>, <strong>Salary</strong>, <strong>Joining Date</strong> (<code>DD/MM/YYYY</code>), <strong>Batch</strong>, and <strong>Specialization</strong>.</li>
            <li><strong>Email</strong> is the unique identifier for each user. Duplicate emails will be skipped.</li>
            <li>User Types include: <code>Alumni</code>, <code>Intern</code>, <code>IV Student</code>, <code>Staff</code>, <code>Trainee</code>, <code>Industrial Student</code>.</li>
            <li>Ensure the file is in <code>.xlsx</code> or <code>.csv</code> format.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminBulkAddUsers;
