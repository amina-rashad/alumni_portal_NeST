/* ─────────────────────────── Course Manager Types ─────────────────────────── */

export interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  duration?: string;
  instructor?: string;
  status?: string;
  enrollmentCount?: number;
  students?: number;
  modules?: CourseModule[];
  createdAt?: string;
  thumbnail?: string;
  level?: string;
  tags?: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  order?: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type?: string;
  content?: string;
  duration?: string;
}

export interface Student {
  id: string;
  full_name: string;
  name?: string; // Alias for UI
  email: string;
  course?: string;
  attendance?: number;
  progress?: number;
  enrolledCourses?: number;
  completedCourses?: number;
  avgScore?: number;
  status?: string;
  lastActive?: string;
  avatar?: string;
  batch?: string;
  specialization?: string;
}

export interface Assessment {
  id: string;
  title: string;
  courseId?: string;
  courseName?: string;
  type?: string;
  totalMarks?: number;
  passingMarks?: number;
  dueDate?: string;
  submissionsCount?: number;
  status?: string;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  assessmentId: string;
  assessmentTitle?: string;
  assessmentType?: string;
  course?: string;
  courseName?: string;
  score?: number;
  maxScore?: number;
  submittedAt?: string;
  status?: string;
  content?: {
    type: 'text' | 'github' | 'video' | 'link';
    text?: string;
    url?: string;
  };
}

export interface CertificateRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  courseId: string;
  issuedDate: string;
  certificateId: string;
  status: string;
  grade?: string;
}

export interface StudentAttendanceSummary {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  totalSessions: number;
  attended: number;
  percentage: number;
  lastAttended?: string;
  todayStatus: 'Present' | 'Absent' | 'Late';
  todayLogin?: string;
  todayDuration?: number;
  status?: string;
}

export interface AcademicAlert {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  type: string;
  details: string;
  courseName?: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Sent' | 'Acknowledged';
  createdAt: string;
  scheduledFor?: string;
}

export interface Discussion {
  id: string;
  title: string;
  studentName: string;
  authorId: string;
  courseName?: string;
  content: string;
  repliesCount: number;
  likes: number;
  status: 'Unresolved' | 'Resolved' | 'Flagged' | 'Locked';
  createdAt: string;
  lastActivity?: string;
  tags?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  type: string;
  criteria?: string;
  pointsValue?: number;
  isActive?: boolean;
}

export interface IssuedAchievement {
  id: string;
  achievementId: string;
  achievementTitle: string;
  studentId: string;
  studentName: string;
  issuedAt: string;
  courseName?: string;
}

export interface RecommendationRule {
  id: string;
  sourceCourseId: string;
  sourceCourseName: string;
  targetCourseId: string;
  targetCourseName: string;
  trigger: string;
  status: string;
  conversionRate?: string;
  enrolledStudents?: number;
}

export interface InsightSummary {
  id?: string;
  courseName?: string;
  courseId?: string;
  totalEnrolled?: number;
  totalCompleted?: number;
  avgCompletionTime?: string;
  completionRate?: number;
  dropOffRate?: number;
  avgScore?: number;
  trend?: 'up' | 'down' | 'stable';
  dailyActiveUsers: number[];
  streaks: { student: string; days: number }[];
  completionRates: { course: string; percentage: number }[];
  inactiveLearners: { name: string; lastActive: string; risk: string }[];
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  enrolledAt: string;
  status: 'Active' | 'Completed' | 'Dropped';
  progress: number;
}
