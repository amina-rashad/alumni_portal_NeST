import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  User,
  BookOpen,
  Award,
  ChevronDown,
  Mail,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { courseManagerAPI } from '../../services/api';

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  status: 'Learning' | 'Assessment' | 'Completed';
  lastActive: string;
}

const CM_Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);
        const response = await courseManagerAPI.fetchStudents();
        setStudents(response.data);
      } catch (err) {
        setError('Failed to load students. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Filtering Logic
  const filteredStudents = students.filter(student => {
    const matchesCourse = courseFilter === 'All Courses' || student.course === courseFilter;
    const matchesStatus = statusFilter === 'All Statuses' || student.status === statusFilter;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Learning': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Assessment': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const uniqueCourses = ['All Courses', ...Array.from(new Set(students.map(s => s.course)))];
  const uniqueStatuses = ['All Statuses', 'Learning', 'Assessment', 'Completed'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Enrollments</h1>
          <p className="text-slate-500 font-medium mt-1">Track student progress and manage enrollments across all courses.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <User size={18} />
          </div>
          <div className="pr-4">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Active</div>
            <div className="text-sm font-black text-slate-900 leading-none">1,284 Students</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a2652] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by student name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 py-3 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all font-bold"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Course Filter */}
          <div className="relative">
            <select 
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full sm:w-48 px-5 py-3 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-colors appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
            >
              {uniqueCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 px-5 py-3 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-colors appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
            >
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 font-bold flex items-center gap-2 m-4 rounded-xl border border-red-100">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="overflow-x-auto relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <Loader2 size={32} className="animate-spin text-indigo-500 mb-2" />
              <span className="text-slate-500 font-bold text-sm">Loading student records...</span>
            </div>
          ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Student Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Course Enrolled</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/5">Progress</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/6">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Student Info */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1a2652] flex items-center justify-center text-white font-black text-xs shrink-0">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 truncate">{student.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                            <Mail size={10} /> {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Course */}
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-2">
                        <BookOpen size={14} className="text-slate-400 mt-1 shrink-0" />
                        <span className="text-sm font-bold text-slate-700 line-clamp-2">{student.course}</span>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              student.progress === 100 ? 'bg-emerald-500' : 'bg-[#1a2652]'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-700 w-8">{student.progress}%</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 ml-1">
                          Active: {student.lastActive}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Profile">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Email Student">
                          <Mail size={18} />
                        </button>
                      </div>
                      <div className="group-hover:hidden">
                        <MoreVertical size={18} className="text-slate-300 ml-auto" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-500 font-medium">
                    No students found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
          <span className="text-xs text-slate-500 font-bold">
            Showing {filteredStudents.length} of {students.length} students
          </span>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CM_Students;
