import React, { useState, useEffect } from 'react';
import { coursesApi } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  MoreVertical, Edit3, CheckCircle2, 
  AlertCircle, X, Star, Trash2, Plus, Search, Filter, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusModal from '../../components/StatusModal';

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
    showConfirmOnly?: boolean;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    showConfirmOnly: true
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await coursesApi.getAllCourses();
      if (res.success && res.data) {
        // Map backend fields to frontend interface
        const rawCourses = (res.data as any).courses || [];
        const mappedCourses = rawCourses.map((c: any) => ({
          id: c.id || c._id,
          title: c.title,
          category: c.category || 'General',
          duration: c.duration || '0h',
          enrolledStudents: c.enrolled_count || 0,
          rating: 4.8, // Dummy rating for now
          status: c.is_published ? 'Published' : 'Draft',
          thumbnail: c.title.substring(0, 2).toUpperCase()
        }));
        setCourses(mappedCourses);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid #1e3a8a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No courses found. Add your first course to get started!
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course, i) => {
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
                          <button 
                            onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              setModal({
                                isOpen: true,
                                type: 'warning',
                                title: 'Delete Course',
                                message: `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
                                showConfirmOnly: false,
                                onConfirm: async () => {
                                  try {
                                    const res = await coursesApi.deleteCourse(course.id);
                                    if (res.success) {
                                      setModal({
                                        isOpen: true,
                                        type: 'success',
                                        title: 'Deleted!',
                                        message: 'The course has been removed successfully.',
                                        showConfirmOnly: true
                                      });
                                      fetchCourses();
                                    } else {
                                      setModal({
                                        isOpen: true,
                                        type: 'error',
                                        title: 'Delete Failed',
                                        message: res.message || 'Could not delete the course.',
                                        showConfirmOnly: true
                                      });
                                    }
                                  } catch (err) {
                                    setModal({
                                      isOpen: true,
                                      type: 'error',
                                      title: 'Error',
                                      message: 'An unexpected error occurred.',
                                      showConfirmOnly: true
                                    });
                                  }
                                }
                              });
                            }}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <StatusModal 
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        showConfirmOnly={modal.showConfirmOnly}
      />
    </div>
  );
};

export default AdminCourses;
