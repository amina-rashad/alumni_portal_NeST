import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, FileText, Calendar, CheckCircle, 
  AlertCircle, ArrowLeft, Loader2, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

const AdminBulkUploadHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await adminApi.getBulkUploadHistory();
        if (res.success) {
          setHistory(res.data.history);
        }
      } catch (err) {
        toast.error('Failed to load upload history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="#1a2652" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => navigate('/admin/users/bulk')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px', fontWeight: 600 }}
      >
        <ArrowLeft size={20} /> Back to Bulk Onboarding
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1a2652', margin: 0 }}>Onboarding History</h1>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '16px' }}>Detailed logs of all bulk user import operations.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {history.length > 0 ? history.map((log) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={log.id}
            style={{ 
              background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', 
              padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: 800, marginBottom: '4px' }}>
                <FileText size={18} color="#64748b" /> {log.filename}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Success</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>{log.added_count}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Skipped</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>{log.skipped_count}</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Status</div>
              {log.errors?.length === 0 ? (
                <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} /> Clean Import
                </span>
              ) : (
                <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} /> {log.errors.length} Issues
                </span>
              )}
            </div>
          </motion.div>
        )) : (
          <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
            <History size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: 0, color: '#64748b' }}>No upload history found.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBulkUploadHistory;
