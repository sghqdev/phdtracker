import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../api/axios';
import toast from "react-hot-toast";
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const FIXED_COLUMNS = {
  Planned: "Planned",
  InProgress: "In Progress",
  PendingApproval: "Pending Approval",
  Completed: "Completed"
};

const PROGRESS_BY_STATUS = {
  Planned: { percent: 10, color: "#a78bfa" },
  InProgress: { percent: 50, color: "#6366f1" },
  PendingApproval: { percent: 80, color: "#f59e0b" },
  Completed: { percent: 100, color: "#22c55e" }
};

function StudentProgress() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState([]);
  const [error, setError] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  console.log('StudentProgress Initial Mount:', {
    studentId,
    fullUrl: window.location.href,
    pathname: window.location.pathname,
    allParams: useParams(),
    rawStudentId: '68102dc3da15e6876683b296' // The ID we see in the URL
  });

  useEffect(() => {
    if (!studentId) {
      console.error('No studentId available');
      return;
    }

    fetchStudentAndMilestones();
  }, [studentId]);

  const fetchStudentAndMilestones = async () => {
    try {
      setLoading(true);
      console.log('Debug - Starting fetch:', { studentId });
      
      const studentResponse = await api.get(`/api/advisor/student/${studentId}`);
      console.log('Debug - Student API response:', {
        status: studentResponse.status,
        data: studentResponse.data
      });
      setStudent(studentResponse.data);

      console.log('Debug - About to fetch milestones for student:', studentId);
      const milestonesResponse = await api.get(`/api/milestones/student/${studentId}`);
      console.log('Debug - Raw milestones response:', milestonesResponse);
      
      const milestoneData = milestonesResponse.data;
      console.log('Debug - Parsed milestone data:', {
        isArray: Array.isArray(milestoneData),
        length: milestoneData?.length,
        data: milestoneData
      });

      if (!Array.isArray(milestoneData)) {
        console.error('Error: Milestone data is not an array:', milestoneData);
        return;
      }

      console.log('6. Individual milestone statuses:');
      milestoneData.forEach(milestone => {
        console.log(`- Milestone "${milestone.title}": status="${milestone.status}"`);
      });

      const newColumns = {};
      Object.entries(FIXED_COLUMNS).forEach(([key, name]) => {
        const filteredItems = milestoneData.filter(m => m.status === key);
        console.log(`7. Column "${name}" (key="${key}"): ${filteredItems.length} items`);
        newColumns[key] = {
          name,
          items: filteredItems,
        };
      });

      console.log('8. Final columns structure:', newColumns);
      setColumns(newColumns);
      setMilestones(milestoneData);
      setError(null);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        endpoint: `/api/milestones/student/${studentId}`
      });
      toast.error(error.response?.data?.message || "Failed to load student progress");
      setError('Failed to load student progress');
    } finally {
      setLoading(false);
    }
  };

  const provideFeedback = async (milestoneId, feedback) => {
    try {
      await api.post(`/api/advisor/milestone/${milestoneId}/feedback`, { feedback });
      toast.success("Feedback submitted successfully");
      fetchStudentAndMilestones();
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };

  const verifyMilestone = async (milestoneId) => {
    try {
      await api.post(`/api/advisor/milestone/${milestoneId}/verify`);
      toast.success("Milestone verified successfully");
      fetchStudentAndMilestones();
    } catch (error) {
      toast.error("Failed to verify milestone");
    }
  };

  const handleAction = async (milestoneId, action) => {
    try {
      let status;
      if (action === 'approve') {
        status = 'Completed';
      } else if (action === 'requestChanges') {
        status = 'InProgress';
      }

      await api.put(`/api/milestones/${milestoneId}`, { status });
      toast.success(
        action === 'approve'
          ? 'Milestone approved and marked as completed!'
          : 'Requested changes and sent feedback!'
      );
      fetchStudentAndMilestones();
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.location.replace('/');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!milestones.length) {
    return <div>No milestones found</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-64 bg-gray-50 border-r border-gray-200 px-4 py-6 flex flex-col justify-between">
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
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer"
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

          {student && (
            <div className="mt-8 border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {student.first_name} {student.last_name}
              </h2>
              <p className="text-sm text-gray-600">{student.email}</p>
            </div>
          )}
        </div>

        {/* Sign Out button at the bottom */}
        <div className="mt-auto">
          <div
            className="text-red-600 hover:bg-gray-100 px-4 py-2 rounded-md cursor-pointer text-sm font-medium"
            onClick={handleSignOut}
          >
            Sign Out
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Student Progress</h1>
        </header>

        <main className="p-6 overflow-auto">
          <div className="flex gap-6 overflow-x-auto">
            {Object.entries(columns).map(([columnId, column]) => (
              <div key={columnId} className="w-80 flex-shrink-0">
                <div className="mb-2 font-semibold text-sm uppercase text-gray-600 flex justify-between">
                  {column.name}
                  <span className="text-xs text-gray-400">{column.items.length}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg min-h-[500px]">
                  {column.items.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-sm p-4 mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {item.title}
                          {item.isMajor && <span className="ml-2 text-yellow-400">⭐</span>}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMilestone(item);
                            setIsDetailsModalOpen(true);
                          }}
                          className="text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <FaEye />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="text-xs text-gray-500 mb-2">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                      
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${PROGRESS_BY_STATUS[item.status]?.percent || 0}%`,
                            backgroundColor: PROGRESS_BY_STATUS[item.status]?.color || '#ccc'
                          }}
                        />
                      </div>

                      {item.status === 'PendingApproval' && (
                        <div className="mt-4 space-y-2">
                          <textarea
                            placeholder="Add feedback (optional)..."
                            className="w-full p-2 border rounded-md text-sm"
                            onBlur={(e) => provideFeedback(item._id, e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(item._id, 'approve')}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              onClick={() => handleAction(item._id, 'requestChanges')}
                              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 flex items-center justify-center gap-2"
                            >
                              <FaTimes /> Request Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Milestone Details Modal */}
      {isDetailsModalOpen && selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedMilestone.title}
                  {selectedMilestone.isMajor && <span className="ml-2 text-yellow-400">⭐</span>}
                </h2>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-gray-800">{selectedMilestone.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                  <p className="mt-1 text-gray-800">
                    {new Date(selectedMilestone.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1 text-gray-800">{selectedMilestone.status}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Feedback</h3>
                  <p className="mt-1 text-gray-800">
                    {selectedMilestone.feedback ? (
                      <>
                        {selectedMilestone.feedback}
                        {selectedMilestone.lastReviewedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Provided on {new Date(selectedMilestone.lastReviewedAt).toLocaleString()}
                          </p>
                        )}
                      </>
                    ) : (
                      "No feedback available yet"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProgress; 