import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Shield, Bell, 
  Lock, Mail, Globe, Eye,
  CheckCircle2, Save,
  ChevronRight, Users,
  Heart, Building, Link2,
  AlertTriangle, CreditCard,
  User, Database, Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SettingsTab = 'account' | 'security' | 'visibility' | 'data' | 'communications';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingItem, setEditingItem] = useState<{label: string, value: string} | null>(null);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  const tabs = [
    { id: 'account', label: 'Account preferences', icon: User },
    { id: 'security', label: 'Sign-in & security', icon: Shield },
    { id: 'visibility', label: 'Visibility', icon: Eye },
    { id: 'data', label: 'Data privacy', icon: Database },
    { id: 'communications', label: 'Communications', icon: Bell },
  ];

  return (
    <div style={{ background: '#f4f2ee', minHeight: '100vh', padding: '2rem 0', fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Fira Sans", Ubuntu, Oxygen, "Oxygen Sans", Cantarell, "Droid Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Lucida Grande", Helvetica, Arial, sans-serif' }}>
      <div style={{ maxWidth: '1128px', margin: '0 auto', display: 'grid', gridTemplateColumns: '312px 1fr', gap: '24px' }}>
        
        {/* LinkedIn-style Sidebar */}
        <aside style={{ background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden', height: 'fit-content', position: 'sticky', top: '24px' }}>
          <div style={{ padding: '24px 24px 16px' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ background: 'none', border: 'none', color: '#c8102e', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}
            >
              <ArrowLeft size={16} /> Back to NeST
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'rgba(0,0,0,0.9)', margin: 0 }}>Settings</h1>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  border: 'none',
                  borderLeft: `4px solid ${activeTab === tab.id ? '#c8102e' : 'transparent'}`,
                  background: activeTab === tab.id ? '#fff1f1' : 'white',
                  color: activeTab === tab.id ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: '0.2s all'
                }}
              >
                <tab.icon size={20} style={{ color: activeTab === tab.id ? '#c8102e' : 'rgba(0,0,0,0.6)' }} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main style={{ minHeight: '800px' }}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '32px' }}
          >
            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ background: '#c8102e', color: 'white', padding: '12px 24px', borderRadius: '4px', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}
                >
                  Settings updated successfully
                </motion.div>
              )}
            </AnimatePresence>

            <header style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 400, color: 'rgba(0,0,0,0.9)', margin: '0 0 8px' }}>
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
            </header>

            {/* LinkedIn-style Settings List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              
              {activeTab === 'account' && (
                <>
                  <Section title="Profile Information" />
                  <SettingItem 
                    label="Name, location, and industry" 
                    desc="Noblesibi3 • Senior Engineer • Kochi" 
                    isActionable
                    onClick={() => setEditingItem({label: 'Identity', value: 'Noblesibi3 • Senior Engineer • Kochi'})}
                  />
                  <SettingItem 
                    label="Personal demographics" 
                    desc="Manage information about your identity" 
                    isActionable
                    onClick={() => setEditingItem({label: 'Demographics', value: 'Not specified'})}
                  />
                  
                  <Section title="Display" />
                  <SettingItem label="Dark mode" desc="Off" isActionable onClick={() => setEditingItem({label: 'Dark mode', value: 'Off'})} />
                  
                  <Section title="General preferences" />
                  <SettingItem label="Language" desc="English" isActionable onClick={() => setEditingItem({label: 'Language', value: 'English'})} />
                  <SettingItem label="Content language" desc="English" isActionable onClick={() => setEditingItem({label: 'Content language', value: 'English'})} />
                  <SettingItem label="Autoplay videos" desc="On" isActionable onClick={() => setEditingItem({label: 'Autoplay videos', value: 'On'})} />
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <Section title="Account access" />
                  <SettingItem label="Email addresses" desc="alumni@nest.digital" isActionable onClick={() => setEditingItem({label: 'Primary Email', value: 'alumni@nest.digital'})} />
                  <SettingItem label="Phone numbers" desc="Add a phone number" isActionable onClick={() => setEditingItem({label: 'Phone number', value: ''})} />
                  <SettingItem label="Secondary email" desc="noble.sibi@personal.com" isActionable onClick={() => setEditingItem({label: 'Recovery email', value: 'noble.sibi@personal.com'})} />
                  
                  <Section title="Login security" />
                  <SettingItem label="Two-step verification" desc="Off" isActionable onClick={() => setEditingItem({label: 'Two-step verification', value: 'Off'})} />
                  <SettingItem label="Where you're signed in" desc="3 sessions active" isActionable onClick={() => setEditingItem({label: 'Active sessions', value: '3'})} />
                  <SettingItem label="Recognized devices" desc="2 devices saved" isActionable onClick={() => setEditingItem({label: 'Known devices', value: '2'})} />
                </>
              )}

              {activeTab === 'visibility' && (
                <>
                  <Section title="Visibility of your profile & network" />
                  <SettingItem label="Profile viewing options" desc="Your name and headline" isActionable onClick={() => setEditingItem({label: 'Viewer visibility', value: 'Full name'})} />
                  <SettingItem label="Edit your public profile" desc="Control how you appear to search engines" isActionable onClick={() => navigate('/profile')} />
                  <SettingItem label="Who can see your connections" desc="Only you" isActionable onClick={() => setEditingItem({label: 'Connection visibility', value: 'Only me'})} />
                  
                  <Section title="Visibility of your activity" />
                  <SettingItem label="Share profile updates with your network" desc="On" isActionable onClick={() => setEditingItem({label: 'Activity sharing', value: 'On'})} />
                  <SettingItem label="Mentorship status" desc="Available to mentor" isActionable onClick={() => setEditingItem({label: 'Mentorship availability', value: 'Public'})} />
                </>
              )}

              {activeTab === 'data' && (
                <>
                  <Section title="How NeST uses your data" />
                  <SettingItem label="Manage your data and privacy" desc="Download a copy of your data" isActionable onClick={() => setEditingItem({label: 'Data management', value: 'Standard'})} />
                  <SettingItem label="Search history" desc="Clear your search history" isActionable onClick={() => setEditingItem({label: 'Search history', value: '30 days'})} />
                  
                  <Section title="Job seeking preferences" />
                  <SettingItem label="Job application settings" desc="Manage resumes and application data" isActionable onClick={() => setEditingItem({label: 'Application defaults', value: 'LinkedIn Resume'})} />
                  <SettingItem label="Signal your interest to recruiters" desc="On" isActionable onClick={() => setEditingItem({label: 'Recruiter signaling', value: 'On'})} />
                </>
              )}

              {activeTab === 'communications' && (
                <>
                  <Section title="How you receive notifications" />
                  <SettingItem label="On NeST" desc="Web and Mobile app" isActionable onClick={() => setEditingItem({label: 'In-app notifications', value: 'All'})} />
                  <SettingItem label="Email" desc="Standard notifications" isActionable onClick={() => setEditingItem({label: 'Email frequency', value: 'Immediate'})} />
                  <SettingItem label="Push" desc="Interactive alerts" isActionable onClick={() => setEditingItem({label: 'Push alerts', value: 'Enabled'})} />
                  
                  <Section title="Who can reach you" />
                  <SettingItem label="Invitations to connect" desc="Everyone on NeST" isActionable onClick={() => setEditingItem({label: 'Who can invite', value: 'Everyone'})} />
                  <SettingItem label="Messages" desc="Allow messages from people you follow" isActionable onClick={() => setEditingItem({label: 'Messaging rules', value: 'Mutuals only'})} />
                </>
              )}
            </div>

            {/* LinkedIn-style Modal for Active Controls */}
            <AnimatePresence>
              {editingItem && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    style={{ background: 'white', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '552px', boxShadow: '0 12px 24px rgba(0,0,0,0.2)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{editingItem.label}</h3>
                    </div>
                    
                    <div style={{ marginBottom: '32px' }}>
                      <label style={{ display: 'block', fontSize: '14px', color: 'rgba(0,0,0,0.6)', marginBottom: '8px' }}>Update your settings for {editingItem.label.toLowerCase()}</label>
                      <input 
                        type="text" 
                        defaultValue={editingItem.value}
                        style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #c8102e', fontSize: '16px', outline: 'none' }}
                        autoFocus
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => setEditingItem(null)}
                        style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.6)', fontWeight: 600, fontSize: '16px', cursor: 'pointer', padding: '6px 16px' }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => { setEditingItem(null); handleSave(); }}
                        style={{ background: '#c8102e', color: 'white', border: 'none', borderRadius: '1600px', padding: '6px 24px', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}
                      >
                        Save
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Bottom Save Action */}
            <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
               <button 
                 onClick={handleSave}
                 style={{ 
                   background: '#c8102e', 
                   color: 'white', 
                   border: 'none', 
                   borderRadius: '1600px', 
                   padding: '6px 16px', 
                   fontWeight: 600, 
                   fontSize: '16px', 
                   cursor: 'pointer' 
                 }}
               >
                 {isSaving ? 'Saving...' : 'Save changes'}
               </button>
            </div>
          </motion.div>
        </main>
      </div>

      <style>{`
        body { margin: 0; background: #f4f2ee; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

/* --- LinkedIn Style Components --- */

const Section = ({ title }: { title: string }) => (
  <div style={{ padding: '24px 0 12px', borderBottom: '1px solid #e0e0e0', marginBottom: '8px' }}>
    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(0,0,0,0.9)', margin: 0 }}>{title}</h3>
  </div>
);

const SettingItem = ({ label, desc, onClick, onAction, isActionable }: { label: string, desc: string, onClick?: () => void, onAction?: () => void, isActionable?: boolean }) => (
  <div 
    onClick={onClick || onAction}
    style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 0', 
      borderBottom: '1px solid #f3f2f0',
      cursor: onClick || onAction || isActionable ? 'pointer' : 'default'
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(0,0,0,0.9)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>{desc}</div>
    </div>
    <div style={{ color: '#c8102e', fontSize: '14px', fontWeight: 600, marginLeft: '16px' }}>
      {onClick || onAction || isActionable ? 'Change' : ''}
    </div>
  </div>
);

export default AccountSettings;
