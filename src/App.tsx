import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getUser, studentAPI, setTokens } from './services/api';

// Splash & Styles
import './App.css';
import nestMainLogo from './assets/nest_logo.png';
import heroBg from './assets/hero-bg.png';

// Main / Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PlatformCapabilities from './pages/PlatformCapabilities';
import UserTypeOverview from './pages/UserTypeOverview';

// Layout
import MainLayout from './pages/MainLayout';

// Auth Pages
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import ActivityFeed from './pages/ActivityFeed';
import Notifications from './pages/Notifications';

// Profile Pages
import ViewProfile from './pages/ViewProfile';
import EditProfile from './pages/EditProfile';
import PublicProfile from './pages/PublicProfile';
import ResumeUpload from './pages/ResumeUpload';
import ProfileCompletion from './pages/ProfileCompletion';

// Networking Pages
import UserDirectory from './pages/UserDirectory';
import SuggestedConnections from './pages/SuggestedConnections';
import SearchResults from './pages/SearchResults';
import ConnectionRequests from './pages/ConnectionRequests';
import FollowersFollowing from './pages/FollowersFollowing';

// Job Pages
import JobListings from './pages/JobListings';
import JobDetails from './pages/JobDetails';
import ApplyJob from './pages/ApplyJob';
import MyApplications from './pages/MyApplications';
import SavedJobs from './pages/SavedJobs';
import RecommendedJobs from './pages/RecommendedJobs';

// Course Pages
import CourseListing from './pages/CourseListing';
import CourseDetails from './pages/CourseDetails';
import CoursePlayer from './pages/CoursePlayer';
import MyCourses from './pages/MyCourses';
import CourseCompletion from './pages/CourseCompletion';

// Assessment Pages
import Quiz from './pages/Quiz';
import QuizInstructions from './pages/QuizInstructions';
import QuizResult from './pages/QuizResult';
import PerformanceAnalysis from './pages/PerformanceAnalysis';
import AssessmentCenter from './pages/AssessmentCenter';
import Badges from './pages/Badges';


// Events Pages
import EventsListing from './pages/EventsListing';
import EventDetails from './pages/EventDetails';
import EventRegistration from './pages/EventRegistration';
import MyEvents from './pages/MyEvents';

// Social Pages
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';

// Additional Notification Settings
import EmailPreferences from './pages/EmailPreferences';

// Settings Pages
import AccountSettings from './pages/AccountSettings';
import PrivacySettings from './pages/PrivacySettings';
import NotificationSettings from './pages/NotificationSettings';
import ChangePassword from './pages/ChangePassword';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEditUser from './pages/admin/AdminEditUser';
import AdminAddUser from './pages/admin/AdminAddUser';
import AdminInterns from './pages/admin/AdminInterns';
import AdminAddIntern from './pages/admin/AdminAddIntern';
import AdminIVStudents from './pages/admin/AdminIVStudents';
import AdminAddVisit from './pages/admin/AdminAddVisit';
import Applications from './pages/admin/Applications';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import AdminCourses from './pages/admin/AdminCourses';
import AdminAddCourse from './pages/admin/AdminAddCourse';
import AdminCertification from './pages/admin/AdminCertification';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import AdminRoleManager from './pages/admin/AdminRoleManager';
import AdminAddManager from './pages/admin/AdminAddManager';

// Event Manager Pages
import EventManagerLayout from './pages/event_manager/EventManagerLayout';
import EventManagerDashboard from './pages/event_manager/EventManagerDashboard';
import EventManagerEvents from './pages/event_manager/EventManagerEvents';
import EventManagerAttendees from './pages/event_manager/EventManagerAttendees';
import EventManagerPosts from './pages/event_manager/EventManagerPosts';

import EventManagerRegistrations from './pages/event_manager/EventManagerRegistrations';
import EventManagerReports from './pages/event_manager/EventManagerReports';
import EventManagerSettings from './pages/event_manager/EventManagerSettings';

// Recruiter Pages
import RecruiterLayout from './pages/recruiter/RecruiterLayout';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterPostJob from './pages/recruiter/RecruiterPostJob';
import RecruiterApplications from './pages/recruiter/RecruiterApplications';
import RecruiterReports from './pages/recruiter/RecruiterReports';
import RecruiterSettings from './pages/recruiter/RecruiterSettings';
import RecruiterPost from './pages/recruiter/RecruiterPost';
import RecruiterPosts from './pages/recruiter/RecruiterPosts';

import RecruiterHelp from './pages/recruiter/RecruiterHelp';
import RecruiterMail from './pages/recruiter/RecruiterMail';

// Course Manager Pages
import CourseManagerLayout from './pages/course_manager/CourseManagerLayout';
import CourseManagerDashboard from './pages/course_manager/Dashboard';
import CourseManagerCourses from './pages/course_manager/Courses';
import CourseManagerCreateCourse from './pages/course_manager/CreateCourse';
import CourseManagerStudents from './pages/course_manager/Students';
import CourseManagerAssessments from './pages/course_manager/Assessments';
import CourseManagerCertificates from './pages/course_manager/Certificates';
import CourseManagerReminderCenter from './pages/course_manager/ReminderCenter';
import CourseManagerRecommendations from './pages/course_manager/RecommendationSetup';
import CourseManagerPerformance from './pages/course_manager/PAModule';
import CourseManagerInsights from './pages/course_manager/CompletionInsights';

/* -- Luxury Splash Screen with Mask Reveal -- */
import heroBgSplash from './assets/hero-bg.jpg';
const SplashScreen: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 1800;
    const connectionDistance = 80;
    const mouse = { x: -100, y: -100 };

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number; alpha: number;
      originX: number; originY: number; targetX: number; targetY: number; 
      isAssembling: boolean = false;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.originX = this.x;
        this.originY = this.y;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.targetX = w / 2 + (Math.random() - 0.5) * 400;
        this.targetY = h / 2 + (Math.random() - 0.5) * 150;
      }

      update(w: number, h: number, time: number) {
        if (time > 1200) this.isAssembling = true;

        if (this.isAssembling) {
          const dx = this.targetX - this.x;
          const dy = this.targetY - this.y;
          this.x += dx * 0.05;
          this.y += dy * 0.05;
          this.alpha = Math.max(this.alpha - 0.01, 0.1);
        } else {
          this.x += this.vx;
          this.y += this.vy;
          if (this.x < 0 || this.x > w) this.vx *= -1;
          if (this.y < 0 || this.y > h) this.vy *= -1;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(200, 210, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(w, h));
      }
    };

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Depth Layer: Subtle Glow Background
      const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
      gradient.addColorStop(0, '#050a1a');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(100, 150, 255, 0.05)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update(canvas.width, canvas.height, elapsed);
        p1.draw(ctx);

        if (elapsed < 1500) {
          for (let j = i + 1; j < particles.length; j += 40) {
            const p2 = particles[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < connectionDistance) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] } }}
      style={{ background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Cinematic Particle Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, filter: 'blur(0.5px)' }} />

      {/* Floating Depth Layers (Blurred Glows) */}
      <motion.div 
        style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200, 16, 46, 0.1) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 1 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Logo Assembly Container */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(30px)',
            padding: '28px 48px',
            borderRadius: '28px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img src={nestMainLogo} alt="NeST Digital" style={{ height: '75px', objectFit: 'contain' }} />
        </motion.div>

        {/* Cinematic Text Reveal */}
        <div style={{ marginTop: '40px', overflow: 'hidden' }}>
          <motion.p
            style={{
              margin: 0,
              letterSpacing: '14px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 900,
              textTransform: 'uppercase',
              textShadow: '0 0 20px rgba(255,255,255,0.3)'
            }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.6, ease: "easeOut" }}
          >
            ENGINEERING TRANSFORMATION
          </motion.p>
        </div>

        {/* Sci-fi scanner light effect across text */}
        <motion.div 
          style={{ position: 'absolute', bottom: -5, height: '1px', background: 'linear-gradient(90deg, transparent, #c8102e, white, #c8102e, transparent)', width: '100%' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: 1.8, repeat: Infinity, repeatDelay: 1 }}
        />
      </div>
    </motion.div>
  );
};

/* -- Apple-level Scale + Blur + Fade Page Transition -- */
const pageTransitionVariants = {
  initial: {
    opacity: 0,
    scale: 1.04,
    filter: 'blur(15px)'
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)'
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    filter: 'blur(15px)'
  },
};

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={pageTransitionVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] // Custom Apple-style cubic bezier
    }}
    style={{ minHeight: '100vh', width: '100%' }}
  >
    {children}
  </motion.div>
);

/* -- Scroll to Top on Route Change -- */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const scrollContainer = document.getElementById('main-content-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);
  return null;
};

/* -- Conditional Admin Redirect based on Hierarchy -- */
const ConditionalAdminRedirect = () => {
  const user = getUser() as any;
  if (user?.role === 'super_admin') {
    return <Navigate to="/admin/super-dashboard" replace />;
  }
  return <Navigate to="/admin/dashboard" replace />;
};

/* -- Animated Routes wrapper with crossfade -- */
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <React.Fragment>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/email-verification" element={<PageTransition><EmailVerification /></PageTransition>} />
        <Route path="/platform-capabilities/:id" element={<PageTransition><PlatformCapabilities /></PageTransition>} />
        <Route path="/user-type-overview/:id" element={<PageTransition><UserTypeOverview /></PageTransition>} />

        <Route path="/courses/:id/play" element={<PageTransition><CoursePlayer /></PageTransition>} />

        {/* User Protected Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/dashboard/activity" element={<PageTransition><ActivityFeed /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ViewProfile /></PageTransition>} />
          <Route path="/profile/edit" element={<PageTransition><EditProfile /></PageTransition>} />
          <Route path="/profile/:id" element={<PageTransition><PublicProfile /></PageTransition>} />
          <Route path="/profile/resume" element={<PageTransition><ResumeUpload /></PageTransition>} />
          <Route path="/profile/completion" element={<PageTransition><ProfileCompletion /></PageTransition>} />
          <Route path="/networking" element={<PageTransition><UserDirectory /></PageTransition>} />
          <Route path="/networking/suggested" element={<PageTransition><SuggestedConnections /></PageTransition>} />
          <Route path="/networking/search" element={<PageTransition><SearchResults /></PageTransition>} />
          <Route path="/networking/requests" element={<PageTransition><ConnectionRequests /></PageTransition>} />
          <Route path="/networking/connections" element={<PageTransition><FollowersFollowing /></PageTransition>} />
          <Route path="/jobs" element={<PageTransition><JobListings /></PageTransition>} />
          <Route path="/jobs/:id" element={<PageTransition><JobDetails /></PageTransition>} />
          <Route path="/jobs/:id/apply" element={<PageTransition><ApplyJob /></PageTransition>} />
          <Route path="/jobs/applications" element={<PageTransition><MyApplications /></PageTransition>} />
          <Route path="/jobs/saved" element={<PageTransition><SavedJobs /></PageTransition>} />
          <Route path="/jobs/recommended" element={<PageTransition><RecommendedJobs /></PageTransition>} />
          <Route path="/courses" element={<PageTransition><CourseListing /></PageTransition>} />
          <Route path="/courses/:id" element={<PageTransition><CourseDetails /></PageTransition>} />
          <Route path="/courses/my-courses" element={<PageTransition><MyCourses /></PageTransition>} />
          <Route path="/assessment/:id" element={<PageTransition><AssessmentCenter /></PageTransition>} />
          <Route path="/courses/:id/completion" element={<PageTransition><CourseCompletion /></PageTransition>} />
          <Route path="/assessments/quiz" element={<PageTransition><Quiz /></PageTransition>} />
          <Route path="/assessments/quiz/instructions" element={<PageTransition><QuizInstructions /></PageTransition>} />
          <Route path="/assessments/quiz/result" element={<PageTransition><QuizResult /></PageTransition>} />
          <Route path="/assessments/analytics" element={<PageTransition><PerformanceAnalysis /></PageTransition>} />
          <Route path="/gamification/badges" element={<PageTransition><Badges /></PageTransition>} />
          <Route path="/events" element={<PageTransition><EventsListing /></PageTransition>} />
          <Route path="/events/:id" element={<PageTransition><EventDetails /></PageTransition>} />
          <Route path="/events/:id/register" element={<PageTransition><EventRegistration /></PageTransition>} />
          <Route path="/events/my-events" element={<PageTransition><MyEvents /></PageTransition>} />
          <Route path="/social/feed" element={<Navigate to="/dashboard/activity" replace />} />
          <Route path="/feed" element={<Navigate to="/dashboard/activity" replace />} />
          <Route path="/social/post/create" element={<PageTransition><CreatePost /></PageTransition>} />
          <Route path="/social/post/:id" element={<PageTransition><PostDetails /></PageTransition>} />
          <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
          <Route path="/notifications/preferences" element={<PageTransition><EmailPreferences /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><AccountSettings /></PageTransition>} />
          <Route path="/settings/privacy" element={<PageTransition><PrivacySettings /></PageTransition>} />
          <Route path="/settings/notifications" element={<PageTransition><NotificationSettings /></PageTransition>} />
          <Route path="/settings/password" element={<PageTransition><ChangePassword /></PageTransition>} />
        </Route>

        {/* Admin Routes with Transitions */}
        <Route path="/admin" element={<PageTransition><AdminLayout /></PageTransition>}>
          <Route index element={<ConditionalAdminRedirect />} />
          <Route path="dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="super-dashboard" element={<PageTransition><SuperAdminDashboard /></PageTransition>} />
          <Route path="roles" element={<PageTransition><AdminRoleManager /></PageTransition>} />
          <Route path="add-manager" element={<PageTransition><AdminAddManager /></PageTransition>} />
          <Route path="users" element={<PageTransition><AdminUsers /></PageTransition>} />
          <Route path="users/add" element={<PageTransition><AdminAddUser /></PageTransition>} />
          <Route path="users/edit/:id" element={<PageTransition><AdminEditUser /></PageTransition>} />
          <Route path="interns" element={<PageTransition><AdminInterns /></PageTransition>} />
          <Route path="interns/add" element={<PageTransition><AdminAddIntern /></PageTransition>} />
          <Route path="iv-students" element={<PageTransition><AdminIVStudents /></PageTransition>} />
          <Route path="iv-students/add" element={<PageTransition><AdminAddVisit /></PageTransition>} />
          <Route path="certification" element={<PageTransition><AdminCertification /></PageTransition>} />
          <Route path="applications" element={<PageTransition><Applications /></PageTransition>} />
          <Route path="reports" element={<PageTransition><Reports /></PageTransition>} />
          <Route path="events" element={<PageTransition><EventManagerEvents /></PageTransition>} />
          <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
        </Route>

        {/* Event Manager Protected Routes */}
        <Route path="/event-manager" element={<EventManagerLayout />}>
          <Route index element={<Navigate to="/event-manager/dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><EventManagerDashboard /></PageTransition>} />
          <Route path="events" element={<PageTransition><EventManagerEvents /></PageTransition>} />
          <Route path="attendees" element={<PageTransition><EventManagerAttendees /></PageTransition>} />
          <Route path="posts" element={<PageTransition><EventManagerPosts /></PageTransition>} />
          <Route path="community-feed" element={<PageTransition><ActivityFeed /></PageTransition>} />

          <Route path="registrations" element={<PageTransition><EventManagerRegistrations /></PageTransition>} />
          <Route path="reports" element={<PageTransition><EventManagerReports /></PageTransition>} />
          <Route path="settings" element={<PageTransition><EventManagerSettings /></PageTransition>} />
          <Route path="profile" element={<PageTransition><ViewProfile /></PageTransition>} />
          <Route path="profile/edit" element={<PageTransition><EditProfile /></PageTransition>} />
          <Route path="profile/:id" element={<PageTransition><PublicProfile /></PageTransition>} />
        </Route>

        {/* Recruiter Protected Routes */}
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><RecruiterDashboard /></PageTransition>} />
          <Route path="jobs" element={<PageTransition><RecruiterJobs /></PageTransition>} />
          <Route path="jobs/post" element={<PageTransition><RecruiterPostJob /></PageTransition>} />
          <Route path="post" element={<PageTransition><RecruiterPosts /></PageTransition>} />
          <Route path="community-feed" element={<PageTransition><ActivityFeed /></PageTransition>} />

          <Route path="applications" element={<PageTransition><RecruiterApplications /></PageTransition>} />
          <Route path="reports" element={<PageTransition><RecruiterReports /></PageTransition>} />
          <Route path="settings" element={<PageTransition><RecruiterSettings /></PageTransition>} />
          <Route path="help" element={<PageTransition><RecruiterHelp /></PageTransition>} />
          <Route path="mail" element={<PageTransition><RecruiterMail /></PageTransition>} />
          <Route path="profile" element={<PageTransition><ViewProfile /></PageTransition>} />
          <Route path="profile/edit" element={<PageTransition><EditProfile /></PageTransition>} />
          <Route path="profile/:id" element={<PageTransition><PublicProfile /></PageTransition>} />
        </Route>

        {/* Course Manager Protected Routes */}
        <Route path="/course-manager" element={<CourseManagerLayout />}>
          <Route index element={<Navigate to="/course-manager/dashboard" replace />} />
          <Route path="dashboard" element={<CourseManagerDashboard />} />
          <Route path="courses" element={<CourseManagerCourses />} />
          <Route path="courses/create" element={<CourseManagerCreateCourse />} />
          <Route path="courses/edit/:id" element={<CourseManagerCreateCourse />} />
          <Route path="students" element={<CourseManagerStudents />} />
          <Route path="assessments" element={<CourseManagerAssessments />} />
          <Route path="certificates" element={<CourseManagerCertificates />} />
          <Route path="reminders" element={<CourseManagerReminderCenter />} />
          <Route path="recommendations" element={<CourseManagerRecommendations />} />
          <Route path="performance" element={<CourseManagerPerformance />} />
          <Route path="insights" element={<CourseManagerInsights />} />
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Fragment>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Elegant timing for a luxury reveal
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div style={{ background: '#010614', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
        <AnimatePresence>
          {isLoading ? (
            <SplashScreen key="splash" />
          ) : (
            <motion.div 
              key="main-app"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <ScrollToTop />
              <AnimatedRoutes />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;
