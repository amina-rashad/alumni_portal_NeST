import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Download as DownloadIcon, 
  MoreHorizontal, Mail, MapPin, Calendar, UserCheck, UserX,
  Video, Hash, Eye, Edit2, XCircle, CheckCircle, Trash2, X, Send
} from 'lucide-react';

const attendeesData = [
  { id: 1, pId: 'EV-1001', name: 'Adithya S', event: 'Global Alumni Meet 2024', email: 'adithya@example.com', mode: 'Offline', status: 'Attended', date: '2024-03-20', city: 'Kochi' },
  { id: 2, pId: 'EV-1002', name: 'Meera Nair', event: 'Tech Talk: Future of AI', email: 'meera@example.com', mode: 'Online', status: 'Not Attended', date: '2024-03-21', city: 'Virtual' },
  { id: 3, pId: 'EV-1003', name: 'Rahul Krishnan', event: 'Global Alumni Meet 2024', email: 'rahul@example.com', mode: 'Offline', status: 'Attended', date: '2024-03-20', city: 'Bangalore' },
  { id: 4, pId: 'EV-1004', name: 'Sneha Joseph', event: 'Web Development Workshop', email: 'sneha@example.com', mode: 'Online', status: 'Not Attended', date: '2024-03-25', city: 'Virtual' },
  { id: 5, pId: 'EV-1005', name: 'Kevin Thomas', event: 'Tech Talk: Future of AI', email: 'kevin@example.com', mode: 'Online', status: 'Attended', date: '2024-03-21', city: 'Virtual' },
];

const EventManagerAttendees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [selectedAttendeeForEmail, setSelectedAttendeeForEmail] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const brandPrimary = '#233167';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAttendees = attendeesData.filter((attendee) => {
    const matchesSearch = 
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.event.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || attendee.status === statusFilter;
    const matchesMode = modeFilter === 'All' || attendee.mode === modeFilter;
    
    return matchesSearch && matchesStatus && matchesMode;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0, fontFamily: "'Montserrat', sans-serif" }}>Attendee Management</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Monitor and manage all event participants in one place.</p>
        </div>
        <button style={{ 
          background: brandPrimary, 
          color: '#fff', 
          padding: '12px 20px', 
          borderRadius: '12px', 
          border: 'none', 
          fontWeight: 600, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          cursor: 'pointer',
          boxShadow: `0 4px 14px 0 rgba(79, 70, 229, 0.39)`
        }}>
          <DownloadIcon size={18} /> Export List
        </button>
      </div>

      {/* Stats Quick View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Total Participants', value: '1,280', icon: <Users size={24} />, color: brandPrimary },
          { label: 'Total Attended', value: '945', icon: <UserCheck size={24} />, color: '#10b981' },
          { label: 'Total Not Attended', value: '335', icon: <UserX size={24} />, color: '#ef4444' },
          { label: 'Upcoming', value: '312', icon: <Calendar size={24} />, color: '#f59e0b' },
        ].map((stat, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: `${stat.color}15`, color: stat.color, padding: '12px', borderRadius: '15px' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{stat.label}</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: '4px 0 0 0' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or event..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }} 
            />
          </div>
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: showFilters ? '#f8fafc' : '#fff', color: showFilters ? brandPrimary : '#64748b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Filter size={18} /> Filters
            </button>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{ 
                    position: 'absolute', top: 'calc(100% + 12px)', right: 0, 
                    background: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', 
                    border: '1px solid #e2e8f0', padding: '16px', width: '260px', zIndex: 1000 
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Attendance Status</label>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '13px', background: '#f8fafc', color: '#334155', fontWeight: 500 }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Attended">Attended</option>
                      <option value="Not Attended">Not Attended</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Event Mode</label>
                    <select 
                      value={modeFilter} 
                      onChange={(e) => setModeFilter(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '13px', background: '#f8fafc', color: '#334155', fontWeight: 500 }}
                    >
                      <option value="All">All Modes</option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Event</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Mode</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: brandPrimary, fontSize: '13px', fontWeight: 700 }}>
                      <Hash size={12} /> {attendee.pId}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${brandPrimary}10`, color: brandPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {attendee.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{attendee.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{attendee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ color: '#475569', fontSize: '14px', fontWeight: 500 }}>{attendee.event}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Calendar size={12} /> {attendee.date}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      color: attendee.mode === 'Online' ? '#10b981' : '#334155',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: attendee.mode === 'Online' ? '#10b98110' : '#f1f5f9',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      width: 'fit-content'
                    }}>
                      {attendee.mode === 'Online' ? <Video size={14} /> : <MapPin size={14} />}
                      {attendee.mode}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px' }}>
                      {attendee.city}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      fontWeight: 700,
                      background: attendee.status === 'Attended' ? '#ecfdf5' : '#fef2f2',
                      color: attendee.status === 'Attended' ? '#059669' : '#ef4444',
                      border: `1px solid ${attendee.status === 'Attended' ? '#10b98120' : '#ef444420'}`
                    }}>
                      {attendee.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                      <button 
                        onClick={() => setSelectedAttendeeForEmail(attendee)}
                        style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', color: brandPrimary, background: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <Mail size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === attendee.id ? null : attendee.id);
                        }}
                        style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#64748b', background: menuOpenId === attendee.id ? '#f1f5f9' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      <AnimatePresence>
                        {menuOpenId === attendee.id && (
                          <motion.div 
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            style={{
                              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                              background: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                              border: '1px solid #e2e8f0', width: '220px', padding: '8px', zIndex: 1000
                            }}
                          >
                             {[
                               { label: 'View Details', icon: <Eye size={14} />, action: () => alert('Viewing attendee details...') },
                               { label: 'Edit Information', icon: <Edit2 size={14} />, action: () => alert('Opening edit form...') },
                               { 
                                 label: attendee.status === 'Attended' ? 'Mark as Absent' : 'Mark as Attended', 
                                 icon: attendee.status === 'Attended' ? <XCircle size={14} /> : <CheckCircle size={14} />, 
                                 action: () => alert('Status updated successfully!') 
                               },
                               { label: 'Remove Record', icon: <Trash2 size={14} />, action: () => { if(confirm('Are you sure you want to remove this record?')) alert('Record removed!'); }, danger: true },
                             ].map((item, i) => (
                               <button 
                                 key={i}
                                 onClick={(e) => { e.stopPropagation(); item.action(); setMenuOpenId(null); }}
                                 style={{ 
                                   width: '100%', padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'none', 
                                   display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: item.danger ? '#ef4444' : '#475569', 
                                   cursor: 'pointer', textAlign: 'left'
                                 }}
                                 onMouseEnter={e => e.currentTarget.style.background = item.danger ? '#fef2f2' : '#f8fafc'}
                                 onMouseLeave={e => e.currentTarget.style.background = 'none'}
                               >
                                 {item.icon} {item.label}
                               </button>
                             ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Search size={32} color="#cbd5e1" />
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#475569' }}>No participants found</div>
                      <div style={{ fontSize: '13px' }}>Try adjusting your search or filters.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {selectedAttendeeForEmail && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                background: '#fff',
                width: '100%',
                maxWidth: '560px',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: `${brandPrimary}15`, color: brandPrimary, padding: '10px', borderRadius: '12px' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Send Message</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Contact participant directly</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAttendeeForEmail(null)}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>To</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${brandPrimary}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                      {selectedAttendeeForEmail.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{selectedAttendeeForEmail.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedAttendeeForEmail.email}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Subject</label>
                  <input 
                    type="text" 
                    placeholder="Enter message subject..." 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', background: '#fff', color: '#1e293b' }} 
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Message</label>
                  </div>
                  <textarea 
                    placeholder="Type your message here..." 
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={5}
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', resize: 'vertical', minHeight: '120px', transition: 'border-color 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontFamily: 'inherit', background: '#fff', color: '#1e293b' }} 
                  />
                </div>
              </div>

              <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => setSelectedAttendeeForEmail(null)}
                  style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert(`Message sent to ${selectedAttendeeForEmail.name}!`);
                    setSelectedAttendeeForEmail(null);
                    setEmailSubject('');
                    setEmailMessage('');
                  }}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: brandPrimary, color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 4px 14px 0 ${brandPrimary}60`, transition: 'all 0.2s' }}
                >
                  <Send size={16} /> Send Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventManagerAttendees;
