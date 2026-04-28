import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, Star, 
  Award, PlayCircle, CheckCircle2, 
  ChevronRight, Calendar, User, Globe,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';
import { coursesApi } from '../services/api';
import toast from 'react-hot-toast';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await coursesApi.getCourseById(id);
        if (res.success && res.data && res.data.course) {
          setCourse(res.data.course);
        }
      } catch (err) {
        console.error('Failed to fetch course details:', err);
        toast.error('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Retrieving Curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <BookOpen size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Course not found</h2>
        <Link to="/courses" className="text-indigo-600 font-bold hover:underline">Back to catalog</Link>
      </div>
    );
  }

  const curriculum = [
    { title: 'Architectural Foundations & Theory', duration: '45m', type: 'Theory' },
    { title: 'Industry Best Practices at NeST', duration: '1h 20m', type: 'Standards' },
    { title: 'Real-world Implementation Lab', duration: '2h 15m', type: 'Practical' },
    { title: 'Scalability & Performance Tuning', duration: '3h 10m', type: 'Advanced' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Outfit',sans-serif] pb-20">
      {/* Luxury Hero Section */}
      <div className="relative bg-[#1a2652] pt-32 pb-64 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-black text-xs uppercase tracking-widest mb-12"
          >
            <ArrowLeft size={16} /> Back to Catalog
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  {course.level} Track
                </span>
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Star size={12} fill="#fbbf24" className="text-[#fbbf24]" /> 4.9 Mastery Rating
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
                {course.title}
              </h1>

              <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-2xl">
                {course.description || "Master industry-standard engineering practices and lead with expertise through our specialized professional certification track."}
              </p>

              <div className="flex flex-wrap gap-8">
                {[
                  { label: 'Duration', value: course.duration || '36 Hours', icon: Clock, color: 'text-indigo-400' },
                  { label: 'Platform', value: 'NeST Learning', icon: Globe, color: 'text-emerald-400' },
                  { label: 'Enrolled', value: '2.4k Alumni', icon: User, color: 'text-blue-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`p-3 bg-white/5 rounded-2xl ${stat.color} border border-white/10`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-sm font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Video/Image Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="relative aspect-video rounded-[36px] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop" 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 bg-[#1a2652]/40 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#1a2652] shadow-2xl"
                    >
                      <PlayCircle size={40} />
                    </motion.button>
                  </div>
                </div>
                <div className="absolute top-8 right-8 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Preview Video
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-xl shadow-slate-200/40">
              <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                <BookOpen size={24} className="text-indigo-500" /> Course Overview
              </h3>
              <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
                This comprehensive curriculum is designed for alumni looking to master the intricacies of {course.title}. 
                Our industry-expert instructors provide a blend of theoretical foundation and hands-on practical exercises using the latest NeST Digital engineering frameworks.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Learning Outcomes</h4>
                  <ul className="space-y-4">
                    {[
                      'Deep dive architectural foundations',
                      'Advanced implementation techniques',
                      'NeST Digital engineering standards',
                      'Hands-on portfolio-ready projects'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 font-bold text-sm">
                        <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={24} className="text-indigo-500" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Certification</h4>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Earn an industry-recognized certification verified on the NeST Blockchain network upon successful completion of all assessments.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 ml-4">
                <Zap size={24} className="text-emerald-500" /> Curriculum Schedule
              </h3>
              <div className="space-y-4">
                {curriculum.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ x: 10 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-[#1a2652] group-hover:text-white transition-colors">
                        {idx + 1}
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 group-hover:text-[#1a2652] transition-colors">{item.title}</h5>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.type}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.duration}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-200 group-hover:text-[#1a2652] transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <div className="bg-[#1a2652] p-10 rounded-[48px] text-white shadow-2xl shadow-indigo-900/30 sticky top-32">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 font-black text-xl border border-white/10">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Expert Instructor</p>
                  <h4 className="text-lg font-black">{course.instructor}</h4>
                </div>
              </div>

              <div className="space-y-8 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Access Tier</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-400 uppercase tracking-tight">Free</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">For Alumni</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { icon: Award, text: 'Verified Certificate' },
                    { icon: ShieldCheck, text: 'LIFETIME ACCESS' },
                    { icon: User, text: '1-on-1 Mentorship' },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                      <benefit.icon size={18} className="text-emerald-500" /> {benefit.text}
                    </div>
                  ))}
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toast.success('Enrollment initiated! Unlocking your dashboard...')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#1a2652] py-5 rounded-[24px] font-black text-lg shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                Enroll Now <ArrowUpRight size={22} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
