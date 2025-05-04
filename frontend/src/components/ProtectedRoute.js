import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const token = localStorage.getItem('token');

  // Add event listener for popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      if (!token) {
        window.location.replace('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [token]);

  if (!currentUser || !token) {
    // Clear any remaining auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Redirect to login page but save the attempted url
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not in the allowed roles, redirect to appropriate dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    const redirectPath = currentUser.role === 'admin' 
      ? '/admin/dashboard'
      : currentUser.role === 'advisor'
        ? '/advisor/dashboard'
        : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute; 