import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaClipboardCheck } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function AdvisorPendingApprovals() {
  const [pendingMilestones, setPendingMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState({});
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchPendingMilestones();
  }, []);

  const fetchPendingMilestones = async () => {
    try {
      setLoading(true);
      console.log('Making request to /api/advisor/pending-milestones');
      const response = await api.get('/api/advisor/pending-milestones');
      console.log('Pending milestones response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      setPendingMilestones(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching pending milestones:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
        }
      });
      toast.error(error.response?.data?.message || 'Failed to fetch pending milestones');
      setPendingMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (milestoneId, value) => {
    setFeedbacks(prev => ({
      ...prev,
      [milestoneId]: value
    }));
  };

  const handleAction = async (milestoneId, action, student) => {
    try {
      const feedback = feedbacks[milestoneId] || '';
      let status;
      if (action === 'approve') {
        status = 'Completed';
      } else if (action === 'requestChanges') {
        status = 'InProgress';
      }

      console.log('Updating milestone:', {
        milestoneId,
        action,
        status,
        feedback
      });

      await api.put(`/api/milestones/${milestoneId}`, { 
        status,
        feedback,
        lastReviewedAt: new Date()
      });

      toast.success(
        action === 'approve'
          ? 'Milestone approved and marked as completed!'
          : 'Requested changes and sent feedback!'
      );
      
      // Navigate to student profile
      navigate(`/advisor/student/${student}`);
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error(error.response?.data?.error || 'Failed to update milestone');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
            <div className="text-sm text-gray-700 font-medium">Navigation</div>
            <ul className="space-y-2 mt-2">
              <li 
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer"
                onClick={() => navigate("/advisor/dashboard")}
              >
                Dashboard
              </li>
              <li 
                className="text-indigo-700 bg-indigo-100 px-4 py-2 rounded-md cursor-pointer"
                onClick={() => navigate("/advisor/pending-approvals")}
              >
                Pending Approvals
              </li>
              <li 
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer"
                onClick={() => navigate("/advisor/student-progress")}
              >
                Student Progress
              </li>
            </ul>
          </div>
        </div>

        {/* Sign Out button */}
        <div className="space-y-2">
          <div
            className="text-red-600 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer text-sm font-medium"
            onClick={() => {
              logout();
              toast.success("Signed out successfully!");
              navigate("/");
            }}
          >
            Sign Out
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Pending Approvals</h1>
        </header>

        <main className="p-6 overflow-auto">
      {pendingMilestones.length === 0 ? (
            <div className="text-center py-12">
              <FaClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any milestones waiting for your approval at this time.
              </p>
            </div>
      ) : (
        <div className="grid gap-6">
          {pendingMilestones.map((milestone) => (
            <div 
              key={milestone._id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {milestone.title}
                    {milestone.isMajor && (
                      <span className="ml-2 text-yellow-400">⭐</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Student: {milestone.studentName}
                  </p>
                </div>
                <button
                        onClick={() => {
                          navigate(`/advisor/student/${milestone.student}`);
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View Student Profile
                </button>
                    </div>
              </div>

                  <div className="p-4">
              <p className="text-gray-600 mb-4">{milestone.description}</p>
              
              <div className="text-sm text-gray-500 mb-4">
                Due: {new Date(milestone.dueDate).toLocaleDateString()}
              </div>

              <div className="space-y-4">
                <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add feedback..."
                  value={feedbacks[milestone._id] || ''}
                  onChange={e => handleFeedbackChange(milestone._id, e.target.value)}
                />
                      <div className="flex gap-2">
                  <button
                          onClick={() => handleAction(milestone._id, 'requestChanges', milestone.student)}
                          className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Request Changes
                  </button>
                  <button
                          onClick={() => handleAction(milestone._id, 'approve', milestone.student)}
                          className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Approve Milestone
                  </button>
                      </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </main>
      </div>
    </div>
  );
}

export default AdvisorPendingApprovals; 