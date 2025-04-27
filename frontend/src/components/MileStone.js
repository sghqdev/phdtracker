import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MilestonePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [milestones, setMilestones] = useState([]);
  const [isRenderChange] = useState(false);

  // Fetch the logged-in user's data
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.id) {
      axios.get(`http://localhost:9000/user/${storedUser.id}`)
        .then(res => setUser(res.data))
        .catch(err => console.error("Failed to fetch user", err));
    }
  }, []);

  useEffect(() => {
    const storedStudent = JSON.parse(localStorage.getItem('student') || '{}');
    if (storedStudent.id) {
      axios.get(`http://localhost:9000/api/milestones/student/${storedStudent.id}`)
        .then(res => setMilestones(res.data))
        .catch(err => console.error("Failed to fetch milestones", err));
    }
  }, [isRenderChange]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6 flex flex-col justify-between">
        <div>
          <div className="text-indigo-600 font-bold text-xl mb-8">PhDTracker</div>
          <div className="space-y-4">
            <div className="text-sm text-gray-700 font-medium">Student Profile</div>
            <ul className="space-y-2 mt-2">
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate("/student-dashboard")}>Home</li>
              <li className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md">My Milestones</li>
              <li className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer">Progress</li>
            </ul>
          </div>
        </div>

        {/* Profile Bottom Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 px-2">
            <div className="text-sm">
              <p className="font-medium">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="px-2 mt-2 space-y-1 text-sm">
            <div className="hover:text-indigo-600 cursor-pointer">Settings</div>
            <div className="hover:text-indigo-600 cursor-pointer">Sign Out</div>
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
              onClick={() => navigate("/student-dashboard")} 
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
                <div key={milestone._id} className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">{milestone.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
                  {milestone.dueDate && (
                    <p className="text-sm text-gray-500 mt-2">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                  )}
                  <div className="mt-4">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">View Details</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MilestonePage;
