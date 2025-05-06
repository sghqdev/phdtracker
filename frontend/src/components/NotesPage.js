import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaCheck, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function NotesPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.student?.id) {
      console.log('Current user data:', currentUser);
      toast.error('Student profile not found. Please log in again.');
      navigate('/');
      return;
    }

    fetchNotes(currentUser.student.id);
    resetUnreadCount(currentUser.student.id);
  }, [currentUser, navigate]);

  const fetchNotes = async (studentId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/notes/student/${studentId}`);
      console.log('Notes response:', response.data);
      setNotes(response.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      if (error.response?.status === 401) {
        navigate('/auth');
      } else if (error.response?.status !== 500) {
        toast.error('Failed to fetch notes');
      }
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetUnreadCount = async (studentId) => {
    try {
      await api.put(`/api/students/${studentId}/reset-unread`);
    } catch (error) {
      console.error('Error resetting unread count:', error);
    }
  };

  const handleMarkAsRead = async (noteId) => {
    try {
      const response = await api.put(`/api/notes/${noteId}/read`);
      toast.success('Note marked as read');
      if (currentUser?._id) {
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note._id === noteId 
              ? { ...note, isRead: true, readAt: response.data.readAt || new Date().toISOString() }
              : note
          )
        );
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
    logout();
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
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/student/dashboard")}>Home</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/student/milestones")}>My Milestones</li>
              <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">Notes</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/profile")}>Profile</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
        <div className="flex items-center space-x-3 px-2">
            <div className="text-sm">
              <p className="font-medium">{currentUser.first_name} {currentUser.last_name}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
          </div>
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FaClipboardList className="text-6xl mb-4 text-gray-300" />
              <p className="text-lg">No notes available</p>
              <p className="text-sm mt-2">Your advisor will add notes here when needed</p>
            </div>
          ) : (
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
              </div>
            )}
        </main>
      </div>
    </div>
  );
}

export default NotesPage; 