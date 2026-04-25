import React from 'react';

const EventManagerPlaceholder: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '20px',
    background: '#fff',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    padding: '40px'
  }}>
    <div style={{ 
      width: '80px', 
      height: '80px', 
      borderRadius: '24px', 
      background: 'rgba(79, 70, 229, 0.05)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '32px'
    }}>
      🚧
    </div>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>{title}</h2>
      <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>This module is currently under development.</p>
    </div>
  </div>
);

export default EventManagerPlaceholder;
