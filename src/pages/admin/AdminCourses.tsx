import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, BookOpen, Clock, Users, 
  MoreVertical, Edit3, CheckCircle2, 
  AlertCircle, X, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy Course Data
  const [courses] = useState<Course[]>([
    { id: '1', title: 'Full-Stack React Development', category: 'Engineering', duration: '45h 20m', enrolledStudents: 1248, rating: 4.8, status: 'Published', thumbnail: 'RC' },
    { id: '2', title: 'Advanced Python for Data Science', category: 'Data Science', duration: '38h 15m', enrolledStudents: 856, rating: 4.9, status: 'Published', thumbnail: 'PY' },
    { id: '3', title: 'UI/UX Design Systems', category: 'Design', duration: '22h 45m', enrolledStudents: 542, rating: 4.7, status: 'Draft', thumbnail: 'UX' },
    { id: '4', title: 'Project Management Professional (PMP)', category: 'Business', duration: '30h 00m', enrolledStudents: 934, rating: 4.6, status: 'Published', thumbnail: 'PM' },
    { id: '5', title: 'Cloud Infrastructure with AWS', category: 'Cloud Computing', duration: '52h 10m', enrolledStudents: 721, rating: 4.9, status: 'Published', thumbnail: 'AWS' }
  ]);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Published': return { bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircle2 size={12} /> };
      case 'Draft': return { bg: '#fefce8', color: '#ca8a04', icon: <AlertCircle size={12} /> };
      case 'Archived': return { bg: '#fef2f2', color: '#dc2626', icon: <X size={12} /> };
      default: return { bg: '#f1f5f9', color: '#475569', icon: <Clock size={12} /> };
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Course Management</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Design and track all academic courses in the platform.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/courses/add')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#1e3a8a', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)' }}
        >
          <Plus size={20} /> Add Course
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '0 18px', flex: 1, maxWidth: '450px' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search courses by name or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '14px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: '#1e293b' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '18px 32px', color: '#64748b', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase' }}>COURSE DETAILS</th>
                <th style={{ padding: '18px 32px', color: '#64748b', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase' }}>ENROLLMENT</th>
                <th style={{ padding: '18px 32px', color: '#64748b', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase' }}>DURATION</th>
                <th style={{ padding: '18px 32px', color: '#64748b', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase' }}>STATUS</th>
                <th style={{ padding: '18px 32px', color: '#64748b', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course, i) => {
                const statusStyle = getStatusStyle(course.status);
                return (
                  <tr key={course.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#1e3a8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {course.thumbnail}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{course.title}</div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>{course.category}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{course.enrolledStudents.toLocaleString()}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>Enrolled</div>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>{course.duration}</span>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color }}>
                        {statusStyle.icon} {course.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}><Edit3 size={16} /></button>
                        <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
