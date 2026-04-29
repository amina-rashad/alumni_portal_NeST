import React, { useState } from 'react';
import { 
  ArrowLeft, BookOpen, Clock, Upload, Video, 
  FileText, ShieldCheck, Plus, Trash2, ChevronDown, CheckCircle, GripVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- API Service (Sample Integration) ---
// In a real app, this would be in a separate src/services/courseService.ts file
const courseService = {
  createCourse: async (courseData: any) => {
    try {
      // Replace with actual backend endpoint
      const response = await axios.post('/api/admin/courses', courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

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

interface Assessment {
  id: string;
  type: string;
  required: boolean;
  mandatory: boolean;
  order: number;
}

const assessmentTypes = ['Quiz', 'Scenario', 'Debugging', 'Project', 'Video Demo'];

const AdminAddCourse: React.FC = () => {
  const navigate = useNavigate();
  const nestNavy = '#1a2652';

  // State: Course Basics
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    duration: '',
    numClasses: '',
    totalHours: ''
  });

  // State: Modules and Lessons
  const [modules, setModules] = useState<Module[]>([
    { id: 'mod-1', title: '', lessons: [{ id: 'les-1', title: '', videoUrl: '', pdfUrl: '' }] }
  ]);

  // State: Assessments
  const [assessments, setAssessments] = useState<Assessment[]>(
    assessmentTypes.map((type, index) => ({
      id: `ass-${index}`,
      type,
      required: false,
      mandatory: true,
      order: index + 1
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
  const toggleAssessmentRequired = (id: string) => {
    setAssessments(assessments.map(a => a.id === id ? { ...a, required: !a.required } : a));
  };

  const toggleAssessmentMandatory = (id: string) => {
    setAssessments(assessments.map(a => a.id === id ? { ...a, mandatory: !a.mandatory } : a));
  };

  const updateAssessmentOrder = (id: string, newOrder: number) => {
    setAssessments(assessments.map(a => a.id === id ? { ...a, order: newOrder } : a));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Construct the payload
    const payload = {
      ...formData,
      modules,
      assessments: assessments.filter(a => a.required)
    };

    try {
      console.log('Submitting Course Data:', payload);
      // await courseService.createCourse(payload);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        navigate('/admin/dashboard'); // Or back to courses list
      }, 2000);
    } catch (error) {
      console.error('Failed to create course', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">
              <BookOpen size={14} className="text-[#1a2652]" /> 
              Course Management <span className="mx-1">{'>'}</span> Create New Course
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 m-0">Curate New Course</h1>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
            Save Draft
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-extrabold text-white shadow-lg transition-all ${isSubmitting || submitSuccess ? 'bg-green-600' : 'bg-[#1a2652] hover:bg-[#2a3a70]'}`}
          >
            {isSubmitting ? 'Publishing...' : submitSuccess ? <><CheckCircle size={20}/> Published!</> : 'Publish Course'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Basics & Content */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Section 1: Course Basics */}
          <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><BookOpen size={18} /></div> 
              Fundamental Information
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Course Title</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleInputChange} required
                  placeholder="e.g. Advanced Full-Stack Architecture" 
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleInputChange} rows={4} required
                  placeholder="Comprehensive course covering..." 
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Level</label>
                  <select 
                    name="level" value={formData.level} onChange={handleInputChange}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration (Weeks/Months)</label>
                  <input 
                    type="text" name="duration" value={formData.duration} onChange={handleInputChange}
                    placeholder="e.g. 12 Weeks" 
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Number of Classes</label>
                  <input 
                    type="number" name="numClasses" value={formData.numClasses} onChange={handleInputChange}
                    placeholder="e.g. 24" 
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Hours</label>
                  <input 
                    type="number" name="totalHours" value={formData.totalHours} onChange={handleInputChange}
                    placeholder="e.g. 48" 
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Content Upload (Modules & Lessons) */}
          <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><Video size={18} /></div> 
                Content Management
              </h3>
              <button 
                type="button" onClick={addModule}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors text-sm"
              >
                <Plus size={16} /> Add Module
              </button>
            </div>

            <div className="space-y-6">
              {modules.map((mod, index) => (
                <div key={mod.id} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl relative group">
                  <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => removeModule(mod.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Module {index + 1} Title</label>
                    <input 
                      type="text" value={mod.title} onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                      placeholder="e.g. Introduction to React" 
                      className="w-full md:w-2/3 p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                  </div>

                  {/* Lessons */}
                  <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                    {mod.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="p-4 bg-white border border-slate-100 rounded-2xl relative shadow-sm">
                        <button 
                          type="button" onClick={() => removeLesson(mod.id, lesson.id)} 
                          className="absolute right-3 top-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lesson {lIdx + 1} Title</label>
                            <input 
                              type="text" value={lesson.title} onChange={(e) => updateLesson(mod.id, lesson.id, 'title', e.target.value)}
                              placeholder="Lesson name" className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold focus:outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Video Link (URL)</label>
                            <input 
                              type="url" value={lesson.videoUrl} onChange={(e) => updateLesson(mod.id, lesson.id, 'videoUrl', e.target.value)}
                              placeholder="https://..." className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none text-blue-600 font-medium" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes/PDF (URL)</label>
                            <input 
                              type="url" value={lesson.pdfUrl} onChange={(e) => updateLesson(mod.id, lesson.id, 'pdfUrl', e.target.value)}
                              placeholder="https://..." className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none text-emerald-600 font-medium" 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button" onClick={() => addLesson(mod.id)}
                      className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mt-2"
                    >
                      <Plus size={16} /> Add Lesson to Module
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Settings & Configuration */}
        <div className="flex flex-col gap-8">
          
          {/* Assessment Configuration */}
          <section className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><ShieldCheck size={16} /></div> 
              Dynamic Assessments
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium mb-2">Select and configure assessments for this course.</p>
              
              {assessments.map((assessment) => (
                <div key={assessment.id} className={`p-4 rounded-2xl border transition-all ${assessment.required ? 'border-purple-200 bg-purple-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={assessment.required} 
                        onChange={() => toggleAssessmentRequired(assessment.id)}
                        className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                      />
                      <span className={`font-bold ${assessment.required ? 'text-slate-900' : 'text-slate-500'}`}>{assessment.type}</span>
                    </label>
                    {assessment.required && <GripVertical size={16} className="text-slate-300 cursor-grab" />}
                  </div>
                  
                  {assessment.required && (
                    <div className="flex items-center gap-4 pl-8 mt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={assessment.mandatory} 
                          onChange={() => toggleAssessmentMandatory(assessment.id)}
                          className="rounded text-indigo-600"
                        />
                        Mandatory
                      </label>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span>Order:</span>
                        <input 
                          type="number" min="1" 
                          value={assessment.order} 
                          onChange={(e) => updateAssessmentOrder(assessment.id, parseInt(e.target.value) || 1)}
                          className="w-16 p-1 border border-slate-200 rounded text-center"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Banner Upload */}
          <section className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Upload size={16} /></div> 
              Course Branding
            </h3>
            
            <div className="w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all relative overflow-hidden group">
              <Upload size={28} className="text-slate-400 group-hover:text-emerald-500 transition-colors mb-2" />
              <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700">Upload Cover Image</span>
              <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
          </section>

        </div>
      </form>
    </div>
  );
};

export default AdminAddCourse;
