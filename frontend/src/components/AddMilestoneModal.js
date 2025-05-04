import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

function AddMilestoneModal({ isOpen, onClose, refreshMilestones, milestoneToEdit = null }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'Planned',
    isMajor: false,
  });

  useEffect(() => {
    if (milestoneToEdit) {
      setFormData({
        title: milestoneToEdit.title,
        description: milestoneToEdit.description,
        dueDate: milestoneToEdit.dueDate ? milestoneToEdit.dueDate.split('T')[0] : '',
        status: milestoneToEdit.status,
        isMajor: milestoneToEdit.isMajor || false,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        status: 'Planned',
        isMajor: false,
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

    console.log('Current user data:', currentUser);

    if (!currentUser?._id) {
      toast.error('User not authenticated');
      return;
    }

    // Validate required fields
    if (!formData.dueDate) {
      toast.error('Please select a due date');
      return;
    }

    try {
      const milestoneData = {
        ...formData,
        studentId: currentUser._id,
        userId: currentUser._id
      };

      console.log('Submitting milestone data:', milestoneData);

      if (milestoneToEdit) {
        await api.put(`/api/milestones/${milestoneToEdit._id}`, milestoneData);
        toast.success('Milestone updated successfully!');
      } else {
        const response = await api.post('/api/milestones', milestoneData);
        console.log('Milestone creation response:', response.data);
        toast.success('Milestone created successfully!');
      }

      await refreshMilestones();
      onClose();
    } catch (error) {
      console.error('Error saving milestone:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      toast.error(error.response?.data?.error || 'Failed to save milestone.');
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
              required
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
              <option value="InProgress">In Progress</option>
              <option value="PendingApproval">Pending Approval</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="inline-flex items-center mt-2">
              <input
                type="checkbox"
                name="isMajor"
                checked={formData.isMajor}
                onChange={(e) => setFormData({ ...formData, isMajor: e.target.checked })}
                className="form-checkbox text-indigo-600"
              />
              <span className="ml-2 text-gray-700">Mark as Major Milestone</span>
            </label>
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
