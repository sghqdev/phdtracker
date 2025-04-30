import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaBuilding, FaShieldAlt, FaEdit, FaCheck, FaTimes, FaUsers, FaChartBar, FaGraduationCap } from 'react-icons/fa';

function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalPrograms: 0,
    totalDepartments: 0
  });
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    department: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        navigate('/');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      if (!storedUser.id) {
        toast.error('User not found. Please log in again.');
        navigate('/');
        return;
      }

      try {
        // Fetch user data
        const userResponse = await axios.get(`http://localhost:9000/api/user/${storedUser.id}`, config);
        const userData = userResponse.data;
        setUser(userData);
        
        // Update form data with user information
        setFormData({
          firstname: userData.first_name || '',
          lastname: userData.last_name || '',
          email: userData.email || '',
          department: userData.department || ''
        });

        // Fetch admin statistics
        const statsResponse = await axios.get('http://localhost:9000/api/students', config);
        const students = statsResponse.data;
        
        // Calculate statistics
        const programs = new Set(students.map(student => student.major));
        const departments = new Set(students.map(student => student.department));
        
        setStats({
          totalStudents: students.length,
          totalPrograms: programs.size,
          totalDepartments: departments.size
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data. Please try logging in again.');
        navigate('/');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      navigate('/');
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      // Update user data
      await axios.put(`http://localhost:9000/api/user/${storedUser.id}`, {
        first_name: formData.firstname,
        last_name: formData.lastname,
        email: formData.email,
        department: formData.department
      }, config);

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      toast.error('Failed to update profile');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Signed out successfully!");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 px-4 py-6 flex flex-col justify-between h-full">
        <div>
          <div className="text-indigo-600 font-bold text-xl mb-8">PhDTracker Admin</div>
          <div className="space-y-4">
            <div className="text-sm text-gray-700 font-medium">Admin Controls</div>
            <ul className="space-y-2 mt-2">
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/admin")}>Students</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/admin/reports")}>Reports</li>
              <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">Profile</li>
              
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <div
            className="text-red-600 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer text-sm font-medium"
            onClick={handleSignOut}
          >
            Sign Out
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                <FaShieldAlt className="h-12 w-12 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{formData.firstname} {formData.lastname}</h1>
                <p className="text-gray-600">{formData.email}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    <FaShieldAlt className="mr-2" />
                    Administrator
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    <FaBuilding className="mr-2" />
                    {formData.department}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Admin Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                </div>
                <FaUsers className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Programs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalPrograms}</p>
                </div>
                <FaGraduationCap className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Departments</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalDepartments}</p>
                </div>
                <FaBuilding className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>
          
          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your first name"
                      />
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900">{formData.firstname}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your last name"
                      />
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900">{formData.lastname}</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900 flex items-center">
                      <FaEnvelope className="h-5 w-5 text-gray-400 mr-2" />
                      {formData.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBuilding className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your department"
                      />
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900 flex items-center">
                      <FaBuilding className="h-5 w-5 text-gray-400 mr-2" />
                      {formData.department}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
                >
                  <FaCheck className="mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile; 