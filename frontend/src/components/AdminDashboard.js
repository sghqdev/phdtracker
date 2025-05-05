import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { FaEdit, FaTrash, FaFileExport, FaPlus, FaChartBar, FaUsers, FaGraduationCap, FaCheckCircle, FaChevronDown } from 'react-icons/fa';

const PROGRESS_BY_STATUS = {
  Planned: { percent: 10, color: "#a78bfa" },
  InProgress: { percent: 50, color: "#6366f1" },
  PendingApproval: { percent: 80, color: "#f59e0b" },
  Completed: { percent: 100, color: "#22c55e" },
};

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isViewNotesModalOpen, setIsViewNotesModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [studentMilestones, setStudentMilestones] = useState([]);
  const [activeView, setActiveView] = useState(location.pathname === '/admin/reports' ? 'reports' : 'students');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await api.get('/api/students?populate=milestones');
      console.log('\n=== Fetched Students Response ===');
      console.log('Response data:', response.data.map(student => ({
        id: student._id,
        name: `${student.firstname} ${student.lastname}`,
        hasMilestones: !!student.milestones,
        milestoneCount: student.milestones?.length || 0,
        milestones: student.milestones?.map(m => ({
          id: m._id,
          title: m.title,
          status: m.status
        }))
      })));
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/auth');
      } else {
        toast.error('Failed to fetch students');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(student => 
        (student.firstname?.toLowerCase() || '').includes(query) ||
        (student.lastname?.toLowerCase() || '').includes(query) ||
        (student.email?.toLowerCase() || '').includes(query) ||
        (student.major?.toLowerCase() || '').includes(query) ||
        (student.programStatus?.toLowerCase() || '').includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudentMilestones = async (studentId) => {
    try {
      const response = await api.get(`/api/milestones/student/${studentId}`);
      setStudentMilestones(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/auth');
      } else {
        toast.error('Failed to fetch milestones');
      }
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    await fetchStudentMilestones(student._id);
    setIsMilestoneModalOpen(true);
  };

  const handleViewNotes = (student) => {
    setSelectedStudent(student);
    setIsViewNotesModalOpen(true);
  };

  const handleSignOut = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Clear browser history and redirect to landing page
    window.location.replace('/');
  };

  const exportToExcel = (type = 'students') => {
    let filename = '';

    if (type === 'students') {
      const data = students.map(student => ({
        'First Name': student.firstname,
        'Last Name': student.lastname,
        'Email': student.email,
        'Program': student.major,
        'Status': student.programStatus,
        'Milestones Completed': student.milestones?.filter(m => m.status === 'Completed').length || 0,
        'Total Milestones': student.milestones?.length || 0
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
      filename = 'students_data.xlsx';
      XLSX.writeFile(wb, filename);
    } else if (type === 'reports') {
      const stats = calculateStats();
      const wb = XLSX.utils.book_new();

      // Overview Sheet
      const overviewData = [{
        'Total Students': stats.totalStudents,
        'Total Programs': Object.keys(stats.programStats).length,
        'Completed Milestones': stats.milestoneStats.completed,
        'Remaining Milestones': stats.milestoneStats.remaining
      }];
      const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, overviewSheet, 'Overview');

      // Program Distribution Sheet
      const programData = Object.entries(stats.programStats).map(([program, count]) => ({
        'Program': program,
        'Number of Students': count
      }));
      const programSheet = XLSX.utils.json_to_sheet(programData);
      XLSX.utils.book_append_sheet(wb, programSheet, 'Program Distribution');

      // Status Distribution Sheet
      const statusData = Object.entries(stats.statusStats).map(([status, count]) => ({
        'Status': status,
        'Number of Students': count
      }));
      const statusSheet = XLSX.utils.json_to_sheet(statusData);
      XLSX.utils.book_append_sheet(wb, statusSheet, 'Status Distribution');

      filename = 'program_statistics.xlsx';
      XLSX.writeFile(wb, filename);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    try {
      const endpoint = noteToEdit 
        ? `/api/notes/${noteToEdit._id}`
        : '/api/notes';
      
      const method = noteToEdit ? 'put' : 'post';
      
      await api[method](endpoint, {
        studentId: selectedStudent._id,
        content: noteText,
        isRead: false
      });

      toast.success(noteToEdit ? 'Note updated successfully' : 'Note added successfully');
      setIsNoteModalOpen(false);
      setNoteText('');
      setNoteToEdit(null);
      fetchStudents();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/auth');
      } else {
        toast.error('Failed to save note');
      }
    }
  };

  const handleEditNote = (note) => {
    setNoteToEdit(note);
    setNoteText(note.content);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/api/notes/${noteId}`);
      toast.success('Note deleted successfully');
      fetchStudents();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/auth');
      } else {
        toast.error('Failed to delete note');
      }
    }
  };

  const calculateStats = () => {
    const stats = {
      totalStudents: students.length,
      programStats: {},
      statusStats: {},
      milestoneStats: {
        total: 0,
        completed: 0,
        remaining: 0
      }
    };

    students.forEach(student => {
      // Program stats - normalize to title case, but keep CS capitalized
      const normalizedProgram = student.major ? 
        student.major.split(' ')
          .map(word => word.toLowerCase() === 'cs' ? 'CS' : 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ') : 'Unknown';
      
      if (!stats.programStats[normalizedProgram]) {
        stats.programStats[normalizedProgram] = 0;
      }
      stats.programStats[normalizedProgram]++;

      // Status stats
      if (!stats.statusStats[student.programStatus]) {
        stats.statusStats[student.programStatus] = 0;
      }
      stats.statusStats[student.programStatus]++;

      // Milestone stats
      const studentMilestones = student.milestones || [];
      const completedMilestones = studentMilestones.filter(m => m.status === 'Completed').length;
      stats.milestoneStats.total += studentMilestones.length;
      stats.milestoneStats.completed += completedMilestones;
    });

    stats.milestoneStats.remaining = stats.milestoneStats.total - stats.milestoneStats.completed;
    return stats;
  };

  const renderReports = () => {
    const stats = calculateStats();

    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Program Statistics</h1>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.totalStudents}</p>
              </div>
              <FaUsers className="text-indigo-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Programs</p>
                <p className="text-2xl font-semibold text-gray-800">{Object.keys(stats.programStats).length}</p>
              </div>
              <FaGraduationCap className="text-indigo-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Milestones</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.milestoneStats.completed}</p>
              </div>
              <FaCheckCircle className="text-indigo-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Remaining Milestones</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.milestoneStats.remaining}</p>
              </div>
              <FaChartBar className="text-indigo-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Program Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Program Distribution</h2>
              <FaGraduationCap className="text-indigo-600 text-2xl" />
            </div>
            <div className="space-y-4">
              {Object.entries(stats.programStats).map(([program, count]) => (
                <div key={program} className="flex justify-between items-center">
                  <span className="text-gray-600">{program}</span>
                  <span className="text-gray-800 font-semibold">{count} students</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Status Distribution</h2>
              <FaUsers className="text-indigo-600 text-2xl" />
            </div>
            <div className="space-y-4">
              {Object.entries(stats.statusStats).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-600">{status}</span>
                  <span className="text-gray-800 font-semibold">{count} students</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6 flex flex-col justify-between h-full">
        <div>
          <div className="text-indigo-600 font-bold text-xl mb-8">PhDTracker Admin</div>
          <div className="space-y-4">
            <div className="text-sm text-gray-700 font-medium">Admin Controls</div>
            <ul className="space-y-2 mt-2">
              <li 
                className={`px-4 py-2 rounded-md cursor-pointer ${activeView === 'students' ? 'text-indigo-700 bg-indigo-100' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => {
                  setActiveView('students');
                  navigate('/admin');
                }}
              >
                Students
              </li>
              <li 
                className={`px-4 py-2 rounded-md cursor-pointer ${activeView === 'reports' ? 'text-indigo-700 bg-indigo-100' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => {
                  setActiveView('reports');
                  navigate('/admin/reports');
                }}
              >
                Reports
              </li>
              <li 
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer"
                onClick={() => navigate("/admin/profile")}
              >
                Profile
              </li>
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
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm border-b">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-semibold">
              {activeView === 'students' ? 'Student Management' : 'Program Statistics'}
            </h1>
            {activeView === 'students' && (
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
          {activeView === 'students' && (
            <div className="relative">
              <button 
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
              >
                <FaFileExport /> Export <FaChevronDown className="ml-1" />
              </button>
              
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        exportToExcel('students');
                        setIsExportMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export Student Data
                    </button>
                    <button
                      onClick={() => {
                        exportToExcel('reports');
                        setIsExportMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export Program Statistics
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto">
          {activeView === 'students' ? (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Program</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Completed Milestones</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">View/Edit/Add/Delete Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600"
                            onClick={() => handleStudentClick(student)}
                          >
                            {student.firstname} {student.lastname}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.userId?.email || student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.major}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.programStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.programStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(() => {
                            const completedCount = student.milestones?.filter(m => m.status === 'Completed').length || 0;
                            const totalCount = student.milestones?.length || 0;
                            console.log(`Student ${student.firstname} ${student.lastname} milestone counts:`, {
                              completed: completedCount,
                              total: totalCount,
                              milestones: student.milestones
                            });
                            return `${completedCount} / ${totalCount}`;
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-indigo-600"
                            onClick={() => handleViewNotes(student)}
                          >
                            <span>{student.notes?.length || 0} total</span>
                            {student.unreadNotesCount > 0 && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                {student.unreadNotesCount} unread
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No students found matching your search
                  </div>
                )}
              </div>
            </div>
          ) : (
            renderReports()
          )}
        </main>
      </div>

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {noteToEdit ? 'Edit Note' : 'Add Note'}
              </h3>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows="4"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your note here..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setIsNoteModalOpen(false);
                    setNoteText('');
                    setNoteToEdit(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  {noteToEdit ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {isMilestoneModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Milestones for {selectedStudent.firstname} {selectedStudent.lastname}
                </h3>
                <button
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentMilestones.length === 0 ? (
                  <div className="text-center text-gray-500 col-span-2 py-4">
                    No milestones found
                  </div>
                ) : (
                  studentMilestones.map((milestone) => (
                    <div key={milestone._id} className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">{milestone.title}</h3>
                        {milestone.isMajor && <span title="Major Milestone" className="text-yellow-400">⭐</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
                      {milestone.dueDate && (
                        <p className="text-sm text-gray-500 mt-2">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {/* Progress Bar */}
                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden mt-4">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${PROGRESS_BY_STATUS[milestone.status]?.percent || 0}%`, 
                            backgroundColor: PROGRESS_BY_STATUS[milestone.status]?.color || '#ccc' 
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Status: {milestone.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Notes Modal */}
      {isViewNotesModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Notes for {selectedStudent.firstname} {selectedStudent.lastname}
                </h3>
                <button
                  onClick={() => setIsViewNotesModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {selectedStudent.notes?.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No notes found
                  </div>
                ) : (
                  selectedStudent.notes?.map((note) => (
                    <div key={note._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-gray-800">{note.content}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              handleEditNote(note);
                              setIsViewNotesModalOpen(false);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteNote(note._id);
                              setIsViewNotesModalOpen(false);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setIsViewNotesModalOpen(false);
                    setSelectedStudent(selectedStudent);
                    setIsNoteModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2"
                >
                  <FaPlus /> Add New Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 