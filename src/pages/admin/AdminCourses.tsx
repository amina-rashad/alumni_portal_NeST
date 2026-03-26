import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, BookOpen, Clock, Users, 
  MoreVertical, Edit3, CheckCircle2, 
  AlertCircle, X, Layout, 
  FileText, Play
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  enrolledStudents: number;
  rating: number;
  status: 'Published' | 'Draft' | 'Archived';
  thumbnail: string;
}

const AdminCourses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Dummy Course Data
  const [courses] = useState<Course[]>([
    {
      id: '1',
      title: 'Full-Stack React Development',
      category: 'Engineering',
      duration: '45h 20m',
      enrolledStudents: 1248,
      rating: 4.8,
      status: 'Published',
      thumbnail: 'RC'
    },
    {
      id: '2',
      title: 'Advanced Python for Data Science',
      category: 'Data Science',
      duration: '38h 15m',
      enrolledStudents: 856,
      rating: 4.9,
      status: 'Published',
      thumbnail: 'PY'
    },
    {
      id: '3',
      title: 'UI/UX Design Systems',
      category: 'Design',
      duration: '22h 45m',
      enrolledStudents: 542,
      rating: 4.7,
      status: 'Draft',
      thumbnail: 'UX'
    },
    {
      id: '4',
      title: 'Project Management Professional (PMP)',
      category: 'Business',
      duration: '30h 00m',
      enrolledStudents: 934,
      rating: 4.6,
      status: 'Published',
      thumbnail: 'PM'
    },
    {
      id: '5',
      title: 'Cloud Infrastructure with AWS',
      category: 'Cloud Computing',
      duration: '52h 10m',
      enrolledStudents: 721,
      rating: 4.9,
      status: 'Published',
      thumbnail: 'AWS'
    }
  ]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Published': return { bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircle2 size={12} /> };
      case 'Draft': return { bg: '#fefce8', color: '#ca8a04', icon: <AlertCircle size={12} /> };
      case 'Archived': return { bg: '#fef2f2', color: '#dc2626', icon: <X size={12} /> };
      default: return { bg: '#f8fafc', color: '#64748b', icon: <Clock size={12} /> };
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px', letterSpacing: '-0.02em' }}>Course Management</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Design, track, and manage all academic courses in the platform.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '12px 24px', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
            border: 'none', 
            borderRadius: '14px', 
            color: '#fff', 
            fontWeight: 700, 
            cursor: 'pointer', 
            boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="hover-pop"
        >
          <Plus size={20} /> Add New Course
        </button>
      </div>

      {/* Stats Quick View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Total Courses', value: '42', icon: <BookOpen size={22} />, color: '#3b82f6' },
          { label: 'Total Students', value: '18,492', icon: <Users size={22} />, color: '#8b5cf6' },
          { label: 'Active Courses', value: '38', icon: <Play size={22} />, color: '#10b981' },
          { label: 'Drafts', value: '4', icon: <FileText size={22} />, color: '#f59e0b' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
              background: '#fff', 
              padding: '24px', 
              borderRadius: '20px', 
              border: '1px solid #f1f5f9', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${stat.color}10`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, margin: '0 0 4px 0' }}>{stat.label}</p>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Table Container */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)', overflow: 'hidden' }}>
        {/* Table Filters */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '0 18px', flex: 1, maxWidth: '450px' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by course title or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '14px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: '#1e293b' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              <Filter size={16} /> Filter
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              <Layout size={16} /> View All
            </button>
          </div>
        </div>

        {/* Courses Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '18px 32px', color: '#64748b', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>COURSE DETAILS</th>
                <th style={{ padding: '18px 32px', color: '#64748b', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CATEGORY</th>
                <th style={{ padding: '18px 32px', color: '#64748b', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ENROLLMENT</th>
                <th style={{ padding: '18px 32px', color: '#64748b', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</th>
                <th style={{ padding: '18px 32px', color: '#64748b', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((course, i) => {
                const statusStyle = getStatusStyle(course.status);
                return (
                  <motion.tr 
                    key={course.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                          width: '52px', 
                          height: '52px', 
                          borderRadius: '12px', 
                          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
                          color: '#fff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '14px', 
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          {course.thumbnail}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{course.title}</span>
                          <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} /> {course.duration}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: 600 }}>
                        {course.category}
                      </span>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{course.enrolledStudents.toLocaleString()}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Active Learners</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 700, 
                        background: statusStyle.bg, 
                        color: statusStyle.color
                      }}>
                        {statusStyle.icon} {course.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}>
                          <Edit3 size={16} />
                        </button>
                        <button style={{ padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', display: 'flex' }}>
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Placeholder */}
        <div style={{ padding: '24px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Showing 1 to 5 of 42 courses</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Previous</button>
            <button style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      </div>

      {/* Tighter Glassy Add Course Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              style={{ 
                background: 'rgba(255, 255, 255, 0.7)', 
                backdropFilter: 'blur(24px)',
                width: '90%', 
                maxWidth: '520px', 
                borderRadius: '32px', 
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', 
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Add New Course</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Create a new learning path for your students.</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '8px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.4)', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '32px' }}>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={14} style={{ color: '#3b82f6' }} /> Course Title
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mastering Advanced React Patterns" 
                      style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.5)', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                      <select style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.5)', fontSize: '14px', outline: 'none', color: '#1e293b' }}>
                        <option>Engineering</option>
                        <option>Design</option>
                        <option>Business</option>
                        <option>Data Science</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Description</label>
                    <textarea 
                      placeholder="Write a brief overview of what students will learn..." 
                      rows={3}
                      style={{ padding: '14px 16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.5)', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit', color: '#1e293b' }}
                    />
                  </div>
                </form>
              </div>

              <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'rgba(255,255,255,0.3)' }}>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '12px', background: 'transparent', color: '#64748b', border: '1px solid rgba(0,0,0,0.05)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13px', boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.3)' }}
                >
                  Create Course
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCourses;
