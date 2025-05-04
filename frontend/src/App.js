import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import LandingPage from "./landingpage";
import AuthPage from './Auth';
import StudentDashboard from "./components/StudentDashboard";
import MilestonePage from "./components/MileStone";
import AdvisorDashboard from "./components/AdvisorDashboard";
import StudentProgress from "./components/StudentProgress";
import AdvisorPendingApprovals from "./components/AdvisorPendingApprovals";
import AllStudentProgress from './components/AllStudentProgress';
import AdminDashboard from "./components/AdminDashboard";
import AdminProfile from "./components/AdminProfile";
import NotesPage from "./components/NotesPage";
import Profile from "./components/Profile";

function App() {
  console.log('render app..');

  return (
    <AuthProvider>
      <Toaster position="top-right" gutter={8} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Student routes */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/project/:projectId" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/student/milestones" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MilestonePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/notes" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <NotesPage />
            </ProtectedRoute>
          } 
        />

        {/* Advisor routes */}
        <Route 
          path="/advisor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['advisor']}>
              <AdvisorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/advisor/student/:studentId" 
          element={
            <ProtectedRoute allowedRoles={['advisor']}>
              <StudentProgress />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/advisor/pending-approvals" 
          element={
            <ProtectedRoute allowedRoles={['advisor']}>
              <AdvisorPendingApprovals />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/advisor/student-progress"
          element={
            <ProtectedRoute allowedRoles={['advisor']}>
              <AllStudentProgress />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Common routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={['student', 'advisor', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route - redirect to dashboard based on role */}
        <Route 
          path="*" 
          element={
            <ProtectedRoute allowedRoles={['student', 'advisor', 'admin']}>
              <Navigate to="/student/dashboard" />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App; 
