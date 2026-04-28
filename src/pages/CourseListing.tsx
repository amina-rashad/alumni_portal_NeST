import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Clock, 
  Star, 
  ChevronRight, 
  Filter,
  ArrowUpRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '../services/api';

const CourseListing: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const res = await coursesApi.getAllCourses();
        if (res.success && res.data && res.data.courses) {
          setCourses(res.data.courses);
          setFilteredCourses(res.data.courses);
        }
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || c.level === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredCourses(filtered);
  }, [searchTerm, selectedCategory, courses]);

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Outfit',sans-serif] pb-20">
      {/* Premium Hero Header */}
      <div className="relative bg-[#1a2652] pt-32 pb-48 px-6 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              NeST Academy • Professional Development
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
              Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Engineering</span> Potential
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Access industry-grade technical certifications designed by NeST Digital's elite engineering teams.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        {/* Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl p-4 rounded-[32px] border border-white shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row gap-4 items-center mb-16"
        >
          <div className="relative flex-1 group w-full">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a2652] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title, instructor or technology..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 py-4 pl-14 pr-6 rounded-[20px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all text-[#1e293b] placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {levels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedCategory(level)}
                className={`px-6 py-4 rounded-[20px] text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedCategory === level 
                    ? 'bg-[#1a2652] text-white shadow-lg shadow-indigo-900/20' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Status Messages */}
        {error && (
          <div className="p-6 bg-red-50 text-red-600 font-bold flex items-center gap-3 rounded-[24px] border border-red-100 mb-12 shadow-sm">
            <AlertCircle size={24} /> {error}
          </div>
        )}

        {/* Course Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <Loader2 size={48} className="animate-spin text-[#1a2652] mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Curating Courses...</p>
            </motion.div>
          ) : filteredCourses.length > 0 ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 overflow-hidden group cursor-pointer flex flex-col"
                >
                  {/* Card Media Wrapper */}
                  <div className="relative h-56 bg-[#1a2652] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 z-10" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-110 transition-transform duration-700">
                      <BookOpen size={120} className="text-white" />
                    </div>
                    
                    {/* Badge */}
                    <div className="absolute top-6 left-6 z-20">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                        course.level === 'Advanced' ? 'bg-purple-500/20 border-purple-500/30 text-purple-200' :
                        course.level === 'Intermediate' ? 'bg-blue-500/20 border-blue-500/30 text-blue-200' :
                        'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                      }`}>
                        {course.level}
                      </span>
                    </div>

                    {/* Quick View Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                      <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        View Details <ArrowUpRight size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-emerald-500 font-black text-xs uppercase tracking-widest">
                      <Star size={14} fill="currentColor" />
                      <span>4.9 Mastery Rating</span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-[#1a2652] transition-colors">
                      {course.title}
                    </h3>
                    
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 line-clamp-2">
                      {course.description || "Master industry-standard engineering practices and lead with expertise in our specialized certification track."}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#1a2652] font-black text-sm">
                          {course.instructor.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Instructor</p>
                          <p className="text-xs font-black text-slate-700">{course.instructor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock size={14} />
                          <span className="text-xs font-black tracking-wide uppercase">{course.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enrollment Call */}
                  <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between group-hover:bg-[#1a2652]/5 transition-colors">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Enrollment Status</span>
                    <span className="text-xs font-black text-emerald-600">Free for Alumni</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[48px] border border-slate-200 p-24 text-center shadow-sm"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <BookOpen size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No courses found</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">Try adjusting your filters or search term to discover other engineering tracks.</p>
              <button 
                onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
                className="mt-8 px-8 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 font-black text-sm transition-all"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CourseListing;
