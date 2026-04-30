import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Clock,
  Layout,
  Layers,
  Video,
  Plus,
  Trash2,
  FileText,
  Link as LinkIcon,
  ClipboardList,
  Check,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { courseManagerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface AssessmentConfig {
  id: string;
  type: string;
  selected: boolean;
  order: number;
  isMandatory: boolean;
}


interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  pdfUrl: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

const CM_CreateCourse: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    duration: '',
    numClasses: '',
    totalHours: ''
  });

  // Modules and Lessons State
  const [modules, setModules] = useState<Module[]>([
    { id: 'mod-1', title: '', lessons: [{ id: 'les-1', title: '', videoUrl: '', pdfUrl: '' }] }
  ]);

  // Assessment Configuration State
  const [assessments, setAssessments] = useState<AssessmentConfig[]>([
    { id: 'quiz', type: 'Quiz', selected: false, order: 1, isMandatory: true },
    { id: 'scenario', type: 'Scenario', selected: false, order: 2, isMandatory: true },
    { id: 'debugging', type: 'Debugging', selected: false, order: 3, isMandatory: true },
    { id: 'project', type: 'Project', selected: false, order: 4, isMandatory: true },
    { id: 'video', type: 'Video Demo', selected: false, order: 5, isMandatory: true },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.numClasses || parseInt(formData.numClasses) <= 0) newErrors.numClasses = 'Enter valid number of classes';
    if (!formData.totalHours || parseInt(formData.totalHours) <= 0) newErrors.totalHours = 'Enter valid total hours';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Module & Lesson Handlers
  const addModule = () => {
    setModules([...modules, { id: `mod-${Date.now()}`, title: '', lessons: [] }]);
  };

  const removeModule = (modId: string) => {
    setModules(modules.filter(m => m.id !== modId));
  };

  const updateModuleTitle = (modId: string, title: string) => {
    setModules(modules.map(m => m.id === modId ? { ...m, title } : m));
  };

  const addLesson = (modId: string) => {
    setModules(modules.map(m => {
      if (m.id === modId) {
        return { ...m, lessons: [...m.lessons, { id: `les-${Date.now()}`, title: '', videoUrl: '', pdfUrl: '' }] };
      }
      return m;
    }));
  };

  const removeLesson = (modId: string, lesId: string) => {
    setModules(modules.map(m => {
      if (m.id === modId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lesId) };
      }
      return m;
    }));
  };

  const updateLesson = (modId: string, lesId: string, field: keyof Lesson, value: string) => {
    setModules(modules.map(m => {
      if (m.id === modId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lesId ? { ...l, [field]: value } : l)
        };
      }
      return m;
    }));
  };

  // Assessment Handlers
  const toggleAssessment = (id: string) => {
    setAssessments(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  };

  const toggleMandatory = (id: string) => {
    setAssessments(prev => prev.map(a => a.id === id ? { ...a, isMandatory: !a.isMandatory } : a));
  };

  const moveAssessment = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === assessments.length - 1)) return;
    
    const newAssessments = [...assessments];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap order numbers
    const tempOrder = newAssessments[index].order;
    newAssessments[index].order = newAssessments[targetIndex].order;
    newAssessments[targetIndex].order = tempOrder;
    
    // Swap positions in array
    [newAssessments[index], newAssessments[targetIndex]] = [newAssessments[targetIndex], newAssessments[index]];
    
    setAssessments(newAssessments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Creating your course...');
    
    try {
      const activeAssessments = assessments.filter(a => a.selected);
      const payload = { ...formData, modules, assessments: activeAssessments };
      
      await courseManagerAPI.createCourse(payload);
      
      toast.success('Course created successfully!', { id: loadingToast });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/course-manager/courses');
      }, 2000);
    } catch (error) {
      console.error('Failed to create course:', error);
      toast.error('Failed to create course. Please try again.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex items-center gap-6">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="p-4 rounded-2xl bg-white border border-slate-100 text-[#1a2652] hover:bg-red-50 hover:text-[#c8102e] transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Create New Course</h1>
          <p className="text-slate-500 font-medium mt-1">Define the foundation of your new academic program.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Core Details Card */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
            <div className="p-3.5 rounded-2xl bg-red-50 text-[#c8102e]">
              <BookOpen size={24} />
            </div>
            <h3 className="text-2xl font-black text-[#1e293b]">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange}
                placeholder="e.g. Master Class in Software Architecture"
                className={`w-full p-4.5 rounded-2xl border ${errors.title ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-slate-50'} text-[#1e293b] font-bold focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all placeholder:text-slate-400`}
              />
              {errors.title && <p className="text-[#c8102e] text-[11px] font-bold flex items-center gap-1 pl-1"><AlertCircle size={12}/> {errors.title}</p>}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe what this course covers..."
                className={`w-full p-4.5 rounded-2xl border ${errors.description ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-slate-50'} text-[#1e293b] font-medium focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all resize-none placeholder:text-slate-400`}
              />
              {errors.description && <p className="text-[#c8102e] text-[11px] font-bold flex items-center gap-1 pl-1"><AlertCircle size={12}/> {errors.description}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Level</label>
              <div className="relative">
                <select 
                  name="level" 
                  value={formData.level} 
                  onChange={handleInputChange}
                  className="w-full p-4.5 rounded-2xl border border-slate-100 bg-slate-50 text-[#1e293b] font-bold focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 appearance-none cursor-pointer"
                >
                  <option value="Beginner">Beginner Friendly</option>
                  <option value="Intermediate">Intermediate Professional</option>
                  <option value="Advanced">Advanced Strategic</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Layers size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="duration" 
                  value={formData.duration} 
                  onChange={handleInputChange}
                  placeholder="e.g. 12 Weeks"
                  className={`w-full p-4.5 pr-12 rounded-2xl border ${errors.duration ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-slate-50'} text-[#1e293b] font-bold focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all placeholder:text-slate-400`}
                />
                <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.duration && <p className="text-[#c8102e] text-[11px] font-bold flex items-center gap-1 pl-1"><AlertCircle size={12}/> {errors.duration}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Number of Classes</label>
              <input 
                type="number" 
                name="numClasses" 
                value={formData.numClasses} 
                onChange={handleInputChange}
                placeholder="24"
                className={`w-full p-4.5 rounded-2xl border ${errors.numClasses ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-slate-50'} text-[#1e293b] font-bold focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all placeholder:text-slate-400`}
              />
              {errors.numClasses && <p className="text-[#c8102e] text-[11px] font-bold flex items-center gap-1 pl-1"><AlertCircle size={12}/> {errors.numClasses}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Hours</label>
              <input 
                type="number" 
                name="totalHours" 
                value={formData.totalHours} 
                onChange={handleInputChange}
                placeholder="48"
                className={`w-full p-4.5 rounded-2xl border ${errors.totalHours ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-slate-50'} text-[#1e293b] font-bold focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all placeholder:text-slate-400`}
              />
              {errors.totalHours && <p className="text-[#c8102e] text-[11px] font-bold flex items-center gap-1 pl-1"><AlertCircle size={12}/> {errors.totalHours}</p>}
            </div>
          </div>
        </div>

        {/* Course Content Section (Modules & Lessons) */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 text-[#1a2652]">
                <Video size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1e293b]">Course Curriculum</h3>
                <p className="text-slate-500 font-medium text-sm mt-0.5">Structure your course with modules and video lessons.</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={addModule}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-[#c8102e] font-black rounded-xl hover:bg-[#c8102e] hover:text-white transition-all text-sm shadow-sm"
            >
              <Plus size={18} /> Add Module
            </button>
          </div>

          <div className="space-y-8">
            {modules.map((mod, index) => (
              <div key={mod.id} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[32px] relative group">
                {/* Module Delete Button */}
                <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button" 
                    onClick={() => removeModule(mod.id)} 
                    className="p-2.5 text-red-400 hover:text-[#c8102e] hover:bg-red-50 rounded-xl transition-colors"
                    title="Remove Module"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                {/* Module Title */}
                <div className="mb-8 max-w-2xl">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Module {index + 1} Title</label>
                  <input 
                    type="text" 
                    value={mod.title} 
                    onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                    placeholder="e.g. Introduction to React Fundamentals" 
                    className="w-full p-4.5 rounded-2xl border border-slate-100 bg-white text-[#1e293b] font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all shadow-sm placeholder:text-slate-400" 
                  />
                </div>

                {/* Lessons Container */}
                <div className="space-y-5 pl-4 md:pl-8 border-l-2 border-red-100">
                  {mod.lessons.map((lesson, lIdx) => (
                    <div key={lesson.id} className="p-6 bg-white border border-slate-50 rounded-2xl relative shadow-sm hover:shadow-xl transition-all group/lesson">
                      
                      {/* Lesson Delete Button */}
                      <button 
                        type="button" 
                        onClick={() => removeLesson(mod.id, lesson.id)} 
                        className="absolute right-4 top-4 p-2 text-slate-300 hover:text-[#c8102e] hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover/lesson:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mr-8">
                        {/* Lesson Title */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Lesson {lIdx + 1} Title</label>
                          <input 
                            type="text" 
                            value={lesson.title} 
                            onChange={(e) => updateLesson(mod.id, lesson.id, 'title', e.target.value)}
                            placeholder="Lesson name" 
                            className="w-full p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 text-sm font-bold text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-red-500/20" 
                          />
                        </div>
                        
                        {/* Video URL */}
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
                            <Video size={10} /> Video URL
                          </label>
                          <div className="relative">
                            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="url" 
                              value={lesson.videoUrl} 
                              onChange={(e) => updateLesson(mod.id, lesson.id, 'videoUrl', e.target.value)}
                              placeholder="https://..." 
                              className="w-full p-3 pl-9 rounded-xl border border-slate-50 bg-slate-50/50 text-sm font-medium text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                            />
                          </div>
                        </div>

                        {/* PDF Notes URL */}
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
                            <FileText size={10} /> Notes / PDF Link
                          </label>
                          <div className="relative">
                            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="url" 
                              value={lesson.pdfUrl} 
                              onChange={(e) => updateLesson(mod.id, lesson.id, 'pdfUrl', e.target.value)}
                              placeholder="https://..." 
                              className="w-full p-3 pl-9 rounded-xl border border-slate-50 bg-slate-50/50 text-sm font-medium text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Lesson Button */}
                  <button 
                    type="button" 
                    onClick={() => addLesson(mod.id)}
                    className="flex items-center gap-2 px-5 py-3 mt-4 text-xs font-black text-[#1a2652] bg-slate-100 hover:bg-[#1a2652] hover:text-white rounded-xl transition-all border border-slate-200"
                  >
                    <Plus size={16} /> Add Lesson to Module
                  </button>
                </div>
              </div>
            ))}
            
            {modules.length === 0 && (
              <div className="p-12 text-center border-3 border-dashed border-slate-100 rounded-[32px] bg-slate-50/30">
                <Video size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold mb-6">No modules added yet.</p>
                <button 
                  type="button" 
                  onClick={addModule}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#1a2652] text-white font-black rounded-2xl hover:bg-[#c8102e] transition-all shadow-xl shadow-indigo-900/20"
                >
                  <Plus size={20} /> Add Your First Module
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Configuration Section */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
            <div className="p-3.5 rounded-2xl bg-orange-50 text-orange-600">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#1e293b]">Assessment Flow</h3>
              <p className="text-slate-500 font-medium text-sm mt-0.5">Select and order the evaluations required to complete this course.</p>
            </div>
          </div>

          <div className="space-y-4">
            {assessments.map((assessment, index) => (
              <motion.div 
                key={assessment.id} 
                initial={false}
                animate={{ scale: assessment.selected ? 1.01 : 1 }}
                className={`flex items-center justify-between p-6 rounded-[24px] border transition-all ${
                  assessment.selected ? 'border-orange-200 bg-orange-50/30 shadow-lg shadow-orange-100' : 'border-slate-50 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-5">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleAssessment(assessment.id)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all ${
                      assessment.selected ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-200 text-transparent'
                    }`}
                  >
                    <Check size={16} strokeWidth={4} />
                  </button>
                  
                  {/* Order Badge */}
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shadow-sm">
                    #{assessment.order}
                  </div>
                  
                  {/* Title */}
                  <span className={`font-black text-base ${assessment.selected ? 'text-[#1e293b]' : 'text-slate-400'}`}>
                    {assessment.type}
                  </span>
                </div>

                {/* Controls (Only visible if selected) */}
                {assessment.selected && (
                  <div className="flex items-center gap-8">
                    {/* Mandatory/Optional Toggle */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mandatory</span>
                      <button
                        type="button"
                        onClick={() => toggleMandatory(assessment.id)}
                        className={`relative w-12 h-7 rounded-full transition-all ${
                          assessment.isMandatory ? 'bg-[#1a2652]' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          assessment.isMandatory ? 'translate-x-5' : 'translate-x-0'
                        } shadow-sm`} />
                      </button>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1.5">
                      <button 
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveAssessment(index, 'up')}
                        className="text-slate-300 hover:text-[#1a2652] disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
                      >
                        <ChevronUp size={20} />
                      </button>
                      <button 
                        type="button"
                        disabled={index === assessments.length - 1}
                        onClick={() => moveAssessment(index, 'down')}
                        className="text-slate-300 hover:text-[#1a2652] disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
                      >
                        <ChevronDown size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 items-center justify-end pt-8">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="px-10 py-4.5 rounded-2xl bg-white border border-slate-100 text-slate-500 font-black hover:bg-red-50 hover:text-[#c8102e] transition-all"
          >
            Cancel
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={isSubmitting || isSuccess}
            className={`flex items-center gap-3 px-16 py-4.5 rounded-2xl font-black text-white shadow-2xl shadow-indigo-900/20 transition-all ${
              isSuccess ? 'bg-emerald-600' : 'bg-[#1a2652] hover:bg-[#c8102e]'
            }`}
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : isSuccess ? (
              <><CheckCircle size={22} /> Course Created Successfully</>
            ) : (
              'Deploy Course Program'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default CM_CreateCourse;

