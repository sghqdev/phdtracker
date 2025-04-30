import React, { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationAsRead } from '../../api/notifications';

const NotificationsList = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const res = await fetchNotifications(userId);
        setNotifications(res.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    getNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notifId) => {
    try {
      await markNotificationAsRead(notifId, userId);
      setNotifications((prev) =>
        prev.map((notif) => notif._id === notifId ? { ...notif, status: { ...notif.status, [userId]: 'read' } } : notif)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.map((notif) => (
        <div key={notif._id} style={{ marginBottom: '10px', backgroundColor: notif.status[userId] === 'unread' ? '#eee' : '#fff' }}>
          <p>{notif.message}</p>
          <button onClick={() => handleMarkAsRead(notif._id)}>Mark as Read</button>
        </div>
      ))}
    </div>
  );
};

export default NotificationsList;
