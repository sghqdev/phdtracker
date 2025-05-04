import AppLayout from "./components/AppLayout";
import { Routes, Route, Navigate } from "react-router-dom";
import Task from "./components/Task";
import LandingPage from "./landingpage"; 
import { Toaster } from "react-hot-toast";
import AuthPage from './Auth';
import StudentDashboard from "./components/StudentDashboard";
import MilestonePage from "./components/MileStone";
import AdvisorDashboard from "./components/AdvisorDashboard";
import StudentProgress from "./components/StudentProgress";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from './contexts/AuthContext';
import AdvisorPendingApprovals from "./components/AdvisorPendingApprovals";
import AllStudentProgress from './components/AllStudentProgress';
{/*
function App() {
  console.log('render app..')
  return (
    <AppLayout>
      <Toaster
        position="top-right"
        gutter={8}
      />
      <Routes>
        <Route path="/:projectId" element={<Task />} />
        <Route path="/" element={
          <div className="flex flex-col items-center w-full pt-10">
            <img src="./image/welcome.svg" className="w-5/12" alt="" />
            <h1 className="text-lg text-gray-600">Select or create new project</h1>
          </div>
        } />
      </Routes>
    </AppLayout>
  );
}

export default App;
*/}

function App() {
  console.log('render app..');

  return (
    <AuthProvider>
      <Toaster position="top-right" gutter={8} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AuthPage />} />
        
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

        {/* Catch-all route - redirect to dashboard based on role */}
        <Route 
          path="*" 
          element={
            <ProtectedRoute allowedRoles={['student', 'advisor']}>
              <Navigate to="/student/dashboard" />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App; 
