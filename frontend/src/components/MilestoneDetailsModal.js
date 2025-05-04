import React from 'react';
import { FaEdit } from 'react-icons/fa';

function MilestoneDetailsModal({ isOpen, onClose, milestone, onEdit }) {
  if (!isOpen || !milestone) return null;

  const getStatusColor = (status) => {
    const colors = {
      Planned: 'bg-purple-100 text-purple-800',
      InProgress: 'bg-indigo-100 text-indigo-800',
      PendingApproval: 'bg-yellow-100 text-yellow-800',
      Completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{milestone.title}</h2>
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50"
            title="Edit Milestone"
          >
            <FaEdit size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-gray-700">{milestone.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                {milestone.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
              <p className="mt-1 text-gray-700">
                {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>

          {milestone.isMajor && (
            <div className="flex items-center text-yellow-600">
              <span className="mr-2">⭐</span>
              <span className="text-sm font-medium">Major Milestone</span>
            </div>
          )}

          {milestone.feedback && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Feedback</h3>
              <p className="mt-1 text-gray-700">{milestone.feedback}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MilestoneDetailsModal; 