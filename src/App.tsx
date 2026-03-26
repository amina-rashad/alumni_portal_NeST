import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Splash & Styles
import './App.css';

// Main / Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

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
import AdminInterns from './pages/admin/AdminInterns';
import AdminIVStudents from './pages/admin/AdminIVStudents';
import AdminAddVisit from './pages/admin/AdminAddVisit';
import AdminJobs from './pages/admin/AdminJobs';
import AdminPostJob from './pages/admin/AdminPostJob';
import Applications from './pages/admin/Applications';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import AdminCourses from './pages/admin/AdminCourses';

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
      <div className="splash-brand">
        <div className="splash-logo-icon">
          <img src="https://media.licdn.com/dms/image/C560BAQGNt2PXXs_WkQ/company-logo_200_200/0/1630656715690/nest_software_logo?e=2147483647&v=beta&t=GkMvL3fQ2zIq805g8A6iU21Nkx1bYwR7y5sL_V0zHwM" alt="NeST" className="logo-icon-img" style={{ width: '52px', height: '52px' }} />
        </div>
        <div>
          <h1>NeST <span>DIGITAL</span></h1>
          <p>ENGINEERING TRANSFORMATION</p>
        </div>
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
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-verification" element={<EmailVerification />} />

              {/* Protected Routes with MainLayout */}
              <Route element={<MainLayout />}>
                {/* Dashboards */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/activity" element={<ActivityFeed />} />
                
                {/* Profile */}
                <Route path="/profile" element={<ViewProfile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/profile/:id" element={<PublicProfile />} />
                <Route path="/profile/resume" element={<ResumeUpload />} />
                <Route path="/profile/completion" element={<ProfileCompletion />} />

                {/* Networking */}
                <Route path="/networking" element={<UserDirectory />} />
                <Route path="/networking/suggested" element={<SuggestedConnections />} />
                <Route path="/networking/search" element={<SearchResults />} />
                <Route path="/networking/requests" element={<ConnectionRequests />} />
                <Route path="/networking/connections" element={<FollowersFollowing />} />

                {/* Jobs */}
                <Route path="/jobs" element={<JobListings />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/jobs/:id/apply" element={<ApplyJob />} />
                <Route path="/jobs/applications" element={<MyApplications />} />
                <Route path="/jobs/saved" element={<SavedJobs />} />
                <Route path="/jobs/recommended" element={<RecommendedJobs />} />

                {/* Courses */}
                <Route path="/courses" element={<CourseListing />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/courses/:id/play" element={<CoursePlayer />} />
                <Route path="/courses/my-courses" element={<MyCourses />} />
                <Route path="/courses/:id/completion" element={<CourseCompletion />} />

                {/* Assessments */}
                <Route path="/assessments/quiz" element={<Quiz />} />
                <Route path="/assessments/quiz/instructions" element={<QuizInstructions />} />
                <Route path="/assessments/quiz/result" element={<QuizResult />} />
                <Route path="/assessments/analytics" element={<PerformanceAnalytics />} />

                {/* Gamification */}
                <Route path="/gamification" element={<PointsOverview />} />
                <Route path="/gamification/badges" element={<Badges />} />
                <Route path="/gamification/leaderboard" element={<Leaderboard />} />

                {/* Events */}
                <Route path="/events" element={<EventsListing />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/events/:id/register" element={<EventRegistration />} />
                <Route path="/events/my-events" element={<MyEvents />} />

                {/* Social Feed */}
                <Route path="/social/feed" element={<Feed />} />
                <Route path="/social/post/create" element={<CreatePost />} />
                <Route path="/social/post/:id" element={<PostDetails />} />

                {/* Notifications */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/notifications/preferences" element={<EmailPreferences />} />

                {/* Settings */}
                <Route path="/settings" element={<AccountSettings />} />
                <Route path="/settings/privacy" element={<PrivacySettings />} />
                <Route path="/settings/notifications" element={<NotificationSettings />} />
                <Route path="/settings/password" element={<ChangePassword />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="interns" element={<AdminInterns />} />
                <Route path="iv-students" element={<AdminIVStudents />} />
                <Route path="iv-students/add" element={<AdminAddVisit />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="jobs/post" element={<AdminPostJob />} />
                <Route path="applications" element={<Applications />} />
                <Route path="reports" element={<Reports />} />
                <Route path="add-courses" element={<AdminCourses />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </Router>
  );
};

export default App;
