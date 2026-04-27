import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Award,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Activity,
  Star,
  Clock
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, trend }: { label: string, value: string, icon: any, color: string, trend: string }) => (
  <motion.div 
    whileHover={{ translateY: -5 }}
    className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg text-emerald-600 text-[10px] font-bold uppercase tracking-tight">
        <TrendingUp size={10} />
        {trend}
      </div>
    </div>
    <div>
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-[#1e293b]">{value}</span>
        <ArrowUpRight size={16} className="text-slate-300" />
      </div>
    </div>
  </motion.div>
);

const CM_Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = [
    { label: 'Total Courses', value: '24', icon: BookOpen, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Total Enrollments', value: '1,284', icon: Users, color: 'bg-[#c8102e]', trend: '+18%' },
    { label: 'Pending Reviews', value: '42', icon: ClipboardCheck, color: 'bg-orange-500', trend: '+5%' },
    { label: 'Certificates Issued', value: '856', icon: Award, color: 'bg-emerald-500', trend: '+24%' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-['Inter',sans-serif]">
      {/* Premium Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-10 rounded-[40px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-red-50 text-[#c8102e] text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100">
              Academic Portal
            </span>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
              <Calendar size={14} />
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight leading-tight">
            Welcome back, <span className="text-[#c8102e]">Academic Lead.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 max-w-xl text-lg">
            Portal performance is up <span className="text-emerald-600 font-bold">14.2%</span> this month. You have 8 new course proposals to review.
          </p>
          
          <div className="flex gap-4 mt-8">
            <button className="px-6 py-3 bg-[#1a2652] text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/20 hover:bg-[#2a3a70] transition-all active:scale-95">
              Course Analytics
            </button>
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95">
              Review Requests
            </button>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-60 h-60 bg-blue-500/5 rounded-full blur-[80px]" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute right-10 top-1/2 -translate-y-1/2 opacity-[0.03]"
          >
            <Award size={300} />
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm h-full min-h-[450px] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-black text-[#1e293b]">Student Engagement</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Daily Active Users</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#1a2652] flex items-center justify-center text-[10px] font-bold text-white">
                    +12
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 text-slate-200 border border-slate-100">
                <Activity size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Interactive Analytics Data</h3>
              <p className="text-slate-400 max-w-xs font-medium text-sm">Real-time enrollment and engagement metrics will be visualized here.</p>
            </div>

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a2652 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-full">
            <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest">Quick Operations</h3>
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/course-manager/courses/create')}
                className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl group hover:bg-[#c8102e] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-white/20 transition-colors">
                    <BookOpen size={18} className="text-[#c8102e] group-hover:text-white" />
                  </div>
                  <span className="text-sm font-black text-[#1e293b] group-hover:text-white">Design New Course</span>
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-white transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>

              <button 
                onClick={() => navigate('/course-manager/attendance')}
                className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl group hover:bg-[#1a2652] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-white/20 transition-colors">
                    <Clock size={18} className="text-[#1a2652] group-hover:text-white" />
                  </div>
                  <span className="text-sm font-black text-[#1e293b] group-hover:text-white">Attendance Reports</span>
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-white transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>

              <button 
                onClick={() => navigate('/course-manager/students')}
                className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl group hover:bg-slate-800 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-white/20 transition-colors">
                    <Users size={18} className="text-slate-600 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-black text-[#1e293b] group-hover:text-white">Student Directory</span>
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-white transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</span>
               </div>
               <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  All synchronization pipelines are operational. Last backup: <span className="text-[#1a2652]">14 mins ago</span>.
               </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CM_Dashboard;

