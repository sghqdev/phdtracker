import axios from 'axios';

export const fetchNotifications = (userId) => {
  return axios.get(`/api/notifications/${userId}`);
};

export const markNotificationAsRead = (notifId, userId) => {
  return axios.put(`/api/notifications/mark-read/${notifId}`, { userId });
};
