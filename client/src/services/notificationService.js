import api from './api';
import { mockDataStore } from './mockDataStore';
import { authService } from './authService';

export const notificationService = {
  async getMyNotifications() {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch {
      const user = authService.getCurrentUser();
      return mockDataStore.getNotifications(user?.id);
    }
  },

  async markAsRead(id) {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch {
      return mockDataStore.markNotificationRead(id);
    }
  },

  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch {
      return mockDataStore.markAllNotificationsRead();
    }
  }
};

