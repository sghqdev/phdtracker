import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCheck } from 'react-icons/fa';

function NotesPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const storedStudent = JSON.parse(localStorage.getItem('student') || '{}');
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/auth');
      return;
    }

    if (storedStudent.id) {
      setStudent(storedStudent);
      fetchNotes(storedStudent.id);
      resetUnreadCount(storedStudent.id);
    }
  }, [navigate]);

  const fetchNotes = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:9000/api/notes/student/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setNotes(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/auth');
      } else {
        toast.error('Failed to fetch notes');
      }
    }
  };

  const resetUnreadCount = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:9000/api/students/${studentId}/reset-unread`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error resetting unread count:', error);
    }
  };

  const handleMarkAsRead = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:9000/api/notes/${noteId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Note marked as read');
      if (student && student.id) {
        fetchNotes(student.id);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/auth');
      } else {
        toast.error('Failed to mark note as read');
      }
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
    sessionStorage.clear();
    window.location.href = '/auth';
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
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/profile")}>Profile</li>
              <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">Notes</li>
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
          <h1 className="text-xl font-semibold">My Notes</h1>
        </header>

        <main className="p-6 overflow-auto">
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-800">{note.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!note.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(note._id)}
                      className="ml-4 p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title="Mark as read"
                    >
                      <FaCheck />
                    </button>
                  )}
                </div>
                {note.isRead && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Read on {new Date(note.readAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
            {notes.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No notes available
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default NotesPage; 