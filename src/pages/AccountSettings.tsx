import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Shield, Bell, 
  Lock, Mail, Globe, Eye,
  CheckCircle2, Save,
  ChevronRight, Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'privacy';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Account <span style={{ color: '#d32f2f' }}>Settings</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '1.1rem' }}>Manage your personal information and security preferences.</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Settings Sidebar Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: 'none',
                background: activeTab === tab.id ? '#0F172A' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#64748B',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <tab.icon size={18} /> {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="active-tab" style={{ marginLeft: 'auto' }}>
                  <ChevronRight size={14} />
                </motion.div>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="luxury-card"
          style={{ padding: '2.5rem', border: '1px solid #E2E8F0' }}
        >
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ background: '#ecfdf5', color: '#059669', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}
              >
                <CheckCircle2 size={18} /> Changes saved successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', border: '2px solid #E2E8F0' }}>
                    NS
                  </div>
                  <button style={{ position: 'absolute', bottom: 0, right: 0, background: '#0F172A', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Profile Photo</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Public for all alumni in the network.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-field">
                  <label>Full Name</label>
                  <input type="text" defaultValue="Noble Sibi" />
                </div>
                <div className="input-field">
                  <label>Email Address</label>
                  <input type="email" defaultValue="alumni@nest.digital" />
                </div>
              </div>

              <div className="input-field">
                <label>Professional Bio</label>
                <textarea defaultValue="Senior Engineer at NeST Digital. Passionate about cybernetics and system optimization." style={{ minHeight: '100px', resize: 'none' }} />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="input-field">
                <label>Current Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="input-field">
                <label>New Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Lock size={20} color="#64748B" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Two-Factor Authentication</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Enable</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { title: 'Email Notifications', desc: 'Performance reports and activity digests.', icon: Mail },
                { title: 'Push Notifications', desc: 'Instant updates on connections and jobs.', icon: Bell },
                { title: 'Monthly Insights', desc: 'Detailed analytics on your network growth.', icon: Globe },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', background: '#F8FAFC', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                       <item.icon size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{item.desc}</p>
                    </div>
                  </div>
                  <div style={{ width: '44px', height: '24px', background: i < 2 ? '#d32f2f' : '#E2E8F0', borderRadius: '12px', padding: '3px', cursor: 'pointer' }}>
                     <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', marginLeft: i < 2 ? 'auto' : '0' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'privacy' && (
             <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Eye size={48} color="#94A3B8" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Privacy Control</h3>
                <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>You have full control over who sees your activity. Update your visibility settings anytime.</p>
             </div>
          )}

          {/* Footer Save Actions */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
             <button style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #E2E8F0', color: '#64748B', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Discard Changes</button>
             <button 
               onClick={handleSave}
               disabled={isSaving}
               style={{ 
                 padding: '0.75rem 2rem', 
                 background: '#0F172A', 
                 color: 'white', 
                 border: 'none', 
                 borderRadius: '12px', 
                 fontWeight: 800, 
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '0.5rem',
                 boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
               }}
             >
               {isSaving ? 'Saving...' : 'Save Settings'} <Save size={18} />
             </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .luxury-card {
           background: #ffffff;
           border-radius: 28px;
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }
        .input-field {
           display: flex;
           flex-direction: column;
           gap: 0.5rem;
        }
        .input-field label {
           font-size: 0.85rem;
           font-weight: 800;
           color: #0F172A;
           text-transform: uppercase;
           letter-spacing: 0.03em;
        }
        .input-field input, .input-field textarea {
           padding: 0.9rem 1.25rem;
           border-radius: 14px;
           border: 1px solid #E2E8F0;
           background: #F8FAFC;
           font-size: 0.95rem;
           transition: all 0.2s;
           outline: none;
        }
        .input-field input:focus, .input-field textarea:focus {
           border-color: #d32f2f;
           background: white;
           box-shadow: 0 0 0 4px #fff1f1;
        }
      `}</style>
    </div>
  );
};

export default AccountSettings;
