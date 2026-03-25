import React from 'react';

const AdminPlaceholder: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>{title}</h1>
      <p style={{ color: '#64748b', fontSize: '16px' }}>This page is coming soon in the admin panel.</p>
    </div>
  );
};

export default AdminPlaceholder;
