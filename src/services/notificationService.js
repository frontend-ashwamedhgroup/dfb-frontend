import api from "./api";

// Get all notifications for the currently logged-in user
export const getNotifications = async () => {
  const response = await api.get("/api/notifications");
  return response.data;
};

// Get unread notification count
export const getUnreadNotificationCount = async () => {
  const response = await api.get("/api/notifications/unread-count");
  return response.data;
};

// Mark one notification as read
export const markNotificationAsRead = async (notificationId) => {
  await api.patch(`/api/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  await api.patch("/api/notifications/read-all");
};