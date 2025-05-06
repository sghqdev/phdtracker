// Updated StudentDashboard.js with Progress Bars on Cards

import React, { useEffect, useState, useRef, useCallback } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import AddMilestoneModal from "./AddMilestoneModal";
import MilestoneDetailsModal from "./MilestoneDetailsModal";
import { FaPen, FaTrash } from "react-icons/fa";
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
  const { currentUser, logout } = useAuth();
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

  // Add a key for DragDropContext
  const [contextKey, setContextKey] = useState(0);

  // Remove unused state and refs
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);
  const [isAddMilestoneModalOpen, setAddMilestoneModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [milestoneToEdit, setMilestoneToEdit] = useState(null);
  const [unreadNotesCount, setUnreadNotesCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataReady, setIsDataReady] = useState(false);
  const [originalColumns, setOriginalColumns] = useState(null);

  // Extract studentId from URL if viewing from advisor context
  const studentIdFromUrl = location.pathname.split('/advisor/student/')[1];
  
  // Use the appropriate ID for fetching milestones
  const targetStudentId = studentIdFromUrl || currentUser?._id;

  // Memoize the fetchMilestones function to prevent unnecessary recreations
  const fetchMilestones = useCallback(async () => {
    if (!targetStudentId) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/api/milestones/student/${targetStudentId}`);
      
      // Initialize empty columns
      const newColumns = {
        Planned: { id: 'Planned', name: 'Planned', items: [] },
        InProgress: { id: 'InProgress', name: 'In Progress', items: [] },
        PendingApproval: { id: 'PendingApproval', name: 'Pending Approval', items: [] },
        Completed: { id: 'Completed', name: 'Completed', items: [] }
      };

      // Only process data if it exists and is an array
      if (Array.isArray(response.data)) {
        console.log('Processing milestones:', response.data);
        response.data.forEach(milestone => {
          const normalizedStatus = normalizeStatus(milestone.status);
          if (newColumns[normalizedStatus]) {
            // Ensure we have a stable string ID
            const milestoneId = String(milestone._id);
            const milestoneItem = {
              id: milestoneId, // Use the same ID for both id and _id
              _id: milestoneId,
              title: milestone.title,
              content: milestone.title,
              description: milestone.description,
              dueDate: milestone.dueDate,
              status: normalizedStatus,
              isMajor: milestone.isMajor
            };
            newColumns[normalizedStatus].items.push(milestoneItem);
          }
        });
      }

      console.log('Setting new columns:', newColumns);
      setColumns(newColumns);
      setOriginalColumns(newColumns);
      setIsDataReady(true);
      // Force a remount of DragDropContext
      setContextKey(prev => prev + 1);
    } catch (error) {
      console.error('Milestone fetch error:', error);
      setColumns({
        Planned: { id: 'Planned', name: 'Planned', items: [] },
        InProgress: { id: 'InProgress', name: 'In Progress', items: [] },
        PendingApproval: { id: 'PendingApproval', name: 'Pending Approval', items: [] },
        Completed: { id: 'Completed', name: 'Completed', items: [] }
      });
      
      if (error.response?.status === 401) {
        navigate('/auth');
      } else if (error.response?.status !== 500) {
        toast.error('Failed to load milestones');
      }
    } finally {
      setIsLoading(false);
    }
  }, [targetStudentId, navigate]);

  // Memoize the fetchStudentData function
  const fetchStudentData = useCallback(async () => {
    try {
      const response = await api.get(`/api/user/${targetStudentId}`);
      setUnreadNotesCount(response.data.unreadNotesCount || 0);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load student data');
    }
  }, [targetStudentId]);

  // Initial data fetch - only runs once on mount
  useEffect(() => {
    if (!targetStudentId) return;
    
    // Only fetch if not already mounted
    if (!isMounted.current) {
      isMounted.current = true;
      fetchMilestones();
      fetchStudentData();
    }

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [targetStudentId, fetchMilestones, fetchStudentData]);

  // Memoize the onDragEnd function to prevent unnecessary recreations
  const onDragEnd = useCallback(async (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;

    // Don't do anything if dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find the source and destination columns
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    if (!sourceColumn || !destColumn) {
      return;
    }

    // Create new arrays for source and destination
    const sourceItems = Array.from(sourceColumn.items);
    const destItems = source.droppableId === destination.droppableId
      ? sourceItems
      : Array.from(destColumn.items);

    // Remove from source
    const [removed] = sourceItems.splice(source.index, 1);
    if (!removed) {
      return;
    }

    // Add to destination
    destItems.splice(destination.index, 0, removed);

    // Update the columns state
    const newColumns = {
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems
      }
    };

    if (source.droppableId !== destination.droppableId) {
      newColumns[destination.droppableId] = {
        ...destColumn,
        items: destItems
      };
    }

    // Update the milestone status in the backend
    try {
      const newStatus = destination.droppableId;
      await api.patch(`/api/milestones/${draggableId}`, {
        status: newStatus
      });

      // Update the local state
      setColumns(newColumns);
      toast.success('Milestone status updated');
    } catch (error) {
      console.error('Failed to update milestone status:', error);
      toast.error('Failed to update milestone status');
      // Revert the columns state
      setColumns(columns);
    }
  }, [columns]);

  // Memoize the onDragStart function
  const onDragStart = useCallback((start) => {
    console.log('Drag started:', start);
  }, []);

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
      await api.delete(`/api/milestones/${milestoneId}`);
      toast.success("Milestone deleted");
      fetchMilestones(); // Refresh the milestones after deletion
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete milestone");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!originalColumns) return; // Guard against no original data

    if (!query.trim()) {
      // If search is empty, restore original data
      setColumns(originalColumns);
      return;
    }

    // Filter milestones based on search query
    const filteredColumns = {};
    Object.entries(originalColumns).forEach(([key, column]) => {
      filteredColumns[key] = {
        ...column,
        items: column.items.filter(milestone => 
          milestone.title.toLowerCase().includes(query.toLowerCase()) ||
          (milestone.description && milestone.description.toLowerCase().includes(query.toLowerCase()))
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
    logout();
    toast.success("Signed out successfully!");
    navigate("/");
  };

  if (isLoading) {
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
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6 flex flex-col justify-between">
        <div>
          <div className="text-indigo-600 font-bold text-xl mb-8">PhDTracker</div>
          <div className="space-y-4">
            <div className="text-sm text-gray-700 font-medium">Student Dashboard</div>
            <ul className="space-y-2 mt-2">
              <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">
                Home
              </li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer">
                <Link
                  to="/student/milestones"
                  className="text-gray-700 w-full h-full block"
                  style={{ display: 'block', width: '100%', height: '100%' }}
                >
                  My Milestones
                </Link>
              </li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer">
                <Link
                  to="/student/notes"
                  className="text-gray-700 w-full h-full block"
                  style={{ display: 'block', width: '100%', height: '100%' }}
                >
                  Notes
                </Link>
              </li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer">
                <Link
                  to="/profile"
                  className="text-gray-700 w-full h-full block"
                  style={{ display: 'block', width: '100%', height: '100%' }}
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sign Out button */}
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
          {studentIdFromUrl && (
            <button 
              onClick={handleBack}
              className="text-indigo-600 hover:text-indigo-800 mr-4"
            >
              ← Back to Advisor Dashboard
            </button>
          )}
          <input 
            className="bg-gray-100 rounded px-3 py-2 w-1/3" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button 
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm" 
              onClick={() => setAddMilestoneModalOpen(true)}
            >
              Add Milestone
            </button>
          </div>
        </header>

        {/* Milestone Section */}
        <main className="p-6 overflow-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            {studentIdFromUrl ? "Student Milestones" : "My Milestones"}
          </h1>

          {/* Only render DragDropContext when we have data */}
          {!isLoading && (
            <DragDropContext key={contextKey} onDragStart={onDragStart} onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(columns).map(([columnId, column]) => {
                  console.log(`Rendering column ${columnId} with items:`, column.items.map(i => i.id));
                  return (
                    <div key={columnId} className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        {column.name}
                      </h2>
                      <Droppable droppableId={columnId}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[200px] ${
                              snapshot.isDraggingOver ? "bg-gray-100" : ""
                            }`}
                          >
                            {column.items.map((item, index) => {
                              const itemId = String(item.id);
                              console.log(`Rendering draggable ${itemId} at index ${index}`);
                              return (
                                <Draggable
                                  key={itemId}
                                  draggableId={itemId}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...provided.draggableProps.style
                                      }}
                                      className={`bg-white p-4 rounded-lg shadow-sm mb-4 cursor-pointer hover:shadow-md transition-shadow duration-200 ${
                                        snapshot.isDragging ? "shadow-lg" : ""
                                      }`}
                                      onClick={() => handleMilestoneClick(item)}
                                    >
                                      <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                          {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                          {item.isMajor && (
                                            <span
                                              title="Major Milestone"
                                              className="text-yellow-400"
                                            >
                                              ⭐
                                            </span>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setMilestoneToEdit(item);
                                              setAddMilestoneModalOpen(true);
                                            }}
                                            className="text-gray-600 hover:text-indigo-600"
                                            title="Edit Milestone"
                                          >
                                            <FaPen size={16} />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (window.confirm('Are you sure you want to delete this milestone?')) {
                                                handleDelete(item._id);
                                              }
                                            }}
                                            className="text-gray-600 hover:text-red-600"
                                            title="Delete Milestone"
                                          >
                                            <FaTrash size={16} />
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-2">
                                        {item.description}
                                      </p>
                                      {item.dueDate && (
                                        <p className="text-sm text-gray-500 mt-2">
                                          Due: {new Date(item.dueDate).toLocaleDateString()}
                                        </p>
                                      )}
                                      {/* Progress Bar */}
                                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden mt-4">
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${
                                              PROGRESS_BY_STATUS[item.status]?.percent || 0
                                            }%`,
                                            backgroundColor:
                                              PROGRESS_BY_STATUS[item.status]?.color ||
                                              "#ccc",
                                          }}
                                        ></div>
                                      </div>
                                      {/* Feedback Section */}
                                      {item.feedback && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-medium text-gray-700">Advisor Feedback:</span>
                                            {item.feedbackDate && (
                                              <span className="text-xs text-gray-500">
                                                {new Date(item.feedbackDate).toLocaleDateString()}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-600">{item.feedback}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}

          {/* Show loading state */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
            fetchMilestones();
          }}
          studentId={targetStudentId}
          userId={currentUser?._id}
          refreshMilestones={fetchMilestones}
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
