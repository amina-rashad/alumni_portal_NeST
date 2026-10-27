import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, 
  Calendar, MapPin, Users, Edit2, Trash2, ExternalLink,
  ArrowLeft, Clock, Upload, X, Image as ImageIcon,
  Info, ChevronDown, ShieldCheck, AlertCircle, Video,
  ChevronRight, ChevronLeft, Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { eventsApi, eventManagerApi } from '../../services/api';
import StatusModal from '../../components/StatusModal';
import { formatDateOnly, formatTimeTo12Hour } from '../../utils/dateUtils';

const GlassSelect: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  name: string;
  allowCustom?: boolean;
  onCustom?: () => void;
  customLabel?: string;
}> = ({ label, options, value, onChange, allowCustom, onCustom, customLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const brandPrimary = '#233167';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }} ref={dropdownRef}>
      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          padding: '14px 20px', 
          borderRadius: '16px', 
          border: '1px solid rgba(35, 49, 103, 0.1)', 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(16px)', 
          fontSize: '15px', 
          width: '100%', 
          color: '#1e293b', 
          fontWeight: 700, 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(35, 49, 103, 0.03)',
          transition: 'all 0.2s ease'
        }}
      >
        {value}
        <ChevronDown size={14} color="#94a3b8" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '105%', 
          left: 0, 
          right: 0, 
          zIndex: 100, 
          background: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(24px)', 
          borderRadius: '18px', 
          border: '1px solid rgba(35, 49, 103, 0.1)', 
          boxShadow: '0 10px 30px rgba(35, 49, 103, 0.1)',
          overflow: 'hidden',
          padding: '8px'
        }}>
          {options.map((opt) => (
            <div 
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{ 
                padding: '12px 16px', 
                fontSize: '14px', 
                fontWeight: 700, 
                color: value === opt ? brandPrimary : '#475569',
                background: value === opt ? 'rgba(35, 49, 103, 0.05)' : 'transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {opt}
            </div>
          ))}

          {allowCustom && (
            <>
              <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 8px' }} />
              <div 
                onClick={() => {
                  setIsOpen(false);
                  if (onCustom) onCustom();
                }}
                style={{ 
                  padding: '12px 16px', 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  color: brandPrimary,
                  background: 'rgba(35, 49, 103, 0.04)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Plus size={15} /> {customLabel || '+ Add Custom Category...'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const isEventOver = (dateStr: string, timeStr?: string): boolean => {
  if (!dateStr) return false;
  try {
    const cleanDate = dateStr.trim();
    let hours = 23;
    let minutes = 59;

    if (timeStr && timeStr.trim()) {
      const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3];
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) {
            hours += 12;
          } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
          }
        }
      }
    }

    let year = 0;
    let month = 0;
    let day = 0;

    if (cleanDate.includes('/')) {
      const parts = cleanDate.split('/').map(Number);
      if (parts[0] > 1000) {
        [year, month, day] = parts;
      } else if (parts[2] > 1000) {
        [day, month, year] = parts;
      }
    } else if (cleanDate.includes('-')) {
      const parts = cleanDate.split('-').map(Number);
      if (parts[0] > 1000) {
        [year, month, day] = parts;
      } else if (parts[2] > 1000) {
        [day, month, year] = parts;
      }
    }

    if (year > 0 && month > 0 && day > 0) {
      const eventDate = new Date(year, month - 1, day, hours, minutes, 59);
      if (!isNaN(eventDate.getTime())) {
        return eventDate.getTime() < Date.now();
      }
    }

    const fallbackDate = new Date(cleanDate);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.getTime() < Date.now();
    }
    return false;
  } catch (e) {
    return false;
  }
};

// Helper: format ISO YYYY-MM-DD or other formats into DD/MM/YYYY
const toDMY = (dateStr: string): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(trimmed)) {
    const parts = trimmed.replace(/-/g, '/').split('/');
    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
  }
  const parts = trimmed.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return dateStr;
};

// Helper: parse DD/MM/YYYY or DD-MM-YYYY into ISO YYYY-MM-DD
const toISO = (dateStr: string): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parts = trimmed.replace(/-/g, '/').split('/');
  if (parts.length === 3 && parts[2]?.length === 4) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

// Helper: format 12-hour AM/PM string to 24-hour HH:MM for input[type="time"]
const formatTimeTo24Hour = (timeStr: string): string => {
  if (!timeStr) return '';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3]?.toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const EventManagerEvents: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const baseRoute = isAdminPath ? '/admin' : '/event-manager';
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);
  const timePickerRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const brandPrimary = '#233167';

  const [formData, setFormData] = useState({
    title: '',
    category: 'Networking & Mixer',
    limit: '',
    description: '',
    date: '',
    startTime: '',
    venue: '',
    audience: 'Platform Wide',
    mode: 'offline'
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [displayDate, setDisplayDate] = useState('');

  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const itemsPerPage = 6;
  const [statusModal, setStatusModal] = useState({
    show: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  const fetchEvents = async (page: number) => {
    setIsLoadingEvents(true);
    try {
      const res = await eventsApi.getAllEvents(page, itemsPerPage);
      if (res.success && res.data) {
        const rawEvents = (res.data as any).events || [];
        const mappedEvents = rawEvents.map((e: any) => {
          const isOver = e.is_over !== undefined ? e.is_over : isEventOver(e.date, e.time);
          const attendeesCount = e.attendees_count ?? (e.attendees?.length || 0);
          const isFull = e.is_full !== undefined ? e.is_full : (e.max_attendees > 0 && attendeesCount >= e.max_attendees);
          // If date exceeded, or capacity full, or explicitly inactive -> mark inactive
          const isInactive = e.is_active === false || isOver || isFull;
          const status = isInactive ? 'Inactive' : 'Active';
          return {
            ...e,
            attendees_count: attendeesCount,
            is_active: !isInactive,
            is_over: isOver,
            is_full: isFull,
            status
          };
        });
        
        setEvents(mappedEvents);
        setTotalPages((res.data as any).total_pages || 1);
        setTotalEvents((res.data as any).total_events || rawEvents.length);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleToggleEventActive = async (event: any) => {
    const isPast = Boolean(event.is_over || isEventOver(event.date, event.time));
    if (isPast) {
      setStatusModal({
        show: true,
        type: 'error',
        title: 'Action Blocked',
        message: `"${event.title}" has already passed. The status of past events cannot be changed.`
      });
      return;
    }
    const newActiveState = !event.is_active;
    try {
      const res = await eventManagerApi.updateEvent(event.id, { is_active: newActiveState });
      if (res.success) {
        setEvents(prev => prev.map(e => {
          if (e.id === event.id) {
            const isOver = e.is_over || isEventOver(e.date, e.time);
            const isFull = e.is_full;
            const isInactive = !newActiveState || isOver || isFull;
            return { 
              ...e, 
              is_active: !isInactive, 
              status: isInactive ? 'Inactive' : 'Active' 
            };
          }
          return e;
        }));
        setStatusModal({
          show: true,
          type: 'success',
          title: newActiveState ? 'Event Activated' : 'Event Set to Inactive',
          message: `"${event.title}" is now ${newActiveState ? 'active' : 'inactive'}.`
        });
      } else {
        setStatusModal({
          show: true,
          type: 'error',
          title: 'Update Failed',
          message: res.message || 'Could not update event status.'
        });
      }
    } catch (err) {
      console.error('Error toggling event status:', err);
      setStatusModal({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred while updating event status.'
      });
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setCategory = (val: string) => setFormData(prev => ({ ...prev, category: val }));
  const setAudience = (val: string) => setFormData(prev => ({ ...prev, audience: val }));
  const setMode = (val: string) => setFormData(prev => ({ ...prev, mode: val }));

  const openDatePicker = () => {
    if (datePickerRef.current) {
      try {
        if (typeof (datePickerRef.current as any).showPicker === 'function') {
          (datePickerRef.current as any).showPicker();
        } else {
          datePickerRef.current.focus();
        }
      } catch (err) {
        console.error('Error opening date picker:', err);
        try {
          datePickerRef.current.focus();
        } catch (e) { /* ignore */ }
      }
    }
  };

  const openTimePicker = () => {
    if (timePickerRef.current) {
      try {
        if (typeof (timePickerRef.current as any).showPicker === 'function') {
          (timePickerRef.current as any).showPicker();
        } else {
          timePickerRef.current.focus();
        }
      } catch (err) {
        console.error('Error opening time picker:', err);
        try {
          timePickerRef.current.focus();
        } catch (e) { /* ignore */ }
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLaunch = async () => {
    try {
      const finalDate = toISO(displayDate || formData.date);
      const formattedTime = formatTimeTo12Hour(formData.startTime);
      const payload = {
        title: formData.title,
        description: formData.description,
        date: finalDate,
        time: formattedTime,
        location: formData.venue,
        category: formData.category,
        max_attendees: parseInt(formData.limit) || 0,
        mode: formData.mode,
        cover_image: selectedImage || '/placeholder.jpg'
      };

      let res;
      if (editingEventId) {
        res = await eventManagerApi.updateEvent(String(editingEventId), payload);
      } else {
        res = await eventManagerApi.createEvent(payload);
      }

      if (res.success) {
        setStatusModal({
          show: true,
          type: 'success',
          title: editingEventId ? 'Event Updated' : 'Event Launched',
          message: editingEventId ? 'The event details have been successfully updated.' : 'Your new event has been successfully launched!'
        });
        setIsAddingEvent(false);
        setEditingEventId(null);
        setFormData({
          title: '', category: 'Networking & Mixer', limit: '',
          description: '', date: '', startTime: '',
          venue: '', audience: 'Platform Wide', mode: 'offline'
        });
        setDisplayDate('');
        setIsCustomCategory(false);
        setSelectedImage(null);
        fetchEvents(currentPage);
      } else {
        alert('Failed to save event: ' + res.message);
      }
    } catch (err) {
      console.error('Error saving event:', err);
      alert('An error occurred while saving the event.');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      const res = await eventManagerApi.deleteEvent(String(eventId));
      if (res.success) {
        setStatusModal({
          show: true,
          type: 'success',
          title: 'Event Deleted',
          message: 'The event has been permanently removed from the system.'
        });
        fetchEvents(currentPage);
      } else {
        setStatusModal({
          show: true,
          type: 'error',
          title: 'Deletion Failed',
          message: res.message || 'An error occurred while deleting the event.'
        });
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('An error occurred while deleting the event.');
    }
  };

  const handleEdit = (event: any) => {
    setEditingEventId(event.id);
    
    // Preserve clean 12-hour AM/PM display time
    const timeVal = formatTimeTo12Hour(event.time || '10:00 AM');
    const defaultCategories = ['Networking & Mixer', 'Workshop', 'Seminar', 'Conference'];
    const isCustom = event.category && !defaultCategories.includes(event.category);
    setIsCustomCategory(Boolean(isCustom));

    setFormData({
      title: event.title,
      category: event.category || 'Networking & Mixer',
      limit: event.max_attendees?.toString() || '0',
      description: event.description || '',
      date: event.date || '',
      startTime: timeVal,
      venue: event.location,
      audience: 'Platform Wide',
      mode: event.mode || (event.location === 'Virtual' ? 'online' : 'offline')
    });
    setDisplayDate(toDMY(event.date || ''));
    setSelectedImage(event.cover_image);
    setIsAddingEvent(true);
  };

  const filteredEvents = events.filter(e => {
    const isPast = e.is_over || isEventOver(e.date, e.time);
    const matchesTab = activeTab === 'All' || 
                       (activeTab === 'Active' && e.status === 'Active') ||
                       (activeTab === 'Inactive' && e.status === 'Inactive') ||
                       (activeTab === 'Past' && isPast);
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const glossyInputStyle = {
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid rgba(35, 49, 103, 0.1)',
    background: 'rgba(35, 49, 103, 0.05)', 
    backdropFilter: 'blur(16px)',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
    color: '#1e1b4b', 
    fontWeight: 700,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(35, 49, 103, 0.02)'
  };

  if (isAddingEvent) {
    return (
      <div style={{ 
        background: '#ffffff', 
        minHeight: 'calc(100vh - 120px)', 
        margin: '-32px', 
        padding: '36px 48px 100px',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Header directly on white background without floating card box */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '36px',
            paddingBottom: '24px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => setIsAddingEvent(false)}
                style={{ 
                  padding: '10px', 
                  borderRadius: '12px', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  color: '#64748b', 
                  cursor: 'pointer', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Calendar size={14} color={brandPrimary} /> Event Management <span>{'>'}</span> {editingEventId ? 'Edit Event' : 'New Event'}
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  {editingEventId ? 'Edit Event' : 'Create Event'}
                </h1>
              </div>
            </div>

            <button 
              onClick={handleLaunch}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '12px 28px', 
                borderRadius: '14px', 
                background: brandPrimary, 
                border: 'none',
                color: '#fff', 
                fontWeight: 800, 
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(35, 49, 103, 0.2)',
                transition: 'all 0.2s'
              }}>
              {editingEventId ? 'Save Changes' : 'Launch Event'}
            </button>
          </div>

          {/* Form directly on white background - NO outer white boxes or borders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {/* Section 1: Event Information */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary }}><Info size={18} /></div> Event Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Event Name</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Annual Alumni Gala 2026" style={glossyInputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {isCustomCategory ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Custom Category
                      </label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsCustomCategory(false);
                          setCategory('Networking & Mixer');
                        }}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: brandPrimary, 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          cursor: 'pointer', 
                          padding: 0 
                        }}
                      >
                        Choose from presets
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        name="category" 
                        value={formData.category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        placeholder="e.g. Hackathon, Webinar, Reunion..." 
                        autoFocus
                        style={glossyInputStyle} 
                      />
                    </div>
                  </div>
                ) : (
                  <GlassSelect 
                    label="Category" 
                    name="category" 
                    value={formData.category} 
                    options={['Networking & Mixer', 'Workshop', 'Seminar', 'Conference']} 
                    allowCustom={true}
                    customLabel="Custom Category..."
                    onCustom={() => {
                      setIsCustomCategory(true);
                      setCategory('');
                    }}
                    onChange={setCategory} 
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Max Capacity</label>
                  <input type="number" name="limit" value={formData.limit} onChange={handleInputChange} placeholder="e.g. 500" style={glossyInputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Description</label>
                <textarea rows={4} name="description" value={formData.description} onChange={handleInputChange} placeholder="What is this event about?" style={{ ...glossyInputStyle, height: 'auto', fontFamily: 'inherit', resize: 'none' }} />
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#f1f5f9' }} />

          {/* Section 2: Date, Time & Venue */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary }}><Clock size={18} /></div> Date & Venue
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Event Date (DD/MM/YYYY) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Event Date</label>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: brandPrimary, background: 'rgba(35, 49, 103, 0.08)', padding: '2px 8px', borderRadius: '6px' }}>DD/MM/YYYY</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    {/* Left Icon (Clickable) */}
                    <button
                      type="button"
                      onClick={openDatePicker}
                      title="Choose event date"
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: brandPrimary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        borderRadius: '8px',
                        zIndex: 2,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(35, 49, 103, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Calendar size={17} />
                    </button>

                    {/* Text Input (Clickable + Editable) */}
                    <input 
                      type="text" 
                      placeholder="dd/mm/yyyy" 
                      value={displayDate || toDMY(formData.date)} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setDisplayDate(val);
                        setFormData(prev => ({ ...prev, date: toISO(val) }));
                      }}
                      onClick={openDatePicker}
                      style={{ 
                        ...glossyInputStyle, 
                        paddingLeft: '44px', 
                        paddingRight: '44px', 
                        cursor: 'pointer',
                        width: '100%' 
                      } as any} 
                    />

                    {/* Hidden Native Date Input for Picker */}
                    <input 
                      ref={datePickerRef}
                      type="date" 
                      tabIndex={-1}
                      aria-hidden="true"
                      value={toISO(displayDate || formData.date)} 
                      onChange={(e) => {
                        const isoVal = e.target.value;
                        if (isoVal) {
                          setFormData(prev => ({ ...prev, date: isoVal }));
                          setDisplayDate(toDMY(isoVal));
                        }
                      }}
                      style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: '32px', 
                        height: '32px', 
                        opacity: 0, 
                        pointerEvents: 'none', 
                        zIndex: -1 
                      }} 
                    />

                    {/* Right Icon Button (Clickable) */}
                    <button
                      type="button"
                      onClick={openDatePicker}
                      title="Choose event date from calendar"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: brandPrimary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        borderRadius: '8px',
                        zIndex: 2,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(35, 49, 103, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Calendar size={17} />
                    </button>
                  </div>
                </div>

                {/* Start Time */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Start Time</label>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: brandPrimary, background: 'rgba(35, 49, 103, 0.08)', padding: '2px 8px', borderRadius: '6px' }}>Type or Select</span>
                  </div>
                  <div style={{ position: 'relative', width: '100%' }}>
                    {/* Left Icon (Clickable) */}
                    <button
                      type="button"
                      onClick={openTimePicker}
                      title="Choose start time"
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: brandPrimary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        borderRadius: '8px',
                        zIndex: 2,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(35, 49, 103, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Clock size={17} />
                    </button>

                    {/* Text Input (Clickable + Editable) */}
                    <input 
                      type="text" 
                      name="startTime" 
                      placeholder="e.g. 10:00 AM or 14:30"
                      value={formData.startTime} 
                      onChange={handleInputChange} 
                      onClick={openTimePicker}
                      style={{ 
                        ...glossyInputStyle, 
                        paddingLeft: '44px', 
                        paddingRight: '44px', 
                        width: '100%', 
                        cursor: 'pointer' 
                      } as any} 
                    />

                    {/* Hidden Native Time Input for Picker */}
                    <input 
                      ref={timePickerRef}
                      type="time" 
                      tabIndex={-1}
                      aria-hidden="true"
                      value={formatTimeTo24Hour(formData.startTime)} 
                      onChange={(e) => {
                        const val24 = e.target.value;
                        if (val24) {
                          setFormData(prev => ({ ...prev, startTime: formatTimeTo12Hour(val24) }));
                        }
                      }}
                      style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: '32px', 
                        height: '32px', 
                        opacity: 0, 
                        pointerEvents: 'none', 
                        zIndex: -1 
                      }} 
                    />

                    {/* Right Icon Button (Clickable) */}
                    <button
                      type="button"
                      onClick={openTimePicker}
                      title="Select time from clock picker"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: brandPrimary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        borderRadius: '8px',
                        zIndex: 2,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(35, 49, 103, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Clock size={17} />
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <GlassSelect label="Event Mode" name="mode" value={formData.mode} options={['offline', 'online']} onChange={setMode} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    {formData.mode === 'online' ? 'Meeting Link' : 'Location / Venue'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    {formData.mode === 'online' ? (
                      <Video size={16} color={brandPrimary} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    ) : (
                      <MapPin size={16} color={brandPrimary} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                    <input 
                      name="venue" 
                      value={formData.venue} 
                      onChange={handleInputChange} 
                      placeholder={formData.mode === 'online' ? 'Zoom, Google Meet, or Teams Link' : 'Venue name or Physical Address'} 
                      style={{ ...glossyInputStyle, paddingLeft: '42px' }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#f1f5f9' }} />

          {/* Section 3: Cover Media */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(35, 49, 103, 0.08)', color: brandPrimary }}><ImageIcon size={18} /></div> Cover Media
            </h3>
            <div 
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{ border: `2px dashed ${dragActive ? brandPrimary : '#cbd5e1'}`, borderRadius: '24px', padding: '40px', textAlign: 'center', background: dragActive ? 'rgba(35, 49, 103, 0.05)' : '#f8fafc', position: 'relative' }}
            >
              {selectedImage ? (
                <div style={{ position: 'relative' }}>
                  <img src={selectedImage} alt="Preview" style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '16px' }} />
                  <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}><X size={16} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                  <Upload size={32} color={brandPrimary} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>Upload an image or drag and drop</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>PNG, JPG up to 10MB</div>
                  </div>
                  <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Launch Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button 
              onClick={handleLaunch}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '14px 36px', 
                borderRadius: '16px', 
                background: brandPrimary, 
                border: 'none',
                color: '#fff', 
                fontWeight: 800, 
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(35, 49, 103, 0.25)',
                transition: 'all 0.2s'
              }}>
              {editingEventId ? 'Save Changes' : 'Launch Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Manage Events</h1>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Create, monitor and maintain your event portfolio.</p>
        </div>
        <button 
          onClick={() => {
            setEditingEventId(null);
            setFormData({
              title: '', category: 'Networking & Mixer', limit: '',
              description: '', date: '', startTime: '',
              venue: '', audience: 'Platform Wide', mode: 'offline'
            });
            setDisplayDate('');
            setIsCustomCategory(false);
            setSelectedImage(null);
            setIsAddingEvent(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '14px',
            background: brandPrimary,
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(35, 49, 103, 0.2)'
          }}
        >
          <Plus size={18} /> Create Event
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Active', 'Inactive', 'Past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab ? brandPrimary : 'transparent',
                color: activeTab === tab ? '#fff' : '#64748b',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search events by title or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '12px 16px 12px 48px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', width: '300px', outline: 'none', transition: 'all 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = brandPrimary}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{ padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: isFilterOpen ? 'rgba(35, 49, 103, 0.05)' : '#fff', color: isFilterOpen ? brandPrimary : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Filter size={18} />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, background: '#fff', padding: '12px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', width: '220px', zIndex: 1000 }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>Filter by Category</div>
                  {['All', 'Technology', 'Networking', 'Professional Development', 'Social'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setIsFilterOpen(false); }}
                      style={{ 
                        width: '100%', padding: '10px 14px', borderRadius: '10px', border: 'none', background: activeCategory === cat ? 'rgba(35, 49, 103, 0.05)' : 'none', 
                        display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: activeCategory === cat ? brandPrimary : '#475569', 
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
        <AnimatePresence mode="popLayout">
          {filteredEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}
            >
               <Search size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
               <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 800, fontSize: '20px' }}>No events found</h3>
               <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', maxWidth: '300px', margin: '8px auto 0' }}>Try adjusting your search or category filters to find what you're looking for.</p>
               <button 
                 onClick={() => { setSearchQuery(''); setActiveCategory('All'); setActiveTab('All'); }} 
                 style={{ marginTop: '24px', padding: '12px 28px', borderRadius: '14px', background: brandPrimary, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(35, 49, 103, 0.15)' }}
               >
                 Reset All Filters
               </button>
            </motion.div>
          ) : filteredEvents.map((event) => {
            const isPast = Boolean(event.is_over || isEventOver(event.date, event.time));
            return (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }}
              style={{
                background: '#fff',
                borderRadius: '28px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: '200px' }}>
                <img src={event.cover_image || '/placeholder.jpg'} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    color: event.is_active ? '#16a34a' : '#ef4444',
                    border: event.is_active ? '1px solid rgba(22, 163, 74, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: event.is_active ? '#16a34a' : '#ef4444' }}></div>
                    {event.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: brandPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    {event.category}
                  </div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>{event.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                      <Calendar size={16} /> {formatDateOnly(event.date, event.date)}{event.time ? ` • ${formatTimeTo12Hour(event.time)}` : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                      <MapPin size={16} /> {event.location}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 700, fontSize: '14px' }}>
                      <Users size={16} /> {event.attendees_count} Registrations
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
                      {event.max_attendees > 0 ? Math.round((event.attendees_count / event.max_attendees) * 100) : 0}% Full
                    </div>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${event.max_attendees > 0 ? (event.attendees_count / event.max_attendees) * 100 : 0}%`, background: brandPrimary, borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleEdit(event)}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
                  >
                    <Edit2 size={15} /> Edit
                  </button>
                  <button 
                    disabled={isPast}
                    onClick={() => !isPast && handleToggleEventActive(event)}
                    title={isPast ? "Event date has passed — status cannot be changed" : (event.is_active ? "Turn Inactive" : "Turn Active")}
                    style={{ 
                      flex: 1.2, 
                      padding: '12px', 
                      borderRadius: '12px', 
                      border: isPast 
                        ? '1px solid #e2e8f0' 
                        : (event.is_active ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'), 
                      background: isPast 
                        ? '#f1f5f9' 
                        : (event.is_active ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)'), 
                      color: isPast 
                        ? '#94a3b8' 
                        : (event.is_active ? '#ef4444' : '#10b981'), 
                      fontWeight: 800, 
                      cursor: isPast ? 'not-allowed' : 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px', 
                      fontSize: '13px',
                      transition: 'all 0.2s',
                      opacity: isPast ? 0.6 : 1
                    }}
                  >
                    <Power size={15} color={isPast ? '#94a3b8' : (event.is_active ? '#ef4444' : '#10b981')} /> 
                    {event.is_active ? 'Turn Inactive' : 'Turn Active'}
                  </button>
                  <button 
                    onClick={() => navigate(`${baseRoute}/attendees?eventId=${event.id}&eventName=${encodeURIComponent(event.title)}`)}
                    style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
                    title="View Attendees"
                  >
                    <Users size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(event.id)}
                    style={{ 
                      padding: '12px 14px', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(239, 68, 68, 0.25)', 
                      background: 'rgba(239, 68, 68, 0.08)', 
                      color: '#ef4444', 
                      fontWeight: 700, 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px', 
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                    title="Delete Event"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination & Page Info Section - Pixel Perfect Match */}
      {events.length > 0 && (
        <div style={{ 
          marginTop: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1.25rem',
          padding: '2rem',
          background: 'rgba(248, 250, 252, 0.5)',
          borderRadius: '2rem',
          border: '1px solid #f1f5f9'
        }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              background: '#ffffff',
              borderRadius: '999px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
            }}
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid #f1f5f9',
                background: currentPage === 1 ? '#f8fafc' : 'white',
                color: currentPage === 1 ? '#cbd5e1' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage === 1 ? 'default' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <div style={{ display: 'flex', gap: '0.25rem', margin: '0 0.5rem' }}>
              {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: 'none',
                    background: currentPage === pageNum ? '#0d2046' : 'transparent',
                    color: currentPage === pageNum ? 'white' : '#64748b',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid #f1f5f9',
                background: currentPage === totalPages ? '#f8fafc' : 'white',
                color: currentPage === totalPages ? '#cbd5e1' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage === totalPages ? 'default' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <ChevronRight size={18} />
            </button>
          </motion.div>

          <p style={{ textAlign: 'center', margin: 0, color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.01em' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalEvents)} of {totalEvents} events
          </p>
        </div>
      )}

      <StatusModal
        isOpen={statusModal.show}
        onClose={() => setStatusModal(prev => ({ ...prev, show: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </div>
  );
};

export default EventManagerEvents;
