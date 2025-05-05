import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/api/auth/status');
      console.log('Auth status response:', response.data);
      
      if (response.data.success && response.data.user) {
        // Combine user data with profile data
        setCurrentUser({
          ...response.data.user,
          ...(response.data.student ? { student: response.data.student } : {})
        });
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error.message);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.success && response.data.user) {
        // Combine user data with profile data
        setCurrentUser({
          ...response.data.user,
          ...(response.data.student ? { student: response.data.student } : {})
        });
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProviderOld({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/api/auth/status');
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
      const response = await api.post('/api/auth/login', { email, password });
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
      await api.post('/api/auth/logout');
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