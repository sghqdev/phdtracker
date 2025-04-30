import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { FaUserGraduate, FaClipboardCheck, FaBell } from 'react-icons/fa';

export default function AdvisorDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdvisedStudents();
  }, []);

  const fetchAdvisedStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students...');
      const response = await api.get('/api/advisor/students');
      console.log('Students response:', response.data);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Signed out successfully!");
    navigate("/");
  };

  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6 flex flex-col justify-between h-full">
        <div>
          <div className="text-indigo-600 font-bold text-xl mb-8">PhDTracker</div>
          <div className="space-y-4">
            <div className="text-sm text-gray-700 font-medium">Advisor Dashboard</div>
            <ul className="space-y-2 mt-2">
              <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">Home</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer">Student Progress</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer">Pending Reviews</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer">
                <Link 
                  to="/advisor/pending-approvals"
                  className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <span className="ml-3">Pending Approvals</span>
                </Link>
              </li>
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
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm border-b">
          <input 
            className="bg-gray-100 rounded px-3 py-2 w-1/3" 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <button className="text-indigo-600"><FaBell /></button>
            <img src="/avatar.png" alt="User" className="h-8 w-8 rounded-full" />
          </div>
        </header>

        <main className="p-6 overflow-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <FaUserGraduate className="text-indigo-600 text-xl" />
                <h3 className="ml-2 text-gray-600">Total Students</h3>
              </div>
              <p className="text-2xl font-semibold mt-2">{students.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <FaClipboardCheck className="text-green-600 text-xl" />
                <h3 className="ml-2 text-gray-600">Pending Reviews</h3>
              </div>
              <p className="text-2xl font-semibold mt-2">0</p>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Your Students</h2>
            </div>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <FaUserGraduate className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? "No students match your search" : "You haven't been assigned any students yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <div 
                    key={student._id} 
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    onClick={() => navigate(`/advisor/student/${student._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {student.first_name[0]}{student.last_name[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {student.program} • {student.department}
                          </p>
                        </div>
                      </div>
                      <button 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/advisor/student/${student._id}`);
                        }}
                      >
                        View Progress
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 