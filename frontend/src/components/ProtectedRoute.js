import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading, getDashboardByRole } = useAuth();

  // If auth is still loading, show nothing or a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  // If roles are specified and user's role is not included, 
  // redirect to their appropriate dashboard instead of home
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDashboardByRole(currentUser.role)} />;
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute; 