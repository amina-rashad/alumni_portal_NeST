import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Calendar, User, 
  Shield, CheckCircle, Briefcase, GraduationCap, Banknote, Edit3
} from 'lucide-react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

const AdminUserView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await adminApi.getUserById(id);
        if (res.success && res.data?.user) {
          setUser(res.data.user);
        } else {
          toast.error(res.message || 'User not found');
          navigate('/admin/users');
        }
      } catch (err) {
        toast.error('Failed to load user details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTop: '4px solid #1a2652', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!user) return null;

  const formatDisplayDate = (d?: string): string => {
    if (!d || d === 'N/A') return 'N/A';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
      const [yyyy, mm, dd] = d.substring(0, 10).split('-');
      return `${dd}/${mm}/${yyyy}`;
    }
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      const dd = String(parsed.getDate()).padStart(2, '0');
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const yyyy = parsed.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
    return d;
  };

  const formatSalary = (s?: string | number): string => {
    if (!s || s === '0' || s === 'N/A') return 'Not Specified';
    const str = String(s).replace(/,/g, '').trim();
    const num = Number(str);
    if (!isNaN(num) && num > 0) {
      return `₹${num.toLocaleString('en-IN')}`;
    }
    return String(s);
  };

  const joiningDateValue = user.joining_date ? formatDisplayDate(user.joining_date) : formatDisplayDate(user.created_at);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/admin/users')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <button
          onClick={() => navigate(`/admin/users/edit/${user.id || id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1a2652',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(26, 38, 82, 0.2)'
          }}
        >
          <Edit3 size={15} /> Edit User
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* User Identity Banner */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          border: '1px solid #e2e8f0', 
          padding: '28px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ 
            width: '84px', 
            height: '84px', 
            borderRadius: '20px', 
            background: '#1a2652', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '34px', 
            fontWeight: 800,
            flexShrink: 0
          }}>
            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>
              {user.full_name}
            </h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '8px', 
                background: user.user_type === 'Applicant' || !user.user_type ? '#fef3c7' : '#e0e7ff', 
                color: user.user_type === 'Applicant' || !user.user_type ? '#b45309' : '#4338ca', 
                fontSize: '12px', 
                fontWeight: 700 
              }}>
                {user.user_type || 'Applicant'}
              </span>
            </div>
          </div>
        </div>

        {/* User Details Grid Card (matching Add User Form fields) */}
        <div style={{ 
          background: '#fff', 
          borderRadius: '20px', 
          border: '1px solid #e2e8f0', 
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '17px', fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            Account & Profile Details
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            {/* Full Name */}
            <DetailItem 
              icon={<User size={18} color="#1a2652" />} 
              label="Full Name" 
              value={user.full_name || 'N/A'} 
            />

            {/* Email Address */}
            <DetailItem 
              icon={<Mail size={18} color="#1a2652" />} 
              label="Email Address" 
              value={user.email || 'N/A'} 
            />

            {/* Phone Number */}
            <DetailItem 
              icon={<Phone size={18} color="#1a2652" />} 
              label="Phone Number" 
              value={user.phone || 'Not Provided'} 
            />

            {/* Assign Role / User Type */}
            <DetailItem 
              icon={<Shield size={18} color="#1a2652" />} 
              label="Assigned Role" 
              value={user.user_type || 'Alumni'} 
            />

            {/* Salary / Stipend */}
            <DetailItem 
              icon={<Banknote size={18} color="#1a2652" />} 
              label="Salary / Stipend" 
              value={formatSalary(user.salary)} 
            />

            {/* Joining Date */}
            <DetailItem 
              icon={<Calendar size={18} color="#1a2652" />} 
              label="Joining Date (DD/MM/YYYY)" 
              value={joiningDateValue} 
            />

            {/* Batch / Year */}
            <DetailItem 
              icon={<GraduationCap size={18} color="#1a2652" />} 
              label="Batch / Year" 
              value={user.batch && user.batch !== 'N/A' ? user.batch : 'N/A'} 
            />

            {/* Specialization / Department */}
            <DetailItem 
              icon={<Briefcase size={18} color="#1a2652" />} 
              label="Specialization / Department" 
              value={user.specialization && user.specialization !== 'N/A' ? user.specialization : 'N/A'} 
            />

          </div>
        </div>

      </div>
    </div>
  );
};

const DetailItem: React.FC<{ icon: any, label: string, value: string }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
    <div style={{ 
      width: '38px', 
      height: '38px', 
      borderRadius: '10px', 
      background: '#f8fafc', 
      border: '1px solid #e2e8f0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ overflow: 'hidden' }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: 600, wordBreak: 'break-word' }}>
        {value}
      </div>
    </div>
  </div>
);

export default AdminUserView;
