import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

function AdvisorPendingApprovals() {
  const [pendingMilestones, setPendingMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingMilestones();
  }, []);

  const fetchPendingMilestones = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending milestones...');
      const response = await api.get('/api/advisor/pending-milestones');
      console.log('Pending milestones response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      setPendingMilestones(response.data);
    } catch (error) {
      console.error('Error fetching pending milestones:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      setError(error.response?.data?.message || 'Failed to load pending approvals');
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (milestoneId) => {
    try {
      await api.post(`/api/advisor/milestone/${milestoneId}/verify`);
      toast.success('Milestone verified successfully');
      fetchPendingMilestones(); // Refresh the list
    } catch (error) {
      toast.error('Failed to verify milestone');
    }
  };

  const handleProvideFeedback = async (milestoneId, feedback) => {
    try {
      await api.post(`/api/advisor/milestone/${milestoneId}/feedback`, { feedback });
      toast.success('Feedback submitted successfully');
      fetchPendingMilestones(); // Refresh the list
    } catch (error) {
      toast.error('Failed to submit feedback');
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>
      
      {pendingMilestones.length === 0 ? (
        <div className="text-gray-600">No milestones pending approval</div>
      ) : (
        <div className="grid gap-6">
          {pendingMilestones.map((milestone) => (
            <div 
              key={milestone._id} 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
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
                  onClick={() => navigate(`/advisor/student/${milestone.studentId}`)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View Student Profile
                </button>
              </div>

              <p className="text-gray-600 mb-4">{milestone.description}</p>
              
              <div className="text-sm text-gray-500 mb-4">
                Due: {new Date(milestone.dueDate).toLocaleDateString()}
              </div>

              <div className="space-y-4">
                <textarea
                  className="w-full p-3 border rounded-md"
                  placeholder="Add feedback..."
                  onChange={(e) => handleProvideFeedback(milestone._id, e.target.value)}
                />
                
                <button
                  onClick={() => handleVerify(milestone._id)}
                  className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Verify Milestone
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdvisorPendingApprovals; 