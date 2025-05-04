// Updated StudentDashboard.js with Progress Bars on Cards

import React, { useEffect, useState, useRef } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AddMilestoneModal from "./AddMilestoneModal";
import MilestoneDetailsModal from "./MilestoneDetailsModal";
import { FaPen, FaTrash, FaEye } from "react-icons/fa";
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const FIXED_COLUMNS = {
  Planned: { name: "Planned", id: "Planned" },
  InProgress: { name: "In Progress", id: "InProgress" },
  PendingApproval: { name: "Pending Approval", id: "PendingApproval" },
  Completed: { name: "Completed", id: "Completed" },
};

const PROGRESS_BY_STATUS = {
  Planned: { percent: 10, color: "#a78bfa" }, // Light Purple
  InProgress: { percent: 50, color: "#6366f1" }, // Indigo
  PendingApproval: { percent: 80, color: "#f59e0b" }, // Orange
  Completed: { percent: 100, color: "#22c55e" }, // Green
};

// Add status normalization function
const normalizeStatus = (status) => {
  const statusMap = {
    'In Progress': 'InProgress',
    'Pending Approval': 'PendingApproval',
    'Planned': 'Planned',
    'Completed': 'Completed'
  };
  return statusMap[status] || status;
};

function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState(() => {
    // Initialize columns with empty arrays
    const initialColumns = {};
    Object.keys(FIXED_COLUMNS).forEach(key => {
      initialColumns[key] = {
        ...FIXED_COLUMNS[key],
        items: []
      };
    });
    return initialColumns;
  });
  const [isAddMilestoneModalOpen, setAddMilestoneModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [milestoneToEdit, setMilestoneToEdit] = useState(null);
  const [isRenderChange, setRenderChange] = useState(false);
  const [unreadNotesCount, setUnreadNotesCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Extract studentId from URL if viewing from advisor context
  const studentIdFromUrl = location.pathname.split('/advisor/student/')[1];
  
  // Use the appropriate ID for fetching milestones
  const targetStudentId = studentIdFromUrl || currentUser?._id;

  useEffect(() => {
    if (!targetStudentId) return;
    fetchMilestones();
    fetchStudentData();
  }, [targetStudentId, isAddMilestoneModalOpen, isRenderChange]);

  const fetchMilestones = async () => {
    if (!targetStudentId) return;

    try {
      setIsLoading(true);
      console.log('Attempting to fetch milestones for ID:', targetStudentId);
      const response = await api.get(`/api/milestones/student/${targetStudentId}`);
      
      const milestoneData = response.data;
      console.log('Raw milestone data:', milestoneData);
      
      const newColumns = {};
      Object.entries(FIXED_COLUMNS).forEach(([key, column]) => {
        const filteredMilestones = milestoneData
          .filter(m => m.status === key)
          .map(m => ({
            ...m,
            id: String(m._id),
            _id: String(m._id)
          }));
        newColumns[key] = {
          ...column,
          items: filteredMilestones,
        };
      });

      console.log('Processed columns:', newColumns);
      setColumns(newColumns);
    } catch (error) {
      console.error('Milestone fetch error:', error);
      toast.error("Failed to load milestones");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const student = JSON.parse(localStorage.getItem('student'));
      
      if (student && student.id) {
        const response = await axios.get(
          `http://localhost:9000/api/students/${student.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setUnreadNotesCount(response.data.unreadNotesCount || 0);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination || isLoading) return;

    const { source, destination } = result;
    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    console.log('Drag result:', {
      source: sourceId,
      destination: destId,
      draggableId: result.draggableId
    });

    // Get the source and destination columns
    const sourceColumn = columns[sourceId];
    const destColumn = columns[destId];

    if (!sourceColumn || !destColumn) {
      console.error('Invalid source or destination column:', { sourceId, destId });
      return;
    }

    // Create new arrays for the items
    const sourceItems = Array.from(sourceColumn.items);
    const destItems = Array.from(destColumn.items);

    // Remove the dragged item from the source
    const [movedItem] = sourceItems.splice(source.index, 1);

    if (sourceId !== destId) {
      // Add to destination
      movedItem.status = destId;
      destItems.splice(destination.index, 0, movedItem);

      // Update state
      const newColumns = {
        ...columns,
        [sourceId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destId]: {
          ...destColumn,
          items: destItems,
        },
      };

      setColumns(newColumns);

      // Update in backend
      try {
        await api.put(`/api/milestones/${movedItem._id}`, {
          status: movedItem.status,
        });
        toast.success("Milestone status updated!");
      } catch (error) {
        console.error("Error updating milestone status:", error);
        toast.error("Failed to update milestone status.");
        fetchMilestones(); // Revert on error
      }
    } else {
      // Same column reorder
      sourceItems.splice(destination.index, 0, movedItem);
      const newColumns = {
        ...columns,
        [sourceId]: {
          ...sourceColumn,
          items: sourceItems,
        },
      };
      setColumns(newColumns);
    }
  };

  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
    setIsDetailsModalOpen(true);
  };

  const handleEditMilestone = () => {
    setIsDetailsModalOpen(false);
    setMilestoneToEdit(selectedMilestone);
    setSelectedMilestone(null);
    setAddMilestoneModalOpen(true);
  };

  const handleDelete = async (milestoneId) => {
    try {
      await api.delete(`/milestones/${milestoneId}`);
      toast.success("Milestone deleted");
      setRenderChange(prev => !prev);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete milestone");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Filter milestones based on search query
    const filteredColumns = {};
    Object.entries(columns).forEach(([key, column]) => {
      filteredColumns[key] = {
        ...column,
        items: column.items.filter(milestone => 
          milestone.title.toLowerCase().includes(query.toLowerCase()) ||
          milestone.description.toLowerCase().includes(query.toLowerCase())
        )
      };
    });
    setColumns(filteredColumns);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  // Add this function to check auth state
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
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
              <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">Home</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/milestones")}>My Milestones</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/profile")}>Profile</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer relative" onClick={() => navigate("/notes")}>
                Notes
                {unreadNotesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotesCount}
                  </span>
                )}
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
          {studentIdFromUrl && (
            <button 
              onClick={handleBack}
              className="text-indigo-600 hover:text-indigo-800 mr-4"
            >
              ← Back to Advisor Dashboard
            </button>
          )}
          <input className="bg-gray-100 rounded px-3 py-2 w-1/3" placeholder="Search..." />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm" onClick={() => setAddMilestoneModalOpen(true)}>Add Milestone</button>
          </div>
        </header>

        <main className="p-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="flex gap-6">
              {Object.entries(columns).map(([columnId, column]) => (
                <div key={columnId} className="flex-1 min-w-[250px] max-w-[350px]">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">{column.name}</h2>
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`bg-gray-50 p-4 rounded-lg min-h-[500px] ${
                          snapshot.isDraggingOver ? 'bg-gray-100' : ''
                        }`}
                      >
                        {column.items.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-4 rounded-lg shadow-sm mb-4 cursor-move ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                                  <div className="flex items-center gap-2">
                                    {item.isMajor && <span className="text-yellow-400">⭐</span>}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMilestoneClick(item);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50"
                                    >
                                      <FaEye size={16} />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                                {item.dueDate && (
                                  <p className="text-sm text-gray-500 mt-2">
                                    Due: {new Date(item.dueDate).toLocaleDateString()}
                                  </p>
                                )}
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-4">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${PROGRESS_BY_STATUS[item.status]?.percent || 0}%`,
                                      backgroundColor: PROGRESS_BY_STATUS[item.status]?.color || '#ccc',
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {isAddMilestoneModalOpen && (
        <AddMilestoneModal
          isOpen={isAddMilestoneModalOpen}
          onClose={() => {
            setAddMilestoneModalOpen(false);
            setMilestoneToEdit(null);
          }}
          studentId={JSON.parse(localStorage.getItem('student') || '{}')._id}
          userId={JSON.parse(localStorage.getItem('user') || '{}')._id}
          refreshMilestones={() => setRenderChange(prev => !prev)}
          milestoneToEdit={milestoneToEdit}
        />
      )}

      <MilestoneDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedMilestone(null);
        }}
        milestone={selectedMilestone}
        onEdit={handleEditMilestone}
      />
    </div>
  );
}

export default StudentDashboard;
