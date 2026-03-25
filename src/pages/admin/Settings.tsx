import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, Globe, Bell, 
  Shield, Server, Save, Mail, AlertTriangle, 
  ToggleLeft, ToggleRight, CheckCircle2,
  Users, Briefcase, GraduationCap, MessageSquare,
  School, Zap
} from 'lucide-react';

type TabType = 'General' | 'Recruitment' | 'Academic' | 'Community' | 'System';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('General');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'General', icon: <Globe size={18} />, label: 'Branding & Core' },
    { id: 'Recruitment', icon: <Briefcase size={18} />, label: 'Recruitment' },
    { id: 'Academic', icon: <GraduationCap size={18} />, label: 'Academic & Learning' },
    { id: 'Community', icon: <MessageSquare size={18} />, label: 'Social & Feed' },
    { id: 'System', icon: <Server size={18} />, label: 'System Access' }
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Portal Identity</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Manage the core brand and support information for NeST.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Portal Branding Name</label>
                  <input type="text" defaultValue="NeST Alumni Portal" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Alumni Support Email</label>
                  <input type="email" defaultValue="alumni.support@nest.com" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Office Address (Contact)</label>
                  <input type="text" defaultValue="Kochi, Kerala, India" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Newsletter Frequency</label>
                  <select style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }}>
                    <option>Weekly Digest</option>
                    <option>Monthly Digest</option>
                    <option>Real-time Updates</option>
                  </select>
               </div>
            </div>
          </div>
        );
      case 'Recruitment':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Recruitment Workflow</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Control how jobs and applications are managed.</p>
            </div>
            
            {[
              { label: 'External Job Posting', desc: 'Allows partner companies to post jobs directly.', status: true, icon: <Briefcase size={18} color="#10b981" /> },
              { label: 'Auto-Verification', desc: 'Automatically verify alumni based on employee ID.', status: true, icon: <Shield size={18} color="#3b82f6" /> },
              { label: 'AI Match Scoring', desc: 'Enable AI-driven candidate matching for recruiters.', status: true, icon: <Zap size={18} color="#8b5cf6" /> }
            ].map((setting, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '20px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                   <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>{setting.icon}</div>
                   <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{setting.label}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{setting.desc}</p>
                   </div>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: setting.status ? '#3b82f6' : '#cbd5e1' }}>
                  {setting.status ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
                </button>
              </div>
            ))}
          </div>
        );
      case 'Academic':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Learning & Assessment</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Configure quiz logic and course availability.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '16px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Min. Quiz Pass Percentage</label>
                  <input type="number" defaultValue="75" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Max. Quiz Retakes</label>
                  <input type="number" defaultValue="3" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', outline: 'none' }} />
               </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '16px', background: '#f8fafc', border: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <CheckCircle2 color="#10b981" />
                 <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Auto-issue Certificates on completion</span>
               </div>
               <button style={{ color: '#3b82f6', background: 'transparent', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Enabled</button>
            </div>
          </div>
        );
      case 'Community':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Social & Community Engagement</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Manage the social interaction health of the platform.</p>
            </div>

            {[
              { label: 'Social Feed Visibility', desc: 'Allows users to post and share updates on the news feed.', status: true, icon: <MessageSquare size={18} color="#ec4899" /> },
              { label: 'Post Moderation', desc: 'Manual approval required by admin for every post.', status: false, icon: <Shield size={18} color="#ef4444" /> },
              { label: 'Student-Alumni Messaging', desc: 'Allows direct connection between alumni and IV students.', status: true, icon: <Users size={18} color="#3b82f6" /> },
              { label: 'Event Registration', desc: 'Allow users to RSVP for upcoming portal events.', status: true, icon: <Calendar size={18} color="#06b6d4" /> }
            ].map((setting, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '20px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                   <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>{setting.icon}</div>
                   <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{setting.label}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{setting.desc}</p>
                   </div>
                </div>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: setting.status ? '#3b82f6' : '#cbd5e1' }}>
                  {setting.status ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
                </button>
              </div>
            ))}
          </div>
        );
      case 'System':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Portal Governance</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>General system behavior and global access rules.</p>
            </div>

            <div style={{ padding: '24px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                 <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#ef4444', margin: 0 }}>Maintenance Override</h4>
                 <div style={{ padding: '4px 10px', background: '#ef444410', color: '#ef4444', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>DEACTIVATED</div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>Enabling this will restrict all user access and redirect to the maintenance page.</p>
              <button style={{ padding: '12px 24px', background: '#ef444410', color: '#ef4444', border: '1px solid #ef444420', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>Activate Emergency Mode</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
               <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>Export System Backups</span>
                  <button style={{ color: '#3b82f6', background: 'transparent', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Run Now</button>
               </div>
               <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>Clear Social Cache</span>
                  <button style={{ color: '#64748b', background: 'transparent', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Execute</button>
               </div>
            </div>
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
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Portal Governance Settings</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Configure recruitment, learning, and interaction rules for NeST.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '12px 28px', 
            background: isSaving ? '#10b981' : '#1e293b', 
            border: 'none', 
            borderRadius: '14px', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: '160px',
            justifyContent: 'center'
          }}
        >
          {isSaving ? <><CheckCircle2 size={18} /> Settings Locked</> : <><Save size={18} /> Deploy Changes</>}
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
                background: activeTab === tab.id ? '#3b82f610' : 'transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
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
        <div style={{ flex: 1, background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '40px', minHeight: '600px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
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

export default Settings;
