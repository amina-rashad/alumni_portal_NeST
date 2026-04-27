import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Bell, Shield, 
  Palette, Globe, Mail, ChevronRight, User,
  ArrowLeft, Save, BellRing, UserCircle,
  ImageIcon, CheckCircle2, AlertCircle
} from 'lucide-react';

type SectionType = 'Event Configuration' | 'Attendee Notifications' | 'Event Roles & Access' | 'Event Portal Visibility' | 'Platform Integrations' | null;

const EventManagerSettings: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<SectionType>(null);
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Event Workspace Admin');
  const [workspaceDesc, setWorkspaceDesc] = useState('Manage your workspace settings and team members.');
  const brandPrimary = '#233167';

  const settingsSections = [
    { title: 'Event Configuration', icon: <SettingsIcon size={20} />, description: 'Default event types, participation limits, and event parameters.' },
    { title: 'Attendee Notifications', icon: <Bell size={20} />, description: 'Configure RSVP alerts, waitlist promos, and post-event requests.' },
    { title: 'Event Roles & Access', icon: <Shield size={20} />, description: 'Define roles like check-in volunteer, coordinator, and director.' },
    { title: 'Event Portal Visibility', icon: <Globe size={20} />, description: 'Manage login requirements, guest access, and participant lists.' },
    { title: 'Platform Integrations', icon: <Mail size={20} />, description: 'Zoom/Teams integrations, Calendar Sync, and SMS providers.' },
  ];

  /* ─────────────────────────── Detail Views ─────────────────────────── */

  const renderGeneralConfig = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Default Event Category</label>
          <select style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#fff' }}>
            <option>Alumni Meet</option>
            <option>Webinar / Tech Talk</option>
            <option>Career Fair</option>
            <option>Workshop / Training</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Participant Limit Default</label>
          <input type="number" defaultValue={100} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Registration Cut-off (Days before event)</label>
          <input type="number" defaultValue={2} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Allow Non-Alumni Guests By Default</label>
          <select style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#fff' }}>
            <option>No, Alumni Only</option>
            <option>Yes, strict limit of 1 Guest</option>
            <option>Yes, up to +2 Guests</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
         <AlertCircle size={18} color={brandPrimary} />
         <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Changing default parameters will only affect new events created after this update.</p>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[
        { label: 'Event Creation Announcement', sub: 'Sent to target class/batch when a new event goes live.', icon: <BellRing size={18} /> },
        { label: 'RSVP Confirmation & Ticket Email', sub: 'Instant email upon user registration containing check-in details.', icon: <Mail size={18} /> },
        { label: 'Waitlist Promotion Alert', sub: 'Sent automatically when a spot opens up for a waitlisted user.', icon: <CheckCircle2 size={18} /> },
        { label: 'Post-Event Gallery Request', sub: 'Sent 24hrs after event to collect participant photo uploads.', icon: <ImageIcon size={18} /> }
      ].map((notif, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ color: brandPrimary }}>{notif.icon}</div>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{notif.label}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{notif.sub}</div>
            </div>
          </div>
          <div style={{ width: '44px', height: '24px', background: brandPrimary, borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
             <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSecurity = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Event Management Roles</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <UserCircle size={24} color="#64748b" />
                 <span style={{ fontWeight: 600 }}>Event Director (Lead)</span>
              </div>
              <span style={{ fontSize: '12px', color: brandPrimary, fontWeight: 700 }}>Full Access</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <UserCircle size={24} color="#64748b" />
                 <span style={{ fontWeight: 600 }}>Check-in & Registration Coordinator</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Manage attendees & waitlists</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <UserCircle size={24} color="#64748b" />
                 <span style={{ fontWeight: 600 }}>Content Moderator</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Manage event posts & comments</span>
           </div>
        </div>
      </div>
      <button style={{ padding: '12px', borderRadius: '12px', border: `1px dashed ${brandPrimary}`, color: brandPrimary, background: 'none', fontWeight: 700, cursor: 'pointer' }}>+ Add Team Role</button>
    </div>
  );



  const renderVisibility = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             <div style={{ fontWeight: 600 }}>Require Login to View Event Library</div>
             <div style={{ fontSize: '12px', color: '#64748b' }}>If enabled, non-registered public visitors cannot browse your events.</div>
          </div>
          <div style={{ width: '44px', height: '24px', background: brandPrimary, borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
             <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
          </div>
       </div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             <div style={{ fontWeight: 600 }}>Show "Who's Attending" Roster</div>
             <div style={{ fontSize: '12px', color: '#64748b' }}>Displays the alumni participant list to others on the event page.</div>
          </div>
          <div style={{ width: '44px', height: '24px', background: brandPrimary, borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
             <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
          </div>
       </div>
       <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Default Discovery Tags</label>
          <input type="text" defaultValue="Tech, Networking, Reunion, Seminar" style={{ width: '100%', marginTop: '8px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 600, outline: 'none' }} />
       </div>
    </div>
  );

  const renderCommunication = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>Default Meeting Platform (Online)</label>
            <select style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#fff' }}>
               <option>Zoom (Linked Account)</option>
               <option>Microsoft Teams</option>
               <option>Google Meet</option>
            </select>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600 }}>Add to Calendar Sync</label>
            <select style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#fff' }}>
               <option>iCal, Google, and Outlook Sync</option>
               <option>Disabled</option>
            </select>
         </div>
       </div>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600 }}>SMS Reminder Gateway Provider</label>
          <input type="text" defaultValue="Twilio Messaging API" style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none' }} />
       </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'Event Configuration': return renderGeneralConfig();
      case 'Attendee Notifications': return renderNotifications();
      case 'Event Roles & Access': return renderSecurity();
      case 'Event Portal Visibility': return renderVisibility();
      case 'Platform Integrations': return renderCommunication();
      default: return null;
    }
  };

  /* ─────────────────────────── Main Render ─────────────────────────── */

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Dynamic Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {selectedSection && (
             <button 
               onClick={() => setSelectedSection(null)}
               style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: '#64748b' }}
             >
               <ArrowLeft size={20} />
             </button>
          )}
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
              {selectedSection || 'Module Settings'}
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>
              {selectedSection ? `Manage your ${selectedSection.toLowerCase()} and event preferences.` : 'Configure your event management workspace and preferences.'}
            </p>
          </div>
        </div>
        {selectedSection && (
          <button style={{ 
            background: brandPrimary, 
            color: '#fff', 
            padding: '12px 24px', 
            borderRadius: '12px', 
            border: 'none', 
            fontWeight: 700, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            boxShadow: `0 4px 14px 0 rgba(79, 70, 229, 0.3)`
          }}>
            <Save size={18} /> Save Changes
          </button>
        )}
      </div>

      {!selectedSection ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {/* Profile Card */}
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: brandPrimary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 }}>
                <User size={40} />
              </div>
              <div style={{ flex: 1 }}>
                {isEditingWorkspace ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px' }}>
                    <input 
                      type="text" 
                      value={workspaceName} 
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', border: `2px solid ${brandPrimary}40`, borderRadius: '10px', padding: '8px 12px', outline: 'none', background: '#fcfdfe' }}
                    />
                    <textarea 
                      value={workspaceDesc} 
                      onChange={(e) => setWorkspaceDesc(e.target.value)}
                      style={{ fontSize: '14px', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', outline: 'none', background: '#f8fafc', height: '60px', resize: 'none' }}
                    />
                  </div>
                ) : (
                  <>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{workspaceName}</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>{workspaceDesc}</p>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {isEditingWorkspace && (
                <button 
                  onClick={() => setIsEditingWorkspace(false)}
                  style={{ padding: '12px 24px', borderRadius: '12px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={() => {
                  if (isEditingWorkspace) {
                    alert('Workspace settings updated successfully!');
                    setIsEditingWorkspace(false);
                  } else {
                    setIsEditingWorkspace(true);
                  }
                }}
                style={{ padding: '12px 24px', borderRadius: '12px', background: brandPrimary, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 4px 14px 0 ${brandPrimary}30` }}
              >
                {isEditingWorkspace ? <><Save size={18} /> Save Workspace</> : 'Edit Workspace'}
              </button>
            </div>
          </div>

          {/* Settings Options */}
          {settingsSections.map((section, idx) => (
            <div key={idx} 
              onClick={() => setSelectedSection(section.title as SectionType)}
              style={{ 
                background: '#fff', 
                padding: '24px', 
                borderRadius: '20px', 
                border: '1px solid #e2e8f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }} onMouseEnter={e => e.currentTarget.style.borderColor = brandPrimary} onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                 <div style={{ padding: '12px', background: '#f8fafc', color: '#64748b', borderRadius: '16px' }}>
                    {section.icon}
                 </div>
                 <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{section.title}</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: 1.4 }}>{section.description}</p>
                 </div>
              </div>
              <ChevronRight size={20} color="#cbd5e1" />
            </div>
          ))}
          
          <div style={{ gridColumn: '1 / -1', marginTop: '24px', padding: '32px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '24px' }}>
             <h4 style={{ margin: 0, color: '#b91c1c', fontSize: '16px', fontWeight: 700 }}>Danger Zone</h4>
             <p style={{ color: '#991b1b', fontSize: '14px', marginTop: '8px' }}>Resetting the module will erase all configuration data and history. This action cannot be undone.</p>
             <button style={{ marginTop: '16px', padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Reset Event Module</button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', animation: 'fadeIn 0.3s ease-out' }}>
           {renderContent()}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EventManagerSettings;
