import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Calendar, User, 
  Shield, CheckCircle, Clock, FileText, 
  Briefcase, GraduationCap, Award, MapPin
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => navigate('/admin/users')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '24px', fontWeight: 600 }}
      >
        <ArrowLeft size={20} /> Back to User Governance
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        {/* Main Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
             <div style={{ 
               width: '100px', height: '100px', borderRadius: '24px', 
               background: '#1a2652', color: '#fff', display: 'flex', 
               alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 800 
             }}>
               {user.full_name?.charAt(0)}
             </div>
             <div>
               <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{user.full_name}</h1>
               <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                 <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: 700 }}>{user.role?.toUpperCase()}</span>
                 <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: 700 }}>{user.user_type}</span>
               </div>
             </div>
          </div>

          <section style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Professional Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <InfoItem icon={<Briefcase size={18} />} label="Specialization" value={user.specialization} />
              <InfoItem icon={<GraduationCap size={18} />} label="Batch/Year" value={user.batch} />
              <InfoItem icon={<Clock size={18} />} label="Joined At" value={new Date(user.created_at).toLocaleDateString()} />
              <InfoItem icon={<Shield size={18} />} label="Email Status" value={user.is_email_verified ? 'Verified' : 'Pending'} />
            </div>
            {user.bio && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Biography</div>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{user.bio}</p>
              </div>
            )}
          </section>

          {/* Activity/Stats */}
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <StatCard label="Job Applications" value={user.application_count || 0} icon={<FileText size={20} />} />
            <StatCard label="Certificates Issued" value={user.certificates?.length || 0} icon={<Award size={20} />} />
          </section>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Contact Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ContactLink icon={<Mail size={18} />} label="Email" value={user.email} />
              <ContactLink icon={<Phone size={18} />} label="Phone" value={user.phone || 'Not Provided'} />
              <ContactLink icon={<MapPin size={18} />} label="Location" value={user.location || 'Not Specified'} />
            </div>
          </section>

          <section style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Account Security</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Account Status</span>
                <span style={{ 
                  padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                  background: user.is_active ? '#dcfce7' : '#fee2e2',
                  color: user.is_active ? '#16a34a' : '#ef4444'
                }}>
                  {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Last login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
              </div>
              <button 
                onClick={async () => {
                  if (window.confirm('Reset this user\'s password to "Welcome@NeST2024"?')) {
                    try {
                      const res = await adminApi.updateUser(user.id, { password: 'Welcome@NeST2024' });
                      if (res.success) {
                        toast.success('Password reset to Welcome@NeST2024');
                      } else {
                        toast.error(res.message || 'Failed to reset password');
                      }
                    } catch (err) {
                      toast.error('Error resetting password');
                    }
                  }
                }}
                style={{ 
                  marginTop: '12px', padding: '12px', borderRadius: '10px', 
                  background: '#f1f5f9', color: '#1a2652', border: 'none', 
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: '0.2s' 
                }}
              >
                Reset to Default Password
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: any, label: string, value: string }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: '12px' }}>
    <div style={{ color: '#94a3b8' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>{value || 'N/A'}</div>
    </div>
  </div>
);

const ContactLink: React.FC<{ icon: any, label: string, value: string }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2652' }}>{icon}</div>
    <div style={{ overflow: 'hidden' }}>
      <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden' }}>{value}</div>
    </div>
  </div>
);

const StatCard: React.FC<{ label: string, value: number | string, icon: any }> = ({ label, value, icon }) => (
  <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(26, 38, 82, 0.05)', color: '#1a2652', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{label}</div>
    </div>
  </div>
);

export default AdminUserView;
