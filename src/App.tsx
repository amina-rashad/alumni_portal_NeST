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

/* ── Splash Screen ── */
const SplashScreen: React.FC = () => (
  <motion.div
    className="splash-screen"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
  >
    <motion.div
      className="splash-logo"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="splash-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        <motion.div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)', 
            padding: '24px 40px', 
            borderRadius: '20px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid rgba(200, 16, 46, 0.1)'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <img src={nestMainLogo} alt="NeST Digital" style={{ height: '70px', objectFit: 'contain' }} />
        </motion.div>
        <p style={{ margin: 0, letterSpacing: '6px', color: '#ffffff', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>ENGINEERING TRANSFORMATION</p>
      </div>
      <div className="loader-bar">
        <motion.div
          className="loader-progress"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, ease: 'linear' }}
        />
      </div>
    </motion.div>
  </motion.div>
);

/* ── Apple-style Crossfade Page Transition ── */
const pageTransitionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={pageTransitionVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.45, ease: [0.42, 0, 0.58, 1] }}
    style={{ minHeight: '100vh' }}
  >
    {children}
  </motion.div>
);

/* ── Scroll to Top on Route Change ── */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

/* ── Animated Routes wrapper with crossfade ── */
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <React.Fragment>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/email-verification" element={<PageTransition><EmailVerification /></PageTransition>} />
        <Route path="/platform-capabilities/:id" element={<PageTransition><PlatformCapabilities /></PageTransition>} />

        {/* Protected Routes with MainLayout */}
        <Route element={<MainLayout />}>
          {/* Dashboards */}
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/dashboard/activity" element={<PageTransition><ActivityFeed /></PageTransition>} />
          
          {/* Profile */}
          <Route path="/profile" element={<PageTransition><ViewProfile /></PageTransition>} />
          <Route path="/profile/edit" element={<PageTransition><EditProfile /></PageTransition>} />
          <Route path="/profile/:id" element={<PageTransition><PublicProfile /></PageTransition>} />
          <Route path="/profile/resume" element={<PageTransition><ResumeUpload /></PageTransition>} />
          <Route path="/profile/completion" element={<PageTransition><ProfileCompletion /></PageTransition>} />

          {/* Networking */}
          <Route path="/networking" element={<PageTransition><UserDirectory /></PageTransition>} />
          <Route path="/networking/suggested" element={<PageTransition><SuggestedConnections /></PageTransition>} />
          <Route path="/networking/search" element={<PageTransition><SearchResults /></PageTransition>} />
          <Route path="/networking/requests" element={<PageTransition><ConnectionRequests /></PageTransition>} />
          <Route path="/networking/connections" element={<PageTransition><FollowersFollowing /></PageTransition>} />

          {/* Jobs */}
          <Route path="/jobs" element={<PageTransition><JobListings /></PageTransition>} />
          <Route path="/jobs/:id" element={<PageTransition><JobDetails /></PageTransition>} />
          <Route path="/jobs/:id/apply" element={<PageTransition><ApplyJob /></PageTransition>} />
          <Route path="/jobs/applications" element={<PageTransition><MyApplications /></PageTransition>} />
          <Route path="/jobs/saved" element={<PageTransition><SavedJobs /></PageTransition>} />
          <Route path="/jobs/recommended" element={<PageTransition><RecommendedJobs /></PageTransition>} />

          {/* Courses */}
          <Route path="/courses" element={<PageTransition><CourseListing /></PageTransition>} />
          <Route path="/courses/:id" element={<PageTransition><CourseDetails /></PageTransition>} />
          <Route path="/courses/:id/play" element={<PageTransition><CoursePlayer /></PageTransition>} />
          <Route path="/courses/my-courses" element={<PageTransition><MyCourses /></PageTransition>} />
          <Route path="/courses/:id/completion" element={<PageTransition><CourseCompletion /></PageTransition>} />

          {/* Assessments */}
          <Route path="/assessments/quiz" element={<PageTransition><Quiz /></PageTransition>} />
          <Route path="/assessments/quiz/instructions" element={<PageTransition><QuizInstructions /></PageTransition>} />
          <Route path="/assessments/quiz/result" element={<PageTransition><QuizResult /></PageTransition>} />
          <Route path="/assessments/analytics" element={<PageTransition><PerformanceAnalytics /></PageTransition>} />

          {/* Gamification */}
          <Route path="/gamification" element={<PageTransition><PointsOverview /></PageTransition>} />
          <Route path="/gamification/badges" element={<PageTransition><Badges /></PageTransition>} />
          <Route path="/gamification/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />

          {/* Events */}
          <Route path="/events" element={<PageTransition><EventsListing /></PageTransition>} />
          <Route path="/events/:id" element={<PageTransition><EventDetails /></PageTransition>} />
          <Route path="/events/:id/register" element={<PageTransition><EventRegistration /></PageTransition>} />
          <Route path="/events/my-events" element={<PageTransition><MyEvents /></PageTransition>} />

          {/* Social Feed */}
          <Route path="/social/feed" element={<PageTransition><Feed /></PageTransition>} />
          <Route path="/social/post/create" element={<PageTransition><CreatePost /></PageTransition>} />
          <Route path="/social/post/:id" element={<PageTransition><PostDetails /></PageTransition>} />

          {/* Notifications */}
          <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
          <Route path="/notifications/preferences" element={<PageTransition><EmailPreferences /></PageTransition>} />

          {/* Settings */}
          <Route path="/settings" element={<PageTransition><AccountSettings /></PageTransition>} />
          <Route path="/settings/privacy" element={<PageTransition><PrivacySettings /></PageTransition>} />
          <Route path="/settings/notifications" element={<PageTransition><NotificationSettings /></PageTransition>} />
          <Route path="/settings/password" element={<PageTransition><ChangePassword /></PageTransition>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<PageTransition><AdminLayout /></PageTransition>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="users" element={<PageTransition><AdminUsers /></PageTransition>} />
          <Route path="users/add" element={<PageTransition><AdminAddUser /></PageTransition>} />
          <Route path="interns" element={<PageTransition><AdminInterns /></PageTransition>} />
          <Route path="interns/add" element={<PageTransition><AdminAddIntern /></PageTransition>} />
          <Route path="iv-students" element={<PageTransition><AdminIVStudents /></PageTransition>} />
          <Route path="iv-students/add" element={<PageTransition><AdminAddVisit /></PageTransition>} />
          <Route path="jobs" element={<PageTransition><AdminJobs /></PageTransition>} />
          <Route path="jobs/post" element={<PageTransition><AdminPostJob /></PageTransition>} />
          <Route path="applications" element={<PageTransition><Applications /></PageTransition>} />
          <Route path="reports" element={<PageTransition><Reports /></PageTransition>} />
          <Route path="events" element={<PageTransition><AdminEvents /></PageTransition>} />
          <Route path="events/add" element={<PageTransition><AdminAddEvent /></PageTransition>} />
          <Route path="add-courses" element={<PageTransition><AdminCourses /></PageTransition>} />
          <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </React.Fragment>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(loadTimer);
  }, []);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <SplashScreen key="splash" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedRoutes />
          </motion.div>
        )}
      </AnimatePresence>
    </Router>
  );
};

export default App;
