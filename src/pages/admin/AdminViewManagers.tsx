import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Mail, Phone, Users, Search, ArrowLeft, Briefcase, Calendar, BookOpen, AlertCircle, Copy, Check, Edit, X
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminViewManagers: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Inline Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ id: '', full_name: '', email: '', phone: '', role: 'job_recruiter', emp_id: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser.role === 'super_admin';

  const brandNavy = '#1a2652';
  const brandCrimson = '#c8102e';

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Use the dedicated managers endpoint as the primary source
      const mgRes = await adminApi.getManagers();
      let combined: any[] = [];

      if (mgRes.success && mgRes.data && (mgRes.data as any).managers) {
        combined = (mgRes.data as any).managers;
      }

      // Super admins also see platform admins — fetch those separately
      if (currentUser.role === 'super_admin') {
        const allRes = await adminApi.getUsers();
        if (allRes.success && allRes.data && allRes.data.users) {
          const adminUsers = allRes.data.users.filter(
            (u: any) => u.role === 'admin' || u.role === 'super_admin'
          );
          // Merge without duplicates
          const existingIds = new Set(combined.map((u: any) => u.id || u._id));
          const newAdmins = adminUsers.filter(
            (u: any) => !existingIds.has(u.id || u._id)
          );
          combined = [...combined, ...newAdmins];
        }
      }

      setUsers(combined);
    } catch (err) {
      console.error("Failed to fetch system managers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setEditForm({
      id: u.id || u._id || '',
      full_name: u.full_name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'job_recruiter',
      emp_id: u.emp_id || ''
    });
    setSaveError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');

    try {
      const res = await adminApi.updateUser(editForm.id, {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        emp_id: editForm.emp_id,
        user_type: 'Staff',
        is_active: editingUser.is_active !== false
      });

      if (res.success) {
        setShowEditModal(false);
        fetchUsers();
      } else {
        setSaveError(res.message || 'Failed to update manager profile.');
      }
    } catch (err) {
      setSaveError('A system error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter((u: any) => {
    const q = searchQuery.toLowerCase();
    const roleLabel = (u.role || '').replace('_', ' ').toLowerCase();
    return (
      (u.full_name || '').toLowerCase().includes(q) || 
      (u.email || '').toLowerCase().includes(q) || 
      (u.emp_id || '').toLowerCase().includes(q) ||
      roleLabel.includes(q)
    );
  });

  // Calculate Statistics
  const totalCount = users.length;
  const adminCount = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
  const recruiterCount = users.filter(u => u.role === 'job_recruiter').length;
  const eventManagerCount = users.filter(u => u.role === 'event_manager').length;
  const courseManagerCount = users.filter(u => u.role === 'course_manager').length;

  return (
    <div style={{ padding: '20px 40px 60px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        .stat-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(26, 38, 82, 0.04);
          border-color: ${brandNavy}15;
        }
        
        .manager-card {
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid #f1f5f9;
          padding: 30px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.01);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .manager-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(26, 38, 82, 0.06);
          border-color: ${brandNavy}20;
        }

        .search-input {
          width: 100%;
          padding: 18px 20px 18px 56px;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          outline: none;
          font-size: 15px;
          font-weight: 500;
          color: #1e293b;
          background: #ffffff;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
        }
        .search-input:focus {
          border-color: ${brandNavy};
          box-shadow: 0 0 0 5px rgba(26, 38, 82, 0.05);
        }

        .btn-action {
          background: #f8fafc;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
        }
        .btn-action:hover {
          background: ${brandNavy}10;
          color: ${brandNavy};
        }
      `}</style>

      {/* Navigation & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              background: '#fff', 
              border: '1px solid #e2e8f0', 
              width: '44px', 
              height: '44px', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              transition: 'all 0.2s' 
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = brandNavy}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <ArrowLeft size={20} color={brandNavy} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Authorized Governance Registry
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
              <Shield size={14} /> Active Managers & Coordinators
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/admin/add-manager')}
          style={{
            padding: '14px 28px',
            background: brandNavy,
            color: '#fff',
            border: 'none',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(26, 38, 82, 0.15)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#0f172a';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = brandNavy;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Add New Manager
        </motion.button>
      </div>

      {/* Live Statistics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}
      >
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Governance Staff</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${brandNavy}10`, color: brandNavy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
          </div>
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>{isLoading ? '...' : totalCount}</span>
        </div>

        {isSuperAdmin && (
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform Admins</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} />
              </div>
            </div>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>{isLoading ? '...' : adminCount}</span>
          </div>
        )}

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Talent Recruiters</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={20} />
            </div>
          </div>
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>{isLoading ? '...' : recruiterCount}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Division Managers</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fce7f3', color: '#9d174d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
          </div>
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>{isLoading ? '...' : eventManagerCount + courseManagerCount}</span>
        </div>
      </motion.div>

      {/* Search and Filters Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ marginBottom: '40px', position: 'relative' }}
      >
        <input 
          type="text" 
          placeholder="Search managers by name, corporate email, employee ID or specialized role..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={22} />
      </motion.div>

      {/* Main Grid View */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '20px' }}>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ width: '48px', height: '48px', border: `3.5px solid ${brandNavy}15`, borderTop: `3.5px solid ${brandNavy}`, borderRadius: '50%' }}
          />
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#64748b' }}>Accessing live system registry...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '100px 40px', background: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9' }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#94a3b8' }}>
            <Users size={28} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>No active accounts found</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500, margin: 0 }}>
            {searchQuery ? "No records matched your search query. Try adjusting keywords." : "The security database contains no manager accounts at this time."}
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
          {filteredUsers.map((u: any, index: number) => {
            // Determine styles based on Role
            let roleLabel = 'Staff Member';
            let roleColor = '#475569';
            let roleBg = '#f1f5f9';
            let avatarBg = '#f1f5f9';
            let avatarText = '#475569';
            let roleIcon = <Users size={16} />;

            if (u.role === 'super_admin') {
              roleLabel = 'Super Admin';
              roleColor = '#b45309';
              roleBg = '#fef3c7';
              avatarBg = '#fef3c7';
              avatarText = '#b45309';
              roleIcon = <Shield size={16} />;
            } else if (u.role === 'admin') {
              roleLabel = 'Platform Admin';
              roleColor = '#4338ca';
              roleBg = '#e0e7ff';
              avatarBg = '#e0e7ff';
              avatarText = '#4338ca';
              roleIcon = <Shield size={16} />;
            } else if (u.role === 'job_recruiter') {
              roleLabel = 'Talent Recruiter';
              roleColor = '#065f46';
              roleBg = '#d1fae5';
              avatarBg = '#d1fae5';
              avatarText = '#065f46';
              roleIcon = <Briefcase size={16} />;
            } else if (u.role === 'event_manager') {
              roleLabel = 'Event Manager';
              roleColor = '#9d174d';
              roleBg = '#fce7f3';
              avatarBg = '#fce7f3';
              avatarText = '#9d174d';
              roleIcon = <Calendar size={16} />;
            } else if (u.role === 'course_manager') {
              roleLabel = 'Course Manager';
              roleColor = '#0369a1';
              roleBg = '#e0f2fe';
              avatarBg = '#e0f2fe';
              avatarText = '#0369a1';
              roleIcon = <BookOpen size={16} />;
            }

            const initials = (u.full_name || '')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <motion.div
                key={u._id || u.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="manager-card"
              >
                {/* Visual Accent Bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: roleColor }} />

                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '20px', 
                      background: avatarBg, 
                      color: avatarText, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 800, 
                      fontSize: '18px',
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)'
                    }}>
                      {initials || <Users size={24} />}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.01em' }}>
                        {u.full_name}
                      </h4>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '11px', 
                        fontWeight: 800, 
                        color: roleColor, 
                        background: roleBg, 
                        padding: '4px 12px', 
                        borderRadius: '8px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.6px' 
                      }}>
                        {roleIcon} {roleLabel}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ID: {u.emp_id || 'N/A'}
                    </span>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: u.is_active !== false ? '#10b981' : '#ef4444' 
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.is_active !== false ? '#10b981' : '#ef4444', display: 'inline-block' }} />
                      {u.is_active !== false ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid #f8fafc', paddingTop: '20px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                      <Mail size={16} /> <span>{u.email}</span>
                    </div>
                    <button 
                      onClick={() => handleCopyEmail(u.email, u._id || u.id || index)}
                      className="btn-action" 
                      title="Copy Email"
                    >
                      {copiedId === (u._id || u.id || index) ? <Check size={16} color="#10b981" /> : <Copy size={15} />}
                    </button>
                  </div>

                  {u.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                      <Phone size={16} /> <span>{u.phone}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f8fafc', paddingTop: '16px', marginTop: 'auto' }}>
                    <button 
                      onClick={() => handleOpenEdit(u)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        color: brandNavy,
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = brandNavy;
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.borderColor = brandNavy;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = brandNavy;
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <Edit size={14} /> Edit Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Inline Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(12px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                width: '100%',
                maxWidth: '650px',
                background: '#ffffff',
                borderRadius: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1.5px solid #f1f5f9',
                overflow: 'hidden'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ padding: '30px 40px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: brandNavy, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={24} color={brandNavy} /> Edit Governance Profile
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    Modify administrative roles and corporate access credentials.
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    background: '#f8fafc',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: '#64748b'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.color = brandCrimson;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#64748b';
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveEdit} style={{ padding: '30px 40px' }}>
                {saveError && (
                  <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', color: brandCrimson, fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <AlertCircle size={20} /> {saveError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Full Legal Name</label>
                    <input 
                      required 
                      type="text" 
                      value={editForm.full_name} 
                      onChange={e => setEditForm({...editForm, full_name: e.target.value})} 
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: '1.5px solid #e2e8f0',
                        outline: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1e293b',
                        background: '#f8fafc',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>



                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Corporate Email</label>
                    <input 
                      required 
                      type="email" 
                      value={editForm.email} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})} 
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: '1.5px solid #e2e8f0',
                        outline: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1e293b',
                        background: '#f8fafc',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Contact Extension</label>
                    <input 
                      type="text" 
                      value={editForm.phone} 
                      onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: '1.5px solid #e2e8f0',
                        outline: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1e293b',
                        background: '#f8fafc',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Operational Role</label>
                    <select 
                      value={editForm.role} 
                      onChange={e => setEditForm({...editForm, role: e.target.value})} 
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: '1.5px solid #e2e8f0',
                        outline: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1e293b',
                        background: '#f8fafc',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="job_recruiter">Job Recruiter (Talent Hub)</option>
                      <option value="event_manager">Event Manager (Engagements)</option>
                      <option value="course_manager">Course Manager (L&D)</option>
                      {isSuperAdmin && <option value="admin">Platform Admin (Full Access)</option>}
                    </select>
                  </div>
                </div>

                {/* Modal Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '24px', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{
                      padding: '12px 28px',
                      background: '#fff',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                      padding: '12px 28px',
                      background: brandNavy,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: isSaving ? 0.7 : 1
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminViewManagers;
