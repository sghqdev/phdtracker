// AddMilestoneModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AddMilestoneModal({ isOpen, onClose, studentId, userId, refreshMilestones, milestoneToEdit = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'Planned',
  });

  useEffect(() => {
    if (milestoneToEdit) {
      setFormData({
        title: milestoneToEdit.title || '',
        description: milestoneToEdit.description || '',
        dueDate: milestoneToEdit.dueDate ? new Date(milestoneToEdit.dueDate).toISOString().split('T')[0] : '',
        status: milestoneToEdit.status || 'Planned',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        status: 'Planned',
      });
    }
  }, [milestoneToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentId || !userId) {
      toast.error('Missing required IDs. Cannot save milestone.');
      console.error('Missing studentId or userId', { studentId, userId });
      return;
    }

    try {
      if (milestoneToEdit) {
        // Update existing milestone
        await axios.put(`http://localhost:9000/api/milestones/${milestoneToEdit._id}`, {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          status: formData.status
        });
        toast.success('Milestone updated successfully!');
      } else {
        // Create new milestone
        await axios.post('http://localhost:9000/api/milestones', {
          studentId,
          userId,
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          status: formData.status
        });
        toast.success('Milestone created successfully!');
      }

      refreshMilestones();
      onClose();
    } catch (error) {
      console.error('Error saving milestone:', error.response?.data || error.message);
      toast.error('Failed to save milestone.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {milestoneToEdit ? 'Edit Milestone' : 'Add New Milestone'}
        </h2>
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
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Approval">Pending Approval</option>
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
              {milestoneToEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMilestoneModal;
