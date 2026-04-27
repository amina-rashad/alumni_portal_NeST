import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Bell, Save, 
  CheckCircle2, Briefcase, Mail
} from 'lucide-react';

type TabType = 'Profile' | 'Security' | 'Notifications';

const RecruiterSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Profile');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'Profile', icon: <User size={18} />, label: 'Profile Information' },
    { id: 'Security', icon: <Shield size={18} />, label: 'Security & Login' },
    { id: 'Notifications', icon: <Bell size={18} />, label: 'Notifications' },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Recruiter Profile</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Manage your personal details and how candidates see you.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Full Name</label>
                  <input type="text" defaultValue="NeST Hiring Team" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Professional Title</label>
                  <input type="text" defaultValue="Senior Talent Acquisition" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Company Description for Candidates</label>
                  <textarea rows={4} defaultValue="We are hiring top talent at NeST Digital." style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none', resize: 'none' }} />
               </div>
            </div>
          </div>
        );
      case 'Security':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
             <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Security Settings</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Keep your recruiter account secure.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Current Password</label>
                  <input type="password" placeholder="••••••••" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none', maxWidth: '400px' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>New Password</label>
                  <input type="password" placeholder="Enter new password" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none', maxWidth: '400px' }} />
               </div>
            </div>
          </div>
        );
      case 'Notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Notifications</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Choose what alerts you receive.</p>
            </div>
            
            {[
              { label: 'New Application Alerts', desc: 'Receive an email when candidates apply to your jobs.', icon: <Briefcase size={18} color="#3b82f6" /> },
              { label: 'Platform Announcements', desc: 'Updates from the administrator.', icon: <Mail size={18} color="#10b981" /> }
            ].map((setting, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '20px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                   <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>{setting.icon}</div>
                   <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{setting.label}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{setting.desc}</p>
                   </div>
                </div>
                <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Recruiter Settings</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Configure your profile, security, and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '12px 28px', 
            background: isSaving ? '#10b981' : '#c8102e', 
            border: 'none', 
            borderRadius: '14px', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            minWidth: '160px',
            justifyContent: 'center'
          }}
        >
          {isSaving ? <><CheckCircle2 size={18} /> Saved</> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Sidebar Nav */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                borderRadius: '14px',
                border: 'none',
                background: activeTab === tab.id ? '#1a2652' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '40px', minHeight: '500px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RecruiterSettings;
