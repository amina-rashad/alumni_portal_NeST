import React from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, Book, MessageSquare, 
  Phone, Mail, FileText, ChevronRight
} from 'lucide-react';

const RecruiterHelp: React.FC = () => {
  const nestNavy = '#1a2652';
  const nestRed = '#c8102e';

  const faqs = [
    { question: "How do I post a new job?", answer: "Navigate to the 'Post New Job' section under Jobs in the sidebar. Fill in the job details, requirements, and click publish." },
    { question: "How does the matching algorithm work?", answer: "Our AI matches candidates based on their technical skills, graduation batch, and specialization matching the criteria you define in the job post." },
    { question: "Can I export candidate resumes?", answer: "Yes, you can export individual resumes from a candidate's profile, or bulk download CVs in the Review Applications section." },
    { question: "Who do I contact for administrative issues?", answer: "For platform access, role changes, or technical faults, please submit a ticket via the 'Contact Support' button below." }
  ];

  const resources = [
    { title: "Recruiter Handbook", desc: "A complete guide on maximizing your hiring pipeline on NeST.", icon: <Book size={20} color={nestNavy} /> },
    { title: "Best Practices", desc: "Tips for writing job descriptions that attract top alumni.", icon: <FileText size={20} color="#10b981" /> }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <header style={{ 
          background: 'linear-gradient(135deg, #1a2652 0%, #0d1430 100%)', 
          padding: '40px', borderRadius: '24px', color: '#fff', 
          boxShadow: '0 20px 40px rgba(13, 20, 48, 0.15)', marginBottom: '40px',
          display: 'flex', flexDirection: 'column', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.8 }}>
          <HelpCircle size={20} color="#fff" />
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Support Center</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>How can we help you?</h1>
        <p style={{ fontSize: '16px', opacity: 0.8, maxWidth: '600px', margin: 0, lineHeight: 1.6 }}>
          Find answers, review best practices, or get in touch with our platform administrators to resolve any issues.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Left Column - FAQs & Resources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* FAQ Section */}
            <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Frequently Asked Questions</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {faqs.map((faq, i) => (
                      <div key={i} style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, color: nestNavy, margin: '0 0 8px 0' }}>{faq.question}</h3>
                          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{faq.answer}</p>
                      </div>
                  ))}
               </div>
            </div>

            {/* Guides & Downloads */}
            <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>Guides & Resources</h2>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  {resources.map((res, i) => (
                      <motion.div 
                        whileHover={{ scale: 1.01 }}
                        key={i} 
                        style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                      >
                         <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>{res.icon}</div>
                         <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{res.title}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{res.desc}</p>
                         </div>
                         <ChevronRight size={20} color="#cbd5e1" />
                      </motion.div>
                  ))}
               </div>
            </div>

        </div>

        {/* Right Column - Contact Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
               <div style={{ width: '56px', height: '56px', background: 'rgba(200, 16, 46, 0.1)', color: nestRed, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                   <MessageSquare size={28} />
               </div>
               <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>Contact Admin Support</h3>
               <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                   Experiencing technical issues or need higher privileges? Let our support team know.
               </p>
               <button style={{ width: '100%', padding: '14px', background: nestRed, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                   Submit a Ticket
               </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: '0 0 16px 0' }}>Direct Contacts</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '14px' }}>
                       <Mail size={16} color={nestNavy} /> admin@alumni.nest.com
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '14px' }}>
                       <Phone size={16} color={nestNavy} /> +91 (800) 123-4567
                   </div>
               </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default RecruiterHelp;
