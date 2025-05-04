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
    reminderDate: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (milestoneToEdit) {
      setFormData({
        title: milestoneToEdit.title,
        description: milestoneToEdit.description,
        dueDate: milestoneToEdit.dueDate ? milestoneToEdit.dueDate.split('T')[0] : '',
        status: milestoneToEdit.status,
        isMajor: milestoneToEdit.isMajor || false,
        reminderDate: milestoneToEdit.reminderDate ? milestoneToEdit.reminderDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        status: 'Planned',
        isMajor: false,
        reminderDate: '',
      });
    }
    setErrors({});
  }, [milestoneToEdit]);

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.reminderDate && formData.dueDate) {
      const reminderDate = new Date(formData.reminderDate);
      const dueDate = new Date(formData.dueDate);
      
      if (reminderDate > dueDate) {
        newErrors.reminderDate = "Reminder date cannot be later than the due date";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
<<<<<<< HEAD
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
=======
      // Set time to 11:59 PM UTC for the selected date
      let dueDateUTC = null;
      if (formData.dueDate) {
        const [year, month, day] = formData.dueDate.split('-');
        const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 0));
        dueDateUTC = date.toISOString();
      }

      const milestoneData = {
        ...formData,
        studentId,
        userId,
        dueDate: dueDateUTC,
      };

      if (milestoneToEdit) {
        // UPDATE existing milestone
        await axios.put(`http://localhost:9000/api/milestones/${milestoneToEdit._id}`, milestoneData);
        toast.success('Milestone updated successfully!');
      } else {
        // CREATE new milestone
        await axios.post('http://localhost:9000/api/milestones', milestoneData);
>>>>>>> origin/rest-branch
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

  if (!isOpen) return null;

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
            <label className="block text-sm font-medium text-gray-700">Reminder Date</label>
            <input
              type="date"
              name="reminderDate"
              value={formData.reminderDate}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.reminderDate ? 'border-red-500' : ''}`}
              max={formData.dueDate}
            />
            {errors.reminderDate && (
              <p className="text-red-500 text-sm mt-1">{errors.reminderDate}</p>
            )}
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
