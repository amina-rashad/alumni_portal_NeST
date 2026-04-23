import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Splash & Styles
import './App.css';
import nestMainLogo from './assets/nest_logo.png';

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
import PerformanceAnalytics from './pages/PerformanceAnalytics';

// Gamification Pages
import PointsOverview from './pages/PointsOverview';
import Badges from './pages/Badges';
import Leaderboard from './pages/Leaderboard';

// Events Pages
import EventsListing from './pages/EventsListing';
import EventDetails from './pages/EventDetails';
import EventRegistration from './pages/EventRegistration';
import MyEvents from './pages/MyEvents';

// Social Pages
import Feed from './pages/Feed';
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
import AdminAddUser from './pages/admin/AdminAddUser';
import AdminInterns from './pages/admin/AdminInterns';
import AdminAddIntern from './pages/admin/AdminAddIntern';
import AdminIVStudents from './pages/admin/AdminIVStudents';
import AdminAddVisit from './pages/admin/AdminAddVisit';
import AdminJobs from './pages/admin/AdminJobs';
import AdminPostJob from './pages/admin/AdminPostJob';
import Applications from './pages/admin/Applications';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import AdminCourses from './pages/admin/AdminCourses';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAddEvent from './pages/admin/AdminAddEvent';
import AdminAddCourse from './pages/admin/AdminAddCourse';
import AdminCertification from './pages/admin/AdminCertification';

// Event Manager Pages
import EventManagerLayout from './pages/event_manager/EventManagerLayout';
import EventManagerDashboard from './pages/event_manager/EventManagerDashboard';
import EventManagerEvents from './pages/event_manager/EventManagerEvents';
import EventManagerAddEvent from './pages/event_manager/EventManagerAddEvent';
import EventManagerPlaceholder from './pages/event_manager/EventManagerPlaceholder';

/* -- Luxury Splash Screen with Mask Reveal -- */
import heroBg from './assets/hero-bg.jpg';
const SplashScreen: React.FC = () => (
  <motion.div
    className="splash-screen"
    initial={{ opacity: 1 }}
    exit={{ 
      opacity: 0, 
      scale: 1.05,
      filter: 'blur(10px)',
      transition: { duration: 2.0, ease: [0.16, 1, 0.3, 1] } 
    }}
    style={{ overflow: 'hidden' }}
  >
    {/* Ambient Ambient Blurred Background */}
    <motion.div 
      style={{ 
        position: 'absolute', 
        inset: -20, 
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(30px) brightness(0.25)',
        zIndex: 1
      }}
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 0.6,
        rotate: [0, 1, 0, -1, 0]
      }}
      transition={{ 
        duration: 8, 
        opacity: { duration: 1.5 },
        rotate: { duration: 20, repeat: Infinity, ease: 'linear' }
      }}
    />

    {/* Luxury Particles / Grain overlay (pseudo) */}
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, rgba(5,13,30,0.8) 100%)', zIndex: 2 }} />

    <div className="splash-logo" style={{ position: 'relative', zIndex: 3 }}>
      <div className="splash-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        
        {/* Logo Container with Mask Reveal Effect */}
        <div style={{ position: 'relative' }}>
          <motion.div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.98)', 
              backdropFilter: 'blur(20px)', 
              padding: '24px 44px', 
              borderRadius: '24px', 
              boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* The Logo with a horizontal mask wipe reveal */}
            <motion.div
              style={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={nestMainLogo} alt="NeST Digital" style={{ height: '70px', objectFit: 'contain' }} />
            </motion.div>
          </motion.div>

          {/* Luxury Reflection Shine across the logo */}
          <motion.div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)',
              zIndex: 5,
              borderRadius: '24px',
              pointerEvents: 'none'
            }}
            initial={{ left: '-100%', opacity: 0 }}
            animate={{ left: '100%', opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
          />
        </div>

        {/* Animated Text: Engineering Transformation */}
        <div style={{ overflow: 'hidden', paddingTop: '10px' }}>
          <motion.p 
            style={{ 
              margin: 0, 
              letterSpacing: '12px', 
              color: '#ffffff', 
              fontSize: '11px', 
              fontWeight: 900, 
              textTransform: 'uppercase',
              opacity: 0.8
            }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
          >
            ENGINEERING TRANSFORMATION
          </motion.p>
        </div>
      </div>

      {/* Elegant minimalist loader bar */}
      <div 
        style={{ 
          width: '240px', 
          height: '1px', 
          background: 'rgba(255,255,255,0.08)', 
          borderRadius: '10px', 
          overflow: 'hidden', 
          margin: '40px auto 0',
          position: 'relative'
        }}
      >
        <motion.div
          style={{ 
            height: '100%', 
            background: 'linear-gradient(90deg, transparent, #c8102e, white, #c8102e, transparent)',
            backgroundSize: '200% 100%'
          }}
          initial={{ left: '-100%' }}
          animate={{ left: '100%', backgroundPosition: ['200% center', '-200% center'] }}
          transition={{ 
            left: { duration: 1.8, ease: 'easeInOut' },
            backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' }
          }}
        />
      </div>
    </div>
  </motion.div>
);

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

/* ── Animated Routes ── */
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <React.Fragment>
      <ScrollToTop />
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/email-verification" element={<PageTransition><EmailVerification /></PageTransition>} />
        <Route path="/platform-capabilities/:id" element={<PageTransition><PlatformCapabilities /></PageTransition>} />
        <Route path="/user-type-overview/:id" element={<PageTransition><UserTypeOverview /></PageTransition>} />

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
          <Route path="/courses/:id/play" element={<PageTransition><CoursePlayer /></PageTransition>} />
          <Route path="/courses/my-courses" element={<PageTransition><MyCourses /></PageTransition>} />
          <Route path="/courses/:id/completion" element={<PageTransition><CourseCompletion /></PageTransition>} />
          <Route path="/assessments/quiz" element={<PageTransition><Quiz /></PageTransition>} />
          <Route path="/assessments/quiz/instructions" element={<PageTransition><QuizInstructions /></PageTransition>} />
          <Route path="/assessments/quiz/result" element={<PageTransition><QuizResult /></PageTransition>} />
          <Route path="/assessments/analytics" element={<PageTransition><PerformanceAnalytics /></PageTransition>} />
          <Route path="/gamification" element={<PageTransition><PointsOverview /></PageTransition>} />
          <Route path="/gamification/badges" element={<PageTransition><Badges /></PageTransition>} />
          <Route path="/gamification/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
          <Route path="/events" element={<PageTransition><EventsListing /></PageTransition>} />
          <Route path="/events/:id" element={<PageTransition><EventDetails /></PageTransition>} />
          <Route path="/events/:id/register" element={<PageTransition><EventRegistration /></PageTransition>} />
          <Route path="/events/my-events" element={<PageTransition><MyEvents /></PageTransition>} />
          <Route path="/social/feed" element={<PageTransition><Feed /></PageTransition>} />
          <Route path="/social/post/create" element={<PageTransition><CreatePost /></PageTransition>} />
          <Route path="/social/post/:id" element={<PageTransition><PostDetails /></PageTransition>} />
          <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
          <Route path="/notifications/preferences" element={<PageTransition><EmailPreferences /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><AccountSettings /></PageTransition>} />
          <Route path="/settings/privacy" element={<PageTransition><PrivacySettings /></PageTransition>} />
          <Route path="/settings/notifications" element={<PageTransition><NotificationSettings /></PageTransition>} />
          <Route path="/settings/password" element={<PageTransition><ChangePassword /></PageTransition>} />
        </Route>

        {/* Admin Protected Routes with AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="users" element={<PageTransition><AdminUsers /></PageTransition>} />
          <Route path="users/add" element={<PageTransition><AdminAddUser /></PageTransition>} />
          <Route path="interns" element={<PageTransition><AdminInterns /></PageTransition>} />
          <Route path="interns/add" element={<PageTransition><AdminAddIntern /></PageTransition>} />
          <Route path="iv-students" element={<PageTransition><AdminIVStudents /></PageTransition>} />
          <Route path="iv-students/add" element={<PageTransition><AdminAddVisit /></PageTransition>} />
          <Route path="certification" element={<PageTransition><AdminCertification /></PageTransition>} />
          <Route path="jobs" element={<PageTransition><AdminJobs /></PageTransition>} />
          <Route path="jobs/post" element={<PageTransition><AdminPostJob /></PageTransition>} />
          <Route path="applications" element={<PageTransition><Applications /></PageTransition>} />
          <Route path="reports" element={<PageTransition><Reports /></PageTransition>} />
          <Route path="events" element={<PageTransition><AdminEvents /></PageTransition>} />
          <Route path="events/add" element={<PageTransition><AdminAddEvent /></PageTransition>} />
          <Route path="add-courses" element={<PageTransition><AdminCourses /></PageTransition>} />
          <Route path="courses/add" element={<PageTransition><AdminAddCourse /></PageTransition>} />
          <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
        </Route>

        {/* Event Manager Protected Routes */}
        <Route path="/event-manager" element={<EventManagerLayout />}>
          <Route index element={<Navigate to="/event-manager/dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><EventManagerDashboard /></PageTransition>} />
          <Route path="events" element={<PageTransition><EventManagerEvents /></PageTransition>} />
          <Route path="events/add" element={<PageTransition><EventManagerAddEvent /></PageTransition>} />
          <Route path="attendees" element={<PageTransition><EventManagerPlaceholder title="Attendee Management" /></PageTransition>} />
          <Route path="registrations" element={<PageTransition><EventManagerPlaceholder title="Registration Tracking" /></PageTransition>} />
          <Route path="reports" element={<PageTransition><EventManagerPlaceholder title="Analytics Reports" /></PageTransition>} />
          <Route path="settings" element={<PageTransition><EventManagerPlaceholder title="Module Settings" /></PageTransition>} />
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
    // Luxury loading delay
    const loadTimer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(loadTimer);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <SplashScreen key="splash" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <AnimatedRoutes />
          </motion.div>
        )}
      </AnimatePresence>
    </Router>
  );
};

export default App;
