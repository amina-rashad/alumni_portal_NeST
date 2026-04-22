import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import nestIcon from '../assets/nest_icon.png';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  showConfirmOnly?: boolean;
}

const StatusModal: React.FC<StatusModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  message, 
  confirmText = "Okay",
  onConfirm,
  showConfirmOnly = true
}) => {
  const nestNavy = '#1a2652';

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          {/* Backdrop (Matching Login UI) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)' }}
          />

          {/* Modal Card (Matching Login UI) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              background: '#fff',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              textAlign: 'center',
              border: '1px solid #f1f5f9'
            }}
          >
            {/* NeST Logo Header (Consistent with User Interface) */}
            <div style={{ 
              width: '180px', height: '100px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 12px'
            }}>
              <img 
                src={nestIcon} 
                alt="NeST Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
            
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>{title}</h2>
            <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>{message}</p>

            <div style={{ display: 'flex', gap: '12px' }}>
              {!showConfirmOnly && (
                <button 
                  onClick={onClose}
                  style={{ 
                    flex: 1, 
                    padding: '16px', 
                    borderRadius: '14px', 
                    border: '1px solid #e2e8f0', 
                    background: '#fff', 
                    color: '#64748b', 
                    fontWeight: 700, 
                    fontSize: '16px',
                    cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={onConfirm || onClose}
                style={{ 
                  flex: 1, 
                  padding: '16px', 
                  borderRadius: '14px', 
                  border: 'none', 
                  background: nestNavy, 
                  color: '#fff', 
                  fontWeight: 700, 
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(26, 38, 82, 0.2)'
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StatusModal;
