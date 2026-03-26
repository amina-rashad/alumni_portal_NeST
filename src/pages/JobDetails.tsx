import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Briefcase, Clock, Building, CheckCircle2, Star, Share2, Upload } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

// Comprehensive mock data covering the jobs from JobListings
const DETAILED_JOBS: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'Kochi, Kerala (Hybrid)',
    type: 'Full-time',
    experience: '5-8 Years',
    postedAt: '2 days ago',
    salary: 'Not Disclosed',
    aboutContext: 'We are looking for an experienced Senior Full Stack Developer to lead our core engineering team and architect high-performance web applications that serve millions of users globally. You will work within an agile squad alongside Product, Design, and QA to bring enterprise-grade solutions to life.',
    responsibilities: [
      'Lead the architecture and development of resilient, scalable, and high-performance full-stack web applications.',
      'Collaborate closely with product managers, designers, and other engineers to deliver high-quality software.',
      'Mentor junior and mid-level engineers through code reviews, pair programming, and architectural discussions.',
      'Drive engineering best practices including CI/CD pipeline automation, unit testing, and code quality standards.',
      'Optimize application performance and database queries to ensure a seamless experience for end-users.',
      'Liaise with client stakeholders to understand technical requirements and propose robust architectural solutions.'
    ],
    requirements: [
      'Bachelor’s/Master’s Degree in Computer Science, Engineering, or a related field.',
      '5-8 years of hands-on experience in full-stack web development.',
      'Expert-level proficiency in React.js, modern JavaScript/TypeScript, and state management libraries (Redux, Context, etc.).',
      'Strong backend experience with Node.js, Express, or similar frameworks.',
      'Deep understanding of relational databases (PostgreSQL, MySQL) and ORMs.',
      'Experience with cloud platforms like AWS, Docker, and Kubernetes is highly preferred.',
      'Excellent problem-solving skills and the ability to articulate technical challenges effectively.'
    ],
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'TypeScript', 'Docker', 'System Architecture'],
    urgent: true
  },
  '2': {
    id: '2',
    title: 'Lead UX/UI Designer',
    department: 'Design',
    location: 'Trivandrum, Kerala (On-site)',
    type: 'Full-time',
    experience: '4-6 Years',
    postedAt: '1 week ago',
    aboutContext: 'Join our design team to craft intuitive and beautiful user experiences for our enterprise products. You will be at the forefront of designing human-centric interfaces, bridging the gap between user needs and business goals.',
    responsibilities: [
      'Lead design initiatives from conceptualization through to high-fidelity prototyping and user testing.',
      'Establish and maintain the company-wide design system and component libraries.',
      'Conduct comprehensive user research and translate insights into actionable UI improvements.',
      'Collaborate with front-end engineers to ensure pixel-perfect implementation of designs.'
    ],
    requirements: [
      'A strong portfolio showcasing end-to-end product design processes and enterprise-level applications.',
      '4-6 years of experience in UX/UI design, preferably in a B2B or agency environment.',
      'Expertise in Figma, Adobe Creative Suite, and prototyping tools.',
      'Deep understanding of accessibility standards, atomic design principles, and responsive layouts.'
    ],
    skills: ['Figma', 'Prototyping', 'Design Systems', 'User Testing', 'Wireframing', 'Agile Design'],
    urgent: false
  }
};

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use mock data for ID 1 if ID doesn't exist to prevent crashing on demo
  const job = id && DETAILED_JOBS[id] ? DETAILED_JOBS[id] : DETAILED_JOBS['1'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '4rem 2rem', background: '#f8f9fa', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Navigation & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <Link 
            to="/jobs" 
            style={{ display: 'inline-flex', alignItems: 'center', color: '#666666', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#666666'; }}
          >
            <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Jobs
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #ced4da', background: '#ffffff', padding: '0.5rem 1rem', borderRadius: '8px', color: '#4a4a4a', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f3f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <Share2 size={16} /> Share
            </button>
            <button 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #ced4da', background: '#ffffff', padding: '0.5rem 1rem', borderRadius: '8px', color: '#4a4a4a', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f3f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <Star size={16} /> Save
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            padding: '3rem', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            border: '1px solid #e9ecef',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {job.urgent && (
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              right: '-2.5rem',
              background: 'var(--primary)',
              color: 'white',
              padding: '0.4rem 3rem',
              transform: 'rotate(45deg)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '1px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              URGENT MATCH
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#f8f9fa', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="https://media.licdn.com/dms/image/C560BAQGNt2PXXs_WkQ/company-logo_200_200/0/1630656715690/nest_software_logo?e=2147483647&v=beta&t=GkMvL3fQ2zIq805g8A6iU21Nkx1bYwR7y5sL_V0zHwM" alt="NeST" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
            </div>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{job.department}</span>
              <h1 style={{ fontSize: '2.5rem', color: '#1a1a1a', margin: '0.5rem 0 1rem 0', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>{job.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#6c757d', fontSize: '1rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building size={18} /> NeST Digital</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} /> {job.location}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={18} /> {job.experience}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} /> {job.type}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e9ecef', paddingTop: '2rem' }}>
            <div>
              <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Posted {job.postedAt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#2b8a3e', background: '#e3fbee', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Alumni Priority Profile Match</span>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/jobs/${job.id}/apply`)}
              style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '1rem 3rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                border: 'none',
                transition: 'background 0.3s, transform 0.2s, box-shadow 0.3s',
                boxShadow: '0 4px 12px rgba(200, 16, 46, 0.2)'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.background = 'var(--primary-hover)'; 
                e.currentTarget.style.transform = 'translateY(-2px)'; 
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(200, 16, 46, 0.3)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.background = 'var(--primary)'; 
                e.currentTarget.style.transform = 'translateY(0)'; 
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(200, 16, 46, 0.2)';
              }}
            >
              Apply Now <Upload size={18} />
            </button>
          </div>
        </motion.div>

        {/* Content Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {/* About Role */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1.2rem', fontWeight: 600 }}>About the Role</h3>
              <p style={{ color: '#4a4a4a', lineHeight: 1.8, fontSize: '1.05rem' }}>
                {job.aboutContext}
              </p>
            </div>

            {/* Responsibilities */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1.2rem', fontWeight: 600 }}>Key Responsibilities</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {job.responsibilities.map((req: string, i: number) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#4a4a4a', lineHeight: 1.6, fontSize: '1.05rem' }}>
                    <CheckCircle2 color="var(--primary)" size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1.2rem', fontWeight: 600 }}>Requirements</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {job.requirements.map((req: string, i: number) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#4a4a4a', lineHeight: 1.6, fontSize: '1.05rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '8px', flexShrink: 0 }}></div>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {/* Skills */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '1.2rem', fontWeight: 600 }}>Required Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {job.skills.map((skill: string, index: number) => (
                  <span key={index} style={{ fontSize: '0.9rem', background: '#f8f9fa', color: '#4a4a4a', border: '1px solid #e9ecef', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 500 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Job Summary */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', border: '1px solid #e9ecef', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '1.5rem', fontWeight: 600 }}>Job Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <p style={{ color: '#868e96', fontSize: '0.85rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Department</p>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '1.05rem' }}>{job.department}</p>
                </div>
                <div>
                  <p style={{ color: '#868e96', fontSize: '0.85rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Experience Level</p>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '1.05rem' }}>{job.experience}</p>
                </div>
                <div>
                  <p style={{ color: '#868e96', fontSize: '0.85rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Job Type</p>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '1.05rem' }}>{job.type}</p>
                </div>
                <div>
                  <p style={{ color: '#868e96', fontSize: '0.85rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Salary</p>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, fontSize: '1.05rem' }}>{job.salary || 'Not Disclosed'}</p>
                </div>
              </div>

              <div style={{ marginTop: '2rem', borderTop: '1px solid #e9ecef', paddingTop: '1.5rem' }}>
                <p style={{ color: '#6c757d', fontSize: '0.9rem', textAlign: 'center' }}>
                  Not the right fit?
                </p>
                <Link to="/jobs" style={{ display: 'block', textAlign: 'center', color: 'var(--primary)', fontWeight: 600, marginTop: '0.5rem', textDecoration: 'none' }}>
                  View more jobs
                </Link>
              </div>
            </div>
            
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default JobDetails;
