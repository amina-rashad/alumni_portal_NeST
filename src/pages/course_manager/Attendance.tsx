import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  Download,
  ArrowRight,
  ChevronRight,
  User,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

interface AttendanceRecord {
  id: string;
  name: string;
  email: string;
  loginTime: string;
  duration: string; // in minutes
  status: 'Present' | 'Late' | 'Absent';
}

const Attendance: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('Full Stack Development');
  
  const courses = [
    'Full Stack Development',
    'Advanced React & Node',
    'Cloud Architecture',
    'Data Science Fundamentals',
    'DevOps Engineering'
  ];

  const attendanceData: AttendanceRecord[] = [
    { id: '1', name: 'Arjun Das', email: 'arjun.das@example.com', loginTime: '09:05 AM', duration: '120', status: 'Present' },
    { id: '2', name: 'Meera Nair', email: 'meera.nair@example.com', loginTime: '09:12 AM', duration: '115', status: 'Present' },
    { id: '3', name: 'Rahul Varma', email: 'rahul.v@example.com', loginTime: '09:45 AM', duration: '85', status: 'Late' },
    { id: '4', name: 'Sneha Kapur', email: 'sneha.k@example.com', loginTime: '09:02 AM', duration: '128', status: 'Present' },
    { id: '5', name: 'Kiran Joseph', email: 'kiran.j@example.com', loginTime: '10:15 AM', duration: '45', status: 'Late' },
    { id: '6', name: 'Ananya Iyer', email: 'ananya.i@example.com', loginTime: '-', duration: '0', status: 'Absent' },
  ];

  const pieData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [
      {
        data: [75, 15, 10],
        backgroundColor: [
          '#10b981', // Emerald
          '#f59e0b', // Amber
          '#ef4444', // Red
        ],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Average Minutes Spent',
        data: [110, 145, 120, 160, 135],
        backgroundColor: '#1a2652',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-['Inter',sans-serif] pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Attendance Tracking</h1>
          <p className="text-slate-500 font-medium mt-1">Course-wise student engagement and login duration analytics.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Course Selection & Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest">Select Program</h3>
            <div className="space-y-2">
              {courses.map(course => (
                <button
                  key={course}
                  onClick={() => setSelectedCourse(course)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                    selectedCourse === course 
                    ? 'bg-[#c8102e] text-white shadow-lg shadow-red-900/20' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={16} className={selectedCourse === course ? 'text-white' : 'text-slate-400'} />
                    <span className="text-sm font-bold truncate max-w-[180px]">{course}</span>
                  </div>
                  <ChevronRight size={16} className={selectedCourse === course ? 'text-white/60' : 'text-slate-300'} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center">
            <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest w-full">Attendance Split</h3>
            <div className="w-full h-64 flex items-center justify-center">
              <Pie 
                data={pieData} 
                options={{
                  plugins: {
                    legend: { position: 'bottom', labels: { font: { weight: 'bold', size: 10 } } }
                  },
                  maintainAspectRatio: false
                }} 
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-[#1e293b]">Weekly Engagement</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Average Minutes per Session</p>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-xl text-[#1a2652] font-black text-xs uppercase tracking-widest border border-slate-100">
                This Week
              </div>
            </div>
            <div className="w-full h-[320px]">
              <Bar 
                data={barData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
                    x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Attendance List */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[#1e293b]">Student Session Logs</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Today's Data for {selectedCourse}</p>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c8102e] transition-colors" />
              <input 
                type="text" 
                placeholder="Search student..." 
                className="bg-slate-50 border border-slate-100 py-2.5 pl-10 pr-4 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all font-bold text-[#1e293b] placeholder:text-slate-400"
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1a2652] transition-all shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Time</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration spent</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendanceData.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#1a2652] font-black text-xs border border-white shadow-sm overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${record.id}`} alt="" />
                      </div>
                      <div>
                        <div className="font-black text-[#1e293b] text-sm">{record.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{record.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-[#1e293b] font-bold text-sm">
                      <Clock size={14} className="text-[#c8102e]" />
                      {record.loginTime}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#1a2652]" 
                          style={{ width: `${Math.min(100, (parseInt(record.duration)/120)*100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-[#1e293b]">{record.duration} <span className="text-slate-400">mins</span></span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      record.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      record.status === 'Late' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-2 text-slate-300 hover:text-[#1a2652] hover:bg-slate-100 rounded-xl transition-all">
                      <ArrowRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Visualizing Today's Sync: <span className="text-[#1a2652]">6 Active Logs</span>
           </span>
           <button className="text-[10px] font-black text-[#c8102e] uppercase tracking-widest hover:underline">
            View Historical Archive
           </button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
