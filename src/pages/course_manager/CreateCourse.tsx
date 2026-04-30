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
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import type { Course } from '../../types/course-manager';
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
    
    // 1. Validation
    if (!validate()) {
      toast.error('Please complete all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Deploying academic program...');

    try {
      // 2. Extract Data
      const activeAssessments = assessments
        .filter(a => a.selected)
        .sort((a, b) => a.order - b.order)
        .map(a => ({
          type: a.type,
          isMandatory: a.isMandatory,
          order: a.order
        }));

      const payload = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        duration: formData.duration,
        numClasses: parseInt(formData.numClasses),
        totalHours: parseInt(formData.totalHours),
        curriculum: modules.map(m => ({
          title: m.title,
          lessons: m.lessons.map(l => ({
            title: l.title,
            videoUrl: l.videoUrl,
            pdfUrl: l.pdfUrl
          }))
        })),
        assessmentFlow: activeAssessments,
        status: 'Active'
      };

      // 3. Log Payload
      console.log("Deploying Course Payload:", payload);

      // 4. API Call
      const result = await courseService.createCourse(payload);

      if (result) {
        toast.success('Course program deployed and live!', { id: loadingToast });
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/course-manager/courses');
        }, 1500);
      } else {
        throw new Error('Backend failed to process course data.');
      }
    } catch (error) {
      console.error('Deployment Error:', error);
      toast.error('Failed to deploy program. Please verify connectivity.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cm-animate-fade-up" style={{ maxWidth: "1350px", margin: "0 auto", padding: "0 32px 48px 32px", display: "flex", flexDirection: "column", gap: "32px", fontFamily: "\"Inter\", sans-serif" }}>
      {/* Header */}
      <div className="cm-page-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="cm-btn cm-btn-secondary cm-btn-icon"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="cm-title">Create Program</h1>
            <p className="cm-subtitle">Define the foundation of your new academic program.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="cm-btn cm-btn-secondary">
            Cancel
          </button>
          <button type="submit" form="create-course-form" disabled={isSubmitting} className="cm-btn cm-btn-primary px-10">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Deploy Program'}
          </button>
        </div>
      </div>

      <form id="create-course-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Core Details Card */}
        <div className="cm-card p-10">
          <h3 className="cm-section-title mb-8">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 cm-input-group">
              <label className="cm-label">Course Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Master Class in Software Architecture"
                className={`cm-input text-slate-900 ${errors.title ? 'border-red-300 bg-red-50' : ''}`}
              />
              {errors.title && <p className="text-[#c8102e] text-[11px] font-bold flex items-center gap-1 pl-1"><AlertCircle size={12} /> {errors.title}</p>}
            </div>

            <div className="md:col-span-2 cm-input-group">
              <label className="cm-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe what this course covers..."
                className={`cm-input py-4 h-auto min-h-[120px] text-slate-900 ${errors.description ? 'border-red-300 bg-red-50' : ''}`}
              />
              {errors.description && <p className="text-[#c8102e] text-[11px] font-bold flex items-center gap-1 pl-1"><AlertCircle size={12} /> {errors.description}</p>}
            </div>

            <div className="cm-input-group">
              <label className="cm-label">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="cm-input cm-select text-slate-900"
              >
                <option value="Beginner">Beginner Friendly</option>
                <option value="Intermediate">Intermediate Professional</option>
                <option value="Advanced">Advanced Strategic</option>
              </select>
            </div>

            <div className="cm-input-group">
              <label className="cm-label">Duration</label>
              <div className="relative">
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g. 12 Weeks"
                  className={`cm-input text-slate-900 ${errors.duration ? 'border-red-300 bg-red-50' : ''}`}
                  style={{ paddingRight: '48px' }}
                />
                <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.duration && <p className="text-[#c8102e] text-[11px] font-bold flex items-center gap-1 pl-1"><AlertCircle size={12} /> {errors.duration}</p>}
            </div>

            <div className="cm-input-group">
              <label className="cm-label">Number of Classes</label>
              <input
                type="number"
                name="numClasses"
                value={formData.numClasses}
                onChange={handleInputChange}
                placeholder="24"
                className={`cm-input text-slate-900 ${errors.numClasses ? 'border-red-300 bg-red-50' : ''}`}
              />
              {errors.numClasses && <p className="text-[#c8102e] text-[11px] font-bold flex items-center gap-1 pl-1"><AlertCircle size={12} /> {errors.numClasses}</p>}
            </div>

            <div className="cm-input-group">
              <label className="cm-label">Total Hours</label>
              <input
                type="number"
                name="totalHours"
                value={formData.totalHours}
                onChange={handleInputChange}
                placeholder="48"
                className={`cm-input text-slate-900 ${errors.totalHours ? 'border-red-300 bg-red-50' : ''}`}
              />
              {errors.totalHours && <p className="text-[#c8102e] text-[11px] font-bold flex items-center gap-1 pl-1"><AlertCircle size={12} /> {errors.totalHours}</p>}
            </div>
          </div>
        </div>

        {/* Course Content Section (Modules & Lessons) */}
        <div className="cm-card p-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
            <div>
              <h3 className="cm-section-title mb-1">Course Curriculum</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Construct modules and instructional tracks</p>
            </div>
            <button
              type="button"
              onClick={addModule}
              className="cm-btn cm-btn-secondary h-12 px-6 text-xs gap-2 border-slate-100"
            >
              <Plus size={18} strokeWidth={3} /> Add New Module
            </button>
          </div>

          <div className="flex flex-col">
            {modules.map((mod, index) => (
              <div key={mod.id} className="p-8 bg-slate-50/40 border border-slate-100 rounded-[32px] mb-10 last:mb-0 relative group transition-all hover:bg-slate-50/60">
                {/* Module Delete Button */}
                <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    type="button"
                    onClick={() => removeModule(mod.id)}
                    className="cm-btn cm-btn-secondary cm-btn-icon h-10 w-10 text-red-400 hover:text-[#c8102e] border-slate-100 bg-white"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Module Title */}
                <div className="flex flex-col gap-2 mb-8 max-w-2xl">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Module {index + 1} Heading</label>
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                    placeholder="e.g. Core Architectural Principles"
                    className="w-full h-14 bg-white border border-slate-100 px-5 rounded-2xl font-bold shadow-sm focus:outline-none focus:border-red-500/20 text-slate-900"
                  />
                </div>

                {/* Lessons Container */}
                <div className="flex flex-col gap-4 pl-6 border-l-2 border-red-100/50">
                  {mod.lessons.map((lesson, lIdx) => (
                    <div key={lesson.id} className="p-6 bg-white border border-slate-100 rounded-2xl relative shadow-sm hover:shadow-md transition-all group/lesson">

                      {/* Lesson Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeLesson(mod.id, lesson.id)}
                        className="absolute right-4 top-4 p-2 text-slate-200 hover:text-[#c8102e] hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover/lesson:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mr-8">
                        {/* Lesson Title */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lesson {lIdx + 1} Title</label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(mod.id, lesson.id, 'title', e.target.value)}
                            placeholder="Identify lesson objectives..."
                            className="w-full h-12 bg-slate-50/30 border border-slate-100 px-4 rounded-xl font-bold text-slate-900"
                          />
                        </div>

                        {/* Video URL */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Video size={12} className="text-blue-500" /> Instructional Video URL
                          </label>
                          <div className="relative flex items-center">
                            <LinkIcon size={14} className="absolute left-4 text-slate-300" />
                            <input
                              type="url"
                              value={lesson.videoUrl}
                              onChange={(e) => updateLesson(mod.id, lesson.id, 'videoUrl', e.target.value)}
                              placeholder="https://vimeo.com/..."
                              className="w-full h-12 bg-slate-50/30 border border-slate-100 pl-11 pr-4 rounded-xl font-medium text-blue-600"
                            />
                          </div>
                        </div>

                        {/* PDF Notes URL */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <FileText size={12} className="text-emerald-500" /> Learning Resources / PDF
                          </label>
                          <div className="relative flex items-center">
                            <LinkIcon size={14} className="absolute left-4 text-slate-300" />
                            <input
                              type="url"
                              value={lesson.pdfUrl}
                              onChange={(e) => updateLesson(mod.id, lesson.id, 'pdfUrl', e.target.value)}
                              placeholder="https://drive.google.com/..."
                              className="w-full h-12 bg-slate-50/30 border border-slate-100 pl-11 pr-4 rounded-xl font-medium text-emerald-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Lesson Button */}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => addLesson(mod.id)}
                      className="cm-btn cm-btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2 bg-white hover:border-[#c8102e]/30"
                    >
                      <Plus size={16} strokeWidth={3} /> Append Lesson
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {modules.length === 0 && (
              <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/20">
                <Video size={48} strokeWidth={1} className="mx-auto text-slate-200 mb-6" />
                <p className="text-slate-400 font-bold mb-8">Your curriculum is currently empty.</p>
                <button
                  type="button"
                  onClick={addModule}
                  className="cm-btn cm-btn-primary px-10"
                >
                  <Plus size={20} strokeWidth={3} /> Initialize Primary Module
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Configuration Section - STRICT BOX-MODEL REBUILD */}
        <div className="cm-card p-10">
          <div className="mb-8">
            <h3 className="cm-section-title mb-1">Assessment Flow</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Define the certification and validation pipeline</p>
          </div>

          <div className="flex flex-col gap-4">
            {assessments.map((assessment, index) => (
              <div
                key={assessment.id}
                onClick={() => toggleAssessment(assessment.id)}
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer mb-1 last:mb-0 ${
                  assessment.selected 
                  ? 'border-orange-500 bg-orange-50 shadow-sm' 
                  : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                {/* Left Side: Checkbox + Info */}
                <div className="flex items-center gap-5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all ${
                    assessment.selected 
                    ? 'bg-orange-500 border-orange-500 text-white' 
                    : 'bg-white border-slate-200 text-transparent'
                  }`}>
                    <Check size={16} strokeWidth={4} />
                  </div>

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${
                    assessment.selected
                    ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                    : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    #{assessment.order}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className={`font-black text-base transition-colors ${assessment.selected ? 'text-slate-900' : 'text-slate-400'}`}>
                      {assessment.type} Validation
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest tracking-widest">Assessment Protocol</span>
                  </div>
                </div>

                {/* Right Side: Options (Only if selected) */}
                {assessment.selected && (
                  <div className="flex items-center gap-8" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-4 pr-8 border-r border-orange-200">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mandatory</span>
                      <button
                        type="button"
                        onClick={() => toggleMandatory(assessment.id)}
                        className={`relative w-12 h-7 rounded-full transition-all ${assessment.isMandatory ? 'bg-[#1a2652]' : 'bg-slate-200'
                          }`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${assessment.isMandatory ? 'translate-x-5' : 'translate-x-0'
                          } shadow-sm`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveAssessment(index, 'up')}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#1a2652] hover:bg-white rounded-xl disabled:opacity-20 transition-all border border-transparent hover:border-slate-100"
                      >
                        <ChevronUp size={24} />
                      </button>
                      <button
                        type="button"
                        disabled={index === assessments.length - 1}
                        onClick={() => moveAssessment(index, 'down')}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#1a2652] hover:bg-white rounded-xl disabled:opacity-20 transition-all border border-transparent hover:border-slate-100"
                      >
                        <ChevronDown size={24} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
};

export default CM_CreateCourse;

