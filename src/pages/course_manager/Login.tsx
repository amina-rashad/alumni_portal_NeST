import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import nestMainLogo from '../../assets/nest_logo.png';
import { authApi, setTokens, setUser } from '../../services/api';

const CM_Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });
      
      if (response.success && response.data) {
        setTokens(response.data.access_token, response.data.refresh_token);
        setUser(response.data.user);
        
        toast.success('Login Successful! Welcome, Course Manager.');
        
        // Check role and redirect
        if (response.data.user.role === 'course_manager' || response.data.user.role === 'admin') {
          navigate('/course-manager/dashboard');
        } else {
          toast.error('Unauthorized access. Only Course Managers can login here.');
        }
      } else {
        toast.error(response.message || 'Invalid credentials.');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-['Inter',sans-serif]">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
            <img src={nestMainLogo} alt="NeST Digital" className="h-10 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Course Manager</h1>
          <p className="text-slate-500 font-medium mt-2">Sign in to manage academic operations.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Manager Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c8102e] transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="manager@nest.com"
                  className="w-full bg-slate-50 border border-slate-100 py-3.5 pl-12 pr-4 rounded-xl text-sm font-bold text-[#1e293b] focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#c8102e] transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 py-3.5 pl-12 pr-4 rounded-xl text-sm font-bold text-[#1e293b] focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#c8102e] hover:bg-[#a00d25] text-white py-4 rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Help Info */}
          <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-3 justify-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <ShieldCheck size={16} className="text-[#c8102e]" />
            </div>
            <p className="text-[11px] font-bold text-slate-400 max-w-[200px] leading-relaxed">
              Protected by NeST Digital Security Infrastructure.
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-8 text-sm font-bold text-slate-400">
          Not a manager? <button onClick={() => navigate('/login')} className="text-[#c8102e] hover:underline underline-offset-4">Student Login</button>
        </p>
      </motion.div>
    </div>
  );
};

export default CM_Login;

