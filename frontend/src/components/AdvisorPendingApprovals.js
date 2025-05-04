import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

function AdvisorPendingApprovals() {
  const [pendingMilestones, setPendingMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingMilestones();
  }, []);

  const fetchPendingMilestones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/advisor/pending-milestones');
      setPendingMilestones(response.data);
    } catch (error) {
      console.error('Error fetching pending milestones:', error);
      setError(error.response?.data?.message || 'Failed to load pending approvals');
      toast.error('Failed to load pending approvals');
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

  const handleAction = async (milestoneId, action, studentId) => {
    try {
      const feedback = feedbacks[milestoneId] || '';
      let status;
      if (action === 'approve') {
        status = 'Completed';
      } else if (action === 'requestChanges') {
        status = 'InProgress';
      }

      await api.put(`/api/milestones/${milestoneId}`, { status, feedback });
      toast.success(
        action === 'approve'
          ? 'Milestone approved and marked as completed!'
          : 'Requested changes and sent feedback!'
      );
      
      // Ensure studentId is a string and navigate
      const studentIdStr = typeof studentId === 'object' ? studentId._id : studentId;
      navigate(`/advisor/student/${studentIdStr}`);
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6">
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Pending Approvals</h1>
        </header>

        <main className="p-6 overflow-auto">
          {pendingMilestones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No milestones pending approval</p>
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
                          const studentIdStr = typeof milestone.studentId === 'object' 
                            ? milestone.studentId._id 
                            : milestone.studentId;
                          navigate(`/advisor/student/${studentIdStr}`);
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
                          onClick={() => handleAction(milestone._id, 'requestChanges', milestone.studentId)}
                          className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                        >
                          Request Changes
                        </button>
                        <button
                          onClick={() => handleAction(milestone._id, 'approve', milestone.studentId)}
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