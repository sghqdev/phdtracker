import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [advisors, setAdvisors] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
    advisor: ''
  });

  const fetchAdvisors = async () => {
    try {
      const response = await api.get('/api/advisor');
      if (response.data) {
        setAdvisors(response.data);
      }
    } catch (error) {
      console.error('Error fetching advisors:', error);
      setError('Failed to load advisors');
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  // Add this effect to monitor advisor state changes
  useEffect(() => {
    console.log('Advisors state updated:', {
      count: advisors.length,
      advisors: advisors.map(a => ({
        id: a._id,
        name: `${a.first_name} ${a.last_name}`
      }))
    });
  }, [advisors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting login with:', formData);
      const response = await api.post('/api/auth/login', formData);
      console.log('Login response:', response.data);
      
      // Store the response data with detailed logging
      const userData = response.data.user;
      const studentData = response.data.student;
      
      console.log('Storing user data:', {
        user: userData,
        student: studentData,
        token: response.data.token
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (studentData) {
        localStorage.setItem('student', JSON.stringify(studentData));
      }
      
      // Log what was actually stored
      console.log('Stored data verification:', {
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user'),
        student: localStorage.getItem('student')
      });
      
      // Redirect based on role
      window.location.href = userData.role === 'student' 
        ? '/student/dashboard' 
        : '/advisor/dashboard';
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="role"
              name="role"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="advisor">Advisor</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <div>
              <label htmlFor="advisor" className="block text-sm font-medium text-gray-700">
                Select Advisor
              </label>
              <select
                id="advisor"
                name="advisor"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.advisor}
                onChange={handleChange}
                required={formData.role === 'student'}
              >
                <option value="">Choose an advisor</option>
                {advisors && advisors.length > 0 ? (
                  advisors.map(advisor => (
                    <option key={advisor._id} value={advisor._id}>
                      {`${advisor.first_name} ${advisor.last_name} (${advisor.email})`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading advisors...</option>
                )}
              </select>
              <div className="mt-1 text-xs text-gray-500">
                {advisors.length} advisor(s) available
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>

        {/* Debug information */}
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p>Available Advisors: {advisors.length}</p>
          <pre>{JSON.stringify(advisors, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default Login; 