import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location, mode: 'login' }} replace />;
  }

  // If user's role is not allowed, redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const dashboardPath = currentUser.role === 'student' 
      ? '/student/dashboard' 
      : currentUser.role === 'advisor' 
        ? '/advisor/dashboard' 
        : '/admin/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // If all checks pass, render the protected content
  return children;
} 