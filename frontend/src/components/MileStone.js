// Updated MilestonePage.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import AddMilestoneModal from "./AddMilestoneModal";
import MilestoneDetailsModal from "./MilestoneDetailsModal";

const PROGRESS_BY_STATUS = {
  Planned: { percent: 10, color: "#a78bfa" },
  InProgress: { percent: 50, color: "#6366f1" },
  PendingApproval: { percent: 80, color: "#f59e0b" },
  Completed: { percent: 100, color: "#22c55e" },
};

function MilestonePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  
  console.log('MilestonePage mounted with:', {
    pathname: window.location.pathname,
    currentUser,
    hasId: !!currentUser?._id,
    role: currentUser?.role
  });

  const fetchMilestones = async () => {
    try {
      if (!currentUser?._id) {
        console.log('No current user ID available');
        return;
      }

      const url = `/api/milestones/student/${currentUser._id}`;
      console.log('Fetching milestones from:', url);

      const response = await api.get(url);
      console.log('Milestone response:', response.data);

      if (!response.data) {
        console.log('No data in response');
        return;
      }

      const milestonesData = Array.isArray(response.data) ? response.data : [];
      setMilestones(milestonesData);
    } catch (err) {
      console.error('Milestone fetch error:', err);
      toast.error('Failed to load milestones');
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      fetchMilestones();
    }
  }, [currentUser, isModalOpen]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("student");
    window.location.href = "/";
  };

  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
    setIsDetailsModalOpen(true);
  };

  const handleEditMilestone = () => {
    setIsDetailsModalOpen(false);
    setSelectedMilestone(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6 flex flex-col justify-between">
        <div>
          <div className="text-indigo-600 font-bold text-xl mb-8">PhDTracker</div>
          <div className="space-y-4">
            <div className="text-sm text-gray-700 font-medium">Student Profile</div>
            <ul className="space-y-2 mt-2">
<<<<<<< HEAD
              <li 
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" 
                onClick={() => navigate("/student/dashboard")}
              >
                Dashboard
              </li>
              <li 
                className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md cursor-pointer"
                onClick={() => navigate("/student/milestones")}
              >
                My Milestones
              </li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer">
                Progress
              </li>
=======
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/student-dashboard")}>Home</li>
              <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">My Milestones</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/profile")}>Profile</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/notes")}>Notes</li>
              
              
>>>>>>> origin/rest-branch
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
          <div className="space-y-2">
            <div
              className="text-red-600 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer text-sm font-medium"
              onClick={handleSignOut}
            >
              Sign Out
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm border-b">
          <input className="bg-gray-100 rounded px-3 py-2 w-1/3" placeholder="Search..." />
          <div className="flex items-center gap-4">
            <button className="text-indigo-600">🔔</button>
            <button 
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
              onClick={() => setIsModalOpen(true)}
            >
              Add Milestone
            </button>
            <img src="/avatar.png" alt="User" className="h-8 w-8 rounded-full" />
          </div>
        </header>

        {/* Milestone Section */}
        <main className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Milestones</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {milestones.length === 0 ? (
              <div className="text-center text-gray-500 col-span-2">
                No milestones yet. Start by adding one!
              </div>
            ) : (
              milestones.map((milestone) => (
                <div 
                  key={milestone._id} 
                  className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleMilestoneClick(milestone)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{milestone.title}</h3>
                    {milestone.isMajor && <span title="Major Milestone" className="text-yellow-400">⭐</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
                  {milestone.dueDate && (
                    <p className="text-sm text-gray-500 mt-2">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                  )}
                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden mt-4">
                    <div className="h-full rounded-full" style={{ width: `${PROGRESS_BY_STATUS[milestone.status]?.percent || 0}%`, backgroundColor: PROGRESS_BY_STATUS[milestone.status]?.color || '#ccc' }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <AddMilestoneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchMilestones();
        }}
        refreshMilestones={fetchMilestones}
        milestoneToEdit={selectedMilestone}
      />

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

export default MilestonePage;
