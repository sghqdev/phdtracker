import React, { useState } from 'react';
import axios from 'axios';

function AddMilestoneModal({ isOpen, onClose, studentId, userId, refreshMilestones }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'Not Started'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/milestones', {
        studentId,
        userId,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        status: formData.status
      });
      refreshMilestones();
      onClose();
    } catch (error) {
      console.error('Error creating milestone:', error);
      alert('Failed to create milestone.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Milestone</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full p-2 border rounded-md" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input 
              type="date" 
              name="dueDate" 
              value={formData.dueDate} 
              onChange={handleChange} 
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMilestoneModal;
