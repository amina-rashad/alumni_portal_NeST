import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2,
  Users,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { courseManagerAPI } from '../../services/api';
import { motion } from 'framer-motion';

interface Course {
  id: number;
  title: string;
  level: string;
  duration: string;
  students: number;
  status: string;
}

const CM_Courses: React.FC = () => {
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const response = await courseManagerAPI.fetchCourses();
        setCourses(response.data);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-['Inter',sans-serif] pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Course Portfolio</h1>
          <p className="text-slate-500 font-medium mt-1">Strategic oversight of all academic programs and enrollments.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/course-manager/courses/create')}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-[#c8102e] text-white rounded-2xl font-black shadow-xl shadow-red-900/20 hover:bg-[#a00d25] transition-all"
        >
          <Plus size={20} strokeWidth={3} />
          Create Program
        </motion.button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c8102e] transition-colors" />
          <input 
            type="text" 
            placeholder="Search programs by title, stack, or level..." 
            className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all font-bold text-[#1e293b] placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[#1e293b] font-black text-sm hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} />
            Advanced Filters
          </button>
          <div className="relative flex-1 md:flex-none">
            <select className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[#1e293b] font-black text-sm hover:bg-slate-50 transition-all shadow-sm appearance-none cursor-pointer focus:outline-none pr-12">
              <option>Sort: Recent First</option>
              <option>Sort: Highest Enrollment</option>
              <option>Sort: Level (A-Z)</option>
            </select>
            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
          </div>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        {error && (
          <div className="p-6 bg-red-50 text-[#c8102e] font-bold flex items-center gap-3 m-6 rounded-2xl border border-red-100">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        
        <div className="overflow-x-auto relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10">
              <div className="relative">
                <Loader2 size={48} className="animate-spin text-[#c8102e]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen size={16} className="text-[#1a2652]" />
                </div>
              </div>
              <span className="text-[#1a2652] font-black text-sm mt-4 uppercase tracking-widest">Synchronizing Portfolio</span>
            </div>
          ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Program</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Difficulty</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Enrollment</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-[#1a2652] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/10 group-hover:bg-[#c8102e] transition-colors">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <div className="font-black text-[#1e293b] text-lg leading-tight">{course.title}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Full Development Track
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-[#1e293b] font-bold text-sm">
                      <Clock size={16} className="text-[#c8102e]" />
                      {course.duration}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Student" />
                          </div>
                        ))}
                      </div>
                      <div className="text-[#1e293b] font-black text-sm">
                        {course.students.toLocaleString()} <span className="text-slate-400 font-bold ml-1">Students</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <motion.button whileHover={{ scale: 1.1 }} className="p-2.5 text-slate-300 hover:text-[#1a2652] hover:bg-slate-100 rounded-xl transition-all" title="View Analytics">
                        <Eye size={20} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Modify Program">
                        <Edit3 size={20} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} className="p-2.5 text-slate-300 hover:text-[#c8102e] hover:bg-red-50 rounded-xl transition-all" title="Decommission Program">
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
                    <div className="group-hover:hidden">
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
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Visualizing <span className="text-[#1a2652]">{courses.length}</span> of <span className="text-[#1a2652]">24</span> Strategic Programs
          </span>
          <div className="flex gap-4">
            <button className="px-6 py-3 border border-slate-100 rounded-xl text-xs font-black text-slate-300 cursor-not-allowed bg-white">Previous Track</button>
            <button className="px-6 py-3 bg-white border border-slate-100 rounded-xl text-xs font-black text-[#1a2652] hover:bg-red-50 hover:text-[#c8102e] transition-all shadow-sm">Next Track</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CM_Courses;

