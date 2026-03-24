import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', color: '#0056b3', textDecoration: 'none', marginRight: '1rem' }}>
          <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back
        </Link>
        <h1 style={{ margin: 0, color: '#333' }}>Dashboard</h1>
      </div>
      
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2>Welcome to the Dashboard Page</h2>
        <p style={{ color: '#666', lineHeight: 1.6 }}>
          This page is currently under rapid development. It will soon contain all the fully functional professional features required for Dashboard.
        </p>
      </div>
    </motion.div>
  );
};

export default Dashboard;
