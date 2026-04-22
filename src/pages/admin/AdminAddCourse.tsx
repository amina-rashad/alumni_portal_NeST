import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, BookOpen, Clock, 
  Upload, Video, 
  FileText, 
  ShieldCheck,
  Plus, Link as LinkIcon, Trash2,
  BookMarked, Image as ImageIcon,
  ChevronDown, Star
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { coursesApi } from '../../services/api';
import StatusModal from '../../components/StatusModal';

// CUSTOM REUSABLE GLASS SELECT COMPONENT - UPDATED FOR NAVY
const GlassSelect: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  name: string;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nestNavy = '#1a2652';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }} ref={dropdownRef}>
      <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          padding: '14px 20px', 
          borderRadius: '16px', 
          border: '1px solid rgba(26, 38, 82, 0.1)', 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(16px)', 
          fontSize: '15px', 
          width: '100%', 
          color: '#1e293b', 
          fontWeight: 700, 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(26, 38, 82, 0.03)',
          transition: 'all 0.2s ease'
        }}
      >
        {value}
        <ChevronDown size={14} color="#94a3b8" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '105%', 
          left: 0, 
          right: 0, 
          zIndex: 100, 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(24px)', 
          borderRadius: '18px', 
          border: '1px solid rgba(26, 38, 82, 0.1)', 
          boxShadow: '0 10px 30px rgba(26, 38, 82, 0.1)',
          overflow: 'hidden',
          padding: '8px'
        }}>
          {options.map((opt) => (
            <div 
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{ 
                padding: '12px 16px', 
                fontSize: '14px', 
                fontWeight: 700, 
                color: value === opt ? nestNavy : '#475569',
                background: value === opt ? 'rgba(26, 38, 82, 0.05)' : 'transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminAddCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([{ id: 1, title: '', duration: '', videoUrl: '' }]);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!id;
  const nestNavy = '#1a2652';

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    certification: 'Standard Achievement',
    description: '',
    duration: '',
    level: 'Beginner Friendly',
    access_level: 'Open Access',
    instructor: '',
    start_date: 'On Demand',
    required_assessments: [1, 2, 3, 4, 5] // Default to all 5 rounds
  });

  useEffect(() => {
    if (id) {
      const fetchCourse = async () => {
        setLoading(true);
        try {
          const res = await coursesApi.getCourseById(id);
          const data = res.data as any;
          if (res.success && data && data.course) {
            const c = data.course;
            setFormData({
              title: c.title || '',
              category: c.category || 'Web Development',
              certification: c.certification || 'Standard Achievement',
              description: c.description || '',
              duration: c.duration || '',
              level: c.level || 'Beginner Friendly',
              access_level: c.access_level || 'Open Access',
              instructor: c.instructor || '',
              start_date: c.start_date || 'On Demand',
              required_assessments: c.required_assessments || [1, 2, 3, 4, 5]
            });
            if (c.modules && c.modules.length > 0) {
              setLessons(c.modules.map((m: any, idx: number) => ({
                id: idx + 1,
                title: m.title,
                duration: m.duration,
                videoUrl: m.video_url || ''
              })));
            }
          }
        } catch (err) {
          console.error('Fetch error:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setTrack = (val: string) => setFormData(prev => ({ ...prev, category: val }));
  const setCertification = (val: string) => setFormData(prev => ({ ...prev, certification: val }));
  const setDifficulty = (val: string) => setFormData(prev => ({ ...prev, level: val }));

  const addLesson = () => {
    setLessons([...lessons, { id: lessons.length + 1, title: '', duration: '', videoUrl: '' }]);
  };

  const removeLesson = (id: number) => {
    setLessons(lessons.filter(l => l.id !== id));
  };

  const handleLessonChange = (id: number, field: string, value: string) => {
    setLessons(lessons.map(lesson => lesson.id === id ? { ...lesson, [field]: value } : lesson));
  };

  // NAVY GLOSSY STYLE
  const glossyInputStyle = {
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid rgba(26, 38, 82, 0.1)',
    background: 'rgba(26, 38, 82, 0.05)', 
    backdropFilter: 'blur(16px)',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
    color: '#1e3a8a', 
    fontWeight: 700,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    colorScheme: 'light' as const,
    boxShadow: '0 4px 12px rgba(26, 38, 82, 0.02)'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* Premium Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', background: '#fff', padding: '24px 32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(26, 38, 82, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/admin/add-courses')}
            style={{ padding: '10px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <BookOpen size={14} color={nestNavy} /> Academic Portal <span>{'>'}</span> Curating Content
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{isEditMode ? 'Edit Strategic Course' : 'Enroll Strategic Course'}</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '12px 24px', borderRadius: '14px', background: '#f1f5f9', color: '#475569', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Save Draft
          </button>
          <button 
            onClick={async () => {
              console.log('Publishing Course:', { formData, lessons });
              try {
                const payload = {
                  ...formData,
                  modules: lessons.map(l => ({ title: l.title, duration: l.duration, video_url: l.videoUrl, content: "Lesson content goes here." }))
                };
                
                const response = isEditMode 
                  ? await coursesApi.updateCourse(id!, payload)
                  : await coursesApi.addCourse(payload);

                if (response.success) {
                  setModal({
                    isOpen: true,
                    type: 'success',
                    title: isEditMode ? 'Updated Successfully' : 'Published Successfully',
                    message: isEditMode ? 'The course details have been updated.' : 'The new course is now available to students.'
                  });
                }
              } catch (err) {
                console.error('Failed to save course:', err);
                setModal({
                  isOpen: true,
                  type: 'error',
                  title: 'Submission Failed',
                  message: 'An error occurred while saving the course. Please try again.'
                });
              }
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 28px', 
              borderRadius: '14px', 
              background: nestNavy, 
              border: 'none',
              color: '#fff', 
              fontWeight: 800, 
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(26, 38, 82, 0.2)'
            }}>
            Publish Course
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Section 1: Course Basics */}
          <section style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.08)', color: nestNavy }}><BookOpen size={18} /></div> Fundamental Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Advanced Full-Stack Architecture with NeST Standards" 
                  style={glossyInputStyle} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructor Name</label>
                <input 
                  type="text" 
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  placeholder="e.g. Dr. Robert NeST" 
                  style={glossyInputStyle} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <GlassSelect 
                  label="Learning Track"
                  name="category"
                  value={formData.category}
                  options={['Web Development', 'Cloud Infrastructure', 'Artificial Intelligence', 'Professional Growth']}
                  onChange={setTrack}
                />
                <GlassSelect 
                  label="Global Certification"
                  name="certification"
                  value={formData.certification}
                  options={['Standard Achievement', 'Executive Professional', 'Associate Master']}
                  onChange={setCertification}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Learning Objectives</label>
                <textarea 
                  rows={5} 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What will the students achieve upon completion?..." 
                  style={{ ...glossyInputStyle, resize: 'none', height: 'auto', fontFamily: 'inherit' }} 
                />
              </div>
            </div>
          </section>

          {/* Section 2: Video Curriculum */}
          <section style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(26, 38, 82, 0.08)', color: nestNavy }}><Video size={18} /></div> Video Curriculum
              </h3>
              <button 
                onClick={addLesson}
                style={{ fontSize: '13px', fontWeight: 800, color: nestNavy, background: 'rgba(26, 38, 82, 0.05)', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(26, 38, 82, 0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Add Lesson
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {lessons.map((lesson) => (
                <div key={lesson.id} style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(26, 38, 82, 0.1)', background: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: '16px', top: '16px' }}>
                    <button onClick={() => removeLesson(lesson.id)} style={{ padding: '8px', color: '#ef4444', background: '#ef444405', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Lesson Title</label>
                      <input 
                        type="text" 
                        placeholder="Lesson name..." 
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(lesson.id, 'title', e.target.value)}
                        style={{ ...glossyInputStyle, background: '#fff', padding: '12px 16px', borderRadius: '12px' }} 
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Duration</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 15:00" 
                        value={lesson.duration}
                        onChange={(e) => handleLessonChange(lesson.id, 'duration', e.target.value)}
                        style={{ ...glossyInputStyle, background: '#fff', padding: '12px 16px', borderRadius: '12px' }} 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Video Source URL</label>
                    <div style={{ position: 'relative' }}>
                      <LinkIcon size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="text" 
                        placeholder="https://..." 
                        value={lesson.videoUrl}
                        onChange={(e) => handleLessonChange(lesson.id, 'videoUrl', e.target.value)}
                        style={{ ...glossyInputStyle, background: '#fff', padding: '12px 12px 12px 36px', borderRadius: '12px' }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Estimates Card */}
          <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} color={nestNavy} /> Course Estimates
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Estimated Duration</label>
                <input 
                  type="text" 
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g. 12 Hours" 
                  style={glossyInputStyle} 
                />
              </div>
              
              <GlassSelect 
                label="Difficulty Rating"
                name="level"
                value={formData.level}
                options={['Beginner Friendly', 'Intermediate Professional', 'Advanced Strategic']}
                onChange={setDifficulty}
              />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Available From (Start Date)</label>
                <input 
                  type="text" 
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  placeholder="e.g. On Demand or May 15, 2024" 
                  style={glossyInputStyle} 
                />
              </div>
            </div>
          </section>

          {/* Banner Upload */}
          <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ImageIcon size={16} color={nestNavy} /> Course Branding
            </h3>
            
            <div style={{ position: 'relative', width: '100%', height: '160px', background: 'rgba(26, 38, 82, 0.05)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px dashed rgba(26, 38, 82, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
              <div style={{ textAlign: 'center' }}>
                <Upload size={24} color={nestNavy} />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', fontWeight: 700 }}>Upload Cover</div>
              </div>
              <input type="file" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            </div>
          </section>

          {/* Access Levels */}
          <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={16} color="#10b981" /> Corporate Access
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['Open Access', 'Strategic Tier', 'Executive Only'].map((opt, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px' }}>
                   <input 
                    type="radio" 
                    name="access_level" 
                    value={opt}
                    checked={formData.access_level === opt}
                    onChange={handleInputChange}
                    style={{ accentColor: nestNavy }}
                   />
                   <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{opt}</div>
                </label>
              ))}
            </div>
          </section>

          {/* Assessment Configuration */}
          <section style={{ background: '#fff', padding: '32px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star size={16} color="#f59e0b" /> Assessment Rounds
            </h3>
            
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px', fontWeight: 600 }}>Select which evaluation stages are required for this course certification.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 1, label: 'Stage 1: Automated Quiz' },
                { id: 2, label: 'Stage 2: Scenario Analysis' },
                { id: 3, label: 'Stage 3: Debugging Round' },
                { id: 4, label: 'Stage 4: Industry Project' },
                { id: 5, label: 'Stage 5: High-Level Review' }
              ].map((stage) => (
                <label key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', borderRadius: '12px', background: formData.required_assessments.includes(stage.id) ? 'rgba(245, 158, 11, 0.05)' : 'transparent', border: '1px solid', borderColor: formData.required_assessments.includes(stage.id) ? 'rgba(245, 158, 11, 0.2)' : 'transparent', transition: 'all 0.2s' }}>
                   <input 
                    type="checkbox" 
                    checked={formData.required_assessments.includes(stage.id)}
                    onChange={(e) => {
                      const rounds = [...formData.required_assessments];
                      if (e.target.checked) {
                        rounds.push(stage.id);
                      } else {
                        const index = rounds.indexOf(stage.id);
                        if (index > -1) rounds.splice(index, 1);
                      }
                      setFormData(prev => ({ ...prev, required_assessments: rounds.sort((a,b) => a-b) }));
                    }}
                    style={{ accentColor: '#f59e0b' }}
                   />
                   <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{stage.label}</div>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
      <StatusModal 
        isOpen={modal.isOpen}
        onClose={() => {
          setModal(prev => ({ ...prev, isOpen: false }));
          if (modal.type === 'success') navigate('/admin/add-courses');
        }}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
};

export default AdminAddCourse;
