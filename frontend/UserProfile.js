import React, { useState, useEffect } from "react";
import axios from "axios";

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });

  useEffect(() => {
    axios.get(`/api/users/${userId}`).then((response) => {
      setUser(response.data);
      setFormData(response.data);
    });
  }, [userId]);

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`/api/users/update/${userId}`, formData);
      setUser(response.data);
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return user ? (
    <div>
      <h2>User Profile</h2>
      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
      <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
        <option value="Admin">Admin</option>
        <option value="Student">Student</option>
        <option value="Advisor">Advisor</option>
      </select>
      <button onClick={handleUpdate}>Update Profile</button>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default UserProfile;
