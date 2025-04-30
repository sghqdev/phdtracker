import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [student, setStudent] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    department: '',
    program: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const storedStudent = JSON.parse(localStorage.getItem('student') || '{}');

      console.log('Stored User:', storedUser);
      console.log('Stored Student:', storedStudent);

      if (!storedUser.id) {
        toast.error('User not found. Please log in again.');
        navigate('/');
        return;
      }

      try {
        // Fetch user data
        const userResponse = await axios.get(`http://localhost:9000/api/user/${storedUser.id}`);
        const userData = userResponse.data;
        console.log('User Data:', userData);
        setUser(userData);
        
        // Update form data with user information
        setFormData(prevData => ({
          ...prevData,
          email: userData.email || '',
          department: userData.department || '',
          program: userData.program || ''
        }));
        
        // Fetch student data if student ID exists
        if (storedStudent.id) {
          try {
            console.log('Fetching student data for ID:', storedStudent.id);
            const studentResponse = await axios.get(`http://localhost:9000/api/students/${storedStudent.id}`);
            const studentData = studentResponse.data;
            console.log('Student Data:', studentData);
            
            if (!studentData) {
              throw new Error('No student data received');
            }
            
            setStudent(studentData);
            
            // Update form data with student information
            setFormData(prevData => ({
              ...prevData,
              firstname: studentData.firstname || '',
              lastname: studentData.lastname || ''
            }));
          } catch (studentError) {
            console.error('Error fetching student data:', {
              error: studentError,
              response: studentError.response?.data,
              status: studentError.response?.status
            });
            toast.error(`Failed to fetch student data: ${studentError.response?.data?.error || studentError.message}`);
          }
        } else {
          console.log('No student ID found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching user data:', {
          error: error,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error('Failed to fetch user data. Please try logging in again.');
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
    const storedStudent = JSON.parse(localStorage.getItem('student') || '{}');

    try {
      // Update user data
      await axios.put(`http://localhost:9000/api/user/${storedUser.id}`, {
        email: formData.email,
        department: formData.department,
        program: formData.program
      });

      // Update student data - include userId to maintain the required field
      await axios.put(`http://localhost:9000/api/students/${storedStudent.id}`, {
        firstname: formData.firstname,
        lastname: formData.lastname,
        userId: storedUser.id // Maintain the required userId field
      });

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
    localStorage.removeItem('student');
    toast.success("Signed out successfully!");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6 flex flex-col justify-between h-full">
        <div>
          <div className="text-indigo-600 font-bold text-xl mb-8">PhDTracker</div>
          <div className="space-y-4">
            <div className="text-sm text-gray-700 font-medium">Student Profile</div>
            <ul className="space-y-2 mt-2">
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/student-dashboard")}>Home</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/milestones")}>My Milestones</li>
              <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">Profile</li>
            </ul>
          </div>
        </div>

        {/* Sign Out button */}
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
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Profile Settings</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="mt-1 text-gray-900">{formData.firstname}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="mt-1 text-gray-900">{formData.lastname}</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              ) : (
                <div className="mt-1 text-gray-900">{formData.email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              ) : (
                <div className="mt-1 text-gray-900">{formData.department}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Program</label>
              {isEditing ? (
                <input
                  type="text"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              ) : (
                <div className="mt-1 text-gray-900">{formData.program}</div>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
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

export default Profile; 