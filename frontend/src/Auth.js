import React, { useState, useEffect } from "react";
import api from './api/axios';
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from './contexts/AuthContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentUser } = useAuth();
  const [isLogin, setIsLogin] = useState(location.state?.mode === 'login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("student");
  const [program, setProgram] = useState("");
  const [department, setDepartment] = useState("");
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState('');

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const response = await api.get('/api/auth/advisors');
        setAdvisors(response.data);
      } catch (error) {
        console.error('Error fetching advisors:', error);
        toast.error('Failed to load advisors');
      }
    };
    fetchAdvisors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        if (!email || !password) {
          toast.error("Please fill in all fields");
          return;
        }

        const result = await login(email, password);
        console.log('Login result:', result);

        if (result.success) {
        toast.success('Login successful!');
        
          // Navigate based on role from the result
          const userRole = result.user?.role;
          console.log('Navigating with role:', userRole);
          
          switch (userRole) {
            case 'student':
          navigate('/student/dashboard');
              break;
            case 'advisor':
          navigate('/advisor/dashboard');
              break;
            case 'admin':
              navigate('/admin/dashboard');
              break;
            default:
              navigate('/');
          }
        } else {
          toast.error(result.error || 'Login failed');
        }
      } else {
        // Signup logic
        if (!email || !password || !confirmPassword || !firstName || !lastName || !role) {
          toast.error("Please fill in all required fields");
          return;
        }

        if (role === 'student' && !selectedAdvisor) {
          toast.error("Please select an advisor");
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        if (password.length < 6) {
          toast.error("Password must be at least 6 characters long");
          return;
        }

        const userData = {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role,
          program: program || '',
          department: department || '',
          advisor: selectedAdvisor
        };

        console.log('Sending signup data:', userData);

        const response = await api.post('/api/auth/signup', userData);
        console.log('Signup response:', response.data);

        if (response.data.success) {
          toast.success('Account created successfully! Please login.');
          setIsLogin(true);
        } else {
          toast.error(response.data.message || 'Signup failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <img src= "/logo.png" alt="PhDTracker logo" className="w-12 h-12" />
        </div>

        <h1 className="text-2xl font-bold mb-2">PhDTracker</h1>
        <h2 className="text-lg font-semibold mb-1">
          {isLogin ? "Log into your account" : "Create an account"}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {isLogin ? "Enter your email to log in" : "Enter your details to sign up for this app"}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@domain.com"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="advisor">Advisor</option>
                <option value="admin">Admin</option>
              </select>
              
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="Program (e.g., Computer Science)"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Department"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {!isLogin && role === 'student' && (
                <select
                  value={selectedAdvisor}
                  onChange={(e) => setSelectedAdvisor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an Advisor</option>
                  {advisors.map((advisor) => (
                    <option key={advisor._id} value={advisor._id}>
                      {advisor.first_name} {advisor.last_name} - {advisor.department}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {!isLogin && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:text-blue-900"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}