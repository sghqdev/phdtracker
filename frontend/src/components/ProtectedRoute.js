import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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

  if (!token) {
    // Clear any remaining auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Redirect to login page but save the attempted url
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not in the allowed roles, redirect to appropriate dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'admin' 
      ? '/admin'
      : user.role === 'advisor'
        ? '/advisor-dashboard'
        : '/student-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute; 