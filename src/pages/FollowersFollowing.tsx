import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, UserPlus, UserCheck, UserMinus, Search, MessageSquare, Linkedin, MoreHorizontal, X, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

type ConnectionTab = 'followers' | 'following' | 'mutual';

interface Connection {
  id: string;
  name: string;
  role: string;
  company: string;
  batch: string;
  specialization: string;
  bio: string;
  skills: string[];
  isFollowing: boolean;
  followsYou: boolean;
  connectedSince: string;
  profilePicture?: string;
}

const MOCK_FOLLOWERS: Connection[] = [
  {
    id: 'u-1',
    name: 'Arjun Krishnan',
    role: 'Senior Software Engineer',
    company: 'NeST Digital',
    batch: '2018',
    specialization: 'Computer Science',
    bio: 'Full-stack developer passionate about scalable microservices and cloud-native architecture.',
    skills: ['React', 'Node.js', 'AWS', 'Docker'],
    isFollowing: true,
    followsYou: true,
    connectedSince: '2025-08-15'
  },
  {
    id: 'u-2',
    name: 'Meera Suresh',
    role: 'Data Scientist',
    company: 'TCS Research',
    batch: '2019',
    specialization: 'Artificial Intelligence',
    bio: 'Exploring the intersection of deep learning and healthcare analytics.',
    skills: ['Python', 'TensorFlow', 'NLP', 'Statistics'],
    isFollowing: false,
    followsYou: true,
    connectedSince: '2025-11-02'
  },
  {
    id: 'u-3',
    name: 'Rahul Menon',
    role: 'DevOps Lead',
    company: 'Infosys',
    batch: '2017',
    specialization: 'Information Technology',
    bio: 'Infrastructure as code evangelist. Building CI/CD pipelines that scale.',
    skills: ['Kubernetes', 'Terraform', 'Jenkins', 'Go'],
    isFollowing: true,
    followsYou: true,
    connectedSince: '2025-06-20'
  },
  {
    id: 'u-4',
    name: 'Sneha George',
    role: 'Product Manager',
    company: 'Freshworks',
    batch: '2020',
    specialization: 'Electronics',
    bio: 'Bridging technology and business to deliver user-centric products.',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
    isFollowing: false,
    followsYou: true,
    connectedSince: '2026-01-10'
  },
  {
    id: 'u-5',
    name: 'Vishnu Prasad',
    role: 'Cloud Architect',
    company: 'Amazon Web Services',
    batch: '2016',
    specialization: 'Computer Science',
    bio: 'Designing distributed systems at scale. AWS certified solutions architect.',
    skills: ['AWS', 'System Design', 'Microservices', 'Python'],
    isFollowing: true,
    followsYou: true,
    connectedSince: '2025-04-18'
  },
  {
    id: 'u-6',
    name: 'Lakshmi Nair',
    role: 'UX Designer',
    company: 'Zoho Corp',
    batch: '2021',
    specialization: 'Design',
    bio: 'Creating intuitive digital experiences. Design thinking practitioner.',
    skills: ['Figma', 'UI/UX', 'Prototyping', 'Design Systems'],
    isFollowing: false,
    followsYou: true,
    connectedSince: '2026-02-05'
  }
];

const MOCK_FOLLOWING: Connection[] = [
  {
    id: 'u-1',
    name: 'Arjun Krishnan',
    role: 'Senior Software Engineer',
    company: 'NeST Digital',
    batch: '2018',
    specialization: 'Computer Science',
    bio: 'Full-stack developer passionate about scalable microservices and cloud-native architecture.',
    skills: ['React', 'Node.js', 'AWS', 'Docker'],
    isFollowing: true,
    followsYou: true,
    connectedSince: '2025-08-15'
  },
  {
    id: 'u-3',
    name: 'Rahul Menon',
    role: 'DevOps Lead',
    company: 'Infosys',
    batch: '2017',
    specialization: 'Information Technology',
    bio: 'Infrastructure as code evangelist. Building CI/CD pipelines that scale.',
    skills: ['Kubernetes', 'Terraform', 'Jenkins', 'Go'],
    isFollowing: true,
    followsYou: true,
    connectedSince: '2025-06-20'
  },
  {
    id: 'u-5',
    name: 'Vishnu Prasad',
    role: 'Cloud Architect',
    company: 'Amazon Web Services',
    batch: '2016',
    specialization: 'Computer Science',
    bio: 'Designing distributed systems at scale. AWS certified solutions architect.',
    skills: ['AWS', 'System Design', 'Microservices', 'Python'],
    isFollowing: true,
    followsYou: true,
    connectedSince: '2025-04-18'
  },
  {
    id: 'u-7',
    name: 'Dr. Arun Menon',
    role: 'ML Research Lead',
    company: 'Google DeepMind',
    batch: '2014',
    specialization: 'Artificial Intelligence',
    bio: 'Leading research on large language models and reinforcement learning.',
    skills: ['PyTorch', 'Research', 'LLMs', 'Reinforcement Learning'],
    isFollowing: true,
    followsYou: false,
    connectedSince: '2025-09-12'
  },
  {
    id: 'u-8',
    name: 'Priya Sharma',
    role: 'Engineering Manager',
    company: 'Microsoft',
    batch: '2015',
    specialization: 'Computer Science',
    bio: 'Leading cross-functional engineering teams building enterprise products.',
    skills: ['Leadership', 'C#', '.NET', 'Azure'],
    isFollowing: true,
    followsYou: false,
    connectedSince: '2025-07-30'
  },
  {
    id: 'u-9',
    name: 'Karthik Iyer',
    role: 'Security Engineer',
    company: 'Palo Alto Networks',
    batch: '2019',
    specialization: 'Cybersecurity',
    bio: 'Specializing in application security, penetration testing, and threat modeling.',
    skills: ['Security', 'Pen Testing', 'SIEM', 'Compliance'],
    isFollowing: true,
    followsYou: false,
    connectedSince: '2026-01-22'
  }
];

const FollowersFollowing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConnectionTab>('followers');
  const [searchTerm, setSearchTerm] = useState('');
  const [followState, setFollowState] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    [...MOCK_FOLLOWERS, ...MOCK_FOLLOWING].forEach(c => {
      state[c.id] = c.isFollowing;
    });
    return state;
  });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const navigate = useNavigate();

  const getConnectionsForTab = (): Connection[] => {
    let connections: Connection[];
    switch (activeTab) {
      case 'followers':
        connections = MOCK_FOLLOWERS;
        break;
      case 'following':
        connections = MOCK_FOLLOWING;
        break;
      case 'mutual':
        connections = MOCK_FOLLOWERS.filter(f => f.isFollowing && f.followsYou);
        break;
      default:
        connections = MOCK_FOLLOWERS;
    }

    if (searchTerm) {
      connections = connections.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return connections;
  };

  const toggleFollow = (userId: string) => {
    setFollowState(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const mutualCount = MOCK_FOLLOWERS.filter(f => f.isFollowing && f.followsYou).length;

  const connections = getConnectionsForTab();

  const TAB_CONFIG: { key: ConnectionTab; label: string; count: number; icon: React.ReactNode }[] = [
    { key: 'followers', label: 'Followers', count: MOCK_FOLLOWERS.length, icon: <Users size={16} /> },
    { key: 'following', label: 'Following', count: MOCK_FOLLOWING.length, icon: <UserCheck size={16} /> },
    { key: 'mutual', label: 'Mutual', count: mutualCount, icon: <UserPlus size={16} /> },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short', year: 'numeric'
    });
  };

  const getInitialColor = (name: string) => {
    const colors = ['#c92a2a', '#1971c2', '#2b8a3e', '#e67700', '#7048e8', '#0d2046', '#d6336c', '#087f5b'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div style={{ minHeight: '100vh', padding: '4rem 2rem', background: '#ffffff', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '2.5rem' }}
        >
          <Link
            to="/networking"
            style={{ display: 'inline-flex', alignItems: 'center', color: '#666666', marginBottom: '1.5rem', fontSize: '0.9rem', transition: 'color 0.3s', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#666666'; }}
          >
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Directory
          </Link>
          <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>
            My <span style={{ color: 'var(--primary)' }}>Connections</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#4a4a4a', maxWidth: '600px' }}>
            Manage your professional network. Stay connected with alumni, mentors, and peers from the NeST community.
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}
        >
          {[
            { label: 'Followers', count: MOCK_FOLLOWERS.length, color: '#1a1a1a', bg: '#f8f9fa', icon: <Users size={20} /> },
            { label: 'Following', count: MOCK_FOLLOWING.length, color: '#1971c2', bg: '#e7f5ff', icon: <UserCheck size={20} /> },
            { label: 'Mutual', count: mutualCount, color: '#2b8a3e', bg: '#ebfbee', icon: <UserPlus size={20} /> },
            { label: 'New This Month', count: 2, color: 'var(--primary)', bg: '#fff5f5', icon: <UserPlus size={20} /> },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
              style={{
                background: stat.bg,
                borderRadius: '14px',
                padding: '1.4rem 1.5rem',
                border: '1px solid #e9ecef',
                textAlign: 'center',
                transition: 'all 0.3s',
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem', color: stat.color, opacity: 0.7 }}>
                {stat.icon}
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, margin: '0 0 0.2rem 0' }}>{stat.count}</p>
              <p style={{ fontSize: '0.82rem', color: '#6c757d', fontWeight: 500, margin: 0 }}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.13 }}
          style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid #f1f3f5' }}
        >
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.5rem',
                fontSize: '0.92rem',
                fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? 'var(--primary)' : '#6c757d',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '-2px'
              }}
            >
              {tab.icon}
              {tab.label}
              <span style={{
                background: activeTab === tab.key ? 'var(--primary)' : '#e9ecef',
                color: activeTab === tab.key ? 'white' : '#6c757d',
                padding: '0.15rem 0.55rem',
                borderRadius: '10px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '14px',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}
        >
          <div style={{ flex: '1', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid #ced4da',
                background: '#ffffff',
                color: '#1a1a1a',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd', display: 'flex' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Connection Cards */}
        <AnimatePresence mode="popLayout">
          {connections.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {connections.map((person, index) => {
                const isFollowingPerson = followState[person.id];
                const isMutual = isFollowingPerson && person.followsYou;
                const avatarColor = getInitialColor(person.name);

                return (
                  <motion.div
                    key={`${activeTab}-${person.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    layout
                    onMouseEnter={() => setHoveredCard(person.id)}
                    onMouseLeave={() => { setHoveredCard(null); setActionMenuId(null); }}
                    style={{
                      background: '#ffffff',
                      border: `1px solid ${hoveredCard === person.id ? '#dee2e6' : '#e9ecef'}`,
                      borderRadius: '16px',
                      padding: '1.5rem',
                      transition: 'all 0.3s ease',
                      boxShadow: hoveredCard === person.id ? '0 8px 24px rgba(0,0,0,0.06)' : '0 2px 6px rgba(0,0,0,0.02)',
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Avatar + Info + Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      {/* Avatar */}
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '14px',
                          background: avatarColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          flexShrink: 0,
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/profile/${person.id}`)}
                      >
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>

                      {/* Name & Role */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <h3
                            style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a1a', margin: 0, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            onClick={() => navigate(`/profile/${person.id}`)}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}
                          >
                            {person.name}
                          </h3>
                          {isMutual && (
                            <span style={{
                              padding: '0.1rem 0.45rem',
                              borderRadius: '6px',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              background: '#ebfbee',
                              color: '#2b8a3e',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              flexShrink: 0
                            }}>
                              Mutual
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#4a4a4a', margin: '0 0 0.15rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {person.role}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: '#6c757d', margin: 0 }}>
                          {person.company} • Batch {person.batch}
                        </p>
                      </div>

                      {/* More Menu */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === person.id ? null : person.id); }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd',
                            padding: '0.25rem', display: 'flex', borderRadius: '6px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#6c757d'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#adb5bd'; }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        <AnimatePresence>
                          {actionMenuId === person.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -5 }}
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                background: '#ffffff',
                                border: '1px solid #e9ecef',
                                borderRadius: '10px',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                                padding: '0.4rem',
                                zIndex: 10,
                                minWidth: '160px'
                              }}
                            >
                              {[
                                { label: 'View Profile', action: () => navigate(`/profile/${person.id}`) },
                                { label: 'Send Message', action: () => {} },
                                { label: 'Remove Connection', action: () => {}, danger: true }
                              ].map(item => (
                                <button
                                  key={item.label}
                                  onClick={(e) => { e.stopPropagation(); item.action(); setActionMenuId(null); }}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.55rem 0.9rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: (item as any).danger ? '#c92a2a' : '#4a4a4a',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.15s'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = (item as any).danger ? '#fff5f5' : '#f8f9fa'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Bio */}
                    <p style={{
                      fontSize: '0.85rem',
                      color: '#6c757d',
                      lineHeight: 1.55,
                      margin: '0 0 0.9rem 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {person.bio}
                    </p>

                    {/* Skills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.1rem' }}>
                      {person.skills.slice(0, 4).map((skill, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            background: '#f8f9fa',
                            color: '#495057',
                            border: '1px solid #e9ecef',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.9rem',
                      borderTop: '1px solid #f1f3f5'
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '34px', height: '34px', borderRadius: '8px',
                            background: '#f8f9fa', border: '1px solid #e9ecef',
                            color: '#6c757d', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#e7f5ff'; e.currentTarget.style.color = '#1971c2'; e.currentTarget.style.borderColor = '#74c0fc'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#6c757d'; e.currentTarget.style.borderColor = '#e9ecef'; }}
                          title="Send Message"
                        >
                          <MessageSquare size={15} />
                        </button>
                        <button
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '34px', height: '34px', borderRadius: '8px',
                            background: '#f8f9fa', border: '1px solid #e9ecef',
                            color: '#6c757d', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#e7f5ff'; e.currentTarget.style.color = '#0077b5'; e.currentTarget.style.borderColor = '#74c0fc'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#6c757d'; e.currentTarget.style.borderColor = '#e9ecef'; }}
                          title="View LinkedIn"
                        >
                          <Linkedin size={15} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#adb5bd' }}>
                          Since {formatDate(person.connectedSince)}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFollow(person.id); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 0.9rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isFollowingPerson ? '#ffffff' : 'var(--primary)',
                            color: isFollowingPerson ? '#4a4a4a' : 'white',
                            border: isFollowingPerson ? '1px solid #ced4da' : '1px solid var(--primary)'
                          }}
                          onMouseEnter={(e) => {
                            if (isFollowingPerson) {
                              e.currentTarget.style.borderColor = '#ffa8a8';
                              e.currentTarget.style.color = '#c92a2a';
                              e.currentTarget.style.background = '#fff5f5';
                              e.currentTarget.innerHTML = `<span style="display:flex;align-items:center;gap:0.35rem"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/></svg>Unfollow</span>`;
                            } else {
                              e.currentTarget.style.opacity = '0.9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isFollowingPerson) {
                              e.currentTarget.style.borderColor = '#ced4da';
                              e.currentTarget.style.color = '#4a4a4a';
                              e.currentTarget.style.background = '#ffffff';
                              e.currentTarget.innerHTML = `<span style="display:flex;align-items:center;gap:0.35rem"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11 16 11"/><path d="M19 8l0 6"/></svg>Following</span>`;
                            } else {
                              e.currentTarget.style.opacity = '1';
                            }
                          }}
                        >
                          {isFollowingPerson ? (
                            <><UserCheck size={14} /> Following</>
                          ) : (
                            <><UserPlus size={14} /> Follow</>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ background: '#f8f9fa', display: 'inline-block', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <Users size={40} color="#adb5bd" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>No connections found</h3>
              <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                {searchTerm
                  ? 'Try adjusting your search to find connections.'
                  : `You don't have any ${activeTab === 'mutual' ? 'mutual connections' : activeTab} yet. Explore the alumni directory to grow your network!`}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ background: '#ffffff', color: '#1a1a1a', border: '1px solid #ced4da', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  to="/networking"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.8rem 2rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'background 0.3s'
                  }}
                >
                  Browse Alumni Directory
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FollowersFollowing;
