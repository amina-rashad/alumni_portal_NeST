import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Headphones, ExternalLink, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import nestIcon from '../assets/nest_icon.png';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScrollToFooter?: () => void;
}

const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ isOpen, onClose, onScrollToFooter }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      toast.success('Your support message has been sent! Our team will contact you shortly.');
      setTimeout(() => {
        setIsSent(false);
        setName('');
        setEmail('');
        setMessage('');
        onClose();
      }, 2500);
    }, 900);
  };

  return createPortal(
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 13, 30, 0.78)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.35)',
            position: 'relative',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1a2652 0%, #0d1738 100%)',
              padding: '24px 28px',
              color: '#ffffff',
              position: 'relative'
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Close"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(200, 16, 46, 0.2)',
                  border: '1px solid rgba(200, 16, 46, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Headphones size={24} color="#ff6b81" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
                    NeST Support &amp; Help Desk
                  </h3>
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      color: '#4ade80',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '99px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    ONLINE
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#cbd5e1' }}>
                  Have questions about NDA Connect, accounts, or recruitment partnerships? We're here for you.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Contact Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '16px 28px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0'
            }}
          >

            <a
              href="tel:+914844203333"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
                color: '#1e293b',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={15} color="#0284c7" />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Call Desk</div>
                <div>+91-484-4203333</div>
              </div>
            </a>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#1e293b',
                fontSize: '12px',
                fontWeight: 600
              }}
              title="NeST Tech Park, NeST Valley, Near Infopark, Infopark P.O, Kakkanad, Kochi, Kerala – 682042"
            >
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={15} color="#d97706" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Office Campus</div>
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '12px' }}>
                  NeST Tech Park, Kochi
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
            {isSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <CheckCircle2 size={36} color="#16a34a" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1a2652', margin: '0 0 8px' }}>
                  Message Received!
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '380px', margin: 0 }}>
                  Thank you for reaching out. A NeST Digital support specialist will get back to you at <strong>{email}</strong> within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Your Full Name <span style={{ color: '#c8102e' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Your Email Address <span style={{ color: '#c8102e' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Inquiry Topic / Reason
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Account & Login Assistance">Account &amp; Login Assistance</option>
                    <option value="Recruitment & Hiring Partnership">Recruitment &amp; Hiring Partnership</option>
                    <option value="Alumni Verification & Certificates">Alumni Verification &amp; Certificates</option>
                    <option value="LMS / Course Access Issue">LMS / Course Access Issue</option>
                    <option value="Technical Bug Report">Technical Bug Report</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Your Message <span style={{ color: '#c8102e' }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe how we can assist you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {onScrollToFooter && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onScrollToFooter();
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      <MapPin size={13} /> View Full Campus Contact &amp; Hours
                    </button>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                    <button
                      type="button"
                      onClick={onClose}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#475569',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#1a2652',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(26, 38, 82, 0.25)',
                        opacity: isSubmitting ? 0.7 : 1
                      }}
                    >
                      <Send size={14} />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ContactSupportModal;
