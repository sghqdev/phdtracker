import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios'; // Use the configured axios instance

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // Initialize from localStorage
      const storedUser = localStorage.getItem('user');
      const student = localStorage.getItem('student');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (student) {
          return {
            ...userData,
            studentData: JSON.parse(student)
          };
        }
        return userData;
      }
      return null;
    } catch (error) {
      // If there's an error parsing, clear the invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('student');
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    if (!userData || !userData.role) {
      throw new Error('Invalid login data');
    }
    
    // Prepare user data with student data if present
    const userToStore = userData.role === 'student' && userData.studentData 
      ? { ...userData }
      : userData;
    
    // Set the current user
    setCurrentUser(userToStore);
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (userData.role === 'student' && userData.studentData) {
      localStorage.setItem('student', JSON.stringify(userData.studentData));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('student');
  };

  const getDashboardByRole = (role) => {
    switch (role) {
      case 'student':
        return '/student/dashboard';
      case 'advisor':
        return '/advisor/dashboard';
      default:
        return '/';
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    getDashboardByRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProviderOld({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/status');
      if (response.data) {
        setCurrentUser(response.data);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      // If it's a 401, just set the user to null without logging an error
      if (error.response?.status === 401) {
        setCurrentUser(null);
      } else {
        console.error('Auth check error:', error.message);
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const getDashboardByRole = (role) => {
    switch (role) {
      case 'advisor':
        return '/advisor-dashboard';
      case 'student':
        return '/student-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const data = response.data;
      setCurrentUser(data);
      return {
        user: data,
        dashboardUrl: getDashboardByRole(data.role)
      };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    getDashboardByRole,
    checkAuthStatus
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthOld = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 