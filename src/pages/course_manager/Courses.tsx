import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2,
  Clock,
  BookOpen,
  Users,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { courseService } from '../../services/courseService';
import type { Course } from '../../types/course-manager';

// Type moved to global types file

const CM_Courses: React.FC = () => {
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | string | null>(null);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);


  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'bg-red-50 text-[#c8102e] border-red-100';
      case 'Intermediate': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Beginner': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.level || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Are you sure you want to decommission this program? This action cannot be undone.')) {
      try {
        setIsDeleting(id);
        await courseService.deleteCourse(id);
        setCourses(prev => prev.filter(c => c.id !== id.toString()));
      } catch (err) {
        alert('Failed to delete course');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleUpdate = async (updatedData: Partial<Course>) => {
    if (!selectedCourse) return;
    try {
      await courseService.updateCourse(selectedCourse.id, updatedData);
      setIsEditModalOpen(false);
      loadCourses(); // Refresh list
    } catch (err) {
      alert('Failed to update course');
    }
  };

  return (
    <div className="cm-animate-fade-up" style={{ maxWidth: "1350px", margin: "0 auto", padding: "0 32px 48px 32px", display: "flex", flexDirection: "column", gap: "32px", fontFamily: "\"Inter\", sans-serif" }}>
      {/* Header */}
      <div className="cm-page-header">
        <div>
          <h1 className="cm-title">Course Portfolio</h1>
          <p className="cm-subtitle">Strategic oversight of all academic programs and enrollments.</p>
        </div>
        <button 
          onClick={() => navigate('/course-manager/courses/create')}
          className="cm-btn cm-btn-primary px-8"
        >
          <Plus size={20} strokeWidth={3} className="mr-1" />
          Create Program
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between gap-6">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c8102e] transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search programs by title, stack, or level..." 
            className="cm-input bg-slate-50/50 border-transparent focus:bg-white focus:border-slate-100 h-14 rounded-full"
            style={{ paddingLeft: '64px' }}
          />
        </div>
        <button className="cm-btn cm-btn-secondary h-14 px-8 rounded-full border-slate-100 gap-3">
          <Filter size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Advanced Filters</span>
        </button>
        <div className="relative w-64 group">
          <select className="cm-input cm-select h-14 rounded-full border-slate-100 bg-slate-50/50 focus:bg-white focus:border-slate-100">
            <option>Sort: Recent First</option>
            <option>Highest Enrollment</option>
          </select>
        </div>
      </div>

      {/* Course Table */}
      <div className="cm-table-container">
        {error && (
          <div className="p-6 bg-red-50 text-[#c8102e] font-bold flex items-center gap-3 m-6 rounded-2xl border border-red-100">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        
        <div className="overflow-x-auto relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10">
              <Loader2 size={48} className="animate-spin text-[#c8102e] mb-4" />
              <span className="text-[#1a2652] font-black text-sm uppercase tracking-widest">Synchronizing Portfolio</span>
            </div>
          ) : (
          <table className="cm-table">
            <thead>
              <tr>
                <th>Academic Program</th>
                <th>Difficulty</th>
                <th>Duration</th>
                <th>Active Enrollment</th>
                <th className="text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className={`group hover:bg-slate-50/50 transition-colors ${isDeleting === course.id ? 'opacity-50 grayscale' : ''}`}>
                  <td className="py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-[#1a2652] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-all">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <div className="font-black text-[#1e293b] text-base mb-1.5">{course.title}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Full Development Track
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      course.level === 'Advanced' ? 'cm-badge-error' : 
                      course.level === 'Intermediate' ? 'cm-badge-info' : 'cm-badge-success'
                    }`}>
                      {course.level}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5 text-[#1e293b] font-black text-xs">
                      <Clock size={16} className="text-[#c8102e]" />
                      {course.duration}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2.5">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-9 h-9 rounded-full border-2 border-white shadow-sm overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+25}`} alt="Student" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-[#1e293b] font-black text-sm">{(course.students || 0).toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Students</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right pr-8">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                      <button 
                        onClick={() => { setSelectedCourse(course); setIsViewModalOpen(true); }}
                        className="cm-btn cm-btn-secondary cm-btn-icon h-10 w-10" 
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedCourse(course); setIsEditModalOpen(true); }}
                        className="cm-btn cm-btn-secondary cm-btn-icon h-10 w-10 hover:text-[#c8102e] hover:border-[#c8102e]/30" 
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
                        disabled={isDeleting === course.id}
                        className="cm-btn cm-btn-secondary cm-btn-icon h-10 w-10 hover:text-red-600 hover:bg-red-50" 
                      >
                        {isDeleting === course.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                    <div className="group-hover:hidden transition-opacity">
                       <MoreVertical size={20} className="text-slate-200 ml-auto" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
        
        {/* Pagination */}
        <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Visualizing <span className="text-[#1a2652]">{filteredCourses.length}</span> of <span className="text-[#1a2652]">{courses.length}</span> Strategic Programs
          </span>
          <div className="flex gap-3">
            <button className="cm-btn cm-btn-secondary h-10 px-4 text-[10px] opacity-50 cursor-not-allowed">Previous</button>
            <button className="cm-btn cm-btn-secondary h-10 px-4 text-[10px]">Next Track</button>
          </div>
        </div>
      </div>

      {/* Course Details Modal - MINIMAL SAAS REDESIGN */}
      <AnimatePresence>
        {isViewModalOpen && selectedCourse && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              className="bg-white w-full max-w-[700px] rounded-[16px] shadow-xl overflow-hidden flex flex-col border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 flex flex-col gap-6">
                
                {/* 1. Minimal Header */}
                <div className="flex items-start gap-4">
                  <div className="text-[#1a2652] mt-1">
                    <BookOpen size={24} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                      {selectedCourse.title}
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{selectedCourse.level}</span>
                      <span>•</span>
                      <span>{selectedCourse.duration}</span>
                      <span>•</span>
                      <span>{selectedCourse.students?.toLocaleString()} REGISTERED STUDENTS</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* 2. Program Director (Minimal Row) */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-[#c8102e] uppercase tracking-widest">Program Director</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs overflow-hidden border border-slate-200">
                      {selectedCourse.instructor ? (
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCourse.instructor)}&background=f8fafc&color=1a2652&bold=true`} 
                          alt={selectedCourse.instructor} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        'LD'
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{selectedCourse.instructor || 'Lead NeST Expert'}</span>
                      <span className="text-[11px] text-slate-400">Certified Academic Director</span>
                    </div>
                  </div>
                </div>

                {/* 3. Overview (Plain Text) */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-[#c8102e] uppercase tracking-widest">Program Overview</span>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {selectedCourse.description || 'This course covers the strategic foundations of modern computing, focused on data extraction, analysis, and visualization techniques essential for professional engineering tracks.'}
                  </p>
                </div>

                {/* 4. Footer Actions */}
                <div className="mt-2 flex justify-end gap-3 pt-2">
                  <button 
                    onClick={() => { setIsViewModalOpen(false); setIsEditModalOpen(true); }}
                    className="px-5 py-2 text-xs font-bold text-[#1a2652] hover:text-[#c8102e] transition-colors uppercase tracking-widest"
                  >
                    Modify Program
                  </button>
                  <button 
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest shadow-md"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modify Program Modal - ALIGNED MINIMAL REDESIGN */}
      <AnimatePresence>
        {isEditModalOpen && selectedCourse && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white w-full max-w-[600px] rounded-[16px] shadow-xl flex flex-col overflow-hidden border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Modify Track</h2>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdate({
                    title: formData.get('title') as string,
                    level: formData.get('level') as string,
                    duration: formData.get('duration') as string,
                  });
                }}
                className="p-6 flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Program Designation</label>
                  <input 
                    name="title" 
                    defaultValue={selectedCourse.title} 
                    className="w-full h-11 border border-slate-200 px-4 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-[#1a2652] transition-all" 
                    placeholder="Enter track title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proficiency Level</label>
                    <select 
                      name="level" 
                      defaultValue={selectedCourse.level} 
                      className="w-full h-11 border border-slate-200 px-4 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-[#1a2652] appearance-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Duration</label>
                    <input 
                      name="duration" 
                      defaultValue={selectedCourse.duration} 
                      className="w-full h-11 border border-slate-200 px-4 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-[#1a2652]" 
                      placeholder="e.g. 12 Weeks"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3 pt-5 border-t border-slate-50">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)} 
                    className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    className="px-8 py-2 bg-[#1a2652] text-white rounded-lg text-xs font-bold shadow-md hover:bg-[#253366] transition-all uppercase tracking-widest"
                  >
                    Save Track
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CM_Courses;

